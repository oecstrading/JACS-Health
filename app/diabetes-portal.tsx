import { ScrollView, Text, View, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { VirtualCGM } from "@/components/diabetes/VirtualCGM";
import { VirtualOmniPod } from "@/components/diabetes/VirtualOmniPod";
import { TimeInRangeChart } from "@/components/diabetes/TimeInRangeChart";
import { DailyGlucosePattern } from "@/components/diabetes/DailyGlucosePattern";
import { TodaysSnapshot } from "@/components/diabetes/TodaysSnapshot";
import { AIFoodScanner } from "@/components/diabetes/AIFoodScanner";
import { AlertContactsManager } from "@/components/diabetes/AlertContactsManager";
import { ManualDataEntry } from "@/components/diabetes/ManualDataEntry";
import { useColors } from "@/hooks/use-colors";
import { Activity, Droplet, Heart, Syringe } from "lucide-react-native";

/**
 * Comprehensive Diabetes Management Portal
 * 
 * Features:
 * - Virtual CGM (Continuous Glucose Monitor)
 * - Virtual OmniPod Insulin Pump
 * - Time in Range (TIR) Visualization
 * - Daily Glucose Pattern Chart
 * - Today's Snapshot Dashboard
 * - AI Food Scanner
 * - Alert Contacts Management
 * - Manual Data Entry
 */
export default function DiabetesPortalScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<"type1" | "type2" | "all">("all");

  return (
    <ScreenContainer className="bg-background">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="p-6 pb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Droplet size={28} color={colors.primary} />
            <Text className="text-2xl font-bold text-foreground">
              Diabetic Management Portal
            </Text>
          </View>
          <Text className="text-base text-muted leading-relaxed">
            World-class diabetes management for Type 1 & Type 2. CGM integration, insulin tracking, AI-powered insights, and everything your care team needs — in one platform.
          </Text>
        </View>

        {/* Type Selector */}
        <View className="px-6 pb-4">
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setActiveTab("all")}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              className={`flex-1 py-3 rounded-xl border ${
                activeTab === "all"
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === "all" ? "text-white" : "text-foreground"
                }`}
              >
                All
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab("type1")}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              className={`flex-1 py-3 rounded-xl border ${
                activeTab === "type1"
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === "type1" ? "text-white" : "text-foreground"
                }`}
              >
                Type 1
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab("type2")}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              className={`flex-1 py-3 rounded-xl border ${
                activeTab === "type2"
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === "type2" ? "text-white" : "text-foreground"
                }`}
              >
                Type 2
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Today's Snapshot */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">
            Today's Snapshot
          </Text>
          <TodaysSnapshot />
        </View>

        {/* Time in Range */}
        <View className="px-6 pb-6">
          <TimeInRangeChart />
        </View>

        {/* Daily Glucose Pattern */}
        <View className="px-6 pb-6">
          <DailyGlucosePattern />
        </View>

        {/* AI Scanner & Virtual Devices */}
        <View className="px-6 pb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Activity size={24} color={colors.primary} />
            <Text className="text-lg font-semibold text-foreground">
              AI Scanner & Virtual Devices
            </Text>
          </View>
          <View className="bg-primary/10 p-4 rounded-xl mb-4">
            <Text className="text-sm font-semibold text-primary mb-1">
              No Hardware Required
            </Text>
            <Text className="text-sm text-foreground leading-relaxed">
              Can't afford a CGM or insulin pump? Our virtual devices simulate real-world functionality — scan food with AI, track glucose patterns, and manage insulin dosing all from your phone.
            </Text>
          </View>
        </View>

        {/* AI Food Scanner */}
        <View className="px-6 pb-6">
          <AIFoodScanner />
        </View>

        {/* Virtual CGM */}
        <View className="px-6 pb-6">
          <VirtualCGM />
        </View>

        {/* Virtual OmniPod */}
        <View className="px-6 pb-6">
          <VirtualOmniPod />
        </View>

        {/* Alert Contacts */}
        <View className="px-6 pb-6">
          <AlertContactsManager />
        </View>

        {/* Manual Data Entry */}
        <View className="px-6 pb-6">
          <ManualDataEntry />
        </View>

        {/* Additional Features Coming Soon */}
        <View className="px-6 pb-6">
          <View className="bg-surface border border-border rounded-xl p-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              More Features
            </Text>
            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <Heart size={20} color={colors.primary} />
                <Text className="text-sm text-foreground flex-1">
                  Kids Zone with gamification, XP, and badges
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Syringe size={20} color={colors.primary} />
                <Text className="text-sm text-foreground flex-1">
                  School Mode with 8-time daily reminders
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Activity size={20} color={colors.primary} />
                <Text className="text-sm text-foreground flex-1">
                  Emergency ID Card generator
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Droplet size={20} color={colors.primary} />
                <Text className="text-sm text-foreground flex-1">
                  AI Diabetes Medical Library
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
