import { View, Text, Pressable, ScrollView, TextInput, Alert, Switch } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { Activity, Droplet, Heart, Syringe, Check, X } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { DeviceConnectionManager, DeviceConfig, DeviceType } from "@/services/DeviceConnectionManager";

/**
 * Device Settings Screen
 * 
 * Allows users to:
 * - Choose between virtual (free) and real devices
 * - Connect real medical devices (Dexcom, Omron, Omnipod)
 * - View device connection status
 * - Switch back to virtual devices anytime
 */
export default function DeviceSettingsScreen() {
  const colors = useColors();
  const [devices, setDevices] = useState<DeviceConfig[]>([]);
  const [showDexcomForm, setShowDexcomForm] = useState(false);
  const [showOmronForm, setShowOmronForm] = useState(false);
  const [showOmnipodForm, setShowOmnipodForm] = useState(false);
  
  // Dexcom credentials
  const [dexcomUsername, setDexcomUsername] = useState("");
  const [dexcomPassword, setDexcomPassword] = useState("");
  
  // Omron credentials
  const [omronApiKey, setOmronApiKey] = useState("");
  
  // Omnipod credentials
  const [omnipodUsername, setOmnipodUsername] = useState("");
  const [omnipodPassword, setOmnipodPassword] = useState("");

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = () => {
    const allDevices = DeviceConnectionManager.getAllDeviceStatuses();
    setDevices(allDevices);
  };

  const handleConnectDexcom = async () => {
    if (!dexcomUsername.trim() || !dexcomPassword.trim()) {
      Alert.alert("Missing Information", "Please enter your Dexcom Share username and password.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await DeviceConnectionManager.connectDexcomCGM(dexcomUsername, dexcomPassword);
    
    if (success) {
      Alert.alert("Success", "Connected to Dexcom CGM successfully!");
      setShowDexcomForm(false);
      setDexcomUsername("");
      setDexcomPassword("");
      loadDevices();
    } else {
      Alert.alert("Connection Failed", "Could not connect to Dexcom. Please check your credentials and try again.");
    }
  };

  const handleConnectOmron = async () => {
    if (!omronApiKey.trim()) {
      Alert.alert("Missing Information", "Please enter your Omron Connect API key.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await DeviceConnectionManager.connectOmronBPMonitor(omronApiKey);
    
    if (success) {
      Alert.alert("Success", "Connected to Omron blood pressure monitor successfully!");
      setShowOmronForm(false);
      setOmronApiKey("");
      loadDevices();
    } else {
      Alert.alert("Connection Failed", "Could not connect to Omron. Please check your API key and try again.");
    }
  };

  const handleConnectOmnipod = async () => {
    if (!omnipodUsername.trim() || !omnipodPassword.trim()) {
      Alert.alert("Missing Information", "Please enter your Omnipod account credentials.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await DeviceConnectionManager.connectOmnipod(omnipodUsername, omnipodPassword);
    
    if (success) {
      Alert.alert("Success", "Connected to Omnipod insulin pump successfully!");
      setShowOmnipodForm(false);
      setOmnipodUsername("");
      setOmnipodPassword("");
      loadDevices();
    } else {
      Alert.alert("Connection Failed", "Could not connect to Omnipod. Please check your credentials and try again.");
    }
  };

  const handleSwitchToVirtual = async (type: DeviceType) => {
    Alert.alert(
      "Switch to Virtual Device",
      "Are you sure you want to switch to the free virtual device? You can reconnect your real device anytime.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch to Virtual",
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await DeviceConnectionManager.disconnectDevice(type);
            loadDevices();
            Alert.alert("Switched", "Now using virtual device. Your real device data is still saved.");
          },
        },
      ]
    );
  };

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case "cgm":
        return <Droplet size={24} color={colors.primary} />;
      case "bp_monitor":
        return <Heart size={24} color={colors.primary} />;
      case "insulin_pump":
        return <Syringe size={24} color={colors.primary} />;
    }
  };

  const getDeviceLabel = (type: DeviceType) => {
    switch (type) {
      case "cgm":
        return "Continuous Glucose Monitor";
      case "bp_monitor":
        return "Blood Pressure Monitor";
      case "insulin_pump":
        return "Insulin Pump";
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="p-6 pb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Activity size={28} color={colors.primary} />
            <Text className="text-2xl font-bold text-foreground">
              Device Settings
            </Text>
          </View>
          <Text className="text-base text-muted leading-relaxed">
            Connect your real medical devices or use free virtual devices
          </Text>
        </View>

        {/* Info Card */}
        <View className="px-6 pb-6">
          <View className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <View className="flex-row items-start gap-3">
              <Activity size={20} color={colors.primary} />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground mb-1">
                  Dual-Mode Support
                </Text>
                <Text className="text-xs text-muted leading-relaxed">
                  Virtual devices are free for everyone. Connect real devices for live data, or keep using virtual devices - your choice!
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Device List */}
        {devices.map((device) => (
          <View key={device.type} className="px-6 pb-6">
            <View className="bg-surface border border-border rounded-xl p-6">
              {/* Device Header */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="bg-primary/20 rounded-full p-3">
                    {getDeviceIcon(device.type)}
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground mb-1">
                      {getDeviceLabel(device.type)}
                    </Text>
                    <Text className="text-sm text-muted">
                      {device.mode === "virtual" ? "Virtual Device (Free)" : device.deviceName}
                    </Text>
                  </View>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    device.isConnected ? "bg-success/20" : "bg-error/20"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      device.isConnected ? "text-success" : "text-error"
                    }`}
                  >
                    {device.isConnected ? "Connected" : "Disconnected"}
                  </Text>
                </View>
              </View>

              {/* Device Actions */}
              {device.mode === "virtual" ? (
                <Pressable
                  onPress={() => {
                    if (device.type === "cgm") setShowDexcomForm(true);
                    else if (device.type === "bp_monitor") setShowOmronForm(true);
                    else if (device.type === "insulin_pump") setShowOmnipodForm(true);
                  }}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="bg-primary py-3 rounded-lg flex-row items-center justify-center gap-2"
                >
                  <Check size={18} color="#ffffff" />
                  <Text className="text-white font-semibold text-sm">
                    Connect Real Device
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => handleSwitchToVirtual(device.type)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="bg-muted/20 border-2 border-border py-3 rounded-lg flex-row items-center justify-center gap-2"
                >
                  <X size={18} color={colors.muted} />
                  <Text className="text-muted font-semibold text-sm">
                    Switch to Virtual Device
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        ))}

        {/* Dexcom Connection Form */}
        {showDexcomForm && (
          <View className="px-6 pb-6">
            <View className="bg-primary/10 border-2 border-primary rounded-xl p-6">
              <Text className="text-lg font-semibold text-foreground mb-4">
                Connect Dexcom CGM
              </Text>
              
              <View className="gap-3 mb-4">
                <View>
                  <Text className="text-sm text-muted mb-1">Dexcom Share Username</Text>
                  <TextInput
                    value={dexcomUsername}
                    onChangeText={setDexcomUsername}
                    placeholder="Enter username"
                    placeholderTextColor={colors.muted}
                    autoCapitalize="none"
                    className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm text-muted mb-1">Password</Text>
                  <TextInput
                    value={dexcomPassword}
                    onChangeText={setDexcomPassword}
                    placeholder="Enter password"
                    placeholderTextColor={colors.muted}
                    secureTextEntry
                    className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </View>
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setShowDexcomForm(false)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-1 bg-background border-2 border-border py-3 rounded-lg"
                >
                  <Text className="text-muted font-semibold text-center">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleConnectDexcom}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-1 bg-primary py-3 rounded-lg"
                >
                  <Text className="text-white font-semibold text-center">Connect</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Omron Connection Form */}
        {showOmronForm && (
          <View className="px-6 pb-6">
            <View className="bg-primary/10 border-2 border-primary rounded-xl p-6">
              <Text className="text-lg font-semibold text-foreground mb-4">
                Connect Omron BP Monitor
              </Text>
              
              <View className="mb-4">
                <Text className="text-sm text-muted mb-1">Omron Connect API Key</Text>
                <TextInput
                  value={omronApiKey}
                  onChangeText={setOmronApiKey}
                  placeholder="Enter API key"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                />
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setShowOmronForm(false)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-1 bg-background border-2 border-border py-3 rounded-lg"
                >
                  <Text className="text-muted font-semibold text-center">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleConnectOmron}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-1 bg-primary py-3 rounded-lg"
                >
                  <Text className="text-white font-semibold text-center">Connect</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Omnipod Connection Form */}
        {showOmnipodForm && (
          <View className="px-6 pb-6">
            <View className="bg-primary/10 border-2 border-primary rounded-xl p-6">
              <Text className="text-lg font-semibold text-foreground mb-4">
                Connect Omnipod Insulin Pump
              </Text>
              
              <View className="gap-3 mb-4">
                <View>
                  <Text className="text-sm text-muted mb-1">Omnipod Account Username</Text>
                  <TextInput
                    value={omnipodUsername}
                    onChangeText={setOmnipodUsername}
                    placeholder="Enter username"
                    placeholderTextColor={colors.muted}
                    autoCapitalize="none"
                    className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm text-muted mb-1">Password</Text>
                  <TextInput
                    value={omnipodPassword}
                    onChangeText={setOmnipodPassword}
                    placeholder="Enter password"
                    placeholderTextColor={colors.muted}
                    secureTextEntry
                    className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </View>
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setShowOmnipodForm(false)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-1 bg-background border-2 border-border py-3 rounded-lg"
                >
                  <Text className="text-muted font-semibold text-center">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleConnectOmnipod}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-1 bg-primary py-3 rounded-lg"
                >
                  <Text className="text-white font-semibold text-center">Connect</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
