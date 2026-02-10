/**
 * Medication Tracking Module
 * 
 * Tracks medication adherence and correlates with vitals data
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: "once_daily" | "twice_daily" | "three_times_daily" | "as_needed";
  times: string[]; // Array of times (e.g., ["08:00", "20:00"])
  purpose: "blood_pressure" | "heart_rate" | "diabetes" | "cholesterol" | "other";
  startDate: string;
  endDate?: string;
  active: boolean;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: string;
  takenTime: string;
  taken: boolean;
  skipped: boolean;
  notes?: string;
}

export interface MedicationCorrelation {
  medicationId: string;
  medicationName: string;
  correlation: "positive" | "negative" | "neutral";
  vitalType: "blood_pressure" | "heart_rate" | "weight";
  description: string;
  recommendation: string;
}

const MEDICATIONS_KEY = "medications";
const MEDICATION_LOGS_KEY = "medication_logs";

/**
 * Get all medications
 */
export async function getMedications(): Promise<Medication[]> {
  try {
    const json = await AsyncStorage.getItem(MEDICATIONS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error("Error getting medications:", error);
    return [];
  }
}

/**
 * Add a new medication
 */
export async function addMedication(medication: Omit<Medication, "id">): Promise<Medication> {
  try {
    const medications = await getMedications();
    const newMedication: Medication = {
      ...medication,
      id: Date.now().toString(),
    };
    medications.push(newMedication);
    await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));
    return newMedication;
  } catch (error) {
    console.error("Error adding medication:", error);
    throw error;
  }
}

/**
 * Update a medication
 */
export async function updateMedication(id: string, updates: Partial<Medication>): Promise<void> {
  try {
    const medications = await getMedications();
    const index = medications.findIndex((m) => m.id === id);
    if (index !== -1) {
      medications[index] = { ...medications[index], ...updates };
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));
    }
  } catch (error) {
    console.error("Error updating medication:", error);
    throw error;
  }
}

/**
 * Delete a medication
 */
export async function deleteMedication(id: string): Promise<void> {
  try {
    const medications = await getMedications();
    const filtered = medications.filter((m) => m.id !== id);
    await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting medication:", error);
    throw error;
  }
}

/**
 * Get medication logs
 */
export async function getMedicationLogs(startDate?: string, endDate?: string): Promise<MedicationLog[]> {
  try {
    const json = await AsyncStorage.getItem(MEDICATION_LOGS_KEY);
    let logs: MedicationLog[] = json ? JSON.parse(json) : [];

    if (startDate || endDate) {
      logs = logs.filter((log) => {
        const logDate = new Date(log.takenTime || log.scheduledTime);
        if (startDate && logDate < new Date(startDate)) return false;
        if (endDate && logDate > new Date(endDate)) return false;
        return true;
      });
    }

    return logs;
  } catch (error) {
    console.error("Error getting medication logs:", error);
    return [];
  }
}

/**
 * Log medication taken
 */
export async function logMedicationTaken(
  medicationId: string,
  medicationName: string,
  scheduledTime: string,
  notes?: string
): Promise<void> {
  try {
    const logs = await getMedicationLogs();
    const newLog: MedicationLog = {
      id: Date.now().toString(),
      medicationId,
      medicationName,
      scheduledTime,
      takenTime: new Date().toISOString(),
      taken: true,
      skipped: false,
      notes,
    };
    logs.push(newLog);
    
    // Keep only last 90 days of logs
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const filtered = logs.filter((log) => new Date(log.takenTime || log.scheduledTime) >= ninetyDaysAgo);
    
    await AsyncStorage.setItem(MEDICATION_LOGS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error logging medication:", error);
    throw error;
  }
}

/**
 * Log medication skipped
 */
export async function logMedicationSkipped(
  medicationId: string,
  medicationName: string,
  scheduledTime: string,
  notes?: string
): Promise<void> {
  try {
    const logs = await getMedicationLogs();
    const newLog: MedicationLog = {
      id: Date.now().toString(),
      medicationId,
      medicationName,
      scheduledTime,
      takenTime: new Date().toISOString(),
      taken: false,
      skipped: true,
      notes,
    };
    logs.push(newLog);
    
    // Keep only last 90 days of logs
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const filtered = logs.filter((log) => new Date(log.takenTime || log.scheduledTime) >= ninetyDaysAgo);
    
    await AsyncStorage.setItem(MEDICATION_LOGS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error logging skipped medication:", error);
    throw error;
  }
}

/**
 * Calculate medication adherence rate
 */
export async function calculateAdherenceRate(medicationId?: string, days: number = 30): Promise<number> {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    let logs = await getMedicationLogs(startDate);

    if (medicationId) {
      logs = logs.filter((log) => log.medicationId === medicationId);
    }

    if (logs.length === 0) return 0;

    const takenCount = logs.filter((log) => log.taken).length;
    return (takenCount / logs.length) * 100;
  } catch (error) {
    console.error("Error calculating adherence rate:", error);
    return 0;
  }
}

/**
 * Analyze medication-vitals correlation
 */
export async function analyzeMedicationVitalsCorrelation(
  vitalsData: {
    bloodPressure: Array<{ systolic: number; diastolic: number; timestamp: string }>;
    heartRate: Array<{ heartRate: number; timestamp: string }>;
    weight: Array<{ weight: number; timestamp: string }>;
  }
): Promise<MedicationCorrelation[]> {
  const correlations: MedicationCorrelation[] = [];

  try {
    const medications = await getMedications();
    const activeBPMeds = medications.filter((m) => m.active && m.purpose === "blood_pressure");
    const activeHRMeds = medications.filter(
      (m) => m.active && (m.purpose === "heart_rate" || m.purpose === "blood_pressure")
    );

    // Analyze BP medication correlation
    for (const med of activeBPMeds) {
      const adherenceRate = await calculateAdherenceRate(med.id, 30);
      const avgSystolic =
        vitalsData.bloodPressure.reduce((sum, r) => sum + r.systolic, 0) /
        vitalsData.bloodPressure.length;

      if (adherenceRate < 70 && avgSystolic >= 140) {
        correlations.push({
          medicationId: med.id,
          medicationName: med.name,
          correlation: "negative",
          vitalType: "blood_pressure",
          description: `Your BP medication adherence is ${adherenceRate.toFixed(0)}%, and your average BP is ${avgSystolic.toFixed(0)} mmHg (elevated). Poor adherence may be contributing to high BP.`,
          recommendation: `Improve medication adherence to at least 80%. Set reminders, use a pill organizer, and discuss barriers with your doctor.`,
        });
      } else if (adherenceRate >= 80 && avgSystolic < 120) {
        correlations.push({
          medicationId: med.id,
          medicationName: med.name,
          correlation: "positive",
          vitalType: "blood_pressure",
          description: `Your BP medication adherence is excellent (${adherenceRate.toFixed(0)}%), and your average BP is ${avgSystolic.toFixed(0)} mmHg (normal). Your medication is working well!`,
          recommendation: `Continue your current medication routine. Keep monitoring your BP regularly.`,
        });
      }
    }

    // Analyze HR medication correlation
    for (const med of activeHRMeds) {
      const adherenceRate = await calculateAdherenceRate(med.id, 30);
      const avgHR =
        vitalsData.heartRate.reduce((sum, r) => sum + r.heartRate, 0) /
        vitalsData.heartRate.length;

      if (adherenceRate < 70 && avgHR > 100) {
        correlations.push({
          medicationId: med.id,
          medicationName: med.name,
          correlation: "negative",
          vitalType: "heart_rate",
          description: `Your heart rate medication adherence is ${adherenceRate.toFixed(0)}%, and your average HR is ${avgHR.toFixed(0)} bpm (elevated). Poor adherence may be affecting your heart rate control.`,
          recommendation: `Improve medication adherence. Set multiple daily reminders and discuss any side effects with your doctor.`,
        });
      } else if (adherenceRate >= 80 && avgHR >= 60 && avgHR <= 80) {
        correlations.push({
          medicationId: med.id,
          medicationName: med.name,
          correlation: "positive",
          vitalType: "heart_rate",
          description: `Your heart rate medication adherence is excellent (${adherenceRate.toFixed(0)}%), and your average HR is ${avgHR.toFixed(0)} bpm (healthy). Your medication is effective!`,
          recommendation: `Continue your current medication routine and healthy lifestyle habits.`,
        });
      }
    }
  } catch (error) {
    console.error("Error analyzing medication-vitals correlation:", error);
  }

  return correlations;
}

/**
 * Get today's medication schedule
 */
export async function getTodaysMedicationSchedule(): Promise<
  Array<{
    medication: Medication;
    scheduledTime: string;
    taken: boolean;
    log?: MedicationLog;
  }>
> {
  try {
    const medications = await getMedications();
    const activeMeds = medications.filter((m) => m.active);
    
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();
    
    const todaysLogs = await getMedicationLogs(todayStart, todayEnd);

    const schedule: Array<{
      medication: Medication;
      scheduledTime: string;
      taken: boolean;
      log?: MedicationLog;
    }> = [];

    for (const med of activeMeds) {
      for (const time of med.times) {
        const scheduledDateTime = new Date(
          `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}T${time}:00`
        ).toISOString();

        const log = todaysLogs.find(
          (l) => l.medicationId === med.id && l.scheduledTime === scheduledDateTime
        );

        schedule.push({
          medication: med,
          scheduledTime: scheduledDateTime,
          taken: log?.taken || false,
          log,
        });
      }
    }

    // Sort by scheduled time
    schedule.sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());

    return schedule;
  } catch (error) {
    console.error("Error getting today's medication schedule:", error);
    return [];
  }
}
