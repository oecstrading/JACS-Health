import { Pressable } from "react-native";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface BackButtonProps {
  onPress?: () => void;
}

/**
 * Reusable Back Button Component
 * 
 * Displays a chevron.left icon that navigates back by default.
 * Can accept custom onPress handler.
 */
export function BackButton({ onPress }: BackButtonProps) {
  const colors = useColors();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.6 : 1,
        marginBottom: 16,
      })}
    >
      <IconSymbol name="chevron.left" size={28} color={colors.foreground} />
    </Pressable>
  );
}
