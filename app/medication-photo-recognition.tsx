import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
const INSULINS = [
  { name: "Humalog / Novolog / Apidra", type: "Rapid-Acting", appearance: "CLEAR — colorless liquid", temp: "Refrigerate 36–46°F. Room temp up to 28 days.", expiry: "Check vial cap date. Discard if cloudy or discolored.", warning: "If cloudy: DO NOT USE. May be contaminated or degraded." },
  { name: "Lantus / Basaglar / Toujeo", type: "Long-Acting (Glargine)", appearance: "CLEAR — colorless liquid", temp: "Refrigerate unopened. Room temp up to 28 days.", expiry: "Check pen/vial date monthly.", warning: "If cloudy or particles visible: DO NOT USE." },
  { name: "Tresiba (Degludec)", type: "Ultra Long-Acting", appearance: "CLEAR — colorless liquid", temp: "Refrigerate unopened. Room temp up to 56 days.", expiry: "Check pen date. Longest room-temp stability of all insulins.", warning: "Never mix with other insulins." },
  { name: "NPH (Humulin N / Novolin N)", type: "Intermediate-Acting", appearance: "CLOUDY — white suspension (NORMAL)", temp: "Refrigerate. Room temp up to 28 days.", expiry: "Roll gently 10x before use to re-suspend. Never shake.", warning: "Cloudy is NORMAL for NPH. If clumped or frosted: discard." },
  { name: "Regular (Humulin R / Novolin R)", type: "Short-Acting", appearance: "CLEAR — colorless liquid", temp: "Refrigerate. Room temp up to 28 days.", expiry: "Check vial date. Discard if cloudy.", warning: "If cloudy: DO NOT USE. Regular insulin should always be clear." },
  { name: "Pre-Mixed (70/30, 75/25)", type: "Pre-Mixed", appearance: "CLOUDY — white suspension (NORMAL)", temp: "Refrigerate. Room temp up to 10–28 days depending on brand.", expiry: "Roll gently before use. Never shake.", warning: "Cloudy is NORMAL. If clumped or crystallized: discard." },
  { name: "Gvoke HypoPen (Glucagon)", type: "Emergency Glucagon", appearance: "CLEAR — colorless solution in auto-injector", temp: "Room temperature up to 24 months.", expiry: "Check monthly. Expired glucagon may be less effective.", warning: "If solution is cloudy or discolored: use anyway in emergency, then replace." },
  { name: "Baqsimi (Nasal Glucagon)", type: "Emergency Glucagon", appearance: "White powder in nasal device", temp: "Room temperature. Do not refrigerate.", expiry: "Check monthly. Single-use only.", warning: "Do not prime or test before emergency use." },
];
export default function MedicationPhotoRecognitionScreen() {
  const colors = useColors();
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Insulin Visual Guide</Text>
        </View>
        <View style={{ backgroundColor: colors.error + "15", borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.error + "40" }}>
          <Text style={{ color: colors.error, fontWeight: "800" }}>⚠️ Critical Safety Rule</Text>
          <Text style={{ color: colors.foreground, fontSize: 13, marginTop: 4 }}>ALWAYS check insulin appearance before injecting. Wrong insulin or degraded insulin can cause severe hypoglycemia or hyperglycemia.</Text>
        </View>
        {INSULINS.map((ins, i) => (
          <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 15, flex: 1 }}>{ins.name}</Text>
              <View style={{ backgroundColor: colors.primary + "20", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 8 }}><Text style={{ color: colors.primary, fontSize: 11, fontWeight: "700" }}>{ins.type}</Text></View>
            </View>
            {[{ label: "👁️ Appearance", val: ins.appearance }, { label: "🌡️ Storage", val: ins.temp }, { label: "📅 Expiry", val: ins.expiry }].map((x, j) => (
              <Text key={j} style={{ color: colors.muted, fontSize: 13, marginBottom: 3 }}><Text style={{ fontWeight: "700" }}>{x.label}: </Text>{x.val}</Text>
            ))}
            <View style={{ backgroundColor: colors.error + "15", borderRadius: 8, padding: 8, marginTop: 8 }}>
              <Text style={{ color: colors.error, fontWeight: "700", fontSize: 12 }}>⚠️ {ins.warning}</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
