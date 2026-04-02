import { ScrollView, Text, View, TouchableOpacity, Linking, Share } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
const DOCS = [
  { name: "504 / IEP Accommodation Plan", icon: "🏫", desc: "Legal document requiring school to accommodate T1D. Covers BG checks, snacks, nurse visits, no-penalty bathroom breaks.", action: "Download template", url: "https://www.diabetes.org/tools-support/know-your-rights/safe-at-school-state-laws/504-plan" },
  { name: "Prescription List", icon: "💊", desc: "Current medications, doses, prescribing doctors, and pharmacy info. Update after every endo visit.", action: "Share via WhatsApp", url: "" },
  { name: "Insurance Cards (Digital)", icon: "💳", desc: "Primary, secondary, dental, and vision insurance card photos and member IDs.", action: "Go to Insurance Cards", url: "" },
  { name: "CGM Download Reports", icon: "📊", desc: "Dexcom Clarity or LibreView PDF reports. Download from app and email to endo before each visit.", action: "Open Dexcom Clarity", url: "https://clarity.dexcom.com" },
  { name: "Emergency Action Plan", icon: "🚨", desc: "Written protocol for hypoglycemia, hyperglycemia, and anaphylaxis. Required by school and camp.", action: "Download ADA template", url: "https://www.diabetes.org/tools-support/know-your-rights/safe-at-school-state-laws/emergency-care-plan" },
  { name: "Glucagon Prescription", icon: "💉", desc: "Gvoke HypoPen or Baqsimi prescription. Keep copies at home, school, and grandparents.", action: "Share with school nurse", url: "" },
  { name: "Allergy Action Plan (FARE)", icon: "🌾", desc: "FARE-approved anaphylaxis action plan for wheat allergy. Required by school and daycare.", action: "Download FARE template", url: "https://www.foodallergy.org/resources/food-allergy-action-plan" },
  { name: "Medical History Summary", icon: "📋", desc: "One-page summary of diagnosis date, A1C history, hospitalizations, and current management plan.", action: "Share with new doctor", url: "" },
];
export default function DocumentationCenterScreen() {
  const colors = useColors();
  const open = (url: string) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL(url); };
  const shareDoc = async (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Share.share({ message: `JACS Health — ${name}

This document is managed in the JACS Health Companion app.
Download free: https://play.google.com/store/apps/details?id=space.manus.jacs` });
  };
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Document Center</Text>
        </View>
        <View style={{ backgroundColor: colors.primary + "15", borderRadius: 16, padding: 14, marginBottom: 16 }}>
          <Text style={{ color: colors.primary, fontWeight: "800" }}>📁 Keep These 8 Documents Updated</Text>
          <Text style={{ color: colors.foreground, fontSize: 13, marginTop: 4 }}>Having these documents ready saves time at appointments and protects your child at school.</Text>
        </View>
        {DOCS.map((d, i) => (
          <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}>
              <Text style={{ fontSize: 24, marginRight: 10 }}>{d.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 14 }}>{d.name}</Text>
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>{d.desc}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => d.url ? open(d.url) : shareDoc(d.name)} style={{ backgroundColor: colors.primary + "20", borderRadius: 10, padding: 10, alignItems: "center" }}>
              <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13 }}>{d.url ? "🌐 " : "📤 "}{d.action}</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
