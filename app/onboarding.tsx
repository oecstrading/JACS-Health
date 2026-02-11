import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

/**
 * Onboarding Tutorial
 * 
 * First-time user guide covering:
 * 1. Welcome & app overview
 * 2. Device pairing guide
 * 3. Master Dashboard navigation
 * 4. Logging medications/meals/insulin
 */

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  details: string[];
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome to HealthMate",
    description: "Your personal health companion for managing chronic conditions and staying connected with your care team.",
    icon: "👋",
    details: [
      "Track vitals like blood pressure, glucose, and weight",
      "Log medications, insulin doses, and meals",
      "Connect health devices via Bluetooth",
      "Share data with doctors and caregivers",
      "Medicare billing compliance built-in",
    ],
  },
  {
    id: 2,
    title: "Pair Your Devices",
    description: "Connect your health devices to automatically sync your vitals and glucose readings.",
    icon: "📱",
    details: [
      "Go to the Devices tab at the bottom",
      "Tap 'Scan for Nearby Devices'",
      "Select your device from the list",
      "Follow pairing instructions",
      "Supported: Omron BP, Samsung Watch, iHome Scale, Dexcom G7, Omnipod 5",
    ],
  },
  {
    id: 3,
    title: "Master Dashboard",
    description: "Access all your health monitoring dashboards in one place.",
    icon: "📊",
    details: [
      "Tap the Master Dashboard card on Home",
      "View Vitals Dashboard (BP, HR, Weight)",
      "View Diabetes Dashboard (Glucose, Insulin)",
      "Check Medicare Compliance status",
      "Review AI Health Insights",
    ],
  },
  {
    id: 4,
    title: "Log Your Health Data",
    description: "Quickly log medications, insulin, and meals from the Home screen.",
    icon: "✍️",
    details: [
      "Use Quick Actions on Home screen",
      "Log Medication: Track pills taken",
      "Log Insulin: Record bolus/basal doses",
      "Log Meal: Track carbs and food intake",
      "Data syncs to all dashboards automatically",
    ],
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await completeOnboarding();
  };

  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("onboarding_completed", "true");
      router.replace("/(tabs)" as any);
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      router.replace("/(tabs)" as any);
    }
  };

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <View className="flex-1 px-6 pt-12 pb-8">
        {/* Skip Button */}
        <View className="flex-row justify-end mb-6">
          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => ({
              paddingHorizontal: 20,
              paddingVertical: 10,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text className="text-lg font-semibold" style={{ color: colors.primary, lineHeight: 26 }}>
              Skip
            </Text>
          </Pressable>
        </View>

        {/* Progress Indicator */}
        <View className="mb-8">
          <View
            className="h-2 rounded-full"
            style={{ backgroundColor: `${colors.primary}20` }}
          >
            <View
              className="h-2 rounded-full"
              style={{
                backgroundColor: colors.primary,
                width: `${progress}%`,
              }}
            />
          </View>
          <Text className="text-sm text-muted mt-2 text-center" style={{ lineHeight: 20 }}>
            Step {currentStep + 1} of {ONBOARDING_STEPS.length}
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Icon */}
          <View className="items-center mb-8">
            <View
              className="w-32 h-32 rounded-full items-center justify-center"
              style={{ backgroundColor: `${colors.primary}10` }}
            >
              <Text style={{ fontSize: 64 }}>{step.icon}</Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-4xl font-bold text-foreground text-center mb-4" style={{ lineHeight: 48 }}>
            {step.title}
          </Text>

          {/* Description */}
          <Text className="text-xl text-muted text-center mb-8" style={{ lineHeight: 30 }}>
            {step.description}
          </Text>

          {/* Details */}
          <View className="gap-4 mb-8">
            {step.details.map((detail, index) => (
              <View key={index} className="flex-row items-start gap-3">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mt-1"
                  style={{ backgroundColor: `${colors.primary}20` }}
                >
                  <Text className="text-base font-bold" style={{ color: colors.primary, lineHeight: 22 }}>
                    {index + 1}
                  </Text>
                </View>
                <Text className="flex-1 text-lg text-foreground" style={{ lineHeight: 28 }}>
                  {detail}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View className="gap-4 mt-6">
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              borderRadius: 16,
              padding: 18,
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text className="text-xl font-bold text-white" style={{ lineHeight: 28 }}>
              {currentStep < ONBOARDING_STEPS.length - 1 ? "Next" : "Get Started"}
            </Text>
          </Pressable>

          {currentStep > 0 && (
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => ({
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 18,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                Back
              </Text>
            </Pressable>
          )}
        </View>

        {/* Dots Indicator */}
        <View className="flex-row justify-center gap-2 mt-6">
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: index === currentStep ? colors.primary : `${colors.muted}40`,
              }}
            />
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}
