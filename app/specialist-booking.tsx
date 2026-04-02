import { ScrollView, Text, View, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
const SPECIALISTS = [
  { name: "Pediatric Endocrinologist", icon: "🩺", frequency: "Every 3 months", treats: "T1D management, insulin dosing, A1C, CGM settings", search: "pediatric endocrinologist near me" },
  { name: "Registered Dietitian (T1D)", icon: "🥗", frequency: "Every 6 months", treats: "Carb counting, meal planning, wheat-free diet, growth nutrition", search: "pediatric dietitian diabetes near me" },
  { name: "Ophthalmologist", icon: "👁️", frequency: "Annually", treats: "Diabetic retinopathy screening — starts at age 10 or after 5 years T1D", search: "pediatric ophthalmologist near me" },
  { name: "Nephrologist", icon: "🫘", frequency: "Annually (after 5 yrs)", treats: "Kidney function screening — urine microalbumin test", search: "pediatric nephrologist near me" },
  { name: "Allergist / Immunologist", icon: "🌾", frequency: "Annually", treats: "Wheat allergy management, EpiPen prescription, allergy testing", search: "pediatric allergist near me" },
  { name: "Psychologist / Counselor", icon: "🧠", frequency: "As needed", treats: "Diabetes distress, burnout, anxiety, school adjustment", search: "pediatric psychologist diabetes near me" },
];
export default function SpecialistBookingScreen() {
  const colors = useColors();
  const find = (query: string) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL("https://www.google.com/maps/search/" + encodeURIComponent(query)); };
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Find Specialists</Text>
        </View>
        <View style={{ backgroundColor: colors.primary + "15", borderRadius: 16, padding: 14, marginBottom: 16 }}>
          <Text style={{ color: colors.primary, fontWeight: "800" }}>T1D Care Team Checklist</Text>
          <Text style={{ color: colors.foreground, fontSize: 13, marginTop: 4 }}>Your child needs a full care team. Tap "Find Near Me" to locate each specialist.</Text>
        </View>
        {SPECIALISTS.map((s, i) => (
          <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontSize: 28, marginRight: 10 }}>{s.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 15 }}>{s.name}</Text>
                <Text style={{ color: colors.primary, fontSize: 12, marginTop: 2 }}>Visit: {s.frequency}</Text>
              </View>
            </View>
            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 10 }}>{s.treats}</Text>
            <TouchableOpacity onPress={() => find(s.search)} style={{ backgroundColor: colors.primary + "20", borderRadius: 10, padding: 10, alignItems: "center" }}>
              <Text style={{ color: colors.primary, fontWeight: "700" }}>📍 Find Near Me</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
