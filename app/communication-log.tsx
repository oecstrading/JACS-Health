import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
type Entry = { id: string; date: string; who: string; topic: string; outcome: string; followUp: string };
const INITIAL: Entry[] = [
  { id: "1", date: "Mar 28, 2026", who: "Dr. Martinez (Endo)", topic: "A1C results — 6.8%", outcome: "Excellent! No changes to insulin doses.", followUp: "Next visit in 3 months" },
  { id: "2", date: "Mar 20, 2026", who: "School Nurse", topic: "Low BG episode at lunch (62 mg/dL)", outcome: "Treated with 15g glucose tabs. Recovered in 15 min.", followUp: "Review lunch bolus dose" },
  { id: "3", date: "Mar 15, 2026", who: "Dexcom Support", topic: "G7 sensor failing early", outcome: "Replacement sensor shipped. Arrives in 2 days.", followUp: "None" },
  { id: "4", date: "Mar 10, 2026", who: "Dr. Park (Pediatrician)", topic: "Annual wellness visit", outcome: "Growth on track. Flu vaccine given.", followUp: "Eye exam referral sent" },
  { id: "5", date: "Mar 5, 2026", who: "Insurance (BlueCross)", topic: "CGM prior authorization", outcome: "Approved for 12 months. $0 copay.", followUp: "Reauthorize Feb 2027" },
];
export default function CommunicationLogScreen() {
  const colors = useColors();
  const [entries, setEntries] = useState<Entry[]>(INITIAL);
  const [showAdd, setShowAdd] = useState(false);
  const [who, setWho] = useState(""); const [topic, setTopic] = useState(""); const [outcome, setOutcome] = useState("");
  const add = () => {
    if (!who || !topic) { Alert.alert("Enter who and topic"); return; }
    const now = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    setEntries(prev => [{ id: Date.now().toString(), date: now, who, topic, outcome, followUp: "" }, ...prev]);
    setWho(""); setTopic(""); setOutcome(""); setShowAdd(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Communication Log</Text>
          <TouchableOpacity onPress={() => setShowAdd(!showAdd)} style={{ backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {showAdd && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
            <TextInput value={who} onChangeText={setWho} placeholder="Who (e.g. Dr. Martinez)" placeholderTextColor={colors.muted} style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, color: colors.foreground, marginBottom: 8, borderWidth: 1, borderColor: colors.border }} />
            <TextInput value={topic} onChangeText={setTopic} placeholder="Topic / reason for contact" placeholderTextColor={colors.muted} style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, color: colors.foreground, marginBottom: 8, borderWidth: 1, borderColor: colors.border }} />
            <TextInput value={outcome} onChangeText={setOutcome} placeholder="Outcome / what was decided" placeholderTextColor={colors.muted} style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, color: colors.foreground, marginBottom: 8, borderWidth: 1, borderColor: colors.border }} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => setShowAdd(false)} style={{ flex: 1, backgroundColor: colors.border, borderRadius: 10, padding: 12, alignItems: "center" }}><Text style={{ color: colors.muted }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={add} style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 10, padding: 12, alignItems: "center" }}><Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text></TouchableOpacity>
            </View>
          </View>
        )}
        {entries.map((e) => (
          <View key={e.id} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13 }}>{e.who}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{e.date}</Text>
            </View>
            <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 14, marginBottom: 4 }}>{e.topic}</Text>
            {e.outcome ? <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 4 }}>Outcome: {e.outcome}</Text> : null}
            {e.followUp ? <View style={{ backgroundColor: colors.warning + "15", borderRadius: 8, padding: 8 }}><Text style={{ color: colors.warning, fontSize: 12, fontWeight: "700" }}>Follow-up: {e.followUp}</Text></View> : null}
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
