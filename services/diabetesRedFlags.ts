import * as Notifications from "expo-notifications";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CGMService, { type CGMReading } from "./cgmService";

/**
 * Diabetes Red Flag Detection Service
 * 
 * Monitors glucose readings and insulin delivery for critical conditions:
 * - Hypoglycemia (<70 mg/dL) - Critical
 * - Severe hypoglycemia (<54 mg/dL) - Emergency
 * - Hyperglycemia (>250 mg/dL) - Warning
 * - Severe hyperglycemia (>400 mg/dL) - Critical
 * - Rapid glucose drops (>50 mg/dL in 15 min) - Critical
 * - Sensor errors and calibration needs
 * 
 * Provides voice notifications for critical alerts to ensure seniors are aware.
 */

export interface DiabetesRedFlag {
  id: string;
  timestamp: Date;
  type: "hypoglycemia" | "severe_hypoglycemia" | "hyperglycemia" | "severe_hyperglycemia" | "rapid_drop" | "sensor_error";
  severity: "warning" | "critical" | "emergency";
  glucose: number;
  message: string;
  recommendation: string;
  voiceAlert: boolean;
}

class DiabetesRedFlagService {
  private static instance: DiabetesRedFlagService;
  private redFlags: DiabetesRedFlag[] = [];
  private lastAlertTime: Map<string, number> = new Map();
  private alertCooldown = 15 * 60 * 1000; // 15 minutes

  private constructor() {
    this.loadData();
    this.startMonitoring();
  }

  static getInstance(): DiabetesRedFlagService {
    if (!DiabetesRedFlagService.instance) {
      DiabetesRedFlagService.instance = new DiabetesRedFlagService();
    }
    return DiabetesRedFlagService.instance;
  }

  private async loadData() {
    try {
      const data = await AsyncStorage.getItem("diabetes_red_flags");
      if (data) {
        this.redFlags = JSON.parse(data).map((flag: any) => ({
          ...flag,
          timestamp: new Date(flag.timestamp),
        }));
      }
    } catch (error) {
      console.error("Error loading diabetes red flags:", error);
    }
  }

  private async saveData() {
    try {
      await AsyncStorage.setItem("diabetes_red_flags", JSON.stringify(this.redFlags));
    } catch (error) {
      console.error("Error saving diabetes red flags:", error);
    }
  }

  private startMonitoring() {
    // Subscribe to real-time glucose updates
    CGMService.subscribe((reading) => {
      this.checkGlucoseReading(reading);
    });
  }

  private async checkGlucoseReading(reading: CGMReading) {
    const { glucose } = reading;

    // Check for severe hypoglycemia (<54 mg/dL)
    if (glucose < 54) {
      await this.createRedFlag({
        type: "severe_hypoglycemia",
        severity: "emergency",
        glucose,
        message: `EMERGENCY: Your glucose is critically low at ${glucose} mg/dL`,
        recommendation: "Consume 15-20 grams of fast-acting carbs immediately (glucose tablets, juice, or candy). Call 911 if you feel confused or unable to swallow.",
        voiceAlert: true,
      });
    }
    // Check for hypoglycemia (<70 mg/dL)
    else if (glucose < 70) {
      await this.createRedFlag({
        type: "hypoglycemia",
        severity: "critical",
        glucose,
        message: `ALERT: Your glucose is low at ${glucose} mg/dL`,
        recommendation: "Consume 15 grams of fast-acting carbs (4 glucose tablets, 4 oz juice, or 1 tablespoon honey). Recheck in 15 minutes.",
        voiceAlert: true,
      });
    }

    // Check for severe hyperglycemia (>400 mg/dL)
    if (glucose > 400) {
      await this.createRedFlag({
        type: "severe_hyperglycemia",
        severity: "critical",
        glucose,
        message: `CRITICAL: Your glucose is very high at ${glucose} mg/dL`,
        recommendation: "Check for ketones immediately. Contact your doctor or go to the ER if ketones are moderate or high. Drink water and take correction insulin as prescribed.",
        voiceAlert: true,
      });
    }
    // Check for hyperglycemia (>250 mg/dL)
    else if (glucose > 250) {
      await this.createRedFlag({
        type: "hyperglycemia",
        severity: "warning",
        glucose,
        message: `WARNING: Your glucose is elevated at ${glucose} mg/dL`,
        recommendation: "Check for ketones. Drink water, take correction insulin if prescribed, and avoid exercise until glucose is below 250 mg/dL.",
        voiceAlert: false,
      });
    }

    // Check for rapid glucose drop
    const recentReadings = CGMService.getRecentReadings(4); // Last 15 minutes (4 readings at 5-min intervals)
    if (recentReadings.length >= 4) {
      const oldestReading = recentReadings[0];
      const glucoseDrop = oldestReading.glucose - glucose;
      
      if (glucoseDrop > 50) {
        await this.createRedFlag({
          type: "rapid_drop",
          severity: "critical",
          glucose,
          message: `ALERT: Your glucose dropped ${glucoseDrop} mg/dL in 15 minutes`,
          recommendation: "Your glucose is falling rapidly. Consume fast-acting carbs now to prevent severe hypoglycemia. Monitor closely.",
          voiceAlert: true,
        });
      }
    }
  }

  private async createRedFlag(flag: Omit<DiabetesRedFlag, "id" | "timestamp">) {
    // Check cooldown to avoid duplicate alerts
    const lastAlert = this.lastAlertTime.get(flag.type);
    const now = Date.now();
    
    if (lastAlert && now - lastAlert < this.alertCooldown) {
      return; // Skip if within cooldown period
    }

    const redFlag: DiabetesRedFlag = {
      ...flag,
      id: `diabetes_flag_${Date.now()}`,
      timestamp: new Date(),
    };

    this.redFlags.push(redFlag);
    this.lastAlertTime.set(flag.type, now);

    // Keep only last 100 red flags
    if (this.redFlags.length > 100) {
      this.redFlags = this.redFlags.slice(-100);
    }

    await this.saveData();

    // Send push notification
    await this.sendPushNotification(redFlag);

    // Send voice alert for critical/emergency
    if (flag.voiceAlert) {
      await this.sendVoiceAlert(redFlag);
    }
  }

  private async sendPushNotification(flag: DiabetesRedFlag) {
    const priorityMap = {
      warning: Notifications.AndroidNotificationPriority.HIGH,
      critical: Notifications.AndroidNotificationPriority.MAX,
      emergency: Notifications.AndroidNotificationPriority.MAX,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: flag.message,
        body: flag.recommendation,
        sound: flag.severity === "emergency" || flag.severity === "critical" ? "default" : undefined,
        priority: priorityMap[flag.severity],
        categoryIdentifier: "diabetes_alert",
      },
      trigger: null, // Immediate
    });
  }

  private async sendVoiceAlert(flag: DiabetesRedFlag) {
    try {
      // Stop any ongoing speech
      await Speech.stop();

      // Speak the alert message
      const voiceMessage = `${flag.message}. ${flag.recommendation}`;
      
      await Speech.speak(voiceMessage, {
        language: "en-US",
        pitch: 1.0,
        rate: 0.85, // Slightly slower for seniors
        volume: 1.0,
      });
    } catch (error) {
      console.error("Error sending voice alert:", error);
    }
  }

  // Public API
  getRedFlags(limit: number = 50): DiabetesRedFlag[] {
    return this.redFlags.slice(-limit).reverse();
  }

  getRedFlagsByDateRange(startDate: Date, endDate: Date): DiabetesRedFlag[] {
    return this.redFlags.filter(
      (flag) => flag.timestamp >= startDate && flag.timestamp <= endDate
    );
  }

  getCriticalRedFlags(): DiabetesRedFlag[] {
    return this.redFlags.filter(
      (flag) => flag.severity === "critical" || flag.severity === "emergency"
    );
  }

  async clearRedFlags() {
    this.redFlags = [];
    await this.saveData();
  }

  async acknowledgeRedFlag(flagId: string) {
    // Remove acknowledged flag
    this.redFlags = this.redFlags.filter((flag) => flag.id !== flagId);
    await this.saveData();
  }

  // Sensor Error Detection
  async reportSensorError(errorType: "calibration_needed" | "sensor_failed" | "signal_loss") {
    const messages = {
      calibration_needed: "Your CGM sensor needs calibration",
      sensor_failed: "Your CGM sensor has failed and needs replacement",
      signal_loss: "CGM signal lost - check sensor connection",
    };

    const recommendations = {
      calibration_needed: "Perform a fingerstick blood glucose test and calibrate your sensor according to manufacturer instructions.",
      sensor_failed: "Replace your CGM sensor immediately. Use fingerstick testing until new sensor is active.",
      signal_loss: "Ensure your phone is within range of the sensor. Check that the sensor is properly attached. Restart the CGM app if needed.",
    };

    await this.createRedFlag({
      type: "sensor_error",
      severity: "warning",
      glucose: 0,
      message: messages[errorType],
      recommendation: recommendations[errorType],
      voiceAlert: false,
    });
  }

  // Statistics
  getRedFlagStats(days: number = 30): {
    totalFlags: number;
    hypoglycemiaCount: number;
    hyperglycemiaCount: number;
    rapidDropCount: number;
    averageGlucoseAtFlag: number;
  } {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const recentFlags = this.getRedFlagsByDateRange(startDate, new Date());
    
    const hypoglycemiaCount = recentFlags.filter(
      (f) => f.type === "hypoglycemia" || f.type === "severe_hypoglycemia"
    ).length;
    
    const hyperglycemiaCount = recentFlags.filter(
      (f) => f.type === "hyperglycemia" || f.type === "severe_hyperglycemia"
    ).length;
    
    const rapidDropCount = recentFlags.filter((f) => f.type === "rapid_drop").length;
    
    const totalGlucose = recentFlags.reduce((sum, f) => sum + f.glucose, 0);
    const averageGlucoseAtFlag = recentFlags.length > 0 ? totalGlucose / recentFlags.length : 0;
    
    return {
      totalFlags: recentFlags.length,
      hypoglycemiaCount,
      hyperglycemiaCount,
      rapidDropCount,
      averageGlucoseAtFlag: Math.round(averageGlucoseAtFlag),
    };
  }
}

export default DiabetesRedFlagService.getInstance();
