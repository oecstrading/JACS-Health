import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
type Condition = { id: string; name: string; diagnosed: string; severity: string; notes: string };
const INITIAL: Condition[] = [
  { id: "1", name: "Type 1 Diabetes", diagnosed: "2023", severity: "Managed", notes: "Dexcom G7 CGM + Humalog + Lantus" },
  { id: "2", name: "Wheat Allergy / Celiac", diagnosed: "2023", severity: "SEVERE", notes: "Anaphylaxis risk — EpiPen Jr required" },
  { id: "3", name: "Asthma (mild)", diagnosed: "2024", severity: "Mild", notes: "Albuterol rescue inhaler as needed" },
  { id: "4", name: "Eczema", diagnosed: "2022", severity: "Mild", notes: "Hydrocortisone cream for flares" },
  { id: "5", name: "Seasonal Allergies", diagnosed: "2024", severity: "Moderate", notes: "Cetirizine 5mg daily in spring/fall" },
];
export default function HealthConditionsScreen() {
  const colors = useColors();
  const [conditions, setConditions] = useState<Condition[]>(INITIAL);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const add = () => {
    if (!name.trim()) { Alert.alert("Enter condition name"); return; }
    setConditions(prev => [...prev, { id: Date.now().toString(), name, diagnosed: new Date().getFullYear().toString(), severity: "Managed", notes }]);
    setName(""); setNotes(""); setShowAdd(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  const sc = (s: string) => s === "SEVERE" ? colors.error : s === "Moderate" ? colors.warning : colors.success;
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Health Conditions</Text>
          <TouchableOpacity onPress={() => setShowAdd(!showAdd)} style={{ backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {showAdd && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
            <TextInput value={name} onChangeText={setName} placeholder="Condition name *" placeholderTextColor={colors.muted} style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, color: colors.foreground, marginBottom: 8, borderWidth: 1, borderColor: colors.border }} />
            <TextInput value={notes} onChangeText={setNotes} placeholder="Notes / medications" placeholderTextColor={colors.muted} style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, color: colors.foreground, marginBottom: 8, borderWidth: 1, borderColor: colors.border }} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => setShowAdd(false)} style={{ flex: 1, backgroundColor: colors.border, borderRadius: 10, padding: 12, alignItems: "center" }}><Text style={{ color: colors.muted, fontWeight: "600" }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={add} style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 10, padding: 12, alignItems: "center" }}><Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text></TouchableOpacity>
            </View>
          </View>
        )}
        {conditions.map((c) => (
          <View key={c.id} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: c.severity === "SEVERE" ? colors.error : colors.border }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 15, flex: 1 }}>{c.name}</Text>
              <View style={{ backgroundColor: sc(c.severity) + "20", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}><Text style={{ color: sc(c.severity), fontWeight: "700", fontSize: 12 }}>{c.severity}</Text></View>
            </View>
            <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>Diagnosed: {c.diagnosed}</Text>
            <Text style={{ color: colors.foreground, fontSize: 13 }}>{c.notes}</Text>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
