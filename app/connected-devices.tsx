import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

interface BluetoothDevice {
  id: string;
  name: string;
  type: "glucose" | "bp" | "fitness" | "oximeter" | "thermometer";
  connected: boolean;
  lastSync?: Date;
  battery?: number;
}

const DEVICE_TYPES = {
  glucose: { icon: "drop.fill", label: "Glucose Meter", color: "#0a7ea4" },
  bp: { icon: "heart.fill", label: "BP Monitor", color: "#EF4444" },
  fitness: { icon: "figure.walk", label: "Fitness Tracker", color: "#22C55E" },
  oximeter: { icon: "waveform.path.ecg", label: "Pulse Oximeter", color: "#8B5CF6" },
  thermometer: { icon: "thermometer", label: "Thermometer", color: "#F59E0B" },
};

// Mock devices for demonstration (in production, these come from BLE scan)
const MOCK_AVAILABLE_DEVICES: BluetoothDevice[] = [
  { id: "glucose_001", name: "OneTouch Ultra 2", type: "glucose", connected: false },
  { id: "bp_001", name: "Omron BP786", type: "bp", connected: false },
  { id: "fitness_001", name: "Fitbit Charge 5", type: "fitness", connected: false },
  { id: "oximeter_001", name: "Nonin 3230", type: "oximeter", connected: false },
  { id: "thermometer_001", name: "Braun ThermoScan", type: "thermometer", connected: false },
];

export default function ConnectedDevicesScreen() {
  const colors = useColors();
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<BluetoothDevice[]>([]);
  const [availableDevices, setAvailableDevices] = useState<BluetoothDevice[]>([]);
  const [syncing, setSyncing] = useState<string | null>(null);

  const vitalsCreateMutation = trpc.vitals.create.useMutation();

  // Load connected devices from AsyncStorage (in production, from BLE)
  useEffect(() => {
    // Simulate loading saved connections
    const savedDevices = MOCK_AVAILABLE_DEVICES.filter((d, i) => i < 2).map(d => ({
      ...d,
      connected: true,
      lastSync: new Date(Date.now() - Math.random() * 3600000),
      battery: Math.floor(Math.random() * 50 + 50),
    }));
    setConnectedDevices(savedDevices);
  }, []);

  const handleScan = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsScanning(true);
    
    // Simulate BLE scan (in production: use react-native-ble-plx)
    setTimeout(() => {
      const available = MOCK_AVAILABLE_DEVICES.filter(
        d => !connectedDevices.find(cd => cd.id === d.id)
      );
      setAvailableDevices(available);
      setIsScanning(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2000);
  };

  const handleConnect = async (device: BluetoothDevice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate BLE connection
    const connected: BluetoothDevice = {
      ...device,
      connected: true,
      lastSync: new Date(),
      battery: Math.floor(Math.random() * 50 + 50),
    };
    
    setConnectedDevices([...connectedDevices, connected]);
    setAvailableDevices(availableDevices.filter(d => d.id !== device.id));
    
    Alert.alert("Device Connected", `${device.name} is now connected and ready to sync.`);
  };

  const handleDisconnect = async (deviceId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const device = connectedDevices.find(d => d.id === deviceId);
    if (device) {
      setConnectedDevices(connectedDevices.filter(d => d.id !== deviceId));
      Alert.alert("Device Disconnected", `${device.name} has been disconnected.`);
    }
  };

  const handleSync = async (device: BluetoothDevice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSyncing(device.id);

    // Simulate reading data from device
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate mock data based on device type
    let vitalData: any = { timestamp: new Date() };
    
    switch (device.type) {
      case "glucose":
        vitalData = { ...vitalData, glucose: Math.floor(Math.random() * 50 + 90) };
        break;
      case "bp":
        vitalData = {
          ...vitalData,
          systolic: Math.floor(Math.random() * 30 + 110),
          diastolic: Math.floor(Math.random() * 20 + 70),
          pulse: Math.floor(Math.random() * 20 + 60),
        };
        break;
      case "fitness":
        vitalData = {
          ...vitalData,
          heartRate: Math.floor(Math.random() * 40 + 60),
          steps: Math.floor(Math.random() * 5000 + 5000),
        };
        break;
      case "oximeter":
        vitalData = {
          ...vitalData,
          oxygenSaturation: Math.floor(Math.random() * 5 + 95),
          pulse: Math.floor(Math.random() * 20 + 60),
        };
        break;
      case "thermometer":
        vitalData = {
          ...vitalData,
          temperature: (Math.random() * 2 + 97).toFixed(1),
        };
        break;
    }

    // Save to vitals database
    try {
      await vitalsCreateMutation.mutateAsync(vitalData);
      
      // Update last sync time
      setConnectedDevices(connectedDevices.map(d =>
        d.id === device.id ? { ...d, lastSync: new Date() } : d
      ));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Sync Complete", `Data from ${device.name} has been saved to your vitals.`);
    } catch (error) {
      Alert.alert("Sync Failed", "Could not save device data. Please try again.");
    }
    
    setSyncing(null);
  };

  const renderDevice = (device: BluetoothDevice, isConnected: boolean) => {
    const deviceType = DEVICE_TYPES[device.type];
    const isSyncing = syncing === device.id;

    return (
      <View
        key={device.id}
        className="mb-3 rounded-2xl border border-border bg-surface p-4"
      >
        <View className="flex-row items-center">
          <View
            className="mr-4 h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: deviceType.color + "20" }}
          >
            <IconSymbol name={deviceType.icon as any} size={24} color={deviceType.color} />
          </View>

          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground">{device.name}</Text>
            <Text className="text-sm text-muted">{deviceType.label}</Text>
            {isConnected && device.lastSync && (
              <Text className="mt-1 text-xs text-muted">
                Last sync: {device.lastSync.toLocaleTimeString()}
              </Text>
            )}
          </View>

          {isConnected && device.battery && (
            <View className="mr-3">
              <Text className="text-xs text-muted">{device.battery}%</Text>
            </View>
          )}

          {isConnected ? (
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => handleSync(device)}
                disabled={isSyncing}
                className="rounded-full px-4 py-2"
                style={{
                  backgroundColor: isSyncing ? colors.muted + "40" : colors.primary,
                  opacity: isSyncing ? 0.6 : 1,
                }}
              >
                {isSyncing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-sm font-semibold text-white">Sync</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDisconnect(device.id)}
                className="rounded-full border border-border px-3 py-2"
              >
                <IconSymbol name="xmark" size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => handleConnect(device)}
              className="rounded-full px-4 py-2"
              style={{ backgroundColor: colors.success }}
            >
              <Text className="text-sm font-semibold text-white">Connect</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer className="p-6">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.primary} />
      </TouchableOpacity>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Text className="mb-2 text-3xl font-bold text-foreground">Connected Devices</Text>
        <Text className="mb-6 text-base text-muted">
          Sync health data from Bluetooth devices automatically
        </Text>

        {/* Connected Devices */}
        <View className="mb-6">
          <Text className="mb-3 text-xl font-semibold text-foreground">
            My Devices ({connectedDevices.length})
          </Text>
          {connectedDevices.length === 0 ? (
            <View className="rounded-2xl border border-border bg-surface p-6">
              <Text className="text-center text-muted">
                No devices connected yet. Scan for nearby devices to get started.
              </Text>
            </View>
          ) : (
            connectedDevices.map(device => renderDevice(device, true))
          )}
        </View>

        {/* Scan Button */}
        <TouchableOpacity
          onPress={handleScan}
          disabled={isScanning}
          className="mb-6 flex-row items-center justify-center rounded-full py-4"
          style={{
            backgroundColor: isScanning ? colors.muted + "40" : colors.primary,
            opacity: isScanning ? 0.6 : 1,
          }}
        >
          {isScanning ? (
            <>
              <ActivityIndicator size="small" color="#fff" className="mr-2" />
              <Text className="text-lg font-semibold text-white">Scanning...</Text>
            </>
          ) : (
            <>
              <IconSymbol name="magnifyingglass" size={20} color="#fff" />
              <Text className="ml-2 text-lg font-semibold text-white">Scan for Devices</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Available Devices */}
        {availableDevices.length > 0 && (
          <View className="mb-6">
            <Text className="mb-3 text-xl font-semibold text-foreground">
              Available Devices ({availableDevices.length})
            </Text>
            {availableDevices.map(device => renderDevice(device, false))}
          </View>
        )}

        {/* Info Card */}
        <View className="mb-6 rounded-2xl border border-border bg-surface p-4">
          <Text className="mb-2 text-base font-semibold text-foreground">
            Supported Devices
          </Text>
          <Text className="text-sm leading-relaxed text-muted">
            • Glucose Meters (OneTouch, Accu-Chek, Contour){"\n"}
            • Blood Pressure Monitors (Omron, Withings){"\n"}
            • Fitness Trackers (Fitbit, Garmin, Apple Watch){"\n"}
            • Pulse Oximeters (Nonin, Masimo){"\n"}
            • Thermometers (Braun, Kinsa)
          </Text>
        </View>

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
