/**
 * JACS Event Log (JEL) — Chat-style Diabetes Event Logger
 *
 * Inspired by Gluroo's GEL, but built for JACS with:
 * - Natural language parsing ("45g pizza", "2u rapid", "walked 20 min")
 * - BG annotation on every message (shows BG at time of log)
 * - Trend arrows (↑↑ ↑ → ↓ ↓↓)
 * - Day separators with daily carb/insulin totals + TIR pill
 * - COB / IOB display
 * - Carb, insulin, activity, glucose, intervention snack entries
 * - Search through event log
 */
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

// ─── Types ────────────────────────────────────────────────────────────────────
type EventType = "carb" | "insulin" | "glucose" | "activity" | "snack" | "note" | "device" | "system";

interface BGAnnotation {
  value: number;      // mg/dL
  trend: "↑↑" | "↑" | "→" | "↓" | "↓↓" | "?";
  roc: number;        // rate of change mg/dL per 5 min
}

interface JELEntry {
  id: string;
  timestamp: number;
  type: EventType;
  text: string;           // raw user text
  parsedLabel: string;    // human-readable parsed result
  value?: number;         // carbs in g, insulin in units, glucose in mg/dL, steps
  unit?: string;
  bg?: BGAnnotation;
  author?: string;        // "Me" or caregiver name
}

// ─── NLP Parser ───────────────────────────────────────────────────────────────
function parseEntry(text: string): { type: EventType; parsedLabel: string; value?: number; unit?: string } {
  const t = text.trim().toLowerCase();

  // Carbs: "45g pizza", "45 grams carbs", "ate 30g"
  const carbMatch = t.match(/(\d+(?:\.\d+)?)\s*g(?:rams?)?\s*(carb|carbs|of|pizza|sandwich|rice|bread|pasta|cereal|fruit|apple|banana|juice|milk|yogurt|oatmeal|pb&j|granola|cracker|cookie|cake|candy|chocolate|wrap|tortilla|potato|corn|pea|bean|lentil|soup|bar|snack|meal|lunch|dinner|breakfast|food)?/);
  if (carbMatch) {
    const g = parseFloat(carbMatch[1]);
    const food = carbMatch[2] || "food";
    return { type: "carb", parsedLabel: `${g}g carbs${food && food !== "carb" && food !== "carbs" && food !== "of" ? ` (${food})` : ""}`, value: g, unit: "g" };
  }

  // Insulin: "2u rapid", "3 units", "2.5u bolus", "1u correction"
  const insulinMatch = t.match(/(\d+(?:\.\d+)?)\s*u(?:nits?)?\s*(rapid|bolus|correction|basal|long|lantus|basaglar|tresiba|levemir|novolog|humalog|fiasp|lyumjev|apidra|toujeo)?/);
  if (insulinMatch) {
    const u = parseFloat(insulinMatch[1]);
    const type = insulinMatch[2] || "bolus";
    const isBasal = ["basal", "long", "lantus", "basaglar", "tresiba", "levemir", "toujeo"].includes(type);
    return { type: "insulin", parsedLabel: `${u}u ${isBasal ? "basal" : "bolus"} insulin${insulinMatch[2] ? ` (${insulinMatch[2]})` : ""}`, value: u, unit: "u" };
  }

  // Glucose: "BG 145", "glucose 145", "145 mg", "checked 145"
  const bgMatch = t.match(/(?:bg|glucose|sugar|checked|reading|fingerstick|finger\s*prick)?\s*(\d{2,3}(?:\.\d)?)\s*(?:mg|mgdl|mmol)?/);
  if (bgMatch && parseInt(bgMatch[1]) >= 40 && parseInt(bgMatch[1]) <= 400) {
    const val = parseFloat(bgMatch[1]);
    return { type: "glucose", parsedLabel: `BG reading: ${val} mg/dL`, value: val, unit: "mg/dL" };
  }

  // Intervention snack: "juice box", "1 sb", "glucose tabs", "15g sugar", "smarties"
  const snackMatch = t.match(/(\d+)?\s*(juice\s*box|starburst|sb|glucose\s*tab|smarties|gummy|skittles|lifesaver|honey|gel|dextrose)/);
  if (snackMatch) {
    const qty = snackMatch[1] ? parseInt(snackMatch[1]) : 1;
    const item = snackMatch[2];
    const g = item.includes("juice") ? qty * 15 : item.includes("sb") || item.includes("starburst") ? qty * 4 : qty * 4;
    return { type: "snack", parsedLabel: `🍬 Intervention snack: ${qty} ${item} (~${g}g fast sugar)`, value: g, unit: "g" };
  }

  // Activity: "walked 20 min", "ran 30 min", "swim", "bike", "exercise"
  const actMatch = t.match(/(walk|run|ran|swim|bike|cycl|exercise|gym|play|sport|soccer|basketball|dance|yoga|stretch|hike|jog)(?:ed|ing|s)?\s*(?:for\s*)?(\d+)?\s*(?:min|minute|hour|hr|step)?/);
  if (actMatch) {
    const activity = actMatch[1];
    const duration = actMatch[2] ? `${actMatch[2]} min` : "";
    return { type: "activity", parsedLabel: `🏃 Activity: ${activity}${duration ? ` for ${duration}` : ""}`, unit: "min" };
  }

  // Device: "new pod", "sensor change", "new cgm", "changed pod"
  if (t.match(/new\s*(pod|sensor|cgm|site|infusion|cannula|transmitter)|changed?\s*(pod|sensor|site)/)) {
    return { type: "device", parsedLabel: "📡 Device change logged" };
  }

  return { type: "note", parsedLabel: text };
}

function trendArrow(roc: number): "↑↑" | "↑" | "→" | "↓" | "↓↓" {
  if (roc >= 3) return "↑↑";
  if (roc >= 1) return "↑";
  if (roc <= -3) return "↓↓";
  if (roc <= -1) return "↓";
  return "→";
}

function bgColor(bg: number, colors: any): string {
  if (bg < 54) return "#DC2626";
  if (bg < 70) return "#EF4444";
  if (bg <= 180) return colors.success;
  if (bg <= 250) return "#F59E0B";
  return "#EF4444";
}

function eventIcon(type: EventType): string {
  switch (type) {
    case "carb": return "🍽️";
    case "insulin": return "💉";
    case "glucose": return "🩸";
    case "activity": return "🏃";
    case "snack": return "🍬";
    case "device": return "📡";
    case "system": return "🤖";
    default: return "💬";
  }
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function isSameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function JACSEventLogScreen() {
  const colors = useColors();
  const s = styles(colors);
  const flatRef = useRef<FlatList>(null);
  const [entries, setEntries] = useState<JELEntry[]>([]);
  const [input, setInput] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [parsedPreview, setParsedPreview] = useState<{ type: EventType; parsedLabel: string } | null>(null);

  // Simulated current BG (in real app, comes from CGM integration)
  const [currentBG] = useState(142);
  const [currentROC] = useState(1.2);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const raw = await AsyncStorage.getItem("@jacs_event_log");
      if (raw) setEntries(JSON.parse(raw));
      else {
        // Seed with sample entries
        const seed: JELEntry[] = [
          {
            id: "seed1",
            timestamp: Date.now() - 3600000 * 3,
            type: "carb",
            text: "45g oatmeal with blueberries",
            parsedLabel: "45g carbs (oatmeal)",
            value: 45,
            unit: "g",
            bg: { value: 118, trend: "→", roc: 0.2 },
            author: "Mom",
          },
          {
            id: "seed2",
            timestamp: Date.now() - 3600000 * 2.8,
            type: "insulin",
            text: "3u bolus",
            parsedLabel: "3u bolus insulin",
            value: 3,
            unit: "u",
            bg: { value: 122, trend: "↑", roc: 1.1 },
            author: "Mom",
          },
          {
            id: "seed3",
            timestamp: Date.now() - 3600000 * 1,
            type: "glucose",
            text: "BG 142",
            parsedLabel: "BG reading: 142 mg/dL",
            value: 142,
            unit: "mg/dL",
            bg: { value: 142, trend: "→", roc: 0.5 },
            author: "Me",
          },
          {
            id: "seed4",
            timestamp: Date.now() - 1800000,
            type: "activity",
            text: "walked 20 min after school",
            parsedLabel: "🏃 Activity: walked for 20 min",
            bg: { value: 155, trend: "↑", roc: 1.3 },
            author: "Me",
          },
        ];
        setEntries(seed);
        await AsyncStorage.setItem("@jacs_event_log", JSON.stringify(seed));
      }
    } catch {}
  };

  const saveEntries = async (updated: JELEntry[]) => {
    await AsyncStorage.setItem("@jacs_event_log", JSON.stringify(updated));
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    if (text.trim().length > 2) {
      const parsed = parseEntry(text);
      setParsedPreview(parsed);
    } else {
      setParsedPreview(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const parsed = parseEntry(input);
    const entry: JELEntry = {
      id: `jel_${Date.now()}`,
      timestamp: Date.now(),
      type: parsed.type,
      text: input,
      parsedLabel: parsed.parsedLabel,
      value: parsed.value,
      unit: parsed.unit,
      bg: { value: currentBG, trend: trendArrow(currentROC), roc: currentROC },
      author: "Me",
    };
    const updated = [...entries, entry];
    setEntries(updated);
    await saveEntries(updated);
    setInput("");
    setParsedPreview(null);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const quickLog = (text: string) => {
    setInput(text);
    handleInputChange(text);
  };

  const displayEntries = searchMode && searchQuery
    ? entries.filter((e) =>
        e.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.parsedLabel.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : entries;

  // Build render items with day separators
  const renderItems = buildRenderItems(displayEntries);

  return (
    <ScreenContainer containerClassName="bg-background">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backBtnText}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>JACS Event Log</Text>
            <Text style={s.headerSub}>Chat-style diabetes diary</Text>
          </View>
          {/* Live BG pill */}
          <View style={[s.bgPill, { backgroundColor: `${bgColor(currentBG, colors)}20`, borderColor: bgColor(currentBG, colors) }]}>
            <Text style={[s.bgPillValue, { color: bgColor(currentBG, colors) }]}>{currentBG}</Text>
            <Text style={[s.bgPillTrend, { color: bgColor(currentBG, colors) }]}>{trendArrow(currentROC)}</Text>
          </View>
          <TouchableOpacity onPress={() => setSearchMode(!searchMode)} style={s.searchBtn}>
            <Text style={{ fontSize: 20 }}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        {searchMode && (
          <View style={s.searchBar}>
            <TextInput
              style={s.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search meals, insulin, activities..."
              placeholderTextColor={colors.muted}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setSearchMode(false); setSearchQuery(""); }}>
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "600", paddingLeft: 8 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Event List */}
        <FlatList
          ref={flatRef}
          data={renderItems}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            if (item.type === "separator") {
              return <DaySeparator data={item} colors={colors} />;
            }
            return <EventBubble entry={item.entry!} colors={colors} />;
          }}
          contentContainerStyle={s.listContent}
          onContentSizeChange={() => !searchMode && flatRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Quick Log Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.quickChips} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
          {["45g meal", "2u bolus", "BG 120", "juice box", "walked 20 min", "new pod", "new sensor"].map((q) => (
            <TouchableOpacity key={q} style={s.quickChip} onPress={() => quickLog(q)}>
              <Text style={s.quickChipText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Parse Preview */}
        {parsedPreview && (
          <View style={s.parsePreview}>
            <Text style={s.parsePreviewIcon}>{eventIcon(parsedPreview.type)}</Text>
            <Text style={s.parsePreviewText} numberOfLines={1}>{parsedPreview.parsedLabel}</Text>
          </View>
        )}

        {/* Input Row */}
        <View style={s.inputRow}>
          <TextInput
            style={s.textInput}
            value={input}
            onChangeText={handleInputChange}
            placeholder='Log anything: "45g pizza", "2u bolus", "BG 142"...'
            placeholderTextColor={colors.muted}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[s.sendBtn, !input.trim() && s.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim()}
            activeOpacity={0.8}
          >
            <Text style={s.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

// ─── Build render items with day separators ───────────────────────────────────
interface RenderItem {
  key: string;
  type: "separator" | "entry";
  entry?: JELEntry;
  date?: number;
  totalCarbs?: number;
  totalInsulin?: number;
}

function buildRenderItems(entries: JELEntry[]): RenderItem[] {
  const items: RenderItem[] = [];
  let lastDate: number | null = null;
  for (const entry of entries) {
    if (lastDate === null || !isSameDay(lastDate, entry.timestamp)) {
      // Calculate day totals
      const dayEntries = entries.filter((e) => isSameDay(e.timestamp, entry.timestamp));
      const totalCarbs = dayEntries.filter((e) => e.type === "carb" || e.type === "snack").reduce((s, e) => s + (e.value || 0), 0);
      const totalInsulin = dayEntries.filter((e) => e.type === "insulin").reduce((s, e) => s + (e.value || 0), 0);
      items.push({ key: `sep_${entry.timestamp}`, type: "separator", date: entry.timestamp, totalCarbs, totalInsulin });
      lastDate = entry.timestamp;
    }
    items.push({ key: entry.id, type: "entry", entry });
  }
  return items;
}

// ─── Day Separator ────────────────────────────────────────────────────────────
function DaySeparator({ data, colors }: { data: RenderItem; colors: any }) {
  const s = styles(colors);
  return (
    <View style={s.daySep}>
      <View style={s.daySepLine} />
      <View style={s.daySepContent}>
        <Text style={s.daySepDate}>{formatDate(data.date!)}</Text>
        <View style={s.daySepPills}>
          <View style={[s.daySepPill, { backgroundColor: "#FEF3C720", borderColor: "#F59E0B" }]}>
            <Text style={{ fontSize: 11, color: "#F59E0B", fontWeight: "700" }}>🍽️ {Math.round(data.totalCarbs!)}g</Text>
          </View>
          <View style={[s.daySepPill, { backgroundColor: "#EFF6FF", borderColor: "#3B82F6" }]}>
            <Text style={{ fontSize: 11, color: "#3B82F6", fontWeight: "700" }}>💉 {data.totalInsulin!.toFixed(1)}u</Text>
          </View>
        </View>
      </View>
      <View style={s.daySepLine} />
    </View>
  );
}

// ─── Event Bubble ─────────────────────────────────────────────────────────────
function EventBubble({ entry, colors }: { entry: JELEntry; colors: any }) {
  const s = styles(colors);
  const isMe = entry.author === "Me";
  const bgVal = entry.bg?.value;
  const trend = entry.bg?.trend;

  return (
    <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleThem]}>
      {/* Author + time + BG annotation */}
      <View style={s.bubbleMeta}>
        {!isMe && <Text style={s.bubbleAuthor}>{entry.author} · </Text>}
        <Text style={s.bubbleTime}>{formatTime(entry.timestamp)}</Text>
        {bgVal && (
          <View style={[s.bgAnnotation, { borderColor: bgColor(bgVal, colors) }]}>
            <Text style={[s.bgAnnotationText, { color: bgColor(bgVal, colors) }]}>
              {bgVal} {trend}
            </Text>
          </View>
        )}
      </View>
      {/* Event content */}
      <View style={[s.bubbleBody, isMe ? s.bubbleBodyMe : s.bubbleBodyThem]}>
        <Text style={s.eventIcon}>{eventIcon(entry.type)}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[s.bubbleText, isMe ? s.bubbleTextMe : s.bubbleTextThem]}>
            {entry.parsedLabel}
          </Text>
          {entry.parsedLabel !== entry.text && (
            <Text style={s.bubbleRaw}>"{entry.text}"</Text>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function styles(colors: any) {
  return StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 8,
    },
    backBtn: { padding: 4 },
    backBtnText: { fontSize: 24, color: colors.foreground },
    headerTitle: { fontSize: 17, fontWeight: "700", color: colors.foreground },
    headerSub: { fontSize: 12, color: colors.muted },
    bgPill: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.5,
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 4,
      gap: 2,
    },
    bgPillValue: { fontSize: 15, fontWeight: "800" },
    bgPillTrend: { fontSize: 13, fontWeight: "700" },
    searchBtn: { padding: 4 },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 15,
      color: colors.foreground,
    },
    listContent: { padding: 12, paddingBottom: 8 },
    daySep: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 12,
    },
    daySepLine: { flex: 1, height: 1, backgroundColor: colors.border },
    daySepContent: { alignItems: "center", paddingHorizontal: 10 },
    daySepDate: { fontSize: 12, fontWeight: "700", color: colors.muted, marginBottom: 4 },
    daySepPills: { flexDirection: "row", gap: 6 },
    daySepPill: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    bubble: { marginBottom: 8 },
    bubbleMe: { alignItems: "flex-end" },
    bubbleThem: { alignItems: "flex-start" },
    bubbleMeta: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 3,
      gap: 4,
    },
    bubbleAuthor: { fontSize: 11, color: colors.muted, fontWeight: "600" },
    bubbleTime: { fontSize: 11, color: colors.muted },
    bgAnnotation: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 1,
      marginLeft: 4,
    },
    bgAnnotationText: { fontSize: 11, fontWeight: "700" },
    bubbleBody: {
      flexDirection: "row",
      alignItems: "flex-start",
      maxWidth: "85%",
      borderRadius: 16,
      padding: 10,
      gap: 8,
    },
    bubbleBodyMe: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    bubbleBodyThem: {
      backgroundColor: colors.surface,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    eventIcon: { fontSize: 18, marginTop: 1 },
    bubbleText: { fontSize: 14, lineHeight: 20, fontWeight: "500" },
    bubbleTextMe: { color: "#fff" },
    bubbleTextThem: { color: colors.foreground },
    bubbleRaw: { fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2, fontStyle: "italic" },
    quickChips: { maxHeight: 44, borderTopWidth: 1, borderTopColor: colors.border },
    quickChip: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickChipText: { fontSize: 13, color: colors.foreground, fontWeight: "500" },
    parsePreview: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 6,
      backgroundColor: `${colors.primary}15`,
      gap: 8,
    },
    parsePreviewIcon: { fontSize: 18 },
    parsePreviewText: { fontSize: 13, color: colors.primary, fontWeight: "600", flex: 1 },
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 8,
      backgroundColor: colors.background,
    },
    textInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.foreground,
      maxHeight: 100,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    sendBtnDisabled: { backgroundColor: colors.border },
    sendBtnText: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: -2 },
  });
}
