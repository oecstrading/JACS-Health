import { ScrollView, Text, View, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
const CGM_DEVICES = [
  { name: "Dexcom G7", icon: "📡", badge: "Best for Kids", bc: "success", desc: "Real-time glucose every 5 min. 10-day wear. No fingersticks. FDA-approved age 2+. Pairs with iPhone and Android.", ios: "https://apps.apple.com/us/app/dexcom-g7/id1635564931", android: "https://play.google.com/store/apps/details?id=com.dexcom.g7", phone: "+18883380005", link: "https://www.dexcom.com/g7" },
  { name: "FreeStyle Libre 3", icon: "🔵", badge: "Slim & Discreet", bc: "primary", desc: "Readings every minute. 14-day wear. Coin-sized sensor. No calibration. Great for active children.", ios: "https://apps.apple.com/us/app/freestyle-librelink-us/id1292893975", android: "https://play.google.com/store/apps/details?id=com.abbott.freestyle.libre", phone: "+18556327349", link: "https://www.freestylelibre.us" },
  { name: "Dexcom Follow (Parent App)", icon: "👨‍👩‍👧", badge: "Remote Monitoring", bc: "warning", desc: "See your child's glucose in real-time from anywhere. Alerts for lows and highs. Share with up to 10 followers.", ios: "https://apps.apple.com/us/app/dexcom-follow/id919297394", android: "https://play.google.com/store/apps/details?id=com.dexcom.follow", phone: "+18883380005", link: "https://www.dexcom.com/follow" },
];
const INSURANCE = [
  { name: "Medicaid / CHIP", note: "CGMs covered for T1D children in most states.", phone: "+18774672848" },
  { name: "Dexcom Patient Assistance", note: "Free CGM for uninsured/underinsured. Apply at dexcom.com/access.", phone: "+18883380005" },
  { name: "Abbott Libre Assist", note: "Free sensors for eligible patients. Apply at freestylelibre.us/assistance.", phone: "+18556327349" },
];
export default function CGMIntegrationScreen() {
  const colors = useColors();
  const cm: Record<string, string> = { success: colors.success, primary: colors.primary, warning: colors.warning };
  const open = (url: string) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL(url); };
  const call = (p: string) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL("tel:" + p); };
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">CGM Integration</Text>
        </View>
        <View style={{ backgroundColor: colors.primary + "15", borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.primary + "30" }}>
          <Text style={{ color: colors.primary, fontWeight: "800", marginBottom: 4 }}>📡 What is a CGM?</Text>
          <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20 }}>A Continuous Glucose Monitor measures blood sugar every 1–5 minutes and sends readings to your phone automatically — no fingersticks needed. For a child with T1D, a CGM is life-changing.</Text>
        </View>
        <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16, marginBottom: 12 }}>🔗 Recommended CGM Devices</Text>
        {CGM_DEVICES.map((d, i) => (
          <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontSize: 28, marginRight: 10 }}>{d.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 15 }}>{d.name}</Text>
                <View style={{ backgroundColor: cm[d.bc] + "20", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start", marginTop: 2 }}>
                  <Text style={{ color: cm[d.bc], fontWeight: "700", fontSize: 11 }}>{d.badge}</Text>
                </View>
              </View>
            </View>
            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 10 }}>{d.desc}</Text>
            <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
              <TouchableOpacity onPress={() => open(d.link)} style={{ backgroundColor: colors.primary + "20", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}><Text style={{ color: colors.primary, fontWeight: "700", fontSize: 12 }}>🌐 Website</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => open(d.ios)} style={{ backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 12 }}>iOS App</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => open(d.android)} style={{ backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 12 }}>Android App</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => call(d.phone)} style={{ backgroundColor: colors.success + "20", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}><Text style={{ color: colors.success, fontWeight: "700", fontSize: 12 }}>📞 Support</Text></TouchableOpacity>
            </View>
          </View>
        ))}
        <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16, marginBottom: 12 }}>💰 Insurance & Assistance</Text>
        {INSURANCE.map((ins, i) => (
          <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontWeight: "700" }}>{ins.name}</Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{ins.note}</Text>
            </View>
            <TouchableOpacity onPress={() => call(ins.phone)} style={{ backgroundColor: colors.success + "20", borderRadius: 10, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginLeft: 8 }}>
              <Text style={{ fontSize: 18 }}>📞</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
