import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

export type CGMDevice = "dexcom" | "dexcom_g7" | "freestyle_libre" | "omnipod" | "omnipod_5";

// Bluetooth Service UUIDs for CGM and Insulin Pump devices
export const DEVICE_BLUETOOTH_UUIDS = {
  // Dexcom G7 CGM
  DEXCOM_G7_SERVICE: "F8083532-849E-531C-C594-30F1F86A4EA5",
  DEXCOM_G7_GLUCOSE_CHAR: "F8083533-849E-531C-C594-30F1F86A4EA5",
  DEXCOM_G7_CONTROL_CHAR: "F8083534-849E-531C-C594-30F1F86A4EA5",
  
  // Omnipod 5 Insulin Pump
  OMNIPOD_5_SERVICE: "1D14D6EE-FD63-4FA1-BFA4-8F47B42119F0",
  OMNIPOD_5_INSULIN_CHAR: "1D14D6EF-FD63-4FA1-BFA4-8F47B42119F0",
  OMNIPOD_5_STATUS_CHAR: "1D14D6F0-FD63-4FA1-BFA4-8F47B42119F0",
};

// Device name patterns for identification
export const DEVICE_NAME_PATTERNS = {
  DEXCOM_G7: /dexcom.*g7|g7.*dexcom/i,
  OMNIPOD_5: /omnipod.*5|dash|omnipod/i,
};

export interface CGMReading {
  id: string;
  timestamp: Date;
  glucose: number; // mg/dL
  trend: "rising_fast" | "rising" | "stable" | "falling" | "falling_fast";
  device: CGMDevice;
}

export interface CGMAlertThresholds {
  highGlucose: number; // mg/dL
  lowGlucose: number; // mg/dL
  predictiveLowMinutes: number; // 15-30 minutes
}

export interface InsulinDelivery {
  id: string;
  timestamp: Date;
  type: "basal" | "bolus" | "correction";
  units: number;
  duration?: number; // minutes for basal
  carbsEntered?: number; // for bolus
}

export interface OmnipodStatus {
  reservoirLevel: number; // units remaining
  podExpiration: Date | null;
  insulinOnBoard: number; // units
  basalRate: number; // units/hour
  lastBolus: InsulinDelivery | null;
}

export interface CGMDeviceInfo {
  id: string;
  name: string;
  device: CGMDevice;
  isPaired: boolean;
  lastSync: Date | null;
  sensorExpiration: Date | null;
  batteryLevel: number | null;
}

class CGMService {
  private static instance: CGMService;
  private readings: CGMReading[] = [];
  private pairedDevices: CGMDeviceInfo[] = [];
  private insulinDeliveries: InsulinDelivery[] = [];
  private omnipodStatus: OmnipodStatus | null = null;
  private alertThresholds: CGMAlertThresholds = {
    highGlucose: 180,
    lowGlucose: 70,
    predictiveLowMinutes: 20,
  };
  private listeners: Array<(reading: CGMReading) => void> = [];

  private constructor() {
    this.loadData();
  }

  static getInstance(): CGMService {
    if (!CGMService.instance) {
      CGMService.instance = new CGMService();
    }
    return CGMService.instance;
  }

  private async loadData() {
    try {
      const [readingsData, devicesData, thresholdsData, insulinData, omnipodData] = await Promise.all([
        AsyncStorage.getItem("cgm_readings"),
        AsyncStorage.getItem("cgm_devices"),
        AsyncStorage.getItem("cgm_thresholds"),
        AsyncStorage.getItem("insulin_deliveries"),
        AsyncStorage.getItem("omnipod_status"),
      ]);

      if (readingsData) {
        this.readings = JSON.parse(readingsData).map((r: any) => ({
          ...r,
          timestamp: new Date(r.timestamp),
        }));
      }

      if (devicesData) {
        this.pairedDevices = JSON.parse(devicesData).map((d: any) => ({
          ...d,
          lastSync: d.lastSync ? new Date(d.lastSync) : null,
          sensorExpiration: d.sensorExpiration ? new Date(d.sensorExpiration) : null,
        }));
      }

      if (thresholdsData) {
        this.alertThresholds = JSON.parse(thresholdsData);
      }

      if (insulinData) {
        this.insulinDeliveries = JSON.parse(insulinData).map((d: any) => ({
          ...d,
          timestamp: new Date(d.timestamp),
        }));
      }

      if (omnipodData) {
        const parsed = JSON.parse(omnipodData);
        this.omnipodStatus = {
          ...parsed,
          podExpiration: parsed.podExpiration ? new Date(parsed.podExpiration) : null,
          lastBolus: parsed.lastBolus ? {
            ...parsed.lastBolus,
            timestamp: new Date(parsed.lastBolus.timestamp),
          } : null,
        };
      }
    } catch (error) {
      console.error("Error loading CGM data:", error);
    }
  }

  private async saveData() {
    try {
      await Promise.all([
        AsyncStorage.setItem("cgm_readings", JSON.stringify(this.readings)),
        AsyncStorage.setItem("cgm_devices", JSON.stringify(this.pairedDevices)),
        AsyncStorage.setItem("cgm_thresholds", JSON.stringify(this.alertThresholds)),
        AsyncStorage.setItem("insulin_deliveries", JSON.stringify(this.insulinDeliveries)),
        AsyncStorage.setItem("omnipod_status", JSON.stringify(this.omnipodStatus)),
      ]);
    } catch (error) {
      console.error("Error saving CGM data:", error);
    }
  }

  // Device Pairing
  async pairDevice(device: CGMDevice, deviceName: string): Promise<CGMDeviceInfo> {
    const newDevice: CGMDeviceInfo = {
      id: `${device}_${Date.now()}`,
      name: deviceName,
      device,
      isPaired: true,
      lastSync: new Date(),
      sensorExpiration: null,
      batteryLevel: null,
    };

    this.pairedDevices.push(newDevice);
    await this.saveData();
    return newDevice;
  }

  async unpairDevice(deviceId: string): Promise<void> {
    this.pairedDevices = this.pairedDevices.filter((d) => d.id !== deviceId);
    await this.saveData();
  }

  getPairedDevices(): CGMDeviceInfo[] {
    return this.pairedDevices;
  }

  // Real-time Glucose Sync
  async syncGlucoseData(device: CGMDevice): Promise<CGMReading[]> {
    // In production, this would connect to actual CGM APIs
    // For now, we'll simulate data sync
    const mockReadings = this.generateMockReadings(device, 12); // Last 12 readings (1 hour)
    
    this.readings.push(...mockReadings);
    
    // Keep only last 30 days of readings
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.readings = this.readings.filter((r) => r.timestamp >= thirtyDaysAgo);
    
    // Update device last sync
    const deviceInfo = this.pairedDevices.find((d) => d.device === device);
    if (deviceInfo) {
      deviceInfo.lastSync = new Date();
    }
    
    await this.saveData();
    
    // Check for alerts
    for (const reading of mockReadings) {
      await this.checkAlerts(reading);
      this.notifyListeners(reading);
    }
    
    return mockReadings;
  }

  private generateMockReadings(device: CGMDevice, count: number): CGMReading[] {
    const readings: CGMReading[] = [];
    const now = new Date();
    const baseGlucose = 120 + Math.random() * 40; // 120-160 mg/dL base
    
    for (let i = count - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000); // 5-minute intervals
      const glucose = Math.max(
        40,
        Math.min(400, baseGlucose + (Math.random() - 0.5) * 30)
      );
      
      const trend = this.calculateTrend(glucose, baseGlucose);
      
      readings.push({
        id: `${device}_${timestamp.getTime()}`,
        timestamp,
        glucose: Math.round(glucose),
        trend,
        device,
      });
    }
    
    return readings;
  }

  private calculateTrend(current: number, previous: number): CGMReading["trend"] {
    const change = current - previous;
    const rate = change / 5; // mg/dL per minute
    
    if (rate > 2) return "rising_fast";
    if (rate > 1) return "rising";
    if (rate < -2) return "falling_fast";
    if (rate < -1) return "falling";
    return "stable";
  }

  // Alert Management
  async setAlertThresholds(thresholds: Partial<CGMAlertThresholds>): Promise<void> {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
    await this.saveData();
  }

  getAlertThresholds(): CGMAlertThresholds {
    return this.alertThresholds;
  }

  private async checkAlerts(reading: CGMReading): Promise<void> {
    const { glucose, trend } = reading;
    const { highGlucose, lowGlucose, predictiveLowMinutes } = this.alertThresholds;
    
    // High glucose alert
    if (glucose >= highGlucose) {
      await this.sendAlert(
        "High Glucose Alert",
        `Your glucose is ${glucose} mg/dL, above your threshold of ${highGlucose} mg/dL.`,
        "high"
      );
    }
    
    // Low glucose alert
    if (glucose <= lowGlucose) {
      await this.sendAlert(
        "Low Glucose Alert",
        `Your glucose is ${glucose} mg/dL, below your threshold of ${lowGlucose} mg/dL. Take action immediately.`,
        "critical"
      );
    }
    
    // Predictive low glucose warning
    if (trend === "falling" || trend === "falling_fast") {
      const predictedGlucose = this.predictGlucose(reading, predictiveLowMinutes);
      if (predictedGlucose <= lowGlucose) {
        await this.sendAlert(
          "Predictive Low Glucose Warning",
          `Your glucose is trending down. Predicted to reach ${Math.round(predictedGlucose)} mg/dL in ${predictiveLowMinutes} minutes.`,
          "warning"
        );
      }
    }
  }

  private predictGlucose(reading: CGMReading, minutesAhead: number): number {
    const recentReadings = this.getRecentReadings(6); // Last 30 minutes
    if (recentReadings.length < 2) return reading.glucose;
    
    // Calculate average rate of change
    let totalChange = 0;
    for (let i = 1; i < recentReadings.length; i++) {
      const timeDiff = (recentReadings[i].timestamp.getTime() - recentReadings[i - 1].timestamp.getTime()) / 60000; // minutes
      const glucoseChange = recentReadings[i].glucose - recentReadings[i - 1].glucose;
      totalChange += glucoseChange / timeDiff;
    }
    const avgRateOfChange = totalChange / (recentReadings.length - 1);
    
    return reading.glucose + avgRateOfChange * minutesAhead;
  }

  private async sendAlert(title: string, body: string, priority: "low" | "warning" | "high" | "critical"): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: priority === "critical" ? "default" : undefined,
        priority: priority === "critical" ? Notifications.AndroidNotificationPriority.MAX : Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Immediate
    });
  }

  // Data Retrieval
  getLatestReading(): CGMReading | null {
    if (this.readings.length === 0) return null;
    return this.readings[this.readings.length - 1];
  }

  getRecentReadings(count: number): CGMReading[] {
    return this.readings.slice(-count);
  }

  getReadingsByDateRange(startDate: Date, endDate: Date): CGMReading[] {
    return this.readings.filter(
      (r) => r.timestamp >= startDate && r.timestamp <= endDate
    );
  }

  // Time in Range Statistics
  calculateTimeInRange(startDate: Date, endDate: Date): {
    veryLow: number; // <54 mg/dL
    low: number; // 54-69 mg/dL
    inRange: number; // 70-180 mg/dL
    high: number; // 181-250 mg/dL
    veryHigh: number; // >250 mg/dL
  } {
    const readings = this.getReadingsByDateRange(startDate, endDate);
    if (readings.length === 0) {
      return { veryLow: 0, low: 0, inRange: 0, high: 0, veryHigh: 0 };
    }
    
    const counts = {
      veryLow: readings.filter((r) => r.glucose < 54).length,
      low: readings.filter((r) => r.glucose >= 54 && r.glucose < 70).length,
      inRange: readings.filter((r) => r.glucose >= 70 && r.glucose <= 180).length,
      high: readings.filter((r) => r.glucose > 180 && r.glucose <= 250).length,
      veryHigh: readings.filter((r) => r.glucose > 250).length,
    };
    
    const total = readings.length;
    return {
      veryLow: (counts.veryLow / total) * 100,
      low: (counts.low / total) * 100,
      inRange: (counts.inRange / total) * 100,
      high: (counts.high / total) * 100,
      veryHigh: (counts.veryHigh / total) * 100,
    };
  }

  // Real-time Updates
  subscribe(callback: (reading: CGMReading) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners(reading: CGMReading): void {
    this.listeners.forEach((listener) => listener(reading));
  }

  // AGP Report Data
  getAGPData(days: number = 14): {
    median: number[];
    percentile25: number[];
    percentile75: number[];
    percentile10: number[];
    percentile90: number[];
  } {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const readings = this.getReadingsByDateRange(startDate, endDate);
    
    // Group readings by time of day (288 5-minute intervals in 24 hours)
    const intervals: number[][] = Array.from({ length: 288 }, () => []);
    
    readings.forEach((reading) => {
      const minuteOfDay = reading.timestamp.getHours() * 60 + reading.timestamp.getMinutes();
      const intervalIndex = Math.floor(minuteOfDay / 5);
      intervals[intervalIndex].push(reading.glucose);
    });
    
    // Calculate percentiles for each interval
    const median: number[] = [];
    const percentile25: number[] = [];
    const percentile75: number[] = [];
    const percentile10: number[] = [];
    const percentile90: number[] = [];
    
    intervals.forEach((values) => {
      if (values.length === 0) {
        median.push(0);
        percentile25.push(0);
        percentile75.push(0);
        percentile10.push(0);
        percentile90.push(0);
        return;
      }
      
      values.sort((a, b) => a - b);
      median.push(this.getPercentile(values, 50));
      percentile25.push(this.getPercentile(values, 25));
      percentile75.push(this.getPercentile(values, 75));
      percentile10.push(this.getPercentile(values, 10));
      percentile90.push(this.getPercentile(values, 90));
    });
    
    return { median, percentile25, percentile75, percentile10, percentile90 };
  }

  private getPercentile(sortedArray: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    if (lower === upper) return sortedArray[lower];
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  // Omnipod Insulin Tracking
  async logInsulinDelivery(delivery: Omit<InsulinDelivery, "id">): Promise<void> {
    const newDelivery: InsulinDelivery = {
      ...delivery,
      id: `insulin_${Date.now()}`,
    };
    
    this.insulinDeliveries.push(newDelivery);
    
    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.insulinDeliveries = this.insulinDeliveries.filter(
      (d) => d.timestamp >= thirtyDaysAgo
    );
    
    // Update Omnipod status
    if (this.omnipodStatus) {
      if (delivery.type === "bolus" || delivery.type === "correction") {
        this.omnipodStatus.lastBolus = newDelivery;
        this.omnipodStatus.insulinOnBoard += delivery.units;
      }
    }
    
    await this.saveData();
  }

  async updateOmnipodStatus(status: Partial<OmnipodStatus>): Promise<void> {
    this.omnipodStatus = {
      ...this.omnipodStatus,
      ...status,
    } as OmnipodStatus;
    await this.saveData();
  }

  getOmnipodStatus(): OmnipodStatus | null {
    return this.omnipodStatus;
  }

  getInsulinDeliveries(startDate: Date, endDate: Date): InsulinDelivery[] {
    return this.insulinDeliveries.filter(
      (d) => d.timestamp >= startDate && d.timestamp <= endDate
    );
  }

  getDailyInsulinTotals(date: Date): { basal: number; bolus: number; total: number } {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const deliveries = this.getInsulinDeliveries(startOfDay, endOfDay);
    
    const basal = deliveries
      .filter((d) => d.type === "basal")
      .reduce((sum, d) => sum + d.units, 0);
    
    const bolus = deliveries
      .filter((d) => d.type === "bolus" || d.type === "correction")
      .reduce((sum, d) => sum + d.units, 0);
    
    return {
      basal: Math.round(basal * 10) / 10,
      bolus: Math.round(bolus * 10) / 10,
      total: Math.round((basal + bolus) * 10) / 10,
    };
  }

  // Bluetooth Data Parsing
  parseDexcomG7Data(data: ArrayBuffer): CGMReading | null {
    try {
      const view = new DataView(data);
      
      // Dexcom G7 BLE data format (simplified)
      // Bytes 0-1: Glucose value (mg/dL)
      // Byte 2: Trend arrow
      // Bytes 3-6: Timestamp
      
      const glucose = view.getUint16(0, true); // Little-endian
      const trendByte = view.getUint8(2);
      const timestamp = new Date(view.getUint32(3, true) * 1000);
      
      const trendMap: { [key: number]: CGMReading["trend"] } = {
        1: "rising_fast",
        2: "rising",
        3: "stable",
        4: "falling",
        5: "falling_fast",
      };
      
      const trend = trendMap[trendByte] || "stable";
      
      const reading: CGMReading = {
        id: `dexcom_g7_${timestamp.getTime()}`,
        timestamp,
        glucose,
        trend,
        device: "dexcom_g7",
      };
      
      return reading;
    } catch (error) {
      console.error("Error parsing Dexcom G7 data:", error);
      return null;
    }
  }

  parseOmnipod5Data(data: ArrayBuffer): InsulinDelivery | OmnipodStatus | null {
    try {
      const view = new DataView(data);
      
      // Omnipod 5 BLE data format (simplified)
      // Byte 0: Data type (1=insulin delivery, 2=status)
      const dataType = view.getUint8(0);
      
      if (dataType === 1) {
        // Insulin delivery
        const type = view.getUint8(1); // 1=basal, 2=bolus, 3=correction
        const units = view.getFloat32(2, true) / 100; // Convert to units
        const timestamp = new Date(view.getUint32(6, true) * 1000);
        
        const typeMap: { [key: number]: InsulinDelivery["type"] } = {
          1: "basal",
          2: "bolus",
          3: "correction",
        };
        
        const delivery: InsulinDelivery = {
          id: `omnipod_5_${timestamp.getTime()}`,
          timestamp,
          type: typeMap[type] || "bolus",
          units: Math.round(units * 100) / 100,
        };
        
        return delivery;
      } else if (dataType === 2) {
        // Pod status
        const reservoirLevel = view.getUint16(1, true) / 100; // Convert to units
        const insulinOnBoard = view.getUint16(3, true) / 100;
        const basalRate = view.getUint16(5, true) / 100;
        const podExpirationTimestamp = view.getUint32(7, true);
        
        const status: OmnipodStatus = {
          reservoirLevel: Math.round(reservoirLevel * 10) / 10,
          podExpiration: podExpirationTimestamp > 0 ? new Date(podExpirationTimestamp * 1000) : null,
          insulinOnBoard: Math.round(insulinOnBoard * 100) / 100,
          basalRate: Math.round(basalRate * 100) / 100,
          lastBolus: this.omnipodStatus?.lastBolus || null,
        };
        
        return status;
      }
      
      return null;
    } catch (error) {
      console.error("Error parsing Omnipod 5 data:", error);
      return null;
    }
  }

  // Device Identification
  identifyDevice(deviceName: string): CGMDevice | null {
    if (DEVICE_NAME_PATTERNS.DEXCOM_G7.test(deviceName)) {
      return "dexcom_g7";
    }
    if (DEVICE_NAME_PATTERNS.OMNIPOD_5.test(deviceName)) {
      return "omnipod_5";
    }
    return null;
  }
}

export default CGMService.getInstance();
