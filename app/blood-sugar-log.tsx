/**
 * Blood Sugar Log
 * - Quick-entry pad (mg/dL or mmol/L)
 * - Meal context tags (Fasting, Before Meal, After Meal, Bedtime, Night Check)
 * - 7-day sparkline chart (Chart.js-style via SVG path)
 * - Stats: avg, time-in-range, highest, lowest
 * - Full history list with delete
 * - Persisted via AsyncStorage
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Platform, FlatList, Dimensions,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import Svg, { Polyline, Line, Text as SvgText, Circle } from "react-native-svg";

// ─── Types ───────────────────────────────────────────────────────────────────
type MealTag = "Fasting" | "Before Meal" | "After Meal" | "Bedtime" | "Night Check" | "Other";
interface Reading {
  id: string;
  value: number;       // always stored as mg/dL
  tag: MealTag;
  note: string;
  timestamp: number;   // ms
}

// ─── Constants ───────────────────────────────────────────────────────────────
const KEY = "@blood_sugar_log_v2";
const MEAL_TAGS: MealTag[] = ["Fasting", "Before Meal", "After Meal", "Bedtime", "Night Check", "Other"];
const TAG_ICONS: Record<MealTag, string> = {
  "Fasting": "🌅", "Before Meal": "🍽️", "After Meal": "✅",
  "Bedtime": "🌙", "Night Check": "⏰", "Other": "📌",
};
const RANGE = { low: 70, highNormal: 180 };   // mg/dL ADA targets
const SCREEN_W = Dimensions.get("window").width;
const CHART_W = SCREEN_W - 48;
const CHART_H = 140;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const mgToMmol = (v: number) => (v / 18.0182).toFixed(1);
const mmolToMg = (v: number) => Math.round(v * 18.0182);
const fmtTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmtDate = (ts: number) => new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
const rangeColor = (v: number) => v < RANGE.low ? "#EF4444" : v > RANGE.highNormal ? "#F59E0B" : "#22C55E";
const rangeLabel = (v: number) => v < RANGE.low ? "LOW" : v > RANGE.highNormal ? "HIGH" : "IN RANGE";

// ─── Mini Sparkline Chart ─────────────────────────────────────────────────────
function SparkChart({ readings }: { readings: Reading[] }) {
  if (readings.length < 2) return null;

  // Last 14 readings, oldest first
  const pts = [...readings].sort((a, b) => a.timestamp - b.timestamp).slice(-14);
  const vals = pts.map(r => r.value);
  const min = Math.max(0, Math.min(...vals) - 20);
  const max = Math.max(...vals) + 20;
  const range = max - min || 1;

  const toX = (i: number) => (i / (pts.length - 1)) * (CHART_W - 32);
  const toY = (v: number) => CHART_H - 20 - ((v - min) / range) * (CHART_H - 40);

  const points = pts.map((r, i) => `${toX(i).toFixed(1)},${toY(r.value).toFixed(1)}`).join(" ");
  const lowY = toY(RANGE.low);
  const highY = toY(RANGE.highNormal);

  return (
    <Svg width={CHART_W - 32} height={CHART_H}>
      {/* Target range band */}
      <Line x1={0} y1={lowY} x2={CHART_W - 32} y2={lowY} stroke="#EF4444" strokeWidth={1} strokeDasharray="4,3" opacity={0.5} />
      <Line x1={0} y1={highY} x2={CHART_W - 32} y2={highY} stroke="#F59E0B" strokeWidth={1} strokeDasharray="4,3" opacity={0.5} />
      <SvgText x={2} y={lowY - 3} fontSize={9} fill="#EF4444" opacity={0.8}>70</SvgText>
      <SvgText x={2} y={highY - 3} fontSize={9} fill="#F59E0B" opacity={0.8}>180</SvgText>
      {/* Line */}
      <Polyline points={points} fill="none" stroke="#60A5FA" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots */}
      {pts.map((r, i) => (
        <Circle key={r.id} cx={toX(i)} cy={toY(r.value)} r={4} fill={rangeColor(r.value)} />
      ))}
    </Svg>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function BloodSugarLog() {
  const colors = useColors();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [selectedTag, setSelectedTag] = useState<MealTag>("Before Meal");
  const [note, setNote] = useState("");
  const [useMmol, setUseMmol] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) try { setReadings(JSON.parse(raw)); } catch {}
    });
  }, []);

  const persist = useCallback(async (data: Reading[]) => {
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  }, []);

  const addReading = async () => {
    const num = parseFloat(inputVal);
    if (isNaN(num) || num <= 0) { Alert.alert("Invalid value", "Please enter a valid blood sugar reading."); return; }
    const mgVal = useMmol ? mmolToMg(num) : Math.round(num);
    if (mgVal < 20 || mgVal > 600) { Alert.alert("Out of range", "Value must be between 20–600 mg/dL (1.1–33.3 mmol/L)."); return; }

    setSaving(true);
    const newReading: Reading = { id: Date.now().toString(), value: mgVal, tag: selectedTag, note: note.trim(), timestamp: Date.now() };
    const updated = [newReading, ...readings];
    setReadings(updated);
    await persist(updated);
    setInputVal(""); setNote("");
    if (Platform.OS === "ios" || Platform.OS === "android") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(false);
  };

  const deleteReading = (id: string) => {
    Alert.alert("Delete reading?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        const updated = readings.filter(r => r.id !== id);
        setReadings(updated); await persist(updated);
      }},
    ]);
  };

  // Stats
  const last7 = readings.filter(r => r.timestamp > Date.now() - 7 * 86400000);
  const avg = last7.length ? Math.round(last7.reduce((s, r) => s + r.value, 0) / last7.length) : null;
  const inRange = last7.length ? Math.round((last7.filter(r => r.value >= RANGE.low && r.value <= RANGE.highNormal).length / last7.length) * 100) : null;
  const highest = last7.length ? Math.max(...last7.map(r => r.value)) : null;
  const lowest = last7.length ? Math.min(...last7.map(r => r.value)) : null;

  const displayVal = (v: number) => useMmol ? `${mgToMmol(v)} mmol/L` : `${v} mg/dL`;
  const visibleReadings = showAll ? readings : readings.slice(0, 20);

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[s.header, { backgroundColor: "#1E3A5F" }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={s.back} allowFontScaling={false}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={s.title} allowFontScaling={false}>🩸 Blood Sugar Log</Text>
        <TouchableOpacity onPress={() => setUseMmol(v => !v)} accessibilityRole="button" accessibilityLabel="Toggle units">
          <Text style={s.unitToggle} allowFontScaling={false}>{useMmol ? "mmol/L" : "mg/dL"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Quick Entry Card */}
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>Log a Reading</Text>
          <View style={s.inputRow}>
            <TextInput
              style={[s.bigInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              value={inputVal}
              onChangeText={setInputVal}
              placeholder={useMmol ? "e.g. 7.2" : "e.g. 130"}
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={addReading}
              accessibilityLabel="Blood sugar value input"
              allowFontScaling={false}
            />
            <Text style={[s.unit, { color: colors.muted }]} allowFontScaling={false}>{useMmol ? "mmol/L" : "mg/dL"}</Text>
          </View>

          {/* Meal Tags */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", gap: 8, paddingVertical: 4 }}>
              {MEAL_TAGS.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[s.tag, { backgroundColor: selectedTag === tag ? "#1D4ED8" : colors.background, borderColor: selectedTag === tag ? "#1D4ED8" : colors.border }]}
                  onPress={() => setSelectedTag(tag)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${tag}`}
                >
                  <Text style={{ fontSize: 14 }}>{TAG_ICONS[tag]}</Text>
                  <Text style={[s.tagText, { color: selectedTag === tag ? "#fff" : colors.foreground }]} allowFontScaling={false}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Optional note */}
          <TextInput
            style={[s.noteInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
            value={note}
            onChangeText={setNote}
            placeholder="Optional note (e.g. after pizza, sick day)"
            placeholderTextColor={colors.muted}
            returnKeyType="done"
            allowFontScaling={false}
          />

          <TouchableOpacity
            style={[s.logBtn, { backgroundColor: saving ? colors.muted : "#1D4ED8" }]}
            onPress={addReading}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Log blood sugar reading"
          >
            <Text style={s.logBtnText} allowFontScaling={false}>{saving ? "Saving…" : "➕ Log Reading"}</Text>
          </TouchableOpacity>
        </View>

        {/* 7-Day Stats */}
        {avg !== null && (
          <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>Last 7 Days</Text>
            <View style={s.statsRow}>
              {[
                { label: "Avg", value: displayVal(avg!), color: rangeColor(avg!) },
                { label: "In Range", value: `${inRange}%`, color: (inRange ?? 0) >= 70 ? "#22C55E" : "#F59E0B" },
                { label: "Highest", value: displayVal(highest!), color: rangeColor(highest!) },
                { label: "Lowest", value: displayVal(lowest!), color: rangeColor(lowest!) },
              ].map(({ label, value, color }) => (
                <View key={label} style={s.stat}>
                  <Text style={[s.statVal, { color }]} allowFontScaling={false}>{value}</Text>
                  <Text style={[s.statLabel, { color: colors.muted }]} allowFontScaling={false}>{label}</Text>
                </View>
              ))}
            </View>
            {/* Sparkline */}
            <View style={{ marginTop: 12, alignItems: "center" }}>
              <SparkChart readings={last7} />
              <Text style={[{ fontSize: 11, marginTop: 4 }, { color: colors.muted }]} allowFontScaling={false}>
                🟢 In range (70–180)  🔴 Low (&lt;70)  🟡 High (&gt;180)
              </Text>
            </View>
          </View>
        )}

        {/* History */}
        {readings.length > 0 && (
          <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.cardTitle, { color: colors.foreground }]} allowFontScaling={false}>History ({readings.length})</Text>
            {visibleReadings.map(r => (
              <View key={r.id} style={[s.row, { borderBottomColor: colors.border }]}>
                <View style={[s.dot, { backgroundColor: rangeColor(r.value) }]} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={[s.rowVal, { color: colors.foreground }]} allowFontScaling={false}>{displayVal(r.value)}</Text>
                    <View style={[s.rangeBadge, { backgroundColor: rangeColor(r.value) + "22" }]}>
                      <Text style={[s.rangeBadgeText, { color: rangeColor(r.value) }]} allowFontScaling={false}>{rangeLabel(r.value)}</Text>
                    </View>
                  </View>
                  <Text style={[s.rowMeta, { color: colors.muted }]} allowFontScaling={false}>
                    {TAG_ICONS[r.tag]} {r.tag}  ·  {fmtDate(r.timestamp)} {fmtTime(r.timestamp)}
                  </Text>
                  {r.note ? <Text style={[s.rowNote, { color: colors.muted }]} allowFontScaling={false}>📝 {r.note}</Text> : null}
                </View>
                <TouchableOpacity
                  onPress={() => deleteReading(r.id)}
                  style={s.deleteBtn}
                  accessibilityLabel="Delete reading"
                  accessibilityRole="button"
                >
                  <Text style={{ color: "#EF4444", fontSize: 18 }}>🗑</Text>
                </TouchableOpacity>
              </View>
            ))}
            {readings.length > 20 && (
              <TouchableOpacity onPress={() => setShowAll(v => !v)} style={{ paddingVertical: 12, alignItems: "center" }}>
                <Text style={{ color: "#1D4ED8", fontWeight: "700" }} allowFontScaling={false}>
                  {showAll ? "Show less ▲" : `Show all ${readings.length} readings ▼`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {readings.length === 0 && (
          <View style={[s.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🩸</Text>
            <Text style={[{ fontSize: 16, fontWeight: "700", marginBottom: 6 }, { color: colors.foreground }]} allowFontScaling={false}>No readings yet</Text>
            <Text style={[{ fontSize: 13, textAlign: "center", lineHeight: 20 }, { color: colors.muted }]} allowFontScaling={false}>Log your first blood sugar reading above. Your history and 7-day trends will appear here.</Text>
          </View>
        )}

        {/* ADA Reference */}
        <View style={[s.ref, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[{ fontSize: 12, fontWeight: "700", marginBottom: 4 }, { color: colors.foreground }]} allowFontScaling={false}>ADA Target Ranges (Type 1)</Text>
          {[
            ["Fasting / Before Meal", "80–130 mg/dL  (4.4–7.2 mmol/L)"],
            ["2 hrs After Meal", "< 180 mg/dL  (< 10.0 mmol/L)"],
            ["Bedtime", "90–150 mg/dL  (5.0–8.3 mmol/L)"],
          ].map(([l, v]) => (
            <View key={l} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }}>
              <Text style={[{ fontSize: 11 }, { color: colors.muted }]} allowFontScaling={false}>{l}</Text>
              <Text style={[{ fontSize: 11, fontWeight: "600" }, { color: colors.foreground }]} allowFontScaling={false}>{v}</Text>
            </View>
          ))}
          <Text style={[{ fontSize: 10, marginTop: 6, lineHeight: 14 }, { color: colors.muted }]} allowFontScaling={false}>
            Source: American Diabetes Association Standards of Care 2024. Always follow your endocrinologist's personal targets.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  back: { color: "#fff", fontSize: 16, fontWeight: "600", minWidth: 44, minHeight: 44, justifyContent: "center" },
  title: { color: "#fff", fontSize: 17, fontWeight: "800" },
  unitToggle: { color: "#fff", fontSize: 12, fontWeight: "700", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  scroll: { padding: 16 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: "800", marginBottom: 12 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  bigInput: { flex: 1, borderWidth: 2, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 28, fontWeight: "800", textAlign: "center", minHeight: 64 },
  unit: { fontSize: 13, fontWeight: "600", width: 60 },
  tag: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, minHeight: 44 },
  tagText: { fontSize: 12, fontWeight: "600" },
  noteInput: { borderWidth: 1.5, borderRadius: 12, padding: 12, fontSize: 13, marginBottom: 12, minHeight: 44 },
  logBtn: { borderRadius: 14, padding: 16, alignItems: "center", minHeight: 52 },
  logBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  stat: { alignItems: "center", flex: 1 },
  statVal: { fontSize: 15, fontWeight: "900" },
  statLabel: { fontSize: 11, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowVal: { fontSize: 17, fontWeight: "800" },
  rangeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  rangeBadgeText: { fontSize: 10, fontWeight: "800" },
  rowMeta: { fontSize: 12, marginTop: 2 },
  rowNote: { fontSize: 11, marginTop: 2, fontStyle: "italic" },
  deleteBtn: { padding: 8, minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "center" },
  empty: { borderRadius: 16, borderWidth: 1, padding: 32, alignItems: "center", marginBottom: 16 },
  ref: { borderRadius: 12, borderWidth: 1, padding: 14 },
});
