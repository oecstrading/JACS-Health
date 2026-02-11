import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

/**
 * Devices Tab - Consolidated Device Management
 * 
 * All connected health devices in one place with pairing flows.
 * Devices: Omron BP Monitor, Samsung Watch, iHome Scale, Dexcom G7 CGM, Omnipod 5 Insulin Pump
 */

type DeviceStatus = "connected" | "disconnected" | "pairing";

interface Device {
  id: string;
  name: string;
  type: string;
  icon: string;
  status: DeviceStatus;
  lastSync?: string;
  batteryLevel?: number;
}

interface DiscoveredDevice {
  id: string;
  name: string;
  rssi: number; // Signal strength
}

export default function DevicesScreen() {
  const router = useRouter();
  const colors = useColors();
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([]);
  
  const [devices, setDevices] = useState<Device[]>([
    {
      id: "omron-3550",
      name: "Omron 3550 BP Monitor",
      type: "Blood Pressure",
      icon: "❤️",
      status: "disconnected",
    },
    {
      id: "samsung-watch-7",
      name: "Samsung Galaxy Watch 7",
      type: "Heart Rate & Activity",
      icon: "⌚",
      status: "disconnected",
    },
    {
      id: "ihome-scale",
      name: "iHome Smart Scale",
      type: "Weight & BMI",
      icon: "⚖️",
      status: "disconnected",
    },
    {
      id: "dexcom-g7",
      name: "Dexcom G7 CGM",
      type: "Continuous Glucose Monitor",
      icon: "🩸",
      status: "disconnected",
    },
    {
      id: "omnipod-5",
      name: "Omnipod 5 Insulin Pump",
      type: "Insulin Delivery",
      icon: "💉",
      status: "disconnected",
    },
  ]);

  useEffect(() => {
    loadDeviceStatuses();
  }, []);

  const loadDeviceStatuses = async () => {
    try {
      const savedStatuses = await AsyncStorage.getItem("device_statuses");
      if (savedStatuses) {
        const statuses = JSON.parse(savedStatuses);
        setDevices((prevDevices) =>
          prevDevices.map((device) => ({
            ...device,
            status: statuses[device.id]?.status || "disconnected",
            lastSync: statuses[device.id]?.lastSync,
            batteryLevel: statuses[device.id]?.batteryLevel,
          }))
        );
      }
    } catch (error) {
      console.error("[Devices] Error loading device statuses:", error);
    }
  };

  const saveDeviceStatus = async (deviceId: string, status: DeviceStatus) => {
    try {
      const savedStatuses = await AsyncStorage.getItem("device_statuses");
      const statuses = savedStatuses ? JSON.parse(savedStatuses) : {};
      
      statuses[deviceId] = {
        status,
        lastSync: status === "connected" ? new Date().toISOString() : undefined,
        batteryLevel: status === "connected" ? 85 : undefined,
      };

      await AsyncStorage.setItem("device_statuses", JSON.stringify(statuses));
      
      setDevices((prevDevices) =>
        prevDevices.map((device) =>
          device.id === deviceId
            ? { ...device, status, lastSync: statuses[deviceId].lastSync, batteryLevel: statuses[deviceId].batteryLevel }
            : device
        )
      );
    } catch (error) {
      console.error("[Devices] Error saving device status:", error);
    }
  };

  const handlePairDevice = (device: Device) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      `Pair ${device.name}`,
      `Would you like to pair your ${device.name}?\n\n1. Turn on Bluetooth on your device\n2. Enable pairing mode\n3. Follow the on-screen instructions`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start Pairing",
          onPress: () => {
            // Simulate pairing for demo
            saveDeviceStatus(device.id, "connected");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Success", `${device.name} connected successfully!`);
          },
        },
      ]
    );
  };

  const handleDisconnectDevice = (device: Device) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      `Disconnect ${device.name}`,
      `Are you sure you want to disconnect this device?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            await saveDeviceStatus(device.id, "disconnected");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const getStatusColor = (status: DeviceStatus) => {
    switch (status) {
      case "connected":
        return colors.success;
      case "pairing":
        return colors.warning;
      case "disconnected":
        return colors.muted;
    }
  };

  const getStatusText = (status: DeviceStatus) => {
    switch (status) {
      case "connected":
        return "Connected";
      case "pairing":
        return "Pairing...";
      case "disconnected":
        return "Not Connected";
    }
  };

  const getTimeAgo = (timestamp?: string) => {
    if (!timestamp) return "Never";
    
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleScanDevices = async () => {
    setIsScanning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate Bluetooth scanning (in production, use actual Bluetooth API)
    setTimeout(() => {
      const mockDiscovered: DiscoveredDevice[] = [
        { id: "omron-3550-nearby", name: "Omron 3550 (Nearby)", rssi: -45 },
        { id: "samsung-watch-7-nearby", name: "Galaxy Watch 7", rssi: -52 },
        { id: "dexcom-g7-nearby", name: "Dexcom G7 Sensor", rssi: -38 },
      ];
      
      setDiscoveredDevices(mockDiscovered);
      setIsScanning(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (mockDiscovered.length === 0) {
        Alert.alert(
          "No Devices Found",
          "No nearby health devices detected. Make sure your devices are powered on and in pairing mode."
        );
      }
    }, 3000); // 3 second scan
  };

  const handlePairDiscoveredDevice = (discoveredDevice: DiscoveredDevice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Find matching device in our device list
    const matchingDevice = devices.find((d) => 
      discoveredDevice.name.toLowerCase().includes(d.id.split("-")[0])
    );
    
    if (matchingDevice) {
      Alert.alert(
        `Pair ${discoveredDevice.name}?`,
        `Connect to this device?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Pair",
            onPress: async () => {
              await saveDeviceStatus(matchingDevice.id, "connected");
              setDiscoveredDevices([]);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Success", `${discoveredDevice.name} connected successfully!`);
            },
          },
        ]
      );
    }
  };

  const getSignalStrength = (rssi: number) => {
    if (rssi > -50) return "Excellent";
    if (rssi > -60) return "Good";
    if (rssi > -70) return "Fair";
    return "Weak";
  };

  const connectedCount = devices.filter((d) => d.status === "connected").length;

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          My Devices
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          {connectedCount} of {devices.length} devices connected
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Scan for Devices Button */}
        <Pressable
          onPress={handleScanDevices}
          disabled={isScanning}
          style={({ pressed }) => ({
            backgroundColor: isScanning ? colors.muted : colors.primary,
            borderRadius: 20,
            padding: 20,
            marginBottom: 24,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View className="flex-row items-center justify-center gap-3">
            {isScanning ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text className="text-lg font-bold text-white" style={{ lineHeight: 26 }}>
                  Scanning for devices...
                </Text>
              </>
            ) : (
              <>
                <IconSymbol name="antenna.radiowaves.left.and.right" size={24} color="#ffffff" />
                <Text className="text-lg font-bold text-white" style={{ lineHeight: 26 }}>
                  Scan for Nearby Devices
                </Text>
              </>
            )}
          </View>
        </Pressable>

        {/* Discovered Devices */}
        {discoveredDevices.length > 0 && (
          <View className="mb-6">
            <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
              Nearby Devices ({discoveredDevices.length})
            </Text>
            <View className="gap-4">
              {discoveredDevices.map((discovered) => (
                <View
                  key={discovered.id}
                  className="bg-surface rounded-3xl p-6 border border-border"
                >
                  <View className="flex-row items-center gap-4">
                    <View
                      className="w-14 h-14 rounded-2xl items-center justify-center"
                      style={{ backgroundColor: `${colors.success}20` }}
                    >
                      <IconSymbol name="antenna.radiowaves.left.and.right" size={28} color={colors.success} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-foreground" style={{ lineHeight: 26 }}>
                        {discovered.name}
                      </Text>
                      <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
                        Signal: {getSignalStrength(discovered.rssi)}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handlePairDiscoveredDevice(discovered)}
                      style={({ pressed }) => ({
                        backgroundColor: colors.primary,
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 12,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text className="text-base font-bold text-white" style={{ lineHeight: 22 }}>
                        Pair
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Connected Devices Summary */}
        {connectedCount > 0 && (
          <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
            <View className="flex-row items-center gap-3 mb-3">
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <IconSymbol name="checkmark.circle.fill" size={28} color={colors.success} />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                  All Systems Active
                </Text>
                <Text className="text-base text-muted" style={{ lineHeight: 22 }}>
                  Your devices are syncing data
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Device List */}
        <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
          Available Devices
        </Text>

        <View className="gap-4 pb-8">
          {devices.map((device) => (
            <View
              key={device.id}
              className="bg-surface rounded-3xl p-6 border border-border"
            >
              {/* Device Header */}
              <View className="flex-row items-center gap-4 mb-4">
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: `${colors.primary}10` }}
                >
                  <Text style={{ fontSize: 32 }}>{device.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                    {device.name}
                  </Text>
                  <Text className="text-base text-muted" style={{ lineHeight: 22 }}>
                    {device.type}
                  </Text>
                </View>
              </View>

              {/* Device Status */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <View
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getStatusColor(device.status) }}
                  />
                  <Text
                    className="text-base font-semibold"
                    style={{ color: getStatusColor(device.status), lineHeight: 22 }}
                  >
                    {getStatusText(device.status)}
                  </Text>
                </View>
                {device.status === "connected" && device.batteryLevel && (
                  <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
                    Battery: {device.batteryLevel}%
                  </Text>
                )}
              </View>

              {/* Last Sync */}
              {device.status === "connected" && (
                <Text className="text-sm text-muted mb-4" style={{ lineHeight: 20 }}>
                  Last synced: {getTimeAgo(device.lastSync)}
                </Text>
              )}

              {/* Action Button */}
              {device.status === "disconnected" ? (
                <Pressable
                  onPress={() => handlePairDevice(device)}
                  style={({ pressed }) => ({
                    backgroundColor: colors.primary,
                    padding: 16,
                    borderRadius: 16,
                    alignItems: "center",
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text className="text-white text-lg font-bold" style={{ lineHeight: 26 }}>
                    Pair Device
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => handleDisconnectDevice(device)}
                  style={({ pressed }) => ({
                    backgroundColor: colors.surface,
                    borderWidth: 2,
                    borderColor: colors.border,
                    padding: 16,
                    borderRadius: 16,
                    alignItems: "center",
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text
                    className="text-lg font-bold"
                    style={{ color: colors.foreground, lineHeight: 26 }}
                  >
                    Disconnect
                  </Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>

        {/* Help Section */}
        <View className="bg-surface rounded-3xl p-6 mb-8 border border-border">
          <Text className="text-xl font-bold text-foreground mb-3" style={{ lineHeight: 28 }}>
            Need Help?
          </Text>
          <Text className="text-base text-muted mb-4" style={{ lineHeight: 24 }}>
            Having trouble pairing your devices? Check our troubleshooting guide or contact support.
          </Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert(
                "Device Support",
                "For device pairing support, please refer to the DEVICE_PAIRING_GUIDE_DIABETES.md file or contact our support team."
              );
            }}
            style={({ pressed }) => ({
              backgroundColor: `${colors.primary}20`,
              padding: 14,
              borderRadius: 12,
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              className="text-base font-semibold"
              style={{ color: colors.primary, lineHeight: 22 }}
            >
              View Troubleshooting Guide
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
