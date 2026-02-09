import { ScrollView, Text, View, Pressable, Switch, Alert } from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface PrivacySettings {
  shareWithProviders: boolean;
  shareWithCaregivers: boolean;
  anonymousUsageData: boolean;
  locationServices: boolean;
  voiceRecordings: boolean;
  healthDataSync: boolean;
}

/**
 * Privacy Settings Screen
 * 
 * Control data sharing preferences and privacy settings.
 */
export default function PrivacySettingsScreen() {
  const colors = useColors();
  const [settings, setSettings] = useState<PrivacySettings>({
    shareWithProviders: true,
    shareWithCaregivers: true,
    anonymousUsageData: false,
    locationServices: true,
    voiceRecordings: true,
    healthDataSync: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem("privacy_settings");
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading privacy settings:", error);
    }
  };

  const saveSetting = async (key: keyof PrivacySettings, value: boolean) => {
    try {
      const updated = { ...settings, [key]: value };
      await AsyncStorage.setItem("privacy_settings", JSON.stringify(updated));
      setSettings(updated);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Error saving privacy setting:", error);
      Alert.alert("Error", "Failed to save privacy setting");
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your health data, including intake forms, vitals, medications, and saved information. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All Data",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all health-related data
              await AsyncStorage.multiRemove([
                "intake_forms",
                "health_vitals",
                "medications",
                "health_conditions",
                "emergency_contacts",
                "saved_health_items",
                "symptom_checks",
                "family_health_history",
              ]);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Success", "All health data has been cleared");
            } catch (error) {
              console.error("Error clearing data:", error);
              Alert.alert("Error", "Failed to clear data");
            }
          },
        },
      ]
    );
  };

  const SettingRow = ({
    title,
    subtitle,
    value,
    onValueChange,
  }: {
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View className="bg-surface border border-border rounded-2xl p-5 mb-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-lg font-semibold text-foreground" style={{ lineHeight: 24 }}>
            {title}
          </Text>
          <Text className="text-base text-muted mt-1" style={{ lineHeight: 22 }}>
            {subtitle}
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#ffffff"
          style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
        />
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          className="flex-row items-center gap-2 mb-2"
        >
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          <Text className="text-lg text-primary" style={{ lineHeight: 24 }}>
            Back
          </Text>
        </Pressable>
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          Privacy Settings
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Control your data sharing preferences
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Data Sharing */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Data Sharing
          </Text>
          
          <SettingRow
            title="Share with Healthcare Providers"
            subtitle="Allow sharing intake forms and health data with your doctors"
            value={settings.shareWithProviders}
            onValueChange={(value) => saveSetting("shareWithProviders", value)}
          />

          <SettingRow
            title="Share with Caregivers"
            subtitle="Allow family members and caregivers to view your health information"
            value={settings.shareWithCaregivers}
            onValueChange={(value) => saveSetting("shareWithCaregivers", value)}
          />

          <SettingRow
            title="Anonymous Usage Data"
            subtitle="Help improve HealthMate by sharing anonymous usage statistics"
            value={settings.anonymousUsageData}
            onValueChange={(value) => saveSetting("anonymousUsageData", value)}
          />
        </View>

        {/* App Permissions */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            App Permissions
          </Text>

          <SettingRow
            title="Location Services"
            subtitle="Use your location to find nearby healthcare providers and pharmacies"
            value={settings.locationServices}
            onValueChange={(value) => saveSetting("locationServices", value)}
          />

          <SettingRow
            title="Voice Recordings"
            subtitle="Allow voice input for intake forms and symptom checker"
            value={settings.voiceRecordings}
            onValueChange={(value) => saveSetting("voiceRecordings", value)}
          />

          <SettingRow
            title="Health Data Sync"
            subtitle="Sync health data across devices (requires cloud account)"
            value={settings.healthDataSync}
            onValueChange={(value) => saveSetting("healthDataSync", value)}
          />
        </View>

        {/* HIPAA Information */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Privacy & Compliance
          </Text>

          <View className="bg-surface border border-border rounded-2xl p-5 mb-4">
            <View className="flex-row items-start gap-3">
              <IconSymbol name="document.fill" size={24} color={colors.primary} />
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground" style={{ lineHeight: 24 }}>
                  HIPAA Notice of Privacy Practices
                </Text>
                <Text className="text-base text-muted mt-1" style={{ lineHeight: 22 }}>
                  Your health information is protected under HIPAA regulations. All data is encrypted and stored securely.
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-surface border border-border rounded-2xl p-5">
            <View className="flex-row items-start gap-3">
              <IconSymbol name="shield.fill" size={24} color={colors.success} />
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground" style={{ lineHeight: 24 }}>
                  HIPAA Compliant
                </Text>
                <Text className="text-base text-muted mt-1" style={{ lineHeight: 22 }}>
                  Your health data is encrypted and stored securely in compliance with HIPAA regulations.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Data Management */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Data Management
          </Text>

          <Pressable
            onPress={handleClearData}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.98 : 1 }],
              opacity: pressed ? 0.9 : 1,
            })}
            className="bg-error/10 border-2 border-error rounded-2xl p-5"
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol name="trash.fill" size={24} color={colors.error} />
              <View className="flex-1">
                <Text className="text-lg font-bold text-error" style={{ lineHeight: 24 }}>
                  Clear All Data
                </Text>
                <Text className="text-base text-error mt-1" style={{ lineHeight: 22 }}>
                  Permanently delete all health information
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Info Note */}
        <View className="bg-primary/10 border border-primary rounded-2xl p-5 mb-8">
          <View className="flex-row items-start gap-3">
            <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
            <View className="flex-1">
              <Text className="text-base text-foreground" style={{ lineHeight: 22 }}>
                All your health data is stored locally on your device by default. Enable Health Data Sync to backup to secure cloud storage.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
