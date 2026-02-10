import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function DevicesScreen() {
  const colors = useColors();

  const devices = [
    {
      title: "Bluetooth Devices",
      description: "Pair Omron 3550, Samsung Watch 7, iHome scale",
      icon: "antenna.radiowaves.left.and.right" as const,
      route: "/bluetooth-devices",
      color: colors.primary,
    },
  ];

  return (
    <ScreenContainer className="px-4 pt-4">
      <ScrollView>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
            Devices
          </Text>
          <Text className="text-base text-muted mt-1">
            Manage your connected health devices
          </Text>
        </View>

        {/* Device Cards */}
        <View className="gap-4 pb-8">
          {devices.map((device, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(device.route as any)}
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
                    backgroundColor: `${device.color}20`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconSymbol name={device.icon} size={28} color={device.color} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-xl font-semibold text-foreground mb-1"
                    style={{ lineHeight: 28 }}
                  >
                    {device.title}
                  </Text>
                  <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
                    {device.description}
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
