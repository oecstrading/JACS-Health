import { ScrollView, View, Text, Pressable, Linking, Platform } from 'react-native';
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';

/**
 * Consumer Pitch Deck Viewer
 * 
 * Displays the consumer-focused pitch deck for individuals, families,
 * and small home care businesses. Provides view and download options.
 */
export default function ConsumerPitchDeckScreen() {
  const router = useRouter();
  const colors = useColors();

  const pitchDeckUrl = 'https://slides.manus.im/SGKzb34URNmefEByIBHuTe';

  const handleViewDeck = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const supported = await Linking.canOpenURL(pitchDeckUrl);
      if (supported) {
        await Linking.openURL(pitchDeckUrl);
      } else {
        console.error("Cannot open URL:", pitchDeckUrl);
      }
    } catch (error) {
      console.error("Error opening pitch deck:", error);
    }
  };

  const handleDownload = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // On mobile, opening the URL will allow viewing and downloading
    try {
      const supported = await Linking.canOpenURL(pitchDeckUrl);
      if (supported) {
        await Linking.openURL(pitchDeckUrl);
      }
    } catch (error) {
      console.error("Error downloading pitch deck:", error);
    }
  };

  return (
    <ScreenContainer>
      {/* Header with Back Button */}
      <View className="px-6 pt-6 pb-4 flex-row items-center">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          className="mr-4"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <IconSymbol name="chevron.left" size={28} color={colors.primary} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
            Consumer Pitch Deck
          </Text>
          <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
            For individuals & families
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Deck Preview Card */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <View className="items-center mb-6">
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <IconSymbol name="folder.fill" size={48} color={colors.primary} />
            </View>
            <Text className="text-2xl font-bold text-foreground text-center mb-2" style={{ lineHeight: 32 }}>
              JACS Medical Monitoring System
            </Text>
            <Text className="text-lg text-muted text-center" style={{ lineHeight: 26 }}>
              Your Family's Health Guardian
            </Text>
          </View>

          <View className="bg-background rounded-2xl p-4 mb-4 border border-border">
            <Text className="text-base text-foreground mb-2" style={{ lineHeight: 24 }}>
              <Text className="font-semibold">Target Audience:</Text> Individual users, families, and small home care businesses
            </Text>
            <Text className="text-base text-foreground mb-2" style={{ lineHeight: 24 }}>
              <Text className="font-semibold">Focus:</Text> Health monitoring, medication management, AI assistant, caregiver connection
            </Text>
            <Text className="text-base text-foreground" style={{ lineHeight: 24 }}>
              <Text className="font-semibold">Slides:</Text> 12 professional slides
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <Pressable
              onPress={handleViewDeck}
              className="rounded-2xl p-5 items-center"
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text className="text-lg font-bold text-white">View Pitch Deck</Text>
            </Pressable>

            <Pressable
              onPress={handleDownload}
              className="rounded-2xl p-5 items-center border-2"
              style={({ pressed }) => ({
                borderColor: colors.primary,
                backgroundColor: pressed ? `${colors.primary}10` : 'transparent',
              })}
            >
              <Text className="text-lg font-bold" style={{ color: colors.primary }}>
                Download / Share
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Deck Contents */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Deck Contents
          </Text>
          <View className="gap-3">
            {[
              { title: "Title Slide", subtitle: "Your Family's Health Guardian" },
              { title: "The Challenge", subtitle: "Family caregiving pain points" },
              { title: "Health Monitoring", subtitle: "Vitals tracking & trends" },
              { title: "Medication Management", subtitle: "Smart reminders & safety" },
              { title: "AI Health Assistant", subtitle: "24/7 voice-activated support" },
              { title: "Caregiver Connection", subtitle: "Family coordination portal" },
              { title: "Predictive Alerts", subtitle: "Early health issue detection" },
              { title: "Emergency SOS", subtitle: "Fall detection & instant alerts" },
              { title: "Small Business Tools", subtitle: "Multi-client management" },
              { title: "Pricing", subtitle: "Individual, Family, Small Business" },
              { title: "Testimonials", subtitle: "Real user success stories" },
              { title: "Get Started", subtitle: "30-day free trial" },
            ].map((slide, index) => (
              <View
                key={index}
                className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${colors.primary}20` }}
                >
                  <Text className="text-base font-bold" style={{ color: colors.primary }}>
                    {index + 1}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">{slide.title}</Text>
                  <Text className="text-sm text-muted">{slide.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
