import { ScrollView, View, Text, Pressable, Linking, Platform } from 'react-native';
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useRef } from 'react';
import QRCode from 'react-native-qrcode-svg';
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';

/**
 * Investor Pitch Deck Viewer
 * 
 * Displays the investor-focused pitch deck for hospice compliance automation.
 * Provides view and download options.
 */
export default function InvestorPitchDeckScreen() {
  const router = useRouter();
  const colors = useColors();
  const qrCodeRef = useRef<View>(null);

  const pitchDeckUrl = 'https://slides.manus.im/jMFu3AgykasLuJnZ1TeOEv';

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

  const handleShareQR = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (Platform.OS === 'web') {
        // On web, just copy the URL
        await navigator.clipboard.writeText(pitchDeckUrl);
        alert('Pitch deck URL copied to clipboard!');
        return;
      }

      // On mobile, capture QR code as image and share
      if (qrCodeRef.current) {
        const uri = await captureRef(qrCodeRef.current, {
          format: 'png',
          quality: 1,
        });
        
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share Investor Pitch Deck QR Code',
          });
        }
      }
    } catch (error) {
      console.error("Error sharing QR code:", error);
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
            Investor Pitch Deck
          </Text>
          <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
            Hospice compliance automation
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Deck Preview Card */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <View className="items-center mb-6">
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: '#FF8C0020' }}
            >
              <IconSymbol name="folder.fill" size={48} color="#FF8C00" />
            </View>
            <Text className="text-2xl font-bold text-foreground text-center mb-2" style={{ lineHeight: 32 }}>
              JACS Medical Monitoring System
            </Text>
            <Text className="text-lg text-muted text-center" style={{ lineHeight: 26 }}>
              Hospice Compliance Automation
            </Text>
          </View>

          <View className="bg-background rounded-2xl p-4 mb-4 border border-border">
            <Text className="text-base text-foreground mb-2" style={{ lineHeight: 24 }}>
              <Text className="font-semibold">Target Audience:</Text> Investors, hospice agencies, healthcare executives
            </Text>
            <Text className="text-base text-foreground mb-2" style={{ lineHeight: 24 }}>
              <Text className="font-semibold">Focus:</Text> HQRP compliance, 4% APU penalty prevention, $2M seed round
            </Text>
            <Text className="text-base text-foreground" style={{ lineHeight: 24 }}>
              <Text className="font-semibold">Slides:</Text> 12 professional slides
            </Text>
          </View>

          {/* QR Code */}
          <View className="items-center mb-4">
            <View
              ref={qrCodeRef}
              className="bg-white p-4 rounded-2xl"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
            >
              <QRCode
                value={pitchDeckUrl}
                size={200}
                backgroundColor="white"
                color="#FF8C00"
              />
            </View>
            <Text className="text-sm text-muted mt-2 text-center">Scan to view pitch deck</Text>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <Pressable
              onPress={handleViewDeck}
              className="rounded-2xl p-5 items-center"
              style={({ pressed }) => ({
                backgroundColor: '#FF8C00',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text className="text-lg font-bold text-white">View Pitch Deck</Text>
            </Pressable>

            <Pressable
              onPress={handleDownload}
              className="rounded-2xl p-5 items-center border-2"
              style={({ pressed }) => ({
                borderColor: '#FF8C00',
                backgroundColor: pressed ? '#FF8C0010' : 'transparent',
              })}
            >
              <Text className="text-lg font-bold" style={{ color: '#FF8C00' }}>
                Download / Share
              </Text>
            </Pressable>

            <Pressable
              onPress={handleShareQR}
              className="rounded-2xl p-5 items-center border-2"
              style={({ pressed }) => ({
                borderColor: colors.success,
                backgroundColor: pressed ? `${colors.success}10` : 'transparent',
              })}
            >
              <Text className="text-lg font-bold" style={{ color: colors.success }}>
                Share QR Code
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
              { title: "Title Slide", subtitle: "Hospice Compliance Automation" },
              { title: "The Compliance Crisis", subtitle: "4% APU penalty risk" },
              { title: "Automated Protection", subtitle: "Real-time HQRP monitoring" },
              { title: "Cost Report Automation", subtitle: "Instant APU calculation" },
              { title: "Clinical Efficiency", subtitle: "Medication & vitals tracking" },
              { title: "Guarantee & ROI", subtitle: "No penalty or money back" },
              { title: "Pilot Traction", subtitle: "3 agencies, 120 patients" },
              { title: "Market Opportunity", subtitle: "$22B hospice industry" },
              { title: "Business Model", subtitle: "$199/patient/month SaaS" },
              { title: "Competitive Advantage", subtitle: "Only HQRP-focused solution" },
              { title: "Product Roadmap", subtitle: "AI predictive compliance" },
              { title: "Investment Opportunity", subtitle: "$2M seed round" },
            ].map((slide, index) => (
              <View
                key={index}
                className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: '#FF8C0020' }}
                >
                  <Text className="text-base font-bold" style={{ color: '#FF8C00' }}>
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
