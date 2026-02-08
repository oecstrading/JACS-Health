/**
 * Health Data Sync
 * 
 * Syncs health data from Apple Health (iOS) and Google Fit (Android).
 * Automatically imports steps, heart rate, and sleep data.
 */

import { Platform } from "react-native";
// Health data will be saved using AsyncStorage in production

export interface HealthDataPoint {
  type: "steps" | "heart_rate" | "sleep";
  value: number;
  unit: string;
  timestamp: Date;
  source: "apple_health" | "google_fit" | "manual";
}

export interface SyncStatus {
  lastSyncTime: Date | null;
  isSync: boolean;
  error: string | null;
  itemsSynced: number;
}

/**
 * Request health data permissions
 */
export async function requestHealthPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === "ios") {
      // In production, use expo-apple-healthkit or react-native-health
      console.log("Requesting Apple Health permissions...");
      // Mock: Always grant for demo
      return true;
    } else if (Platform.OS === "android") {
      // In production, use @react-native-community/google-fit
      console.log("Requesting Google Fit permissions...");
      // Mock: Always grant for demo
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to request health permissions:", error);
    return false;
  }
}

/**
 * Check if health permissions are granted
 */
export async function hasHealthPermissions(): Promise<boolean> {
  // In production, check actual permissions
  return true;
}

/**
 * Sync step count data
 */
export async function syncStepCount(startDate: Date, endDate: Date): Promise<HealthDataPoint[]> {
  try {
    if (Platform.OS === "ios") {
      // In production, fetch from Apple Health
      // Example: HKQuantityType.quantityType(forIdentifier: .stepCount)
      console.log("Syncing steps from Apple Health...");
      
      // Mock data for demonstration
      const mockSteps: HealthDataPoint[] = [
        {
          type: "steps",
          value: 8234,
          unit: "steps",
          timestamp: new Date(),
          source: "apple_health",
        },
      ];
      
      return mockSteps;
    } else if (Platform.OS === "android") {
      // In production, fetch from Google Fit
      // Example: Fitness.getHistoryClient()
      console.log("Syncing steps from Google Fit...");
      
      // Mock data for demonstration
      const mockSteps: HealthDataPoint[] = [
        {
          type: "steps",
          value: 7856,
          unit: "steps",
          timestamp: new Date(),
          source: "google_fit",
        },
      ];
      
      return mockSteps;
    }
    
    return [];
  } catch (error) {
    console.error("Failed to sync step count:", error);
    return [];
  }
}

/**
 * Sync heart rate data
 */
export async function syncHeartRate(startDate: Date, endDate: Date): Promise<HealthDataPoint[]> {
  try {
    if (Platform.OS === "ios") {
      console.log("Syncing heart rate from Apple Health...");
      
      // Mock data
      const mockHeartRate: HealthDataPoint[] = [
        {
          type: "heart_rate",
          value: 72,
          unit: "bpm",
          timestamp: new Date(),
          source: "apple_health",
        },
      ];
      
      return mockHeartRate;
    } else if (Platform.OS === "android") {
      console.log("Syncing heart rate from Google Fit...");
      
      // Mock data
      const mockHeartRate: HealthDataPoint[] = [
        {
          type: "heart_rate",
          value: 75,
          unit: "bpm",
          timestamp: new Date(),
          source: "google_fit",
        },
      ];
      
      return mockHeartRate;
    }
    
    return [];
  } catch (error) {
    console.error("Failed to sync heart rate:", error);
    return [];
  }
}

/**
 * Sync sleep data
 */
export async function syncSleepData(startDate: Date, endDate: Date): Promise<HealthDataPoint[]> {
  try {
    if (Platform.OS === "ios") {
      console.log("Syncing sleep data from Apple Health...");
      
      // Mock data
      const mockSleep: HealthDataPoint[] = [
        {
          type: "sleep",
          value: 7.5,
          unit: "hours",
          timestamp: new Date(),
          source: "apple_health",
        },
      ];
      
      return mockSleep;
    } else if (Platform.OS === "android") {
      console.log("Syncing sleep data from Google Fit...");
      
      // Mock data
      const mockSleep: HealthDataPoint[] = [
        {
          type: "sleep",
          value: 7.2,
          unit: "hours",
          timestamp: new Date(),
          source: "google_fit",
        },
      ];
      
      return mockSleep;
    }
    
    return [];
  } catch (error) {
    console.error("Failed to sync sleep data:", error);
    return [];
  }
}

/**
 * Sync all health data
 */
export async function syncAllHealthData(): Promise<SyncStatus> {
  const startTime = new Date();
  const status: SyncStatus = {
    lastSyncTime: null,
    isSync: true,
    error: null,
    itemsSynced: 0,
  };

  try {
    const hasPermissions = await hasHealthPermissions();
    
    if (!hasPermissions) {
      const granted = await requestHealthPermissions();
      if (!granted) {
        status.isSync = false;
        status.error = "Health permissions not granted";
        return status;
      }
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days

    // Sync all data types
    const [steps, heartRate, sleep] = await Promise.all([
      syncStepCount(startDate, endDate),
      syncHeartRate(startDate, endDate),
      syncSleepData(startDate, endDate),
    ]);

    // Save to local storage
    const allData = [...steps, ...heartRate, ...sleep];
    // In production, save each data point to AsyncStorage
    console.log("Health data synced:", allData);

    status.isSync = false;
    status.lastSyncTime = new Date();
    status.itemsSynced = allData.length;

    console.log(`Synced ${status.itemsSynced} health data points`);
    
    return status;
  } catch (error) {
    status.isSync = false;
    status.error = error instanceof Error ? error.message : "Unknown error";
    console.error("Health sync failed:", error);
    return status;
  }
}

/**
 * Get last sync time
 */
export async function getLastSyncTime(): Promise<Date | null> {
  // In production, fetch from AsyncStorage
  return null;
}

/**
 * Enable automatic sync
 */
export async function enableAutoSync(intervalMinutes: number = 60): Promise<boolean> {
  try {
    // In production, set up background task to sync periodically
    console.log(`Auto-sync enabled (every ${intervalMinutes} minutes)`);
    return true;
  } catch (error) {
    console.error("Failed to enable auto-sync:", error);
    return false;
  }
}

/**
 * Disable automatic sync
 */
export async function disableAutoSync(): Promise<boolean> {
  try {
    // In production, cancel background sync task
    console.log("Auto-sync disabled");
    return true;
  } catch (error) {
    console.error("Failed to disable auto-sync:", error);
    return false;
  }
}

/**
 * Get health data source name
 */
export function getHealthSourceName(): string {
  if (Platform.OS === "ios") {
    return "Apple Health";
  } else if (Platform.OS === "android") {
    return "Google Fit";
  }
  return "Unknown";
}

/**
 * Get health data source icon
 */
export function getHealthSourceIcon(): string {
  if (Platform.OS === "ios") {
    return "❤️"; // Apple Health icon
  } else if (Platform.OS === "android") {
    return "🏃"; // Google Fit icon
  }
  return "📊";
}

/**
 * Format sync status
 */
export function formatSyncStatus(status: SyncStatus): string {
  if (status.isSync) {
    return "Syncing...";
  }
  
  if (status.error) {
    return `Error: ${status.error}`;
  }
  
  if (status.lastSyncTime) {
    const now = new Date();
    const diff = now.getTime() - status.lastSyncTime.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    
    if (minutes < 1) {
      return "Just synced";
    } else if (minutes < 60) {
      return `Synced ${minutes}m ago`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `Synced ${hours}h ago`;
    }
  }
  
  return "Never synced";
}

/**
 * Check if sync is available on this platform
 */
export function isSyncAvailable(): boolean {
  return Platform.OS === "ios" || Platform.OS === "android";
}
