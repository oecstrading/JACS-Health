import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
const QUESTIONS = [
  "What is my child's current A1C and what is the target for her age?",
  "Should we adjust the insulin-to-carb ratio for lunch? She spikes after school meals.",
  "Is the Dexcom G7 the best CGM for a 4-year-old or should we consider Libre 3?",
  "What is the recommended bedtime glucose target to prevent overnight lows?",
  "When should we consider an insulin pump vs. multiple daily injections?",
  "How do we manage blood sugar during illness (sick day rules)?",
  "What are the signs of early kidney or eye complications to watch for?",
  "Should we do celiac antibody testing given the wheat allergy?",
];
const BRING = [
  { item: "CGM download (last 14 days)", done: true },
  { item: "Blood sugar log printout", done: true },
  { item: "Current medication list", done: true },
  { item: "Insurance card", done: false },
  { item: "List of questions (see below)", done: false },
  { item: "Glucagon emergency kit", done: false },
  { item: "Snacks for child", done: false },
];
export default function AIAppointmentCoachScreen() {
  const colors = useColors();
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Appointment Coach</Text>
        </View>
        <View style={{ backgroundColor: colors.primary + "15", borderRadius: 16, padding: 14, marginBottom: 16 }}>
          <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 15 }}>🩺 Prepare for Your Endo Visit</Text>
          <Text style={{ color: colors.foreground, fontSize: 13, marginTop: 4 }}>The average endo visit is only 20 minutes. Come prepared to make every minute count.</Text>
        </View>
        <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16, marginBottom: 12 }}>📋 What to Bring</Text>
        {BRING.map((b, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: b.done ? colors.success + "20" : colors.border, borderWidth: 2, borderColor: b.done ? colors.success : colors.border, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
              {b.done && <Text style={{ color: colors.success, fontSize: 12, fontWeight: "900" }}>✓</Text>}
            </View>
            <Text style={{ color: b.done ? colors.muted : colors.foreground, fontSize: 14, textDecorationLine: b.done ? "line-through" : "none" }}>{b.item}</Text>
          </View>
        ))}
        <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16, marginTop: 20, marginBottom: 12 }}>❓ Questions to Ask Your Doctor</Text>
        {QUESTIONS.map((q, i) => (
          <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: colors.primary }}>
            <Text style={{ color: colors.foreground, fontSize: 14 }}>{i + 1}. {q}</Text>
          </View>
        ))}
        <View style={{ backgroundColor: colors.success + "15", borderRadius: 16, padding: 16, marginTop: 8, marginBottom: 24 }}>
          <Text style={{ color: colors.success, fontWeight: "800", marginBottom: 6 }}>📊 How to Read Your A1C</Text>
          <Text style={{ color: colors.foreground, fontSize: 13 }}>{"• Under 7.0% = Excellent control\n• 7.0–7.5% = Good control\n• 7.5–8.0% = Needs improvement\n• Over 8.0% = Discuss with doctor\n\nTarget for children under 6: <7.5% (ADA 2024)"}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
