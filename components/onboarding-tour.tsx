import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  route?: string;
  position?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

interface OnboardingTourProps {
  steps: OnboardingStep[];
  onComplete?: () => void;
}

const ONBOARDING_KEY = "@jacs_medical_onboarding_completed";

export function OnboardingTour({ steps, onComplete }: OnboardingTourProps) {
  const colors = useColors();
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!completed) {
        // First time user - show onboarding
        setTimeout(() => setVisible(true), 1000);
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    }
  };

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      setVisible(false);
      onComplete?.();
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  if (!visible || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Progress Bar */}
        <View
          style={{
            position: "absolute",
            top: 60,
            left: 20,
            right: 20,
            height: 4,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: 2,
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${progress}%`,
              backgroundColor: colors.primary,
              borderRadius: 2,
            }}
          />
        </View>

        {/* Skip Button */}
        <TouchableOpacity
          onPress={handleSkip}
          style={{
            position: "absolute",
            top: 50,
            right: 20,
            padding: 12,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            Skip
          </Text>
        </TouchableOpacity>

        {/* Content Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 24,
            padding: 32,
            marginHorizontal: 24,
            maxWidth: 400,
            width: SCREEN_WIDTH - 48,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {/* Icon */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primary,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 40 }}>{step.icon}</Text>
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: colors.foreground,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            {step.title}
          </Text>

          {/* Description */}
          <Text
            style={{
              fontSize: 16,
              color: colors.muted,
              textAlign: "center",
              lineHeight: 24,
              marginBottom: 32,
            }}
          >
            {step.description}
          </Text>

          {/* Step Indicator */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginBottom: 24,
            }}
          >
            {steps.map((_, index) => (
              <View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    index === currentStep
                      ? colors.primary
                      : "rgba(255, 255, 255, 0.3)",
                }}
              />
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            onPress={handleNext}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 48,
              paddingVertical: 16,
              borderRadius: 12,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Step Counter */}
        <Text
          style={{
            position: "absolute",
            bottom: 40,
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: 14,
          }}
        >
          {currentStep + 1} of {steps.length}
        </Text>
      </View>
    </Modal>
  );
}

// Helper function to reset onboarding (for testing)
export async function resetOnboarding() {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    console.log("Onboarding reset successfully");
  } catch (error) {
    console.error("Error resetting onboarding:", error);
  }
}

// Default onboarding steps for JACS Medical Monitoring System
export const DEFAULT_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to JACS Medical Monitoring System",
    description:
      "Your comprehensive AI-driven medical monitoring platform. Let's take a quick tour of the key features.",
    icon: "👋",
  },
  {
    id: "revenue-command",
    title: "Revenue Command",
    description:
      "Track APU status, manage HIS/HOPE submissions, and monitor CAHPS compliance. Save 35-40 hours per month on administrative tasks.",
    icon: "🛡️",
    route: "/hospice-revenue-command",
  },
  {
    id: "medication-tracker",
    title: "Medication Tracker",
    description:
      "Manage medications, log doses, track adherence, and get refill warnings. Never miss a dose again.",
    icon: "💊",
    route: "/medication-tracker",
  },
  {
    id: "vitals-tracker",
    title: "Vitals Tracker",
    description:
      "Monitor blood pressure, glucose, weight, heart rate, temperature, and oxygen saturation. View trends over time.",
    icon: "❤️",
    route: "/vitals-tracker",
  },
  {
    id: "ai-assistant",
    title: "AI Voice Assistant",
    description:
      "Ask health questions, get medication reminders, and receive personalized recommendations powered by AI.",
    icon: "🤖",
    route: "/ai-assistant",
  },
  {
    id: "connected-devices",
    title: "Connected Devices",
    description:
      "Connect Bluetooth health monitors for automatic vitals syncing. Supports glucose meters, BP monitors, and more.",
    icon: "📱",
    route: "/connected-devices",
  },
  {
    id: "features",
    title: "70+ Features",
    description:
      "Explore all features in the Features tab. From hospice compliance to health tracking, we've got you covered.",
    icon: "✨",
    route: "/(tabs)/features",
  },
];
