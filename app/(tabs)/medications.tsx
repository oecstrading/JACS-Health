import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function MedicationsScreen() {
  const colors = useColors();

  const medicationFeatures = [
    {
      title: "Log Medication",
      description: "Record when you take your medications",
      icon: "pills.fill" as const,
      route: "/medication-log",
      color: colors.success,
    },
    {
      title: "Medication Tracker",
      description: "View adherence rates and correlations with vitals",
      icon: "chart.bar.fill" as const,
      route: "/medication-tracker",
      color: colors.primary,
    },
  ];

  return (
    <ScreenContainer className="px-4 pt-4">
      <ScrollView>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
            Medications
          </Text>
          <Text className="text-base text-muted mt-1">
            Track and manage your medications
          </Text>
        </View>

        {/* Medication Feature Cards */}
        <View className="gap-4 pb-8">
          {medicationFeatures.map((feature, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                router.push(feature.route as any);
              }}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-4">
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: `${feature.color}20`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconSymbol name={feature.icon} size={28} color={feature.color} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-xl font-semibold text-foreground mb-1"
                    style={{ lineHeight: 28 }}
                  >
                    {feature.title}
                  </Text>
                  <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
                    {feature.description}
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={24} color={colors.muted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
