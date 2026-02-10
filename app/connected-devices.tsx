import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { getDeviceStatus, syncAllHealthData, getLastSyncTime, DeviceStatus } from "@/lib/device-sync";

/**
 * Connected Devices Screen
 *
 * Shows real-time sync status for Omron 3550, Samsung Watch 7, and iHome Scale
 * with manual sync buttons and last-sync timestamps.
 */

export default function ConnectedDevicesScreen() {
  const colors = useColors();
  const [devices, setDevices] = useState<Record<string, DeviceStatus>>({});
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncingDevice, setSyncingDevice] = useState<string | null>(null);

  useEffect(() => {
    loadDeviceStatus();
  }, []);

  const loadDeviceStatus = async () => {
    const status = await getDeviceStatus();
    setDevices(status);
    const lastSyncTime = await getLastSyncTime();
    setLastSync(lastSyncTime);
  };

  const handleSyncAll = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSyncing(true);
    try {
      await syncAllHealthData();
      await loadDeviceStatus();
      Alert.alert("Sync Complete", "All devices synced successfully!");
    } catch (error) {
      Alert.alert("Sync Error", "Failed to sync devices. Please try again.");
      console.error("[ConnectedDevices] Sync error:", error);
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncDevice = async (deviceKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSyncingDevice(deviceKey);
    try {
      // In a real implementation, you would sync only the specific device
      await syncAllHealthData();
      await loadDeviceStatus();
      Alert.alert("Sync Complete", `${devices[deviceKey].deviceName} synced successfully!`);
    } catch (error) {
      Alert.alert("Sync Error", `Failed to sync ${devices[deviceKey].deviceName}.`);
      console.error(`[ConnectedDevices] Sync error for ${deviceKey}:`, error);
    } finally {
      setSyncingDevice(null);
    }
  };

  const getRelativeTime = (timestamp: string | null): string => {
    if (!timestamp) return "Never";
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "connected":
        return colors.success;
      case "syncing":
        return colors.warning;
      case "disconnected":
      default:
        return colors.error;
    }
  };

  const getDeviceIcon = (deviceKey: string): string => {
    switch (deviceKey) {
      case "omron":
        return "🩺";
      case "samsung":
        return "⌚";
      case "ihome":
        return "⚖️";
      default:
        return "📱";
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="mb-6">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={{ marginBottom: 16 }}
          >
            <IconSymbol name="chevron.left" size={28} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground mb-2">Connected Devices</Text>
          <Text className="text-base text-muted">
            Manage your health device connections and sync status
          </Text>
        </View>

        {/* Last Sync Info */}
        <View
          className="mb-6 p-4 rounded-xl"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <Text className="text-sm text-muted mb-1">Last Sync</Text>
          <Text className="text-lg font-semibold text-foreground">
            {getRelativeTime(lastSync)}
          </Text>
        </View>

        {/* Sync All Button */}
        <TouchableOpacity
          onPress={handleSyncAll}
          disabled={syncing}
          className="mb-6 p-4 rounded-xl flex-row items-center justify-center"
          style={{
            backgroundColor: colors.primary,
            opacity: syncing ? 0.6 : 1,
          }}
        >
          {syncing ? (
            <>
              <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
              <Text className="text-lg font-semibold text-white">Syncing All Devices...</Text>
            </>
          ) : (
            <>
              <Text className="text-lg font-semibold text-white mr-2">Sync All Devices</Text>
              <Text className="text-2xl">🔄</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Device List */}
        <View className="gap-4">
          {Object.entries(devices).map(([key, device]) => (
            <View
              key={key}
              className="p-4 rounded-xl"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            >
              {/* Device Header */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <Text className="text-3xl mr-3">{getDeviceIcon(key)}</Text>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">
                      {device.deviceName}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <View
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: getStatusColor(device.status) }}
                      />
                      <Text className="text-sm text-muted capitalize">{device.status}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Device Stats */}
              <View className="flex-row justify-between mb-3">
                <View>
                  <Text className="text-xs text-muted mb-1">Last Sync</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {getRelativeTime(device.lastSyncTime)}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-muted mb-1">Data Points</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {device.dataCount}
                  </Text>
                </View>
              </View>

              {/* Manual Sync Button */}
              <TouchableOpacity
                onPress={() => handleSyncDevice(key)}
                disabled={syncingDevice === key}
                className="p-3 rounded-lg flex-row items-center justify-center"
                style={{
                  backgroundColor: colors.primary,
                  opacity: syncingDevice === key ? 0.6 : 1,
                }}
              >
                {syncingDevice === key ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                    <Text className="text-sm font-semibold text-white">Syncing...</Text>
                  </>
                ) : (
                  <Text className="text-sm font-semibold text-white">Sync Now</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Help Text */}
        <View className="mt-6 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
          <Text className="text-sm text-muted leading-relaxed">
            💡 <Text className="font-semibold">Tip:</Text> HealthMate automatically syncs your devices every 15 minutes. 
            Manual sync is useful when you want to see the latest readings immediately.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
