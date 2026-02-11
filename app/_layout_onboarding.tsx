import { useEffect, useState } from "react";
import { router, Slot } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Onboarding Check
 * 
 * Checks if user has completed onboarding on first launch.
 * If not, redirects to onboarding screen.
 */

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem("onboarding_completed");
      
      if (!completed) {
        // First time user - show onboarding
        router.replace("/onboarding" as any);
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return null; // Or show a splash screen
  }

  return <>{children}</>;
}
