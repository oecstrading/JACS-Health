import { Text, View, ScrollView, Pressable, Image, type ViewStyle, Platform } from 'react-native';
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { ComplianceDashboard } from '@/components/compliance-dashboard';
import { IconSymbol } from "@/components/ui/icon-symbol";
import { OnboardingTour, DEFAULT_ONBOARDING_STEPS } from '@/components/onboarding-tour';

/**
 * Module I: Patient Command Center (Home Dashboard)
 * 
 * Daily status and rapid logging dashboard prioritizing immediate health status.
 * Features:
 * - Daily Vitals Ribbon (Glucose, BP, Weight)
 * - Quick Log section (Medication, Insulin, Meals)
 * - Master Dashboard access
 * - Medicare Compliance tracking
 */
export default function PatientCommandCenter() {
  const router = useRouter();
  const colors = useColors();

  const handleEmergency = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    alert("Emergency contact feature - calling primary contact");
  };

  const handleQuickLog = (type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === 'medication') router.push('/medication-tracker');
    else if (type === 'insulin') router.push('/medication-tracker');
    else if (type === 'meal') router.push('/food-scan');
  };

  const handleDownloadPresentation = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      const pdfUrl = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663129142386/mTCKjTTSeiMtQkHN.pdf';
      
      if (Platform.OS === 'web') {
        // On web, open PDF in new tab
        window.open(pdfUrl, '_blank');
      } else {
        // On native, download and share
        const fileUri = FileSystem.documentDirectory + 'HealthMate_Platform_Presentation.pdf';
        const downloadResult = await FileSystem.downloadAsync(pdfUrl, fileUri);
        
        if (downloadResult.uri) {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(downloadResult.uri, {
              mimeType: 'application/pdf',
              dialogTitle: 'HealthMate Platform Presentation',
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            alert('Sharing is not available on this device');
          }
        }
      }
    } catch (error) {
      console.error('Error downloading presentation:', error);
      alert('Could not download presentation. Please try again.');
    }
  };

  const handleDownloadHospiceEdition = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      const pdfUrl = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663129142386/yPQrDHBmRfahtaLt.pdf';
      
      if (Platform.OS === 'web') {
        // On web, open PDF in new tab
        window.open(pdfUrl, '_blank');
      } else {
        // On native, download and share
        const fileUri = FileSystem.documentDirectory + 'HealthMate_Hospice_Edition.pdf';
        const downloadResult = await FileSystem.downloadAsync(pdfUrl, fileUri);
        
        if (downloadResult.uri) {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(downloadResult.uri, {
              mimeType: 'application/pdf',
              dialogTitle: 'HealthMate Hospice Edition',
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            alert('Sharing is not available on this device');
          }
        }
      }
    } catch (error) {
      console.error('Error downloading Hospice Edition:', error);
      alert('Could not download Hospice Edition. Please try again.');
    }
  };

  return (
    <ScreenContainer>
      {/* Onboarding Tour */}
      <OnboardingTour steps={DEFAULT_ONBOARDING_STEPS} />
      {/* Header with greeting and emergency button */}
      <View className="px-6 pt-6 pb-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
              Hello! 👋
            </Text>
            <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
              Your Health Command Center
            </Text>
          </View>
        </View>
        
        {/* Presentation Download Buttons */}
        <View className="flex-row gap-2 mb-4">
          <Pressable
            onPress={handleDownloadPresentation}
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? colors.primary + "CC" : colors.primary,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            className="flex-1 flex-row items-center justify-center rounded-2xl py-4 px-3"
          >
            <IconSymbol name="paperplane.fill" size={18} color="#fff" />
            <Text className="ml-2 text-sm font-semibold text-white text-center flex-1">
              View Amazing Features
          </Text>
        </Pressable>
        
        <Pressable
            onPress={handleDownloadHospiceEdition}
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#f59e0b" + "CC" : "#f59e0b",
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            className="flex-1 flex-row items-center justify-center rounded-2xl py-4 px-3"
          >
            <IconSymbol name="house.fill" size={18} color="#fff" />
            <Text className="ml-2 text-sm font-semibold text-white text-center flex-1">
              Hospice Edition
          </Text>
        </Pressable>
      </View>
        
        {/* QR Code Section */}
        <View className="bg-surface rounded-2xl p-4 mb-4 border border-border items-center">
          <Text className="text-base font-semibold text-foreground mb-2">Scan to Download Mobile App</Text>
          <Image
            source={require('@/assets/images/app-qr-code.png')}
            style={{ width: 180, height: 180 }}
            resizeMode="contain"
          />
          <Text className="text-xs text-muted mt-2 text-center">Open Expo Go app and scan this code</Text>
        </View>
        
        <View className="flex-row items-center justify-end">
          <Pressable
            onPress={handleEmergency}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.95 : 1 }],
                opacity: pressed ? 0.8 : 1,
                backgroundColor: colors.error,
                width: 56,
                height: 56,
                borderRadius: 28,
                alignItems: "center",
                justifyContent: "center",
              } as ViewStyle,
            ]}
          >
            <IconSymbol name="phone.fill" size={24} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Daily Vitals Ribbon */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Today's Vitals
          </Text>
          <View className="flex-row justify-between gap-3">
            {/* Glucose */}
            <Pressable
              onPress={() => router.push('/vitals-tracker')}
              className="flex-1 bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View className="flex-row items-center justify-between mb-2">
                <IconSymbol name="drop.fill" size={20} color={colors.primary} />
                <Text className="text-xs text-muted">mg/dL</Text>
              </View>
              <Text className="text-2xl font-bold text-foreground">128</Text>
              <Text className="text-sm text-muted mt-1">Glucose</Text>
            </Pressable>

            {/* Blood Pressure */}
            <Pressable
              onPress={() => router.push('/vitals-tracker')}
              className="flex-1 bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View className="flex-row items-center justify-between mb-2">
                <IconSymbol name="heart.fill" size={20} color={colors.error} />
                <Text className="text-xs text-muted">mmHg</Text>
              </View>
              <Text className="text-2xl font-bold text-foreground">120/80</Text>
              <Text className="text-sm text-muted mt-1">Blood Pressure</Text>
            </Pressable>

            {/* Weight */}
            <Pressable
              onPress={() => router.push('/vitals-tracker')}
              className="flex-1 bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View className="flex-row items-center justify-between mb-2">
                <IconSymbol name="figure.walk" size={20} color={colors.success} />
                <Text className="text-xs text-muted">lbs</Text>
              </View>
              <Text className="text-2xl font-bold text-foreground">165</Text>
              <Text className="text-sm text-muted mt-1">Weight</Text>
            </Pressable>
          </View>
        </View>

        {/* Quick Log Section */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Quick Log
          </Text>
          <View className="gap-3">
            <Pressable
              onPress={() => handleQuickLog('medication')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="pills.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Log Medication</Text>
                <Text className="text-sm text-muted">Record medication taken</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleQuickLog('insulin')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="syringe.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Log Insulin</Text>
                <Text className="text-sm text-muted">Record insulin dose</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleQuickLog('meal')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <IconSymbol name="fork.knife" size={24} color={colors.success} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Log Meal</Text>
                <Text className="text-sm text-muted">Track food and carbs</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* Master Dashboard Access */}
        <Pressable
          onPress={() => router.push('/master-dashboard')}
          className="bg-primary rounded-3xl p-6 mb-6"
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xl font-bold text-white mb-2">Master Dashboard</Text>
              <Text className="text-white opacity-90">
                View complete health trends and history
              </Text>
            </View>
            <IconSymbol name="chart.bar.fill" size={32} color="#ffffff" />
          </View>
        </Pressable>

        {/* Medicare Compliance Dashboard */}
        <ComplianceDashboard />

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
