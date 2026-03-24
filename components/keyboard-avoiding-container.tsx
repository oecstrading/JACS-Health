/**
 * KeyboardAvoidingContainer
 *
 * Wraps content in a KeyboardAvoidingView that works correctly on:
 * - iPhone (all sizes including Dynamic Island models): behavior="padding"
 * - Samsung Galaxy and Android devices: behavior="height"
 * - Web: no-op passthrough
 *
 * Usage:
 *   <KeyboardAvoidingContainer>
 *     <ScrollView>...</ScrollView>
 *   </KeyboardAvoidingContainer>
 */

import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Extra bottom offset (e.g. tab bar height). Defaults to 0. */
  extraOffset?: number;
  /** Whether to wrap children in a ScrollView. Defaults to false. */
  scrollable?: boolean;
}

export function KeyboardAvoidingContainer({
  children,
  style,
  extraOffset = 0,
  scrollable = false,
}: Props) {
  const insets = useSafeAreaInsets();

  if (Platform.OS === "web") {
    return <>{children}</>;
  }

  const behavior = Platform.OS === "ios" ? "padding" : "height";
  // On Android, the keyboard pushes content up automatically with windowSoftInputMode=adjustResize
  // On iOS, we need to add padding equal to keyboard height
  const keyboardVerticalOffset =
    Platform.OS === "ios" ? insets.top + extraOffset : extraOffset;

  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={behavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {scrollable ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </KeyboardAvoidingView>
  );
}
