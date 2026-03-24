/**
 * useResponsive — Adaptive sizing for all devices
 *
 * Supports:
 * - iPhone SE (375px) through iPhone 16 Pro Max (430px)
 * - Samsung Galaxy S series (360–412px) through Galaxy Tab (768px+)
 * - iPad mini through iPad Pro 12.9"
 * - Web / desktop
 *
 * Usage:
 *   const { fs, sp, isTablet, isSmall } = useResponsive();
 *   <Text style={{ fontSize: fs(16) }}>Hello</Text>
 *   <View style={{ padding: sp(16) }}>...</View>
 */

import { useWindowDimensions, Platform } from "react-native";

export interface ResponsiveUtils {
  /** Adaptive font size — scales between small/large phones, caps on tablet */
  fs: (base: number) => number;
  /** Adaptive spacing — same scale as fs */
  sp: (base: number) => number;
  /** True when width >= 768 (iPad / tablet) */
  isTablet: boolean;
  /** True when width <= 375 (iPhone SE, Galaxy A series) */
  isSmall: boolean;
  /** True when width >= 414 (iPhone Plus/Max, Galaxy S Ultra) */
  isLarge: boolean;
  /** Screen width */
  width: number;
  /** Screen height */
  height: number;
  /** Minimum touch target size (44pt iOS HIG / 48dp Android) */
  minTouchTarget: number;
}

export function useResponsive(): ResponsiveUtils {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isSmall = width <= 375;
  const isLarge = width >= 414;

  // Scale factor: 1.0 at 390px (iPhone 14 base), clamp between 0.85 and 1.15
  const scale = Math.min(1.15, Math.max(0.85, width / 390));
  // Tablets get a slight boost but not full scale (prevent huge text)
  const tabletScale = isTablet ? Math.min(1.2, width / 600) : scale;
  const effectiveScale = isTablet ? tabletScale : scale;

  const fs = (base: number): number =>
    Math.round(base * effectiveScale);

  const sp = (base: number): number =>
    Math.round(base * effectiveScale);

  // iOS HIG: 44pt minimum. Android: 48dp minimum.
  const minTouchTarget = Platform.OS === "android" ? 48 : 44;

  return { fs, sp, isTablet, isSmall, isLarge, width, height, minTouchTarget };
}
