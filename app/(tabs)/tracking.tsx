import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from "@/components/ui/icon-symbol";

/**
 * Module II: Clinical Monitoring (Tracking Tab)
 * 
 * Longitudinal tracking and diagnostics dashboard.
 * Features organized into two sub-menus:
 * 1. Vitals & Biometrics (BP, Weight, Glucose, CGM, Live Vitals)
 * 2. Lifestyle & Symptoms (Exercise, Symptom Diary, Mood Tracker, Wellness Score)
 */
export default function ClinicalMonitoring() {
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
          Health Tracking
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Monitor your vitals and symptoms
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Vitals & Biometrics Section */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Vitals & Biometrics
          </Text>
          <View className="gap-3">
            <Pressable
              onPress={() => handleNavigation('/bp-dashboard')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.error}20` }}
              >
                <IconSymbol name="heart.fill" size={24} color={colors.error} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Blood Pressure</Text>
                <Text className="text-sm text-muted">Track BP readings</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/vitals')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <IconSymbol name="figure.walk" size={24} color={colors.success} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Weight</Text>
                <Text className="text-sm text-muted">Monitor weight trends</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/diabetes-dashboard')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="drop.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Glucose</Text>
                <Text className="text-sm text-muted">Blood sugar tracking</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/cgm-monitor')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="chart.line.uptrend.xyaxis" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">CGM Monitor</Text>
                <Text className="text-sm text-muted">Continuous glucose monitoring</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/live-vitals')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="heart.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Live Vitals Monitor</Text>
                <Text className="text-sm text-muted">Real-time vital signs</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* Lifestyle & Symptoms Section */}
        <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Lifestyle & Symptoms
          </Text>
          <View className="gap-3">
            <Pressable
              onPress={() => handleNavigation('/exercise')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <IconSymbol name="figure.walk" size={24} color={colors.success} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Exercise Library</Text>
                <Text className="text-sm text-muted">Guided workouts</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/symptom-diary')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.warning}20` }}
              >
                <IconSymbol name="doc.text.fill" size={24} color={colors.warning} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Symptom Diary</Text>
                <Text className="text-sm text-muted">Log symptoms daily</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/mood-tracker')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <IconSymbol name="heart.fill" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Mood Tracker</Text>
                <Text className="text-sm text-muted">Monitor mental health</Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => handleNavigation('/wellness-score')}
              className="flex-row items-center bg-background rounded-2xl p-4 border border-border"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <IconSymbol name="chart.bar.fill" size={24} color={colors.success} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Wellness Score</Text>
                <Text className="text-sm text-muted">Overall health rating</Text>
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
