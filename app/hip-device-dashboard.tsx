import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  generateMockGaitData,
  generateMockWalkerData,
  generateMockInsoleData,
  calculateGaitSymmetryImprovement,
} from "@/services/hipDevices";

/**
 * Hip Device Dashboard
 * 
 * Display live data from hip-specific devices:
 * - Gait sensors (step count, gait symmetry, cadence, stride length)
 * - Smart walkers (weight distribution, distance, support level)
 * - Pressure insoles (weight-bearing %, left/right balance)
 * 
 * Includes trend charts for gait symmetry and weight-bearing progression.
 */

export default function HipDeviceDashboard() {
  const colors = useColors();
  const [gaitData, setGaitData] = useState(generateMockGaitData());
  const [walkerData, setWalkerData] = useState(generateMockWalkerData());
  const [insoleData, setInsoleData] = useState(generateMockInsoleData());
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setTimeout(() => {
      setGaitData(generateMockGaitData());
      setWalkerData(generateMockWalkerData());
      setInsoleData(generateMockInsoleData());
      setSyncing(false);
      Alert.alert("Devices Synced", "All hip device data has been updated.");
    }, 1500);
  };

  const gaitImprovement = calculateGaitSymmetryImprovement(gaitData.gaitSymmetry, 75);
  const weightBearingProgress = {
    status: insoleData.weightBearingPercentage >= 75 ? "Excellent progress!" : "Keep going!",
    improvement: insoleData.weightBearingPercentage,
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
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
              Hip Device Data
            </Text>
            <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
              Real-time recovery metrics
            </Text>
          </View>
          <Pressable
            onPress={handleSync}
            disabled={syncing}
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              borderRadius: 16,
              paddingHorizontal: 20,
              paddingVertical: 12,
              opacity: pressed || syncing ? 0.7 : 1,
            })}
          >
            <Text className="text-base font-bold text-white" style={{ lineHeight: 22 }}>
              {syncing ? "Syncing..." : "Sync Devices"}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Gait Sensor */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
            Gait Sensor
          </Text>
          <View
            className="rounded-3xl p-6"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <View className="flex-row items-center gap-3 mb-6">
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <Text style={{ fontSize: 28 }}>👟</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                  Walking Metrics
                </Text>
                <Text className="text-base text-muted" style={{ lineHeight: 22 }}>
                  Last synced: 5 min ago
                </Text>
              </View>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <Text className="text-sm font-bold" style={{ color: colors.success, lineHeight: 20 }}>
                  Connected
                </Text>
              </View>
            </View>

            {/* Metrics Grid */}
            <View className="gap-4">
              <View className="flex-row gap-4">
                <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: `${colors.primary}10` }}>
                  <Text className="text-sm text-muted mb-1" style={{ lineHeight: 20 }}>
                    Steps Today
                  </Text>
                  <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
                    {gaitData.stepCount.toLocaleString()}
                  </Text>
                </View>
                <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: `${colors.primary}10` }}>
                  <Text className="text-sm text-muted mb-1" style={{ lineHeight: 20 }}>
                    Cadence
                  </Text>
                  <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
                    {gaitData.cadence}
                    <Text className="text-base text-muted"> spm</Text>
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: `${colors.primary}10` }}>
                  <Text className="text-sm text-muted mb-1" style={{ lineHeight: 20 }}>
                    Gait Symmetry
                  </Text>
                  <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
                    {gaitData.gaitSymmetry}%
                  </Text>
                  <Text className="text-sm" style={{ color: colors.success, lineHeight: 20 }}>
                    {gaitImprovement.status}
                  </Text>
                </View>
                <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: `${colors.primary}10` }}>
                  <Text className="text-sm text-muted mb-1" style={{ lineHeight: 20 }}>
                    Stride Length
                  </Text>
                  <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
                    {gaitData.strideLength}
                    <Text className="text-base text-muted"> cm</Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Smart Walker */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
            Smart Walker
          </Text>
          <View
            className="rounded-3xl p-6"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <View className="flex-row items-center gap-3 mb-6">
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <Text style={{ fontSize: 28 }}>🦽</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                  Walker Assistance
                </Text>
                <Text className="text-base text-muted" style={{ lineHeight: 22 }}>
                  Last synced: 10 min ago
                </Text>
              </View>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <Text className="text-sm font-bold" style={{ color: colors.success, lineHeight: 20 }}>
                  Connected
                </Text>
              </View>
            </View>

            <View className="gap-4">
              <View className="p-4 rounded-2xl" style={{ backgroundColor: `${colors.primary}10` }}>
                <Text className="text-sm text-muted mb-1" style={{ lineHeight: 20 }}>
                  Distance Traveled Today
                </Text>
                <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
                  {walkerData.distanceTraveled} meters
                </Text>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: `${colors.primary}10` }}>
                  <Text className="text-sm text-muted mb-1" style={{ lineHeight: 20 }}>
                    Support Level
                  </Text>
                  <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
                    {walkerData.supportLevel}%
                  </Text>
                </View>
                <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: `${colors.primary}10` }}>
                  <Text className="text-sm text-muted mb-1" style={{ lineHeight: 20 }}>
                    Weight Dist.
                  </Text>
                  <Text className="text-lg font-bold text-foreground" style={{ lineHeight: 26 }}>
                    Walker:{walkerData.weightDistribution.walker}% Legs:{walkerData.weightDistribution.legs}%
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Pressure Insoles */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
            Pressure Insoles
          </Text>
          <View
            className="rounded-3xl p-6"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <View className="flex-row items-center gap-3 mb-6">
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <Text style={{ fontSize: 28 }}>👣</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                  Weight-Bearing Progress
                </Text>
                <Text className="text-base text-muted" style={{ lineHeight: 22 }}>
                  Last synced: 2 min ago
                </Text>
              </View>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <Text className="text-sm font-bold" style={{ color: colors.success, lineHeight: 20 }}>
                  Connected
                </Text>
              </View>
            </View>

            <View className="gap-4">
              <View className="p-4 rounded-2xl" style={{ backgroundColor: `${colors.primary}10` }}>
                <Text className="text-sm text-muted mb-2" style={{ lineHeight: 20 }}>
                  Weight-Bearing Percentage
                </Text>
                <Text className="text-3xl font-bold text-foreground mb-3" style={{ lineHeight: 40 }}>
                  {insoleData.weightBearingPercentage}%
                </Text>
                <View
                  className="h-3 rounded-full mb-2"
                  style={{ backgroundColor: `${colors.muted}20` }}
                >
                  <View
                    className="h-3 rounded-full"
                    style={{
                      width: `${insoleData.weightBearingPercentage}%`,
                      backgroundColor: colors.primary,
                    }}
                  />
                </View>
                <Text className="text-sm" style={{ color: colors.success, lineHeight: 20 }}>
                  {weightBearingProgress.status}
                </Text>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: `${colors.primary}10` }}>
                  <Text className="text-sm text-muted mb-1" style={{ lineHeight: 20 }}>
                    Left Foot
                  </Text>
                  <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
                    {insoleData.leftFootPressure} lbs
                  </Text>
                </View>
                <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: `${colors.primary}10` }}>
                  <Text className="text-sm text-muted mb-1" style={{ lineHeight: 20 }}>
                    Right Foot
                  </Text>
                  <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
                    {insoleData.rightFootPressure} lbs
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
