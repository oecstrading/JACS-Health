/**
 * Bluetooth Sync Service
 * 
 * Handles automatic data syncing from paired Bluetooth health devices
 * Monitors device connections and syncs data when devices are in range
 */

import { BleManager, Device, Subscription } from "react-native-ble-plx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import {
  parseOmronBPData,
  parseSamsungHeartRateData,
  parseSamsungStepsData,
  parseIHomeWeightData,
  getServiceUUID,
  getCharacteristicUUID,
  type BloodPressureReading,
  type HeartRateReading,
  type StepsReading,
  type WeightReading,
} from "./bluetooth-parsers";

const bleManager = new BleManager();

export interface SyncResult {
  success: boolean;
  deviceId: string;
  deviceName: string;
  deviceType: "bp_monitor" | "watch" | "scale";
  dataType: "blood_pressure" | "heart_rate" | "steps" | "weight";
  data: BloodPressureReading | HeartRateReading | StepsReading | WeightReading | null;
  timestamp: string;
  error?: string;
}

/**
 * Start monitoring for paired devices and sync data automatically
 */
export async function startBluetoothSync(): Promise<void> {
  try {
    const pairedDevicesJson = await AsyncStorage.getItem("paired_bluetooth_devices");
    if (!pairedDevicesJson) {
      console.log("No paired devices found");
      return;
    }

    const pairedDevices = JSON.parse(pairedDevicesJson);
    console.log(`Starting Bluetooth sync for ${pairedDevices.length} paired devices`);

    // Monitor each paired device
    for (const pairedDevice of pairedDevices) {
      monitorDevice(pairedDevice.id, pairedDevice.type);
    }
  } catch (error) {
    console.error("Error starting Bluetooth sync:", error);
  }
}

/**
 * Monitor a specific device for data updates
 */
async function monitorDevice(
  deviceId: string,
  deviceType: "bp_monitor" | "watch" | "scale"
): Promise<void> {
  try {
    // Connect to device
    const device = await bleManager.connectToDevice(deviceId, {
      autoConnect: true, // Automatically reconnect when device is in range
      requestMTU: 512,
    });

    console.log(`Connected to device: ${device.name}`);

    // Discover services and characteristics
    await device.discoverAllServicesAndCharacteristics();

    const serviceUUID = getServiceUUID(deviceType);
    const characteristicUUID = getCharacteristicUUID(deviceType);

    // Monitor characteristic for data updates
    device.monitorCharacteristicForService(
      serviceUUID,
      characteristicUUID,
      (error, characteristic) => {
        if (error) {
          console.error(`Error monitoring ${device.name}:`, error);
          return;
        }

        if (characteristic?.value) {
          handleDataReceived(device, deviceType, characteristic.value);
        }
      }
    );
  } catch (error) {
    console.error(`Error monitoring device ${deviceId}:`, error);
  }
}

/**
 * Handle data received from a Bluetooth device
 */
async function handleDataReceived(
  device: Device,
  deviceType: "bp_monitor" | "watch" | "scale",
  base64Data: string
): Promise<void> {
  try {
    // Convert base64 to ArrayBuffer
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const arrayBuffer = bytes.buffer;

    let syncResult: SyncResult | null = null;

    // Parse data based on device type
    switch (deviceType) {
      case "bp_monitor": {
        const bpData = parseOmronBPData(arrayBuffer);
        if (bpData) {
          await saveBloodPressureReading(bpData);
          syncResult = {
            success: true,
            deviceId: device.id,
            deviceName: device.name || "Omron BP Monitor",
            deviceType,
            dataType: "blood_pressure",
            data: bpData,
            timestamp: new Date().toISOString(),
          };
        }
        break;
      }
      case "watch": {
        // Try parsing as heart rate first
        const hrData = parseSamsungHeartRateData(arrayBuffer);
        if (hrData) {
          await saveHeartRateReading(hrData);
          syncResult = {
            success: true,
            deviceId: device.id,
            deviceName: device.name || "Samsung Watch",
            deviceType,
            dataType: "heart_rate",
            data: hrData,
            timestamp: new Date().toISOString(),
          };
        } else {
          // Try parsing as steps
          const stepsData = parseSamsungStepsData(arrayBuffer);
          if (stepsData) {
            await saveStepsReading(stepsData);
            syncResult = {
              success: true,
              deviceId: device.id,
              deviceName: device.name || "Samsung Watch",
              deviceType,
              dataType: "steps",
              data: stepsData,
              timestamp: new Date().toISOString(),
            };
          }
        }
        break;
      }
      case "scale": {
        const weightData = parseIHomeWeightData(arrayBuffer);
        if (weightData) {
          await saveWeightReading(weightData);
          syncResult = {
            success: true,
            deviceId: device.id,
            deviceName: device.name || "iHome Scale",
            deviceType,
            dataType: "weight",
            data: weightData,
            timestamp: new Date().toISOString(),
          };
        }
        break;
      }
    }

    if (syncResult) {
      // Update last sync time for device
      await updateDeviceLastSync(device.id);

      // Send notification
      await sendSyncNotification(syncResult);

      // Save sync history
      await saveSyncHistory(syncResult);

      console.log(`Successfully synced data from ${device.name}`);
    }
  } catch (error) {
    console.error(`Error handling data from ${device.name}:`, error);
  }
}

/**
 * Save blood pressure reading to storage
 */
async function saveBloodPressureReading(reading: BloodPressureReading): Promise<void> {
  try {
    const key = "vitals_blood_pressure";
    const existingJson = await AsyncStorage.getItem(key);
    const existing = existingJson ? JSON.parse(existingJson) : [];
    
    existing.push(reading);
    
    // Keep only last 100 readings
    if (existing.length > 100) {
      existing.shift();
    }
    
    await AsyncStorage.setItem(key, JSON.stringify(existing));
  } catch (error) {
    console.error("Error saving BP reading:", error);
  }
}

/**
 * Save heart rate reading to storage
 */
async function saveHeartRateReading(reading: HeartRateReading): Promise<void> {
  try {
    const key = "vitals_heart_rate";
    const existingJson = await AsyncStorage.getItem(key);
    const existing = existingJson ? JSON.parse(existingJson) : [];
    
    existing.push(reading);
    
    // Keep only last 100 readings
    if (existing.length > 100) {
      existing.shift();
    }
    
    await AsyncStorage.setItem(key, JSON.stringify(existing));
  } catch (error) {
    console.error("Error saving heart rate reading:", error);
  }
}

/**
 * Save steps reading to storage
 */
async function saveStepsReading(reading: StepsReading): Promise<void> {
  try {
    const key = "activity_steps";
    const existingJson = await AsyncStorage.getItem(key);
    const existing = existingJson ? JSON.parse(existingJson) : [];
    
    existing.push(reading);
    
    // Keep only last 30 days
    if (existing.length > 30) {
      existing.shift();
    }
    
    await AsyncStorage.setItem(key, JSON.stringify(existing));
  } catch (error) {
    console.error("Error saving steps reading:", error);
  }
}

/**
 * Save weight reading to storage
 */
async function saveWeightReading(reading: WeightReading): Promise<void> {
  try {
    const key = "vitals_weight";
    const existingJson = await AsyncStorage.getItem(key);
    const existing = existingJson ? JSON.parse(existingJson) : [];
    
    existing.push(reading);
    
    // Keep only last 100 readings
    if (existing.length > 100) {
      existing.shift();
    }
    
    await AsyncStorage.setItem(key, JSON.stringify(existing));
  } catch (error) {
    console.error("Error saving weight reading:", error);
  }
}

/**
 * Update last sync time for a device
 */
async function updateDeviceLastSync(deviceId: string): Promise<void> {
  try {
    const pairedDevicesJson = await AsyncStorage.getItem("paired_bluetooth_devices");
    if (!pairedDevicesJson) return;

    const pairedDevices = JSON.parse(pairedDevicesJson);
    const deviceIndex = pairedDevices.findIndex((d: any) => d.id === deviceId);
    
    if (deviceIndex !== -1) {
      pairedDevices[deviceIndex].lastSync = new Date().toISOString();
      await AsyncStorage.setItem("paired_bluetooth_devices", JSON.stringify(pairedDevices));
    }
  } catch (error) {
    console.error("Error updating device last sync:", error);
  }
}

/**
 * Send notification for successful data sync
 */
async function sendSyncNotification(syncResult: SyncResult): Promise<void> {
  try {
    let title = "";
    let body = "";

    switch (syncResult.dataType) {
      case "blood_pressure": {
        const data = syncResult.data as BloodPressureReading;
        title = "Blood Pressure Synced";
        body = `${data.systolic}/${data.diastolic} mmHg, Pulse: ${data.pulse} bpm`;
        break;
      }
      case "heart_rate": {
        const data = syncResult.data as HeartRateReading;
        title = "Heart Rate Synced";
        body = `${data.heartRate} bpm`;
        break;
      }
      case "steps": {
        const data = syncResult.data as StepsReading;
        title = "Steps Synced";
        body = `${data.steps.toLocaleString()} steps`;
        break;
      }
      case "weight": {
        const data = syncResult.data as WeightReading;
        title = "Weight Synced";
        body = `${data.weight} ${data.unit}`;
        if (data.bmi) {
          body += `, BMI: ${data.bmi.toFixed(1)}`;
        }
        break;
      }
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { syncResult },
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error("Error sending sync notification:", error);
  }
}

/**
 * Save sync history
 */
async function saveSyncHistory(syncResult: SyncResult): Promise<void> {
  try {
    const key = "bluetooth_sync_history";
    const existingJson = await AsyncStorage.getItem(key);
    const existing = existingJson ? JSON.parse(existingJson) : [];
    
    existing.push(syncResult);
    
    // Keep only last 50 sync events
    if (existing.length > 50) {
      existing.shift();
    }
    
    await AsyncStorage.setItem(key, JSON.stringify(existing));
  } catch (error) {
    console.error("Error saving sync history:", error);
  }
}

/**
 * Manual sync for a specific device
 */
export async function manualSyncDevice(
  deviceId: string,
  deviceType: "bp_monitor" | "watch" | "scale"
): Promise<SyncResult> {
  try {
    const device = await bleManager.connectToDevice(deviceId);
    await device.discoverAllServicesAndCharacteristics();

    const serviceUUID = getServiceUUID(deviceType);
    const characteristicUUID = getCharacteristicUUID(deviceType);

    const characteristic = await device.readCharacteristicForService(
      serviceUUID,
      characteristicUUID
    );

    if (characteristic.value) {
      // Convert base64 to ArrayBuffer
      const binaryString = atob(characteristic.value);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const arrayBuffer = bytes.buffer;

      // Parse and save data
      let data: any = null;
      let dataType: "blood_pressure" | "heart_rate" | "steps" | "weight" = "blood_pressure";

      switch (deviceType) {
        case "bp_monitor":
          data = parseOmronBPData(arrayBuffer);
          dataType = "blood_pressure";
          if (data) await saveBloodPressureReading(data);
          break;
        case "watch":
          data = parseSamsungHeartRateData(arrayBuffer);
          dataType = "heart_rate";
          if (data) await saveHeartRateReading(data);
          break;
        case "scale":
          data = parseIHomeWeightData(arrayBuffer);
          dataType = "weight";
          if (data) await saveWeightReading(data);
          break;
      }

      await device.cancelConnection();

      const syncResult: SyncResult = {
        success: !!data,
        deviceId: device.id,
        deviceName: device.name || "Unknown Device",
        deviceType,
        dataType,
        data,
        timestamp: new Date().toISOString(),
      };

      if (data) {
        await updateDeviceLastSync(deviceId);
        await sendSyncNotification(syncResult);
        await saveSyncHistory(syncResult);
      }

      return syncResult;
    }

    await device.cancelConnection();

    return {
      success: false,
      deviceId,
      deviceName: device.name || "Unknown Device",
      deviceType,
      dataType: "blood_pressure",
      data: null,
      timestamp: new Date().toISOString(),
      error: "No data available",
    };
  } catch (error) {
    console.error("Error during manual sync:", error);
    return {
      success: false,
      deviceId,
      deviceName: "Unknown Device",
      deviceType,
      dataType: "blood_pressure",
      data: null,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Stop Bluetooth sync monitoring
 */
export async function stopBluetoothSync(): Promise<void> {
  try {
    // Disconnect all devices
    const connectedDevices = await bleManager.connectedDevices([]);
    for (const device of connectedDevices) {
      await device.cancelConnection();
    }
    console.log("Stopped Bluetooth sync");
  } catch (error) {
    console.error("Error stopping Bluetooth sync:", error);
  }
}
