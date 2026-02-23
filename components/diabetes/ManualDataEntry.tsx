import { View, Text } from "react-native";
import { Edit3 } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";

/**
 * Manual Data Entry
 * 
 * Comprehensive data logging for glucose, insulin, carbs, etc.
 * Full implementation coming in next phase
 */
export function ManualDataEntry() {
  const colors = useColors();

  return (
    <View className="bg-surface border border-border rounded-xl p-6">
      <View className="flex-row items-center gap-2 mb-3">
        <Edit3 size={24} color={colors.primary} />
        <Text className="text-lg font-semibold text-foreground">
          Manual Data Entry
        </Text>
      </View>
      <Text className="text-sm text-muted leading-relaxed">
        Log glucose, insulin, carbs, exercise, and more. Filter and view your complete diabetes data history.
      </Text>
      <View className="mt-4 bg-primary/10 rounded-lg p-3">
        <Text className="text-xs text-primary text-center">
          Feature coming soon
        </Text>
      </View>
    </View>
  );
}
