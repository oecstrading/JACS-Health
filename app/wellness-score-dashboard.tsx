import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
const SCORES = [
  { label: "BG Control", score: 85, icon: "🩸", tip: "A1C estimated 6.9% — excellent range" },
  { label: "Medication Adherence", score: 90, icon: "💊", tip: "Missed 1 dose this week — great overall" },
  { label: "Physical Activity", score: 70, icon: "🏃", tip: "Add 10 min daily movement for better BG" },
  { label: "Sleep Quality", score: 80, icon: "😴", tip: "Consistent 9pm bedtime helps overnight BG" },
  { label: "Nutrition", score: 75, icon: "🥗", tip: "Reduce processed carbs at lunch" },
];
const BAR = (n: number) => "█".repeat(Math.round(n / 10)) + "░".repeat(10 - Math.round(n / 10));
export default function WellnessScoreDashboardScreen() {
  const colors = useColors();
  const overall = Math.round(SCORES.reduce((a, s) => a + s.score, 0) / SCORES.length);
  const grade = overall >= 90 ? "A" : overall >= 80 ? "B" : overall >= 70 ? "C" : "D";
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Wellness Score</Text>
        </View>
        <View style={{ backgroundColor: colors.success + "20", borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 20, borderWidth: 2, borderColor: colors.success }}>
          <Text style={{ color: colors.success, fontSize: 72, fontWeight: "900" }}>{overall}</Text>
          <Text style={{ color: colors.success, fontSize: 18, fontWeight: "700" }}>Grade {grade} — {overall >= 80 ? "Excellent" : overall >= 70 ? "Good" : "Needs Attention"}</Text>
          <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>Overall Health Score / 100</Text>
        </View>
        {SCORES.map((s, i) => (
          <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 15 }}>{s.icon} {s.label}</Text>
              <Text style={{ color: s.score >= 80 ? colors.success : s.score >= 70 ? colors.warning : colors.error, fontWeight: "900", fontSize: 18 }}>{s.score}</Text>
            </View>
            <Text style={{ color: s.score >= 80 ? colors.success : colors.warning, fontFamily: "monospace", fontSize: 14, marginBottom: 4 }}>{BAR(s.score)}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{s.tip}</Text>
          </View>
        ))}
        <View style={{ backgroundColor: colors.primary + "15", borderRadius: 16, padding: 16, marginBottom: 24 }}>
          <Text style={{ color: colors.primary, fontWeight: "800", marginBottom: 8 }}>This Week vs Last Week</Text>
          <Text style={{ color: colors.foreground, fontSize: 13 }}>{"BG Control: +3 pts  |  Activity: -5 pts  |  Sleep: +2 pts\nOverall trend: IMPROVING — Keep it up!"}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
