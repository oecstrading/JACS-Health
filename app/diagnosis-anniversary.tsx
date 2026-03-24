import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Switch, Alert, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

const KEY = "@diagnosis_anniversary";
interface AnnData { childName: string; diagnosisDate: string; enabled: boolean; notifId: string | null; }
const DEFAULTS: AnnData = { childName: "", diagnosisDate: "", enabled: true, notifId: null };

const MSGS = [
  { title: "💙 Another Year Stronger!", body: (n: string, y: number) => `${n} has been fighting T1D for ${y} year${y !== 1 ? "s" : ""}. Brave, resilient, and loved. 💙` },
  { title: "🌟 Happy Diaversary!", body: (n: string, y: number) => `${y} year${y !== 1 ? "s" : ""} of checking, dosing, and never giving up. ${n}, you are a warrior! 🌟` },
  { title: "💪 T1D Warrior Anniversary", body: (n: string, y: number) => `${n}, ${y} year${y !== 1 ? "s" : ""} with T1D. Every finger poke, every dose — you are stronger than T1D. 💪` },
];

async function scheduleAnnual(name: string, date: string, oldId: string | null): Promise<string | null> {
  if (Platform.OS === "web") return null;
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return null;
  if (oldId) await Notifications.cancelScheduledNotificationAsync(oldId).catch(() => {});
  const parts = date.split("-");
  if (parts.length !== 3) return null;
  const [yr, mo, dy] = parts.map(Number);
  const years = new Date().getFullYear() - yr + 1;
  const msg = MSGS[Math.floor(Math.random() * MSGS.length)];
  return Notifications.scheduleNotificationAsync({
    content: { title: msg.title, body: msg.body(name || "your child", Math.max(1, years)), sound: "default" },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.YEARLY, month: mo, day: dy, hour: 9, minute: 0 },
  });
}

function yearsAgo(d: string) {
  const p = d.split("-"); return p.length === 3 ? new Date().getFullYear() - parseInt(p[0]) : 0;
}
function daysUntil(d: string): number | null {
  const p = d.split("-"); if (p.length !== 3) return null;
  const now = new Date(); let next = new Date(now.getFullYear(), parseInt(p[1]) - 1, parseInt(p[2]), 9);
  if (next <= now) next = new Date(now.getFullYear() + 1, parseInt(p[1]) - 1, parseInt(p[2]), 9);
  return Math.ceil((next.getTime() - now.getTime()) / 86400000);
}
function fmtDate(d: string) {
  const p = d.split("-"); if (p.length !== 3) return "Not set";
  const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(p[1])-1];
  return `${m} ${parseInt(p[2])}, ${p[0]}`;
}

export default function DiagnosisAnniversary() {
  const colors = useColors();
  const [data, setData] = useState<AnnData>(DEFAULTS);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => { AsyncStorage.getItem(KEY).then(r => { if (r) try { setData(JSON.parse(r)); } catch {} }); }, []);

  const save = async () => {
    let id = data.notifId;
    if (data.enabled && data.diagnosisDate && data.childName) id = await scheduleAnnual(data.childName, data.diagnosisDate, id);
    else if (!data.enabled && id) { await Notifications.cancelScheduledNotificationAsync(id).catch(() => {}); id = null; }
    const updated = { ...data, notifId: id };
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    setData(updated); setSaved(true); setEditing(false);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setSaved(false), 2500);
  };

  const sendTest = async () => {
    if (Platform.OS === "web") { Alert.alert("Not available", "Push notifications require a physical device."); return; }
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permission needed", "Enable notifications in Settings."); return; }
    await Notifications.scheduleNotificationAsync({
      content: { title: "💙 Another Year Stronger!", body: `${data.childName || "Your child"} has been fighting T1D for ${Math.max(1, yearsAgo(data.diagnosisDate))} year(s). Brave, resilient, and loved. 💙`, sound: "default" },
      trigger: { seconds: 3 },
    });
    setTestSent(true); if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setTestSent(false), 4000);
  };

  const years = yearsAgo(data.diagnosisDate);
  const days = daysUntil(data.diagnosisDate);

  return (
    <ScreenContainer>
      <View style={[s.header, { backgroundColor: "#1E3A5F" }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={s.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={s.title} allowFontScaling={false}>💙 Diaversary</Text>
        <TouchableOpacity onPress={() => editing ? save() : setEditing(true)} accessibilityRole="button">
          <Text style={s.action}>{editing ? "Save" : "Edit"}</Text>
        </TouchableOpacity>
      </View>
      {saved && <View style={{ backgroundColor: "#22C55E", padding: 10 }}><Text style={s.banner}>✓ Anniversary reminder saved!</Text></View>}
      {testSent && <View style={{ backgroundColor: "#3B82F6", padding: 10 }}><Text style={s.banner}>💙 Test sent — check in 3 seconds!</Text></View>}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[s.hero, { backgroundColor: "#1E3A5F" }]}>
          <Text style={{ fontSize: 52, marginBottom: 8 }}>💙</Text>
          <Text style={s.heroTitle} allowFontScaling={false}>Diaversary Reminder</Text>
          <Text style={s.heroSub} allowFontScaling={false}>
            Every year on the anniversary of {data.childName ? `${data.childName}'s` : "your child's"} T1D diagnosis,
            JACS sends a warm, encouraging notification to celebrate their strength.
          </Text>
          {data.diagnosisDate ? (
            <View style={s.statsRow}>
              {[["Years Strong", years], ["Days Until Next", days ?? "—"], ["Alerts", data.enabled ? "ON" : "OFF"]].map(([l, v]) => (
                <View key={String(l)} style={s.stat}><Text style={s.statN} allowFontScaling={false}>{String(v)}</Text><Text style={s.statL} allowFontScaling={false}>{String(l)}</Text></View>
              ))}
            </View>
          ) : <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 8 }}>Tap Edit to set the diagnosis date.</Text>}
        </View>
        {/* Settings */}
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.cardTitle, { color: colors.foreground }]}>Settings</Text>
          <Text style={[s.label, { color: colors.muted }]}>Child's Name</Text>
          {editing
            ? <TextInput style={[s.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} value={data.childName} onChangeText={v => setData(d => ({ ...d, childName: v }))} placeholder="e.g. Emma" placeholderTextColor={colors.muted} returnKeyType="next" />
            : <Text style={[s.val, { color: colors.foreground }]}>{data.childName || "—"}</Text>}
          <Text style={[s.label, { color: colors.muted, marginTop: 12 }]}>Diagnosis Date (YYYY-MM-DD)</Text>
          {editing
            ? <TextInput style={[s.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} value={data.diagnosisDate} onChangeText={v => setData(d => ({ ...d, diagnosisDate: v }))} placeholder="e.g. 2022-03-15" placeholderTextColor={colors.muted} keyboardType="numbers-and-punctuation" returnKeyType="done" />
            : <Text style={[s.val, { color: colors.foreground }]}>{fmtDate(data.diagnosisDate)}</Text>}
          <View style={[s.toggle, { borderTopColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.toggleLabel, { color: colors.foreground }]} allowFontScaling={false}>Annual Notification</Text>
              <Text style={[s.toggleSub, { color: colors.muted }]} allowFontScaling={false}>Fires every year at 9:00 AM on {fmtDate(data.diagnosisDate)}</Text>
            </View>
            <Switch value={data.enabled} onValueChange={v => setData(d => ({ ...d, enabled: v }))} trackColor={{ false: colors.border, true: "#1D4ED8" }} thumbColor={data.enabled ? "#60A5FA" : colors.muted} />
          </View>
        </View>
        {/* Sample messages */}
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.cardTitle, { color: colors.foreground }]}>Sample Messages</Text>
          {MSGS.map((m, i) => (
            <View key={i} style={[s.msg, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[{ fontWeight: "800", fontSize: 13, marginBottom: 3 }, { color: colors.foreground }]} allowFontScaling={false}>{m.title}</Text>
              <Text style={[{ fontSize: 12, lineHeight: 18 }, { color: colors.muted }]} allowFontScaling={false}>{m.body(data.childName || "Emma", Math.max(1, years))}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={[s.btn, { backgroundColor: "#1D4ED8" }]} onPress={sendTest} accessibilityRole="button" accessibilityLabel="Send test notification">
          <Text style={s.btnText} allowFontScaling={false}>🔔 Send Test Notification</Text>
        </TouchableOpacity>
        {editing && <TouchableOpacity style={[s.btn, { backgroundColor: "#22C55E" }]} onPress={save} accessibilityRole="button"><Text style={s.btnText} allowFontScaling={false}>✓ Save Anniversary Reminder</Text></TouchableOpacity>}
        <View style={[s.info, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[{ fontSize: 13, lineHeight: 20 }, { color: colors.muted }]}>💡 The "Diaversary" is a T1D community tradition — celebrating the diagnosis anniversary with love and recognition of the child's resilience. Many families bake a blue cake or wear blue together.</Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  back: { color: "#fff", fontSize: 16, fontWeight: "600" },
  title: { color: "#fff", fontSize: 17, fontWeight: "800" },
  action: { color: "#fff", fontSize: 14, fontWeight: "700", backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  banner: { color: "#fff", fontWeight: "700", textAlign: "center" },
  scroll: { padding: 16 },
  hero: { borderRadius: 20, padding: 24, marginBottom: 16, alignItems: "center" },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "900", marginBottom: 8 },
  heroSub: { color: "rgba(255,255,255,0.75)", fontSize: 14, textAlign: "center", lineHeight: 20 },
  statsRow: { flexDirection: "row", gap: 16, marginTop: 20 },
  stat: { alignItems: "center", flex: 1 },
  statN: { color: "#fff", fontSize: 28, fontWeight: "900" },
  statL: { color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 2, textAlign: "center" },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: "800", marginBottom: 8 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  val: { fontSize: 15, fontWeight: "500", marginBottom: 4 },
  input: { borderWidth: 1.5, borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 4 },
  toggle: { flexDirection: "row", alignItems: "center", marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  toggleLabel: { fontSize: 14, fontWeight: "700" },
  toggleSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  msg: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 10 },
  btn: { borderRadius: 14, padding: 16, alignItems: "center", marginBottom: 12, minHeight: 52 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  info: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 4 },
});
