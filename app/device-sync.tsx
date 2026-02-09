import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import DeviceSyncService, {
  type DeviceInfo,
  type DeviceReading,
  type StatisticsPeriod,
} from "@/services/deviceSyncService";

export default function DeviceSyncScreen() {
  const colors = useColors();
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [readings, setReadings] = useState<DeviceReading[]>([]);
  const [statistics, setStatistics] = useState<StatisticsPeriod[]>([]);
  const [statsPeriod, setStatsPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [syncing, setSyncing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      loadReadings(selectedDevice);
      loadStatistics(selectedDevice, statsPeriod);
    }
  }, [selectedDevice, statsPeriod]);

  const loadDevices = async () => {
    try {
      const devs = await DeviceSyncService.getConnectedDevices();
      setDevices(devs);
      if (devs.length > 0 && !selectedDevice) {
        setSelectedDevice(devs[0].id);
      }
    } catch (error) {
      console.error("Error loading devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadReadings = async (deviceId: string) => {
    try {
      const rds = await DeviceSyncService.getReadings({ deviceId });
      setReadings(rds.slice(0, 50)); // Show last 50 readings
    } catch (error) {
      console.error("Error loading readings:", error);
    }
  };

  const loadStatistics = async (deviceId: string, period: "daily" | "weekly" | "monthly") => {
    try {
      const stats = await DeviceSyncService.calculateStatistics(deviceId, period);
      setStatistics(stats.slice(0, 10)); // Show last 10 periods
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const handleManualSync = async (deviceId: string) => {
    setSyncing(deviceId);
    try {
      const result = await DeviceSyncService.manualSync(deviceId);
      if (result.success) {
        Alert.alert(
          "Sync Complete",
          `Successfully synced ${result.readingsCount} new readings from device.`
        );
        await loadDevices();
        if (selectedDevice === deviceId) {
          await loadReadings(deviceId);
          await loadStatistics(deviceId, statsPeriod);
        }
      } else {
        Alert.alert("Sync Failed", result.error || "Unknown error occurred");
      }
    } catch (error: any) {
      Alert.alert("Sync Error", error.message);
    } finally {
      setSyncing(null);
    }
  };

  const handleToggleAutoSync = async (deviceId: string, enabled: boolean) => {
    try {
      await DeviceSyncService.toggleAutoSync(deviceId, enabled);
      await loadDevices();
    } catch (error) {
      console.error("Error toggling auto-sync:", error);
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const formatValue = (reading: DeviceReading) => {
    if (reading.metadata?.systolic && reading.metadata?.diastolic) {
      return `${Math.round(reading.metadata.systolic)}/${Math.round(reading.metadata.diastolic)} mmHg`;
    }
    return `${Math.round(reading.value * 10) / 10} ${reading.unit}`;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "improving") return "📈";
    if (trend === "declining") return "📉";
    return "➡️";
  };

  if (loading) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-base text-muted mt-4">Loading devices...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">Device Sync</Text>
            <Text className="text-base text-muted mt-1">
              Manage connected medical devices
            </Text>
          </View>

          {/* Device Selector */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">Connected Devices</Text>
            <View className="gap-3">
              {devices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  onPress={() => setSelectedDevice(device.id)}
                  className="rounded-2xl p-5"
                  style={{
                    backgroundColor:
                      selectedDevice === device.id ? colors.primary : colors.surface,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1">
                      <Text
                        className="text-lg font-bold"
                        style={{
                          color: selectedDevice === device.id ? "#fff" : colors.foreground,
                        }}
                      >
                        {device.name}
                      </Text>
                      <Text
                        className="text-sm mt-1"
                        style={{
                          color: selectedDevice === device.id ? "#fff" : colors.muted,
                        }}
                      >
                        {device.connectionStatus === "connected" ? "🟢 Connected" : "🔴 Disconnected"}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text
                        className="text-xs"
                        style={{
                          color: selectedDevice === device.id ? "#fff" : colors.muted,
                        }}
                      >
                        {device.lastSyncTime
                          ? `Last sync: ${formatTimestamp(device.lastSyncTime)}`
                          : "Never synced"}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      onPress={() => handleManualSync(device.id)}
                      disabled={syncing === device.id}
                      className="flex-1 rounded-full p-3 items-center"
                      style={{
                        backgroundColor:
                          selectedDevice === device.id ? "#fff" : colors.primary,
                      }}
                    >
                      {syncing === device.id ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Text
                          className="text-sm font-semibold"
                          style={{
                            color: selectedDevice === device.id ? colors.primary : "#fff",
                          }}
                        >
                          Sync Now
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleToggleAutoSync(device.id, !device.autoSyncEnabled)}
                      className="rounded-full p-3 px-4"
                      style={{
                        backgroundColor:
                          selectedDevice === device.id
                            ? device.autoSyncEnabled
                              ? "#fff"
                              : "rgba(255,255,255,0.3)"
                            : device.autoSyncEnabled
                            ? colors.success
                            : colors.border,
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{
                          color:
                            selectedDevice === device.id
                              ? colors.primary
                              : device.autoSyncEnabled
                              ? "#fff"
                              : colors.muted,
                        }}
                      >
                        Auto: {device.autoSyncEnabled ? "ON" : "OFF"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Statistics */}
          {selectedDevice && statistics.length > 0 && (
            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-semibold text-foreground">Statistics</Text>
                <View className="flex-row gap-2">
                  {(["daily", "weekly", "monthly"] as const).map((period) => (
                    <TouchableOpacity
                      key={period}
                      onPress={() => setStatsPeriod(period)}
                      className="rounded-full px-4 py-2"
                      style={{
                        backgroundColor:
                          statsPeriod === period ? colors.primary : colors.surface,
                      }}
                    >
                      <Text
                        className="text-xs font-semibold capitalize"
                        style={{
                          color: statsPeriod === period ? "#fff" : colors.foreground,
                        }}
                      >
                        {period}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="gap-3">
                {statistics.map((stat, index) => (
                  <View
                    key={index}
                    className="rounded-2xl p-5"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-base font-bold text-foreground">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                        }).format(stat.startDate)}
                        {" - "}
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                        }).format(stat.endDate)}
                      </Text>
                      <Text className="text-lg">{getTrendIcon(stat.trend)}</Text>
                    </View>

                    <View className="flex-row flex-wrap gap-4">
                      <View>
                        <Text className="text-xs text-muted">Average</Text>
                        <Text className="text-xl font-bold text-foreground">
                          {stat.average}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-xs text-muted">Min</Text>
                        <Text className="text-lg font-semibold text-foreground">{stat.min}</Text>
                      </View>
                      <View>
                        <Text className="text-xs text-muted">Max</Text>
                        <Text className="text-lg font-semibold text-foreground">{stat.max}</Text>
                      </View>
                      <View>
                        <Text className="text-xs text-muted">Readings</Text>
                        <Text className="text-lg font-semibold text-foreground">
                          {stat.count}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reading History */}
          {selectedDevice && readings.length > 0 && (
            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-semibold text-foreground">
                  Reading History ({readings.length})
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/device-report" as any)}
                  className="rounded-full px-4 py-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-xs font-semibold text-white">Export PDF</Text>
                </TouchableOpacity>
              </View>

              <View className="gap-2">
                {readings.map((reading) => (
                  <View
                    key={reading.id}
                    className="rounded-xl p-4"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-bold text-foreground">
                          {formatValue(reading)}
                        </Text>
                        <Text className="text-xs text-muted mt-1">
                          {formatTimestamp(reading.timestamp)}
                        </Text>
                      </View>
                      {reading.metadata?.pulse && (
                        <View className="items-end">
                          <Text className="text-sm text-muted">Pulse</Text>
                          <Text className="text-base font-semibold text-foreground">
                            {Math.round(reading.metadata.pulse)} bpm
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Empty State */}
          {devices.length === 0 && (
            <View
              className="rounded-2xl p-8 items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-6xl mb-4">📱</Text>
              <Text className="text-xl font-bold text-foreground mb-2">No Devices Connected</Text>
              <Text className="text-base text-muted text-center">
                Connect your medical devices to start syncing health data
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
