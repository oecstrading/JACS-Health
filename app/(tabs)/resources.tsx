import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from "@/components/ui/icon-symbol";

/**
 * Module V: Health Navigation (Resources Tab)
 * 
 * Information, education, and decision support dashboard.
 * Features organized into four sub-menus:
 * 1. Health Information (Medical Library, Symptom Checker, Health Insights)
 * 2. Lifestyle & Nutrition (Meal Logging, Nutrition Scan, Recipes)
 * 3. Devices & Monitoring (Connected Devices, Wearable Sync)
 * 4. Settings & Support (Settings, Help & Support)
 */
export default function HealthNavigation() {
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
          Resources
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Health information and tools
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Health Information Section */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Health Information
          </Text>
          <View className="gap-3">
            <Pressable
              onPress={() => handleNavigation('/medical-library')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="book.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Medical Library</Text>
                <Text className="text-sm text-muted">Health conditions & treatments</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/symptom-checker')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.warning}20` }}
              >
                <IconSymbol name="stethoscope" size={24} color={colors.warning} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Symptom Checker</Text>
                <Text className="text-sm text-muted">Assess your symptoms</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/insights')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="lightbulb.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Health Insights</Text>
                <Text className="text-sm text-muted">AI-powered recommendations</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* Lifestyle & Nutrition Section */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Lifestyle & Nutrition
          </Text>
          <View className="gap-3">
            <Pressable
              onPress={() => handleNavigation('/log-meal')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <IconSymbol name="fork.knife" size={24} color={colors.success} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Log Meal</Text>
                <Text className="text-sm text-muted">Track food and nutrition</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/nutrition-scan')}
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
                <Text className="text-lg font-semibold text-foreground">Nutrition Scan</Text>
                <Text className="text-sm text-muted">Scan food labels</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/recipes')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <IconSymbol name="book.fill" size={24} color={colors.success} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Recipes</Text>
                <Text className="text-sm text-muted">Healthy meal ideas</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* Devices & Monitoring Section */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Devices & Monitoring
          </Text>
          <View className="gap-3">
            <Pressable
              onPress={() => handleNavigation('/connected-devices')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="antenna.radiowaves.left.and.right" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Connected Devices</Text>
                <Text className="text-sm text-muted">Manage health devices</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/wearable-sync')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="applewatch" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Wearable Sync</Text>
                <Text className="text-sm text-muted">Sync fitness trackers</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* Settings & Support Section */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Settings & Support
          </Text>
          <View className="gap-3">
            <Pressable
              onPress={() => router.push('/(tabs)/settings')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.muted}20` }}
              >
                <IconSymbol name="gearshape.fill" size={24} color={colors.muted} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Settings</Text>
                <Text className="text-sm text-muted">App preferences</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/help-support')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="questionmark.circle.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Help & Support</Text>
                <Text className="text-sm text-muted">Get assistance</Text>
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
