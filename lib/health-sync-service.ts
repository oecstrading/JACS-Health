/**
 * Health Data Sync Service
 * 
 * Integrates with Apple Health (iOS) and Google Fit (Android) to sync health data
 * from connected medical devices and apps.
 */

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Type definitions for health data
export interface HealthDataPoint {
  type: "weight" | "blood_pressure" | "heart_rate" | "glucose" | "steps" | "oxygen_saturation" | "temperature";
  value: number | { systolic: number; diastolic: number; pulse?: number };
  unit: string;
  timestamp: Date;
  source: string;
}

export interface HealthSyncStatus {
  lastSync: Date | null;
  isEnabled: boolean;
  permissionsGranted: boolean;
}

class HealthSyncService {
  private static instance: HealthSyncService;
  private appleHealthKit: any = null;
  private googleFit: any = null;

  private constructor() {
    this.initializeHealthKits();
  }

  public static getInstance(): HealthSyncService {
    if (!HealthSyncService.instance) {
      HealthSyncService.instance = new HealthSyncService();
    }
    return HealthSyncService.instance;
  }

  private async initializeHealthKits() {
    if (Platform.OS === "ios") {
      try {
        // Dynamically import Apple HealthKit
        const AppleHealthKit = require("react-native-health").default;
        this.appleHealthKit = AppleHealthKit;
      } catch (error) {
        console.log("Apple HealthKit not available:", error);
      }
    } else if (Platform.OS === "android") {
      try {
        // Google Fit integration would go here
        // const GoogleFit = require("react-native-google-fit");
        // this.googleFit = GoogleFit;
        console.log("Google Fit integration placeholder");
      } catch (error) {
        console.log("Google Fit not available:", error);
      }
    }
  }

  /**
   * Request permissions to access health data
   */
  public async requestPermissions(): Promise<boolean> {
    if (Platform.OS === "ios" && this.appleHealthKit) {
      return new Promise((resolve) => {
        const permissions = {
          permissions: {
            read: [
              "Weight",
              "BloodPressureSystolic",
              "BloodPressureDiastolic",
              "HeartRate",
              "BloodGlucose",
              "StepCount",
              "OxygenSaturation",
              "BodyTemperature",
            ],
            write: [],
          },
        };

        this.appleHealthKit.initHealthKit(permissions, (error: any) => {
          if (error) {
            console.error("Error requesting Apple Health permissions:", error);
            resolve(false);
          } else {
            this.savePermissionStatus(true);
            resolve(true);
          }
        });
      });
    } else if (Platform.OS === "android") {
      // Google Fit permission request would go here
      console.log("Google Fit permissions placeholder");
      return true;
    }

    return false;
  }

  /**
   * Check if permissions are granted
   */
  public async checkPermissions(): Promise<boolean> {
    try {
      const status = await AsyncStorage.getItem("health_permissions_granted");
      return status === "true";
    } catch (error) {
      return false;
    }
  }

  private async savePermissionStatus(granted: boolean) {
    try {
      await AsyncStorage.setItem("health_permissions_granted", granted.toString());
    } catch (error) {
      console.error("Error saving permission status:", error);
    }
  }

  /**
   * Sync weight data from health apps
   */
  public async syncWeightData(daysBack: number = 7): Promise<HealthDataPoint[]> {
    if (Platform.OS === "ios" && this.appleHealthKit) {
      return new Promise((resolve) => {
        const options = {
          startDate: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          ascending: false,
          limit: 100,
        };

        this.appleHealthKit.getWeightSamples(options, (error: any, results: any[]) => {
          if (error) {
            console.error("Error fetching weight data:", error);
            resolve([]);
          } else {
            const dataPoints: HealthDataPoint[] = results.map((sample) => ({
              type: "weight",
              value: sample.value,
              unit: "lbs",
              timestamp: new Date(sample.startDate),
              source: "Apple Health",
            }));
            resolve(dataPoints);
          }
        });
      });
    }

    return [];
  }

  /**
   * Sync blood pressure data from health apps
   */
  public async syncBloodPressureData(daysBack: number = 7): Promise<HealthDataPoint[]> {
    if (Platform.OS === "ios" && this.appleHealthKit) {
      return new Promise((resolve) => {
        const options = {
          startDate: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          ascending: false,
          limit: 100,
        };

        this.appleHealthKit.getBloodPressureSamples(options, (error: any, results: any[]) => {
          if (error) {
            console.error("Error fetching blood pressure data:", error);
            resolve([]);
          } else {
            const dataPoints: HealthDataPoint[] = results.map((sample) => ({
              type: "blood_pressure",
              value: {
                systolic: sample.bloodPressureSystolicValue,
                diastolic: sample.bloodPressureDiastolicValue,
              },
              unit: "mmHg",
              timestamp: new Date(sample.startDate),
              source: "Apple Health",
            }));
            resolve(dataPoints);
          }
        });
      });
    }

    return [];
  }

  /**
   * Sync heart rate data from health apps
   */
  public async syncHeartRateData(daysBack: number = 7): Promise<HealthDataPoint[]> {
    if (Platform.OS === "ios" && this.appleHealthKit) {
      return new Promise((resolve) => {
        const options = {
          startDate: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          ascending: false,
          limit: 100,
        };

        this.appleHealthKit.getHeartRateSamples(options, (error: any, results: any[]) => {
          if (error) {
            console.error("Error fetching heart rate data:", error);
            resolve([]);
          } else {
            const dataPoints: HealthDataPoint[] = results.map((sample) => ({
              type: "heart_rate",
              value: sample.value,
              unit: "bpm",
              timestamp: new Date(sample.startDate),
              source: "Apple Health",
            }));
            resolve(dataPoints);
          }
        });
      });
    }

    return [];
  }

  /**
   * Sync glucose data from health apps
   */
  public async syncGlucoseData(daysBack: number = 7): Promise<HealthDataPoint[]> {
    if (Platform.OS === "ios" && this.appleHealthKit) {
      return new Promise((resolve) => {
        const options = {
          startDate: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          ascending: false,
          limit: 100,
        };

        this.appleHealthKit.getBloodGlucoseSamples(options, (error: any, results: any[]) => {
          if (error) {
            console.error("Error fetching glucose data:", error);
            resolve([]);
          } else {
            const dataPoints: HealthDataPoint[] = results.map((sample) => ({
              type: "glucose",
              value: sample.value,
              unit: "mg/dL",
              timestamp: new Date(sample.startDate),
              source: "Apple Health",
            }));
            resolve(dataPoints);
          }
        });
      });
    }

    return [];
  }

  /**
   * Sync all health data
   */
  public async syncAllData(daysBack: number = 7): Promise<{
    weight: HealthDataPoint[];
    bloodPressure: HealthDataPoint[];
    heartRate: HealthDataPoint[];
    glucose: HealthDataPoint[];
  }> {
    const [weight, bloodPressure, heartRate, glucose] = await Promise.all([
      this.syncWeightData(daysBack),
      this.syncBloodPressureData(daysBack),
      this.syncHeartRateData(daysBack),
      this.syncGlucoseData(daysBack),
    ]);

    // Update last sync timestamp
    await this.updateLastSyncTime();

    return {
      weight,
      bloodPressure,
      heartRate,
      glucose,
    };
  }

  /**
   * Get sync status
   */
  public async getSyncStatus(): Promise<HealthSyncStatus> {
    try {
      const lastSyncStr = await AsyncStorage.getItem("health_last_sync");
      const permissionsGranted = await this.checkPermissions();

      return {
        lastSync: lastSyncStr ? new Date(lastSyncStr) : null,
        isEnabled: permissionsGranted,
        permissionsGranted,
      };
    } catch (error) {
      console.error("Error getting sync status:", error);
      return {
        lastSync: null,
        isEnabled: false,
        permissionsGranted: false,
      };
    }
  }

  private async updateLastSyncTime() {
    try {
      await AsyncStorage.setItem("health_last_sync", new Date().toISOString());
    } catch (error) {
      console.error("Error updating last sync time:", error);
    }
  }
}

export default HealthSyncService.getInstance();
