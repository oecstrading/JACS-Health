import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CustomDevice {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  notes?: string;
  addedDate: string;
}

interface AddCustomDeviceModalProps {
  visible: boolean;
  onClose: () => void;
  onDeviceAdded: (device: CustomDevice) => void;
}

const DEVICE_CATEGORIES = [
  { id: "scale", label: "Weight Scale", icon: "figure.stand", color: "#0a7ea4" },
  { id: "bp_monitor", label: "Blood Pressure Monitor", icon: "heart.fill", color: "#EF4444" },
  { id: "glucose_meter", label: "Glucose Meter", icon: "drop.fill", color: "#8B5CF6" },
  { id: "heart_rate", label: "Heart Rate Monitor", icon: "waveform.path.ecg", color: "#22C55E" },
  { id: "oximeter", label: "Pulse Oximeter", icon: "waveform.path.ecg", color: "#F59E0B" },
  { id: "thermometer", label: "Thermometer", icon: "thermometer", color: "#EF4444" },
  { id: "fitness_tracker", label: "Fitness Tracker", icon: "figure.walk", color: "#10b981" },
  { id: "sleep_tracker", label: "Sleep Tracker", icon: "moon.fill", color: "#6366f1" },
  { id: "other", label: "Other Device", icon: "plus.circle.fill", color: "#9CA3AF" },
];

export function AddCustomDeviceModal({ visible, onClose, onDeviceAdded }: AddCustomDeviceModalProps) {
  const colors = useColors();
  const [selectedType, setSelectedType] = useState<string>("");
  const [deviceName, setDeviceName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!deviceName.trim() || !selectedType) {
      Alert.alert("Missing Information", "Please enter a device name and select a type.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newDevice: CustomDevice = {
      id: `custom_${Date.now()}`,
      name: deviceName.trim(),
      type: selectedType,
      manufacturer: manufacturer.trim(),
      model: model.trim(),
      notes: notes.trim(),
      addedDate: new Date().toISOString(),
    };

    try {
      // Load existing custom devices
      const existingDevicesJson = await AsyncStorage.getItem("custom_devices");
      const existingDevices: CustomDevice[] = existingDevicesJson ? JSON.parse(existingDevicesJson) : [];
      
      // Add new device
      const updatedDevices = [...existingDevices, newDevice];
      await AsyncStorage.setItem("custom_devices", JSON.stringify(updatedDevices));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onDeviceAdded(newDevice);
      
      // Reset form
      setDeviceName("");
      setManufacturer("");
      setModel("");
      setNotes("");
      setSelectedType("");
      
      onClose();
      Alert.alert("Device Added", `${newDevice.name} has been added to your devices.`);
    } catch (error) {
      console.error("Error saving custom device:", error);
      Alert.alert("Error", "Could not save device. Please try again.");
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDeviceName("");
    setManufacturer("");
    setModel("");
    setNotes("");
    setSelectedType("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <View
          className="rounded-t-3xl p-6"
          style={{ backgroundColor: colors.background, maxHeight: "90%" }}
        >
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">Add Custom Device</Text>
            <TouchableOpacity onPress={handleCancel}>
              <Text className="text-base font-semibold" style={{ color: colors.primary }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Device Name */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-semibold text-foreground">Device Name *</Text>
              <TextInput
                value={deviceName}
                onChangeText={setDeviceName}
                placeholder="e.g., iHome Scale"
                placeholderTextColor={colors.muted}
                className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
              />
            </View>

            {/* Device Type */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-semibold text-foreground">Device Type *</Text>
              <View className="flex-row flex-wrap gap-2">
                {DEVICE_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedType(category.id);
                    }}
                    className="flex-row items-center rounded-full border px-4 py-2"
                    style={{
                      backgroundColor: selectedType === category.id ? category.color + "20" : colors.surface,
                      borderColor: selectedType === category.id ? category.color : colors.border,
                      borderWidth: selectedType === category.id ? 2 : 1,
                    }}
                  >
                    <IconSymbol
                      name={category.icon as any}
                      size={16}
                      color={selectedType === category.id ? category.color : colors.muted}
                    />
                    <Text
                      className="ml-2 text-sm font-medium"
                      style={{
                        color: selectedType === category.id ? category.color : colors.foreground,
                      }}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Manufacturer */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-semibold text-foreground">Manufacturer</Text>
              <TextInput
                value={manufacturer}
                onChangeText={setManufacturer}
                placeholder="e.g., iHome, Omron, Fitbit"
                placeholderTextColor={colors.muted}
                className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
              />
            </View>

            {/* Model */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-semibold text-foreground">Model Number</Text>
              <TextInput
                value={model}
                onChangeText={setModel}
                placeholder="e.g., HS2S, BP786, Charge 5"
                placeholderTextColor={colors.muted}
                className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
              />
            </View>

            {/* Notes */}
            <View className="mb-6">
              <Text className="mb-2 text-sm font-semibold text-foreground">Notes (Optional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional information..."
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              className="mb-4 rounded-full py-4"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-center text-lg font-semibold text-white">Add Device</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
