import { useEffect, useState, useCallback } from "react";
import * as Updates from "expo-updates";
import { Platform } from "react-native";

export type UpdateState =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "ready"
  | "error";

export interface AppUpdateInfo {
  state: UpdateState;
  errorMessage?: string;
  checkForUpdate: () => Promise<void>;
  downloadAndApply: () => Promise<void>;
  dismissUpdate: () => void;
}

/**
 * Hook to manage OTA updates via expo-updates.
 *
 * - On mount, automatically checks for an available update.
 * - Exposes `checkForUpdate` to trigger a manual re-check.
 * - Exposes `downloadAndApply` to fetch and reload the app.
 * - Works only in production builds; in dev/Expo Go it stays "idle".
 */
export function useAppUpdate(): AppUpdateInfo {
  const [state, setState] = useState<UpdateState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // expo-updates APIs are unavailable in Expo Go / dev mode
  const isSupported =
    Platform.OS !== "web" && !__DEV__ && Updates.isEnabled;

  const checkForUpdate = useCallback(async () => {
    if (!isSupported) return;
    setState("checking");
    try {
      const result = await Updates.checkForUpdateAsync();
      setState(result.isAvailable ? "available" : "idle");
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Unknown error");
      setState("error");
    }
  }, [isSupported]);

  const downloadAndApply = useCallback(async () => {
    if (!isSupported) return;
    setState("downloading");
    try {
      await Updates.fetchUpdateAsync();
      setState("ready");
      // Give the user a moment to see the "ready" state before reloading
      setTimeout(() => Updates.reloadAsync(), 1500);
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Unknown error");
      setState("error");
    }
  }, [isSupported]);

  const dismissUpdate = useCallback(() => {
    setState("idle");
    setErrorMessage(undefined);
  }, []);

  // Auto-check once on mount (after a short delay so the app feels snappy)
  useEffect(() => {
    if (!isSupported) return;
    const timer = setTimeout(() => {
      checkForUpdate();
    }, 3000); // 3-second delay after launch
    return () => clearTimeout(timer);
  }, [checkForUpdate, isSupported]);

  return { state, errorMessage, checkForUpdate, downloadAndApply, dismissUpdate };
}
