import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
type Reading = { id: string; systolic: number; diastolic: number; pulse: number; date: string; note: string };
const INITIAL: Reading[] = [
  { id: "1", systolic: 95, diastolic: 60, pulse: 88, date: "Today 8am", note: "Before breakfast" },
  { id: "2", systolic: 98, diastolic: 62, pulse: 92, date: "Yesterday 8am", note: "After waking" },
  { id: "3", systolic: 94, diastolic: 58, pulse: 85, date: "2 days ago", note: "Calm morning" },
  { id: "4", systolic: 100, diastolic: 65, pulse: 96, date: "3 days ago", note: "After activity" },
  { id: "5", systolic: 93, diastolic: 59, pulse: 84, date: "4 days ago", note: "Normal morning" },
];
export default function BloodPressureDashboardScreen() {
  const colors = useColors();
  const [readings, setReadings] = useState<Reading[]>(INITIAL);
  const [sys, setSys] = useState(""); const [dia, setDia] = useState(""); const [pulse, setPulse] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const add = () => {
    if (!sys || !dia) { Alert.alert("Enter systolic and diastolic values"); return; }
    setReadings(prev => [{ id: Date.now().toString(), systolic: parseInt(sys), diastolic: parseInt(dia), pulse: parseInt(pulse) || 0, date: "Just now", note: "" }, ...prev]);
    setSys(""); setDia(""); setPulse(""); setShowAdd(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  const status = (s: number, d: number) => s > 120 || d > 80 ? { label: "Elevated", color: colors.warning } : s < 90 || d < 50 ? { label: "Low", color: colors.error } : { label: "Normal", color: colors.success };
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Blood Pressure</Text>
          <TouchableOpacity onPress={() => setShowAdd(!showAdd)} style={{ backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>+ Log</Text>
          </TouchableOpacity>
        </View>
        {showAdd && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
              <TextInput value={sys} onChangeText={setSys} placeholder="Systolic" keyboardType="numeric" placeholderTextColor={colors.muted} style={{ flex: 1, backgroundColor: colors.background, borderRadius: 10, padding: 12, color: colors.foreground, borderWidth: 1, borderColor: colors.border }} />
              <TextInput value={dia} onChangeText={setDia} placeholder="Diastolic" keyboardType="numeric" placeholderTextColor={colors.muted} style={{ flex: 1, backgroundColor: colors.background, borderRadius: 10, padding: 12, color: colors.foreground, borderWidth: 1, borderColor: colors.border }} />
              <TextInput value={pulse} onChangeText={setPulse} placeholder="Pulse" keyboardType="numeric" placeholderTextColor={colors.muted} style={{ flex: 1, backgroundColor: colors.background, borderRadius: 10, padding: 12, color: colors.foreground, borderWidth: 1, borderColor: colors.border }} />
            </View>
            <TouchableOpacity onPress={add} style={{ backgroundColor: colors.primary, borderRadius: 10, padding: 12, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Save Reading</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ backgroundColor: colors.primary + "15", borderRadius: 16, padding: 14, marginBottom: 16 }}>
          <Text style={{ color: colors.primary, fontWeight: "800", marginBottom: 4 }}>Normal Ranges for Children (Age 4)</Text>
          <Text style={{ color: colors.foreground, fontSize: 13 }}>{"Systolic: 85–100 mmHg\nDiastolic: 50–65 mmHg\nPulse: 80–110 bpm\nCall doctor if >110/75 or <80/45"}</Text>
        </View>
        {readings.map((r) => {
          const st = status(r.systolic, r.diastolic);
          return (
            <View key={r.id} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: st.color + "40" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: colors.foreground, fontWeight: "900", fontSize: 22 }}>{r.systolic}/{r.diastolic}</Text>
                <View style={{ backgroundColor: st.color + "20", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}><Text style={{ color: st.color, fontWeight: "700" }}>{st.label}</Text></View>
              </View>
              <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>{r.date} · Pulse: {r.pulse} bpm · {r.note}</Text>
            </View>
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
