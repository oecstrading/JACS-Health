import { ScrollView, Text, View, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
const INTERACTIONS = [
  { drug1: "insulin", drug2: "alcohol", severity: "HIGH", desc: "Alcohol masks hypoglycemia symptoms and can cause severe, prolonged lows. Avoid alcohol consumption with insulin therapy." },
  { drug1: "insulin", drug2: "ibuprofen", severity: "MODERATE", desc: "NSAIDs like ibuprofen can enhance the blood glucose-lowering effect of insulin. Monitor BG more frequently." },
  { drug1: "insulin", drug2: "steroids", severity: "HIGH", desc: "Corticosteroids (prednisone, dexamethasone) significantly raise blood glucose. Insulin doses may need to increase 30–50% during steroid courses." },
  { drug1: "insulin", drug2: "beta blockers", severity: "MODERATE", desc: "Beta-blockers can mask tachycardia (racing heart) — a key hypoglycemia symptom. Sweating still occurs. Monitor BG closely." },
  { drug1: "insulin", drug2: "metformin", severity: "LOW", desc: "Metformin is sometimes used alongside insulin in T2D. In T1D, it may reduce insulin requirements. Use only under endo supervision." },
];
export default function MedicationInteractionCheckerScreen() {
  const colors = useColors();
  const [drug1, setDrug1] = useState(""); const [drug2, setDrug2] = useState("");
  const [result, setResult] = useState<typeof INTERACTIONS[0] | null>(null);
  const [notFound, setNotFound] = useState(false);
  const check = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const d1 = drug1.toLowerCase(); const d2 = drug2.toLowerCase();
    const found = INTERACTIONS.find(i => (d1.includes(i.drug1) && d2.includes(i.drug2)) || (d1.includes(i.drug2) && d2.includes(i.drug1)));
    if (found) { setResult(found); setNotFound(false); }
    else { setResult(null); setNotFound(true); }
  };
  const sevColor = (s: string) => s === "HIGH" ? colors.error : s === "MODERATE" ? colors.warning : colors.success;
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Interaction Checker</Text>
        </View>
        <TextInput value={drug1} onChangeText={setDrug1} placeholder="First medication (e.g. insulin)" placeholderTextColor={colors.muted} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, color: colors.foreground, borderWidth: 1, borderColor: colors.border, marginBottom: 10 }} />
        <TextInput value={drug2} onChangeText={setDrug2} placeholder="Second medication (e.g. ibuprofen)" placeholderTextColor={colors.muted} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, color: colors.foreground, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }} />
        <TouchableOpacity onPress={check} style={{ backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 20 }}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>⚠️ Check Interactions</Text>
        </TouchableOpacity>
        {notFound && <View style={{ backgroundColor: colors.success + "20", borderRadius: 16, padding: 16, marginBottom: 16 }}><Text style={{ color: colors.success, fontWeight: "700" }}>No known interaction found. Always confirm with your pharmacist or doctor.</Text></View>}
        {result && (
          <View style={{ backgroundColor: sevColor(result.severity) + "15", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 2, borderColor: sevColor(result.severity) }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16 }}>{result.drug1} + {result.drug2}</Text>
              <View style={{ backgroundColor: sevColor(result.severity) + "20", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}><Text style={{ color: sevColor(result.severity), fontWeight: "900" }}>{result.severity}</Text></View>
            </View>
            <Text style={{ color: colors.foreground, fontSize: 14, lineHeight: 22 }}>{result.desc}</Text>
          </View>
        )}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 24 }}>
          <Text style={{ color: colors.foreground, fontWeight: "800", marginBottom: 8 }}>Known Interactions Database</Text>
          {INTERACTIONS.map((i, idx) => (
            <View key={idx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: sevColor(i.severity), marginRight: 8 }} />
              <Text style={{ color: colors.muted, fontSize: 13 }}>{i.drug1} + {i.drug2} — <Text style={{ color: sevColor(i.severity), fontWeight: "700" }}>{i.severity}</Text></Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
