import { ScrollView, Text, View, TouchableOpacity, Linking, Share } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
const STORIES = [
  { name: "Nick Jonas", role: "Singer / T1D since age 13", quote: "Diabetes is not a limitation. It has made me stronger and more disciplined.", url: "https://beyondtype1.org/nick-jonas" },
  { name: "Mary Tyler Moore", role: "Actress / T1D advocate", quote: "Take care of yourself. You are the most important person in your child's life.", url: "https://www.jdrf.org" },
  { name: "Sonia Sotomayor", role: "Supreme Court Justice / T1D since age 7", quote: "I have spent my whole life learning to manage my diabetes. It has not stopped me.", url: "https://beyondtype1.org" },
];
export default function SocialFeaturesScreen() {
  const colors = useColors();
  const open = (url: string) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL(url); };
  const shareStory = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Share.share({ message: "My child has Type 1 Diabetes and we use JACS Health Companion to keep them safe. Download it free: https://play.google.com/store/apps/details?id=space.manus.jacs" });
  };
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">T1D Community</Text>
        </View>
        <View style={{ backgroundColor: colors.primary + "15", borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 16, marginBottom: 4 }}>💙 T1D Warriors — Famous & Inspiring</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>Your child is in great company. These world-changers all have T1D.</Text>
        </View>
        {STORIES.map((s, i) => (
          <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 15 }}>{s.name}</Text>
            <Text style={{ color: colors.primary, fontSize: 12, marginTop: 2, marginBottom: 8 }}>{s.role}</Text>
            <Text style={{ color: colors.muted, fontSize: 13, fontStyle: "italic", marginBottom: 10 }}>"{s.quote}"</Text>
            <TouchableOpacity onPress={() => open(s.url)} style={{ backgroundColor: colors.primary + "20", borderRadius: 10, padding: 10, alignItems: "center" }}>
              <Text style={{ color: colors.primary, fontWeight: "700" }}>Read Their Story</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={shareStory} style={{ backgroundColor: colors.success, borderRadius: 16, padding: 16, alignItems: "center", marginTop: 8, marginBottom: 24 }}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>💚 Share JACS with Another T1D Family</Text>
          <Text style={{ color: "#fff", fontSize: 13, marginTop: 4, opacity: 0.9 }}>Help another parent keep their child safe</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
