import { ScrollView, Text, View, Pressable, TextInput, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

/**
 * Log Hip Pain Screen
 * 
 * Quick pain logging for hip health tracking.
 */
export default function LogHipPainScreen() {
  const colors = useColors();
  const [painLevel, setPainLevel] = useState(5);
  const [location, setLocation] = useState<"left" | "right" | "both">("left");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    try {
      const entry = {
        id: Date.now().toString(),
        painLevel,
        location,
        notes,
        timestamp: new Date().toISOString(),
      };

      const existing = await AsyncStorage.getItem("hip_pain_log");
      const log = existing ? JSON.parse(existing) : [];
      log.unshift(entry);
      
      // Keep last 100 entries
      if (log.length > 100) log.pop();
      
      await AsyncStorage.setItem("hip_pain_log", JSON.stringify(log));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Hip pain logged successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save pain log");
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              marginBottom: 16,
            })}
          >
            <IconSymbol name="chevron.left" size={28} color={colors.foreground} />
          </Pressable>
          <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
            Log Hip Pain
          </Text>
          <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
            Track your pain level and location
          </Text>
        </View>

        {/* Pain Level */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-3" style={{ lineHeight: 28 }}>
            Pain Level (1-10)
          </Text>
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-5xl font-bold text-center mb-4" style={{ color: painLevel > 7 ? colors.error : painLevel > 4 ? colors.warning : colors.success }}>
              {painLevel}
            </Text>
            <View className="flex-row justify-between">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                <Pressable
                  key={level}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPainLevel(level);
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: painLevel === level ? colors.primary : `${colors.border}`,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: painLevel === level ? "#fff" : colors.muted, fontSize: 14, fontWeight: "600" }}>
                    {level}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Location */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-3" style={{ lineHeight: 28 }}>
            Location
          </Text>
          <View className="flex-row gap-3">
            {(["left", "right", "both"] as const).map(loc => (
              <Pressable
                key={loc}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setLocation(loc);
                }}
                style={{
                  flex: 1,
                  backgroundColor: location === loc ? colors.primary : colors.surface,
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: location === loc ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="text-lg font-semibold text-center capitalize"
                  style={{ color: location === loc ? "#fff" : colors.foreground, lineHeight: 24 }}
                >
                  {loc}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-3" style={{ lineHeight: 28 }}>
            Notes (Optional)
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="What triggered the pain? (e.g., walking, stairs, sitting)"
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 16,
              padding: 16,
              fontSize: 16,
              color: colors.foreground,
              textAlignVertical: "top",
              minHeight: 100,
            }}
          />
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            padding: 18,
            borderRadius: 16,
            marginBottom: 32,
            transform: [{ scale: pressed ? 0.97 : 1 }],
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text className="text-xl font-bold text-center" style={{ color: "#fff", lineHeight: 28 }}>
            Save Pain Log
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
