/**
 * useHardGate — Gentle Reminder (Non-Blocking)
 *
 * The gate is ALWAYS OPEN. Users can use the app freely at any time.
 * A gentle push notification fires every 30 minutes if any metric
 * has not been logged today, encouraging (never forcing) data entry.
 *
 * The HardGateScreen is no longer rendered as a blocker — it is now
 * an optional quick-log widget accessible from the Home screen.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const GATE_STORAGE_KEY = "@hard_gate_metrics";
const REMINDER_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export interface MandatoryMetrics {
  glucoseLoggedAt: string | null;
  insulinLoggedAt: string | null;
  activityLoggedAt: string | null;
  lastGlucoseTrendRate: number;
}

export interface HardGateState {
  isGateOpen: boolean;          // Always true — kept for API compatibility
  isRapidSpikeActive: boolean;  // Always false — kept for API compatibility
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

function isToday(isoTimestamp: string | null): boolean {
  if (!isoTimestamp) return false;
  const logged = new Date(isoTimestamp);
  const now = new Date();
  return (
    logged.getFullYear() === now.getFullYear() &&
    logged.getMonth() === now.getMonth() &&
    logged.getDate() === now.getDate()
  );
}

async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

async function scheduleGentleReminder(missingMetrics: string[]): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    // Cancel existing reminders
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if (n.content.data?.type === "gentle_reminder") {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
    if (missingMetrics.length === 0) return;

    const missing = missingMetrics.join(", ");
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💙 JACS Health Reminder",
        body: `Friendly reminder to log: ${missing}. Tap to open the app — takes less than 10 seconds!`,
        sound: true,
        data: { type: "gentle_reminder" },
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

  const getMissingMetrics = useCallback((m: MandatoryMetrics): string[] => {
    const missing: string[] = [];
    if (!isToday(m.glucoseLoggedAt)) missing.push("Blood Glucose");
    if (!isToday(m.insulinLoggedAt)) missing.push("Insulin Dose");
    if (!isToday(m.activityLoggedAt)) missing.push("Activity");
    return missing;
  }, []);

  const loadMetrics = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(GATE_STORAGE_KEY);
      if (raw) {
        const parsed: MandatoryMetrics = JSON.parse(raw);
        setMetrics(parsed);
        const missing = getMissingMetrics(parsed);
        await scheduleGentleReminder(missing);
      }
    } catch {
      // Storage unavailable, use defaults — app still works
    }
  }, [getMissingMetrics]);

  const saveMetrics = useCallback(async (updated: MandatoryMetrics) => {
    try {
      await AsyncStorage.setItem(GATE_STORAGE_KEY, JSON.stringify(updated));
      setMetrics(updated);
      const missing = getMissingMetrics(updated);
      await scheduleGentleReminder(missing);
    } catch {
      setMetrics(updated);
    }
  }, [getMissingMetrics]);

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
    await saveMetrics({
      ...metrics,
      glucoseLoggedAt: new Date().toISOString(),
      lastGlucoseTrendRate: trendRate,
    });
  }, [metrics, saveMetrics]);

  const logInsulin = useCallback(async () => {
    await saveMetrics({
      ...metrics,
      insulinLoggedAt: new Date().toISOString(),
    });
  }, [metrics, saveMetrics]);

  const logActivity = useCallback(async () => {
    await saveMetrics({
      ...metrics,
      activityLoggedAt: new Date().toISOString(),
    });
  }, [metrics, saveMetrics]);

  const refreshGate = useCallback(async () => {
    await loadMetrics();
  }, [loadMetrics]);

  const missingMetrics = getMissingMetrics(metrics);

  return {
    isGateOpen: true,          // Always open — no blocking
    isRapidSpikeActive: false, // Never locks the app
    missingMetrics,
    metrics,
    logGlucose,
    logInsulin,
    logActivity,
    refreshGate,
  };
}
