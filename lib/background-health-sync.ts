import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import HealthSyncService from "./health-sync-service";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKGROUND_HEALTH_SYNC_TASK = "background-health-sync";

// Define the background task
TaskManager.defineTask(BACKGROUND_HEALTH_SYNC_TASK, async () => {
  try {
    console.log("[Background Sync] Starting health data sync...");
    
    // Check if health sync is enabled
    const healthSyncEnabled = await AsyncStorage.getItem("healthSyncEnabled");
    if (healthSyncEnabled !== "true") {
      console.log("[Background Sync] Health sync is disabled, skipping");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Sync health data from last 7 days
    const data = await HealthSyncService.syncAllData(7);
    
    // Save sync timestamp
    await AsyncStorage.setItem("lastHealthSync", new Date().toISOString());
    
    const totalDataPoints =
      data.weight.length +
      data.bloodPressure.length +
      data.heartRate.length +
      data.glucose.length;

    console.log(`[Background Sync] Successfully synced ${totalDataPoints} data points`);
    
    return totalDataPoints > 0
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error("[Background Sync] Error:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const BackgroundHealthSync = {
  /**
   * Register the background health sync task
   * @param intervalMinutes - Interval in minutes (minimum 15 minutes on iOS)
   */
  async register(intervalMinutes: number = 360) {
    try {
      // Check if task is already registered
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_HEALTH_SYNC_TASK
      );

      if (isRegistered) {
        console.log("[Background Sync] Task already registered");
        return;
      }

      // Register background fetch task
      await BackgroundFetch.registerTaskAsync(BACKGROUND_HEALTH_SYNC_TASK, {
        minimumInterval: intervalMinutes * 60, // Convert to seconds
        stopOnTerminate: false, // Continue after app termination
        startOnBoot: true, // Start on device boot
      });

      console.log(`[Background Sync] Registered with ${intervalMinutes} minute interval`);
    } catch (error) {
      console.error("[Background Sync] Registration error:", error);
    }
  },

  /**
   * Unregister the background health sync task
   */
  async unregister() {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_HEALTH_SYNC_TASK);
      console.log("[Background Sync] Unregistered successfully");
    } catch (error) {
      console.error("[Background Sync] Unregistration error:", error);
    }
  },

  /**
   * Check if background sync is registered
   */
  async isRegistered(): Promise<boolean> {
    return await TaskManager.isTaskRegisteredAsync(BACKGROUND_HEALTH_SYNC_TASK);
  },

  /**
   * Get background fetch status
   */
  async getStatus(): Promise<BackgroundFetch.BackgroundFetchStatus | null> {
    return await BackgroundFetch.getStatusAsync();
  },
};
