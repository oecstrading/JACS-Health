import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
const INSIGHTS = [
  { icon: "📈", title: "BG Trend Improving", body: "Average glucose dropped from 142 to 118 mg/dL this week. Time-in-range improved by 12%.", action: "Keep pre-meal bolus timing consistent.", color: "success" },
  { icon: "🕒", title: "Most Lows at 3 AM", body: "4 of 5 hypoglycemia events occurred between 2–4 AM this week.", action: "Consider a 15g bedtime snack or discuss basal rate with endo.", color: "error" },
  { icon: "🍽️", title: "Post-Lunch Spikes", body: "BG rises above 200 mg/dL after lunch on 3 days this week.", action: "Try pre-bolusing 15 minutes before lunch.", color: "warning" },
  { icon: "💊", title: "Medication Adherence 90%", body: "Missed 2 Lantus doses this week — both on weekends.", action: "Set a weekend alarm to match weekday routine.", color: "primary" },
  { icon: "🏆", title: "Best Day: Tuesday", body: "Tuesday had 94% time-in-range with no lows or highs. Average BG: 112 mg/dL.", action: "Replicate Tuesday meal and activity pattern.", color: "success" },
];
export default function HealthInsightsScreen() {
  const colors = useColors();
  const colorMap: Record<string, string> = { success: colors.success, error: colors.error, warning: colors.warning, primary: colors.primary };
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Health Insights</Text>
        </View>
        <Text style={{ color: colors.muted, marginBottom: 16, fontSize: 14 }}>Weekly analysis of your health patterns based on logged data.</Text>
        {INSIGHTS.map((ins, i) => {
          const c = colorMap[ins.color];
          return (
            <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: c + "40", borderLeftWidth: 4, borderLeftColor: c }}>
              <Text style={{ fontSize: 24, marginBottom: 6 }}>{ins.icon}</Text>
              <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 15, marginBottom: 4 }}>{ins.title}</Text>
              <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 8 }}>{ins.body}</Text>
              <View style={{ backgroundColor: c + "15", borderRadius: 8, padding: 10 }}>
                <Text style={{ color: c, fontWeight: "700", fontSize: 13 }}>Action: {ins.action}</Text>
              </View>
            </View>
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
