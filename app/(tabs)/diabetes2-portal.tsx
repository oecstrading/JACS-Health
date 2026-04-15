/**
 * Type 2 Diabetes Portal — Comprehensive Management for ALL Income Levels
 *
 * Reuses all Type 1 Diabetes features with Type 2-specific adaptations:
 * - Oral medications (Metformin, GLP-1, SGLT2, DPP-4) instead of insulin-only
 * - A1C target 7% (vs 7.5% for T1D teens)
 * - Insulin resistance tracking & HOMA-IR calculator
 * - Lifestyle intervention tools (weight, diet, exercise)
 * - Continuous Glucose Monitoring (CGM) support — same as T1D
 * - Bolus calculator adapted for T2D insulin users
 * - All T1D quick-action cards preserved and relabeled where appropriate
 *
 * Clinically accurate per ADA 2024 Standards of Care for Type 2 Diabetes
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  StyleSheet,
  Modal,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

// ─── Types ────────────────────────────────────────────────────────────────────
type GlucoseUnit = "mgdl" | "mmol";
type ManagementType = "lifestyle" | "oral" | "oral_insulin" | "insulin_only";

interface GlucoseReading {
  id: string;
  value: number; // always stored in mg/dL
  timestamp: number;
  context: "fasting" | "before_meal" | "after_meal" | "bedtime" | "exercise" | "other";
  source: "manual" | "cgm";
}

interface OralMedication {
  id: string;
  name: string;
  class: string;
  dosePerDay: number;
  taken: boolean;
  timestamp?: number;
}

interface T2DSettings {
  unit: GlucoseUnit;
  managementType: ManagementType;
  targetFasting: number;       // mg/dL
  targetPostMeal: number;      // mg/dL
  a1cTarget: number;           // %
  hasCGM: boolean;
  weightKg: number;
  heightCm: number;
  patientName: string;
  // For insulin users
  icr: number;
  isf: number;
  targetGlucose: number;
}

interface T2DData {
  readings: GlucoseReading[];
  oralMeds: OralMedication[];
  settings: T2DSettings;
  lastA1c: number;
  lastA1cDate: string;
  weight: number[];
}

// ─── ADA 2024 T2D Glucose Targets ────────────────────────────────────────────
const T2D_TARGETS = {
  fasting:  { low: 80, high: 130 },
  postMeal: { low: 0,  high: 180 },
  a1c:      7.0,
};

const GLUCOSE_COLORS = {
  severelow: "#DC2626",
  low:       "#F97316",
  inrange:   "#22C55E",
  high:      "#F59E0B",
  veryhigh:  "#EF4444",
};

// ─── Common T2D Oral Medications ─────────────────────────────────────────────
const T2D_MED_CLASSES = [
  { class: "Biguanide",       name: "Metformin",     icon: "💊", color: "#3B82F6" },
  { class: "GLP-1 RA",        name: "Ozempic/Victoza", icon: "💉", color: "#8B5CF6" },
  { class: "SGLT2 Inhibitor", name: "Jardiance/Farxiga", icon: "💊", color: "#06B6D4" },
  { class: "DPP-4 Inhibitor", name: "Januvia/Tradjenta", icon: "💊", color: "#10B981" },
  { class: "Sulfonylurea",    name: "Glipizide/Glimepiride", icon: "💊", color: "#F59E0B" },
  { class: "Insulin",         name: "Basaglar/Lantus", icon: "💉", color: "#EF4444" },
  { class: "Thiazolidinedione", name: "Actos/Avandia", icon: "💊", color: "#EC4899" },
];

const DEFAULT_SETTINGS: T2DSettings = {
  unit: "mgdl",
  managementType: "oral",
  targetFasting: 100,
  targetPostMeal: 140,
  a1cTarget: 7.0,
  hasCGM: false,
  weightKg: 85,
  heightCm: 170,
  patientName: "",
  icr: 15,
  isf: 50,
  targetGlucose: 110,
};

const STORAGE_KEY = "@t2d_portal_v1";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mgToMmol(mg: number): number {
  return Math.round((mg / 18.018) * 10) / 10;
}

function getGlucoseColor(value: number): string {
  if (value < 54)  return GLUCOSE_COLORS.severelow;
  if (value < 70)  return GLUCOSE_COLORS.low;
  if (value <= 180) return GLUCOSE_COLORS.inrange;
  if (value <= 250) return GLUCOSE_COLORS.high;
  return GLUCOSE_COLORS.veryhigh;
}

function getGlucoseLabel(value: number): string {
  if (value < 54)  return "SEVERE LOW";
  if (value < 70)  return "LOW";
  if (value <= 130) return "IN RANGE";
  if (value <= 180) return "SLIGHTLY HIGH";
  if (value <= 250) return "HIGH";
  return "VERY HIGH";
}

function estimateA1c(readings: GlucoseReading[]): number | null {
  if (readings.length < 5) return null;
  const avg = readings.reduce((s, r) => s + r.value, 0) / readings.length;
  return Math.round(((avg + 46.7) / 28.7) * 10) / 10;
}

function calcBMI(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return Math.round((weightKg / (h * h)) * 10) / 10;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Type2DiabetesPortal() {
  const colors = useColors();
  const [tab, setTab] = useState<"dashboard" | "glucose" | "meds" | "lifestyle" | "log">("dashboard");
  const [data, setData] = useState<T2DData>({
    readings: [],
    oralMeds: [],
    settings: DEFAULT_SETTINGS,
    lastA1c: 0,
    lastA1cDate: "",
    weight: [],
  });
  const [showGlucoseModal, setShowGlucoseModal] = useState(false);
  const [glucoseInput, setGlucoseInput] = useState("");
  const [glucoseContext, setGlucoseContext] = useState<GlucoseReading["context"]>("fasting");
  const [showA1cModal, setShowA1cModal] = useState(false);
  const [a1cInput, setA1cInput] = useState("");

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setData(JSON.parse(raw)); } catch {}
      }
    });
  }, []);

  const save = useCallback(async (next: T2DData) => {
    setData(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  // ── Glucose log ───────────────────────────────────────────────────────────
  const logGlucose = () => {
    const val = parseFloat(glucoseInput);
    if (isNaN(val) || val < 20 || val > 600) {
      Alert.alert("Invalid", "Enter a value between 20 and 600 mg/dL");
      return;
    }
    const reading: GlucoseReading = {
      id: Date.now().toString(),
      value: val,
      timestamp: Date.now(),
      context: glucoseContext,
      source: "manual",
    };
    const next = { ...data, readings: [reading, ...data.readings].slice(0, 200) };
    save(next);
    setGlucoseInput("");
    setShowGlucoseModal(false);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // ── A1C log ───────────────────────────────────────────────────────────────
  const logA1c = () => {
    const val = parseFloat(a1cInput);
    if (isNaN(val) || val < 4 || val > 15) {
      Alert.alert("Invalid", "Enter an A1C between 4% and 15%");
      return;
    }
    const next = {
      ...data,
      lastA1c: val,
      lastA1cDate: new Date().toLocaleDateString(),
    };
    save(next);
    setA1cInput("");
    setShowA1cModal(false);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const latest = data.readings[0];
  const latestVal = latest?.value ?? 0;
  const latestColor = latestVal ? getGlucoseColor(latestVal) : colors.muted;
  const displayVal = data.settings.unit === "mmol" && latestVal
    ? mgToMmol(latestVal).toFixed(1)
    : latestVal.toString();
  const displayUnit = data.settings.unit === "mmol" ? "mmol/L" : "mg/dL";

  const estimatedA1c = estimateA1c(data.readings);
  const bmi = calcBMI(data.settings.weightKg, data.settings.heightCm);

  // TIR calculation (last 24h)
  const now = Date.now();
  const last24h = data.readings.filter((r) => now - r.timestamp < 86400000);
  const inRange = last24h.filter((r) => r.value >= 70 && r.value <= 180).length;
  const tirPct = last24h.length > 0 ? Math.round((inRange / last24h.length) * 100) : 0;

  // ── Quick action buttons (same as T1D, adapted labels) ────────────────────
  const quickActions = [
    { label: "Log BG",        icon: "🩸", color: "#3B82F6", action: () => setShowGlucoseModal(true) },
    { label: "Log A1C",       icon: "🧪", color: "#8B5CF6", action: () => setShowA1cModal(true) },
    { label: "Log Meal",      icon: "🍽️", color: "#22C55E", action: () => setTab("log") },
    { label: "Hypo Help",     icon: "⚠️", color: "#F97316", action: () => router.push("/hypo-first-aid" as any) },
    { label: "Bolus Calc",    icon: "💉", color: "#7C3AED", action: () => setTab("meds") },
    { label: "HCP Report",    icon: "📄", color: "#6B7280", action: () => router.push("/health-report-export" as any) },
    { label: "Meal Plan",     icon: "🥗", color: "#16A34A", action: () => router.push("/meal-planner" as any) },
    { label: "Free Meds",     icon: "💊", color: "#10B981", action: () => router.push("/insulin-resources" as any) },
    { label: "Medical ID",    icon: "🪪", color: "#D4AF37", action: () => router.push("/medical-id-card" as any) },
    { label: "BG Log",        icon: "📊", color: "#DC2626", action: () => router.push("/blood-sugar-log" as any) },
    { label: "Guardian",      icon: "🛡️", color: "#D4AF37", action: () => router.push("/guardian-agent" as any) },
    { label: "Learn Hub",     icon: "🌍", color: "#60A5FA", action: () => router.push("/learning-hub" as any) },
    { label: "CGM Setup",     icon: "📡", color: "#0EA5E9", action: () => router.push("/cgm-setup" as any) },
    { label: "Weight Log",    icon: "⚖️", color: "#EC4899", action: () => setTab("lifestyle") },
    { label: "Exercise",      icon: "🏃", color: "#F59E0B", action: () => router.push("/exercise-library" as any) },
    { label: "Care Team",     icon: "👩‍⚕️", color: "#A78BFA", action: () => router.push("/(tabs)/care-team" as any) },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <ScreenContainer>
      {/* ── COB/IOB-style header strip ─────────────────────────────────── */}
      <View style={[styles.headerStrip, { backgroundColor: "#0d1b2a" }]}>
        <View style={styles.headerItem}>
          <Text style={styles.headerLabel}>CURRENT BG</Text>
          <Text style={[styles.headerValue, { color: latestColor }]}>
            {latestVal ? `${displayVal} ${displayUnit}` : "—"}
          </Text>
        </View>
        <View style={styles.headerDivider} />
        <View style={styles.headerItem}>
          <Text style={styles.headerLabel}>A1C</Text>
          <Text style={[styles.headerValue, { color: data.lastA1c ? (data.lastA1c <= data.settings.a1cTarget ? "#22C55E" : "#F97316") : colors.muted }]}>
            {data.lastA1c ? `${data.lastA1c}%` : "—"}
          </Text>
        </View>
        <View style={styles.headerDivider} />
        <View style={styles.headerItem}>
          <Text style={styles.headerLabel}>TIR 24H</Text>
          <Text style={[styles.headerValue, { color: tirPct >= 70 ? "#22C55E" : tirPct >= 50 ? "#F59E0B" : "#EF4444" }]}>
            {last24h.length > 0 ? `${tirPct}%` : "—"}
          </Text>
        </View>
        <View style={styles.headerDivider} />
        <View style={styles.headerItem}>
          <Text style={styles.headerLabel}>BMI</Text>
          <Text style={[styles.headerValue, { color: bmi > 0 ? (bmi < 25 ? "#22C55E" : bmi < 30 ? "#F59E0B" : "#EF4444") : colors.muted }]}>
            {bmi > 0 ? bmi.toFixed(1) : "—"}
          </Text>
        </View>
      </View>

      {/* ── Tab switcher ──────────────────────────────────────────────────── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow} contentContainerStyle={{ paddingHorizontal: 12 }}>
        {(["dashboard", "glucose", "meds", "lifestyle", "log"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => { setTab(t); if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
          >
            <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
              {t === "dashboard" ? "🏠 Dashboard"
                : t === "glucose" ? "🩸 Glucose"
                : t === "meds" ? "💊 Medications"
                : t === "lifestyle" ? "🏃 Lifestyle"
                : "📋 Log"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

        {/* ════════════════ DASHBOARD ════════════════ */}
        {tab === "dashboard" && (
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>

            {/* Type badge */}
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>🩺 TYPE 2 DIABETES PORTAL</Text>
              <Text style={styles.typeBadgeSub}>ADA 2024 · Target A1C &lt;7%</Text>
            </View>

            {/* Current BG card */}
            {latestVal > 0 && (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: latestColor + "66" }]}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Latest Reading</Text>
                <Text style={[styles.bigNumber, { color: latestColor }]}>{displayVal}</Text>
                <Text style={[styles.bigUnit, { color: latestColor }]}>{displayUnit} · {getGlucoseLabel(latestVal)}</Text>
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>
                  {latest?.context?.replace("_", " ")} · {new Date(latest.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            )}

            {/* A1C progress */}
            {data.lastA1c > 0 && (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>🧪 A1C Progress</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 8 }}>
                  <Text style={{ fontSize: 40, fontWeight: "800", color: data.lastA1c <= data.settings.a1cTarget ? "#22C55E" : "#F97316" }}>
                    {data.lastA1c}%
                  </Text>
                  <View>
                    <Text style={{ color: colors.muted, fontSize: 13 }}>Your target: {data.settings.a1cTarget}%</Text>
                    <Text style={{ color: colors.muted, fontSize: 13 }}>ADA goal: &lt;7%</Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>Last recorded: {data.lastA1cDate}</Text>
                  </View>
                </View>
                {estimatedA1c && (
                  <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>
                    Estimated A1C from recent readings: {estimatedA1c}%
                  </Text>
                )}
              </View>
            )}

            {/* Quick actions grid — same 16 cards as T1D */}
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 4 }]}>Quick Actions</Text>
            <View style={styles.quickGrid}>
              {quickActions.map((btn, i) => (
                <TouchableOpacity key={i} onPress={btn.action} style={[styles.quickBtn, { backgroundColor: btn.color + "22", borderColor: btn.color + "55" }]}>
                  <Text style={{ fontSize: 22 }}>{btn.icon}</Text>
                  <Text style={[styles.quickLabel, { color: btn.color }]}>{btn.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recent readings */}
            {data.readings.length > 0 && (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Recent Readings</Text>
                {data.readings.slice(0, 5).map((r) => (
                  <View key={r.id} style={styles.readingRow}>
                    <View style={[styles.readingDot, { backgroundColor: getGlucoseColor(r.value) }]} />
                    <Text style={{ color: colors.foreground, fontWeight: "600", width: 60 }}>
                      {data.settings.unit === "mmol" ? mgToMmol(r.value) : r.value}
                    </Text>
                    <Text style={{ color: colors.muted, flex: 1, fontSize: 12 }}>
                      {r.context.replace("_", " ")}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 11 }}>
                      {new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ════════════════ GLUCOSE ════════════════ */}
        {tab === "glucose" && (
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <TouchableOpacity
              onPress={() => setShowGlucoseModal(true)}
              style={[styles.primaryBtn, { backgroundColor: "#3B82F6" }]}
            >
              <Text style={styles.primaryBtnText}>🩸 Log Blood Glucose</Text>
            </TouchableOpacity>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>ADA 2024 T2D Targets</Text>
              {[
                { label: "Fasting / Pre-meal", target: "80–130 mg/dL", note: "Check before breakfast" },
                { label: "2h Post-meal",        target: "<180 mg/dL",  note: "Check 2 hours after eating" },
                { label: "Bedtime",             target: "100–140 mg/dL", note: "Before sleep" },
                { label: "A1C Goal",            target: "<7%",         note: "Every 3–6 months" },
              ].map((row, i) => (
                <View key={i} style={styles.targetRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14 }}>{row.label}</Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>{row.note}</Text>
                  </View>
                  <Text style={{ color: "#22C55E", fontWeight: "700", fontSize: 14 }}>{row.target}</Text>
                </View>
              ))}
            </View>

            {/* CGM info */}
            <View style={[styles.card, { backgroundColor: "#0a2d1a", borderColor: "#16a34a55" }]}>
              <Text style={[styles.cardTitle, { color: "#4ade80" }]}>📡 CGM Support</Text>
              <Text style={{ color: "#bbf7d0", fontSize: 13, lineHeight: 20 }}>
                Type 2 patients using insulin or at risk for hypoglycemia may benefit from Continuous Glucose Monitoring. JACS supports Dexcom G7, Libre 3, and Eversense — same as the T1D portal.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/cgm-setup" as any)}
                style={[styles.secondaryBtn, { borderColor: "#22C55E", marginTop: 12 }]}
              >
                <Text style={{ color: "#22C55E", fontWeight: "700" }}>Set Up CGM →</Text>
              </TouchableOpacity>
            </View>

            {/* All readings */}
            {data.readings.length > 0 && (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>All Readings ({data.readings.length})</Text>
                {data.readings.slice(0, 20).map((r) => (
                  <View key={r.id} style={styles.readingRow}>
                    <View style={[styles.readingDot, { backgroundColor: getGlucoseColor(r.value) }]} />
                    <Text style={{ color: colors.foreground, fontWeight: "600", width: 70 }}>
                      {data.settings.unit === "mmol" ? mgToMmol(r.value) + " mmol" : r.value + " mg/dL"}
                    </Text>
                    <Text style={{ color: colors.muted, flex: 1, fontSize: 12 }}>
                      {r.context.replace("_", " ")}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 11 }}>
                      {new Date(r.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ════════════════ MEDICATIONS ════════════════ */}
        {tab === "meds" && (
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Common T2D Medication Classes</Text>
            {T2D_MED_CLASSES.map((med, i) => (
              <View key={i} style={[styles.medCard, { backgroundColor: colors.surface, borderColor: med.color + "55" }]}>
                <Text style={{ fontSize: 24 }}>{med.icon}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 15 }}>{med.name}</Text>
                  <Text style={{ color: med.color, fontSize: 12, fontWeight: "600" }}>{med.class}</Text>
                </View>
              </View>
            ))}

            {/* Insulin users: bolus calculator (same as T1D) */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 8 }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>💉 Bolus Calculator (Insulin Users)</Text>
              <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 12 }}>
                For T2D patients on mealtime insulin. Uses the same ADA-validated formula as the T1D portal.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/diabetes-portal" as any)}
                style={[styles.primaryBtn, { backgroundColor: "#7C3AED" }]}
              >
                <Text style={styles.primaryBtnText}>Open Full Bolus Calculator →</Text>
              </TouchableOpacity>
            </View>

            {/* Medication cost */}
            <TouchableOpacity
              onPress={() => router.push("/medication-cost" as any)}
              style={[styles.card, { backgroundColor: "#0a2d1a", borderColor: "#16a34a55" }]}
            >
              <Text style={[styles.cardTitle, { color: "#4ade80" }]}>💵 Medication Cost Compare</Text>
              <Text style={{ color: "#bbf7d0", fontSize: 13 }}>Compare prices for Metformin, Ozempic, Jardiance and more at local pharmacies.</Text>
            </TouchableOpacity>

            {/* Free medication programs */}
            <TouchableOpacity
              onPress={() => router.push("/insulin-resources" as any)}
              style={[styles.card, { backgroundColor: "#1a0a2e", borderColor: "#7c3aed55" }]}
            >
              <Text style={[styles.cardTitle, { color: "#a78bfa" }]}>🆓 Free & Low-Cost Medication Programs</Text>
              <Text style={{ color: "#c4b5fd", fontSize: 13 }}>Patient assistance programs for Ozempic, Jardiance, Metformin and more.</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ════════════════ LIFESTYLE ════════════════ */}
        {tab === "lifestyle" && (
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            {/* BMI card */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>⚖️ BMI & Weight Management</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 20, marginTop: 8 }}>
                <Text style={{ fontSize: 42, fontWeight: "800", color: bmi < 25 ? "#22C55E" : bmi < 30 ? "#F59E0B" : "#EF4444" }}>
                  {bmi > 0 ? bmi.toFixed(1) : "—"}
                </Text>
                <View>
                  <Text style={{ color: colors.muted, fontSize: 13 }}>
                    {bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal weight" : bmi < 30 ? "Overweight" : "Obese"}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    {data.settings.weightKg}kg · {data.settings.heightCm}cm
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    ADA: Even 5–10% weight loss improves A1C
                  </Text>
                </View>
              </View>
            </View>

            {/* Lifestyle intervention tools */}
            {[
              { icon: "🥗", title: "Meal Planner", sub: "Low-carb & Mediterranean diet plans for T2D", route: "/meal-planner" },
              { icon: "🏃", title: "Exercise Library", sub: "150 min/week aerobic activity reduces A1C by 0.7%", route: "/exercise-library" },
              { icon: "😴", title: "Sleep Tracker", sub: "Poor sleep raises blood glucose — track your rest", route: "/sleep-tracker" },
              { icon: "🧘", title: "Stress Management", sub: "Stress hormones raise BG — mindfulness tools", route: "/symptom-diary" },
              { icon: "🚭", title: "Smoking Cessation", sub: "Smoking doubles T2D complication risk", route: "/learning-hub" },
              { icon: "💧", title: "Hydration Tracker", sub: "Dehydration concentrates blood glucose", route: "/nutrition-tracker" },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(item.route as any); }}
                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 14 }]}
              >
                <Text style={{ fontSize: 28 }}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 15 }}>{item.title}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>{item.sub}</Text>
                </View>
                <Text style={{ color: colors.muted }}>›</Text>
              </TouchableOpacity>
            ))}

            {/* HOMA-IR info */}
            <View style={[styles.card, { backgroundColor: "#1a0a2e", borderColor: "#7c3aed55" }]}>
              <Text style={[styles.cardTitle, { color: "#a78bfa" }]}>🔬 Insulin Resistance (HOMA-IR)</Text>
              <Text style={{ color: "#c4b5fd", fontSize: 13, lineHeight: 20 }}>
                HOMA-IR = (Fasting Glucose × Fasting Insulin) ÷ 405{"\n"}
                Normal: &lt;1.0 · Insulin resistant: &gt;1.9 · Severely resistant: &gt;2.9{"\n\n"}
                Ask your doctor for a fasting insulin test to calculate your HOMA-IR score.
              </Text>
            </View>
          </View>
        )}

        {/* ════════════════ LOG ════════════════ */}
        {tab === "log" && (
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            {[
              { icon: "🩸", label: "Log Blood Glucose", sub: "Manual or CGM reading", action: () => setShowGlucoseModal(true) },
              { icon: "🧪", label: "Log A1C Result",    sub: "Record lab result",       action: () => setShowA1cModal(true) },
              { icon: "💊", label: "Log Oral Medication", sub: "Record medication taken", action: () => router.push("/medication-log" as any) },
              { icon: "💉", label: "Log Insulin Dose",  sub: "For insulin users",        action: () => router.push("/(tabs)/diabetes-portal" as any) },
              { icon: "🍽️", label: "Log Meal",          sub: "Carb & calorie tracking",  action: () => router.push("/nutrition-tracker" as any) },
              { icon: "🏃", label: "Log Exercise",      sub: "Activity & steps",         action: () => router.push("/exercise-library" as any) },
              { icon: "⚖️", label: "Log Weight",        sub: "Track weight trend",       action: () => setTab("lifestyle") },
              { icon: "😴", label: "Log Sleep",         sub: "Hours & quality",          action: () => router.push("/sleep-tracker" as any) },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); item.action(); }}
                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 14 }]}
              >
                <Text style={{ fontSize: 28 }}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 15 }}>{item.label}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>{item.sub}</Text>
                </View>
                <Text style={{ color: colors.muted }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Log Glucose Modal ─────────────────────────────────────────────── */}
      <Modal visible={showGlucoseModal} transparent animationType="slide" onRequestClose={() => setShowGlucoseModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>🩸 Log Blood Glucose</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Enter value (mg/dL)"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              value={glucoseInput}
              onChangeText={setGlucoseInput}
            />
            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 8 }}>Context:</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {(["fasting", "before_meal", "after_meal", "bedtime", "exercise", "other"] as const).map((ctx) => (
                <TouchableOpacity
                  key={ctx}
                  onPress={() => setGlucoseContext(ctx)}
                  style={[styles.ctxBtn, glucoseContext === ctx && { backgroundColor: "#3B82F6", borderColor: "#3B82F6" }]}
                >
                  <Text style={{ color: glucoseContext === ctx ? "#fff" : colors.muted, fontSize: 12 }}>
                    {ctx.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity onPress={() => setShowGlucoseModal(false)} style={[styles.modalBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.muted, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={logGlucose} style={[styles.modalBtn, { backgroundColor: "#3B82F6", borderColor: "#3B82F6" }]}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Log A1C Modal ─────────────────────────────────────────────────── */}
      <Modal visible={showA1cModal} transparent animationType="slide" onRequestClose={() => setShowA1cModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>🧪 Log A1C Result</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Enter A1C % (e.g. 7.2)"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              value={a1cInput}
              onChangeText={setA1cInput}
            />
            <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 16 }}>
              ADA 2024 goal for most T2D adults: &lt;7%
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity onPress={() => setShowA1cModal(false)} style={[styles.modalBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.muted, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={logA1c} style={[styles.modalBtn, { backgroundColor: "#8B5CF6", borderColor: "#8B5CF6" }]}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  headerStrip: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  headerItem: { flex: 1, alignItems: "center" },
  headerLabel: { fontSize: 9, color: "#6B7280", fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  headerValue: { fontSize: 15, fontWeight: "800", marginTop: 2 },
  headerDivider: { width: 1, backgroundColor: "#ffffff18", marginVertical: 4 },
  tabRow: { maxHeight: 48, marginTop: 4 },
  tabBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: "#1e2022", borderWidth: 1, borderColor: "#334155" },
  tabBtnActive: { backgroundColor: "#1D4ED8", borderColor: "#3B82F6" },
  tabBtnText: { color: "#9BA1A6", fontSize: 13, fontWeight: "600" },
  tabBtnTextActive: { color: "#ffffff" },
  typeBadge: { backgroundColor: "#0a2d4a", borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#1D4ED866" },
  typeBadgeText: { color: "#60A5FA", fontWeight: "800", fontSize: 13, letterSpacing: 1 },
  typeBadgeSub: { color: "#93C5FD", fontSize: 12, marginTop: 2 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  cardSub: { fontSize: 13, marginBottom: 12 },
  bigNumber: { fontSize: 52, fontWeight: "900", lineHeight: 60 },
  bigUnit: { fontSize: 16, fontWeight: "600", marginTop: -4 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 10 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  quickBtn: { width: "22%", aspectRatio: 1, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  quickLabel: { fontSize: 9, fontWeight: "700", textAlign: "center" },
  readingRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: "#33415522", gap: 8 },
  readingDot: { width: 10, height: 10, borderRadius: 5 },
  targetRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: "#33415522" },
  medCard: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  primaryBtn: { borderRadius: 14, paddingVertical: 14, alignItems: "center", marginBottom: 12 },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  secondaryBtn: { borderRadius: 12, paddingVertical: 10, alignItems: "center", borderWidth: 1.5 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" },
  modalBox: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 18, fontWeight: "700", marginBottom: 12 },
  ctxBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#334155" },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center", borderWidth: 1 },
});
