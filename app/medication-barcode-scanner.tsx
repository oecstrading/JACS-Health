import { ScrollView, Text, View, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
const MEDS_DB: Record<string, { name: string; dose: string; storage: string; interactions: string; notes: string }> = {
  "humalog": { name: "Humalog (Insulin Lispro)", dose: "Per endo prescription — typical 1 unit per 20g carbs", storage: "Refrigerate unopened. Room temp up to 28 days after opening.", interactions: "Alcohol can cause severe hypoglycemia. Ibuprofen may mask hypoglycemia symptoms.", notes: "Rapid-acting insulin. Onset 15 min, peak 1–2h, duration 3–5h." },
  "novolog": { name: "Novolog (Insulin Aspart)", dose: "Per endo prescription — given 5–10 min before meals", storage: "Refrigerate unopened. Room temp up to 28 days.", interactions: "Beta-blockers can mask hypoglycemia. Steroids raise BG.", notes: "Rapid-acting. Similar to Humalog. Onset 10–20 min." },
  "lantus": { name: "Lantus (Insulin Glargine)", dose: "Once daily at same time — per endo prescription", storage: "Refrigerate unopened. Room temp up to 28 days.", interactions: "Alcohol, ACE inhibitors may enhance hypoglycemic effect.", notes: "Long-acting basal insulin. No peak. Duration 24h." },
  "epipen": { name: "EpiPen Jr 0.15mg", dose: "0.15mg epinephrine — one auto-injector into outer thigh", storage: "Room temperature 59–77°F. Protect from light. Check expiry monthly.", interactions: "No contraindications in anaphylaxis emergency.", notes: "For anaphylaxis only. Call 911 after use. Second dose after 5–15 min if no improvement." },
  "dexcom": { name: "Dexcom G7 CGM Sensor", dose: "N/A — wearable sensor, not a medication", storage: "Room temperature. Do not freeze or overheat.", interactions: "Acetaminophen (Tylenol) can cause falsely elevated readings.", notes: "10-day wear. Apply to upper arm or abdomen. Warm-up period 30 min." },
  "glucagon": { name: "Gvoke HypoPen (Glucagon)", dose: "0.5mg (children under 12) — auto-injector into outer thigh", storage: "Room temperature up to 24 months. Check expiry monthly.", interactions: "No contraindications in severe hypoglycemia emergency.", notes: "For unconscious hypoglycemia only. Call 911 after use. Turn child on side." },
};
export default function MedicationBarcodeScannerScreen() {
  const colors = useColors();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<typeof MEDS_DB[string] | null>(null);
  const [notFound, setNotFound] = useState(false);
  const lookup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const key = query.toLowerCase().trim();
    const found = Object.keys(MEDS_DB).find(k => key.includes(k));
    if (found) { setResult(MEDS_DB[found]); setNotFound(false); }
    else { setResult(null); setNotFound(true); }
  };
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Medication Lookup</Text>
        </View>
        <Text style={{ color: colors.muted, marginBottom: 12, fontSize: 14 }}>Type a medication name to look up dosing, storage, and interactions.</Text>
        <TextInput value={query} onChangeText={setQuery} placeholder="e.g. Humalog, EpiPen, Dexcom..." placeholderTextColor={colors.muted} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, color: colors.foreground, borderWidth: 1, borderColor: colors.border, fontSize: 14, marginBottom: 12 }} returnKeyType="search" onSubmitEditing={lookup} />
        <TouchableOpacity onPress={lookup} style={{ backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 20 }}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>🔍 Look Up Medication</Text>
        </TouchableOpacity>
        {notFound && <View style={{ backgroundColor: colors.warning + "20", borderRadius: 16, padding: 16, marginBottom: 16 }}><Text style={{ color: colors.warning, fontWeight: "700" }}>Medication not found. Try: Humalog, Novolog, Lantus, EpiPen, Dexcom, Glucagon</Text></View>}
        {result && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.foreground, fontWeight: "900", fontSize: 18, marginBottom: 12 }}>{result.name}</Text>
            {[{ label: "💊 Dosing", val: result.dose }, { label: "🌡️ Storage", val: result.storage }, { label: "⚠️ Interactions", val: result.interactions }, { label: "📋 Notes", val: result.notes }].map((x, i) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 13, marginBottom: 4 }}>{x.label}</Text>
                <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20 }}>{x.val}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={{ backgroundColor: colors.primary + "15", borderRadius: 16, padding: 14, marginBottom: 24 }}>
          <Text style={{ color: colors.primary, fontWeight: "800", marginBottom: 6 }}>Available Lookups</Text>
          <Text style={{ color: colors.foreground, fontSize: 13 }}>Humalog · Novolog · Lantus · EpiPen Jr · Dexcom G7 · Glucagon (Gvoke)</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
