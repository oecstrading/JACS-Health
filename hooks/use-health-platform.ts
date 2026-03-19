/**
 * JACS Health Platform Hooks
 * Migration-aligned hooks from 05_HOOKS_REFERENCE.md
 */

import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConditionId = "standard" | "hypertension" | "diabetes" | "ckd" | "chf";
export type DataSourceMode = "real" | "virtual";
export type SubscriptionStatus = "trial" | "active" | "expired" | "lifetime";

export interface ConditionMetric {
  key: string;
  label: string;
  unit: string;
  icon: string;
}

export interface ConditionTask {
  id: string;
  label: string;
  time: string;
}

export interface ConditionThreshold {
  warn: number;
  critical: number;
  direction: "above" | "below";
}

// ─── Condition Config ─────────────────────────────────────────────────────────

const CONDITION_CONFIGS: Record<
  ConditionId,
  { metrics: ConditionMetric[]; tasks: ConditionTask[]; thresholds: Record<string, ConditionThreshold> }
> = {
  standard: {
    metrics: [
      { key: "bp", label: "Blood Pressure", unit: "mmHg", icon: "heart" },
      { key: "weight", label: "Weight", unit: "lbs", icon: "scale" },
      { key: "hr", label: "Heart Rate", unit: "bpm", icon: "pulse" },
    ],
    tasks: [
      { id: "morning_bp", label: "Morning BP", time: "08:00" },
      { id: "weight", label: "Weigh In", time: "07:30" },
      { id: "evening_bp", label: "Evening BP", time: "20:00" },
    ],
    thresholds: {
      systolic: { warn: 140, critical: 180, direction: "above" },
      hr: { warn: 100, critical: 120, direction: "above" },
    },
  },
  hypertension: {
    metrics: [
      { key: "bp", label: "Blood Pressure", unit: "mmHg", icon: "heart" },
      { key: "hr", label: "Heart Rate", unit: "bpm", icon: "pulse" },
      { key: "weight", label: "Weight", unit: "lbs", icon: "scale" },
    ],
    tasks: [
      { id: "morning_bp", label: "Morning BP", time: "07:00" },
      { id: "bp_med", label: "BP Medication", time: "08:00" },
      { id: "midday_bp", label: "Midday BP", time: "12:00" },
      { id: "evening_bp", label: "Evening BP", time: "20:00" },
    ],
    thresholds: {
      systolic: { warn: 130, critical: 180, direction: "above" },
      diastolic: { warn: 80, critical: 120, direction: "above" },
    },
  },
  diabetes: {
    metrics: [
      { key: "glucose", label: "Blood Glucose", unit: "mg/dL", icon: "droplet" },
      { key: "insulin", label: "Insulin", unit: "units", icon: "syringe" },
      { key: "carbs", label: "Carbs", unit: "g", icon: "utensils" },
    ],
    tasks: [
      { id: "fasting_glucose", label: "Fasting Glucose", time: "07:00" },
      { id: "breakfast_bolus", label: "Breakfast Bolus", time: "08:00" },
      { id: "lunch_glucose", label: "Lunch Glucose", time: "12:00" },
      { id: "dinner_bolus", label: "Dinner Bolus", time: "18:00" },
      { id: "bedtime_glucose", label: "Bedtime Glucose", time: "22:00" },
    ],
    thresholds: {
      glucose_high: { warn: 180, critical: 250, direction: "above" },
      glucose_low: { warn: 70, critical: 54, direction: "below" },
    },
  },
  ckd: {
    metrics: [
      { key: "bp", label: "Blood Pressure", unit: "mmHg", icon: "heart" },
      { key: "weight", label: "Weight", unit: "lbs", icon: "scale" },
      { key: "sodium", label: "Sodium Intake", unit: "mg", icon: "flask" },
    ],
    tasks: [
      { id: "morning_weight", label: "Morning Weight", time: "07:00" },
      { id: "morning_bp", label: "Morning BP", time: "08:00" },
      { id: "phosphate_binder", label: "Phosphate Binder", time: "08:00" },
      { id: "bp_med", label: "BP Medication", time: "08:00" },
      { id: "sodium_log", label: "Sodium Intake Log", time: "18:00" },
      { id: "evening_bp", label: "Evening BP", time: "20:00" },
      { id: "fluid_check", label: "Fluid Intake Check", time: "21:00" },
    ],
    thresholds: {
      weight_gain: { warn: 2, critical: 3, direction: "above" },
      systolic: { warn: 130, critical: 140, direction: "above" },
    },
  },
  chf: {
    metrics: [
      { key: "hr", label: "Heart Rate", unit: "bpm", icon: "pulse" },
      { key: "bp", label: "Blood Pressure", unit: "mmHg", icon: "heart" },
      { key: "weight", label: "Weight", unit: "lbs", icon: "scale" },
      { key: "o2", label: "Oxygen Sat", unit: "%", icon: "lungs" },
    ],
    tasks: [
      { id: "morning_weight", label: "Morning Weight", time: "07:00" },
      { id: "resting_hr", label: "Resting HR", time: "07:30" },
      { id: "symptom_check", label: "Symptom Quick Check", time: "08:00" },
      { id: "diuretic", label: "Diuretic Medication", time: "08:00" },
      { id: "sodium_log", label: "Sodium Intake", time: "18:00" },
      { id: "evening_bp_o2", label: "Evening BP + O2", time: "20:00" },
    ],
    thresholds: {
      weight_gain: { warn: 2, critical: 3, direction: "above" },
      hr_high: { warn: 100, critical: 120, direction: "above" },
      systolic_low: { warn: 90, critical: 80, direction: "below" },
      o2: { warn: 94, critical: 90, direction: "below" },
    },
  },
};

// Detection priority: diabetes > chf > ckd > hypertension
function detectCondition(conditions: ConditionId[]): ConditionId | null {
  if (conditions.includes("diabetes")) return "diabetes";
  if (conditions.includes("chf")) return "chf";
  if (conditions.includes("ckd")) return "ckd";
  if (conditions.includes("hypertension")) return "hypertension";
  return conditions[0] ?? null;
}

function mergeConditions(conditions: ConditionId[]) {
  const metrics: ConditionMetric[] = [];
  const tasks: ConditionTask[] = [];
  const thresholds: Record<string, ConditionThreshold> = {};
  const seenMetricKeys = new Set<string>();
  const seenTaskIds = new Set<string>();

  for (const cid of conditions) {
    const cfg = CONDITION_CONFIGS[cid];
    for (const m of cfg.metrics) {
      if (!seenMetricKeys.has(m.key)) {
        metrics.push(m);
        seenMetricKeys.add(m.key);
      }
    }
    for (const t of cfg.tasks) {
      if (!seenTaskIds.has(t.id)) {
        tasks.push(t);
        seenTaskIds.add(t.id);
      }
    }
    Object.assign(thresholds, cfg.thresholds); // last wins on conflict
  }
  return { metrics, tasks, thresholds };
}

// ─── useActiveConditions ──────────────────────────────────────────────────────

const STORAGE_KEY = "jacs_active_conditions";

export function useActiveConditions() {
  const [activeConditions, setActiveConditionsState] = useState<ConditionId[]>(["standard"]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) {
        try {
          setActiveConditionsState(JSON.parse(val));
        } catch {
          // ignore
        }
      }
      setIsLoading(false);
    });
  }, []);

  const setActiveConditions = useCallback(async (conditions: ConditionId[]) => {
    setActiveConditionsState(conditions);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(conditions));
  }, []);

  const toggleCondition = useCallback(
    async (condition: ConditionId) => {
      const updated = activeConditions.includes(condition)
        ? activeConditions.filter((c) => c !== condition)
        : [...activeConditions, condition];
      await setActiveConditions(updated.length === 0 ? ["standard"] : updated);
    },
    [activeConditions, setActiveConditions],
  );

  const isMultiCondition = activeConditions.length > 1;
  const detectedCondition = detectCondition(activeConditions);
  const { metrics: mergedMetrics, tasks: mergedTasks, thresholds: mergedThresholds } = mergeConditions(activeConditions);

  return {
    activeConditions,
    isMultiCondition,
    detectedCondition,
    mergedMetrics,
    mergedTasks,
    mergedThresholds,
    setActiveConditions,
    toggleCondition,
    isLoading,
  };
}

// ─── useActiveCondition (single, legacy) ─────────────────────────────────────

export function useActiveCondition(): ConditionId {
  const { detectedCondition } = useActiveConditions();
  return detectedCondition ?? "standard";
}

// ─── useEffectiveUserId ───────────────────────────────────────────────────────

const VIEWING_KEY = "jacs_viewing_patient_id";

export function useEffectiveUserId(currentUserId: string | null) {
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(VIEWING_KEY).then((val) => {
      setViewingPatientId(val);
      setIsLoading(false);
    });
  }, []);

  const effectiveUserId = viewingPatientId ?? currentUserId;
  const isSharedAccess = viewingPatientId !== null && viewingPatientId !== currentUserId;

  const setViewingPatient = useCallback(async (patientId: string | null) => {
    setViewingPatientId(patientId);
    if (patientId) {
      await AsyncStorage.setItem(VIEWING_KEY, patientId);
    } else {
      await AsyncStorage.removeItem(VIEWING_KEY);
    }
  }, []);

  return { effectiveUserId, isSharedAccess, isLoading, setViewingPatient };
}

// ─── useSubscription ──────────────────────────────────────────────────────────

const SUBSCRIPTION_KEY = "jacs_subscription";

interface SubscriptionData {
  status: SubscriptionStatus;
  trialEnd: string | null;
  daysRemaining: number;
  isExempt: boolean;
  isBlocked: boolean;
}

export function useSubscription() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SUBSCRIPTION_KEY).then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val) as SubscriptionData;
          // Recalculate daysRemaining dynamically
          if (parsed.trialEnd) {
            const diff = Math.ceil(
              (new Date(parsed.trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
            );
            parsed.daysRemaining = Math.max(0, diff);
            parsed.isBlocked = parsed.status === "expired" || diff <= 0;
          }
          setData(parsed);
        } catch {
          // default to trial
        }
      } else {
        // Default: 14-day trial for new users
        const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
        const defaultSub: SubscriptionData = {
          status: "trial",
          trialEnd,
          daysRemaining: 14,
          isExempt: false,
          isBlocked: false,
        };
        setData(defaultSub);
        AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(defaultSub));
      }
      setIsLoading(false);
    });
  }, []);

  return { data, isLoading };
}

// ─── useHealthDataInvalidation ────────────────────────────────────────────────

const HEALTH_QUERY_KEYS = [
  "vitals",
  "medications",
  "conditions",
  "glucose",
  "bloodPressure",
  "weight",
  "heartRate",
  "oxygen",
  "temperature",
  "steps",
  "sleep",
  "meals",
  "insulin",
  "carbs",
  "activities",
  "appointments",
  "labResults",
  "insights",
  "alerts",
  "caregivers",
  "familyCircle",
  "healthScore",
  "trends",
  "reports",
  "devices",
];

export function useHealthDataInvalidation() {
  const queryClient = useQueryClient();

  const invalidateAllHealthData = useCallback(() => {
    HEALTH_QUERY_KEYS.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  }, [queryClient]);

  return { invalidateAllHealthData };
}

// ─── useVirtualDeviceMode ─────────────────────────────────────────────────────

const DEVICE_MODE_KEY = "jacs_device_mode";

export function useVirtualDeviceMode() {
  const [mode, setModeState] = useState<DataSourceMode>("virtual");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(DEVICE_MODE_KEY).then((val) => {
      if (val === "real" || val === "virtual") setModeState(val);
      setIsLoading(false);
    });
  }, []);

  const setMode = useCallback(async (newMode: DataSourceMode) => {
    setModeState(newMode);
    await AsyncStorage.setItem(DEVICE_MODE_KEY, newMode);
  }, []);

  const toggleMode = useCallback(async () => {
    const next: DataSourceMode = mode === "real" ? "virtual" : "real";
    await setMode(next);
  }, [mode, setMode]);

  return { mode, isVirtual: mode === "virtual", toggleMode, setMode, isLoading };
}

// ─── useVoiceInput ────────────────────────────────────────────────────────────

export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(async () => {
    setError(null);
    setTranscript("");
    setIsListening(true);
    // Actual speech recognition is handled by the speechRecognition service
    // This hook provides the state management layer
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const setResult = useCallback((text: string) => {
    setTranscript(text);
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setError(null);
    setIsListening(false);
  }, []);

  return { isListening, transcript, error, startListening, stopListening, setResult, reset };
}

// ─── useUserRoles ─────────────────────────────────────────────────────────────

const ROLES_KEY = "jacs_user_roles";

export function useUserRoles() {
  const [roles, setRolesState] = useState<string[]>(["patient"]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(ROLES_KEY).then((val) => {
      if (val) {
        try {
          setRolesState(JSON.parse(val));
        } catch {
          // ignore
        }
      }
      setIsLoading(false);
    });
  }, []);

  const isAdmin = roles.includes("super_admin") || roles.includes("administrator");
  const isCaregiver = roles.includes("caregiver");
  const isFamilyMember = roles.includes("family_member");

  return { roles, isAdmin, isCaregiver, isFamilyMember, isLoading };
}
