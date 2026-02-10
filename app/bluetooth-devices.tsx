import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { BleManager, Device, State } from "react-native-ble-plx";
import * as ExpoDevice from "expo-device";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const bleManager = new BleManager();

interface PairedDevice {
  id: string;
  name: string;
  type: "bp_monitor" | "watch" | "scale";
  lastSync: string;
}

const DEVICE_TYPES = {
  OMRON_BP: { prefix: ["HEM", "BP"], type: "bp_monitor" as const, icon: "🩺", name: "Omron BP Monitor" },
  SAMSUNG_WATCH: { prefix: ["Galaxy", "SM-"], type: "watch" as const, icon: "⌚", name: "Samsung Watch" },
  IHOME_SCALE: { prefix: ["iHome", "Scale"], type: "scale" as const, icon: "⚖️", name: "iHome Scale" },
};

export default function BluetoothDevicesScreen() {
  const colors = useColors();
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
  const [pairedDevices, setPairedDevices] = useState<PairedDevice[]>([]);
  const [bluetoothState, setBluetoothState] = useState<State>(State.Unknown);

  useEffect(() => {
    loadPairedDevices();
    checkBluetoothState();

    const subscription = bleManager.onStateChange((state) => {
      setBluetoothState(state);
    }, true);

    return () => {
      subscription.remove();
      bleManager.stopDeviceScan();
    };
  }, []);

  const loadPairedDevices = async () => {
    try {
      const stored = await AsyncStorage.getItem("paired_bluetooth_devices");
      if (stored) {
        setPairedDevices(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading paired devices:", error);
    }
  };

  const savePairedDevices = async (devices: PairedDevice[]) => {
    try {
      await AsyncStorage.setItem("paired_bluetooth_devices", JSON.stringify(devices));
      setPairedDevices(devices);
    } catch (error) {
      console.error("Error saving paired devices:", error);
    }
  };

  const checkBluetoothState = async () => {
    const state = await bleManager.state();
    setBluetoothState(state);
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      // Android 12+ requires BLUETOOTH_SCAN and BLUETOOTH_CONNECT permissions
      // These should be added to app.json plugins configuration
      return true;
    }
    return true;
  };

  const identifyDeviceType = (deviceName: string | null) => {
    if (!deviceName) return null;

    for (const [key, config] of Object.entries(DEVICE_TYPES)) {
      if (config.prefix.some((prefix) => deviceName.includes(prefix))) {
        return config;
      }
    }
    return null;
  };

  const startScan = async () => {
    if (bluetoothState !== State.PoweredOn) {
      Alert.alert(
        "Bluetooth Off",
        "Please turn on Bluetooth to scan for devices.",
        [{ text: "OK" }]
      );
      return;
    }

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      Alert.alert(
        "Permissions Required",
        "Bluetooth permissions are required to scan for devices.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsScanning(true);
    setDiscoveredDevices([]);

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error("Scan error:", error);
        setIsScanning(false);
        return;
      }

      if (device && device.name) {
        const deviceType = identifyDeviceType(device.name);
        if (deviceType) {
          setDiscoveredDevices((prev) => {
            const exists = prev.find((d) => d.id === device.id);
            if (!exists) {
              return [...prev, device];
            }
            return prev;
          });
        }
      }
    });

    // Stop scanning after 10 seconds
    setTimeout(() => {
      bleManager.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
  };

  const pairDevice = async (device: Device) => {
    try {
      Alert.alert(
        "Pair Device",
        `Pair with ${device.name}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Pair",
            onPress: async () => {
              const deviceType = identifyDeviceType(device.name);
              if (!deviceType) return;

              const newPairedDevice: PairedDevice = {
                id: device.id,
                name: device.name || deviceType.name,
                type: deviceType.type,
                lastSync: new Date().toISOString(),
              };

              const updated = [...pairedDevices, newPairedDevice];
              await savePairedDevices(updated);

              Alert.alert(
                "Success",
                `${device.name} has been paired successfully!`,
                [{ text: "OK" }]
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error("Pairing error:", error);
      Alert.alert("Error", "Failed to pair device. Please try again.");
    }
  };

  const unpairDevice = async (deviceId: string) => {
    Alert.alert(
      "Unpair Device",
      "Are you sure you want to unpair this device?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unpair",
          style: "destructive",
          onPress: async () => {
            const updated = pairedDevices.filter((d) => d.id !== deviceId);
            await savePairedDevices(updated);
          },
        },
      ]
    );
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "bp_monitor":
        return "🩺";
      case "watch":
        return "⌚";
      case "scale":
        return "⚖️";
      default:
        return "📱";
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginBottom: 16 }}
            >
              <Text style={{ fontSize: 18, color: colors.primary }}>← Back</Text>
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">
              Bluetooth Devices
            </Text>
            <Text className="text-base text-muted mt-2">
              Connect your health devices for automatic data syncing
            </Text>
          </View>

          {/* Bluetooth Status */}
          <View
            className="p-4 rounded-2xl"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-lg font-semibold text-foreground mb-2">
              Bluetooth Status
            </Text>
            <Text className="text-base text-muted">
              {bluetoothState === State.PoweredOn
                ? "✅ Bluetooth is ON"
                : "❌ Bluetooth is OFF - Please enable Bluetooth"}
            </Text>
          </View>

          {/* Paired Devices */}
          <View>
            <Text className="text-2xl font-bold text-foreground mb-4">
              Paired Devices
            </Text>
            {pairedDevices.length === 0 ? (
              <View
                className="p-6 rounded-2xl"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-base text-muted text-center">
                  No devices paired yet. Scan to find devices.
                </Text>
              </View>
            ) : (
              pairedDevices.map((device) => (
                <View
                  key={device.id}
                  className="p-4 rounded-2xl mb-3"
                  style={{ backgroundColor: colors.surface }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Text className="text-3xl mr-3">
                        {getDeviceIcon(device.type)}
                      </Text>
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-foreground">
                          {device.name}
                        </Text>
                        <Text className="text-sm text-muted">
                          Last sync: {new Date(device.lastSync).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => unpairDevice(device.id)}
                      style={{
                        backgroundColor: colors.error,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "600" }}>
                        Unpair
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Scan Button */}
          <TouchableOpacity
            onPress={startScan}
            disabled={isScanning || bluetoothState !== State.PoweredOn}
            style={{
              backgroundColor:
                isScanning || bluetoothState !== State.PoweredOn
                  ? colors.muted
                  : colors.primary,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            {isScanning ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator color="white" />
                <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
                  Scanning...
                </Text>
              </View>
            ) : (
              <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
                Scan for Devices
              </Text>
            )}
          </TouchableOpacity>

          {/* Discovered Devices */}
          {discoveredDevices.length > 0 && (
            <View>
              <Text className="text-2xl font-bold text-foreground mb-4">
                Discovered Devices
              </Text>
              {discoveredDevices.map((device) => {
                const deviceType = identifyDeviceType(device.name);
                const isAlreadyPaired = pairedDevices.some((d) => d.id === device.id);

                return (
                  <View
                    key={device.id}
                    className="p-4 rounded-2xl mb-3"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <Text className="text-3xl mr-3">
                          {deviceType?.icon || "📱"}
                        </Text>
                        <View className="flex-1">
                          <Text className="text-lg font-semibold text-foreground">
                            {device.name}
                          </Text>
                          <Text className="text-sm text-muted">
                            {deviceType?.name || "Unknown Device"}
                          </Text>
                        </View>
                      </View>
                      {isAlreadyPaired ? (
                        <Text style={{ color: colors.success, fontWeight: "600" }}>
                          Paired ✓
                        </Text>
                      ) : (
                        <TouchableOpacity
                          onPress={() => pairDevice(device)}
                          style={{
                            backgroundColor: colors.primary,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 8,
                          }}
                        >
                          <Text style={{ color: "white", fontWeight: "600" }}>
                            Pair
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Supported Devices Info */}
          <View
            className="p-4 rounded-2xl"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-lg font-semibold text-foreground mb-3">
              Supported Devices
            </Text>
            <Text className="text-base text-muted mb-2">
              🩺 Omron 3550 Blood Pressure Monitor
            </Text>
            <Text className="text-base text-muted mb-2">
              ⌚ Samsung Galaxy Watch 7
            </Text>
            <Text className="text-base text-muted">
              ⚖️ iHome Smart Scale
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
