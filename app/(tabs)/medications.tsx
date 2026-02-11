import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from "@/components/ui/icon-symbol";

/**
 * Module III: Pharmacy & Med-Tech (Medications Tab)
 * 
 * Medication lifecycle and hardware integration dashboard.
 * Features organized into three sub-menus:
 * 1. Logging (Log Medication, Log Insulin)
 * 2. Tools (Scan Medication, Pill Identifier, Interaction Checker)
 * 3. Logistics (Auto-Refill, Medication Cost Compare)
 */
export default function PharmacyMedTech() {
  const router = useRouter();
  const colors = useColors();

  const handleNavigation = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          Medications
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Manage your medication lifecycle
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Logging Section */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Logging
          </Text>
          <View className="gap-3">
            <Pressable
              onPress={() => handleNavigation('/medication-log')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="pills.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Log Medication</Text>
                <Text className="text-sm text-muted">Record medication taken</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/log-insulin')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="syringe.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Log Insulin</Text>
                <Text className="text-sm text-muted">Track insulin doses</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* Tools Section */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Tools
          </Text>
          <View className="gap-3">
            <Pressable
              onPress={() => handleNavigation('/scan-medication')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="sparkles" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Scan Medication</Text>
                <Text className="text-sm text-muted">Identify pills with camera</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/pill-identifier')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Pill Identifier</Text>
                <Text className="text-sm text-muted">Look up medication info</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/interaction-checker')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.warning}20` }}
              >
                <IconSymbol name="exclamationmark.triangle.fill" size={24} color={colors.warning} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Interaction Checker</Text>
                <Text className="text-sm text-muted">Check drug interactions</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* Logistics Section */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Logistics
          </Text>
          <View className="gap-3">
            <Pressable
              onPress={() => handleNavigation('/medication-reminders')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="bell.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Auto-Refill</Text>
                <Text className="text-sm text-muted">Automatic prescription refills</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/medication-cost-compare')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <IconSymbol name="dollarsign.circle.fill" size={24} color={colors.success} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Medication Cost Compare</Text>
                <Text className="text-sm text-muted">Find lowest prices</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/medication-tracker')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="chart.bar.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Medication Tracker</Text>
                <Text className="text-sm text-muted">View adherence trends</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
