import { ScrollView, Text, View, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
const MEDS = [
  { name: "Humalog (Insulin Lispro)", dose: "100 units/mL", daysLeft: 8, total: 30, pharmacy: "CVS Pharmacy", phone: "+18007467287" },
  { name: "Lantus (Insulin Glargine)", dose: "100 units/mL", daysLeft: 14, total: 30, pharmacy: "Walgreens", phone: "+18009254733" },
  { name: "EpiPen Jr 0.15mg", dose: "0.15mg/0.3mL", daysLeft: 180, total: 365, pharmacy: "CVS Pharmacy", phone: "+18007467287" },
  { name: "Dexcom G7 Sensors", dose: "10-day wear", daysLeft: 20, total: 90, pharmacy: "Dexcom Direct", phone: "+18883380005" },
  { name: "Glucagon Emergency Kit", dose: "1mg/mL", daysLeft: 120, total: 365, pharmacy: "Walgreens", phone: "+18009254733" },
];
export default function MedicationRefillScreen() {
  const colors = useColors();
  const call = (phone: string) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL("tel:" + phone); };
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Medication Refills</Text>
        </View>
        {MEDS.map((m, i) => {
          const pct = Math.min(100, Math.round((m.daysLeft / m.total) * 100));
          const urgent = m.daysLeft <= 10;
          return (
            <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: urgent ? colors.error : colors.border }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 15 }}>{m.name}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{m.dose} · {m.pharmacy}</Text>
                </View>
                {urgent && <View style={{ backgroundColor: colors.error + "20", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}><Text style={{ color: colors.error, fontWeight: "700", fontSize: 12 }}>REFILL NOW</Text></View>}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <View style={{ flex: 1, height: 8, backgroundColor: colors.border, borderRadius: 4 }}>
                  <View style={{ width: pct + "%", height: 8, backgroundColor: urgent ? colors.error : pct > 50 ? colors.success : colors.warning, borderRadius: 4 }} />
                </View>
                <Text style={{ color: urgent ? colors.error : colors.muted, fontWeight: "700", fontSize: 13 }}>{m.daysLeft}d left</Text>
              </View>
              <TouchableOpacity onPress={() => call(m.phone)} style={{ backgroundColor: colors.primary + "20", borderRadius: 10, padding: 10, alignItems: "center" }}>
                <Text style={{ color: colors.primary, fontWeight: "700" }}>📞 Call Pharmacy to Refill</Text>
              </TouchableOpacity>
            </View>
          );
        })}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 24 }}>
          <Text style={{ color: colors.foreground, fontWeight: "800", marginBottom: 8 }}>💡 Refill Tips</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>{"• Refill insulin when 10 days remain\n• Keep 1 backup EpiPen at school always\n• Check expiry dates monthly\n• Store insulin in fridge (never freeze)\n• Glucagon kits expire — check annually"}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
