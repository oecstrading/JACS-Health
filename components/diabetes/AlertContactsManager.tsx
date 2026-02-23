import { View, Text } from "react-native";
import { Bell } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";

/**
 * Alert Contacts Manager
 * 
 * Manages emergency contacts who receive glucose alerts
 * Full implementation coming in next phase
 */
export function AlertContactsManager() {
  const colors = useColors();

  return (
    <View className="bg-surface border border-border rounded-xl p-6">
      <View className="flex-row items-center gap-2 mb-3">
        <Bell size={24} color={colors.primary} />
        <Text className="text-lg font-semibold text-foreground">
          Alert Contacts
        </Text>
      </View>
      <Text className="text-sm text-muted leading-relaxed">
        Add family members, caregivers, or friends who should receive alerts when your glucose goes out of range.
      </Text>
      <View className="mt-4 bg-primary/10 rounded-lg p-3">
        <Text className="text-xs text-primary text-center">
          Feature coming soon
        </Text>
      </View>
    </View>
  );
}
