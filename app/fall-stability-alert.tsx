import { ScrollView, Text, View, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
const TIPS = [
  { icon: "🧸", title: "Clear Play Areas", desc: "Remove toys, rugs, and clutter from floors. Hypoglycemia causes sudden dizziness and falls." },
  { icon: "🛁", title: "Bathroom Safety", desc: "Install non-slip bath mats and grab bars. Never leave a T1D child alone in the bath." },
  { icon: "👟", title: "Non-Slip Footwear", desc: "Always have child wear shoes or non-slip socks indoors, especially during low BG episodes." },
  { icon: "🍬", title: "Glucose Tabs Everywhere", desc: "Keep fast-acting glucose (tabs, juice boxes) in every room, backpack, and car." },
  { icon: "💡", title: "Nightlights", desc: "Install nightlights in hallways and bathrooms. Overnight lows cause disorientation and falls." },
  { icon: "📱", title: "Phone Always Charged", desc: "Keep a charged phone accessible at all times. In a fall emergency, call 911 immediately." },
  { icon: "🪑", title: "Sit Down When Dizzy", desc: "Teach child: 'If you feel shaky or dizzy, sit down on the floor immediately and call Mom.'" },
  { icon: "🚪", title: "Stair Gates", desc: "Use stair gates for young children. A hypoglycemic fall on stairs can be life-threatening." },
];
const SIGNS = [
  { sign: "Sudden shakiness or trembling", level: "Moderate Low", color: "warning" },
  { sign: "Pale, sweaty skin", level: "Low BG", color: "warning" },
  { sign: "Stumbling or loss of balance", level: "Severe Low", color: "error" },
  { sign: "Confusion or disorientation", level: "Severe Low", color: "error" },
  { sign: "Unresponsive or unconscious", level: "Emergency — Call 911", color: "error" },
];
export default function FallStabilityAlertScreen() {
  const colors = useColors();
  const cm: Record<string, string> = { warning: colors.warning, error: colors.error };
  const call911 = () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); Linking.openURL("tel:911"); };
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Fall & Stability Alerts</Text>
        </View>
        <TouchableOpacity onPress={call911} style={{ backgroundColor: colors.error, borderRadius: 16, padding: 18, alignItems: "center", marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 22 }}>🚨 CALL 911</Text>
          <Text style={{ color: "#fff", fontSize: 13, marginTop: 4 }}>Tap if child is unconscious or unresponsive</Text>
        </TouchableOpacity>
        <View style={{ backgroundColor: colors.warning + "20", borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.warning }}>
          <Text style={{ color: colors.warning, fontWeight: "800", marginBottom: 6 }}>⚠️ Why T1D Children Fall More</Text>
          <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20 }}>Hypoglycemia (low blood sugar) causes dizziness, muscle weakness, confusion, and loss of coordination. A 4-year-old with T1D may not be able to communicate that they feel unwell before falling.</Text>
        </View>
        <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16, marginBottom: 12 }}>⚠️ Warning Signs Before a Fall</Text>
        {SIGNS.map((s, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: cm[s.color] + "40" }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: cm[s.color], marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontWeight: "700" }}>{s.sign}</Text>
              <Text style={{ color: cm[s.color], fontSize: 12, marginTop: 2, fontWeight: "700" }}>{s.level}</Text>
            </View>
          </View>
        ))}
        <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16, marginBottom: 12, marginTop: 8 }}>🏠 Home Safety Checklist</Text>
        {TIPS.map((t, i) => (
          <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border, flexDirection: "row" }}>
            <Text style={{ fontSize: 26, marginRight: 12 }}>{t.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontWeight: "700", marginBottom: 4 }}>{t.title}</Text>
              <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 18 }}>{t.desc}</Text>
            </View>
          </View>
        ))}
        <View style={{ backgroundColor: colors.primary + "15", borderRadius: 16, padding: 14, marginTop: 4, marginBottom: 24 }}>
          <Text style={{ color: colors.primary, fontWeight: "800", marginBottom: 6 }}>📞 Emergency Numbers</Text>
          <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 22 }}>{"911 — Emergency Services\n1-800-222-1222 — Poison Control\n1-800-533-4397 — JDRF Helpline\n1-800-342-2383 — ADA Helpline"}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
