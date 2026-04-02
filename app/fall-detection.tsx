import { ScrollView, Text, View, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
const TIPS = [
  "Keep floors clear of toys and clutter — hypoglycemia causes sudden dizziness",
  "Install non-slip mats in bathroom and kitchen",
  "Ensure child wears shoes or non-slip socks indoors",
  "Keep glucose tabs within reach in every room",
  "Install nightlights in hallways for overnight low BG episodes",
  "Teach child to sit down immediately if feeling dizzy or shaky",
  "Keep a phone charged and accessible at all times",
  "Use stair gates for young children with T1D",
];
export default function FallDetectionScreen() {
  const colors = useColors();
  const call911 = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Linking.openURL("tel:911");
  };
  const riskText = "Hypoglycemia (low blood sugar) causes:\n\u2022 Dizziness and loss of balance\n\u2022 Muscle weakness and trembling\n\u2022 Confusion and disorientation\n\u2022 Loss of consciousness in severe cases\n\nA child with T1D has a higher fall risk during low BG episodes.";
  const emergencyText = "911 \u2014 Emergency\n1-800-222-1222 \u2014 Poison Control\n1-800-533-4397 \u2014 JDRF Helpline\n1-800-342-2383 \u2014 ADA Helpline";
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 18 }}>{"<"}</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Fall & Safety Prevention</Text>
        </View>
        <TouchableOpacity onPress={call911} style={{ backgroundColor: colors.error, borderRadius: 16, padding: 20, alignItems: "center", marginBottom: 20 }}>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 22 }}>{"🚨 CALL 911"}</Text>
          <Text style={{ color: "#fff", fontSize: 14, marginTop: 4 }}>Tap immediately if child is unconscious or unresponsive</Text>
        </TouchableOpacity>
        <View style={{ backgroundColor: colors.warning + "20", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.warning }}>
          <Text style={{ color: colors.warning, fontWeight: "800", fontSize: 15, marginBottom: 8 }}>{"⚠️ T1D Fall Risk Factors"}</Text>
          <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 22 }}>{riskText}</Text>
        </View>
        <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16, marginBottom: 12 }}>{"🏠 Home Safety Checklist"}</Text>
        {TIPS.map((tip, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.success, fontWeight: "900", marginRight: 10, fontSize: 16 }}>{"✓"}</Text>
            <Text style={{ color: colors.foreground, fontSize: 14, flex: 1 }}>{tip}</Text>
          </View>
        ))}
        <View style={{ backgroundColor: colors.primary + "15", borderRadius: 16, padding: 16, marginTop: 8, marginBottom: 24 }}>
          <Text style={{ color: colors.primary, fontWeight: "800", marginBottom: 6 }}>{"📞 Emergency Numbers"}</Text>
          <Text style={{ color: colors.foreground, fontSize: 13 }}>{emergencyText}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
