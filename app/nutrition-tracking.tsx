import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function NutritionTrackingScreen() {
  const colors = useColors();

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="mb-6 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.surface }}
          >
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-foreground">Nutrition Tracking</Text>
        </View>

        <View className="mb-6 rounded-xl bg-surface p-4">
          <Text className="text-base leading-relaxed text-foreground">
            Log meals, track calories, and monitor macronutrients. Set dietary goals and receive nutritional insights.
          </Text>
        </View>

        <View className="items-center justify-center rounded-xl bg-primary/10 p-8">
          <Text className="mb-2 text-center text-xl font-bold text-primary">
            Coming Soon
          </Text>
          <Text className="text-center text-base text-muted">
            This feature is currently in development and will be available in a future update.
          </Text>
        </View>

        <View className="mt-6 space-y-4">
          <View className="rounded-xl border border-border bg-surface p-4">
            <Text className="mb-2 text-lg font-semibold text-foreground">Key Benefits</Text>
            <Text className="text-base text-muted">
              • Comprehensive tracking and monitoring{"\n"}
              • Real-time alerts and notifications{"\n"}
              • Easy-to-use interface{"\n"}
              • Secure data storage
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
