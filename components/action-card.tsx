import { Pressable, Text, View, type ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { cn } from "@/lib/utils";
import { useColors } from "@/hooks/use-colors";

interface ActionCardProps {
  title: string;
  icon: React.ComponentProps<typeof IconSymbol>["name"];
  onPress: () => void;
  color?: "primary" | "success" | "warning" | "error";
  className?: string;
}

/**
 * Large, senior-friendly action card with icon and text.
 * Designed for easy tapping with large touch targets and clear visual feedback.
 */
export function ActionCard({ title, icon, onPress, color = "primary", className }: ActionCardProps) {
  const colors = useColors();

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const colorMap = {
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  };

  const iconColor = colorMap[color];

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        {
          transform: [{ scale: pressed ? 0.97 : 1 }],
          opacity: pressed ? 0.9 : 1,
        } as ViewStyle,
      ]}
      className={cn("w-full", className)}
    >
      <View className="bg-surface rounded-3xl p-6 border border-border shadow-sm">
        <View className="flex-row items-center gap-4">
          <View
            className="w-16 h-16 rounded-2xl items-center justify-center"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <IconSymbol name={icon} size={32} color={iconColor} />
          </View>
          <Text className="text-2xl font-semibold text-foreground flex-1" style={{ lineHeight: 32 }}>
            {title}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
