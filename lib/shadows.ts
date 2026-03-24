/**
 * Cross-platform shadow styles
 *
 * iOS uses shadow* properties; Android uses elevation.
 * Using both together works correctly on each platform.
 */

import { Platform } from "react-native";

export const shadows = {
  none: {},

  sm: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    android: { elevation: 2 },
    default: {},
  }),

  md: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
    },
    android: { elevation: 4 },
    default: {},
  }),

  lg: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    android: { elevation: 8 },
    default: {},
  }),

  card: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: { elevation: 3 },
    default: {},
  }),

  /** Gold glow for JACS brand elements */
  gold: Platform.select({
    ios: {
      shadowColor: "#D4AF37",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
    },
    android: { elevation: 6 },
    default: {},
  }),

  /** Red emergency glow */
  emergency: Platform.select({
    ios: {
      shadowColor: "#DC2626",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
    },
    android: { elevation: 8 },
    default: {},
  }),
} as const;
