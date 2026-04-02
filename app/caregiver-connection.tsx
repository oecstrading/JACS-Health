import { ScrollView, Text, View, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
const COMMUNITIES = [
  { name: "JDRF Community", desc: "Largest T1D nonprofit — research, advocacy, peer support", phone: "+18005334397", url: "https://www.jdrf.org", members: "2M+ members" },
  { name: "Beyond Type 1", desc: "Modern T1D community app and website — stories, resources, peer connection", phone: "", url: "https://beyondtype1.org", members: "500K+ members" },
  { name: "T1D Exchange", desc: "Patient registry and community — share data to advance T1D research", phone: "", url: "https://t1dexchange.org", members: "30K+ patients" },
  { name: "ADA Community", desc: "American Diabetes Association — education, recipes, advocacy", phone: "+18007423600", url: "https://www.diabetes.org", members: "10M+ members" },
  { name: "Children with Diabetes", desc: "Oldest online T1D parent community — forums, conferences, resources", phone: "", url: "https://www.childrenwithdiabetes.com", members: "100K+ families" },
  { name: "DiabetesMine", desc: "Patient-led diabetes news and community — product reviews, advocacy", phone: "", url: "https://www.healthline.com/diabetesmine", members: "1M+ readers" },
];
export default function CaregiverConnectionScreen() {
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
          <Text className="flex-1 text-2xl font-bold text-foreground">Caregiver Community</Text>
        </View>
        <View style={{ backgroundColor: colors.success + "20", borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.success }}>
          <Text style={{ color: colors.success, fontWeight: "800" }}>💙 You are not alone</Text>
          <Text style={{ color: colors.foreground, fontSize: 13, marginTop: 4 }}>Millions of T1D families worldwide share your journey. Connect with them below.</Text>
        </View>
        {COMMUNITIES.map((c, i) => (
          <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 15, flex: 1 }}>{c.name}</Text>
              <View style={{ backgroundColor: colors.primary + "15", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}><Text style={{ color: colors.primary, fontSize: 11, fontWeight: "700" }}>{c.members}</Text></View>
            </View>
            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 10 }}>{c.desc}</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {c.phone ? <TouchableOpacity onPress={() => call(c.phone)} style={{ flex: 1, backgroundColor: colors.primary + "20", borderRadius: 10, padding: 10, alignItems: "center" }}><Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13 }}>📞 Call</Text></TouchableOpacity> : null}
              <TouchableOpacity onPress={() => open(c.url)} style={{ flex: 1, backgroundColor: colors.success + "20", borderRadius: 10, padding: 10, alignItems: "center" }}><Text style={{ color: colors.success, fontWeight: "700", fontSize: 13 }}>🌐 Join</Text></TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
