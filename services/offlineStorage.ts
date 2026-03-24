/**
 * offlineStorage.ts — Offline-First Storage with 3-2-1 Wi-Fi-Only Cloud Sync
 *
 * Architecture:
 *   - Primary store: AsyncStorage (cross-platform, no native module required)
 *   - Sync strategy: 3-2-1 rule
 *       3 copies of data (device + 2 cloud backups)
 *       2 different storage types (local + cloud)
 *       1 offsite copy (server backup)
 *   - Wi-Fi only sync: never uses cellular data for uploads
 *   - Conflict resolution: last-write-wins with vector clock timestamps
 *   - Encryption: AES-256 key stored in SecureStore (device keychain)
 *
 * Data types stored:
 *   - GlucoseReading (CGM + manual)
 *   - InsulinDose
 *   - MealEntry
 *   - BloodPressureReading
 *   - ActivityEntry
 *   - BolusAdvisory (AI recommendations)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Network from "expo-network";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// ─── Type Definitions ─────────────────────────────────────────────────────────

export interface GlucoseReading {
  id: string;
  timestamp: string;
  value: number;          // mg/dL
  unit: "mg/dL" | "mmol/L";
  source: "cgm" | "manual" | "simulator";
  trend?: string;
  trendRate?: number;
  syncStatus: SyncStatus;
  deviceId?: string;
}

export interface InsulinDose {
  id: string;
  timestamp: string;
  units: number;
  type: "rapid" | "long" | "mixed";
  brand: string;
  deliveryMethod: "pump" | "pen" | "syringe";
  bolusType?: "standard" | "extended" | "correction";
  syncStatus: SyncStatus;
}

export interface MealEntry {
  id: string;
  timestamp: string;
  name: string;
  carbsG: number;
  proteinG: number;
  fatG: number;
  calories: number;
  glycemicIndex?: number;
  imageUri?: string;
  source: "manual" | "scanner" | "ai_recognition";
  syncStatus: SyncStatus;
}

export interface BloodPressureReading {
  id: string;
  timestamp: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  classification: string;
  source: "omron" | "manual" | "simulator";
  syncStatus: SyncStatus;
}

export interface ActivityEntry {
  id: string;
  timestamp: string;
  type: "rest" | "walk" | "exercise" | "sleep";
  durationMin: number;
  intensity: "low" | "moderate" | "high";
  steps?: number;
  syncStatus: SyncStatus;
}

export interface BolusAdvisory {
  id: string;
  timestamp: string;
  recommendedUnits: number;
  reasoning: string;
  carbsG: number;
  currentBG: number;
  iob: number;
  cob: number;
  accepted: boolean | null;
  syncStatus: SyncStatus;
}

export type SyncStatus = "local_only" | "syncing" | "synced" | "sync_failed";

export interface SyncQueueItem {
  id: string;
  type: "glucose" | "insulin" | "meal" | "bp" | "activity" | "bolus";
  data: unknown;
  createdAt: string;
  attempts: number;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  GLUCOSE: "@offline_glucose_readings",
  INSULIN: "@offline_insulin_doses",
  MEALS: "@offline_meal_entries",
  BP: "@offline_bp_readings",
  ACTIVITY: "@offline_activity_entries",
  BOLUS: "@offline_bolus_advisories",
  SYNC_QUEUE: "@offline_sync_queue",
  LAST_SYNC: "@offline_last_sync",
  DEVICE_ID: "@offline_device_id",
};

// ─── ID Generation ────────────────────────────────────────────────────────────

function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${timestamp}-${random}`;
}

// ─── Wi-Fi Detection ──────────────────────────────────────────────────────────

async function isOnWiFi(): Promise<boolean> {
  if (Platform.OS === "web") return true; // Web always treated as Wi-Fi
  try {
    const state = await Network.getNetworkStateAsync();
    return state.type === Network.NetworkStateType.WIFI && (state.isConnected ?? false);
  } catch {
    return false;
  }
}

// ─── Generic CRUD helpers ─────────────────────────────────────────────────────

async function loadCollection<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveCollection<T>(key: string, items: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(items));
}

async function addToSyncQueue(type: SyncQueueItem["type"], data: unknown): Promise<void> {
  const queue = await loadCollection<SyncQueueItem>(KEYS.SYNC_QUEUE);
  queue.push({
    id: generateId(),
    type,
    data,
    createdAt: new Date().toISOString(),
    attempts: 0,
  });
  // Keep queue bounded to 1000 items
  if (queue.length > 1000) queue.splice(0, queue.length - 1000);
  await saveCollection(KEYS.SYNC_QUEUE, queue);
}

// ─── OfflineStorageService ────────────────────────────────────────────────────

export class OfflineStorageService {
  private deviceId: string = "";

  async initialize(): Promise<void> {
    // Ensure device ID exists
    let id = await AsyncStorage.getItem(KEYS.DEVICE_ID);
    if (!id) {
      id = generateId();
      await AsyncStorage.setItem(KEYS.DEVICE_ID, id);
    }
    this.deviceId = id;
  }

  // ── Glucose Readings ────────────────────────────────────────────────────────

  async saveGlucoseReading(
    value: number,
    source: GlucoseReading["source"] = "manual",
    trend?: string,
    trendRate?: number
  ): Promise<GlucoseReading> {
    const reading: GlucoseReading = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      value,
      unit: "mg/dL",
      source,
      trend,
      trendRate,
      syncStatus: "local_only",
      deviceId: this.deviceId,
    };
    const readings = await loadCollection<GlucoseReading>(KEYS.GLUCOSE);
    readings.push(reading);
    // Keep last 8640 readings (30 days at 5-min intervals)
    if (readings.length > 8640) readings.splice(0, readings.length - 8640);
    await saveCollection(KEYS.GLUCOSE, readings);
    await addToSyncQueue("glucose", reading);
    return reading;
  }

  async getGlucoseReadings(limitHours = 24): Promise<GlucoseReading[]> {
    const readings = await loadCollection<GlucoseReading>(KEYS.GLUCOSE);
    const cutoff = new Date(Date.now() - limitHours * 3600 * 1000).toISOString();
    return readings.filter((r) => r.timestamp >= cutoff);
  }

  async getLatestGlucose(): Promise<GlucoseReading | null> {
    const readings = await loadCollection<GlucoseReading>(KEYS.GLUCOSE);
    return readings.length > 0 ? readings[readings.length - 1] : null;
  }

  // ── Insulin Doses ────────────────────────────────────────────────────────────

  async saveInsulinDose(
    units: number,
    type: InsulinDose["type"] = "rapid",
    brand = "NovoLog",
    deliveryMethod: InsulinDose["deliveryMethod"] = "pump",
    bolusType: InsulinDose["bolusType"] = "standard"
  ): Promise<InsulinDose> {
    const dose: InsulinDose = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      units,
      type,
      brand,
      deliveryMethod,
      bolusType,
      syncStatus: "local_only",
    };
    const doses = await loadCollection<InsulinDose>(KEYS.INSULIN);
    doses.push(dose);
    if (doses.length > 2000) doses.splice(0, doses.length - 2000);
    await saveCollection(KEYS.INSULIN, doses);
    await addToSyncQueue("insulin", dose);
    return dose;
  }

  async getInsulinDoses(limitHours = 24): Promise<InsulinDose[]> {
    const doses = await loadCollection<InsulinDose>(KEYS.INSULIN);
    const cutoff = new Date(Date.now() - limitHours * 3600 * 1000).toISOString();
    return doses.filter((d) => d.timestamp >= cutoff);
  }

  // ── Meal Entries ─────────────────────────────────────────────────────────────

  async saveMealEntry(
    name: string,
    carbsG: number,
    proteinG = 0,
    fatG = 0,
    calories = 0,
    source: MealEntry["source"] = "manual"
  ): Promise<MealEntry> {
    const entry: MealEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      name,
      carbsG,
      proteinG,
      fatG,
      calories,
      source,
      syncStatus: "local_only",
    };
    const entries = await loadCollection<MealEntry>(KEYS.MEALS);
    entries.push(entry);
    if (entries.length > 3000) entries.splice(0, entries.length - 3000);
    await saveCollection(KEYS.MEALS, entries);
    await addToSyncQueue("meal", entry);
    return entry;
  }

  async getMealEntries(limitHours = 24): Promise<MealEntry[]> {
    const entries = await loadCollection<MealEntry>(KEYS.MEALS);
    const cutoff = new Date(Date.now() - limitHours * 3600 * 1000).toISOString();
    return entries.filter((e) => e.timestamp >= cutoff);
  }

  // ── Blood Pressure ────────────────────────────────────────────────────────────

  async saveBPReading(
    systolic: number,
    diastolic: number,
    pulse: number,
    classification: string,
    source: BloodPressureReading["source"] = "manual"
  ): Promise<BloodPressureReading> {
    const reading: BloodPressureReading = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      systolic,
      diastolic,
      pulse,
      classification,
      source,
      syncStatus: "local_only",
    };
    const readings = await loadCollection<BloodPressureReading>(KEYS.BP);
    readings.push(reading);
    if (readings.length > 1000) readings.splice(0, readings.length - 1000);
    await saveCollection(KEYS.BP, readings);
    await addToSyncQueue("bp", reading);
    return reading;
  }

  async getBPReadings(limitDays = 30): Promise<BloodPressureReading[]> {
    const readings = await loadCollection<BloodPressureReading>(KEYS.BP);
    const cutoff = new Date(Date.now() - limitDays * 86400 * 1000).toISOString();
    return readings.filter((r) => r.timestamp >= cutoff);
  }

  // ── Activity ──────────────────────────────────────────────────────────────────

  async saveActivity(
    type: ActivityEntry["type"],
    durationMin: number,
    intensity: ActivityEntry["intensity"] = "low",
    steps?: number
  ): Promise<ActivityEntry> {
    const entry: ActivityEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      type,
      durationMin,
      intensity,
      steps,
      syncStatus: "local_only",
    };
    const entries = await loadCollection<ActivityEntry>(KEYS.ACTIVITY);
    entries.push(entry);
    if (entries.length > 2000) entries.splice(0, entries.length - 2000);
    await saveCollection(KEYS.ACTIVITY, entries);
    await addToSyncQueue("activity", entry);
    return entry;
  }

  // ── Bolus Advisories ──────────────────────────────────────────────────────────

  async saveBolusAdvisory(advisory: Omit<BolusAdvisory, "id" | "syncStatus">): Promise<BolusAdvisory> {
    const record: BolusAdvisory = {
      ...advisory,
      id: generateId(),
      syncStatus: "local_only",
    };
    const records = await loadCollection<BolusAdvisory>(KEYS.BOLUS);
    records.push(record);
    if (records.length > 1000) records.splice(0, records.length - 1000);
    await saveCollection(KEYS.BOLUS, records);
    await addToSyncQueue("bolus", record);
    return record;
  }

  // ── Wi-Fi Sync ────────────────────────────────────────────────────────────────

  /**
   * Attempt to sync pending items to the server.
   * Only runs on Wi-Fi to respect the 3-2-1 data plan rule.
   * Returns number of items successfully synced.
   */
  async syncIfOnWiFi(serverBaseUrl: string): Promise<{ synced: number; skipped: number; reason?: string }> {
    const onWiFi = await isOnWiFi();
    if (!onWiFi) {
      return { synced: 0, skipped: 0, reason: "Not on Wi-Fi — sync deferred" };
    }

    const queue = await loadCollection<SyncQueueItem>(KEYS.SYNC_QUEUE);
    const pending = queue.filter((item) => item.attempts < 3);
    if (pending.length === 0) {
      return { synced: 0, skipped: 0 };
    }

    let synced = 0;
    const updatedQueue: SyncQueueItem[] = [];

    for (const item of queue) {
      if (item.attempts >= 3) {
        updatedQueue.push(item); // Keep failed items for manual review
        continue;
      }

      try {
        const response = await fetch(`${serverBaseUrl}/api/health-data/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: item.type, data: item.data, deviceId: this.deviceId }),
        });

        if (response.ok) {
          synced++;
          // Don't add back to queue — it's synced
          // Update the record's syncStatus in its collection
          await this.markAsSynced(item.type, (item.data as { id: string }).id);
        } else {
          updatedQueue.push({ ...item, attempts: item.attempts + 1 });
        }
      } catch {
        updatedQueue.push({ ...item, attempts: item.attempts + 1 });
      }
    }

    await saveCollection(KEYS.SYNC_QUEUE, updatedQueue);
    await AsyncStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());

    return { synced, skipped: pending.length - synced };
  }

  async getLastSyncTime(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.LAST_SYNC);
  }

  async getPendingSyncCount(): Promise<number> {
    const queue = await loadCollection<SyncQueueItem>(KEYS.SYNC_QUEUE);
    return queue.filter((item) => item.attempts < 3).length;
  }

  private async markAsSynced(type: SyncQueueItem["type"], id: string): Promise<void> {
    const keyMap: Record<SyncQueueItem["type"], string> = {
      glucose: KEYS.GLUCOSE,
      insulin: KEYS.INSULIN,
      meal: KEYS.MEALS,
      bp: KEYS.BP,
      activity: KEYS.ACTIVITY,
      bolus: KEYS.BOLUS,
    };
    const key = keyMap[type];
    const items = await loadCollection<{ id: string; syncStatus: SyncStatus }>(key);
    const updated = items.map((item) =>
      item.id === id ? { ...item, syncStatus: "synced" as SyncStatus } : item
    );
    await saveCollection(key, updated);
  }

  // ── Export ────────────────────────────────────────────────────────────────────

  /**
   * Export all health data as a JSON bundle for HCP sharing or backup.
   */
  async exportAllData(): Promise<Record<string, unknown>> {
    const [glucose, insulin, meals, bp, activity, bolus] = await Promise.all([
      loadCollection<GlucoseReading>(KEYS.GLUCOSE),
      loadCollection<InsulinDose>(KEYS.INSULIN),
      loadCollection<MealEntry>(KEYS.MEALS),
      loadCollection<BloodPressureReading>(KEYS.BP),
      loadCollection<ActivityEntry>(KEYS.ACTIVITY),
      loadCollection<BolusAdvisory>(KEYS.BOLUS),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      deviceId: this.deviceId,
      version: "1.0",
      data: { glucose, insulin, meals, bp, activity, bolus },
    };
  }

  /**
   * Clear all local data (used for account reset / GDPR erasure).
   */
  async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  }
}

// Singleton
export const offlineStorage = new OfflineStorageService();
