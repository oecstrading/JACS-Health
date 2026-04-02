import { ScrollView, Text, View, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

const DEADLINES = [
  { item: "HIS Admission Record", due: "Within 14 days of admission", status: "due", icon: "📋" },
  { item: "HIS Discharge Record", due: "Within 7 days of discharge", status: "ok", icon: "📋" },
  { item: "HOPE Admission Assessment", due: "Within 5 days of admission", status: "overdue", icon: "📝" },
  { item: "CAHPS Survey Data", due: "Monthly — by 15th of month", status: "ok", icon: "📊" },
  { item: "Medicare Cost Report", due: "5 months after fiscal year end", status: "ok", icon: "💰" },
  { item: "APU Compliance Check", due: "Quarterly review required", status: "due", icon: "✅" },
];

const REQUIREMENTS = [
  { title: "HIS/HOPE Submission Rate", target: "≥ 90% within 30 days", current: "94%", met: true },
  { title: "CAHPS Monthly Collection", target: "100% eligible patients", current: "97%", met: true },
  { title: "Cost Report Submission", target: "On time (5 mo. post FY)", current: "On Track", met: true },
  { title: "APU Payment Adjustment", target: "No penalty (4% at risk)", current: "Compliant", met: true },
];

export default function HospiceComplianceTrackerScreen() {
  const colors = useColors();
  const statusColor = (s: string) => s === "ok" ? colors.success : s === "overdue" ? colors.error : colors.warning;
  const statusLabel = (s: string) => s === "ok" ? "✓ On Track" : s === "overdue" ? "⚠ Overdue" : "⏰ Due Soon";

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 18 }}>{"<"}</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Compliance Tracker</Text>
        </View>

        {/* HQRP Score */}
        <View style={{ backgroundColor: colors.success + "20", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.success, alignItems: "center" }}>
          <Text style={{ color: colors.success, fontWeight: "900", fontSize: 32 }}>94%</Text>
          <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 16 }}>HQRP Compliance Score</Text>
          <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>Target: 90% minimum to avoid APU penalty</Text>
        </View>

        {/* Submission Deadlines */}
        <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16, marginBottom: 10 }}>{"📅 Submission Deadlines"}</Text>
        {DEADLINES.map((d, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 22, marginRight: 10 }}>{d.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 14 }}>{d.item}</Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{d.due}</Text>
            </View>
            <View style={{ backgroundColor: statusColor(d.status) + "20", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
              <Text style={{ color: statusColor(d.status), fontWeight: "700", fontSize: 12 }}>{statusLabel(d.status)}</Text>
            </View>
          </View>
        ))}

        {/* Compliance Requirements */}
        <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16, marginBottom: 10, marginTop: 8 }}>{"📊 HQRP Requirements"}</Text>
        {REQUIREMENTS.map((r, i) => (
          <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 14, flex: 1 }}>{r.title}</Text>
              <Text style={{ color: r.met ? colors.success : colors.error, fontWeight: "900", fontSize: 14 }}>{r.current}</Text>
            </View>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{"Target: " + r.target}</Text>
          </View>
        ))}

        {/* CMS Resources */}
        <View style={{ backgroundColor: colors.primary + "15", borderRadius: 16, padding: 16, marginTop: 8, marginBottom: 24 }}>
          <Text style={{ color: colors.primary, fontWeight: "800", marginBottom: 8 }}>{"📞 CMS Support"}</Text>
          <TouchableOpacity onPress={() => Linking.openURL("tel:18003399313")} style={{ marginBottom: 6 }}>
            <Text style={{ color: colors.primary, fontSize: 14 }}>{"📞 CMS Helpdesk: 1-800-339-9313"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL("https://www.cms.gov/medicare/quality/hospice")}>
            <Text style={{ color: colors.primary, fontSize: 14 }}>{"🌐 CMS HQRP Website"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
