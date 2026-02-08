import { Platform } from "react-native";
import { addVital, type Vital } from "./storage";

/**
 * Wearable Device Integration
 * 
 * Integrates with Apple HealthKit (iOS) and Google Fit (Android) to sync health data.
 * Note: This is a simplified implementation. Full integration requires native modules.
 */

export interface WearableData {
  heartRate?: number;
  steps?: number;
  sleepHours?: number;
  calories?: number;
  distance?: number; // in miles
}

export interface WearableDevice {
  id: string;
  name: string;
  type: "apple_watch" | "fitbit" | "google_fit";
  connected: boolean;
  lastSync?: string;
}

/**
 * Check if wearable integration is available on this platform
 */
export function isWearableAvailable(): boolean {
  // Apple HealthKit is available on iOS
  // Google Fit is available on Android
  return Platform.OS === "ios" || Platform.OS === "android";
}

/**
 * Get connected wearable devices
 */
export async function getConnectedDevices(): Promise<WearableDevice[]> {
  // Mock implementation - in production, this would query native modules
  const devices: WearableDevice[] = [];

  if (Platform.OS === "ios") {
    devices.push({
      id: "apple_watch_1",
      name: "Apple Watch Series 9",
      type: "apple_watch",
      connected: true,
      lastSync: new Date().toISOString(),
    });
  } else if (Platform.OS === "android") {
    devices.push({
      id: "google_fit_1",
      name: "Google Fit",
      type: "google_fit",
      connected: true,
      lastSync: new Date().toISOString(),
    });
  }

  return devices;
}

/**
 * Request permission to access health data
 */
export async function requestHealthPermissions(): Promise<boolean> {
  try {
    // Mock implementation - in production, this would request native permissions
    // For iOS: Apple HealthKit permissions
    // For Android: Google Fit permissions
    
    console.log("Requesting health data permissions...");
    
    // Simulate permission request
    return true;
  } catch (error) {
    console.error("Error requesting health permissions:", error);
    return false;
  }
}

/**
 * Sync health data from wearable devices
 */
export async function syncWearableData(): Promise<WearableData | null> {
  try {
    if (!isWearableAvailable()) {
      console.warn("Wearable integration not available on this platform");
      return null;
    }

    // Mock implementation - in production, this would fetch from native modules
    // For iOS: Query HealthKit for HKQuantityType data
    // For Android: Query Google Fit API
    
    const today = new Date().toISOString().split("T")[0];
    
    // Simulate fetching data from wearable
    const mockData: WearableData = {
      heartRate: 72 + Math.floor(Math.random() * 10), // 72-82 bpm
      steps: 3245 + Math.floor(Math.random() * 1000), // 3245-4245 steps
      sleepHours: 7 + Math.random() * 2, // 7-9 hours
      calories: 1800 + Math.floor(Math.random() * 400), // 1800-2200 cal
      distance: 1.5 + Math.random() * 1, // 1.5-2.5 miles
    };

    // Save heart rate to vitals
    if (mockData.heartRate) {
      const heartRateVital: Vital = {
        id: `hr_${Date.now()}`,
        type: "heart_rate",
        value: mockData.heartRate.toString(),
        unit: "bpm",
        status: mockData.heartRate >= 60 && mockData.heartRate <= 100 ? "normal" : "warning",
        date: today,
        notes: "Synced from wearable device",
      };
      await addVital(heartRateVital);
    }

    return mockData;
  } catch (error) {
    console.error("Error syncing wearable data:", error);
    return null;
  }
}

/**
 * Get heart rate data from wearable (last reading)
 */
export async function getHeartRate(): Promise<number | null> {
  try {
    const data = await syncWearableData();
    return data?.heartRate || null;
  } catch (error) {
    console.error("Error getting heart rate:", error);
    return null;
  }
}

/**
 * Get step count for today
 */
export async function getStepCount(): Promise<number | null> {
  try {
    const data = await syncWearableData();
    return data?.steps || null;
  } catch (error) {
    console.error("Error getting step count:", error);
    return null;
  }
}

/**
 * Get sleep data for last night
 */
export async function getSleepHours(): Promise<number | null> {
  try {
    const data = await syncWearableData();
    return data?.sleepHours || null;
  } catch (error) {
    console.error("Error getting sleep hours:", error);
    return null;
  }
}

/**
 * Connect to a wearable device
 */
export async function connectWearable(deviceType: "apple_watch" | "fitbit" | "google_fit"): Promise<boolean> {
  try {
    console.log(`Connecting to ${deviceType}...`);
    
    // Request permissions first
    const hasPermission = await requestHealthPermissions();
    if (!hasPermission) {
      return false;
    }

    // Mock implementation - in production, this would initiate pairing
    // For Apple Watch: HealthKit is automatically available if watch is paired
    // For Fitbit: OAuth flow to authorize access
    // For Google Fit: Google Sign-In and Fitness API authorization
    
    return true;
  } catch (error) {
    console.error(`Error connecting to ${deviceType}:`, error);
    return false;
  }
}

/**
 * Disconnect from a wearable device
 */
export async function disconnectWearable(deviceId: string): Promise<boolean> {
  try {
    console.log(`Disconnecting device ${deviceId}...`);
    
    // Mock implementation - in production, this would revoke permissions
    return true;
  } catch (error) {
    console.error(`Error disconnecting device ${deviceId}:`, error);
    return false;
  }
}

/**
 * Get last sync time for wearable data
 */
export async function getLastSyncTime(): Promise<Date | null> {
  try {
    const devices = await getConnectedDevices();
    if (devices.length === 0) {
      return null;
    }

    const lastSync = devices[0].lastSync;
    return lastSync ? new Date(lastSync) : null;
  } catch (error) {
    console.error("Error getting last sync time:", error);
    return null;
  }
}

/**
 * Format sync time for display
 */
export function formatSyncTime(date: Date | null): string {
  if (!date) {
    return "Never synced";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  } else {
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    }
  }
}
