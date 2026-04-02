import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Linking } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

type Appointment = { id: string; doctor: string; specialty: string; date: string; time: string; location: string; phone: string; notes: string; type: "upcoming" | "past"; };

const SAMPLE: Appointment[] = [
  { id: "1", doctor: "Dr. Sarah Martinez", specialty: "Pediatric Endocrinologist", date: "Apr 10, 2026", time: "9:30 AM", location: "Children's Diabetes Center, 1200 Medical Dr", phone: "+15552345678", notes: "Quarterly A1C check. Bring CGM download.", type: "upcoming" },
  { id: "2", doctor: "Dr. James Wilson", specialty: "Ophthalmologist", date: "Apr 22, 2026", time: "2:00 PM", location: "Vision Care Clinic, 450 Eye St", phone: "+15553456789", notes: "Annual diabetic eye exam.", type: "upcoming" },
  { id: "3", doctor: "Dr. Lisa Chen", specialty: "Dietitian / Nutritionist", date: "May 5, 2026", time: "11:00 AM", location: "Nutrition & Wellness Center", phone: "+15554567890", notes: "Carb counting review & meal planning.", type: "upcoming" },
  { id: "4", doctor: "Dr. Sarah Martinez", specialty: "Pediatric Endocrinologist", date: "Jan 10, 2026", time: "9:30 AM", location: "Children's Diabetes Center", phone: "+15552345678", notes: "A1C: 6.8% — excellent control.", type: "past" },
  { id: "5", doctor: "Dr. Kevin Park", specialty: "Pediatrician", date: "Dec 15, 2025", time: "3:00 PM", location: "Sunrise Pediatrics", phone: "+15555678901", notes: "Annual wellness visit. All vaccines up to date.", type: "past" },
];

export default function AppointmentSchedulingScreen() {
  const colors = useColors();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [showAdd, setShowAdd] = useState(false);
  const [newDoctor, setNewDoctor] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>(SAMPLE);
  const filtered = appointments.filter(a => a.type === tab);

  const handleCall = (phone: string) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL(`tel:${phone}`); };
  const handleAdd = () => {
    if (!newDoctor || !newDate) { Alert.alert("Missing Info", "Please enter a doctor name and date."); return; }
    setAppointments(prev => [{ id: Date.now().toString(), doctor: newDoctor, specialty: "General", date: newDate, time: newTime || "TBD", location: "To be confirmed", phone: "", notes: newNotes, type: "upcoming" }, ...prev]);
    setNewDoctor(""); setNewDate(""); setNewTime(""); setNewNotes(""); setShowAdd(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("\u2705 Saved", `${newDoctor} on ${newDate} added.`);
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.surface }}>
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Appointments</Text>
          <TouchableOpacity onPress={() => setShowAdd(!showAdd)} style={{ backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {showAdd && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 16, marginBottom: 12 }}>New Appointment</Text>
            {[
              { ph: "Doctor / Specialist name *", val: newDoctor, set: setNewDoctor },
              { ph: "Date (e.g. Apr 15, 2026) *", val: newDate, set: setNewDate },
              { ph: "Time (e.g. 10:00 AM)", val: newTime, set: setNewTime },
              { ph: "Notes (optional)", val: newNotes, set: setNewNotes },
            ].map((f, i) => <TextInput key={i} value={f.val} onChangeText={f.set} placeholder={f.ph} placeholderTextColor={colors.muted} style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, color: colors.foreground, marginBottom: 8, borderWidth: 1, borderColor: colors.border }} />)}
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setShowAdd(false)} style={{ flex: 1, backgroundColor: colors.border, borderRadius: 10, padding: 12, alignItems: "center" }}><Text style={{ color: colors.muted, fontWeight: "600" }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleAdd} style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 10, padding: 12, alignItems: "center" }}><Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text></TouchableOpacity>
            </View>
          </View>
        )}
        <View className="flex-row gap-3 mb-4">
          {(["upcoming", "past"] as const).map(t => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={{ flex: 1, backgroundColor: tab === t ? colors.primary : colors.surface, borderRadius: 12, padding: 12, alignItems: "center" }}>
              <Text style={{ color: tab === t ? "#fff" : colors.foreground, fontWeight: "700", textTransform: "capitalize" }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {filtered.length === 0 ? (
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 32, alignItems: "center" }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>\ud83d\udcc5</Text>
            <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 18, marginBottom: 8 }}>No {tab} appointments</Text>
            <Text style={{ color: colors.muted, textAlign: "center" }}>Tap "+ Add" above to schedule your next appointment.</Text>
          </View>
        ) : filtered.map(appt => (
          <View key={appt.id} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
            <View className="flex-row items-start justify-between mb-2">
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16 }}>{appt.doctor}</Text>
                <Text style={{ color: colors.primary, fontSize: 13, marginTop: 2 }}>{appt.specialty}</Text>
              </View>
              <View style={{ backgroundColor: (tab === "upcoming" ? colors.primary : colors.muted) + "20", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: tab === "upcoming" ? colors.primary : colors.muted, fontWeight: "700", fontSize: 12 }}>{tab === "upcoming" ? "UPCOMING" : "PAST"}</Text>
              </View>
            </View>
            <Text style={{ color: colors.foreground, fontSize: 14, marginBottom: 2 }}>\ud83d\udcc5 {appt.date} at {appt.time}</Text>
            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 4 }}>\ud83d\udccd {appt.location}</Text>
            {appt.notes ? <View style={{ backgroundColor: colors.background, borderRadius: 8, padding: 10, marginTop: 4 }}><Text style={{ color: colors.muted, fontSize: 13 }}>\ud83d\udcdd {appt.notes}</Text></View> : null}
            {appt.phone ? <TouchableOpacity onPress={() => handleCall(appt.phone)} style={{ backgroundColor: colors.success + "20", borderRadius: 10, padding: 10, marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}><Text style={{ color: colors.success, fontWeight: "700" }}>\ud83d\udcde Call Office</Text></TouchableOpacity> : null}
          </View>
        ))}
        <View style={{ backgroundColor: colors.primary + "15", borderRadius: 16, padding: 16, marginTop: 8, marginBottom: 24, borderWidth: 1, borderColor: colors.primary + "40" }}>
          <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 15, marginBottom: 8 }}>\ud83d\udca1 T1D Appointment Tips</Text>
          {["Bring a 2-week CGM download or logbook printout","Note any unexplained highs or lows since last visit","List all current medications and doses","Bring your insurance card and referral if needed","Ask about updated A1C targets for your child's age"].map((tip, i) => <Text key={i} style={{ color: colors.foreground, fontSize: 13, marginBottom: 4 }}>\u2022 {tip}</Text>)}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
