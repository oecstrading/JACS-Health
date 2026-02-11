import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

/**
 * Hip Health Dashboard
 * 
 * Comprehensive hip disease management and hip replacement recovery tracking:
 * - Daily pain level tracking (1-10 scale)
 * - Mobility score (walking distance, stairs, sit-to-stand time)
 * - Range-of-motion tracking
 * - Pain trend charts
 * - Hip-specific red flag alerts
 */

interface PainEntry {
  date: string;
  level: number; // 1-10
  location: string;
  triggers: string[];
}

interface MobilityEntry {
  date: string;
  walkingDistance: number; // feet
  stairsClimbed: number;
  sitToStandTime: number; // seconds
  assistiveDevice: string;
}

interface ROMEntry {
  date: string;
  flexion: number; // degrees
  extension: number;
  abduction: number;
}

export default function HipHealthDashboard() {
  const colors = useColors();
  const [painLevel, setPainLevel] = useState(3);
  const [mobilityScore, setMobilityScore] = useState(75);
  const [recentPain, setRecentPain] = useState<PainEntry[]>([]);
  const [recentMobility, setRecentMobility] = useState<MobilityEntry[]>([]);

  useEffect(() => {
    loadHipData();
  }, []);

  const loadHipData = async () => {
    try {
      // Mock data - in production, load from AsyncStorage
      setRecentPain([
        { date: new Date().toISOString(), level: 3, location: "Right hip joint", triggers: ["Walking", "Stairs"] },
        { date: new Date(Date.now() - 86400000).toISOString(), level: 4, location: "Right hip joint", triggers: ["Standing"] },
      ]);
      setRecentMobility([
        { date: new Date().toISOString(), walkingDistance: 500, stairsClimbed: 10, sitToStandTime: 5, assistiveDevice: "Cane" },
      ]);
    } catch (error) {
      console.error("Error loading hip data:", error);
    }
  };

  const handleLogPain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/log-hip-pain" as any);
  };

  const handleLogMobility = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/log-mobility" as any);
  };

  const handleLogROM = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/log-range-of-motion" as any);
  };

  const getPainColor = (level: number) => {
    if (level <= 3) return colors.success;
    if (level <= 6) return colors.warning;
    return colors.error;
  };

  const getPainLabel = (level: number) => {
    if (level <= 3) return "Mild";
    if (level <= 6) return "Moderate";
    return "Severe";
  };

  const getMobilityLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Limited";
  };

  const getTimeAgo = (timestamp: string) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
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
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          Hip Health
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Track pain, mobility, and recovery progress
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Current Status Cards */}
        <View className="flex-row gap-4 mb-6">
          {/* Pain Level */}
          <View className="flex-1 bg-surface rounded-3xl p-6 border border-border">
            <View className="flex-row items-center gap-2 mb-3">
              <Text style={{ fontSize: 24 }}>🩹</Text>
              <Text className="text-base font-bold text-foreground" style={{ lineHeight: 22 }}>
                Pain Level
              </Text>
            </View>
            <Text className="text-4xl font-bold" style={{ color: getPainColor(painLevel), lineHeight: 48 }}>
              {painLevel}/10
            </Text>
            <Text className="text-sm text-muted mt-1" style={{ lineHeight: 20 }}>
              {getPainLabel(painLevel)}
            </Text>
          </View>

          {/* Mobility Score */}
          <View className="flex-1 bg-surface rounded-3xl p-6 border border-border">
            <View className="flex-row items-center gap-2 mb-3">
              <Text style={{ fontSize: 24 }}>🚶</Text>
              <Text className="text-base font-bold text-foreground" style={{ lineHeight: 22 }}>
                Mobility
              </Text>
            </View>
            <Text className="text-4xl font-bold text-foreground" style={{ lineHeight: 48 }}>
              {mobilityScore}%
            </Text>
            <Text className="text-sm text-muted mt-1" style={{ lineHeight: 20 }}>
              {getMobilityLabel(mobilityScore)}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
          Quick Log
        </Text>
        <View className="gap-4 mb-6">
          <Pressable
            onPress={handleLogPain}
            style={({ pressed }) => ({
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View className="flex-row items-center gap-4">
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center"
                style={{ backgroundColor: `${colors.error}20` }}
              >
                <Text style={{ fontSize: 28 }}>🩹</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground" style={{ lineHeight: 26 }}>
                  Log Hip Pain
                </Text>
                <Text className="text-base text-muted" style={{ lineHeight: 22 }}>
                  Track pain level and triggers
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </View>
          </Pressable>

          <Pressable
            onPress={handleLogMobility}
            style={({ pressed }) => ({
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View className="flex-row items-center gap-4">
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <Text style={{ fontSize: 28 }}>🚶</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground" style={{ lineHeight: 26 }}>
                  Log Mobility
                </Text>
                <Text className="text-base text-muted" style={{ lineHeight: 22 }}>
                  Track walking, stairs, and activities
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </View>
          </Pressable>

          <Pressable
            onPress={handleLogROM}
            style={({ pressed }) => ({
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View className="flex-row items-center gap-4">
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <Text style={{ fontSize: 28 }}>📐</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground" style={{ lineHeight: 26 }}>
                  Log Range of Motion
                </Text>
                <Text className="text-base text-muted" style={{ lineHeight: 22 }}>
                  Track hip flexion and extension
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={24} color={colors.muted} />
            </View>
          </Pressable>
        </View>

        {/* Recent Pain Entries */}
        {recentPain.length > 0 && (
          <View className="mb-6">
            <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
              Recent Pain Entries
            </Text>
            <View className="gap-4">
              {recentPain.map((entry, index) => (
                <View
                  key={index}
                  className="bg-surface rounded-3xl p-6 border border-border"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-bold" style={{ color: getPainColor(entry.level), lineHeight: 26 }}>
                      Pain Level: {entry.level}/10
                    </Text>
                    <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
                      {getTimeAgo(entry.date)}
                    </Text>
                  </View>
                  <Text className="text-base text-foreground mb-2" style={{ lineHeight: 22 }}>
                    Location: {entry.location}
                  </Text>
                  {entry.triggers.length > 0 && (
                    <View className="flex-row flex-wrap gap-2">
                      {entry.triggers.map((trigger, idx) => (
                        <View
                          key={idx}
                          className="px-3 py-1 rounded-full"
                          style={{ backgroundColor: `${colors.muted}20` }}
                        >
                          <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
                            {trigger}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Mobility Entries */}
        {recentMobility.length > 0 && (
          <View className="mb-8">
            <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
              Recent Mobility Entries
            </Text>
            <View className="gap-4">
              {recentMobility.map((entry, index) => (
                <View
                  key={index}
                  className="bg-surface rounded-3xl p-6 border border-border"
                >
                  <Text className="text-sm text-muted mb-3" style={{ lineHeight: 20 }}>
                    {getTimeAgo(entry.date)}
                  </Text>
                  <View className="gap-2">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-base text-foreground" style={{ lineHeight: 22 }}>
                        🚶 Walking:
                      </Text>
                      <Text className="text-base font-bold text-foreground" style={{ lineHeight: 22 }}>
                        {entry.walkingDistance} ft
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-base text-foreground" style={{ lineHeight: 22 }}>
                        🪜 Stairs:
                      </Text>
                      <Text className="text-base font-bold text-foreground" style={{ lineHeight: 22 }}>
                        {entry.stairsClimbed} steps
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-base text-foreground" style={{ lineHeight: 22 }}>
                        ⏱️ Sit-to-Stand:
                      </Text>
                      <Text className="text-base font-bold text-foreground" style={{ lineHeight: 22 }}>
                        {entry.sitToStandTime}s
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-base text-foreground" style={{ lineHeight: 22 }}>
                        🦯 Device:
                      </Text>
                      <Text className="text-base font-bold text-foreground" style={{ lineHeight: 22 }}>
                        {entry.assistiveDevice}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Hip Replacement Journey Link */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/hip-replacement-journey" as any);
          }}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            borderRadius: 20,
            padding: 20,
            marginBottom: 24,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xl font-bold text-white mb-1" style={{ lineHeight: 28 }}>
                Hip Replacement Journey
              </Text>
              <Text className="text-base text-white opacity-90" style={{ lineHeight: 22 }}>
                Track your surgery and recovery
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={28} color="#ffffff" />
          </View>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
