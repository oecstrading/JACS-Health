import { ScrollView, Text, View, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
const PROGRAMS = [
  { name: "Lilly Insulin Value Program", savings: "$35/month cap", phone: "+18009454766", url: "https://www.insulinaffordability.com", desc: "Humalog, Basaglar — $35/month regardless of insurance" },
  { name: "Novo Nordisk Patient Assistance", savings: "Free insulin", phone: "+18003419468", url: "https://www.novonordisk-us.com/patients/support-and-services.html", desc: "Free Novolog, Levemir for qualifying low-income patients" },
  { name: "Walmart ReliOn Insulin", savings: "$25 OTC", phone: "+18009256278", url: "https://www.walmart.com", desc: "Over-the-counter Regular & NPH insulin — no prescription needed" },
  { name: "Dexcom CARE Program", savings: "Up to $99/month", phone: "+18883380005", url: "https://www.dexcom.com", desc: "CGM sensors for uninsured/underinsured patients" },
  { name: "Omnipod DASH Savings", savings: "Free 30-day trial", phone: "+18005912901", url: "https://www.omnipod.com", desc: "Tubeless insulin pump — free trial for eligible patients" },
  { name: "GoodRx Insulin Coupon", savings: "Up to 80% off", phone: "", url: "https://www.goodrx.com", desc: "Free coupons for any pharmacy — works without insurance" },
  { name: "JDRF T1D Emergency Fund", savings: "Emergency grants", phone: "+18005334397", url: "https://www.jdrf.org", desc: "One-time emergency financial assistance for T1D families" },
  { name: "NeedyMeds.org", savings: "Free database", phone: "+18003503839", url: "https://www.needymeds.org", desc: "Largest database of patient assistance programs — free search" },
];
export default function MedicationCostOptimizerScreen() {
  const colors = useColors();
  const open = (url: string) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL(url); };
  const call = (phone: string) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL("tel:" + phone); };
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Free Insulin Finder</Text>
        </View>
        <View style={{ backgroundColor: colors.success + "20", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.success }}>
          <Text style={{ color: colors.success, fontWeight: "800", fontSize: 15 }}>💚 No child should go without insulin</Text>
          <Text style={{ color: colors.foreground, fontSize: 13, marginTop: 4 }}>8 programs below — most take effect within 24–48 hours.</Text>
        </View>
        {PROGRAMS.map((p, i) => (
          <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 14, flex: 1 }}>{p.name}</Text>
              <View style={{ backgroundColor: colors.success + "20", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 8 }}>
                <Text style={{ color: colors.success, fontWeight: "700", fontSize: 12 }}>{p.savings}</Text>
              </View>
            </View>
            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 10 }}>{p.desc}</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {p.phone ? <TouchableOpacity onPress={() => call(p.phone)} style={{ flex: 1, backgroundColor: colors.primary + "20", borderRadius: 10, padding: 10, alignItems: "center" }}><Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13 }}>📞 Call</Text></TouchableOpacity> : null}
              <TouchableOpacity onPress={() => open(p.url)} style={{ flex: 1, backgroundColor: colors.success + "20", borderRadius: 10, padding: 10, alignItems: "center" }}><Text style={{ color: colors.success, fontWeight: "700", fontSize: 13 }}>🌐 Apply Online</Text></TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
