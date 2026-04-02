import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Platform } from "react-native";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import { LanguageProvider } from "@/lib/language-provider";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { trpc, createTRPCClient } from "@/lib/trpc";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import updateService from "@/services/updateService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UpdateNotificationModal } from "@/components/UpdateNotificationModal";
import type { UpdateCheckResult } from "@/services/updateService";
import { UpdateChecker } from "@/components/update-checker";
import { PersonalizationPrompt } from "@/components/personalization-prompt";
import { HardGateScreen } from "@/components/hard-gate-screen";
import { useHardGate } from "@/hooks/use-hard-gate";
import { QuickLogFAB } from "@/components/quick-log-fab";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

export const unstable_settings = {
  anchor: "(tabs)",
};

function AppContent() {
  // Gate is always open — no blocking. useHardGate now only fires gentle 30-min reminders.
  // Users can use the full app freely whether or not they have logged vitals.
  useHardGate();
  return null;
}

/**
 * SetupWizardLauncher — checks AsyncStorage on mount.
 * If @jacs_setup_complete is not set, redirects to /setup-wizard on first launch.
 */
function SetupWizardLauncher() {
  const router = useRouter();
  useEffect(() => {
    AsyncStorage.getItem("@jacs_setup_complete").then((val) => {
      if (!val) {
        // Small delay so the tab navigator has time to mount
        setTimeout(() => router.push("/setup-wizard" as any), 600);
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function RootLayout() {
  const router = useRouter();
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);
  const [updateAvailable, setUpdateAvailable] = useState<UpdateCheckResult | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Initialize Manus runtime for cookie injection from parent container
  useEffect(() => {
    initManusRuntime();
  }, []);

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const { hostname, path } = Linking.parse(event.url);
      
      // Handle universal links (healthmate.app/feature-name)
      if (hostname === "healthmate.app" && path) {
        router.push(path as any);
      }
      // Handle custom scheme links (manus20260208103805://feature-name)
      else if (path) {
        router.push(path as any);
      }
    };

    // Listen for deep links when app is already open
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Handle deep link that opened the app
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Check for updates on app launch
  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const shouldCheck = await updateService.shouldCheckForUpdates();
      if (!shouldCheck) return;

      const result = await updateService.checkForUpdates();
      const prefs = await updateService.getUpdatePreferences();

      // Don't show if user skipped this version
      if (prefs.skipVersion === result.latestVersion) return;

      if (result.updateAvailable) {
        setUpdateAvailable(result);
        setShowUpdateModal(true);
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
    }
  };

  const handleUpdate = () => {
    // In production, this would trigger app store update or OTA update
    console.log("Update initiated");
    setShowUpdateModal(false);
  };

  const handleRemindLater = () => {
    setShowUpdateModal(false);
  };

  const handleSkip = async () => {
    if (updateAvailable) {
      await updateService.skipVersion(updateAvailable.latestVersion);
    }
    setShowUpdateModal(false);
  };

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  // Create clients once and reuse them
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching on window focus for mobile
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  // Ensure minimum 8px padding for top and bottom on mobile
  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {/* Default to hiding native headers so raw route segments don't appear (e.g. "(tabs)", "products/[id]"). */}
          {/* If a screen needs the native header, explicitly enable it and set a human title via Stack.Screen options. */}
          {/* in order for ios apps tab switching to work properly, use presentation: "fullScreenModal" for login page, whenever you decide to use presentation: "modal*/}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="oauth/callback" />
          </Stack>
          <StatusBar style="auto" />
          <UpdateChecker />
          <PersonalizationPrompt />
          <AppContent />
          <SetupWizardLauncher />
          <QuickLogFAB />
          {updateAvailable && (
            <UpdateNotificationModal
              visible={showUpdateModal}
              currentVersion={updateAvailable.currentVersion}
              latestVersion={updateAvailable.latestVersion}
              priority={updateAvailable.priority}
              features={updateAvailable.features}
              onUpdate={handleUpdate}
              onRemindLater={handleRemindLater}
              onSkip={handleSkip}
              shouldForceUpdate={updateAvailable.shouldForceUpdate}
            />
          )}
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <LanguageProvider>
          <SafeAreaProvider initialMetrics={providerInitialMetrics}>
            <SafeAreaFrameContext.Provider value={frame}>
              <SafeAreaInsetsContext.Provider value={insets}>
                {content}
              </SafeAreaInsetsContext.Provider>
            </SafeAreaFrameContext.Provider>
          </SafeAreaProvider>
        </LanguageProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
