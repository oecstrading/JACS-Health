import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import CGMService, { type CGMReading, type CGMDeviceInfo } from "@/services/cgmService";

export default function CGMMonitorScreen() {
  const colors = useColors();
  const [latestReading, setLatestReading] = useState<CGMReading | null>(null);
  const [pairedDevices, setPairedDevices] = useState<CGMDeviceInfo[]>([]);
  const [timeInRange, setTimeInRange] = useState({
    veryLow: 0,
    low: 0,
    inRange: 0,
    high: 0,
    veryHigh: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
    
    // Subscribe to real-time updates
    const unsubscribe = CGMService.subscribe((reading) => {
      setLatestReading(reading);
    });
    
    return unsubscribe;
  }, []);

  const loadData = async () => {
    const devices = CGMService.getPairedDevices();
    setPairedDevices(devices);
    
    const reading = CGMService.getLatestReading();
    setLatestReading(reading);
    
    // Calculate time in range for last 24 hours
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 24);
    const tir = CGMService.calculateTimeInRange(startDate, endDate);
    setTimeInRange(tir);
  };

  const handleSync = async () => {
    if (pairedDevices.length === 0) {
      Alert.alert("No Device Paired", "Please pair a CGM device first.");
      return;
    }
    
    setIsLoading(true);
    try {
      await CGMService.syncGlucoseData(pairedDevices[0].device);
      await loadData();
      Alert.alert("Success", "Glucose data synced successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to sync glucose data.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendArrow = (trend: CGMReading["trend"]) => {
    switch (trend) {
      case "rising_fast":
        return "⇈";
      case "rising":
        return "↗";
      case "stable":
        return "→";
      case "falling":
        return "↘";
      case "falling_fast":
        return "⇊";
    }
  };

  const getGlucoseColor = (glucose: number) => {
    if (glucose < 54) return "#DC2626"; // Very low - red
    if (glucose < 70) return "#F59E0B"; // Low - orange
    if (glucose <= 180) return "#10B981"; // In range - green
    if (glucose <= 250) return "#F59E0B"; // High - orange
    return "#DC2626"; // Very high - red
  };

  const getGlucoseStatus = (glucose: number) => {
    if (glucose < 54) return "Very Low";
    if (glucose < 70) return "Low";
    if (glucose <= 180) return "In Range";
    if (glucose <= 250) return "High";
    return "Very High";
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">CGM Monitor</Text>
            <Text className="text-base text-muted mt-1">
              Real-time glucose monitoring
            </Text>
          </View>

          {/* Current Glucose Reading */}
          {latestReading ? (
            <View
              className="rounded-2xl p-6 items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-lg text-muted mb-2">Current Glucose</Text>
              <View className="flex-row items-center gap-3">
                <Text
                  className="text-6xl font-bold"
                  style={{ color: getGlucoseColor(latestReading.glucose) }}
                >
                  {latestReading.glucose}
                </Text>
                <View className="items-center">
                  <Text className="text-4xl">{getTrendArrow(latestReading.trend)}</Text>
                  <Text className="text-sm text-muted">mg/dL</Text>
                </View>
              </View>
              <Text
                className="text-lg font-semibold mt-3"
                style={{ color: getGlucoseColor(latestReading.glucose) }}
              >
                {getGlucoseStatus(latestReading.glucose)}
              </Text>
              <Text className="text-sm text-muted mt-2">
                Last updated: {latestReading.timestamp.toLocaleTimeString()}
              </Text>
            </View>
          ) : (
            <View
              className="rounded-2xl p-8 items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-lg text-muted text-center">
                No glucose readings yet.{"\n"}Pair a device and sync to get started.
              </Text>
            </View>
          )}

          {/* Time in Range (Last 24h) */}
          <View
            className="rounded-2xl p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-xl font-bold text-foreground mb-4">
              Time in Range (24h)
            </Text>
            
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-foreground">Very Low (&lt;54)</Text>
                <Text className="text-base font-semibold" style={{ color: "#DC2626" }}>
                  {timeInRange.veryLow.toFixed(1)}%
                </Text>
              </View>
              
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-foreground">Low (54-69)</Text>
                <Text className="text-base font-semibold" style={{ color: "#F59E0B" }}>
                  {timeInRange.low.toFixed(1)}%
                </Text>
              </View>
              
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-foreground">In Range (70-180)</Text>
                <Text className="text-base font-semibold" style={{ color: "#10B981" }}>
                  {timeInRange.inRange.toFixed(1)}%
                </Text>
              </View>
              
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-foreground">High (181-250)</Text>
                <Text className="text-base font-semibold" style={{ color: "#F59E0B" }}>
                  {timeInRange.high.toFixed(1)}%
                </Text>
              </View>
              
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-foreground">Very High (&gt;250)</Text>
                <Text className="text-base font-semibold" style={{ color: "#DC2626" }}>
                  {timeInRange.veryHigh.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Paired Devices */}
          <View
            className="rounded-2xl p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-xl font-bold text-foreground mb-4">
              Paired Devices
            </Text>
            
            {pairedDevices.length > 0 ? (
              <View className="gap-3">
                {pairedDevices.map((device) => (
                  <View
                    key={device.id}
                    className="flex-row items-center justify-between p-4 rounded-xl"
                    style={{ backgroundColor: colors.background }}
                  >
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {device.name}
                      </Text>
                      <Text className="text-sm text-muted">
                        {device.device.replace("_", " ").toUpperCase()}
                      </Text>
                      {device.lastSync && (
                        <Text className="text-xs text-muted mt-1">
                          Last sync: {device.lastSync.toLocaleString()}
                        </Text>
                      )}
                    </View>
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: device.isPaired ? "#10B981" : "#9CA3AF" }}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-base text-muted text-center">
                No devices paired yet
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleSync}
              disabled={isLoading}
              className="rounded-full p-4 items-center"
              style={{ backgroundColor: colors.primary, opacity: isLoading ? 0.6 : 1 }}
            >
              <Text className="text-lg font-semibold text-white">
                {isLoading ? "Syncing..." : "Sync Glucose Data"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => Alert.alert("Coming Soon", "Device & Alert Settings will be available soon.")}
              className="rounded-full p-4 items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-lg font-semibold" style={{ color: colors.primary }}>
                Device & Alert Settings
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => Alert.alert("Coming Soon", "History & Reports will be available soon.")}
              className="rounded-full p-4 items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-lg font-semibold" style={{ color: colors.primary }}>
                View History & Reports
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
