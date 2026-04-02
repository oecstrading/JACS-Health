import { ScrollView, Text, View, TouchableOpacity, Switch, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
const SETTINGS = [
  { key: "shareDoctor", label: "Share data with doctor", desc: "Allow your endocrinologist to view BG logs and CGM data", def: true },
  { key: "notifications", label: "Allow notifications", desc: "BG reminders, medication alerts, and safety notifications", def: true },
  { key: "biometric", label: "Biometric lock", desc: "Require Face ID or fingerprint to open the app", def: false },
  { key: "backup", label: "Data backup", desc: "Automatically back up health data to secure cloud storage", def: true },
  { key: "analytics", label: "Anonymous analytics", desc: "Help improve JACS by sharing anonymized usage data", def: false },
  { key: "emergency", label: "Emergency access", desc: "Allow emergency responders to view Medical ID without unlock", def: true },
];
export default function PrivacySettingsScreen() {
  const colors = useColors();
  const [settings, setSettings] = useState<Record<string, boolean>>(Object.fromEntries(SETTINGS.map(s => [s.key, s.def])));
  const toggle = (key: string) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSettings(prev => ({ ...prev, [key]: !prev[key] })); };
  const save = () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); Alert.alert("Saved", "Privacy settings updated successfully."); };
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Privacy Settings</Text>
        </View>
        {SETTINGS.map((s) => (
          <View key={s.key} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 15 }}>{s.label}</Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>{s.desc}</Text>
            </View>
            <Switch value={settings[s.key]} onValueChange={() => toggle(s.key)} trackColor={{ false: colors.border, true: colors.primary + "80" }} thumbColor={settings[s.key] ? colors.primary : colors.muted} />
          </View>
        ))}
        <TouchableOpacity onPress={save} style={{ backgroundColor: colors.primary, borderRadius: 16, padding: 16, alignItems: "center", marginTop: 8, marginBottom: 24 }}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
