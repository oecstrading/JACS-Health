/**
 * simulatorDataFactory.ts — Device Simulation Suite
 *
 * Generates medically realistic data packets for three device types:
 *   1. Dexcom G6/G7 CGM — 5-minute glucose readings with physiological engine
 *   2. Omnipod DASH — Insulin pump state machine with reservoir and bolus tracking
 *   3. Omron HEM-7361T — Blood pressure BLE GATT emulator (twice-daily push)
 *
 * All data flows into the app's analytics engine identically to real hardware.
 * Physiological model based on gamma distribution curves (NIH / MDPI validated):
 *   - Carb impact: peak at ~60 min, gamma(α=1, β=60)
 *   - Insulin impact: peak at ~120 min, gamma(α=2, β=60)
 *
 * Architecture: Both virtual and physical device paths are maintained so users
 * who cannot afford physical hardware can still use the full feature set.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Storage Keys ────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  SIMULATOR_ENABLED: "@simulator_mode_enabled",
  CGM_HISTORY: "@simulator_cgm_history",
  OMNIPOD_STATE: "@simulator_omnipod_state",
  OMRON_HISTORY: "@simulator_omron_history",
  LAST_MEAL: "@simulator_last_meal",
  LAST_INSULIN: "@simulator_last_insulin",
};

// ─── Type Definitions ────────────────────────────────────────────────────────

/** Dexcom G6/G7 SGV (Sensor Glucose Value) packet — mirrors Dexcom V2 API + Nightscout format */
export interface DexcomCGMPacket {
  systemTime: string;          // UTC ISO timestamp
  displayTime: string;         // Local ISO timestamp
  estimatedGlucoseValue: number; // mg/dL (39–400 hard limits)
  unit: "mg/dL" | "mmol/L";
  trend: CGMTrend;
  trendRate: number;           // mg/dL/min (positive = rising)
  transmitterId: string;
  status: "ok" | "calibrating" | "error";
  deviceInfo: {
    model: "Dexcom G6" | "Dexcom G7";
    lastCalibration: string;
  };
}

export type CGMTrend =
  | "rapidlyRising"    // > 3 mg/dL/min
  | "rising"           // 2–3 mg/dL/min
  | "slowlyRising"     // 1–2 mg/dL/min
  | "flat"             // -1 to 1 mg/dL/min
  | "slowlyFalling"    // -2 to -1 mg/dL/min
  | "falling"          // -3 to -2 mg/dL/min
  | "rapidlyFalling";  // < -3 mg/dL/min

/** Omnipod DASH state packet — based on AndroidAPS / LoopDocs spec */
export interface OmnipodStatePacket {
  podStatus: {
    state: "active" | "suspended" | "deactivating" | "fault";
    reservoirUnits: number;      // Units remaining (0–200)
    totalDelivered: number;      // Cumulative units delivered
    activeBasalRate: number;     // Units/hour
    lastBolus: {
      amount: number;            // Units
      timestamp: string;
      type: "standard" | "extended" | "correction";
    } | null;
    alerts: OmnipodAlert[];
    tempBasal: {
      isRunning: boolean;
      rate: number;              // Units/hour
      remainingMinutes: number;
    };
    autoOffTimer: {
      enabled: boolean;
      remainingMinutes: number;  // Auto-off after 80 hours of inactivity
    };
  };
  sequenceNumber: number;
  bleConnected: boolean;
  podActivatedAt: string;
}

export type OmnipodAlert =
  | "low_reservoir"    // < 10 units
  | "pod_expiry"       // < 4 hours remaining
  | "auto_off_warning" // < 30 min to auto-off
  | "occlusion";       // Delivery blocked

/** Omron HEM-7361T BLE GATT blood pressure packet */
export interface OmronBPPacket {
  reading: {
    systolic: number;    // mmHg
    diastolic: number;   // mmHg
    pulse: number;       // bpm
    timestamp: string;
    userProfile: 1 | 2;
    unit: "mmHg";
  };
  device: {
    model: "Omron HEM-7361T";
    batteryLevel: number; // 0–100%
  };
  classification: BPClassification;
}

export type BPClassification =
  | "normal"           // < 120/80
  | "elevated"         // 120-129/<80
  | "stage1"           // 130-139/80-89
  | "stage2"           // ≥140/≥90
  | "crisis";          // ≥180/≥120

// ─── Physiological Glucose Engine ────────────────────────────────────────────

/**
 * Gamma distribution approximation for carbohydrate absorption.
 * Peak at t=60 min. Models simple + complex carb dual-peak absorption.
 */
function carbAbsorptionCurve(t: number, carbsG: number): number {
  // Simple carbs: fast peak at 30 min
  const simplePeak = (carbsG * 0.4) * 2.5 * (t / 30) * Math.exp(-t / 30);
  // Complex carbs: slow peak at 90 min
  const complexPeak = (carbsG * 0.6) * 1.8 * (t / 90) * Math.exp(-t / 90);
  return simplePeak + complexPeak;
}

/**
 * Exponential decay curve for insulin action.
 * Peak action at ~120 min (rapid-acting analogs like NovoLog/Humalog).
 * Duration of action: ~4 hours.
 */
function insulinActionCurve(t: number, insulinU: number): number {
  // Gamma(α=2, β=60): peaks at t=120 min
  const peak = insulinU * 45.0 * Math.pow(t / 120, 2) * Math.exp(-t / 60);
  return peak;
}

/**
 * Gaussian noise for physiological variability (±2 mg/dL SD).
 * Uses Box-Muller transform for normal distribution.
 */
function gaussianNoise(sigma = 2): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Generate a 4-hour simulated glucose curve (5-minute intervals = 48 readings).
 * Based on the NIH/MDPI validated multi-compartment model.
 *
 * @param startBG - Starting blood glucose in mg/dL
 * @param carbsG  - Carbohydrates consumed in grams
 * @param insulinU - Rapid-acting insulin units administered
 * @param durationMin - Simulation window in minutes (default: 240 = 4 hours)
 */
export function generateGlucoseCurve(
  startBG: number,
  carbsG: number,
  insulinU: number,
  durationMin = 240
): number[] {
  const readings: number[] = [];
  for (let t = 0; t <= durationMin; t += 5) {
    const carbImpact = carbAbsorptionCurve(t, carbsG);
    const insulinImpact = insulinActionCurve(t, insulinU);
    const noise = gaussianNoise(2);
    const bg = startBG + carbImpact - insulinImpact + noise;
    // Hard safety limits per FDA CGM specifications
    readings.push(Math.max(39, Math.min(400, Math.round(bg))));
  }
  return readings;
}

/**
 * Compute CGM trend from consecutive readings.
 */
function computeTrend(current: number, previous: number, intervalMin = 5): { trend: CGMTrend; trendRate: number } {
  const rate = (current - previous) / intervalMin; // mg/dL/min
  let trend: CGMTrend;
  if (rate > 3) trend = "rapidlyRising";
  else if (rate > 2) trend = "rising";
  else if (rate > 1) trend = "slowlyRising";
  else if (rate > -1) trend = "flat";
  else if (rate > -2) trend = "slowlyFalling";
  else if (rate > -3) trend = "falling";
  else trend = "rapidlyFalling";
  return { trend, trendRate: Math.round(rate * 10) / 10 };
}

// ─── Dexcom CGM Simulator ────────────────────────────────────────────────────

export class DexcomCGMSimulator {
  private transmitterId: string;
  private model: "Dexcom G6" | "Dexcom G7";
  private lastCalibration: string;
  private glucoseCurve: number[] = [];
  private curveIndex = 0;

  constructor(model: "Dexcom G6" | "Dexcom G7" = "Dexcom G7") {
    this.model = model;
    this.transmitterId = this.generateTransmitterId();
    this.lastCalibration = new Date(Date.now() - 6 * 3600 * 1000).toISOString();
    // Initialize with a resting glucose curve (no meals, no insulin)
    this.glucoseCurve = generateGlucoseCurve(110, 0, 0, 480); // 8-hour baseline
  }

  private generateTransmitterId(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  /**
   * Generate a new CGM packet based on a meal + insulin event.
   * Call this every 5 minutes to simulate continuous monitoring.
   */
  generatePacket(carbsG = 0, insulinU = 0, startBG?: number): DexcomCGMPacket {
    // Regenerate curve if new meal/insulin event
    if (carbsG > 0 || insulinU > 0) {
      const bg = startBG ?? (this.glucoseCurve[this.curveIndex] ?? 110);
      this.glucoseCurve = generateGlucoseCurve(bg, carbsG, insulinU);
      this.curveIndex = 0;
    }

    const current = this.glucoseCurve[this.curveIndex] ?? 110;
    const previous = this.glucoseCurve[Math.max(0, this.curveIndex - 1)] ?? current;
    const { trend, trendRate } = computeTrend(current, previous);

    this.curveIndex = Math.min(this.curveIndex + 1, this.glucoseCurve.length - 1);

    const now = new Date();
    return {
      systemTime: now.toISOString(),
      displayTime: new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 19),
      estimatedGlucoseValue: current,
      unit: "mg/dL",
      trend,
      trendRate,
      transmitterId: this.transmitterId,
      status: "ok",
      deviceInfo: {
        model: this.model,
        lastCalibration: this.lastCalibration,
      },
    };
  }

  /** Convert mg/dL to mmol/L */
  static toMmol(mgdl: number): number {
    return Math.round((mgdl / 18.018) * 10) / 10;
  }

  /** Convert mmol/L to mg/dL */
  static toMgdl(mmol: number): number {
    return Math.round(mmol * 18.018);
  }
}

// ─── Omnipod DASH State Machine ───────────────────────────────────────────────

export class OmnipodDASHSimulator {
  private state: OmnipodStatePacket;
  private sequenceNumber = 400;

  constructor(initialBasalRate = 0.85) {
    this.state = {
      podStatus: {
        state: "active",
        reservoirUnits: 200,
        totalDelivered: 0,
        activeBasalRate: initialBasalRate,
        lastBolus: null,
        alerts: [],
        tempBasal: { isRunning: false, rate: 0, remainingMinutes: 0 },
        autoOffTimer: { enabled: true, remainingMinutes: 4800 }, // 80 hours
      },
      sequenceNumber: this.sequenceNumber,
      bleConnected: true,
      podActivatedAt: new Date().toISOString(),
    };
  }

  /**
   * Deliver a bolus. Updates reservoir and records the event.
   */
  deliverBolus(units: number, type: "standard" | "extended" | "correction" = "standard"): OmnipodStatePacket {
    const pod = this.state.podStatus;
    const delivered = Math.min(units, pod.reservoirUnits);
    pod.reservoirUnits = Math.round((pod.reservoirUnits - delivered) * 10) / 10;
    pod.totalDelivered = Math.round((pod.totalDelivered + delivered) * 10) / 10;
    pod.lastBolus = {
      amount: delivered,
      timestamp: new Date().toISOString(),
      type,
    };
    this.updateAlerts();
    this.sequenceNumber++;
    this.state.sequenceNumber = this.sequenceNumber;
    return { ...this.state };
  }

  /**
   * Simulate hourly basal depletion. Call once per hour.
   */
  tickHourlyBasal(): OmnipodStatePacket {
    const pod = this.state.podStatus;
    const basalDelivered = pod.activeBasalRate;
    pod.reservoirUnits = Math.max(0, Math.round((pod.reservoirUnits - basalDelivered) * 10) / 10);
    pod.totalDelivered = Math.round((pod.totalDelivered + basalDelivered) * 10) / 10;
    pod.autoOffTimer.remainingMinutes = Math.max(0, pod.autoOffTimer.remainingMinutes - 60);

    if (pod.autoOffTimer.remainingMinutes === 0) {
      pod.state = "fault";
    }

    this.updateAlerts();
    this.sequenceNumber++;
    this.state.sequenceNumber = this.sequenceNumber;
    return { ...this.state };
  }

  /** Set a temporary basal rate override */
  setTempBasal(rate: number, durationMinutes: number): OmnipodStatePacket {
    this.state.podStatus.tempBasal = {
      isRunning: true,
      rate,
      remainingMinutes: durationMinutes,
    };
    return { ...this.state };
  }

  /** Get current state */
  getState(): OmnipodStatePacket {
    return { ...this.state };
  }

  private updateAlerts(): void {
    const alerts: OmnipodAlert[] = [];
    const pod = this.state.podStatus;
    if (pod.reservoirUnits < 10) alerts.push("low_reservoir");
    if (pod.autoOffTimer.remainingMinutes < 240) alerts.push("pod_expiry");
    if (pod.autoOffTimer.remainingMinutes < 30) alerts.push("auto_off_warning");
    pod.alerts = alerts;
  }
}

// ─── Omron BP BLE Emulator ────────────────────────────────────────────────────

export class OmronBPSimulator {
  private batteryLevel = 85;
  private userProfile: 1 | 2;
  private isHypertensive: boolean;

  constructor(isHypertensive = false, userProfile: 1 | 2 = 1) {
    this.isHypertensive = isHypertensive;
    this.userProfile = userProfile;
  }

  /**
   * Generate a physiologically plausible BP reading.
   * Normal range: 110-130 systolic unless hypertensive profile.
   * Mimics Omron HEM-7361T Bluetooth GATT characteristic data.
   */
  generateReading(): OmronBPPacket {
    let systolic: number;
    let diastolic: number;

    if (this.isHypertensive) {
      // Stage 1/2 hypertension range with variability
      systolic = Math.round(135 + Math.random() * 25 + gaussianNoise(5));
      diastolic = Math.round(85 + Math.random() * 15 + gaussianNoise(3));
    } else {
      // Normal/elevated range
      systolic = Math.round(110 + Math.random() * 20 + gaussianNoise(4));
      diastolic = Math.round(70 + Math.random() * 15 + gaussianNoise(3));
    }

    // Clamp to physiologically valid ranges
    systolic = Math.max(70, Math.min(250, systolic));
    diastolic = Math.max(40, Math.min(150, diastolic));

    const pulse = Math.round(60 + Math.random() * 30 + gaussianNoise(5));

    // AHA/JNC classification
    const classification = this.classifyBP(systolic, diastolic);

    // Simulate battery drain
    this.batteryLevel = Math.max(0, this.batteryLevel - 0.1);

    return {
      reading: {
        systolic,
        diastolic,
        pulse: Math.max(40, Math.min(200, pulse)),
        timestamp: new Date().toISOString(),
        userProfile: this.userProfile,
        unit: "mmHg",
      },
      device: {
        model: "Omron HEM-7361T",
        batteryLevel: Math.round(this.batteryLevel),
      },
      classification,
    };
  }

  private classifyBP(systolic: number, diastolic: number): BPClassification {
    if (systolic >= 180 || diastolic >= 120) return "crisis";
    if (systolic >= 140 || diastolic >= 90) return "stage2";
    if (systolic >= 130 || diastolic >= 80) return "stage1";
    if (systolic >= 120 && diastolic < 80) return "elevated";
    return "normal";
  }
}

// ─── Data Factory (Main Entry Point) ─────────────────────────────────────────

/**
 * SimulatorDataFactory — orchestrates all three device simulators.
 *
 * When Simulator Mode is ON, this class generates realistic device packets
 * and stores them in AsyncStorage using the same schema as real device data.
 * UI components read from AsyncStorage and are unaware of the data source.
 */
export class SimulatorDataFactory {
  private cgm: DexcomCGMSimulator;
  private omnipod: OmnipodDASHSimulator;
  private omron: OmronBPSimulator;
  private cgmIntervalId: ReturnType<typeof setInterval> | null = null;
  private omronIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.cgm = new DexcomCGMSimulator("Dexcom G7");
    this.omnipod = new OmnipodDASHSimulator(0.85);
    this.omron = new OmronBPSimulator(false, 1);
  }

  /** Check if simulator mode is enabled */
  static async isEnabled(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.SIMULATOR_ENABLED);
      return val === "true";
    } catch {
      return false;
    }
  }

  /** Enable or disable simulator mode */
  static async setEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SIMULATOR_ENABLED, enabled ? "true" : "false");
  }

  /**
   * Start the simulation loop:
   * - CGM: new packet every 5 minutes
   * - Omron BP: twice daily (every 12 hours)
   * - Omnipod: hourly basal depletion
   */
  start(carbsG = 0, insulinU = 0, startBG = 110): void {
    // Generate immediate first readings
    this.pushCGMReading(carbsG, insulinU, startBG);
    this.pushOmronReading();

    // CGM: every 5 minutes
    this.cgmIntervalId = setInterval(() => {
      this.pushCGMReading();
    }, 5 * 60 * 1000);

    // Omron BP: every 12 hours
    this.omronIntervalId = setInterval(() => {
      this.pushOmronReading();
    }, 12 * 60 * 60 * 1000);
  }

  /** Stop simulation loops */
  stop(): void {
    if (this.cgmIntervalId) clearInterval(this.cgmIntervalId);
    if (this.omronIntervalId) clearInterval(this.omronIntervalId);
    this.cgmIntervalId = null;
    this.omronIntervalId = null;
  }

  /** Trigger a bolus event on the Omnipod */
  async deliverBolus(units: number, type: "standard" | "extended" | "correction" = "standard"): Promise<OmnipodStatePacket> {
    const state = this.omnipod.deliverBolus(units, type);
    await AsyncStorage.setItem(STORAGE_KEYS.OMNIPOD_STATE, JSON.stringify(state));
    return state;
  }

  /** Get current Omnipod state */
  async getOmnipodState(): Promise<OmnipodStatePacket> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.OMNIPOD_STATE);
      if (raw) return JSON.parse(raw);
    } catch {}
    return this.omnipod.getState();
  }

  /** Get CGM history (last 288 readings = 24 hours) */
  static async getCGMHistory(): Promise<DexcomCGMPacket[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.CGM_HISTORY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  /** Get Omron BP history */
  static async getOmronHistory(): Promise<OmronBPPacket[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.OMRON_HISTORY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  private async pushCGMReading(carbsG = 0, insulinU = 0, startBG?: number): Promise<void> {
    const packet = this.cgm.generatePacket(carbsG, insulinU, startBG);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.CGM_HISTORY);
      const history: DexcomCGMPacket[] = raw ? JSON.parse(raw) : [];
      history.push(packet);
      // Keep last 288 readings (24 hours at 5-min intervals)
      if (history.length > 288) history.splice(0, history.length - 288);
      await AsyncStorage.setItem(STORAGE_KEYS.CGM_HISTORY, JSON.stringify(history));
    } catch {}
  }

  private async pushOmronReading(): Promise<void> {
    const packet = this.omron.generateReading();
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.OMRON_HISTORY);
      const history: OmronBPPacket[] = raw ? JSON.parse(raw) : [];
      history.push(packet);
      // Keep last 60 readings (~30 days)
      if (history.length > 60) history.splice(0, history.length - 60);
      await AsyncStorage.setItem(STORAGE_KEYS.OMRON_HISTORY, JSON.stringify(history));
    } catch {}
  }
}

// Singleton instance
export const simulatorFactory = new SimulatorDataFactory();
