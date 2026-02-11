import { ScrollView, Text, View, Pressable, TextInput, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function LogMobilityScreen() {
  const colors = useColors();
  const [walkingDistance, setWalkingDistance] = useState("");
  const [stairs, setStairs] = useState("");
  const [sitToStand, setSitToStand] = useState("");

  const handleSave = async () => {
    try {
      const entry = {
        id: Date.now().toString(),
        walkingDistance: parseFloat(walkingDistance) || 0,
        stairs: parseInt(stairs) || 0,
        sitToStand: parseFloat(sitToStand) || 0,
        timestamp: new Date().toISOString(),
      };

      const existing = await AsyncStorage.getItem("mobility_log");
      const log = existing ? JSON.parse(existing) : [];
      log.unshift(entry);
      if (log.length > 100) log.pop();
      
      await AsyncStorage.setItem("mobility_log", JSON.stringify(log));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Mobility logged successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save mobility log");
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-6 pt-6">
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <IconSymbol name="chevron.left" size={28} color={colors.foreground} />
        </Pressable>
        
        <Text className="text-3xl font-bold text-foreground mb-2">Log Mobility</Text>
        <Text className="text-lg text-muted mb-6">Track your movement progress</Text>

        <View className="mb-4">
          <Text className="text-lg font-semibold text-foreground mb-2">Walking Distance (feet)</Text>
          <TextInput
            value={walkingDistance}
            onChangeText={setWalkingDistance}
            keyboardType="numeric"
            placeholder="e.g., 50"
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
          <Text className="text-lg font-semibold text-foreground mb-2">Stairs Climbed</Text>
          <TextInput
            value={stairs}
            onChangeText={setStairs}
            keyboardType="numeric"
            placeholder="e.g., 10"
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
          <Text className="text-lg font-semibold text-foreground mb-2">Sit-to-Stand Time (seconds)</Text>
          <TextInput
            value={sitToStand}
            onChangeText={setSitToStand}
            keyboardType="numeric"
            placeholder="e.g., 3.5"
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
            Save Mobility Log
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
