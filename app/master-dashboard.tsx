import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

/**
 * Master Dashboard - Unified Monitoring Hub
 * 
 * Consolidates all monitoring dashboards in one place:
 * - Vitals Dashboard (BP, HR, Weight)
 * - Diabetes Dashboard (Glucose, Insulin)
 * - Medicare Compliance (CPT codes, billing)
 * - Health Insights (AI analysis)
 */

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  badge?: string;
}

export default function MasterDashboardScreen() {
  const colors = useColors();

  const dashboards: DashboardCard[] = [
    {
      id: "vitals",
      title: "Vitals Dashboard",
      description: "Blood pressure, heart rate, weight trends",
      icon: "❤️",
      route: "/vitals-dashboard",
      color: colors.error,
    },
    {
      id: "diabetes",
      title: "Diabetes Dashboard",
      description: "Glucose levels, insulin tracking, time-in-range",
      icon: "🩸",
      route: "/diabetes-dashboard",
      color: colors.primary,
      badge: "New",
    },
    {
      id: "compliance",
      title: "Medicare Compliance",
      description: "CPT code eligibility, billing statements",
      icon: "📋",
      route: "/compliance-dashboard",
      color: colors.success,
    },
    {
      id: "insights",
      title: "Health Insights",
      description: "AI-powered analysis and recommendations",
      icon: "💡",
      route: "/health-insights",
      color: colors.warning,
    },
  ];

  const handleDashboardPress = (dashboard: DashboardCard) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(dashboard.route as any);
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          className="flex-row items-center gap-2 mb-4"
        >
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          <Text className="text-lg text-primary" style={{ lineHeight: 24 }}>
            Back
          </Text>
        </Pressable>
        
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          Master Dashboard
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          All your health monitoring in one place
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Quick Stats Summary */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <Text className="text-xl font-bold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Today's Overview
          </Text>
          
          <View className="flex-row flex-wrap gap-4">
            <View className="flex-1 min-w-[140px]">
              <Text className="text-sm text-muted mb-1" style={{ lineHeight: 20 }}>
                Blood Pressure
              </Text>
              <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
                120/80
              </Text>
              <Text className="text-xs text-success" style={{ lineHeight: 18 }}>
                Normal
              </Text>
            </View>
            
            <View className="flex-1 min-w-[140px]">
              <Text className="text-sm text-muted mb-1" style={{ lineHeight: 20 }}>
                Glucose
              </Text>
              <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
                105 mg/dL
              </Text>
              <Text className="text-xs text-success" style={{ lineHeight: 18 }}>
                In Range
              </Text>
            </View>
            
            <View className="flex-1 min-w-[140px]">
              <Text className="text-sm text-muted mb-1" style={{ lineHeight: 20 }}>
                Heart Rate
              </Text>
              <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
                72 bpm
              </Text>
              <Text className="text-xs text-success" style={{ lineHeight: 18 }}>
                Normal
              </Text>
            </View>
            
            <View className="flex-1 min-w-[140px]">
              <Text className="text-sm text-muted mb-1" style={{ lineHeight: 20 }}>
                Weight
              </Text>
              <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
                180 lbs
              </Text>
              <Text className="text-xs text-muted" style={{ lineHeight: 18 }}>
                Stable
              </Text>
            </View>
          </View>
        </View>

        {/* Dashboard Cards */}
        <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
          Monitoring Dashboards
        </Text>

        <View className="gap-4 pb-8">
          {dashboards.map((dashboard) => (
            <Pressable
              key={dashboard.id}
              onPress={() => handleDashboardPress(dashboard)}
              style={({ pressed }) => ({
                backgroundColor: colors.surface,
                borderRadius: 24,
                padding: 24,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View className="flex-row items-center gap-4">
                {/* Icon */}
                <View
                  className="w-20 h-20 rounded-3xl items-center justify-center"
                  style={{ backgroundColor: `${dashboard.color}15` }}
                >
                  <Text style={{ fontSize: 40 }}>{dashboard.icon}</Text>
                </View>

                {/* Content */}
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                      {dashboard.title}
                    </Text>
                    {dashboard.badge && (
                      <View
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${colors.primary}20` }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{ color: colors.primary, lineHeight: 16 }}
                        >
                          {dashboard.badge}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-base text-muted" style={{ lineHeight: 22 }}>
                    {dashboard.description}
                  </Text>
                </View>

                {/* Arrow */}
                <IconSymbol name="chevron.right" size={24} color={colors.muted} />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Help Card */}
        <View className="bg-surface rounded-3xl p-6 mb-8 border border-border">
          <View className="flex-row items-center gap-3 mb-3">
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <IconSymbol name="questionmark.circle.fill" size={28} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                Need Help?
              </Text>
              <Text className="text-base text-muted" style={{ lineHeight: 22 }}>
                Learn how to use each dashboard
              </Text>
            </View>
          </View>
          
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/health-library" as any);
            }}
            style={({ pressed }) => ({
              backgroundColor: `${colors.primary}20`,
              padding: 14,
              borderRadius: 12,
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              className="text-base font-semibold"
              style={{ color: colors.primary, lineHeight: 22 }}
            >
              View User Guide
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
