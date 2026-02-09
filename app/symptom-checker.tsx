import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  symptomCheckerService,
  type Symptom,
  type SymptomSelection,
  type SymptomCheckerResult,
} from "@/services/symptomChecker";

export default function SymptomCheckerScreen() {
  const router = useRouter();
  const colors = useColors();
  
  const [step, setStep] = useState<"category" | "symptoms" | "details" | "results">("category");
  const [selectedCategory, setSelectedCategory] = useState<Symptom["category"] | null>(null);
  const [availableSymptoms, setAvailableSymptoms] = useState<Symptom[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomSelection[]>([]);
  const [currentSymptomIndex, setCurrentSymptomIndex] = useState(0);
  const [results, setResults] = useState<SymptomCheckerResult | null>(null);

  useEffect(() => {
    if (selectedCategory) {
      const symptoms = symptomCheckerService.getSymptomsByCategory(selectedCategory);
      setAvailableSymptoms(symptoms);
    }
  }, [selectedCategory]);

  const handleCategorySelect = (category: Symptom["category"]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
    setStep("symptoms");
  };

  const handleSymptomSelect = (symptom: Symptom) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Check if already selected
    const existing = selectedSymptoms.find((s) => s.symptomId === symptom.id);
    if (existing) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s.symptomId !== symptom.id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, {
        symptomId: symptom.id,
        severity: "moderate",
        duration: "days",
      }]);
    }
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) {
      alert("Please select at least one symptom");
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const analysisResult = symptomCheckerService.analyzeSymptoms(selectedSymptoms);
    
    // Save to history
    await symptomCheckerService.saveToHistory(selectedSymptoms, analysisResult);
    
    setResults(analysisResult);
    setStep("results");
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep("category");
    setSelectedCategory(null);
    setSelectedSymptoms([]);
    setResults(null);
  };

  const categories: Array<{ id: Symptom["category"]; label: string; icon: string }> = [
    { id: "pain", label: "Pain", icon: "⚡" },
    { id: "digestive", label: "Digestive", icon: "🍽️" },
    { id: "respiratory", label: "Breathing", icon: "🫁" },
    { id: "neurological", label: "Neurological", icon: "🧠" },
    { id: "skin", label: "Skin", icon: "🩹" },
    { id: "mental", label: "Mental Health", icon: "💭" },
    { id: "general", label: "General", icon: "🌡️" },
  ];

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-6 py-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
            Symptom Checker
          </Text>
          <Text className="text-base text-muted mt-2" style={{ lineHeight: 24 }}>
            {step === "category" && "Select a symptom category to begin"}
            {step === "symptoms" && "Select symptoms you're experiencing"}
            {step === "results" && "Your symptom analysis results"}
          </Text>
        </View>

        {/* Category Selection */}
        {step === "category" && (
          <View className="gap-3">
            {categories.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => handleCategorySelect(category.id)}
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    opacity: pressed ? 0.8 : 1,
                    backgroundColor: colors.surface,
                    padding: 20,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                  } as ViewStyle,
                ]}
              >
                <View className="flex-row items-center">
                  <Text className="text-4xl mr-4">{category.icon}</Text>
                  <Text className="text-xl font-semibold text-foreground" style={{ lineHeight: 28 }}>
                    {category.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Symptom Selection */}
        {step === "symptoms" && (
          <View className="gap-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-semibold text-foreground">
                {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? "s" : ""} selected
              </Text>
              <Pressable onPress={() => setStep("category")}>
                <Text className="text-base text-primary">Change Category</Text>
              </Pressable>
            </View>

            {availableSymptoms.map((symptom) => {
              const isSelected = selectedSymptoms.some((s) => s.symptomId === symptom.id);
              
              return (
                <Pressable
                  key={symptom.id}
                  onPress={() => handleSymptomSelect(symptom)}
                  style={({ pressed }) => [
                    {
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      opacity: pressed ? 0.8 : 1,
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      padding: 16,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isSelected ? colors.primary : colors.border,
                    } as ViewStyle,
                  ]}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text
                        className="text-lg font-semibold mb-1"
                        style={{
                          color: isSelected ? "#FFFFFF" : colors.foreground,
                          lineHeight: 26,
                        }}
                      >
                        {symptom.name}
                        {symptom.isRedFlag && " ⚠️"}
                      </Text>
                      <Text
                        className="text-sm"
                        style={{
                          color: isSelected ? "#FFFFFF" : colors.muted,
                          lineHeight: 20,
                        }}
                      >
                        {symptom.description}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: isSelected ? "#FFFFFF" : colors.border,
                        backgroundColor: isSelected ? "#FFFFFF" : "transparent",
                        marginLeft: 12,
                      }}
                    />
                  </View>
                </Pressable>
              );
            })}

            {/* Analyze Button */}
            <Pressable
              onPress={handleAnalyze}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                  backgroundColor: colors.primary,
                  padding: 18,
                  borderRadius: 12,
                  marginTop: 8,
                } as ViewStyle,
              ]}
            >
              <Text
                className="text-center text-lg font-bold"
                style={{ color: "#FFFFFF", lineHeight: 26 }}
              >
                Analyze Symptoms
              </Text>
            </Pressable>
          </View>
        )}

        {/* Results */}
        {step === "results" && results && (
          <View className="gap-4">
            {/* Red Flags Warning */}
            {results.redFlags.length > 0 && (
              <View
                style={{
                  backgroundColor: colors.error,
                  padding: 20,
                  borderRadius: 12,
                }}
              >
                <Text className="text-xl font-bold mb-2" style={{ color: "#FFFFFF", lineHeight: 28 }}>
                  ⚠️ URGENT WARNING
                </Text>
                <Text className="text-base" style={{ color: "#FFFFFF", lineHeight: 24 }}>
                  {results.whenToSeeDoctor}
                </Text>
              </View>
            )}

            {/* Condition Matches */}
            {results.matches.length > 0 && (
              <View>
                <Text className="text-xl font-bold text-foreground mb-3" style={{ lineHeight: 28 }}>
                  Possible Conditions
                </Text>
                
                {results.matches.map((match) => (
                  <View
                    key={match.conditionId}
                    style={{
                      backgroundColor: colors.surface,
                      padding: 16,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      marginBottom: 12,
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-lg font-semibold text-foreground" style={{ lineHeight: 26 }}>
                        {match.conditionName}
                      </Text>
                      <Text className="text-2xl font-bold text-primary">
                        {match.probability}%
                      </Text>
                    </View>
                    
                    <Text className="text-sm text-muted mb-2" style={{ lineHeight: 20 }}>
                      Matching symptoms: {match.matchingSymptoms.join(", ")}
                    </Text>
                    
                    <Text className="text-sm text-foreground" style={{ lineHeight: 20 }}>
                      {match.recommendedAction}
                    </Text>
                    
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push(`/disease-detail?id=${match.conditionId}` as any);
                      }}
                      style={{ marginTop: 8 }}
                    >
                      <Text className="text-base text-primary font-semibold">
                        Learn More →
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* When to See Doctor */}
            {results.redFlags.length === 0 && (
              <View
                style={{
                  backgroundColor: colors.surface,
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text className="text-lg font-semibold text-foreground mb-2" style={{ lineHeight: 26 }}>
                  When to See a Doctor
                </Text>
                <Text className="text-base text-foreground" style={{ lineHeight: 24 }}>
                  {results.whenToSeeDoctor}
                </Text>
              </View>
            )}

            {/* Next Steps */}
            <View
              style={{
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text className="text-lg font-semibold text-foreground mb-3" style={{ lineHeight: 26 }}>
                Next Steps
              </Text>
              {results.nextSteps.map((step, index) => (
                <View key={index} className="flex-row items-start mb-2">
                  <Text className="text-base text-primary mr-2">•</Text>
                  <Text className="text-base text-foreground flex-1" style={{ lineHeight: 24 }}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View className="gap-3 mt-4">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/find-care" as any);
                }}
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    opacity: pressed ? 0.9 : 1,
                    backgroundColor: colors.primary,
                    padding: 16,
                    borderRadius: 12,
                  } as ViewStyle,
                ]}
              >
                <Text
                  className="text-center text-lg font-bold"
                  style={{ color: "#FFFFFF", lineHeight: 26 }}
                >
                  Find Care Near Me
                </Text>
              </Pressable>

              <Pressable
                onPress={handleReset}
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    opacity: pressed ? 0.9 : 1,
                    backgroundColor: colors.surface,
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  } as ViewStyle,
                ]}
              >
                <Text
                  className="text-center text-lg font-semibold text-foreground"
                  style={{ lineHeight: 26 }}
                >
                  Start New Check
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
