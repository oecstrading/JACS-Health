import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import type { AppUpdateInfo, UpdateState } from "@/hooks/use-app-update";

interface UpdatePromptProps {
  updateInfo: AppUpdateInfo;
}

/**
 * A modal that appears when an OTA update is available.
 * Shows download progress and reloads the app once ready.
 */
export function UpdatePrompt({ updateInfo }: UpdatePromptProps) {
  const colors = useColors();
  const { state, errorMessage, downloadAndApply, dismissUpdate } = updateInfo;

  const visible =
    state === "available" ||
    state === "downloading" ||
    state === "ready" ||
    state === "error";

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={dismissUpdate}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Icon */}
          <View
            style={[styles.iconCircle, { backgroundColor: colors.primary + "22" }]}
          >
            <Text style={styles.iconText}>
              {state === "error" ? "⚠️" : state === "ready" ? "✅" : "🔄"}
            </Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.foreground }]}>
            {state === "error"
              ? "Update Failed"
              : state === "ready"
              ? "Restarting…"
              : state === "downloading"
              ? "Downloading Update"
              : "Update Available"}
          </Text>

          {/* Body */}
          <Text style={[styles.body, { color: colors.muted }]}>
            {state === "error"
              ? errorMessage ?? "An error occurred while updating."
              : state === "ready"
              ? "Update downloaded. Restarting the app now…"
              : state === "downloading"
              ? "Downloading the latest version. This will only take a moment."
              : "A new version of the app is available. Install it now to get the latest features and improvements."}
          </Text>

          {/* Progress indicator */}
          {(state === "downloading" || state === "ready") && (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={styles.spinner}
            />
          )}

          {/* Action buttons */}
          {state === "available" && (
            <View style={styles.buttonRow}>
              <Pressable
                onPress={dismissUpdate}
                style={({ pressed }) => [
                  styles.btnSecondary,
                  { borderColor: colors.border },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text style={[styles.btnSecondaryText, { color: colors.muted }]}>
                  Later
                </Text>
              </Pressable>

              <Pressable
                onPress={downloadAndApply}
                style={({ pressed }) => [
                  styles.btnPrimary,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.btnPrimaryText}>Install Now</Text>
              </Pressable>
            </View>
          )}

          {state === "error" && (
            <Pressable
              onPress={dismissUpdate}
              style={({ pressed }) => [
                styles.btnPrimary,
                { backgroundColor: colors.primary, marginTop: 16 },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.btnPrimaryText}>Dismiss</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 8,
  },
  spinner: {
    marginTop: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    width: "100%",
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  btnSecondaryText: {
    fontSize: 15,
    fontWeight: "600",
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  btnPrimaryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
