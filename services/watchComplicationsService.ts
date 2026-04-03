/**
 * Apple Watch Complications Service
 * 
 * Provides data and functionality for Apple Watch complications including:
 * - Glucose level display
 * - Medication reminders
 * - Quick-log actions
 * - Real-time health data sync
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

export interface ComplicationData {
  glucose: {
    value: number;
    trend: "rising" | "falling" | "stable";
    timestamp: Date;
    unit: "mg/dL" | "mmol/L";
  };
  medication: {
    nextDose: string;
    timeUntil: string;
    medicationName: string;
  };
  quickStats: {
    stepsToday: number;
    medicationsTaken: number;
    vitalsLogged: number;
  };
}

export interface WatchComplication {
  id: string;
  type: "circular" | "modular" | "infograph" | "graphic_corner" | "graphic_circular";
  data: ComplicationData;
  lastUpdated: Date;
}

class WatchComplicationsService {
  private static instance: WatchComplicationsService;
  private updateInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {}

  static getInstance(): WatchComplicationsService {
    if (!WatchComplicationsService.instance) {
      WatchComplicationsService.instance = new WatchComplicationsService();
    }
    return WatchComplicationsService.instance;
  }

  /**
   * Initialize watch complications with background updates
   */
  async initialize(): Promise<void> {
    // Start background updates every 15 minutes
    this.startBackgroundUpdates();
    
    // Register for push notifications to update complications
    await this.registerForNotifications();
  }

  /**
   * Get current complication data
   */
  async getComplicationData(): Promise<ComplicationData> {
    const [glucoseData, medicationData, statsData] = await Promise.all([
      this.getLatestGlucose(),
      this.getNextMedication(),
      this.getTodayStats(),
    ]);

    return {
      glucose: glucoseData,
      medication: medicationData,
      quickStats: statsData,
    };
  }

  /**
   * Get latest glucose reading
   */
  private async getLatestGlucose(): Promise<ComplicationData["glucose"]> {
    try {
      const cgmDataStr = await AsyncStorage.getItem("cgm_data");
      if (!cgmDataStr) {
        return {
          value: 0,
          trend: "stable",
          timestamp: new Date(),
          unit: "mg/dL",
        };
      }

      const cgmData = JSON.parse(cgmDataStr);
      const latestReading = cgmData.readings[cgmData.readings.length - 1];

      return {
        value: latestReading.glucose,
        trend: this.calculateTrend(cgmData.readings),
        timestamp: new Date(latestReading.timestamp),
        unit: "mg/dL",
      };
    } catch (error) {
      console.error("Error getting glucose data:", error);
      return {
        value: 0,
        trend: "stable",
        timestamp: new Date(),
        unit: "mg/dL",
      };
    }
  }

  /**
   * Calculate glucose trend from recent readings
   */
  private calculateTrend(readings: any[]): "rising" | "falling" | "stable" {
    if (readings.length < 3) return "stable";

    const recent = readings.slice(-3);
    const changes = recent.map((r, i) => i > 0 ? r.glucose - recent[i - 1].glucose : 0);
    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;

    if (avgChange > 2) return "rising";
    if (avgChange < -2) return "falling";
    return "stable";
  }

  /**
   * Get next medication due
   */
  private async getNextMedication(): Promise<ComplicationData["medication"]> {
    try {
      const medicationsStr = await AsyncStorage.getItem("medications");
      if (!medicationsStr) {
        return {
          nextDose: "No medications",
          timeUntil: "",
          medicationName: "",
        };
      }

      const medications = JSON.parse(medicationsStr);
      const now = new Date();
      
      // Find next medication due
      let nextMed = null;
      let minTimeDiff = Infinity;

      for (const med of medications) {
        for (const time of med.times) {
          const [hours, minutes] = time.split(":").map(Number);
          const medTime = new Date();
          medTime.setHours(hours, minutes, 0, 0);

          if (medTime < now) {
            medTime.setDate(medTime.getDate() + 1);
          }

          const timeDiff = medTime.getTime() - now.getTime();
          if (timeDiff < minTimeDiff) {
            minTimeDiff = timeDiff;
            nextMed = { ...med, dueTime: medTime };
          }
        }
      }

      if (!nextMed) {
        return {
          nextDose: "No medications",
          timeUntil: "",
          medicationName: "",
        };
      }

      const hoursUntil = Math.floor(minTimeDiff / (1000 * 60 * 60));
      const minutesUntil = Math.floor((minTimeDiff % (1000 * 60 * 60)) / (1000 * 60));

      return {
        nextDose: nextMed.dueTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        timeUntil: hoursUntil > 0 ? `${hoursUntil}h ${minutesUntil}m` : `${minutesUntil}m`,
        medicationName: nextMed.name,
      };
    } catch (error) {
      console.error("Error getting medication data:", error);
      return {
        nextDose: "Error",
        timeUntil: "",
        medicationName: "",
      };
    }
  }

  /**
   * Get today's quick stats
   */
  private async getTodayStats(): Promise<ComplicationData["quickStats"]> {
    try {
      const [stepsStr, medicationsStr, vitalsStr] = await Promise.all([
        AsyncStorage.getItem("steps_today"),
        AsyncStorage.getItem("medications_taken_today"),
        AsyncStorage.getItem("vitals_logged_today"),
      ]);

      return {
        stepsToday: stepsStr ? parseInt(stepsStr) : 0,
        medicationsTaken: medicationsStr ? parseInt(medicationsStr) : 0,
        vitalsLogged: vitalsStr ? parseInt(vitalsStr) : 0,
      };
    } catch (error) {
      console.error("Error getting stats:", error);
      return {
        stepsToday: 0,
        medicationsTaken: 0,
        vitalsLogged: 0,
      };
    }
  }

  /**
   * Start background updates for complications
   */
  private startBackgroundUpdates(): void {
    // Update every 15 minutes
    this.updateInterval = setInterval(async () => {
      await this.updateComplications();
    }, 15 * 60 * 1000);
  }

  /**
   * Update all watch complications
   */
  async updateComplications(): Promise<void> {
    try {
      const data = await this.getComplicationData();
      
      // Store for watch to retrieve
      await AsyncStorage.setItem("watch_complication_data", JSON.stringify(data));
      
      // Send push notification to watch if critical
      if (data.glucose.value < 70 || data.glucose.value > 180) {
        await this.sendCriticalAlert(data);
      }
    } catch (error) {
      console.error("Error updating complications:", error);
    }
  }

  /**
   * Send critical alert to watch
   */
  private async sendCriticalAlert(data: ComplicationData): Promise<void> {
    let message = "";
    if (data.glucose.value < 70) {
      message = `Low Glucose Alert: ${data.glucose.value} mg/dL`;
    } else if (data.glucose.value > 180) {
      message = `High Glucose Alert: ${data.glucose.value} mg/dL`;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Health Alert",
        body: message,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });
  }

  /**
   * Register for push notifications
   */
  private async registerForNotifications(): Promise<void> {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.warn("Notification permissions not granted");
    }
  }

  /**
   * Log medication from watch
   */
  async logMedicationFromWatch(medicationId: string): Promise<void> {
    try {
      const medicationsStr = await AsyncStorage.getItem("medications");
      if (!medicationsStr) return;

      const medications = JSON.parse(medicationsStr);
      const medication = medications.find((m: any) => m.id === medicationId);

      if (medication) {
        const logEntry = {
          medicationId,
          timestamp: new Date().toISOString(),
          source: "apple_watch",
        };

        const logsStr = await AsyncStorage.getItem("medication_logs");
        const logs = logsStr ? JSON.parse(logsStr) : [];
        logs.push(logEntry);

        await AsyncStorage.setItem("medication_logs", JSON.stringify(logs));

        // Update today's count
        const countStr = await AsyncStorage.getItem("medications_taken_today");
        const count = countStr ? parseInt(countStr) : 0;
        await AsyncStorage.setItem("medications_taken_today", (count + 1).toString());

        // Update complications
        await this.updateComplications();
      }
    } catch (error) {
      console.error("Error logging medication from watch:", error);
    }
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

// Lazy singleton — defers AsyncStorage/window access until first use (fixes SSR build errors)
let _instance: WatchComplicationsService | null = null;
const _lazy = new Proxy({} as WatchComplicationsService, {
  get(_: WatchComplicationsService, prop: string | symbol) {
    if (!_instance) _instance = WatchComplicationsService.getInstance();
    return (_instance as any)[prop];
  },
  set(_: WatchComplicationsService, prop: string | symbol, value: unknown) {
    if (!_instance) _instance = WatchComplicationsService.getInstance();
    (_instance as any)[prop] = value;
    return true;
  },
});
export default _lazy;
