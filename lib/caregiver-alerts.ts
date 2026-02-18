import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RedFlag } from "./red-flag-detection";

/**
 * Caregiver Real-Time Alert System
 *
 * Sends push notifications to caregivers when red flags are detected,
 * with configurable alert preferences and acknowledgment tracking.
 */

export interface CaregiverContact {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  alertPreferences: {
    criticalOnly: boolean; // Only send critical alerts
    allWarnings: boolean; // Send all warnings including non-critical
    enabled: boolean;
  };
}

export interface CaregiverAlert {
  id: string;
  redFlagId: string;
  caregiverId: string;
  sentAt: string;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
}

const STORAGE_KEY_CAREGIVERS = "@healthmate_caregivers";
const STORAGE_KEY_CAREGIVER_ALERTS = "@healthmate_caregiver_alerts";
const STORAGE_KEY_ALERT_PREFS = "@healthmate_alert_preferences";

/**
 * Get all registered caregivers
 */
export const getCaregivers = async (): Promise<CaregiverContact[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_CAREGIVERS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("[CaregiverAlerts] Error reading caregivers:", error);
    return [];
  }
};

/**
 * Add or update caregiver contact
 */
export const saveCaregiver = async (caregiver: CaregiverContact): Promise<void> => {
  try {
    const caregivers = await getCaregivers();
    const existingIndex = caregivers.findIndex(c => c.id === caregiver.id);
    
    if (existingIndex >= 0) {
      caregivers[existingIndex] = caregiver;
    } else {
      caregivers.push(caregiver);
    }
    
    await AsyncStorage.setItem(STORAGE_KEY_CAREGIVERS, JSON.stringify(caregivers));
    console.log("[CaregiverAlerts] Caregiver saved:", caregiver.name);
  } catch (error) {
    console.error("[CaregiverAlerts] Error saving caregiver:", error);
  }
};

/**
 * Remove caregiver contact
 */
export const removeCaregiver = async (caregiverId: string): Promise<void> => {
  try {
    const caregivers = await getCaregivers();
    const filtered = caregivers.filter(c => c.id !== caregiverId);
    await AsyncStorage.setItem(STORAGE_KEY_CAREGIVERS, JSON.stringify(filtered));
    console.log("[CaregiverAlerts] Caregiver removed:", caregiverId);
  } catch (error) {
    console.error("[CaregiverAlerts] Error removing caregiver:", error);
  }
};

/**
 * Send alert to caregivers based on red flag
 */
export const sendCaregiverAlert = async (redFlag: RedFlag): Promise<void> => {
  const caregivers = await getCaregivers();
  
  for (const caregiver of caregivers) {
    // Check if caregiver wants to receive this type of alert
    if (!caregiver.alertPreferences.enabled) continue;
    
    if (caregiver.alertPreferences.criticalOnly && redFlag.type !== "critical") {
      continue; // Skip non-critical alerts if caregiver only wants critical
    }
    
    if (!caregiver.alertPreferences.allWarnings && redFlag.type === "warning") {
      continue; // Skip warnings if caregiver doesn't want them
    }
    
    // Send push notification
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🚨 Health Alert for Your Loved One`,
          body: `${redFlag.message}. ${redFlag.actionRequired}`,
          data: {
            type: "caregiver_alert",
            redFlagId: redFlag.id,
            caregiverId: caregiver.id,
            redFlag,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Immediate
      });
      
      // Log alert
      const alert: CaregiverAlert = {
        id: `alert_${Date.now()}_${caregiver.id}`,
        redFlagId: redFlag.id,
        caregiverId: caregiver.id,
        sentAt: new Date().toISOString(),
        acknowledgedAt: null,
        acknowledgedBy: null,
      };
      
      await logCaregiverAlert(alert);
      
      console.log(`[CaregiverAlerts] Alert sent to ${caregiver.name}`);
    } catch (error) {
      console.error(`[CaregiverAlerts] Error sending alert to ${caregiver.name}:`, error);
    }
  }
};

/**
 * Log caregiver alert
 */
const logCaregiverAlert = async (alert: CaregiverAlert): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_CAREGIVER_ALERTS);
    const alerts: CaregiverAlert[] = stored ? JSON.parse(stored) : [];
    alerts.unshift(alert);
    await AsyncStorage.setItem(
      STORAGE_KEY_CAREGIVER_ALERTS,
      JSON.stringify(alerts.slice(0, 100)) // Keep last 100
    );
  } catch (error) {
    console.error("[CaregiverAlerts] Error logging alert:", error);
  }
};

/**
 * Acknowledge caregiver alert
 */
export const acknowledgeCaregiverAlert = async (
  alertId: string,
  caregiverId: string
): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_CAREGIVER_ALERTS);
    if (!stored) return;
    
    const alerts: CaregiverAlert[] = JSON.parse(stored);
    const alert = alerts.find(a => a.id === alertId);
    
    if (alert) {
      alert.acknowledgedAt = new Date().toISOString();
      alert.acknowledgedBy = caregiverId;
      await AsyncStorage.setItem(STORAGE_KEY_CAREGIVER_ALERTS, JSON.stringify(alerts));
      console.log("[CaregiverAlerts] Alert acknowledged:", alertId);
    }
  } catch (error) {
    console.error("[CaregiverAlerts] Error acknowledging alert:", error);
  }
};

/**
 * Get caregiver alert history
 */
export const getCaregiverAlertHistory = async (
  caregiverId?: string
): Promise<CaregiverAlert[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_CAREGIVER_ALERTS);
    if (!stored) return [];
    
    const alerts: CaregiverAlert[] = JSON.parse(stored);
    
    if (caregiverId) {
      return alerts.filter(a => a.caregiverId === caregiverId);
    }
    
    return alerts;
  } catch (error) {
    console.error("[CaregiverAlerts] Error reading alert history:", error);
    return [];
  }
};

/**
 * Get unacknowledged alerts count
 */
export const getUnacknowledgedAlertsCount = async (
  caregiverId?: string
): Promise<number> => {
  const alerts = await getCaregiverAlertHistory(caregiverId);
  return alerts.filter(a => !a.acknowledgedAt).length;
};

/**
 * Update caregiver alert preferences
 */
export const updateAlertPreferences = async (
  caregiverId: string,
  preferences: CaregiverContact["alertPreferences"]
): Promise<void> => {
  try {
    const caregivers = await getCaregivers();
    const caregiver = caregivers.find(c => c.id === caregiverId);
    
    if (caregiver) {
      caregiver.alertPreferences = preferences;
      await AsyncStorage.setItem(STORAGE_KEY_CAREGIVERS, JSON.stringify(caregivers));
      console.log("[CaregiverAlerts] Alert preferences updated for:", caregiverId);
    }
  } catch (error) {
    console.error("[CaregiverAlerts] Error updating alert preferences:", error);
  }
};

/**
 * Test caregiver alert system
 */
export const sendTestAlert = async (caregiverId: string): Promise<void> => {
  const caregivers = await getCaregivers();
  const caregiver = caregivers.find(c => c.id === caregiverId);
  
  if (!caregiver) {
    console.error("[CaregiverAlerts] Caregiver not found:", caregiverId);
    return;
  }
  
  const testRedFlag: RedFlag = {
    id: `test_${Date.now()}`,
    type: "warning",
    category: "bloodPressure",
    message: "This is a test alert from HealthMate",
    reading: "120/80 mmHg",
    timestamp: new Date().toISOString(),
    contextLink: "/health-library/test",
    actionRequired: "No action required. This is a test notification.",
  };
  
  await sendCaregiverAlert(testRedFlag);
};
