import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

/**
 * Dashboard Preview Widgets
 * 
 * Show latest readings from each dashboard on Home screen:
 * - Glucose (from Diabetes Dashboard)
 * - Blood Pressure (from Vitals Dashboard)
 * - Weight (from Vitals Dashboard)
 */

interface GlucoseReading {
  value: number;
  trend: "up" | "down" | "stable";
  timestamp: string;
}

interface BPReading {
  systolic: number;
  diastolic: number;
  timestamp: string;
}

interface WeightReading {
  value: number;
  change: number; // Change from last week
  timestamp: string;
}

export function GlucoseWidget() {
  const colors = useColors();
  const [reading, setReading] = useState<GlucoseReading | null>(null);

  useEffect(() => {
    loadLatestGlucose();
  }, []);

  const loadLatestGlucose = async () => {
    try {
      // Mock data - in production, load from AsyncStorage or API
      setReading({
        value: 105,
        trend: "stable",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error loading glucose:", error);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return "↗️";
    if (trend === "down") return "↘️";
    return "→";
  };

  const getTimeAgo = (timestamp: string) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  if (!reading) return null;

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push("/diabetes-dashboard" as any);
      }}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text style={{ fontSize: 24 }}>🩸</Text>
            <Text className="text-lg font-bold text-foreground" style={{ lineHeight: 26 }}>
              Glucose
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
              {reading.value}
            </Text>
            <Text className="text-xl text-muted" style={{ lineHeight: 28 }}>
              mg/dL
            </Text>
            <Text style={{ fontSize: 24 }}>{getTrendIcon(reading.trend)}</Text>
          </View>
          <Text className="text-sm text-muted mt-1" style={{ lineHeight: 20 }}>
            {getTimeAgo(reading.timestamp)}
          </Text>
        </View>
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: `${colors.success}20` }}
        >
          <Text className="text-base font-bold" style={{ color: colors.success, lineHeight: 22 }}>
            OK
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function BloodPressureWidget() {
  const colors = useColors();
  const [reading, setReading] = useState<BPReading | null>(null);

  useEffect(() => {
    loadLatestBP();
  }, []);

  const loadLatestBP = async () => {
    try {
      // Mock data - in production, load from AsyncStorage or API
      setReading({
        systolic: 120,
        diastolic: 80,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error loading BP:", error);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  if (!reading) return null;

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push("/vitals-dashboard" as any);
      }}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <IconSymbol name="heart.fill" size={24} color={colors.error} />
            <Text className="text-lg font-bold text-foreground" style={{ lineHeight: 26 }}>
              Blood Pressure
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
              {reading.systolic}/{reading.diastolic}
            </Text>
            <Text className="text-xl text-muted" style={{ lineHeight: 28 }}>
              mmHg
            </Text>
          </View>
          <Text className="text-sm text-muted mt-1" style={{ lineHeight: 20 }}>
            {getTimeAgo(reading.timestamp)}
          </Text>
        </View>
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: `${colors.success}20` }}
        >
          <Text className="text-base font-bold" style={{ color: colors.success, lineHeight: 22 }}>
            OK
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function WeightWidget() {
  const colors = useColors();
  const [reading, setReading] = useState<WeightReading | null>(null);

  useEffect(() => {
    loadLatestWeight();
  }, []);

  const loadLatestWeight = async () => {
    try {
      // Mock data - in production, load from AsyncStorage or API
      setReading({
        value: 180,
        change: -2.5, // Lost 2.5 lbs from last week
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error loading weight:", error);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  if (!reading) return null;

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push("/vitals-dashboard" as any);
      }}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text style={{ fontSize: 24 }}>⚖️</Text>
            <Text className="text-lg font-bold text-foreground" style={{ lineHeight: 26 }}>
              Weight
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
              {reading.value}
            </Text>
            <Text className="text-xl text-muted" style={{ lineHeight: 28 }}>
              lbs
            </Text>
          </View>
          <Text className="text-sm text-muted mt-1" style={{ lineHeight: 20 }}>
            {getTimeAgo(reading.timestamp)}
          </Text>
        </View>
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ 
            backgroundColor: reading.change < 0 
              ? `${colors.success}20` 
              : reading.change > 0 
              ? `${colors.warning}20` 
              : `${colors.muted}20` 
          }}
        >
          <Text 
            className="text-sm font-bold" 
            style={{ 
              color: reading.change < 0 
                ? colors.success 
                : reading.change > 0 
                ? colors.warning 
                : colors.muted,
              lineHeight: 20,
            }}
          >
            {reading.change > 0 ? '+' : ''}{reading.change} lbs
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
