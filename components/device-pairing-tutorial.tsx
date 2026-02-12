import { View, Text, Modal, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "./ui/icon-symbol";
import * as Haptics from "expo-haptics";

interface DevicePairingTutorialProps {
  visible: boolean;
  onClose: () => void;
}

export function DevicePairingTutorial({ visible, onClose }: DevicePairingTutorialProps) {
  const colors = useColors();
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to Device Pairing",
      description: "Learn how to connect your medical devices to JACS Medical Monitoring System for automatic health data tracking.",
      icon: "antenna.radiowaves.left.and.right",
      color: colors.primary,
    },
    {
      title: Platform.OS === "ios" ? "Enable Apple Health" : "Enable Google Fit",
      description: Platform.OS === "ios"
        ? "1. Open the Settings app on your iPhone\n2. Scroll down and tap 'Health'\n3. Tap 'Data Access & Devices'\n4. Find 'JACS Medical Monitoring System'\n5. Enable all health data categories (Weight, Blood Pressure, Heart Rate, Blood Glucose)"
        : "1. Open the Google Fit app on your Android device\n2. Tap your profile icon in the top right\n3. Tap 'Settings'\n4. Tap 'Manage connected apps'\n5. Find 'JACS Medical Monitoring System' and grant permissions",
      icon: Platform.OS === "ios" ? "heart.fill" : "favorite",
      color: "#EF4444",
    },
    {
      title: "Connect iHome Scale",
      description: "1. Download the iHome Health app from the App Store/Play Store\n2. Create an account and pair your iHome scale via Bluetooth\n3. Weigh yourself to record your first measurement\n4. Open " + (Platform.OS === "ios" ? "Apple Health" : "Google Fit") + " and verify the weight data appears\n5. Return to JACS and tap 'Sync Health Data' to import your weight history",
      icon: "figure.stand",
      color: "#0a7ea4",
    },
    {
      title: "Connect Omron Blood Pressure Monitor",
      description: "1. Download the Omron Connect app from the App Store/Play Store\n2. Create an account and pair your Omron BP monitor via Bluetooth\n3. Take a blood pressure reading following the device instructions\n4. Open " + (Platform.OS === "ios" ? "Apple Health" : "Google Fit") + " and verify the BP data appears\n5. Return to JACS and tap 'Sync Health Data' to import your BP history",
      icon: "heart.fill",
      color: "#EF4444",
    },
    {
      title: "Connect Fitbit Device",
      description: "1. Download the Fitbit app from the App Store/Play Store\n2. Create an account and pair your Fitbit device via Bluetooth\n3. Wear your Fitbit throughout the day to track heart rate and activity\n4. In the Fitbit app, go to Settings → Apps → " + (Platform.OS === "ios" ? "Apple Health" : "Google Fit") + " and enable data sharing\n5. Return to JACS and tap 'Sync Health Data' to import your fitness data",
      icon: "figure.walk",
      color: "#22C55E",
    },
    {
      title: "Enable Background Sync",
      description: "For the best experience, enable Background Sync in JACS:\n\n1. Go to Connected Devices in JACS\n2. Scroll to the " + (Platform.OS === "ios" ? "Apple Health" : "Google Fit") + " section\n3. Toggle 'Background Sync' ON\n4. Your health data will now sync automatically every 6 hours, even when the app is closed\n\nThis ensures your dashboard always shows the latest data from your devices.",
      icon: "arrow.clockwise",
      color: "#8B5CF6",
    },
    {
      title: "You're All Set!",
      description: "Your devices are now connected to JACS. Health data will sync automatically.\n\nTips:\n• Check the Device Data Dashboard to view trends\n• Sync manually anytime from Connected Devices\n• Add custom devices not listed using 'Add Custom Device'\n• Contact support if you need help with specific devices",
      icon: "checkmark.circle.fill",
      color: "#22C55E",
    },
  ];

  const currentTutorialStep = tutorialSteps[currentStep];

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      setCurrentStep(0);
    }
  };

  const handlePrevious = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    setCurrentStep(0);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleSkip}
    >
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* Header */}
        <View
          className="flex-row items-center justify-between border-b px-6 py-4"
          style={{ borderBottomColor: colors.border }}
        >
          <Text className="text-xl font-bold text-foreground">Device Pairing Guide</Text>
          <TouchableOpacity onPress={handleSkip}>
            <Text className="text-base font-semibold" style={{ color: colors.primary }}>
              Skip
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
          {/* Icon */}
          <View className="mb-6 items-center">
            <View
              className="h-24 w-24 items-center justify-center rounded-full"
              style={{ backgroundColor: currentTutorialStep.color + "20" }}
            >
              <IconSymbol
                name={currentTutorialStep.icon as any}
                size={48}
                color={currentTutorialStep.color}
              />
            </View>
          </View>

          {/* Title */}
          <Text className="mb-4 text-center text-2xl font-bold text-foreground">
            {currentTutorialStep.title}
          </Text>

          {/* Description */}
          <Text className="mb-8 text-center text-base leading-relaxed text-muted">
            {currentTutorialStep.description}
          </Text>

          {/* Progress Dots */}
          <View className="mb-8 flex-row justify-center gap-2">
            {tutorialSteps.map((_, index) => (
              <View
                key={index}
                className="h-2 rounded-full"
                style={{
                  width: index === currentStep ? 24 : 8,
                  backgroundColor: index === currentStep ? colors.primary : colors.border,
                }}
              />
            ))}
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View
          className="flex-row gap-3 border-t px-6 py-4"
          style={{ borderTopColor: colors.border }}
        >
          {currentStep > 0 && (
            <TouchableOpacity
              onPress={handlePrevious}
              className="flex-1 items-center justify-center rounded-full border py-4"
              style={{ borderColor: colors.border }}
            >
              <Text className="text-base font-semibold text-foreground">Previous</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleNext}
            className="flex-1 items-center justify-center rounded-full py-4"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-base font-semibold text-white">
              {currentStep === tutorialSteps.length - 1 ? "Done" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
