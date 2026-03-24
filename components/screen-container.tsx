/**
 * ScreenContainer — Cross-Platform Safe Area Wrapper
 *
 * Handles:
 * - iPhone notch (iPhone X–15)
 * - iPhone Dynamic Island (iPhone 14 Pro, 15 Pro, 16 series)
 * - Samsung Galaxy punch-hole cameras (S21–S25 series)
 * - Samsung Galaxy fold/flip (variable insets)
 * - iPad / tablet (larger insets, landscape support)
 * - Android edge-to-edge mode (SDK 35+)
 * - Web (no safe area needed)
 *
 * Usage:
 *   <ScreenContainer className="p-4">...</ScreenContainer>
 *   <ScreenContainer edges={["top","bottom","left","right"]}>...</ScreenContainer>
 */

import React from "react";
import { View, Platform, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { cn } from "@/lib/utils";

export interface ScreenContainerProps extends ViewProps {
  /**
   * SafeArea edges to apply.
   * Default: ["top", "left", "right"] — bottom handled by tab bar.
   * Use ["top","bottom","left","right"] for modals or screens without tab bar.
   */
  edges?: Edge[];
  /** Tailwind className for the inner content area */
  className?: string;
  /** Tailwind className for the outer background container */
  containerClassName?: string;
  /** Tailwind className for the SafeAreaView layer */
  safeAreaClassName?: string;
  /** Background color override (hex). Defaults to theme background. */
  backgroundColor?: string;
}

export function ScreenContainer({
  children,
  edges = ["top", "left", "right"],
  className,
  containerClassName,
  safeAreaClassName,
  backgroundColor,
  style,
  ...props
}: ScreenContainerProps) {
  // On web, safe area is not needed — render a plain flex container
  if (Platform.OS === "web") {
    return (
      <View
        style={[
          { flex: 1, backgroundColor: backgroundColor ?? undefined },
          style,
        ]}
        className={cn("flex-1 bg-background", containerClassName)}
        {...props}
      >
        <View className={cn("flex-1", className)}>{children}</View>
      </View>
    );
  }

  return (
    <View
      style={backgroundColor ? { flex: 1, backgroundColor } : undefined}
      className={cn("flex-1 bg-background", containerClassName)}
      {...props}
    >
      <SafeAreaView
        edges={edges}
        style={style}
        className={cn("flex-1", safeAreaClassName)}
        // mode="padding" is the default and works correctly for all devices
        // including Samsung Galaxy punch-hole and iPhone Dynamic Island
      >
        <View className={cn("flex-1", className)}>{children}</View>
      </SafeAreaView>
    </View>
  );
}
