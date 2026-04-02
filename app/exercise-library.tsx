import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
const EXERCISES = [
  { name: "Swimming", icon: "🏊", bgBefore: "120–140", bgDuring: "Monitor every 30 min", bgAfter: "May drop 2–4h later", tips: "Reduce basal by 20–30% for 2h before. Keep juice at pool edge." },
  { name: "Cycling", icon: "🚴", bgBefore: "130–150", bgDuring: "Check every 30 min", bgAfter: "Watch for delayed lows", tips: "Reduce bolus by 25% for meal before ride. Carry glucose tabs." },
  { name: "Gymnastics", icon: "🤸", bgBefore: "120–140", bgDuring: "Check between events", bgAfter: "Normal recovery", tips: "Anaerobic bursts can spike BG. Monitor closely." },
  { name: "Dancing", icon: "💃", bgBefore: "120–150", bgDuring: "Check every 45 min", bgAfter: "May drop overnight", tips: "Reduce basal 1–2h before. Great for insulin sensitivity." },
  { name: "Walking", icon: "🚶", bgBefore: "100–140", bgDuring: "Check if >30 min", bgAfter: "Slight drop normal", tips: "Safest exercise for T1D. 15 min after meals helps BG." },
  { name: "Soccer / Team Sports", icon: "⚽", bgBefore: "150–180", bgDuring: "Check at halftime", bgAfter: "Watch for lows 4–8h later", tips: "Start higher to account for sustained activity. Extra snack at halftime." },
  { name: "Yoga", icon: "🧘", bgBefore: "100–140", bgDuring: "Minimal monitoring", bgAfter: "Stable", tips: "Low impact. Excellent for stress reduction which improves BG control." },
  { name: "Trampoline", icon: "🎪", bgBefore: "130–160", bgDuring: "Check every 20 min", bgAfter: "May spike then drop", tips: "Anaerobic. Can cause BG spike during, then drop 2h later." },
];
export default function ExerciseLibraryScreen() {
  const colors = useColors();
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Exercise Guide</Text>
        </View>
        <View style={{ backgroundColor: colors.primary + "15", borderRadius: 16, padding: 14, marginBottom: 16 }}>
          <Text style={{ color: colors.primary, fontWeight: "800" }}>ADA Exercise Guidelines for T1D Children</Text>
          <Text style={{ color: colors.foreground, fontSize: 13, marginTop: 4 }}>{"• Do NOT exercise if BG <90 or >250 mg/dL\n• Always carry 15g fast carbs\n• Inform coach/teacher about T1D\n• Check BG before, during, and after"}</Text>
        </View>
        {EXERCISES.map((e, i) => (
          <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 28, marginBottom: 6 }}>{e.icon}</Text>
            <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16, marginBottom: 8 }}>{e.name}</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
              {[{ label: "Before", val: e.bgBefore }, { label: "During", val: e.bgDuring }, { label: "After", val: e.bgAfter }].map((x, j) => (
                <View key={j} style={{ flex: 1, backgroundColor: colors.background, borderRadius: 8, padding: 8, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "700", marginBottom: 2 }}>{x.label}</Text>
                  <Text style={{ color: colors.foreground, fontSize: 11 }}>{x.val}</Text>
                </View>
              ))}
            </View>
            <View style={{ backgroundColor: colors.warning + "15", borderRadius: 8, padding: 10 }}>
              <Text style={{ color: colors.warning, fontWeight: "700", fontSize: 12 }}>💡 {e.tips}</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
