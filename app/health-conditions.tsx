import { ScrollView, Text, View, Pressable, Alert } from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface HealthCondition {
  id: string;
  name: string;
  category: string;
  diagnosedDate?: string;
}

const COMMON_CONDITIONS = [
  { id: "diabetes", name: "Diabetes Type 2", category: "Endocrine" },
  { id: "hypertension", name: "Hypertension (High Blood Pressure)", category: "Cardiovascular" },
  { id: "arthritis", name: "Arthritis", category: "Musculoskeletal" },
  { id: "asthma", name: "Asthma", category: "Respiratory" },
  { id: "copd", name: "COPD", category: "Respiratory" },
  { id: "heart_disease", name: "Heart Disease", category: "Cardiovascular" },
  { id: "stroke", name: "Stroke History", category: "Cardiovascular" },
  { id: "thyroid", name: "Thyroid Disorder", category: "Endocrine" },
  { id: "cancer", name: "Cancer History", category: "Oncology" },
  { id: "alzheimers", name: "Alzheimer's/Dementia", category: "Neurological" },
  { id: "depression", name: "Depression", category: "Mental Health" },
  { id: "anxiety", name: "Anxiety Disorder", category: "Mental Health" },
];

/**
 * Health Conditions Management Screen
 * 
 * Select and manage chronic health conditions for personalized health tracking.
 */
export default function HealthConditionsScreen() {
  const colors = useColors();
  const [selectedConditions, setSelectedConditions] = useState<HealthCondition[]>([]);

  useEffect(() => {
    loadConditions();
  }, []);

  const loadConditions = async () => {
    try {
      const stored = await AsyncStorage.getItem("health_conditions");
      if (stored) {
        setSelectedConditions(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading health conditions:", error);
    }
  };

  const saveConditions = async (conditions: HealthCondition[]) => {
    try {
      await AsyncStorage.setItem("health_conditions", JSON.stringify(conditions));
      setSelectedConditions(conditions);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error saving health conditions:", error);
      Alert.alert("Error", "Failed to save health conditions");
    }
  };

  const toggleCondition = (condition: typeof COMMON_CONDITIONS[0]) => {
    const isSelected = selectedConditions.some(c => c.id === condition.id);
    
    if (isSelected) {
      const updated = selectedConditions.filter(c => c.id !== condition.id);
      saveConditions(updated);
    } else {
      const newCondition: HealthCondition = {
        ...condition,
        diagnosedDate: new Date().toISOString().split("T")[0],
      };
      const updated = [...selectedConditions, newCondition];
      saveConditions(updated);
    }
  };

  const isSelected = (id: string) => selectedConditions.some(c => c.id === id);

  const groupedConditions = COMMON_CONDITIONS.reduce((acc, condition) => {
    if (!acc[condition.category]) {
      acc[condition.category] = [];
    }
    acc[condition.category].push(condition);
    return acc;
  }, {} as Record<string, typeof COMMON_CONDITIONS>);

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
          Health Conditions
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Select your current health conditions
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Selected Count */}
        <View className="bg-primary/10 border border-primary rounded-2xl p-4 mb-6">
          <Text className="text-lg font-semibold text-primary text-center" style={{ lineHeight: 24 }}>
            {selectedConditions.length} condition{selectedConditions.length !== 1 ? "s" : ""} selected
          </Text>
        </View>

        {/* Conditions by Category */}
        {Object.entries(groupedConditions).map(([category, conditions]) => (
          <View key={category} className="mb-6">
            <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
              {category}
            </Text>
            <View className="gap-3">
              {conditions.map(condition => {
                const selected = isSelected(condition.id);
                return (
                  <Pressable
                    key={condition.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      toggleCondition(condition);
                    }}
                    style={({ pressed }) => ({
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      opacity: pressed ? 0.9 : 1,
                      backgroundColor: selected ? `${colors.primary}15` : colors.surface,
                      borderWidth: 2,
                      borderColor: selected ? colors.primary : colors.border,
                      borderRadius: 16,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    })}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        borderWidth: 2,
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected ? colors.primary : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {selected && (
                        <IconSymbol name="checkmark" size={18} color="#ffffff" />
                      )}
                    </View>
                    <Text
                      className="flex-1 text-lg font-semibold"
                      style={{
                        color: selected ? colors.primary : colors.foreground,
                        lineHeight: 24,
                      }}
                    >
                      {condition.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        {/* Info Note */}
        <View className="bg-surface border border-border rounded-2xl p-5 mb-8">
          <View className="flex-row items-start gap-3">
            <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
            <View className="flex-1">
              <Text className="text-base text-foreground" style={{ lineHeight: 22 }}>
                Your health conditions help us provide personalized health insights and reminders.
              </Text>
              <Text className="text-base text-muted mt-2" style={{ lineHeight: 22 }}>
                This information is stored securely on your device and can be shared with your healthcare providers.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
