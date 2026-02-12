import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function HospiceComplianceTrackerScreen() {
  const colors = useColors();

  return (
    <ScreenContainer className="p-6">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.primary} />
      </TouchableOpacity>

      <View className="flex-1 items-center justify-center">
        <View
          className="mb-6 h-24 w-24 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.primary + "20" }}
        >
          <IconSymbol name="checkmark.shield.fill" size={48} color={colors.primary} />
        </View>

        <Text className="mb-2 text-center text-3xl font-bold text-foreground">
          Hospice Compliance Tracker
        </Text>
        <Text className="mb-8 text-center text-base text-muted">
          Track compliance metrics and regulatory requirements
        </Text>

        <View className="w-full max-w-md rounded-2xl border border-border bg-surface p-6">
          <Text className="text-center text-lg font-semibold text-foreground">
            Coming Soon
          </Text>
          <Text className="mt-2 text-center text-sm text-muted">
            This feature is under development and will be available in a future update.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
