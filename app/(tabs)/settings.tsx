import { ScrollView, Text, View, Pressable, Switch, type ViewStyle } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

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

  const handleAction = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (action) {
      case "emergency":
        alert("Emergency contacts management coming soon");
        break;
      case "conditions":
        alert("Health conditions selection coming soon");
        break;
      case "privacy":
        alert("Privacy settings coming soon");
        break;
      case "account":
        alert("Account management coming soon");
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
      title: "Voice Assistant",
      subtitle: "Enable AI voice interaction",
      icon: "mic.fill",
      type: "toggle",
      value: voiceAssistant,
    },
    {
      id: "reminders",
      title: "Medication Reminders",
      subtitle: "Get notified for medications",
      icon: "pills.fill",
      type: "toggle",
      value: medicationReminders,
    },
    {
      id: "darkMode",
      title: "Dark Mode",
      subtitle: "Reduce eye strain at night",
      icon: "gearshape.fill",
      type: "toggle",
      value: darkMode,
    },
  ];

  const healthSettings: SettingItem[] = [
    {
      id: "emergency",
      title: "Emergency Contacts",
      subtitle: "Manage your emergency contacts",
      icon: "phone.fill",
      type: "action",
    },
    {
      id: "conditions",
      title: "Health Conditions",
      subtitle: "Update your health profile",
      icon: "heart.fill",
      type: "action",
    },
  ];

  const accountSettings: SettingItem[] = [
    {
      id: "privacy",
      title: "Privacy Settings",
      subtitle: "Control your data sharing",
      icon: "gearshape.fill",
      type: "action",
    },
    {
      id: "account",
      title: "Account Management",
      subtitle: "Update your profile",
      icon: "person.2.fill",
      type: "action",
    },
  ];

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          Settings
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Customize your experience
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Preferences Section */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Preferences
          </Text>
          <View className="gap-4">
            {preferences.map(item => (
              <SettingCard key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* Text Size Section */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Text Size
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
            Health Settings
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
            Account & Privacy
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
