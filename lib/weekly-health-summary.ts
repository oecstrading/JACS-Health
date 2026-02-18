import AsyncStorage from "@react-native-async-storage/async-storage";
import { SyncedHealthData } from "./device-sync";

/**
 * Weekly Health Summary Module
 *
 * Automatically aggregates synced data every Sunday at 6 PM to generate
 * clinical-grade 7-day trend reports for physicians.
 */

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  bloodPressure: {
    avgSystolic: number;
    avgDiastolic: number;
    readings: number;
    trend: "rising" | "stable" | "falling";
    alert: string | null;
  };
  heartRate: {
    avgBpm: number;
    minBpm: number;
    maxBpm: number;
    readings: number;
    trend: "rising" | "stable" | "falling";
    alert: string | null;
  };
  weight: {
    avgLbs: number;
    startWeight: number;
    endWeight: number;
    changePercent: number;
    readings: number;
    trend: "rising" | "stable" | "falling";
    alert: string | null;
  };
  steps: {
    avgDaily: number;
    totalSteps: number;
    readings: number;
    trend: "rising" | "stable" | "falling";
  };
  patientVoice: string[]; // Voice logs from the week
  clinicalAlerts: string[];
}

/**
 * Calculate trend direction based on first half vs second half of week
 */
const calculateTrend = (values: number[]): "rising" | "stable" | "falling" => {
  if (values.length < 2) return "stable";

  const midpoint = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, midpoint);
  const secondHalf = values.slice(midpoint);

  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const changePercent = ((avgSecond - avgFirst) / avgFirst) * 100;

  if (changePercent > 5) return "rising";
  if (changePercent < -5) return "falling";
  return "stable";
};

/**
 * Generate clinical alert if significant deviation detected
 */
const generateAlert = (
  type: "bp" | "hr" | "weight",
  changePercent: number,
  avgValue: number
): string | null => {
  switch (type) {
    case "bp":
      if (avgValue >= 140) {
        return `⚠️ Average systolic pressure ${avgValue.toFixed(0)} mmHg exceeds 140 mmHg threshold`;
      }
      if (changePercent >= 10) {
        return `⚠️ Blood pressure increased by ${changePercent.toFixed(1)}% this week`;
      }
      break;

    case "hr":
      if (avgValue >= 100) {
        return `⚠️ Average heart rate ${avgValue.toFixed(0)} bpm exceeds 100 bpm threshold`;
      }
      if (changePercent >= 10) {
        return `⚠️ Heart rate increased by ${changePercent.toFixed(1)}% this week`;
      }
      break;

    case "weight":
      if (Math.abs(changePercent) >= 5) {
        const direction = changePercent > 0 ? "increased" : "decreased";
        return `⚠️ Weight ${direction} by ${Math.abs(changePercent).toFixed(1)}% this week`;
      }
      break;
  }

  return null;
};

/**
 * Generate weekly health summary from synced data
 */
export const generateWeeklySummary = async (
  data: SyncedHealthData[],
  voiceLogs?: string[]
): Promise<WeeklySummary> => {
  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Filter data to last 7 days
  const weekData = data.filter(d => new Date(d.timestamp) >= weekStart);

  // Blood Pressure Analysis
  const bpData = weekData.filter(d => d.type === "bloodPressure");
  const systolicValues = bpData.map(d => d.systolic!).filter(v => v !== undefined);
  const diastolicValues = bpData.map(d => d.diastolic!).filter(v => v !== undefined);
  const avgSystolic = systolicValues.length > 0
    ? systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length
    : 0;
  const avgDiastolic = diastolicValues.length > 0
    ? diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length
    : 0;

  // Calculate BP change percent (compare to previous week if available)
  const prevWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const prevWeekBP = data.filter(
    d => d.type === "bloodPressure" && new Date(d.timestamp) >= prevWeekStart && new Date(d.timestamp) < weekStart
  );
  const prevAvgSystolic = prevWeekBP.length > 0
    ? prevWeekBP.map(d => d.systolic!).reduce((a, b) => a + b, 0) / prevWeekBP.length
    : avgSystolic;
  const bpChangePercent = prevAvgSystolic > 0
    ? ((avgSystolic - prevAvgSystolic) / prevAvgSystolic) * 100
    : 0;

  // Heart Rate Analysis
  const hrData = weekData.filter(d => d.type === "heartRate");
  const hrValues = hrData.map(d => d.value);
  const avgHR = hrValues.length > 0
    ? hrValues.reduce((a, b) => a + b, 0) / hrValues.length
    : 0;
  const minHR = hrValues.length > 0 ? Math.min(...hrValues) : 0;
  const maxHR = hrValues.length > 0 ? Math.max(...hrValues) : 0;

  const prevWeekHR = data.filter(
    d => d.type === "heartRate" && new Date(d.timestamp) >= prevWeekStart && new Date(d.timestamp) < weekStart
  );
  const prevAvgHR = prevWeekHR.length > 0
    ? prevWeekHR.map(d => d.value).reduce((a, b) => a + b, 0) / prevWeekHR.length
    : avgHR;
  const hrChangePercent = prevAvgHR > 0
    ? ((avgHR - prevAvgHR) / prevAvgHR) * 100
    : 0;

  // Weight Analysis
  const weightData = weekData.filter(d => d.type === "weight");
  const weightValues = weightData.map(d => d.value);
  const avgWeight = weightValues.length > 0
    ? weightValues.reduce((a, b) => a + b, 0) / weightValues.length
    : 0;
  const startWeight = weightValues.length > 0 ? weightValues[0] : 0;
  const endWeight = weightValues.length > 0 ? weightValues[weightValues.length - 1] : 0;
  const weightChangePercent = startWeight > 0
    ? ((endWeight - startWeight) / startWeight) * 100
    : 0;

  // Steps Analysis
  const stepsData = weekData.filter(d => d.type === "steps");
  const stepsValues = stepsData.map(d => d.value);
  const totalSteps = stepsValues.reduce((a, b) => a + b, 0);
  const avgSteps = stepsValues.length > 0 ? totalSteps / stepsValues.length : 0;

  // Clinical Alerts
  const clinicalAlerts: string[] = [];
  const bpAlert = generateAlert("bp", bpChangePercent, avgSystolic);
  if (bpAlert) clinicalAlerts.push(bpAlert);
  const hrAlert = generateAlert("hr", hrChangePercent, avgHR);
  if (hrAlert) clinicalAlerts.push(hrAlert);
  const weightAlert = generateAlert("weight", weightChangePercent, avgWeight);
  if (weightAlert) clinicalAlerts.push(weightAlert);

  const summary: WeeklySummary = {
    weekStart: weekStart.toISOString(),
    weekEnd: now.toISOString(),
    generatedAt: now.toISOString(),
    bloodPressure: {
      avgSystolic: Math.round(avgSystolic),
      avgDiastolic: Math.round(avgDiastolic),
      readings: bpData.length,
      trend: calculateTrend(systolicValues),
      alert: bpAlert,
    },
    heartRate: {
      avgBpm: Math.round(avgHR),
      minBpm: Math.round(minHR),
      maxBpm: Math.round(maxHR),
      readings: hrData.length,
      trend: calculateTrend(hrValues),
      alert: hrAlert,
    },
    weight: {
      avgLbs: Math.round(avgWeight * 10) / 10,
      startWeight: Math.round(startWeight * 10) / 10,
      endWeight: Math.round(endWeight * 10) / 10,
      changePercent: Math.round(weightChangePercent * 10) / 10,
      readings: weightData.length,
      trend: calculateTrend(weightValues),
      alert: weightAlert,
    },
    steps: {
      avgDaily: Math.round(avgSteps),
      totalSteps: Math.round(totalSteps),
      readings: stepsData.length,
      trend: calculateTrend(stepsValues),
    },
    patientVoice: voiceLogs || [],
    clinicalAlerts,
  };

  // Store summary
  await saveWeeklySummary(summary);

  return summary;
};

/**
 * Save weekly summary to storage
 */
const saveWeeklySummary = async (summary: WeeklySummary): Promise<void> => {
  try {
    const existingSummaries = await AsyncStorage.getItem("@healthmate_weekly_summaries");
    const summaries: WeeklySummary[] = existingSummaries ? JSON.parse(existingSummaries) : [];
    summaries.unshift(summary); // Add to beginning
    await AsyncStorage.setItem(
      "@healthmate_weekly_summaries",
      JSON.stringify(summaries.slice(0, 12)) // Keep last 12 weeks (3 months)
    );
    console.log("[WeeklySummary] Summary saved for week ending", summary.weekEnd);
  } catch (error) {
    console.error("[WeeklySummary] Error saving summary:", error);
  }
};

/**
 * Get all weekly summaries
 */
export const getWeeklySummaries = async (): Promise<WeeklySummary[]> => {
  try {
    const stored = await AsyncStorage.getItem("@healthmate_weekly_summaries");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("[WeeklySummary] Error reading summaries:", error);
    return [];
  }
};

/**
 * Get latest weekly summary
 */
export const getLatestSummary = async (): Promise<WeeklySummary | null> => {
  const summaries = await getWeeklySummaries();
  return summaries.length > 0 ? summaries[0] : null;
};

/**
 * Schedule automatic weekly summary generation (Sunday 6 PM)
 */
export const scheduleWeeklySummary = () => {
  const now = new Date();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7));
  nextSunday.setHours(18, 0, 0, 0); // 6 PM

  const msUntilNextSunday = nextSunday.getTime() - now.getTime();

  console.log(`[WeeklySummary] Scheduled for ${nextSunday.toLocaleString()}`);

  setTimeout(async () => {
    // Generate summary
    const { syncAllHealthData } = await import("./device-sync");
    const data = await syncAllHealthData();
    await generateWeeklySummary(data);

    // Schedule next week
    scheduleWeeklySummary();
  }, msUntilNextSunday);
};
