/**
 * Trend Alerts Module
 * 
 * Monitors vitals for threshold violations and triggers push notifications
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

export interface VitalsThreshold {
  id: string;
  type: "blood_pressure_high" | "blood_pressure_low" | "heart_rate_high" | "heart_rate_low" | "weight_rapid_gain" | "weight_rapid_loss";
  enabled: boolean;
  value: number | { systolic: number; diastolic: number };
  consecutiveDays: number; // Number of consecutive days before alert
  lastAlertDate?: string;
}

export interface TrendAlert {
  id: string;
  type: VitalsThreshold["type"];
  severity: "warning" | "critical";
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

const THRESHOLDS_KEY = "vitals_thresholds";
const ALERTS_KEY = "trend_alerts";

// Default thresholds
const DEFAULT_THRESHOLDS: VitalsThreshold[] = [
  {
    id: "bp_high",
    type: "blood_pressure_high",
    enabled: true,
    value: { systolic: 140, diastolic: 90 },
    consecutiveDays: 3,
  },
  {
    id: "bp_low",
    type: "blood_pressure_low",
    enabled: true,
    value: { systolic: 90, diastolic: 60 },
    consecutiveDays: 2,
  },
  {
    id: "hr_high",
    type: "heart_rate_high",
    enabled: true,
    value: 100,
    consecutiveDays: 3,
  },
  {
    id: "hr_low",
    type: "heart_rate_low",
    enabled: true,
    value: 50,
    consecutiveDays: 2,
  },
  {
    id: "weight_gain",
    type: "weight_rapid_gain",
    enabled: true,
    value: 5, // lbs in 7 days
    consecutiveDays: 1,
  },
  {
    id: "weight_loss",
    type: "weight_rapid_loss",
    enabled: true,
    value: 5, // lbs in 7 days
    consecutiveDays: 1,
  },
];

/**
 * Get vitals thresholds
 */
export async function getVitalsThresholds(): Promise<VitalsThreshold[]> {
  try {
    const json = await AsyncStorage.getItem(THRESHOLDS_KEY);
    if (json) {
      return JSON.parse(json);
    } else {
      // Initialize with defaults
      await AsyncStorage.setItem(THRESHOLDS_KEY, JSON.stringify(DEFAULT_THRESHOLDS));
      return DEFAULT_THRESHOLDS;
    }
  } catch (error) {
    console.error("Error getting vitals thresholds:", error);
    return DEFAULT_THRESHOLDS;
  }
}

/**
 * Update vitals threshold
 */
export async function updateVitalsThreshold(id: string, updates: Partial<VitalsThreshold>): Promise<void> {
  try {
    const thresholds = await getVitalsThresholds();
    const index = thresholds.findIndex((t) => t.id === id);
    if (index !== -1) {
      thresholds[index] = { ...thresholds[index], ...updates };
      await AsyncStorage.setItem(THRESHOLDS_KEY, JSON.stringify(thresholds));
    }
  } catch (error) {
    console.error("Error updating vitals threshold:", error);
    throw error;
  }
}

/**
 * Get trend alerts
 */
export async function getTrendAlerts(): Promise<TrendAlert[]> {
  try {
    const json = await AsyncStorage.getItem(ALERTS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error("Error getting trend alerts:", error);
    return [];
  }
}

/**
 * Add trend alert
 */
async function addTrendAlert(alert: Omit<TrendAlert, "id" | "timestamp" | "acknowledged">): Promise<void> {
  try {
    const alerts = await getTrendAlerts();
    const newAlert: TrendAlert = {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };
    alerts.push(newAlert);
    
    // Keep only last 30 days of alerts
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const filtered = alerts.filter((a) => new Date(a.timestamp) >= thirtyDaysAgo);
    
    await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error adding trend alert:", error);
    throw error;
  }
}

/**
 * Acknowledge trend alert
 */
export async function acknowledgeTrendAlert(id: string): Promise<void> {
  try {
    const alerts = await getTrendAlerts();
    const index = alerts.findIndex((a) => a.id === id);
    if (index !== -1) {
      alerts[index].acknowledged = true;
      await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    }
  } catch (error) {
    console.error("Error acknowledging trend alert:", error);
    throw error;
  }
}

/**
 * Monitor vitals and trigger alerts
 */
export async function monitorVitalsAndAlert(vitalsData: {
  bloodPressure: Array<{ systolic: number; diastolic: number; timestamp: string }>;
  heartRate: Array<{ heartRate: number; timestamp: string }>;
  weight: Array<{ weight: number; timestamp: string }>;
}): Promise<TrendAlert[]> {
  const newAlerts: TrendAlert[] = [];

  try {
    const thresholds = await getVitalsThresholds();

    // Check blood pressure high
    const bpHighThreshold = thresholds.find((t) => t.type === "blood_pressure_high" && t.enabled);
    if (bpHighThreshold && typeof bpHighThreshold.value === "object") {
      const recentBP = vitalsData.bloodPressure.slice(-bpHighThreshold.consecutiveDays);
      const allHigh = recentBP.every(
        (r) =>
          typeof bpHighThreshold.value === "object" &&
          (r.systolic >= bpHighThreshold.value.systolic ||
          r.diastolic >= bpHighThreshold.value.diastolic)
      );

      if (allHigh && recentBP.length >= bpHighThreshold.consecutiveDays) {
        const shouldAlert = await shouldSendAlert(bpHighThreshold);
        if (shouldAlert) {
          const alert = {
            type: "blood_pressure_high" as const,
            severity: "critical" as const,
            title: "High Blood Pressure Alert",
            message: `Your blood pressure has been above ${bpHighThreshold.value.systolic}/${bpHighThreshold.value.diastolic} mmHg for ${bpHighThreshold.consecutiveDays} consecutive days. Contact your doctor.`,
          };
          await addTrendAlert(alert);
          await sendPushNotification(alert.title, alert.message);
          await updateLastAlertDate(bpHighThreshold.id);
          newAlerts.push({ ...alert, id: Date.now().toString(), timestamp: new Date().toISOString(), acknowledged: false });
        }
      }
    }

    // Check blood pressure low
    const bpLowThreshold = thresholds.find((t) => t.type === "blood_pressure_low" && t.enabled);
    if (bpLowThreshold && typeof bpLowThreshold.value === "object") {
      const recentBP = vitalsData.bloodPressure.slice(-bpLowThreshold.consecutiveDays);
      const allLow = recentBP.every(
        (r) =>
          typeof bpLowThreshold.value === "object" &&
          r.systolic <= bpLowThreshold.value.systolic &&
          r.diastolic <= bpLowThreshold.value.diastolic
      );

      if (allLow && recentBP.length >= bpLowThreshold.consecutiveDays) {
        const shouldAlert = await shouldSendAlert(bpLowThreshold);
        if (shouldAlert) {
          const alert = {
            type: "blood_pressure_low" as const,
            severity: "warning" as const,
            title: "Low Blood Pressure Alert",
            message: `Your blood pressure has been below ${bpLowThreshold.value.systolic}/${bpLowThreshold.value.diastolic} mmHg for ${bpLowThreshold.consecutiveDays} consecutive days. Monitor for dizziness or fatigue.`,
          };
          await addTrendAlert(alert);
          await sendPushNotification(alert.title, alert.message);
          await updateLastAlertDate(bpLowThreshold.id);
          newAlerts.push({ ...alert, id: Date.now().toString(), timestamp: new Date().toISOString(), acknowledged: false });
        }
      }
    }

    // Check heart rate high
    const hrHighThreshold = thresholds.find((t) => t.type === "heart_rate_high" && t.enabled);
    if (hrHighThreshold && typeof hrHighThreshold.value === "number") {
      const recentHR = vitalsData.heartRate.slice(-hrHighThreshold.consecutiveDays);
      const allHigh = recentHR.every((r) => typeof hrHighThreshold.value === "number" && r.heartRate >= hrHighThreshold.value);

      if (allHigh && recentHR.length >= hrHighThreshold.consecutiveDays) {
        const shouldAlert = await shouldSendAlert(hrHighThreshold);
        if (shouldAlert) {
          const alert = {
            type: "heart_rate_high" as const,
            severity: "warning" as const,
            title: "Elevated Heart Rate Alert",
            message: `Your resting heart rate has been above ${hrHighThreshold.value} bpm for ${hrHighThreshold.consecutiveDays} consecutive days. Consider reducing stress and caffeine.`,
          };
          await addTrendAlert(alert);
          await sendPushNotification(alert.title, alert.message);
          await updateLastAlertDate(hrHighThreshold.id);
          newAlerts.push({ ...alert, id: Date.now().toString(), timestamp: new Date().toISOString(), acknowledged: false });
        }
      }
    }

    // Check heart rate low
    const hrLowThreshold = thresholds.find((t) => t.type === "heart_rate_low" && t.enabled);
    if (hrLowThreshold && typeof hrLowThreshold.value === "number") {
      const recentHR = vitalsData.heartRate.slice(-hrLowThreshold.consecutiveDays);
      const allLow = recentHR.every((r) => typeof hrLowThreshold.value === "number" && r.heartRate <= hrLowThreshold.value);

      if (allLow && recentHR.length >= hrLowThreshold.consecutiveDays) {
        const shouldAlert = await shouldSendAlert(hrLowThreshold);
        if (shouldAlert) {
          const alert = {
            type: "heart_rate_low" as const,
            severity: "warning" as const,
            title: "Low Heart Rate Alert",
            message: `Your resting heart rate has been below ${hrLowThreshold.value} bpm for ${hrLowThreshold.consecutiveDays} consecutive days. If not an athlete, consult your doctor.`,
          };
          await addTrendAlert(alert);
          await sendPushNotification(alert.title, alert.message);
          await updateLastAlertDate(hrLowThreshold.id);
          newAlerts.push({ ...alert, id: Date.now().toString(), timestamp: new Date().toISOString(), acknowledged: false });
        }
      }
    }

    // Check rapid weight gain
    const weightGainThreshold = thresholds.find((t) => t.type === "weight_rapid_gain" && t.enabled);
    if (weightGainThreshold && typeof weightGainThreshold.value === "number" && vitalsData.weight.length >= 7) {
      const recentWeight = vitalsData.weight.slice(-7);
      const oldestWeight = recentWeight[0].weight;
      const newestWeight = recentWeight[recentWeight.length - 1].weight;
      const weightChange = newestWeight - oldestWeight;

      if (weightChange >= weightGainThreshold.value) {
        const shouldAlert = await shouldSendAlert(weightGainThreshold);
        if (shouldAlert) {
          const alert = {
            type: "weight_rapid_gain" as const,
            severity: "warning" as const,
            title: "Rapid Weight Gain Alert",
            message: `You've gained ${weightChange.toFixed(1)} lbs in the past week. Monitor for swelling or shortness of breath and contact your doctor if concerned.`,
          };
          await addTrendAlert(alert);
          await sendPushNotification(alert.title, alert.message);
          await updateLastAlertDate(weightGainThreshold.id);
          newAlerts.push({ ...alert, id: Date.now().toString(), timestamp: new Date().toISOString(), acknowledged: false });
        }
      }
    }

    // Check rapid weight loss
    const weightLossThreshold = thresholds.find((t) => t.type === "weight_rapid_loss" && t.enabled);
    if (weightLossThreshold && typeof weightLossThreshold.value === "number" && vitalsData.weight.length >= 7) {
      const recentWeight = vitalsData.weight.slice(-7);
      const oldestWeight = recentWeight[0].weight;
      const newestWeight = recentWeight[recentWeight.length - 1].weight;
      const weightChange = oldestWeight - newestWeight;

      if (weightChange >= weightLossThreshold.value) {
        const shouldAlert = await shouldSendAlert(weightLossThreshold);
        if (shouldAlert) {
          const alert = {
            type: "weight_rapid_loss" as const,
            severity: "warning" as const,
            title: "Rapid Weight Loss Alert",
            message: `You've lost ${weightChange.toFixed(1)} lbs in the past week. If unintentional, consult your doctor.`,
          };
          await addTrendAlert(alert);
          await sendPushNotification(alert.title, alert.message);
          await updateLastAlertDate(weightLossThreshold.id);
          newAlerts.push({ ...alert, id: Date.now().toString(), timestamp: new Date().toISOString(), acknowledged: false });
        }
      }
    }
  } catch (error) {
    console.error("Error monitoring vitals:", error);
  }

  return newAlerts;
}

/**
 * Check if should send alert (avoid duplicate alerts within 24 hours)
 */
async function shouldSendAlert(threshold: VitalsThreshold): Promise<boolean> {
  if (!threshold.lastAlertDate) return true;

  const lastAlert = new Date(threshold.lastAlertDate);
  const now = new Date();
  const hoursSinceLastAlert = (now.getTime() - lastAlert.getTime()) / (1000 * 60 * 60);

  return hoursSinceLastAlert >= 24;
}

/**
 * Update last alert date for threshold
 */
async function updateLastAlertDate(thresholdId: string): Promise<void> {
  await updateVitalsThreshold(thresholdId, {
    lastAlertDate: new Date().toISOString(),
  });
}

/**
 * Send push notification
 */
async function sendPushNotification(title: string, body: string): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: "trend_alert" },
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}
