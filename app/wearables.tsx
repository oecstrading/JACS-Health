import { ScrollView, Text, View, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
const DEVICES = [
  { name: "Dexcom G7", type: "CGM", icon: "📡", price: "$349/sensor 3-pack", wear: "10 days", compat: "iOS & Android", url: "https://www.dexcom.com", desc: "Best-in-class CGM for children. Real-time glucose every 5 min. No fingersticks required." },
  { name: "FreeStyle Libre 3", type: "CGM", icon: "🔵", price: "$75/sensor", wear: "14 days", compat: "iOS & Android", url: "https://www.freestyle.abbott", desc: "Slim, discreet CGM. Continuous readings every minute. No scanning needed." },
  { name: "Omnipod 5", type: "Insulin Pump", icon: "💉", price: "Insurance covered", wear: "3 days/pod", compat: "iOS & Android", url: "https://www.omnipod.com", desc: "Tubeless, waterproof insulin pump. Automated insulin delivery. Works with Dexcom G6." },
  { name: "Medtronic 780G", type: "Closed Loop", icon: "🤖", price: "Insurance covered", wear: "Continuous", compat: "Dedicated device", url: "https://www.medtronic.com", desc: "Advanced hybrid closed-loop system. Auto-adjusts insulin every 5 min." },
  { name: "Apple Watch (Glucose)", type: "Smartwatch", icon: "⌚", price: "$399+", wear: "Continuous", compat: "iPhone only", url: "https://www.apple.com/apple-watch", desc: "Displays CGM data via Dexcom/Libre app. Haptic alerts for lows and highs." },
  { name: "Garmin Venu 3", type: "Fitness Tracker", icon: "🏃", price: "$449", wear: "Continuous", compat: "iOS & Android", url: "https://www.garmin.com", desc: "Displays Dexcom CGM data. Tracks activity, sleep, and heart rate for T1D management." },
];
export default function WearablesScreen() {
  const colors = useColors();
  const open = (url: string) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL(url); };
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Wearable Devices</Text>
        </View>
        {DEVICES.map((d, i) => (
          <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontSize: 28, marginRight: 10 }}>{d.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16 }}>{d.name}</Text>
                <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                  <View style={{ backgroundColor: colors.primary + "20", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}><Text style={{ color: colors.primary, fontSize: 11, fontWeight: "700" }}>{d.type}</Text></View>
                  <View style={{ backgroundColor: colors.surface, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: colors.muted, fontSize: 11 }}>{d.compat}</Text></View>
                </View>
              </View>
            </View>
            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 8 }}>{d.desc}</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
              <Text style={{ color: colors.foreground, fontSize: 13 }}>💰 {d.price}</Text>
              <Text style={{ color: colors.foreground, fontSize: 13 }}>⏱️ Wear: {d.wear}</Text>
            </View>
            <TouchableOpacity onPress={() => open(d.url)} style={{ backgroundColor: colors.primary + "20", borderRadius: 10, padding: 10, alignItems: "center" }}>
              <Text style={{ color: colors.primary, fontWeight: "700" }}>🌐 Learn More & Order</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
