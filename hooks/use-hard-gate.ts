/**
 * useHardGate — Hard-Gate Data Entry Enforcement
 *
 * Checks whether the user has recorded all mandatory daily health metrics
 * (Blood Glucose, Insulin dose, Activity) within the current time window.
 *
 * Rules:
 * - Gate is OPEN if all three metrics are logged within the last 4 hours
 * - Gate is LOCKED if any metric is missing for > 4 hours
 * - Rapid-spike lock: if CGM trendRate > 2.0 mg/dL/min, ALL screens locked
 *   except the mandatory entry screen
 * - Persistent notifications fire every 4 hours while gate is locked
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const GATE_STORAGE_KEY = "@hard_gate_metrics";
const REMINDER_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours
const RAPID_SPIKE_THRESHOLD = 2.0; // mg/dL/min

export interface MandatoryMetrics {
  glucoseLoggedAt: string | null;   // ISO timestamp
  insulinLoggedAt: string | null;   // ISO timestamp
  activityLoggedAt: string | null;  // ISO timestamp
  lastGlucoseTrendRate: number;     // mg/dL/min from CGM
}

export interface HardGateState {
  isGateOpen: boolean;
  isRapidSpikeActive: boolean;
  missingMetrics: string[];
  metrics: MandatoryMetrics;
  logGlucose: (trendRate?: number) => Promise<void>;
  logInsulin: () => Promise<void>;
  logActivity: () => Promise<void>;
  refreshGate: () => Promise<void>;
}

const DEFAULT_METRICS: MandatoryMetrics = {
  glucoseLoggedAt: null,
  insulinLoggedAt: null,
  activityLoggedAt: null,
  lastGlucoseTrendRate: 0,
};

function isWithin4Hours(isoTimestamp: string | null): boolean {
  if (!isoTimestamp) return false;
  const logged = new Date(isoTimestamp).getTime();
  const now = Date.now();
  return now - logged < REMINDER_INTERVAL_MS;
}

async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function scheduleReminderNotification(missingMetrics: string[]): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    // Cancel any existing hard-gate reminders first
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if (n.content.data?.type === "hard_gate_reminder") {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }

    if (missingMetrics.length === 0) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ Health Data Required",
        body: `Please log your ${missingMetrics.join(", ")} to unlock the dashboard. Accurate data ensures safe AI predictions.`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: "hard_gate_reminder" },
      },
      trigger: {
        seconds: REMINDER_INTERVAL_MS / 1000,
        repeats: true,
      } as Notifications.TimeIntervalTriggerInput,
    });
  } catch {
    // Notifications may not be available in all environments
  }
}

export function useHardGate(): HardGateState {
  const [metrics, setMetrics] = useState<MandatoryMetrics>(DEFAULT_METRICS);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const computeGateState = useCallback((m: MandatoryMetrics) => {
    const missing: string[] = [];
    if (!isWithin4Hours(m.glucoseLoggedAt)) missing.push("Blood Glucose");
    if (!isWithin4Hours(m.insulinLoggedAt)) missing.push("Insulin Dose");
    if (!isWithin4Hours(m.activityLoggedAt)) missing.push("Activity");

    const isRapidSpikeActive = Math.abs(m.lastGlucoseTrendRate) > RAPID_SPIKE_THRESHOLD;
    const isGateOpen = missing.length === 0 && !isRapidSpikeActive;

    return { isGateOpen, isRapidSpikeActive, missingMetrics: missing };
  }, []);

  const loadMetrics = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(GATE_STORAGE_KEY);
      if (raw) {
        const parsed: MandatoryMetrics = JSON.parse(raw);
        setMetrics(parsed);
        const { missingMetrics } = computeGateState(parsed);
        if (missingMetrics.length > 0) {
          await scheduleReminderNotification(missingMetrics);
        } else {
          // Cancel reminders if gate is open
          if (Platform.OS !== "web") {
            const scheduled = await Notifications.getAllScheduledNotificationsAsync();
            for (const n of scheduled) {
              if (n.content.data?.type === "hard_gate_reminder") {
                await Notifications.cancelScheduledNotificationAsync(n.identifier);
              }
            }
          }
        }
      }
    } catch {
      // Storage unavailable, use defaults
    }
  }, [computeGateState]);

  const saveMetrics = useCallback(async (updated: MandatoryMetrics) => {
    try {
      await AsyncStorage.setItem(GATE_STORAGE_KEY, JSON.stringify(updated));
      setMetrics(updated);
      const { missingMetrics } = computeGateState(updated);
      await scheduleReminderNotification(missingMetrics);
    } catch {
      setMetrics(updated);
    }
  }, [computeGateState]);

  useEffect(() => {
    requestNotificationPermission();
    loadMetrics();

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        loadMetrics();
      }
      appStateRef.current = nextState;
    });

    return () => subscription.remove();
  }, [loadMetrics]);

  const logGlucose = useCallback(async (trendRate = 0) => {
    const updated: MandatoryMetrics = {
      ...metrics,
      glucoseLoggedAt: new Date().toISOString(),
      lastGlucoseTrendRate: trendRate,
    };
    await saveMetrics(updated);
  }, [metrics, saveMetrics]);

  const logInsulin = useCallback(async () => {
    const updated: MandatoryMetrics = {
      ...metrics,
      insulinLoggedAt: new Date().toISOString(),
    };
    await saveMetrics(updated);
  }, [metrics, saveMetrics]);

  const logActivity = useCallback(async () => {
    const updated: MandatoryMetrics = {
      ...metrics,
      activityLoggedAt: new Date().toISOString(),
    };
    await saveMetrics(updated);
  }, [metrics, saveMetrics]);

  const refreshGate = useCallback(async () => {
    await loadMetrics();
  }, [loadMetrics]);

  const { isGateOpen, isRapidSpikeActive, missingMetrics } = computeGateState(metrics);

  return {
    isGateOpen,
    isRapidSpikeActive,
    missingMetrics,
    metrics,
    logGlucose,
    logInsulin,
    logActivity,
    refreshGate,
  };
}
