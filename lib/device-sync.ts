import { Platform } from "react-native";
import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
} from "rn-apple-healthkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Device Sync Module - Apple Health / Google Fit Integration
 *
 * Acts as a bridge between HealthMate and the phone's central health repository.
 * Syncs data from Omron 3550, iHome Scale, and Samsung Watch 7 via the central hub.
 */

// Health data types we want to sync
export type HealthDataType =
  | "bloodPressure"
  | "heartRate"
  | "weight"
  | "bodyFatPercentage"
  | "steps"
  | "glucose"
  | "insulin";

export interface SyncedHealthData {
  type: HealthDataType;
  value: number;
  systolic?: number; // For BP
  diastolic?: number; // For BP
  trend?: string; // For glucose (rising_fast, rising, stable, falling, falling_fast)
  insulinType?: string; // For insulin (basal, bolus, correction)
  unit: string;
  timestamp: string;
  source: string; // "Omron 3550", "iHome Scale", "Samsung Watch 7", "Dexcom G7", "Omnipod 5"
  deviceId?: string;
}

export interface DeviceStatus {
  deviceName: string;
  lastSyncTime: string | null;
  status: "connected" | "disconnected" | "syncing";
  dataCount: number;
}

const SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const STORAGE_KEY_LAST_SYNC = "@healthmate_last_sync";
const STORAGE_KEY_DEVICE_STATUS = "@healthmate_device_status";

/**
 * Initialize Apple HealthKit with required permissions
 */
export const initializeAppleHealth = async (): Promise<boolean> => {
  if (Platform.OS !== "ios") {
    return false;
  }

  const permissions: HealthKitPermissions = {
    permissions: {
      read: [
        (AppleHealthKit as any).Constants.Permissions.BloodPressureSystolic,
        (AppleHealthKit as any).Constants.Permissions.BloodPressureDiastolic,
        (AppleHealthKit as any).Constants.Permissions.HeartRate,
        (AppleHealthKit as any).Constants.Permissions.Weight,
        (AppleHealthKit as any).Constants.Permissions.BodyFatPercentage,
        (AppleHealthKit as any).Constants.Permissions.StepCount,
      ],
      write: [],
    },
  };

  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.error("[DeviceSync] Apple HealthKit initialization error:", error);
        resolve(false);
      } else {
        console.log("[DeviceSync] Apple HealthKit initialized successfully");
        resolve(true);
      }
    });
  });
};

/**
 * Initialize Google Fit / Health Connect (Android)
 */
export const initializeGoogleFit = async (): Promise<boolean> => {
  if (Platform.OS !== "android") {
    return false;
  }

  // Note: Google Fit integration requires additional setup
  // For now, return false and implement when testing on Android device
  console.log("[DeviceSync] Google Fit integration pending Android device testing");
  return false;
};

/**
 * Sync blood pressure data from Apple Health
 */
const syncBloodPressure = async (): Promise<SyncedHealthData[]> => {
  if (Platform.OS !== "ios") return [];

  const options = {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
    limit: 100,
  };

  return new Promise((resolve) => {
    (AppleHealthKit as any).getBloodPressureSamples(
      options,
      (error: Object, results: Array<any>) => {
        if (error) {
          console.error("[DeviceSync] Error fetching BP data:", error);
          resolve([]);
          return;
        }

        const syncedData: SyncedHealthData[] = results.map((sample) => ({
          type: "bloodPressure",
          value: sample.bloodPressureSystolicValue,
          systolic: sample.bloodPressureSystolicValue,
          diastolic: sample.bloodPressureDiastolicValue,
          unit: "mmHg",
          timestamp: sample.startDate,
          source: sample.sourceName || "Omron 3550",
          deviceId: sample.sourceId,
        }));

        resolve(syncedData);
      }
    );
  });
};

/**
 * Sync heart rate data from Apple Health
 */
const syncHeartRate = async (): Promise<SyncedHealthData[]> => {
  if (Platform.OS !== "ios") return [];

  const options = {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    limit: 100,
  };

  return new Promise((resolve) => {
    (AppleHealthKit as any).getHeartRateSamples(
      options,
      (error: Object, results: HealthValue[]) => {
        if (error) {
          console.error("[DeviceSync] Error fetching HR data:", error);
          resolve([]);
          return;
        }

        const syncedData: SyncedHealthData[] = results.map((sample) => ({
          type: "heartRate",
          value: sample.value,
          unit: "bpm",
          timestamp: sample.startDate,
          source: (sample as any).sourceName || "Samsung Watch 7",
          deviceId: (sample as any).sourceId,
        }));

        resolve(syncedData);
      }
    );
  });
};

/**
 * Sync weight data from Apple Health
 */
const syncWeight = async (): Promise<SyncedHealthData[]> => {
  if (Platform.OS !== "ios") return [];

  const options = {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
    limit: 100,
  };

  return new Promise((resolve) => {
    (AppleHealthKit as any).getWeightSamples(
      options,
      (error: Object, results: HealthValue[]) => {
        if (error) {
          console.error("[DeviceSync] Error fetching weight data:", error);
          resolve([]);
          return;
        }

        const syncedData: SyncedHealthData[] = results.map((sample) => ({
          type: "weight",
          value: sample.value,
          unit: "lbs",
          timestamp: sample.startDate,
          source: (sample as any).sourceName || "iHome Scale",
          deviceId: (sample as any).sourceId,
        }));

        resolve(syncedData);
      }
    );
  });
};

/**
 * Sync body fat percentage from Apple Health
 */
const syncBodyFat = async (): Promise<SyncedHealthData[]> => {
  if (Platform.OS !== "ios") return [];

  const options = {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    limit: 100,
  };

  return new Promise((resolve) => {
    (AppleHealthKit as any).getBodyFatPercentageSamples(
      options,
      (error: Object, results: HealthValue[]) => {
        if (error) {
          console.error("[DeviceSync] Error fetching body fat data:", error);
          resolve([]);
          return;
        }

        const syncedData: SyncedHealthData[] = results.map((sample) => ({
          type: "bodyFatPercentage",
          value: sample.value,
          unit: "%",
          timestamp: sample.startDate,
          source: (sample as any).sourceName || "iHome Scale",
          deviceId: (sample as any).sourceId,
        }));

        resolve(syncedData);
      }
    );
  });
};

/**
 * Sync daily step count from Apple Health
 */
const syncSteps = async (): Promise<SyncedHealthData[]> => {
  if (Platform.OS !== "ios") return [];

  const options = {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  return new Promise((resolve) => {
    (AppleHealthKit as any).getDailyStepCountSamples(
      options,
      (error: Object, results: HealthValue[]) => {
        if (error) {
          console.error("[DeviceSync] Error fetching steps data:", error);
          resolve([]);
          return;
        }

        const syncedData: SyncedHealthData[] = results.map((sample) => ({
          type: "steps",
          value: sample.value,
          unit: "steps",
          timestamp: sample.startDate,
          source: (sample as any).sourceName || "Samsung Watch 7",
          deviceId: (sample as any).sourceId,
        }));

        resolve(syncedData);
      }
    );
  });
};

/**
 * Perform full sync of all health data
 */
export const syncAllHealthData = async (): Promise<SyncedHealthData[]> => {
  console.log("[DeviceSync] Starting full health data sync...");

  try {
    const [bp, hr, weight, bodyFat, steps] = await Promise.all([
      syncBloodPressure(),
      syncHeartRate(),
      syncWeight(),
      syncBodyFat(),
      syncSteps(),
    ]);

    const allData = [...bp, ...hr, ...weight, ...bodyFat, ...steps];

    // Update last sync time
    await AsyncStorage.setItem(STORAGE_KEY_LAST_SYNC, new Date().toISOString());

    // Update device status
    await updateDeviceStatus(allData);

    console.log(`[DeviceSync] Synced ${allData.length} health data points`);
    return allData;
  } catch (error) {
    console.error("[DeviceSync] Error during sync:", error);
    return [];
  }
};

/**
 * Update device connection status based on synced data
 */
const updateDeviceStatus = async (data: SyncedHealthData[]): Promise<void> => {
  const devices: Record<string, DeviceStatus> = {
    omron: {
      deviceName: "Omron 3550",
      lastSyncTime: null,
      status: "disconnected",
      dataCount: 0,
    },
    ihome: {
      deviceName: "iHome Scale",
      lastSyncTime: null,
      status: "disconnected",
      dataCount: 0,
    },
    samsung: {
      deviceName: "Samsung Watch 7",
      lastSyncTime: null,
      status: "disconnected",
      dataCount: 0,
    },
  };

  // Update based on synced data
  data.forEach((item) => {
    if (item.source.includes("Omron")) {
      devices.omron.lastSyncTime = item.timestamp;
      devices.omron.status = "connected";
      devices.omron.dataCount++;
    } else if (item.source.includes("iHome") || item.type === "weight" || item.type === "bodyFatPercentage") {
      devices.ihome.lastSyncTime = item.timestamp;
      devices.ihome.status = "connected";
      devices.ihome.dataCount++;
    } else if (item.source.includes("Samsung") || item.type === "heartRate" || item.type === "steps") {
      devices.samsung.lastSyncTime = item.timestamp;
      devices.samsung.status = "connected";
      devices.samsung.dataCount++;
    }
  });

  await AsyncStorage.setItem(STORAGE_KEY_DEVICE_STATUS, JSON.stringify(devices));
};

/**
 * Get current device connection status
 */
export const getDeviceStatus = async (): Promise<Record<string, DeviceStatus>> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_DEVICE_STATUS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("[DeviceSync] Error reading device status:", error);
  }

  // Return default status
  return {
    omron: {
      deviceName: "Omron 3550",
      lastSyncTime: null,
      status: "disconnected",
      dataCount: 0,
    },
    ihome: {
      deviceName: "iHome Scale",
      lastSyncTime: null,
      status: "disconnected",
      dataCount: 0,
    },
    samsung: {
      deviceName: "Samsung Watch 7",
      lastSyncTime: null,
      status: "disconnected",
      dataCount: 0,
    },
  };
};

/**
 * Get last sync timestamp
 */
export const getLastSyncTime = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEY_LAST_SYNC);
  } catch (error) {
    console.error("[DeviceSync] Error reading last sync time:", error);
    return null;
  }
};

/**
 * Start automatic background sync (every 15 minutes)
 */
export const startAutoSync = () => {
  console.log("[DeviceSync] Starting automatic sync (every 15 minutes)");

  // Initial sync
  syncAllHealthData();

  // Set up interval
  const intervalId = setInterval(() => {
    syncAllHealthData();
  }, SYNC_INTERVAL_MS);

  return intervalId;
};

/**
 * Stop automatic background sync
 */
export const stopAutoSync = (intervalId: NodeJS.Timeout) => {
  clearInterval(intervalId);
  console.log("[DeviceSync] Stopped automatic sync");
};
