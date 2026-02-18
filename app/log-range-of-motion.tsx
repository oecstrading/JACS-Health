import { ScrollView, Text, View, Pressable, TextInput, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function LogRangeOfMotionScreen() {
  const colors = useColors();
  const [flexion, setFlexion] = useState("");
  const [extension, setExtension] = useState("");
  const [abduction, setAbduction] = useState("");

  const handleSave = async () => {
    try {
      const entry = {
        id: Date.now().toString(),
        flexion: parseFloat(flexion) || 0,
        extension: parseFloat(extension) || 0,
        abduction: parseFloat(abduction) || 0,
        timestamp: new Date().toISOString(),
      };

      const existing = await AsyncStorage.getItem("rom_log");
      const log = existing ? JSON.parse(existing) : [];
      log.unshift(entry);
      if (log.length > 100) log.pop();
      
      await AsyncStorage.setItem("rom_log", JSON.stringify(log));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Range of motion logged successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save ROM log");
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-6 pt-6">
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <IconSymbol name="chevron.left" size={28} color={colors.foreground} />
        </Pressable>
        
        <Text className="text-3xl font-bold text-foreground mb-2">Log Range of Motion</Text>
        <Text className="text-lg text-muted mb-6">Track your hip flexibility in degrees</Text>

        <View className="mb-4">
          <Text className="text-lg font-semibold text-foreground mb-2">Flexion (degrees)</Text>
          <TextInput
            value={flexion}
            onChangeText={setFlexion}
            keyboardType="numeric"
            placeholder="e.g., 90"
            placeholderTextColor={colors.muted}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              color: colors.foreground,
            }}
          />
        </View>

        <View className="mb-4">
          <Text className="text-lg font-semibold text-foreground mb-2">Extension (degrees)</Text>
          <TextInput
            value={extension}
            onChangeText={setExtension}
            keyboardType="numeric"
            placeholder="e.g., 20"
            placeholderTextColor={colors.muted}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              color: colors.foreground,
            }}
          />
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-2">Abduction (degrees)</Text>
          <TextInput
            value={abduction}
            onChangeText={setAbduction}
            keyboardType="numeric"
            placeholder="e.g., 45"
            placeholderTextColor={colors.muted}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              color: colors.foreground,
            }}
          />
        </View>

        <Pressable
          onPress={handleSave}
          style={{
            backgroundColor: colors.primary,
            padding: 18,
            borderRadius: 16,
            marginBottom: 32,
          }}
        >
          <Text className="text-xl font-bold text-center" style={{ color: "#fff" }}>
            Save ROM Log
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
