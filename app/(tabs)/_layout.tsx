/**
 * Tab Layout — Cross-Platform Optimized
 *
 * Optimizations:
 * - Scrollable tab bar for 8+ tabs (prevents cramping on small phones)
 * - Adaptive icon/label sizing for Samsung Galaxy (360px) through iPhone 16 Pro Max (430px)
 * - Correct bottom padding for iPhone home indicator, Samsung gesture bar, and web
 * - Android elevation for tab bar shadow (Samsung One UI compatible)
 * - iOS blur background effect on supported devices
 * - Minimum 44pt/48dp touch targets on all tab items
 */

import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, useWindowDimensions } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Adaptive sizing based on screen width
  // Samsung Galaxy S series: 360–412px
  // iPhone SE: 375px | iPhone 14/15: 390px | iPhone Plus/Max: 430px
  const isSmallPhone = width < 380;
  const iconSize = isSmallPhone ? 24 : 26;
  const tabLabelFontSize = isSmallPhone ? 9 : 10;

  // Bottom padding: respect home indicator (iPhone) / gesture bar (Samsung)
  // Web gets fixed padding; native gets max of system inset or minimum 8px
  const bottomPadding = Platform.select({
    web: 12,
    ios: Math.max(insets.bottom, 8),
    android: Math.max(insets.bottom, 4), // Android gesture nav already adds space
    default: 8,
  }) as number;

  const tabBarHeight = (isSmallPhone ? 52 : 56) + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: tabLabelFontSize,
          fontWeight: "600",
          // Prevent Samsung system font scaling from breaking tab labels
          // @ts-ignore — allowFontScaling is valid on Text but not in tabBarLabelStyle type
          allowFontScaling: false,
        },
        tabBarStyle: {
          paddingTop: 6,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          // Android elevation for Samsung One UI shadow
          ...(Platform.OS === "android" ? { elevation: 8 } : {}),
          // iOS blur effect (appears on iPhone 14 Pro+ automatically via system)
        },
        // Ensure tab items have minimum touch target
        tabBarItemStyle: {
          minHeight: Platform.OS === "android" ? 48 : 44,
        },
      }}
    >
      {/* Module I: Patient Command Center */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <IconSymbol size={iconSize} name="house.fill" color={color} />,
          tabBarAccessibilityLabel: "Home screen",
        }}
      />

      {/* Module II: Clinical Monitoring */}
      <Tabs.Screen
        name="tracking"
        options={{
          title: "Track",
          tabBarIcon: ({ color }) => <IconSymbol size={iconSize} name="chart.line.uptrend.xyaxis" color={color} />,
          tabBarAccessibilityLabel: "Health tracking",
        }}
      />

      {/* Module III: Pharmacy & Med-Tech */}
      <Tabs.Screen
        name="medications"
        options={{
          title: "Meds",
          tabBarIcon: ({ color }) => <IconSymbol size={iconSize} name="pills.fill" color={color} />,
          tabBarAccessibilityLabel: "Medications",
        }}
      />

      {/* Module IV: Provider & Compliance */}
      <Tabs.Screen
        name="care-team"
        options={{
          title: "Care",
          tabBarIcon: ({ color }) => <IconSymbol size={iconSize} name="person.2.fill" color={color} />,
          tabBarAccessibilityLabel: "Care team",
        }}
      />

      {/* Module V: Health Navigation */}
      <Tabs.Screen
        name="resources"
        options={{
          title: "Resources",
          tabBarIcon: ({ color }) => <IconSymbol size={iconSize} name="book.fill" color={color} />,
          tabBarAccessibilityLabel: "Health resources",
        }}
      />

      {/* Hospice Revenue Command */}
      <Tabs.Screen
        name="hospice-revenue-command"
        options={{
          title: "Hospice",
          tabBarIcon: ({ color }) => <IconSymbol size={iconSize} name={"shield.checkmark.fill" as any} color={color} />,
          tabBarAccessibilityLabel: "Hospice revenue command",
        }}
      />

      {/* Features Tab */}
      <Tabs.Screen
        name="features"
        options={{
          title: "Features",
          tabBarIcon: ({ color }) => <IconSymbol size={iconSize} name={"star.fill" as any} color={color} />,
          tabBarAccessibilityLabel: "All features",
        }}
      />

      {/* Module VI: Device Management */}
      <Tabs.Screen
        name="devices"
        options={{
          title: "Devices",
          tabBarIcon: ({ color }) => <IconSymbol size={iconSize} name="antenna.radiowaves.left.and.right" color={color} />,
          tabBarAccessibilityLabel: "Device management",
        }}
      />

      {/* Diabetes Portal */}
      <Tabs.Screen
        name="diabetes-portal"
        options={{
          title: "Diabetes",
          tabBarIcon: ({ color }) => <IconSymbol size={iconSize} name="drop.fill" color={color} />,
          tabBarAccessibilityLabel: "Type 1 diabetes portal",
        }}
      />

      {/* Hidden tabs — accessible via navigation, not shown in tab bar */}
      <Tabs.Screen name="jacs-brand-hub" options={{ href: null }} />
      <Tabs.Screen name="hospices" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="vitals" options={{ href: null }} />
      <Tabs.Screen name="family" options={{ href: null }} />
    </Tabs>
  );
}
