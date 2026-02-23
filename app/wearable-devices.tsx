import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Watch, Activity, Heart, Moon, Flame, TrendingUp } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export default function WearableDevicesScreen() {
  const colors = useColors();

  const devices = [
    { type: "fitbit", name: "Fitbit Charge 5", connected: true, lastSync: "2 min ago" },
    { type: "apple_watch", name: "Apple Watch Series 9", connected: false, lastSync: "Never" },
    { type: "garmin", name: "Garmin Forerunner 255", connected: false, lastSync: "Never" },
  ];

  const todaysData = {
    steps: 8542,
    stepsGoal: 10000,
    heartRate: 72,
    sleep: 7.5,
    sleepGoal: 8,
    calories: 2150,
    caloriesGoal: 2400,
    exercise: 45,
    exerciseGoal: 60,
  };

  const handleConnectDevice = (deviceType: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Connect Device",
      `Connect your ${deviceType} account to sync health data automatically.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Connect", onPress: () => Alert.alert("Success", "Device connected!") },
      ]
    );
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "fitbit": return "⌚";
      case "apple_watch": return "";
      case "garmin": return "🏃";
      default: return "📱";
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="p-6 pb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Watch size={28} color={colors.primary} />
            <Text className="text-2xl font-bold text-foreground">Wearable Devices</Text>
          </View>
          <Text className="text-base text-muted">Connect fitness trackers and smartwatches</Text>
        </View>

        {/* Today's Activity Summary */}
        <View className="px-6 pb-6">
          <View className="bg-primary/10 border-2 border-primary rounded-xl p-6">
            <Text className="text-sm font-semibold text-primary mb-4">TODAY'S ACTIVITY</Text>
            <View className="gap-4">
              {/* Steps */}
              <View>
                <View className="flex-row items-center justify-between mb-1">
                  <View className="flex-row items-center gap-2">
                    <Activity size={16} color={colors.muted} />
                    <Text className="text-sm text-muted">Steps</Text>
                  </View>
                  <Text className="text-sm font-semibold text-foreground">
                    {todaysData.steps.toLocaleString()} / {todaysData.stepsGoal.toLocaleString()}
                  </Text>
                </View>
                <View className="bg-muted/20 rounded-full h-2">
                  <View
                    style={{ width: `${(todaysData.steps / todaysData.stepsGoal) * 100}%`, backgroundColor: colors.success }}
                    className="h-2 rounded-full"
                  />
                </View>
              </View>

              {/* Heart Rate */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Heart size={16} color={colors.error} />
                  <Text className="text-sm text-muted">Heart Rate</Text>
                </View>
                <Text className="text-lg font-bold text-foreground">{todaysData.heartRate} bpm</Text>
              </View>

              {/* Sleep */}
              <View>
                <View className="flex-row items-center justify-between mb-1">
                  <View className="flex-row items-center gap-2">
                    <Moon size={16} color={colors.muted} />
                    <Text className="text-sm text-muted">Sleep</Text>
                  </View>
                  <Text className="text-sm font-semibold text-foreground">
                    {todaysData.sleep}h / {todaysData.sleepGoal}h
                  </Text>
                </View>
                <View className="bg-muted/20 rounded-full h-2">
                  <View
                    style={{ width: `${(todaysData.sleep / todaysData.sleepGoal) * 100}%`, backgroundColor: colors.primary }}
                    className="h-2 rounded-full"
                  />
                </View>
              </View>

              {/* Calories */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Flame size={16} color={colors.warning} />
                  <Text className="text-sm text-muted">Calories Burned</Text>
                </View>
                <Text className="text-lg font-bold text-foreground">{todaysData.calories} kcal</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Connected Devices */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">My Devices</Text>
          {devices.map((device, i) => (
            <View key={i} className="bg-surface border border-border rounded-xl p-4 mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-2xl">{getDeviceIcon(device.type)}</Text>
                    <Text className="text-base font-semibold text-foreground">{device.name}</Text>
                  </View>
                  <Text className="text-xs text-muted">Last sync: {device.lastSync}</Text>
                </View>
                {device.connected ? (
                  <View className="bg-success/20 px-3 py-1 rounded-full">
                    <Text className="text-xs font-semibold text-success">Connected</Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => handleConnectDevice(device.name)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className="bg-primary px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white font-semibold text-sm">Connect</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Weekly Trends */}
        <View className="px-6 pb-6">
          <View className="bg-surface border border-border rounded-xl p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <TrendingUp size={20} color={colors.primary} />
              <Text className="text-base font-semibold text-foreground">7-Day Average</Text>
            </View>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-foreground">Daily steps</Text>
                <Text className="text-sm font-semibold text-primary">9,245</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-foreground">Resting heart rate</Text>
                <Text className="text-sm font-semibold text-primary">68 bpm</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-foreground">Sleep duration</Text>
                <Text className="text-sm font-semibold text-primary">7.2 hours</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-foreground">Active minutes</Text>
                <Text className="text-sm font-semibold text-primary">52 min/day</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
