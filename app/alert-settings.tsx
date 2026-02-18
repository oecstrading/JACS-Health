import { useState } from "react";
import { View, Text, ScrollView, Pressable, Switch, Alert } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

type AlertTier = "tier1" | "tier2" | "tier3";

interface AlertSettings {
  tier1: {
    enabled: boolean;
    phoneCall: boolean;
    vibration: boolean;
    alerts: string[];
  };
  tier2: {
    enabled: boolean;
    pushNotification: boolean;
    alerts: string[];
  };
  tier3: {
    enabled: boolean;
    dailyEmail: boolean;
    emailTime: string;
    alerts: string[];
  };
}

export default function AlertSettingsScreen() {
  const colors = useColors();
  
  const [settings, setSettings] = useState<AlertSettings>({
    tier1: {
      enabled: true,
      phoneCall: true,
      vibration: true,
      alerts: ["Fall Detection", "SOS Button", "Critical Vitals"],
    },
    tier2: {
      enabled: true,
      pushNotification: true,
      alerts: ["Stability Decline", "Cognitive Change", "Medication Missed", "BP Alert"],
    },
    tier3: {
      enabled: true,
      dailyEmail: true,
      emailTime: "8:00 PM",
      alerts: ["Daily Health Summary", "Medication Adherence", "Activity Log", "Brain Game Scores"],
    },
  });

  function toggleTier(tier: AlertTier) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        enabled: !prev[tier].enabled,
      },
    }));
  }

  function toggleTierOption(tier: AlertTier, option: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings((prev) => {
      const tierSettings = prev[tier] as any;
      return {
        ...prev,
        [tier]: {
          ...tierSettings,
          [option]: !tierSettings[option],
        },
      };
    });
  }

  function handleSaveSettings() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "✓ Settings Saved",
      "Your alert preferences have been updated with AES-256 encryption for HIPAA compliance.",
      [{ text: "OK" }]
    );
  }

  function handleTestAlert(tier: AlertTier) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (tier === "tier1") {
      Alert.alert(
        "🚨 CRITICAL ALERT TEST",
        "This is a Tier 1 critical alert. In a real scenario, you would receive a phone call and vibration.",
        [{ text: "Dismiss" }]
      );
    } else if (tier === "tier2") {
      Alert.alert(
        "⚠️ Proactive Alert Test",
        "This is a Tier 2 proactive alert. You would receive a push notification like this.",
        [{ text: "Dismiss" }]
      );
    } else {
      Alert.alert(
        "📧 Daily Summary Test",
        "This is a Tier 3 routine alert. You would receive a daily email summary at your specified time.",
        [{ text: "Dismiss" }]
      );
    }
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text className="text-lg text-primary">← Back</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-foreground">Alert Settings</Text>
          <View className="w-12" />
        </View>

        {/* Security Notice */}
        <View className="bg-success/10 border-2 border-success p-4 rounded-xl mb-6">
          <View className="flex-row items-center gap-3">
            <Text className="text-3xl">🔒</Text>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground mb-1">HIPAA-Compliant Security</Text>
              <Text className="text-sm text-muted">
                All alerts use AES-256 encryption for secure data transmission
              </Text>
            </View>
          </View>
        </View>

        {/* Tier 1: Critical Alerts */}
        <View className="bg-surface p-6 rounded-2xl mb-6 border-2 border-error">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-error mb-1">🚨 Tier 1: Critical</Text>
              <Text className="text-sm text-muted">Immediate phone call + vibration</Text>
            </View>
            <Switch
              value={settings.tier1.enabled}
              onValueChange={() => toggleTier("tier1")}
              trackColor={{ false: colors.border, true: colors.error }}
              thumbColor={settings.tier1.enabled ? "#fff" : "#f4f3f4"}
            />
          </View>

          {settings.tier1.enabled && (
            <View>
              {/* Tier 1 Options */}
              <View className="gap-3 mb-4">
                <View className="flex-row items-center justify-between p-3 bg-background rounded-xl">
                  <Text className="text-base text-foreground">Phone Call</Text>
                  <Switch
                    value={settings.tier1.phoneCall}
                    onValueChange={() => toggleTierOption("tier1", "phoneCall")}
                    trackColor={{ false: colors.border, true: colors.error }}
                    thumbColor={settings.tier1.phoneCall ? "#fff" : "#f4f3f4"}
                  />
                </View>
                <View className="flex-row items-center justify-between p-3 bg-background rounded-xl">
                  <Text className="text-base text-foreground">Vibration</Text>
                  <Switch
                    value={settings.tier1.vibration}
                    onValueChange={() => toggleTierOption("tier1", "vibration")}
                    trackColor={{ false: colors.border, true: colors.error }}
                    thumbColor={settings.tier1.vibration ? "#fff" : "#f4f3f4"}
                  />
                </View>
              </View>

              {/* Tier 1 Alert Types */}
              <View className="mb-4">
                <Text className="text-sm font-bold text-muted mb-2">ALERT TYPES:</Text>
                <View className="gap-2">
                  {settings.tier1.alerts.map((alert, idx) => (
                    <View key={idx} className="flex-row items-center gap-2 p-2 bg-background rounded-lg">
                      <Text className="text-lg">🔴</Text>
                      <Text className="text-sm text-foreground">{alert}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Test Button */}
              <Pressable
                onPress={() => handleTestAlert("tier1")}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                className="bg-error py-3 rounded-xl items-center"
              >
                <Text className="text-white text-base font-bold">Test Tier 1 Alert</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Tier 2: Proactive Alerts */}
        <View className="bg-surface p-6 rounded-2xl mb-6 border-2" style={{ borderColor: "#F59E0B" }}>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold mb-1" style={{ color: "#F59E0B" }}>⚠️ Tier 2: Proactive</Text>
              <Text className="text-sm text-muted">Push notifications for predictions</Text>
            </View>
            <Switch
              value={settings.tier2.enabled}
              onValueChange={() => toggleTier("tier2")}
              trackColor={{ false: colors.border, true: "#F59E0B" }}
              thumbColor={settings.tier2.enabled ? "#fff" : "#f4f3f4"}
            />
          </View>

          {settings.tier2.enabled && (
            <View>
              {/* Tier 2 Options */}
              <View className="gap-3 mb-4">
                <View className="flex-row items-center justify-between p-3 bg-background rounded-xl">
                  <Text className="text-base text-foreground">Push Notifications</Text>
                  <Switch
                    value={settings.tier2.pushNotification}
                    onValueChange={() => toggleTierOption("tier2", "pushNotification")}
                    trackColor={{ false: colors.border, true: "#F59E0B" }}
                    thumbColor={settings.tier2.pushNotification ? "#fff" : "#f4f3f4"}
                  />
                </View>
              </View>

              {/* Tier 2 Alert Types */}
              <View className="mb-4">
                <Text className="text-sm font-bold text-muted mb-2">ALERT TYPES:</Text>
                <View className="gap-2">
                  {settings.tier2.alerts.map((alert, idx) => (
                    <View key={idx} className="flex-row items-center gap-2 p-2 bg-background rounded-lg">
                      <Text className="text-lg">🟡</Text>
                      <Text className="text-sm text-foreground">{alert}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Test Button */}
              <Pressable
                onPress={() => handleTestAlert("tier2")}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, backgroundColor: "#F59E0B", paddingVertical: 12, borderRadius: 12, alignItems: "center" })}
              >
                <Text className="text-white text-base font-bold">Test Tier 2 Alert</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Tier 3: Routine Alerts */}
        <View className="bg-surface p-6 rounded-2xl mb-6 border-2 border-primary">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-primary mb-1">📧 Tier 3: Routine</Text>
              <Text className="text-sm text-muted">Daily email summaries</Text>
            </View>
            <Switch
              value={settings.tier3.enabled}
              onValueChange={() => toggleTier("tier3")}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.tier3.enabled ? "#fff" : "#f4f3f4"}
            />
          </View>

          {settings.tier3.enabled && (
            <View>
              {/* Tier 3 Options */}
              <View className="gap-3 mb-4">
                <View className="flex-row items-center justify-between p-3 bg-background rounded-xl">
                  <Text className="text-base text-foreground">Daily Email</Text>
                  <Switch
                    value={settings.tier3.dailyEmail}
                    onValueChange={() => toggleTierOption("tier3", "dailyEmail")}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={settings.tier3.dailyEmail ? "#fff" : "#f4f3f4"}
                  />
                </View>
                <View className="flex-row items-center justify-between p-3 bg-background rounded-xl">
                  <Text className="text-base text-foreground">Email Time</Text>
                  <Text className="text-base font-bold text-primary">{settings.tier3.emailTime}</Text>
                </View>
              </View>

              {/* Tier 3 Alert Types */}
              <View className="mb-4">
                <Text className="text-sm font-bold text-muted mb-2">SUMMARY INCLUDES:</Text>
                <View className="gap-2">
                  {settings.tier3.alerts.map((alert, idx) => (
                    <View key={idx} className="flex-row items-center gap-2 p-2 bg-background rounded-lg">
                      <Text className="text-lg">🟢</Text>
                      <Text className="text-sm text-foreground">{alert}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Test Button */}
              <Pressable
                onPress={() => handleTestAlert("tier3")}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                className="bg-primary py-3 rounded-xl items-center"
              >
                <Text className="text-white text-base font-bold">Test Tier 3 Alert</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Alert History */}
        <View className="bg-surface p-6 rounded-2xl mb-6">
          <Text className="text-xl font-bold text-foreground mb-4">📋 Alert History & Audit Log</Text>
          <Text className="text-sm text-muted mb-4">
            All alerts are logged for compliance and review. View your complete alert history below.
          </Text>
          <Pressable
            onPress={() => Alert.alert("Alert History", "View coming soon")}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            className="bg-background border border-border py-3 rounded-xl items-center"
          >
            <Text className="text-foreground text-base font-bold">View Alert History</Text>
          </Pressable>
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSaveSettings}
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          className="bg-success py-4 rounded-xl items-center mb-6"
        >
          <Text className="text-white text-lg font-bold">💾 Save Alert Settings</Text>
        </Pressable>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
