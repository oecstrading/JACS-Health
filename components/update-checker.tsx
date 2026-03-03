import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import * as Updates from "expo-updates";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "./ui/icon-symbol";

type UpdateStage = "idle" | "available" | "downloading" | "ready" | "error";

const SNOOZE_HOURS = 4; // re-prompt after 4 hours if user taps "Later"
const LAUNCH_DELAY_MS = 4000; // wait 4 s after launch before first check

/**
 * UpdateChecker
 *
 * Automatically checks for OTA updates via expo-updates on app launch and
 * when the app returns to the foreground (at most once per SNOOZE_HOURS).
 * Shows a polished modal prompt and handles the full download → reload flow.
 *
 * Works only in production builds; silently skips in Expo Go / dev mode.
 */
export function UpdateChecker() {
  const colors = useColors();
  const [stage, setStage] = useState<UpdateStage>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const lastCheckedAt = useRef<number>(0);
  const appState = useRef(AppState.currentState);

  // ── helpers ──────────────────────────────────────────────────────────────

  const isSupported =
    Platform.OS !== "web" && !__DEV__ && Updates.isEnabled;

  const canCheck = () => {
    const msSince = Date.now() - lastCheckedAt.current;
    return msSince > SNOOZE_HOURS * 60 * 60 * 1000;
  };

  const checkForUpdates = async () => {
    if (!isSupported || !canCheck()) return;
    lastCheckedAt.current = Date.now();
    try {
      const result = await Updates.checkForUpdateAsync();
      if (result.isAvailable) {
        setStage("available");
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (err: any) {
      // Silently ignore — update checks should never crash the app
      console.warn("[UpdateChecker] check failed:", err?.message);
    }
  };

  const handleInstall = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setStage("downloading");
    try {
      const result = await Updates.fetchUpdateAsync();
      if (result.isNew) {
        setStage("ready");
        setTimeout(() => Updates.reloadAsync(), 1500);
      } else {
        // Nothing new after all — dismiss silently
        setStage("idle");
      }
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Unknown error");
      setStage("error");
    }
  };

  const handleLater = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Reset so the snooze timer starts from now
    lastCheckedAt.current = Date.now();
    setStage("idle");
  };

  const handleDismissError = () => {
    setErrorMsg("");
    setStage("idle");
  };

  // ── effects ──────────────────────────────────────────────────────────────

  // Initial check after a short delay so the app feels snappy on launch
  useEffect(() => {
    const timer = setTimeout(checkForUpdates, LAUNCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-check when app returns to foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        checkForUpdates();
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── render ────────────────────────────────────────────────────────────────

  if (stage === "idle") return null;

  const isWorking = stage === "downloading" || stage === "ready";

  const title =
    stage === "error"
      ? "Update Failed"
      : stage === "ready"
      ? "Restarting…"
      : stage === "downloading"
      ? "Downloading Update"
      : "Update Available";

  const body =
    stage === "error"
      ? errorMsg || "Something went wrong while downloading the update."
      : stage === "ready"
      ? "Update downloaded. Restarting the app now…"
      : stage === "downloading"
      ? "Downloading the latest version. This will only take a moment."
      : "A new version of JACS Medical Monitoring System is available. Update now for the latest features and improvements.";

  const iconName =
    stage === "error"
      ? "exclamationmark.triangle.fill"
      : stage === "ready"
      ? "checkmark.circle.fill"
      : "arrow.down.circle.fill";

  const iconColor =
    stage === "error"
      ? colors.error
      : stage === "ready"
      ? colors.success
      : colors.primary;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={stage === "available" || stage === "error" ? handleLater : undefined}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.55)",
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 380,
            backgroundColor: colors.surface,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 28,
            alignItems: "center",
          }}
        >
          {/* Icon */}
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: iconColor + "22",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            <IconSymbol name={iconName} size={40} color={iconColor} />
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: colors.foreground,
              textAlign: "center",
              marginBottom: 10,
              lineHeight: 30,
            }}
          >
            {title}
          </Text>

          {/* Body */}
          <Text
            style={{
              fontSize: 15,
              color: colors.muted,
              textAlign: "center",
              lineHeight: 22,
              marginBottom: isWorking ? 20 : 0,
            }}
          >
            {body}
          </Text>

          {/* Spinner */}
          {isWorking && (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginBottom: 8 }}
            />
          )}

          {/* Buttons — available state */}
          {stage === "available" && (
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                marginTop: 24,
                width: "100%",
              }}
            >
              <Pressable
                onPress={handleLater}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: colors.muted,
                  }}
                >
                  Later
                </Text>
              </Pressable>

              <Pressable
                onPress={handleInstall}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text
                  style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}
                >
                  Install Now
                </Text>
              </Pressable>
            </View>
          )}

          {/* Dismiss button — error state */}
          {stage === "error" && (
            <Pressable
              onPress={handleDismissError}
              style={({ pressed }) => ({
                marginTop: 24,
                width: "100%",
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor: colors.primary,
                alignItems: "center",
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}
              >
                Dismiss
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}
