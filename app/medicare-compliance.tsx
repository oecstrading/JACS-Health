import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

/**
 * Medicare Compliance Dashboard
 * 
 * Track Medicare billing compliance and CPT code eligibility
 */

export default function MedicareComplianceScreen() {
  const colors = useColors();

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          Medicare Compliance
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Track CPT code eligibility and billing requirements
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Compliance Status */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
            Compliance Status
          </Text>
          
          <View className="gap-4">
            {/* Device Consistency */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${colors.success}20` }}
                >
                  <Text style={{ fontSize: 20 }}>✓</Text>
                </View>
                <Text className="text-lg font-semibold text-foreground" style={{ lineHeight: 26 }}>
                  Device Consistency
                </Text>
              </View>
              <Text className="text-base font-bold text-success" style={{ lineHeight: 22 }}>
                16+ days
              </Text>
            </View>

            {/* Interactive Communication */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${colors.warning}20` }}
                >
                  <Text style={{ fontSize: 20 }}>⏳</Text>
                </View>
                <Text className="text-lg font-semibold text-foreground" style={{ lineHeight: 26 }}>
                  Interactive Communication
                </Text>
              </View>
              <Text className="text-base font-bold text-warning" style={{ lineHeight: 22 }}>
                Pending
              </Text>
            </View>

            {/* Review Time */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${colors.muted}20` }}
                >
                  <Text style={{ fontSize: 20 }}>⏱️</Text>
                </View>
                <Text className="text-lg font-semibold text-foreground" style={{ lineHeight: 26 }}>
                  Review Time
                </Text>
              </View>
              <Text className="text-base font-bold text-foreground" style={{ lineHeight: 22 }}>
                0 minutes
              </Text>
            </View>
          </View>
        </View>

        {/* CPT Code Eligibility */}
        <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
          CPT Code Eligibility
        </Text>

        <View className="gap-4 mb-6">
          {/* CPT 99454 */}
          <View className="bg-surface rounded-3xl p-6 border border-border">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                CPT 99454
              </Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <Text className="text-sm font-bold text-success" style={{ lineHeight: 20 }}>
                  Eligible
                </Text>
              </View>
            </View>
            <Text className="text-base text-muted mb-2" style={{ lineHeight: 22 }}>
              Remote monitoring of physiologic parameters (16+ days)
            </Text>
            <Text className="text-sm text-foreground" style={{ lineHeight: 20 }}>
              Requirements: Device data for 16+ days per month
            </Text>
          </View>

          {/* CPT 99457 */}
          <View className="bg-surface rounded-3xl p-6 border border-border">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                CPT 99457
              </Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: `${colors.warning}20` }}
              >
                <Text className="text-sm font-bold text-warning" style={{ lineHeight: 20 }}>
                  Incomplete
                </Text>
              </View>
            </View>
            <Text className="text-base text-muted mb-2" style={{ lineHeight: 22 }}>
              Interactive communication (20 minutes)
            </Text>
            <Text className="text-sm text-foreground" style={{ lineHeight: 20 }}>
              Requirements: 1 interactive session + 20 min review time
            </Text>
          </View>

          {/* CPT 99470 */}
          <View className="bg-surface rounded-3xl p-6 border border-border">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                CPT 99470
              </Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: `${colors.warning}20` }}
              >
                <Text className="text-sm font-bold text-warning" style={{ lineHeight: 20 }}>
                  Incomplete
                </Text>
              </View>
            </View>
            <Text className="text-base text-muted mb-2" style={{ lineHeight: 22 }}>
              Interactive communication (10 minutes)
            </Text>
            <Text className="text-sm text-foreground" style={{ lineHeight: 20 }}>
              Requirements: 1 interactive session + 10 min review time
            </Text>
          </View>

          {/* CPT 95250 (CGM) */}
          <View className="bg-surface rounded-3xl p-6 border border-border">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                CPT 95250
              </Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <Text className="text-sm font-bold text-success" style={{ lineHeight: 20 }}>
                  Eligible
                </Text>
              </View>
            </View>
            <Text className="text-base text-muted mb-2" style={{ lineHeight: 22 }}>
              CGM professional (72+ hours)
            </Text>
            <Text className="text-sm text-foreground" style={{ lineHeight: 20 }}>
              Requirements: Continuous glucose monitoring for 72+ hours
            </Text>
          </View>

          {/* CPT 95251 (CGM Analysis) */}
          <View className="bg-surface rounded-3xl p-6 border border-border">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                CPT 95251
              </Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <Text className="text-sm font-bold text-success" style={{ lineHeight: 20 }}>
                  Eligible
                </Text>
              </View>
            </View>
            <Text className="text-base text-muted mb-2" style={{ lineHeight: 22 }}>
              CGM analysis and report
            </Text>
            <Text className="text-sm text-foreground" style={{ lineHeight: 20 }}>
              Requirements: CGM data analysis and physician report
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/communication-log" as any);
          }}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            borderRadius: 20,
            padding: 20,
            marginBottom: 24,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text className="text-lg font-bold text-white text-center" style={{ lineHeight: 26 }}>
            📞 Log Doctor Communication
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
