/**
 * DAILY BG REMINDER NOTIFICATIONS 🔔
 * Configure up to 5 daily blood sugar check reminders.
 * Uses expo-notifications daily repeating triggers.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, Switch, Alert,
} from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";

const STORAGE_KEY = "@bg_reminders_v1";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const haptic = (t: "light" | "success" = "light") => {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return;
  if (t === "success") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

interface Reminder {
  id: string;
  label: string;
  hour: number;
  minute: number;
  enabled: boolean;
  notifId?: string;
  emoji: string;
  message: string;
}

const DEFAULT_REMINDERS: Reminder[] = [
  { id: "r1", label: "Morning Check", hour: 7, minute: 0, enabled: true, emoji: "🌅", message: "Time for morning blood sugar check! 🩸" },
  { id: "r2", label: "Before Lunch", hour: 11, minute: 30, enabled: true, emoji: "☀️", message: "Check blood sugar before lunch 🍽️" },
  { id: "r3", label: "After School", hour: 15, minute: 0, enabled: false, emoji: "🎒", message: "Afternoon blood sugar check time! 📊" },
  { id: "r4", label: "Before Dinner", hour: 17, minute: 30, enabled: true, emoji: "🌆", message: "Pre-dinner blood sugar check 🍗" },
  { id: "r5", label: "Bedtime Check", hour: 20, minute: 0, enabled: true, emoji: "🌙", message: "Bedtime check — keep your child safe overnight 💙" },
];

async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("bg-reminders", {
      name: "Blood Sugar Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#D4AF37",
      sound: "default",
    });
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function scheduleReminder(r: Reminder): Promise<string | undefined> {
  if (!r.enabled || Platform.OS === "web") return undefined;
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${r.emoji} JACS Health — ${r.label}`,
        body: r.message,
        sound: "default",
        data: { reminderId: r.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: r.hour,
        minute: r.minute,
      },
    });
    return id;
  } catch {
    return undefined;
  }
}

async function cancelReminder(notifId?: string) {
  if (notifId) {
    try { await Notifications.cancelScheduledNotificationAsync(notifId); } catch {}
  }
}

function formatTime(hour: number, minute: number): string {
  const h = hour % 12 || 12;
  const m = minute.toString().padStart(2, "0");
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h}:${m} ${ampm}`;
}

// Simple time picker: tap +/- hour and minute
function TimePicker({ hour, minute, onChange }: {
  hour: number; minute: number; onChange: (h: number, m: number) => void;
}) {
  const colors = useColors();
  return (
    <View style={tp.row}>
      <View style={tp.col}>
        <TouchableOpacity style={tp.btn} onPress={() => { haptic(); onChange((hour + 1) % 24, minute); }}>
          <Text style={tp.arrow}>▲</Text>
        </TouchableOpacity>
        <Text style={[tp.val, { color: colors.foreground }]} allowFontScaling={false}>{(hour % 12 || 12).toString().padStart(2, "0")}</Text>
        <TouchableOpacity style={tp.btn} onPress={() => { haptic(); onChange((hour - 1 + 24) % 24, minute); }}>
          <Text style={tp.arrow}>▼</Text>
        </TouchableOpacity>
      </View>
      <Text style={[tp.colon, { color: colors.foreground }]} allowFontScaling={false}>:</Text>
      <View style={tp.col}>
        <TouchableOpacity style={tp.btn} onPress={() => { haptic(); onChange(hour, (minute + 5) % 60); }}>
          <Text style={tp.arrow}>▲</Text>
        </TouchableOpacity>
        <Text style={[tp.val, { color: colors.foreground }]} allowFontScaling={false}>{minute.toString().padStart(2, "0")}</Text>
        <TouchableOpacity style={tp.btn} onPress={() => { haptic(); onChange(hour, (minute - 5 + 60) % 60); }}>
          <Text style={tp.arrow}>▼</Text>
        </TouchableOpacity>
      </View>
      <View style={tp.col}>
        <TouchableOpacity style={tp.btn} onPress={() => { haptic(); onChange(hour < 12 ? hour + 12 : hour - 12, minute); }}>
          <Text style={[tp.ampm, { color: "#D4AF37" }]} allowFontScaling={false}>{hour < 12 ? "AM" : "PM"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const tp = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  col: { alignItems: "center", gap: 4 },
  btn: { padding: 8, minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  arrow: { color: "#D4AF37", fontSize: 18, fontWeight: "900" },
  val: { fontSize: 28, fontWeight: "900", minWidth: 48, textAlign: "center" },
  colon: { fontSize: 28, fontWeight: "900", marginBottom: 4 },
  ampm: { fontSize: 16, fontWeight: "900" },
});

export default function BgReminders() {
  const colors = useColors();
  const [reminders, setReminders] = useState<Reminder[]>(DEFAULT_REMINDERS);
  const [editing, setEditing] = useState<string | null>(null);
  const [permGranted, setPermGranted] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) try { setReminders(JSON.parse(raw)); } catch {}
    });
    if (Platform.OS !== "web") {
      Notifications.getPermissionsAsync().then(({ status }) => setPermGranted(status === "granted"));
    } else {
      setPermGranted(false);
    }
  }, []);

  const saveAll = useCallback(async (updated: Reminder[]) => {
    setSaving(true);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSaving(false);
  }, []);

  const toggleReminder = useCallback(async (id: string) => {
    haptic();
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert("Notifications Disabled", "Please enable notifications in your device Settings to use BG reminders.", [{ text: "OK" }]);
      return;
    }
    setPermGranted(true);
    setReminders(prev => {
      const updated = prev.map(async r => {
        if (r.id !== id) return r;
        if (r.enabled) {
          await cancelReminder(r.notifId);
          return { ...r, enabled: false, notifId: undefined };
        } else {
          const notifId = await scheduleReminder({ ...r, enabled: true });
          return { ...r, enabled: true, notifId };
        }
      });
      // resolve all async and update
      Promise.all(updated).then(resolved => {
        setReminders(resolved);
        saveAll(resolved);
      });
      return prev; // optimistic: will be replaced
    });
  }, [saveAll]);

  const updateTime = useCallback(async (id: string, hour: number, minute: number) => {
    setReminders(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, hour, minute } : r);
      saveAll(updated);
      return updated;
    });
  }, [saveAll]);

  const applyTime = useCallback(async (id: string) => {
    haptic("success");
    setEditing(null);
    // Reschedule if enabled
    const r = reminders.find(x => x.id === id);
    if (!r || !r.enabled) return;
    await cancelReminder(r.notifId);
    const notifId = await scheduleReminder(r);
    setReminders(prev => {
      const updated = prev.map(x => x.id === id ? { ...x, notifId } : x);
      saveAll(updated);
      return updated;
    });
  }, [reminders, saveAll]);

  const sendTest = useCallback(async () => {
    haptic("success");
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert("Notifications Disabled", "Enable notifications in Settings first.");
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🩸 JACS Health — Test Reminder",
        body: "This is a test BG check reminder. Your real reminders are set up!",
        sound: "default",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3 },
    });
    Alert.alert("Test Sent!", "You'll receive a test notification in 3 seconds.", [{ text: "OK" }]);
  }, []);

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[s.header, { backgroundColor: "#0C1B33" }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
          <Text style={s.back} allowFontScaling={false}>‹</Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={s.headerTitle} allowFontScaling={false}>🔔 BG REMINDERS</Text>
          <Text style={s.headerSub} allowFontScaling={false}>Daily blood sugar check alerts</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Permission Banner */}
        {permGranted === false && Platform.OS !== "web" && (
          <View style={s.permBanner}>
            <Text style={s.permText} allowFontScaling={false}>⚠️ Notifications are disabled. Tap any reminder toggle to enable them — you'll be prompted to grant permission.</Text>
          </View>
        )}
        {Platform.OS === "web" && (
          <View style={[s.permBanner, { backgroundColor: "#1E3A5F" }]}>
            <Text style={s.permText} allowFontScaling={false}>ℹ️ Push notifications work on iOS and Android devices. Scan the QR code on the Home screen to test on your phone.</Text>
          </View>
        )}

        {/* Status */}
        <View style={[s.statusCard, { backgroundColor: "#0C1B33", borderColor: "#D4AF37" }]}>
          <View style={s.statusRow}>
            <Text style={{ fontSize: 32 }}>🔔</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.statusTitle} allowFontScaling={false}>
                {reminders.filter(r => r.enabled).length} of {reminders.length} reminders active
              </Text>
              <Text style={s.statusSub} allowFontScaling={false}>
                {permGranted ? "✅ Notifications permitted" : "⚠️ Permission needed"}
              </Text>
            </View>
            <TouchableOpacity style={s.testBtn} onPress={sendTest} accessibilityLabel="Send test notification">
              <Text style={s.testBtnText} allowFontScaling={false}>Test 🔔</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reminder Cards */}
        {reminders.map(r => (
          <View key={r.id} style={[s.card, { backgroundColor: colors.surface, borderColor: r.enabled ? "#D4AF37" : colors.border }]}>
            <View style={s.cardRow}>
              <Text style={{ fontSize: 28 }}>{r.emoji}</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[s.cardLabel, { color: colors.foreground }]} allowFontScaling={false}>{r.label}</Text>
                <Text style={[s.cardTime, { color: r.enabled ? "#D4AF37" : colors.muted }]} allowFontScaling={false}>
                  {formatTime(r.hour, r.minute)}
                </Text>
              </View>
              <Switch
                value={r.enabled}
                onValueChange={() => toggleReminder(r.id)}
                trackColor={{ false: "#374151", true: "#D4AF37" }}
                thumbColor={r.enabled ? "#fff" : "#9BA1A6"}
                accessibilityLabel={`Toggle ${r.label}`}
              />
            </View>
            <Text style={[s.cardMessage, { color: colors.muted }]} allowFontScaling={false}>"{r.message}"</Text>

            {/* Edit Time */}
            <TouchableOpacity
              style={[s.editBtn, { borderColor: colors.border }]}
              onPress={() => { haptic(); setEditing(editing === r.id ? null : r.id); }}
              accessibilityRole="button"
              accessibilityLabel={`Edit time for ${r.label}`}
            >
              <Text style={[s.editBtnText, { color: colors.muted }]} allowFontScaling={false}>
                {editing === r.id ? "✕ Cancel" : "✏️ Change time"}
              </Text>
            </TouchableOpacity>

            {editing === r.id && (
              <View style={s.pickerWrap}>
                <TimePicker
                  hour={r.hour}
                  minute={r.minute}
                  onChange={(h, m) => updateTime(r.id, h, m)}
                />
                <TouchableOpacity style={s.applyBtn} onPress={() => applyTime(r.id)} accessibilityRole="button">
                  <Text style={s.applyBtnText} allowFontScaling={false}>✅ Save Time</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {/* Tips */}
        <View style={[s.tipsCard, { backgroundColor: "#0C1B33", borderColor: "#1E3A5F" }]}>
          <Text style={s.tipsTitle} allowFontScaling={false}>💡 Reminder Tips</Text>
          {[
            "Set reminders 15 min before meals to allow time for pre-bolus insulin",
            "The bedtime check is critical — overnight lows are most dangerous",
            "After exercise, add an extra check 30–60 min later",
            "Consistent check times help identify BG patterns for your endo",
          ].map((tip, i) => (
            <Text key={i} style={[s.tipText, { color: colors.muted }]} allowFontScaling={false}>• {tip}</Text>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  back: { color: "#fff", fontSize: 24, fontWeight: "900", minWidth: 44, minHeight: 44, textAlignVertical: "center" },
  headerTitle: { color: "#D4AF37", fontSize: 14, fontWeight: "900" },
  headerSub: { color: "#9BA1A6", fontSize: 11, marginTop: 2 },
  scroll: { padding: 16 },
  permBanner: { backgroundColor: "#7F1D1D", borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#EF4444" },
  permText: { color: "#FCA5A5", fontSize: 13, lineHeight: 20 },
  statusCard: { borderRadius: 16, borderWidth: 2, padding: 16, marginBottom: 16 },
  statusRow: { flexDirection: "row", alignItems: "center" },
  statusTitle: { color: "#D4AF37", fontSize: 15, fontWeight: "800" },
  statusSub: { color: "#9BA1A6", fontSize: 12, marginTop: 3 },
  testBtn: { backgroundColor: "#1E3A5F", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  testBtnText: { color: "#D4AF37", fontSize: 13, fontWeight: "700" },
  card: { borderRadius: 16, borderWidth: 1.5, padding: 14, marginBottom: 12 },
  cardRow: { flexDirection: "row", alignItems: "center" },
  cardLabel: { fontSize: 15, fontWeight: "800" },
  cardTime: { fontSize: 22, fontWeight: "900", marginTop: 2 },
  cardMessage: { fontSize: 12, fontStyle: "italic", marginTop: 8, lineHeight: 18 },
  editBtn: { borderTopWidth: 1, marginTop: 10, paddingTop: 10, alignItems: "center" },
  editBtnText: { fontSize: 13, fontWeight: "600" },
  pickerWrap: { marginTop: 12, padding: 12, backgroundColor: "#0C1B33", borderRadius: 12 },
  applyBtn: { backgroundColor: "#16A34A", borderRadius: 10, padding: 12, alignItems: "center", marginTop: 12 },
  applyBtnText: { color: "#fff", fontSize: 14, fontWeight: "900" },
  tipsCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  tipsTitle: { color: "#D4AF37", fontSize: 14, fontWeight: "800", marginBottom: 10 },
  tipText: { fontSize: 13, lineHeight: 22, marginBottom: 4 },
});
