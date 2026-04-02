import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
const CGM_APPS = [
  { name: "Dexcom G7", icon: "📡", desc: "Best CGM for children. Real-time glucose every 5 min. 10-day wear. No fingersticks. FDA-approved for treatment decisions.", app_ios: "https://apps.apple.com/us/app/dexcom-g7/id1635564931", app_android: "https://play.google.com/store/apps/details?id=com.dexcom.g7", phone: "+18883380005" },
  { name: "FreeStyle Libre 3", icon: "🔵", desc: "Slim, discreet CGM. Continuous readings every minute. 14-day wear. Scan with phone. Great for active children.", app_ios: "https://apps.apple.com/us/app/freestyle-librelink-us/id1292893975", app_android: "https://play.google.com/store/apps/details?id=com.abbott.freestyle.libre", phone: "+18556327349" },
  { name: "Dexcom Follow", icon: "👨‍👩‍👧", desc: "Remote monitoring app for parents. See child's glucose in real-time from anywhere. Alerts for lows and highs.", app_ios: "https://apps.apple.com/us/app/dexcom-follow/id919297394", app_android: "https://play.google.com/store/apps/details?id=com.dexcom.follow", phone: "+18883380005" },
  { name: "Nightscout", icon: "🌙", desc: "Open-source CGM remote monitoring. Displays glucose on any device. Free. Requires technical setup.", app_ios: "https://apps.apple.com/us/app/nightscout/id1560699894", app_android: "https://play.google.com/store/apps/details?id=com.nightscout.android", phone: "" },
];
const TARGETS = [
  { label: "Target Range", range: "70–180 mg/dL", color: "success", note: "Aim for 70%+ time in range (TIR)" },
  { label: "Low Alert", range: "<70 mg/dL", color: "error", note: "Treat immediately with 15g fast carbs" },
  { label: "Critical Low", range: "<54 mg/dL", color: "error", note: "Emergency — use glucagon if unconscious" },
  { label: "High Alert", range: ">180 mg/dL", color: "warning", note: "Check for ketones if >250 mg/dL" },
  { label: "Critical High", range: ">300 mg/dL", color: "error", note: "Call doctor — DKA risk" },
];
export default function CGMMonitorScreen() {
  const colors = useColors();
  const colorMap: Record<string, string> = { success: colors.success, error: colors.error, warning: colors.warning };
  const open = (url: string) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL(url); };
  const call = (phone: string) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL("tel:" + phone); };
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">CGM Monitor</Text>
        </View>
        <View style={{ backgroundColor: colors.primary + "15", borderRadius: 16, padding: 14, marginBottom: 16 }}>
          <Text style={{ color: colors.primary, fontWeight: "800" }}>📡 Connect Your CGM App</Text>
          <Text style={{ color: colors.foreground, fontSize: 13, marginTop: 4 }}>JACS works alongside your CGM app. Install your CGM app below, then return here to log readings manually or view targets.</Text>
        </View>
        <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16, marginBottom: 12 }}>📱 CGM Apps</Text>
        {CGM_APPS.map((app, i) => (
          <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontSize: 28, marginRight: 10 }}>{app.icon}</Text>
              <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 15, flex: 1 }}>{app.name}</Text>
            </View>
            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 10 }}>{app.desc}</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => open(app.app_ios)} style={{ flex: 1, backgroundColor: colors.primary + "20", borderRadius: 10, padding: 10, alignItems: "center" }}><Text style={{ color: colors.primary, fontWeight: "700", fontSize: 12 }}>iOS App</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => open(app.app_android)} style={{ flex: 1, backgroundColor: colors.success + "20", borderRadius: 10, padding: 10, alignItems: "center" }}><Text style={{ color: colors.success, fontWeight: "700", fontSize: 12 }}>Android App</Text></TouchableOpacity>
              {app.phone ? <TouchableOpacity onPress={() => call(app.phone)} style={{ flex: 1, backgroundColor: colors.warning + "20", borderRadius: 10, padding: 10, alignItems: "center" }}><Text style={{ color: colors.warning, fontWeight: "700", fontSize: 12 }}>📞 Support</Text></TouchableOpacity> : null}
            </View>
          </View>
        ))}
        <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16, marginBottom: 12, marginTop: 8 }}>🎯 Glucose Target Ranges (Children)</Text>
        {TARGETS.map((t, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colorMap[t.color] + "40" }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colorMap[t.color], marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontWeight: "700" }}>{t.label}: <Text style={{ color: colorMap[t.color] }}>{t.range}</Text></Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{t.note}</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
