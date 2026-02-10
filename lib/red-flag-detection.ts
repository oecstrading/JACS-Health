import * as Notifications from "expo-notifications";
import * as Speech from "expo-speech";
import { SyncedHealthData } from "./device-sync";

/**
 * AI Red Flag Detection Module
 *
 * Monitors incoming device data for critical health readings and triggers
 * immediate voice notifications and caregiver alerts.
 */

export interface RedFlag {
  id: string;
  type: "critical" | "warning";
  category: "bloodPressure" | "heartRate" | "weight" | "irregular";
  message: string;
  reading: string;
  timestamp: string;
  contextLink: string; // Link to Medical Library
  actionRequired: string;
}

// Critical thresholds
const THRESHOLDS = {
  systolicHigh: 140,
  diastolicHigh: 90,
  heartRateHigh: 100,
  heartRateLow: 60,
  weightChangePercent: 5, // 5% change in 7 days
  irregularHeartRhythm: true, // AFib detection
};

/**
 * Analyze blood pressure reading for red flags
 */
const analyzeBP = (data: SyncedHealthData): RedFlag | null => {
  if (!data.systolic || !data.diastolic) return null;

  if (data.systolic >= THRESHOLDS.systolicHigh || data.diastolic >= THRESHOLDS.diastolicHigh) {
    return {
      id: `bp_${Date.now()}`,
      type: "critical",
      category: "bloodPressure",
      message: `High Blood Pressure Detected: ${data.systolic}/${data.diastolic} mmHg`,
      reading: `${data.systolic}/${data.diastolic} mmHg`,
      timestamp: data.timestamp,
      contextLink: "/health-library/hypertension",
      actionRequired: "Contact your doctor if this persists for 3+ days",
    };
  }

  return null;
};

/**
 * Analyze heart rate reading for red flags
 */
const analyzeHeartRate = (data: SyncedHealthData): RedFlag | null => {
  if (data.value >= THRESHOLDS.heartRateHigh) {
    return {
      id: `hr_high_${Date.now()}`,
      type: "critical",
      category: "heartRate",
      message: `High Heart Rate Detected: ${data.value} bpm`,
      reading: `${data.value} bpm`,
      timestamp: data.timestamp,
      contextLink: "/health-library/tachycardia",
      actionRequired: "Rest and monitor. Seek medical attention if symptoms persist.",
    };
  }

  if (data.value <= THRESHOLDS.heartRateLow) {
    return {
      id: `hr_low_${Date.now()}`,
      type: "warning",
      category: "heartRate",
      message: `Low Heart Rate Detected: ${data.value} bpm`,
      reading: `${data.value} bpm`,
      timestamp: data.timestamp,
      contextLink: "/health-library/bradycardia",
      actionRequired: "Monitor closely. Contact your doctor if you feel dizzy or fatigued.",
    };
  }

  return null;
};

/**
 * Analyze weight trends for red flags
 */
const analyzeWeight = (currentWeight: number, previousWeights: number[]): RedFlag | null => {
  if (previousWeights.length === 0) return null;

  const avgPreviousWeight = previousWeights.reduce((a, b) => a + b, 0) / previousWeights.length;
  const changePercent = Math.abs(((currentWeight - avgPreviousWeight) / avgPreviousWeight) * 100);

  if (changePercent >= THRESHOLDS.weightChangePercent) {
    const direction = currentWeight > avgPreviousWeight ? "gain" : "loss";
    return {
      id: `weight_${Date.now()}`,
      type: "warning",
      category: "weight",
      message: `Rapid Weight ${direction.charAt(0).toUpperCase() + direction.slice(1)}: ${changePercent.toFixed(1)}% in 7 days`,
      reading: `${currentWeight} lbs (${changePercent.toFixed(1)}% ${direction})`,
      timestamp: new Date().toISOString(),
      contextLink: "/health-library/weight-management",
      actionRequired: "Discuss with your doctor at your next appointment.",
    };
  }

  return null;
};

/**
 * Detect irregular heart rhythm (AFib)
 * Note: This requires advanced analysis of heart rate variability
 */
const detectIrregularRhythm = (heartRateData: SyncedHealthData[]): RedFlag | null => {
  // Simplified AFib detection: look for high variability in consecutive readings
  if (heartRateData.length < 3) return null;

  const recentReadings = heartRateData.slice(-5).map(d => d.value);
  const differences = [];
  for (let i = 1; i < recentReadings.length; i++) {
    differences.push(Math.abs(recentReadings[i] - recentReadings[i - 1]));
  }

  const avgDifference = differences.reduce((a, b) => a + b, 0) / differences.length;

  // If average difference is > 20 bpm, flag as irregular
  if (avgDifference > 20) {
    return {
      id: `afib_${Date.now()}`,
      type: "critical",
      category: "irregular",
      message: "Irregular Heart Rhythm Detected",
      reading: `High variability: ${avgDifference.toFixed(0)} bpm average difference`,
      timestamp: new Date().toISOString(),
      contextLink: "/health-library/atrial-fibrillation",
      actionRequired: "URGENT: Contact your doctor immediately or seek emergency care.",
    };
  }

  return null;
};

/**
 * Trigger voice notification for critical reading
 */
export const triggerVoiceNotification = async (redFlag: RedFlag): Promise<void> => {
  const voiceMessage = `Health alert: ${redFlag.message}. ${redFlag.actionRequired}`;

  try {
    await Speech.speak(voiceMessage, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.85, // Slower for seniors
      volume: 1.0,
    });
    console.log("[RedFlag] Voice notification triggered:", voiceMessage);
  } catch (error) {
    console.error("[RedFlag] Error triggering voice notification:", error);
  }
};

/**
 * Send push notification for red flag
 */
export const sendRedFlagNotification = async (redFlag: RedFlag): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: redFlag.type === "critical" ? "🚨 Critical Health Alert" : "⚠️ Health Warning",
        body: redFlag.message,
        data: { redFlag },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Immediate
    });
    console.log("[RedFlag] Push notification sent:", redFlag.message);
  } catch (error) {
    console.error("[RedFlag] Error sending push notification:", error);
  }
};

/**
 * Flag entry in red on Caregiver Dashboard
 */
export const flagForCaregivers = async (redFlag: RedFlag): Promise<void> => {
  // Store red flag in AsyncStorage for caregiver dashboard
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    const existingFlags = await AsyncStorage.getItem("@healthmate_red_flags");
    const flags: RedFlag[] = existingFlags ? JSON.parse(existingFlags) : [];
    flags.unshift(redFlag); // Add to beginning
    await AsyncStorage.setItem("@healthmate_red_flags", JSON.stringify(flags.slice(0, 50))); // Keep last 50
    console.log("[RedFlag] Flagged for caregivers:", redFlag.message);
  } catch (error) {
    console.error("[RedFlag] Error flagging for caregivers:", error);
  }
};

/**
 * Main red flag detection function
 */
export const detectRedFlags = async (
  newData: SyncedHealthData[],
  historicalData: SyncedHealthData[]
): Promise<RedFlag[]> => {
  const redFlags: RedFlag[] = [];

  for (const data of newData) {
    let flag: RedFlag | null = null;

    switch (data.type) {
      case "bloodPressure":
        flag = analyzeBP(data);
        break;

      case "heartRate":
        flag = analyzeHeartRate(data);
        // Also check for irregular rhythm
        const hrHistory = historicalData.filter(d => d.type === "heartRate");
        const irregularFlag = detectIrregularRhythm([...hrHistory, data]);
        if (irregularFlag) redFlags.push(irregularFlag);
        break;

      case "weight":
        const weightHistory = historicalData
          .filter(d => d.type === "weight")
          .map(d => d.value);
        flag = analyzeWeight(data.value, weightHistory);
        break;
    }

    if (flag) {
      redFlags.push(flag);

      // Trigger notifications for critical flags
      if (flag.type === "critical") {
        await triggerVoiceNotification(flag);
        await sendRedFlagNotification(flag);
      }

      // Flag all red flags for caregivers
      await flagForCaregivers(flag);
    }
  }

  return redFlags;
};

/**
 * Get all red flags for display
 */
export const getRedFlags = async (): Promise<RedFlag[]> => {
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    const stored = await AsyncStorage.getItem("@healthmate_red_flags");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("[RedFlag] Error reading red flags:", error);
    return [];
  }
};

/**
 * Clear red flags
 */
export const clearRedFlags = async (): Promise<void> => {
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    await AsyncStorage.removeItem("@healthmate_red_flags");
    console.log("[RedFlag] Red flags cleared");
  } catch (error) {
    console.error("[RedFlag] Error clearing red flags:", error);
  }
};
