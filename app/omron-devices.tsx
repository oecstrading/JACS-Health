/**
 * Omron Devices Screen
 * Manage Omron device connections and sync health data
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import * as Haptics from 'expo-haptics';
import { omronService, type OmronDevice } from '@/services/omronService';

export default function OmronDevicesScreen() {
  const [pairedDevices, setPairedDevices] = useState<OmronDevice[]>([]);
  const [discoveredDevices, setDiscoveredDevices] = useState<OmronDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [showWiFiInput, setShowWiFiInput] = useState(false);
  const [wifiIP, setWifiIP] = useState('');
  const [wifiName, setWifiName] = useState('');

  useEffect(() => {
    loadDevices();
    omronService.initialize();
  }, []);

  const loadDevices = async () => {
    const devices = omronService.getPairedDevices();
    setPairedDevices(devices);
  };

  const handleScanDevices = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsScanning(true);
    
    const devices = await omronService.scanForDevices();
    setDiscoveredDevices(devices);
    setIsScanning(false);
    
    if (devices.length === 0) {
      Alert.alert('No Devices Found', 'Make sure your Omron device is turned on and in pairing mode.');
    }
  };

  const handlePairDevice = async (device: OmronDevice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const success = await omronService.pairDevice(device);
    
    if (success) {
      Alert.alert('Device Paired', `${device.name} has been successfully paired and data synced.`);
      loadDevices();
      setDiscoveredDevices([]);
    } else {
      Alert.alert('Pairing Failed', 'Could not pair with the device. Please try again.');
    }
  };

  const handleSyncDevice = async (deviceId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSyncing(deviceId);
    
    await omronService.syncDeviceData(deviceId);
    await loadDevices();
    
    setIsSyncing(null);
    Alert.alert('Sync Complete', 'Your health data has been updated.');
  };

  const handleRemoveDevice = (device: OmronDevice) => {
    Alert.alert(
      'Remove Device',
      `Are you sure you want to remove ${device.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await omronService.removeDevice(device.id);
            loadDevices();
          },
        },
      ]
    );
  };

  const handleConnectWiFi = async () => {
    if (!wifiIP || !wifiName) {
      Alert.alert('Missing Information', 'Please enter both IP address and device name.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const success = await omronService.connectWiFiDevice(wifiIP, wifiName);
    
    if (success) {
      Alert.alert('WiFi Device Connected', 'Your Omron device has been connected via WiFi.');
      setShowWiFiInput(false);
      setWifiIP('');
      setWifiName('');
      loadDevices();
    } else {
      Alert.alert('Connection Failed', 'Could not connect to the WiFi device. Please check the IP address.');
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'blood_pressure':
        return '🩺';
      case 'weight_scale':
        return '⚖️';
      case 'activity_tracker':
        return '⌚';
      case 'thermometer':
        return '🌡️';
      default:
        return '📱';
    }
  };

  const getBatteryIcon = (level?: number) => {
    if (!level) return '🔋';
    if (level > 80) return '🔋';
    if (level > 50) return '🔋';
    if (level > 20) return '🪫';
    return '🪫';
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Omron Devices
          </Text>
          <Text className="text-base text-muted">
            Connect your Omron health devices to automatically sync your blood pressure and other health data.
          </Text>
        </View>

        {/* Paired Devices */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">
            My Devices
          </Text>
          
          {pairedDevices.length === 0 ? (
            <View className="bg-surface rounded-2xl p-6 items-center">
              <Text className="text-5xl mb-3">🩺</Text>
              <Text className="text-base text-muted text-center">
                No devices paired yet. Scan for nearby Omron devices to get started.
              </Text>
            </View>
          ) : (
            pairedDevices.map((device) => (
              <View
                key={device.id}
                className="bg-surface rounded-2xl p-4 mb-3 border border-border"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-4xl mr-3">{getDeviceIcon(device.type)}</Text>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-foreground">
                        {device.name}
                      </Text>
                      <Text className="text-sm text-muted">
                        {device.model} • {device.connectionType === 'bluetooth' ? 'Bluetooth' : 'WiFi'}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="items-end">
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-1">{getBatteryIcon(device.batteryLevel)}</Text>
                      {device.batteryLevel && (
                        <Text className="text-sm text-muted">{device.batteryLevel}%</Text>
                      )}
                    </View>
                    <View
                      className={`px-2 py-1 rounded-full mt-1 ${
                        device.isConnected ? 'bg-success' : 'bg-error'
                      }`}
                    >
                      <Text className="text-xs text-white font-semibold">
                        {device.isConnected ? 'Connected' : 'Disconnected'}
                      </Text>
                    </View>
                  </View>
                </View>

                {device.lastSync && (
                  <Text className="text-sm text-muted mb-3">
                    Last synced: {new Date(device.lastSync).toLocaleString()}
                  </Text>
                )}

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleSyncDevice(device.id)}
                    disabled={!device.isConnected || isSyncing === device.id}
                    className={`flex-1 py-3 rounded-xl items-center active:opacity-70 ${
                      device.isConnected ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    {isSyncing === device.id ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-base font-semibold text-white">
                        Sync Now
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleRemoveDevice(device)}
                    className="px-4 py-3 rounded-xl bg-error items-center active:opacity-70"
                  >
                    <Text className="text-base font-semibold text-white">Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Scan for Devices */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">
            Add New Device
          </Text>
          
          <TouchableOpacity
            onPress={handleScanDevices}
            disabled={isScanning}
            className="bg-primary py-4 rounded-xl items-center mb-3 active:opacity-70"
          >
            {isScanning ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#fff" size="small" />
                <Text className="text-lg font-semibold text-white ml-2">
                  Scanning for Devices...
                </Text>
              </View>
            ) : (
              <Text className="text-lg font-semibold text-white">
                🔍 Scan for Bluetooth Devices
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowWiFiInput(!showWiFiInput)}
            className="bg-surface border border-primary py-4 rounded-xl items-center active:opacity-70"
          >
            <Text className="text-lg font-semibold text-primary">
              📡 Connect WiFi Device
            </Text>
          </TouchableOpacity>
        </View>

        {/* WiFi Connection Input */}
        {showWiFiInput && (
          <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
            <Text className="text-lg font-bold text-foreground mb-3">
              WiFi Device Setup
            </Text>
            
            <Text className="text-sm text-muted mb-2">Device Name</Text>
            <TextInput
              value={wifiName}
              onChangeText={setWifiName}
              placeholder="e.g., OMRON BP Monitor"
              className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground mb-3"
              placeholderTextColor="#9BA1A6"
            />
            
            <Text className="text-sm text-muted mb-2">IP Address</Text>
            <TextInput
              value={wifiIP}
              onChangeText={setWifiIP}
              placeholder="e.g., 192.168.1.100"
              keyboardType="numeric"
              className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground mb-4"
              placeholderTextColor="#9BA1A6"
            />
            
            <TouchableOpacity
              onPress={handleConnectWiFi}
              className="bg-primary py-3 rounded-xl items-center active:opacity-70"
            >
              <Text className="text-base font-semibold text-white">
                Connect Device
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Discovered Devices */}
        {discoveredDevices.length > 0 && (
          <View className="mb-6">
            <Text className="text-xl font-bold text-foreground mb-3">
              Available Devices
            </Text>
            
            {discoveredDevices.map((device) => (
              <View
                key={device.id}
                className="bg-surface rounded-2xl p-4 mb-3 border border-border"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-4xl mr-3">{getDeviceIcon(device.type)}</Text>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-foreground">
                        {device.name}
                      </Text>
                      <Text className="text-sm text-muted">
                        {device.model} • {device.macAddress}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handlePairDevice(device)}
                  className="bg-primary py-3 rounded-xl items-center active:opacity-70"
                >
                  <Text className="text-base font-semibold text-white">
                    Pair Device
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Help Section */}
        <View className="bg-surface rounded-2xl p-4 mb-6">
          <Text className="text-lg font-bold text-foreground mb-2">
            💡 Setup Tips
          </Text>
          <Text className="text-sm text-muted leading-relaxed mb-2">
            • Make sure your Omron device is turned on and in pairing mode
          </Text>
          <Text className="text-sm text-muted leading-relaxed mb-2">
            • Keep your device close to your phone during pairing
          </Text>
          <Text className="text-sm text-muted leading-relaxed mb-2">
            • For WiFi devices, ensure both your phone and device are on the same network
          </Text>
          <Text className="text-sm text-muted leading-relaxed">
            • Data syncs automatically when devices are connected
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
