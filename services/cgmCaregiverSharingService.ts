import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

export interface CaregiverAlert {
  id: string;
  caregiverId: string;
  caregiverName: string;
  caregiverEmail: string;
  caregiverPhone: string;
  glucoseValue: number;
  timestamp: Date;
  alertType: "high" | "low" | "critical_high" | "critical_low";
  acknowledged: boolean;
  acknowledgedAt?: Date;
}

export interface AlertThreshold {
  caregiverId: string;
  highThreshold: number;
  lowThreshold: number;
  criticalHighThreshold: number;
  criticalLowThreshold: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
}

export interface WeeklySummary {
  weekStart: Date;
  weekEnd: Date;
  averageGlucose: number;
  timeInRange: number; // percentage
  timeAboveRange: number; // percentage
  timeBelowRange: number; // percentage
  totalReadings: number;
  highAlerts: number;
  lowAlerts: number;
  glucoseVariability: number; // coefficient of variation
  trends: string[];
}

class CGMCaregiverSharingService {
  private static STORAGE_KEY_THRESHOLDS = "cgm_caregiver_thresholds";
  private static STORAGE_KEY_ALERTS = "cgm_caregiver_alerts";
  private static STORAGE_KEY_SUMMARIES = "cgm_weekly_summaries";

  /**
   * Set alert thresholds for a specific caregiver
   */
  async setAlertThresholds(threshold: AlertThreshold): Promise<void> {
    try {
      const thresholdsJson = await AsyncStorage.getItem(CGMCaregiverSharingService.STORAGE_KEY_THRESHOLDS);
      const thresholds: AlertThreshold[] = thresholdsJson ? JSON.parse(thresholdsJson) : [];

      const existingIndex = thresholds.findIndex((t) => t.caregiverId === threshold.caregiverId);
      if (existingIndex >= 0) {
        thresholds[existingIndex] = threshold;
      } else {
        thresholds.push(threshold);
      }

      await AsyncStorage.setItem(
        CGMCaregiverSharingService.STORAGE_KEY_THRESHOLDS,
        JSON.stringify(thresholds)
      );
    } catch (error) {
      console.error("Error setting alert thresholds:", error);
      throw error;
    }
  }

  /**
   * Get alert thresholds for all caregivers
   */
  async getAllThresholds(): Promise<AlertThreshold[]> {
    try {
      const thresholdsJson = await AsyncStorage.getItem(CGMCaregiverSharingService.STORAGE_KEY_THRESHOLDS);
      return thresholdsJson ? JSON.parse(thresholdsJson) : [];
    } catch (error) {
      console.error("Error getting alert thresholds:", error);
      return [];
    }
  }

  /**
   * Check glucose reading against caregiver thresholds and send alerts
   */
  async checkGlucoseAndAlert(glucoseValue: number): Promise<void> {
    try {
      const thresholds = await this.getAllThresholds();

      for (const threshold of thresholds) {
        let alertType: "high" | "low" | "critical_high" | "critical_low" | null = null;

        if (glucoseValue >= threshold.criticalHighThreshold) {
          alertType = "critical_high";
        } else if (glucoseValue >= threshold.highThreshold) {
          alertType = "high";
        } else if (glucoseValue <= threshold.criticalLowThreshold) {
          alertType = "critical_low";
        } else if (glucoseValue <= threshold.lowThreshold) {
          alertType = "low";
        }

        if (alertType) {
          await this.sendCaregiverAlert(threshold, glucoseValue, alertType);
        }
      }
    } catch (error) {
      console.error("Error checking glucose and alerting:", error);
    }
  }

  /**
   * Send alert to caregiver via configured channels
   */
  private async sendCaregiverAlert(
    threshold: AlertThreshold,
    glucoseValue: number,
    alertType: "high" | "low" | "critical_high" | "critical_low"
  ): Promise<void> {
    const alert: CaregiverAlert = {
      id: `alert_${Date.now()}_${threshold.caregiverId}`,
      caregiverId: threshold.caregiverId,
      caregiverName: "", // Would be fetched from caregiver profile
      caregiverEmail: "", // Would be fetched from caregiver profile
      caregiverPhone: "", // Would be fetched from caregiver profile
      glucoseValue,
      timestamp: new Date(),
      alertType,
      acknowledged: false,
    };

    // Save alert to history
    await this.saveAlert(alert);

    // Send notifications based on preferences
    if (threshold.pushEnabled) {
      await this.sendPushNotification(alert);
    }

    if (threshold.emailEnabled) {
      await this.sendEmailAlert(alert);
    }

    if (threshold.smsEnabled) {
      await this.sendSMSAlert(alert);
    }
  }

  /**
   * Save alert to history
   */
  private async saveAlert(alert: CaregiverAlert): Promise<void> {
    try {
      const alertsJson = await AsyncStorage.getItem(CGMCaregiverSharingService.STORAGE_KEY_ALERTS);
      const alerts: CaregiverAlert[] = alertsJson ? JSON.parse(alertsJson) : [];
      alerts.unshift(alert);

      // Keep only last 100 alerts
      if (alerts.length > 100) {
        alerts.splice(100);
      }

      await AsyncStorage.setItem(
        CGMCaregiverSharingService.STORAGE_KEY_ALERTS,
        JSON.stringify(alerts)
      );
    } catch (error) {
      console.error("Error saving alert:", error);
    }
  }

  /**
   * Send push notification to caregiver
   */
  private async sendPushNotification(alert: CaregiverAlert): Promise<void> {
    try {
      const message = this.getAlertMessage(alert);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Glucose Alert",
          body: message,
          data: { alert },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }

  /**
   * Send email alert to caregiver
   */
  private async sendEmailAlert(alert: CaregiverAlert): Promise<void> {
    // In production, this would call a backend API to send email
    console.log("Sending email alert:", alert);
  }

  /**
   * Send SMS alert to caregiver
   */
  private async sendSMSAlert(alert: CaregiverAlert): Promise<void> {
    // In production, this would call a backend API to send SMS
    console.log("Sending SMS alert:", alert);
  }

  /**
   * Get alert message based on alert type
   */
  private getAlertMessage(alert: CaregiverAlert): string {
    const { glucoseValue, alertType } = alert;

    switch (alertType) {
      case "critical_high":
        return `CRITICAL: Glucose is very high at ${glucoseValue} mg/dL. Immediate attention needed.`;
      case "high":
        return `Glucose is high at ${glucoseValue} mg/dL.`;
      case "critical_low":
        return `CRITICAL: Glucose is very low at ${glucoseValue} mg/dL. Immediate attention needed.`;
      case "low":
        return `Glucose is low at ${glucoseValue} mg/dL.`;
      default:
        return `Glucose reading: ${glucoseValue} mg/dL`;
    }
  }

  /**
   * Get all caregiver alerts
   */
  async getAllAlerts(): Promise<CaregiverAlert[]> {
    try {
      const alertsJson = await AsyncStorage.getItem(CGMCaregiverSharingService.STORAGE_KEY_ALERTS);
      return alertsJson ? JSON.parse(alertsJson) : [];
    } catch (error) {
      console.error("Error getting alerts:", error);
      return [];
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      const alerts = await this.getAllAlerts();
      const alert = alerts.find((a) => a.id === alertId);

      if (alert) {
        alert.acknowledged = true;
        alert.acknowledgedAt = new Date();

        await AsyncStorage.setItem(
          CGMCaregiverSharingService.STORAGE_KEY_ALERTS,
          JSON.stringify(alerts)
        );
      }
    } catch (error) {
      console.error("Error acknowledging alert:", error);
    }
  }

  /**
   * Generate weekly summary
   */
  async generateWeeklySummary(glucoseReadings: Array<{ value: number; timestamp: Date }>): Promise<WeeklySummary> {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter readings from last 7 days
    const weekReadings = glucoseReadings.filter(
      (r) => new Date(r.timestamp) >= weekStart && new Date(r.timestamp) <= now
    );

    if (weekReadings.length === 0) {
      return {
        weekStart,
        weekEnd: now,
        averageGlucose: 0,
        timeInRange: 0,
        timeAboveRange: 0,
        timeBelowRange: 0,
        totalReadings: 0,
        highAlerts: 0,
        lowAlerts: 0,
        glucoseVariability: 0,
        trends: [],
      };
    }

    // Calculate statistics
    const values = weekReadings.map((r) => r.value);
    const averageGlucose = values.reduce((sum, v) => sum + v, 0) / values.length;

    const TARGET_MIN = 70;
    const TARGET_MAX = 180;

    const inRange = values.filter((v) => v >= TARGET_MIN && v <= TARGET_MAX).length;
    const aboveRange = values.filter((v) => v > TARGET_MAX).length;
    const belowRange = values.filter((v) => v < TARGET_MIN).length;

    const timeInRange = (inRange / values.length) * 100;
    const timeAboveRange = (aboveRange / values.length) * 100;
    const timeBelowRange = (belowRange / values.length) * 100;

    // Calculate coefficient of variation
    const variance = values.reduce((sum, v) => sum + Math.pow(v - averageGlucose, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const glucoseVariability = (stdDev / averageGlucose) * 100;

    // Count alerts
    const highAlerts = values.filter((v) => v > TARGET_MAX).length;
    const lowAlerts = values.filter((v) => v < TARGET_MIN).length;

    // Generate trends
    const trends: string[] = [];
    if (timeInRange >= 70) {
      trends.push("Excellent glucose control this week");
    } else if (timeInRange >= 50) {
      trends.push("Good glucose control with room for improvement");
    } else {
      trends.push("Glucose control needs attention");
    }

    if (glucoseVariability > 36) {
      trends.push("High glucose variability detected");
    }

    if (lowAlerts > 5) {
      trends.push("Frequent low glucose episodes");
    }

    if (highAlerts > 10) {
      trends.push("Frequent high glucose episodes");
    }

    const summary: WeeklySummary = {
      weekStart,
      weekEnd: now,
      averageGlucose: Math.round(averageGlucose),
      timeInRange: Math.round(timeInRange),
      timeAboveRange: Math.round(timeAboveRange),
      timeBelowRange: Math.round(timeBelowRange),
      totalReadings: weekReadings.length,
      highAlerts,
      lowAlerts,
      glucoseVariability: Math.round(glucoseVariability),
      trends,
    };

    // Save summary
    await this.saveWeeklySummary(summary);

    return summary;
  }

  /**
   * Save weekly summary
   */
  private async saveWeeklySummary(summary: WeeklySummary): Promise<void> {
    try {
      const summariesJson = await AsyncStorage.getItem(CGMCaregiverSharingService.STORAGE_KEY_SUMMARIES);
      const summaries: WeeklySummary[] = summariesJson ? JSON.parse(summariesJson) : [];
      summaries.unshift(summary);

      // Keep only last 12 weeks
      if (summaries.length > 12) {
        summaries.splice(12);
      }

      await AsyncStorage.setItem(
        CGMCaregiverSharingService.STORAGE_KEY_SUMMARIES,
        JSON.stringify(summaries)
      );
    } catch (error) {
      console.error("Error saving weekly summary:", error);
    }
  }

  /**
   * Get all weekly summaries
   */
  async getAllWeeklySummaries(): Promise<WeeklySummary[]> {
    try {
      const summariesJson = await AsyncStorage.getItem(CGMCaregiverSharingService.STORAGE_KEY_SUMMARIES);
      return summariesJson ? JSON.parse(summariesJson) : [];
    } catch (error) {
      console.error("Error getting weekly summaries:", error);
      return [];
    }
  }

  /**
   * Send weekly summary email to all caregivers
   */
  async sendWeeklySummaryEmails(summary: WeeklySummary): Promise<void> {
    try {
      const thresholds = await this.getAllThresholds();

      for (const threshold of thresholds) {
        if (threshold.emailEnabled) {
          // In production, this would call a backend API to send formatted email
          console.log("Sending weekly summary email to:", threshold.caregiverId);
        }
      }
    } catch (error) {
      console.error("Error sending weekly summary emails:", error);
    }
  }
}

export default new CGMCaregiverSharingService();
