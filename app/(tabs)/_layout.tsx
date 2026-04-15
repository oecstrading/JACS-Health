/**
 * Tab Layout — Nano Banana Edition
 *
 * World-class, visually stunning tab bar:
 * - Each tab has its own vibrant accent color (active state)
 * - Taller bar (72px + safe area) so labels are never cramped
 * - Bigger labels (12px, bold) with allowFontScaling off
 * - Active tab shows a glowing pill indicator above the icon
 * - Inactive tabs are muted but still readable
 * - Gradient-style dark background for depth
 */

import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Platform,
  useWindowDimensions,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";

// ── Per-tab vibrant accent colors ─────────────────────────────────────────────
const TAB_COLORS: Record<string, string> = {
  index:                   "#38BDF8", // sky blue  — Home
  tracking:                "#34D399", // emerald   — Track
  medications:             "#F472B6", // hot pink  — Meds
  "care-team":             "#A78BFA", // violet    — Care
  resources:               "#FBBF24", // amber     — Resources
  "hospice-revenue-command": "#FB923C", // orange  — Hospice
  "my-health":             "#4ADE80", // lime green — My Health
  devices:                 "#67E8F9", // cyan      — Devices
  "diabetes-portal":       "#F87171", // coral red — Diabetes
};

// ── Custom tab button with haptics + per-tab color pill ───────────────────────
function NanoBananaTabButton(props: BottomTabBarButtonProps & { tabName: string }) {
  const { children, onPress, accessibilityState, tabName } = props;
  const isActive = accessibilityState?.selected ?? false;
  const accent = TAB_COLORS[tabName] ?? "#38BDF8";

  const handlePress = (e: any) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(e);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={styles.tabButton}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
    >
      {/* Active glow pill */}
      {isActive && (
        <View
          style={[
            styles.activePill,
            { backgroundColor: accent + "33", borderColor: accent + "88" },
          ]}
        />
      )}
      {children}
    </Pressable>
  );
}

// ── Custom icon+label renderer so we can color each tab independently ─────────
function TabIcon({
  icon,
  label,
  tabName,
  focused,
  iconSize,
}: {
  icon: string;
  label: string;
  tabName: string;
  focused: boolean;
  iconSize: number;
}) {
  const accent = TAB_COLORS[tabName] ?? "#38BDF8";
  const color = focused ? accent : "#6B7280";

  return (
    <View style={styles.tabIconWrapper}>
      <Text style={{ fontSize: iconSize, lineHeight: iconSize + 4 }}>{icon}</Text>
      <Text
        style={[
          styles.tabLabel,
          { color, fontWeight: focused ? "800" : "500" },
        ]}
        allowFontScaling={false}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isSmallPhone = width < 380;
  const iconSize = isSmallPhone ? 22 : 24;

  const bottomPadding = Platform.select({
    web: 10,
    ios: Math.max(insets.bottom, 10),
    android: Math.max(insets.bottom, 6),
    default: 10,
  }) as number;

  // Taller bar: 72px content + safe area
  const tabBarHeight = 72 + bottomPadding;

  // Helper: build a tab button factory bound to a specific tab name
  const makeTabButton = (tabName: string) =>
    (props: BottomTabBarButtonProps) => (
      <NanoBananaTabButton {...props} tabName={tabName} />
    );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // We handle tint manually via TabIcon; set these to transparent
        tabBarActiveTintColor: "transparent",
        tabBarInactiveTintColor: "transparent",
        tabBarShowLabel: false, // labels are rendered inside TabIcon
        tabBarStyle: {
          height: tabBarHeight,
          paddingTop: 0,
          paddingBottom: bottomPadding,
          backgroundColor: "#0F0F1A",
          borderTopWidth: 0,
          // Subtle top border glow
          borderTopColor: "#ffffff18",
          // Android shadow
          ...(Platform.OS === "android"
            ? { elevation: 24, shadowColor: "#000" }
            : {}),
        },
        tabBarItemStyle: {
          paddingTop: 6,
          minHeight: Platform.OS === "android" ? 56 : 52,
        },
      }}
    >
      {/* ── Home ─────────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarButton: makeTabButton("index"),
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" label="Home" tabName="index" focused={focused} iconSize={iconSize} />
          ),
          tabBarAccessibilityLabel: "Home screen",
        }}
      />

      {/* ── Track ────────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="tracking"
        options={{
          tabBarButton: makeTabButton("tracking"),
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📈" label="Track" tabName="tracking" focused={focused} iconSize={iconSize} />
          ),
          tabBarAccessibilityLabel: "Health tracking",
        }}
      />

      {/* ── Meds ─────────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="medications"
        options={{
          tabBarButton: makeTabButton("medications"),
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="💊" label="Meds" tabName="medications" focused={focused} iconSize={iconSize} />
          ),
          tabBarAccessibilityLabel: "Medications",
        }}
      />

      {/* ── Care ─────────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="care-team"
        options={{
          tabBarButton: makeTabButton("care-team"),
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👥" label="Care" tabName="care-team" focused={focused} iconSize={iconSize} />
          ),
          tabBarAccessibilityLabel: "Care team",
        }}
      />

      {/* ── Resources ────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="resources"
        options={{
          tabBarButton: makeTabButton("resources"),
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📚" label="Resources" tabName="resources" focused={focused} iconSize={iconSize} />
          ),
          tabBarAccessibilityLabel: "Health resources",
        }}
      />

      {/* ── Hospice ──────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="hospice-revenue-command"
        options={{
          tabBarButton: makeTabButton("hospice-revenue-command"),
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏥" label="Hospice" tabName="hospice-revenue-command" focused={focused} iconSize={iconSize} />
          ),
          tabBarAccessibilityLabel: "Hospice revenue command",
        }}
      />

      {/* ── My Health ────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="my-health"
        options={{
          tabBarButton: makeTabButton("my-health"),
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="💚" label="My Health" tabName="my-health" focused={focused} iconSize={iconSize} />
          ),
          tabBarAccessibilityLabel: "My Health hub",
        }}
      />

      {/* ── Features (hidden) ────────────────────────────────────────────── */}
      <Tabs.Screen
        name="features"
        options={{ href: null }}
      />

      {/* ── Devices ──────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="devices"
        options={{
          tabBarButton: makeTabButton("devices"),
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📡" label="Devices" tabName="devices" focused={focused} iconSize={iconSize} />
          ),
          tabBarAccessibilityLabel: "Device management",
        }}
      />

      {/* ── Diabetes ─────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="diabetes-portal"
        options={{
          tabBarButton: makeTabButton("diabetes-portal"),
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🩸" label="Diabetes" tabName="diabetes-portal" focused={focused} iconSize={iconSize} />
          ),
          tabBarAccessibilityLabel: "Type 1 diabetes portal",
        }}
      />

      {/* ── Hidden tabs ──────────────────────────────────────────────────── */}
      <Tabs.Screen name="jacs-brand-hub" options={{ href: null }} />
      <Tabs.Screen name="hospices" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="vitals" options={{ href: null }} />
      <Tabs.Screen name="family" options={{ href: null }} />
    </Tabs>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activePill: {
    position: "absolute",
    top: 0,
    left: 6,
    right: 6,
    height: 3,
    borderRadius: 2,
    borderWidth: 1,
  },
  tabIconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.2,
    textAlign: "center",
  },
});
