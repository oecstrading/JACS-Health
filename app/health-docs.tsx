import { ScrollView, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

/**
 * Health Documentation Center
 * 
 * Comprehensive health information for common conditions affecting older adults.
 * Inspired by medical documentation format with card-based navigation.
 */

interface HealthCondition {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  prevalence: string;
}

const healthConditions: HealthCondition[] = [
  {
    id: "diabetes",
    name: "Diabetes",
    icon: "pills.fill",
    color: "#3B82F6", // Blue
    description: "Blood sugar management and lifestyle tips",
    prevalence: "37.3 million Americans have diabetes",
  },
  {
    id: "heart-disease",
    name: "Heart Disease",
    icon: "heart.fill",
    color: "#EF4444", // Red
    description: "Cardiovascular health and prevention",
    prevalence: "#1 cause of death in the US",
  },
  {
    id: "hypertension",
    name: "Hypertension",
    icon: "heart.fill",
    color: "#F59E0B", // Orange
    description: "High blood pressure control and monitoring",
    prevalence: "Nearly half of US adults have high BP",
  },
  {
    id: "arthritis",
    name: "Arthritis",
    icon: "figure.walk",
    color: "#8B5CF6", // Purple
    description: "Joint health, pain management, and exercise",
    prevalence: "58.5 million US adults have arthritis",
  },
];

export default function HealthDocsScreen() {
  const colors = useColors();

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6">
          <Text
            className="text-3xl font-bold text-foreground mb-2"
            style={{ lineHeight: 38 }}
          >
            Health Documentation Center
          </Text>
          <Text
            className="text-lg text-muted"
            style={{ lineHeight: 26 }}
          >
            Learn about common health conditions and how to manage them effectively
          </Text>
        </View>

        {/* Statistics Banner */}
        <View className="bg-primary/10 rounded-3xl p-6 mb-8 border border-primary/20">
          <View className="flex-row items-center gap-3 mb-3">
            <IconSymbol name="heart.fill" size={32} color={colors.primary} />
            <Text
              className="text-xl font-bold text-foreground flex-1"
              style={{ lineHeight: 28 }}
            >
              Knowledge is Power
            </Text>
          </View>
          <Text
            className="text-base text-foreground"
            style={{ lineHeight: 24 }}
          >
            Understanding your health conditions helps you make informed decisions and live a healthier life.
          </Text>
        </View>

        {/* Health Condition Cards */}
        <View className="gap-4">
          {healthConditions.map((condition) => (
            <Pressable
              key={condition.id}
              onPress={() => router.push(`/health-docs/${condition.id}` as any)}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <View className="bg-surface rounded-3xl p-6 border border-border">
                <View className="flex-row items-start gap-4">
                  {/* Icon */}
                  <View
                    className="w-16 h-16 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: `${condition.color}20` }}
                  >
                    <IconSymbol
                      name={condition.icon as any}
                      size={32}
                      color={condition.color}
                    />
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    <Text
                      className="text-xl font-bold text-foreground mb-2"
                      style={{ lineHeight: 26 }}
                    >
                      {condition.name}
                    </Text>
                    <Text
                      className="text-base text-muted mb-3"
                      style={{ lineHeight: 22 }}
                    >
                      {condition.description}
                    </Text>
                    <View className="bg-background rounded-xl px-3 py-2">
                      <Text
                        className="text-sm text-muted"
                        style={{ lineHeight: 18 }}
                      >
                        📊 {condition.prevalence}
                      </Text>
                    </View>
                  </View>

                  {/* Arrow */}
                  <IconSymbol
                    name="chevron.right"
                    size={24}
                    color={colors.muted}
                  />
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Disclaimer */}
        <View className="bg-surface rounded-3xl p-6 mt-8 border border-border">
          <View className="flex-row items-start gap-3">
            <IconSymbol
              name="exclamationmark.triangle.fill"
              size={24}
              color={colors.warning}
            />
            <View className="flex-1">
              <Text
                className="text-base font-semibold text-foreground mb-2"
                style={{ lineHeight: 22 }}
              >
                Medical Disclaimer
              </Text>
              <Text
                className="text-sm text-muted"
                style={{ lineHeight: 20 }}
              >
                This information is for educational purposes only and is not a substitute for professional medical advice. Always consult your healthcare provider for diagnosis and treatment.
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Padding */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
