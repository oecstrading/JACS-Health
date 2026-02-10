import { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "./ui/icon-symbol";

interface InsulinDose {
  id: string;
  doseType: "bolus" | "basal";
  insulinType: string;
  amount: number;
  timestamp: string;
  notes?: string;
}

export function RecentInsulinWidget() {
  const router = useRouter();
  const colors = useColors();
  const [recentDoses, setRecentDoses] = useState<InsulinDose[]>([]);

  useEffect(() => {
    loadRecentDoses();
  }, []);

  const loadRecentDoses = async () => {
    try {
      const data = await AsyncStorage.getItem("insulin_doses");
      if (data) {
        const doses: InsulinDose[] = JSON.parse(data);
        setRecentDoses(doses.slice(0, 3));
      }
    } catch (error) {
      console.error("[RecentInsulinWidget] Error loading doses:", error);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (recentDoses.length === 0) {
    return null;
  }

  return (
    <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-semibold text-foreground" style={{ lineHeight: 28 }}>
          Recent Insulin
        </Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/diabetes-dashboard" as any);
          }}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text className="text-sm font-medium" style={{ color: colors.primary, lineHeight: 20 }}>
            View All
          </Text>
        </Pressable>
      </View>

      <View className="gap-3">
        {recentDoses.map((dose) => (
          <View
            key={dose.id}
            className="flex-row items-center gap-3 p-3 rounded-xl"
            style={{ backgroundColor: `${colors.warning}10` }}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${colors.warning}30` }}
            >
              <IconSymbol name="syringe.fill" size={20} color={colors.warning} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground" style={{ lineHeight: 22 }}>
                {dose.amount} units {dose.doseType}
              </Text>
              <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
                {dose.insulinType.replace("-", " ")} • {getTimeAgo(dose.timestamp)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
