import { ScrollView, Text, View, Pressable, Switch, type ViewStyle } from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useLanguage } from "@/lib/language-provider";
import type { Language } from "@/lib/language-provider";

type TextSize = "small" | "medium" | "large" | "extra-large";

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentProps<typeof IconSymbol>["name"];
  type: "toggle" | "select" | "action";
  value?: boolean | string;
}

/**
 * Settings Screen - App Configuration
 *
 * Customize preferences, emergency contacts, health conditions, and privacy settings.
 * Designed with large, easy-to-use controls for older adults.
 */
export default function SettingsScreen() {
  const colors = useColors();
  const { language, setLanguage, t } = useLanguage();
  const [voiceAssistant, setVoiceAssistant] = useState(true);
  const [medicationReminders, setMedicationReminders] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>("large");

  const handleToggle = (setting: string, value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (setting) {
      case "voice":
        setVoiceAssistant(value);
        break;
      case "reminders":
        setMedicationReminders(value);
        break;
      case "darkMode":
        setDarkMode(value);
        break;
    }
  };

  const handleLanguageChange = async (lang: Language) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setLanguage(lang);
  };

  const handleAction = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (action) {
      case "emergency":
        router.push("/emergency-contacts");
        break;
      case "conditions":
        router.push("/health-conditions");
        break;
      case "privacy":
        router.push("/privacy-settings");
        break;
      case "account":
        router.push("/account-management");
        break;
      case "whatsNew":
        router.push("/whats-new");
        break;
      case "devices":
        router.push("/connected-devices" as any);
        break;
      case "library":
        router.push("/medical-library" as any);
        break;
      case "tutorial":
        router.push("/onboarding" as any);
        break;
      case "bluetooth":
        router.push("/bluetooth-devices" as any);
        break;
      case "communication":
        router.push("/communication-log" as any);
        break;
    }
  };

  const SettingCard = ({ item }: { item: SettingItem }) => (
    <Pressable
      onPress={() => item.type === "action" && handleAction(item.id)}
      disabled={item.type === "toggle"}
      style={({ pressed }) => [
        {
          transform: [{ scale: pressed && item.type === "action" ? 0.98 : 1 }],
          opacity: pressed && item.type === "action" ? 0.9 : 1,
        } as ViewStyle,
      ]}
    >
      <View className="bg-surface rounded-3xl p-6 border border-border">
        <View className="flex-row items-center gap-4">
          <View
            className="w-14 h-14 rounded-2xl items-center justify-center"
            style={{ backgroundColor: `${colors.primary}20` }}
          >
            <IconSymbol name={item.icon} size={28} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-semibold text-foreground" style={{ lineHeight: 28 }}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text className="text-base text-muted mt-1" style={{ lineHeight: 22 }}>
                {item.subtitle}
              </Text>
            )}
          </View>
          {item.type === "toggle" && (
            <Switch
              value={item.value as boolean}
              onValueChange={value => handleToggle(item.id, value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#ffffff"
              style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
            />
          )}
          {item.type === "action" && (
            <IconSymbol name="chevron.right" size={24} color={colors.muted} />
          )}
        </View>
      </View>
    </Pressable>
  );

  const preferences: SettingItem[] = [
    {
      id: "voice",
      title: t("voiceAssistant"),
      subtitle: t("voiceAssistantDesc"),
      icon: "mic.fill",
      type: "toggle",
      value: voiceAssistant,
    },
    {
      id: "reminders",
      title: t("medicationReminders"),
      subtitle: t("medicationRemindersDesc"),
      icon: "pills.fill",
      type: "toggle",
      value: medicationReminders,
    },
    {
      id: "darkMode",
      title: t("darkMode"),
      subtitle: t("darkModeDesc"),
      icon: "gearshape.fill",
      type: "toggle",
      value: darkMode,
    },
  ];

  const healthSettings: SettingItem[] = [
    {
      id: "devices",
      title: "Connected Devices",
      subtitle: "Manage Omron, Samsung Watch, iHome Scale sync",
      icon: "antenna.radiowaves.left.and.right",
      type: "action",
    },
    {
      id: "library",
      title: "Medical Library",
      subtitle: "Health education from trusted sources",
      icon: "lightbulb.fill",
      type: "action",
    },
    {
      id: "tutorial",
      title: "View Tutorial Again",
      subtitle: "Replay the onboarding guide",
      icon: "questionmark.circle.fill",
      type: "action",
    },
    {
      id: "communication",
      title: "Doctor Communication Log",
      subtitle: "Track interactions for Medicare billing",
      icon: "phone.fill",
      type: "action",
    },
    {
      id: "emergency",
      title: t("emergencyContacts"),
      subtitle: t("emergencyContactsDesc"),
      icon: "phone.fill",
      type: "action",
    },
    {
      id: "conditions",
      title: t("healthConditions"),
      subtitle: t("healthConditionsDesc"),
      icon: "heart.fill",
      type: "action",
    },
  ];

  const accountSettings: SettingItem[] = [
    {
      id: "whatsNew",
      title: t("whatsNew"),
      subtitle: t("whatsNewDesc"),
      icon: "sparkles",
      type: "action",
    },
    {
      id: "privacy",
      title: t("privacySettings"),
      subtitle: t("privacySettingsDesc"),
      icon: "gearshape.fill",
      type: "action",
    },
    {
      id: "account",
      title: t("accountManagement"),
      subtitle: t("accountManagementDesc"),
      icon: "person.2.fill",
      type: "action",
    },
  ];

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          {t("settings")}
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Customize your experience
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Preferences Section */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            {t("preferences")}
          </Text>
          <View className="gap-4">
            {preferences.map(item => (
              <SettingCard key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* Language Selection */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            {t("language")}
          </Text>
          <View className="bg-surface rounded-3xl p-6 border border-border">
            <View className="gap-3">
              {(["en", "es"] as Language[]).map(lang => (
                <Pressable
                  key={lang}
                  onPress={() => handleLanguageChange(lang)}
                  style={({ pressed }) => [
                    {
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      opacity: pressed ? 0.9 : 1,
                      backgroundColor: language === lang ? `${colors.primary}20` : "transparent",
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: language === lang ? colors.primary : colors.border,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    } as ViewStyle,
                  ]}
                >
                  <Text
                    className="text-lg font-semibold"
                    style={{
                      color: language === lang ? colors.primary : colors.foreground,
                      lineHeight: 24,
                    }}
                  >
                    {lang === "en" ? "English" : "Español"}
                  </Text>
                  {language === lang && (
                    <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Text Size Section */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            {t("textSize")}
          </Text>
          <View className="bg-surface rounded-3xl p-6 border border-border">
            <View className="gap-3">
              {(["small", "medium", "large", "extra-large"] as TextSize[]).map(size => (
                <Pressable
                  key={size}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setTextSize(size);
                  }}
                  style={({ pressed }) => [
                    {
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      opacity: pressed ? 0.9 : 1,
                      backgroundColor: textSize === size ? `${colors.primary}20` : "transparent",
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: textSize === size ? colors.primary : colors.border,
                    } as ViewStyle,
                  ]}
                >
                  <Text
                    className="text-lg font-semibold capitalize"
                    style={{
                      color: textSize === size ? colors.primary : colors.foreground,
                      lineHeight: 24,
                    }}
                  >
                    {size.replace("-", " ")}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Health Settings Section */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            {t("healthSettings")}
          </Text>
          <View className="gap-4">
            {healthSettings.map(item => (
              <SettingCard key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* Account & Privacy Section */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            {t("accountPrivacy")}
          </Text>
          <View className="gap-4">
            {accountSettings.map(item => (
              <SettingCard key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* App Info */}
        <View className="mb-8 items-center">
          <Text className="text-base text-muted" style={{ lineHeight: 22 }}>
            HealthMate v1.0.0
          </Text>
          <Text className="text-sm text-muted mt-1" style={{ lineHeight: 18 }}>
            Your AI Health Companion
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
