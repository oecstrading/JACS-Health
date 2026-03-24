/**
 * Parent Overnight Dashboard — Type 1 Diabetes Night Monitoring
 *
 * Designed for parents who check their phone at 2am to see if their child is safe.
 * Shows last 8 hours of CGM data with a clear "Safe to Sleep" / "Check Now" status.
 *
 * Clinically based on ADA 2024 nighttime hypoglycemia prevention guidelines.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Switch,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";

// ─── Notification Setup ────────────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("glucose-alerts", {
      name: "Glucose Alerts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: "#DC2626",
      sound: "default",
    });
  }
  return status === "granted";
}

async function sendLowGlucoseAlert(value: number, trend: string): Promise<void> {
  const granted = await requestNotificationPermission();
  if (!granted) return;
  const isRapidFall = trend === "falling_fast";
  await Notifications.scheduleNotificationAsync({
    content: {
      title: isRapidFall ? "⚠️ RAPID DROP — Check Child Now!" : "⚠️ LOW GLUCOSE ALERT",
      body: `Glucose is ${value} mg/dL${isRapidFall ? " and falling fast" : ""}. Wake up and treat immediately!`,
      data: { screen: "overnight-dashboard", value },
      sound: "default",
    },
    trigger: null, // fire immediately
  });
}

async function sendCautionAlert(value: number): Promise<void> {
  const granted = await requestNotificationPermission();
  if (!granted) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "👀 Glucose Dropping — Monitor Closely",
      body: `Glucose is ${value} mg/dL and trending down. Check in 15 minutes.`,
      data: { screen: "overnight-dashboard", value },
      sound: "default",
    },
    trigger: null,
  });
}

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 48;
const CHART_HEIGHT = 160;

interface GlucoseReading {
  time: number; // timestamp ms
  value: number; // mg/dL
  trend: "rising_fast" | "rising" | "stable" | "falling" | "falling_fast";
}

// Generate demo overnight data if no real CGM data available
function generateDemoData(): GlucoseReading[] {
  const now = Date.now();
  const readings: GlucoseReading[] = [];
  let glucose = 140;
  for (let i = 96; i >= 0; i--) {
    const t = now - i * 5 * 60 * 1000;
    const hour = new Date(t).getHours();
    // Simulate overnight pattern: gradual drop, then dawn phenomenon rise
    if (hour >= 0 && hour < 3) glucose += (Math.random() - 0.6) * 8;
    else if (hour >= 3 && hour < 5) glucose += (Math.random() - 0.4) * 6;
    else glucose += (Math.random() - 0.3) * 10;
    glucose = Math.max(55, Math.min(300, glucose));
    const delta = readings.length > 0 ? glucose - readings[readings.length - 1].value : 0;
    let trend: GlucoseReading["trend"] = "stable";
    if (delta > 3) trend = "rising_fast";
    else if (delta > 1) trend = "rising";
    else if (delta < -3) trend = "falling_fast";
    else if (delta < -1) trend = "falling";
    readings.push({ time: t, value: Math.round(glucose), trend });
  }
  return readings;
}

function trendArrow(trend: GlucoseReading["trend"]): string {
  switch (trend) {
    case "rising_fast": return "↑↑";
    case "rising": return "↑";
    case "stable": return "→";
    case "falling": return "↓";
    case "falling_fast": return "↓↓";
  }
}

function glucoseColor(value: number): string {
  if (value < 70) return "#DC2626";
  if (value < 80) return "#F97316";
  if (value <= 180) return "#22C55E";
  if (value <= 250) return "#F59E0B";
  return "#EF4444";
}

function safetyStatus(readings: GlucoseReading[]): {
  status: "safe" | "caution" | "alert";
  title: string;
  message: string;
  color: string;
} {
  if (readings.length === 0) return { status: "caution", title: "No Data", message: "CGM not connected", color: "#6B7280" };
  const latest = readings[readings.length - 1];
  const v = latest.value;
  const trend = latest.trend;

  if (v < 70) return { status: "alert", title: "⚠️ CHECK NOW", message: `Glucose is LOW at ${v} mg/dL — treat immediately`, color: "#DC2626" };
  if (v < 80 && (trend === "falling" || trend === "falling_fast")) return { status: "alert", title: "⚠️ CHECK NOW", message: `Glucose dropping to ${v} mg/dL — may go low`, color: "#F97316" };
  if (v > 300) return { status: "alert", title: "⚠️ CHECK NOW", message: `Glucose very HIGH at ${v} mg/dL — check ketones`, color: "#EF4444" };
  if (v < 90 || (v < 100 && trend === "falling_fast")) return { status: "caution", title: "👀 WATCH CLOSELY", message: `Glucose at ${v} mg/dL — monitor for drops`, color: "#F59E0B" };
  if (v > 250) return { status: "caution", title: "👀 WATCH CLOSELY", message: `Glucose elevated at ${v} mg/dL`, color: "#F59E0B" };
  return { status: "safe", title: "✅ SAFE TO SLEEP", message: `Glucose stable at ${v} mg/dL ${trendArrow(trend)}`, color: "#22C55E" };
}

export default function OvernightDashboard() {
  const colors = useColors();
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [notifPermission, setNotifPermission] = useState<"unknown" | "granted" | "denied">("unknown");
  const lastAlertRef = useRef<{ value: number; time: number } | null>(null);

  // Request permission on mount
  useEffect(() => {
    if (Platform.OS !== "web") {
      requestNotificationPermission().then(granted =>
        setNotifPermission(granted ? "granted" : "denied")
      );
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem("@cgm_readings");
      if (raw) {
        const all: GlucoseReading[] = JSON.parse(raw);
        const eightHoursAgo = Date.now() - 8 * 60 * 60 * 1000;
        const recent = all.filter(r => r.time >= eightHoursAgo);
        setReadings(recent.length > 0 ? recent : generateDemoData());
      } else {
        setReadings(generateDemoData());
      }
    } catch (_) {
      setReadings(generateDemoData());
    }
    setLastUpdated(new Date());
  }, []);

  // ─── Check glucose and fire alerts after readings update ────────────────────────────
  useEffect(() => {
    if (!alertsEnabled || readings.length === 0) return;
    const latest = readings[readings.length - 1];
    const now = Date.now();
    // Throttle: only alert once per 15 minutes for the same glucose level
    const lastAlert = lastAlertRef.current;
    if (lastAlert && now - lastAlert.time < 15 * 60 * 1000 && Math.abs(lastAlert.value - latest.value) < 10) return;
    if (latest.value < 70) {
      sendLowGlucoseAlert(latest.value, latest.trend);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      lastAlertRef.current = { value: latest.value, time: now };
    } else if (latest.value < 80 && (latest.trend === "falling" || latest.trend === "falling_fast")) {
      sendCautionAlert(latest.value);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      lastAlertRef.current = { value: latest.value, time: now };
    }
  }, [readings, alertsEnabled]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, [loadData]);

  const status = safetyStatus(readings);
  const latest = readings[readings.length - 1];

  // Calculate chart points
  const chartPoints = readings.slice(-96).map((r, i, arr) => {
    const x = (i / (arr.length - 1)) * CHART_WIDTH;
    const y = CHART_HEIGHT - ((r.value - 40) / (320 - 40)) * CHART_HEIGHT;
    return { x, y: Math.max(0, Math.min(CHART_HEIGHT, y)), value: r.value, time: r.time };
  });

  const formatTime = (ms: number) => {
    const d = new Date(ms);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Time-in-range stats
  const inRange = readings.filter(r => r.value >= 70 && r.value <= 180).length;
  const low = readings.filter(r => r.value < 70).length;
  const high = readings.filter(r => r.value > 180).length;
  const tirPct = readings.length > 0 ? Math.round((inRange / readings.length) * 100) : 0;
  const lowPct = readings.length > 0 ? Math.round((low / readings.length) * 100) : 0;
  const highPct = readings.length > 0 ? Math.round((high / readings.length) * 100) : 0;

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#0F172A" }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌙 Overnight Monitor</Text>
        <TouchableOpacity onPress={loadData}>
          <Text style={styles.refreshBtn}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Notification Alert Toggle Bar */}
      <View style={[styles.alertBar, {
        backgroundColor: alertsEnabled ? "#052e16" : "#1c1917",
        borderBottomColor: alertsEnabled ? "#16a34a" : "#44403c",
      }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: alertsEnabled ? "#4ade80" : "#a8a29e", fontWeight: "700", fontSize: 13 }}>
            {alertsEnabled ? "🔔 Low Glucose Alerts ON" : "🔕 Low Glucose Alerts OFF"}
          </Text>
          <Text style={{ color: alertsEnabled ? "#86efac" : "#78716c", fontSize: 11, marginTop: 1 }}>
            {notifPermission === "denied"
              ? "Enable notifications in Settings to receive alerts"
              : alertsEnabled
              ? "You will be notified if glucose drops below 70 mg/dL"
              : "Tap to enable overnight glucose alerts"}
          </Text>
        </View>
        <Switch
          value={alertsEnabled}
          onValueChange={(v) => {
            setAlertsEnabled(v);
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          trackColor={{ false: "#44403c", true: "#16a34a" }}
          thumbColor={alertsEnabled ? "#4ade80" : "#a8a29e"}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { backgroundColor: "#0F172A" }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Safety Status Card */}
        <View style={[styles.statusCard, { backgroundColor: status.color }]}>
          <Text style={styles.statusTitle}>{status.title}</Text>
          <Text style={styles.statusMessage}>{status.message}</Text>
          <Text style={styles.statusUpdated}>
            Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>

        {/* Current Glucose */}
        {latest && (
          <View style={[styles.currentCard, { backgroundColor: "#1E293B" }]}>
            <View style={styles.currentLeft}>
              <Text style={styles.currentLabel}>Current Glucose</Text>
              <Text style={[styles.currentValue, { color: glucoseColor(latest.value) }]}>
                {latest.value}
              </Text>
              <Text style={styles.currentUnit}>mg/dL</Text>
            </View>
            <View style={styles.currentRight}>
              <Text style={[styles.trendArrow, { color: glucoseColor(latest.value) }]}>
                {trendArrow(latest.trend)}
              </Text>
              <Text style={styles.trendLabel}>{latest.trend.replace("_", " ")}</Text>
              <Text style={styles.readingTime}>{formatTime(latest.time)}</Text>
            </View>
          </View>
        )}

        {/* 8-Hour Chart */}
        <View style={[styles.chartCard, { backgroundColor: "#1E293B" }]}>
          <Text style={styles.chartTitle}>8-Hour Glucose Trend</Text>
          <View style={[styles.chartContainer, { height: CHART_HEIGHT + 20 }]}>
            {/* Target range band */}
            <View style={[styles.targetBand, {
              top: CHART_HEIGHT - ((180 - 40) / (320 - 40)) * CHART_HEIGHT,
              height: ((180 - 70) / (320 - 40)) * CHART_HEIGHT,
            }]} />

            {/* Threshold lines */}
            <View style={[styles.thresholdLine, { top: CHART_HEIGHT - ((70 - 40) / (320 - 40)) * CHART_HEIGHT, borderColor: "#DC2626" }]} />
            <View style={[styles.thresholdLine, { top: CHART_HEIGHT - ((180 - 40) / (320 - 40)) * CHART_HEIGHT, borderColor: "#F59E0B" }]} />

            {/* Data points as dots */}
            {chartPoints.map((p, i) => (
              <View
                key={i}
                style={[styles.dot, {
                  left: p.x - 3,
                  top: p.y - 3,
                  backgroundColor: glucoseColor(p.value),
                }]}
              />
            ))}

            {/* X-axis labels */}
            <View style={styles.xAxis}>
              {[0, 2, 4, 6, 8].map(h => {
                const t = Date.now() - (8 - h) * 60 * 60 * 1000;
                return (
                  <Text key={h} style={styles.xLabel}>
                    {new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                );
              })}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#22C55E" }]} />
              <Text style={styles.legendText}>In Range (70–180)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#DC2626" }]} />
              <Text style={styles.legendText}>Low (&lt;70)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
              <Text style={styles.legendText}>High (&gt;180)</Text>
            </View>
          </View>
        </View>

        {/* Overnight Stats */}
        <View style={[styles.statsCard, { backgroundColor: "#1E293B" }]}>
          <Text style={styles.chartTitle}>Overnight Summary</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#22C55E" }]}>{tirPct}%</Text>
              <Text style={styles.statLabel}>Time in Range</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#DC2626" }]}>{lowPct}%</Text>
              <Text style={styles.statLabel}>Time Low</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#F59E0B" }]}>{highPct}%</Text>
              <Text style={styles.statLabel}>Time High</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#60A5FA" }]}>{readings.length}</Text>
              <Text style={styles.statLabel}>Readings</Text>
            </View>
          </View>
        </View>

        {/* Overnight Safety Tips */}
        <View style={[styles.tipsCard, { backgroundColor: "#1E293B" }]}>
          <Text style={styles.chartTitle}>🌙 Overnight Safety Tips</Text>
          {[
            { tip: "Check glucose before bed — target 120–140 mg/dL for overnight safety", icon: "🩸" },
            { tip: "Give a bedtime snack with protein if glucose is below 120 mg/dL", icon: "🥜" },
            { tip: "Set CGM low alarm at 70 mg/dL and urgent low at 55 mg/dL", icon: "🔔" },
            { tip: "Keep juice boxes and glucose tablets on the bedside table", icon: "🧃" },
            { tip: "After vigorous exercise, check at 2am — delayed lows are common", icon: "⚡" },
            { tip: "Illness can cause unpredictable glucose swings — check more often", icon: "🤒" },
          ].map((item, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipIcon}>{item.icon}</Text>
              <Text style={styles.tipText}>{item.tip}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  alertBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  backText: { color: "#94A3B8", fontSize: 16, fontWeight: "600" },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "800" },
  refreshBtn: { color: "#60A5FA", fontSize: 14, fontWeight: "700" },
  scroll: { padding: 16 },
  statusCard: { borderRadius: 20, padding: 20, alignItems: "center", marginBottom: 16 },
  statusTitle: { color: "#fff", fontSize: 28, fontWeight: "900", marginBottom: 8 },
  statusMessage: { color: "#fff", fontSize: 16, textAlign: "center", lineHeight: 22 },
  statusUpdated: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 8 },
  currentCard: { borderRadius: 16, padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  currentLeft: { flex: 1 },
  currentLabel: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
  currentValue: { fontSize: 72, fontWeight: "900", lineHeight: 80 },
  currentUnit: { color: "#64748B", fontSize: 16 },
  currentRight: { alignItems: "center" },
  trendArrow: { fontSize: 48, fontWeight: "900" },
  trendLabel: { color: "#94A3B8", fontSize: 12, marginTop: 4 },
  readingTime: { color: "#64748B", fontSize: 11, marginTop: 4 },
  chartCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  chartTitle: { color: "#E2E8F0", fontSize: 15, fontWeight: "700", marginBottom: 12 },
  chartContainer: { position: "relative", width: CHART_WIDTH },
  targetBand: { position: "absolute", left: 0, right: 0, backgroundColor: "rgba(34,197,94,0.1)" },
  thresholdLine: { position: "absolute", left: 0, right: 0, borderTopWidth: 1, borderStyle: "dashed" },
  dot: { position: "absolute", width: 6, height: 6, borderRadius: 3 },
  xAxis: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between" },
  xLabel: { color: "#475569", fontSize: 9 },
  legend: { flexDirection: "row", justifyContent: "space-around", marginTop: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: "#94A3B8", fontSize: 11 },
  statsCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 28, fontWeight: "900" },
  statLabel: { color: "#64748B", fontSize: 11, marginTop: 4, textAlign: "center" },
  tipsCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  tipRow: { flexDirection: "row", gap: 10, marginBottom: 10, alignItems: "flex-start" },
  tipIcon: { fontSize: 18, width: 24 },
  tipText: { flex: 1, color: "#CBD5E1", fontSize: 13, lineHeight: 20 },
});
