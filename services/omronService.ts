/**
 * Omron Device Integration Service
 * Handles Bluetooth and WiFi connectivity for Omron blood pressure monitors
 * and other health devices, with automatic data sync
 */

import { safeStorage as AsyncStorage } from '../lib/safeStorage';
import * as Notifications from 'expo-notifications';

// Omron device types
export type OmronDeviceType = 'blood_pressure' | 'weight_scale' | 'activity_tracker' | 'thermometer';

export interface OmronDevice {
  id: string;
  name: string;
  type: OmronDeviceType;
  connectionType: 'bluetooth' | 'wifi';
  macAddress?: string;
  ipAddress?: string;
  batteryLevel?: number;
  lastSync?: string;
  isConnected: boolean;
  model: string;
}

export interface OmronBloodPressureReading {
  systolic: number;
  diastolic: number;
  heartRate: number;
  timestamp: string;
  deviceId: string;
  irregular?: boolean;
  bodyMovement?: boolean;
}

export interface OmronWeightReading {
  weight: number;
  bmi?: number;
  bodyFat?: number;
  timestamp: string;
  deviceId: string;
}

const STORAGE_KEY = 'omron_devices';
const READINGS_KEY = 'omron_readings';

class OmronService {
  private devices: OmronDevice[] = [];
  private isScanning = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Initialize the Omron service and load paired devices
   */
  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.devices = JSON.parse(stored);
      }
      
      // Start automatic sync check every 5 minutes
      this.startAutoSync();
    } catch (error) {
      console.error('Failed to initialize Omron service:', error);
    }
  }

  /**
   * Scan for nearby Omron devices via Bluetooth
   */
  async scanForDevices(): Promise<OmronDevice[]> {
    if (this.isScanning) {
      return [];
    }

    this.isScanning = true;
    
    try {
      // Simulate Bluetooth device discovery
      // In production, use expo-bluetooth or react-native-ble-plx
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const discoveredDevices: OmronDevice[] = [
        {
          id: 'omron-bp-001',
          name: 'OMRON BP7000',
          type: 'blood_pressure',
          connectionType: 'bluetooth',
          macAddress: '00:1A:7D:DA:71:13',
          batteryLevel: 85,
          isConnected: false,
          model: 'BP7000',
        },
        {
          id: 'omron-bp-002',
          name: 'OMRON Evolv',
          type: 'blood_pressure',
          connectionType: 'bluetooth',
          macAddress: '00:1A:7D:DA:71:14',
          batteryLevel: 92,
          isConnected: false,
          model: 'BP7900',
        },
      ];
      
      return discoveredDevices;
    } catch (error) {
      console.error('Failed to scan for devices:', error);
      return [];
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Pair and connect to an Omron device
   */
  async pairDevice(device: OmronDevice): Promise<boolean> {
    try {
      // Simulate pairing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      device.isConnected = true;
      device.lastSync = new Date().toISOString();
      
      // Add to paired devices
      const existingIndex = this.devices.findIndex(d => d.id === device.id);
      if (existingIndex >= 0) {
        this.devices[existingIndex] = device;
      } else {
        this.devices.push(device);
      }
      
      await this.saveDevices();
      
      // Sync data immediately after pairing
      await this.syncDeviceData(device.id);
      
      return true;
    } catch (error) {
      console.error('Failed to pair device:', error);
      return false;
    }
  }

  /**
   * Connect to a WiFi-enabled Omron device
   */
  async connectWiFiDevice(ipAddress: string, deviceName: string): Promise<boolean> {
    try {
      // Simulate WiFi connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const device: OmronDevice = {
        id: `omron-wifi-${Date.now()}`,
        name: deviceName,
        type: 'blood_pressure',
        connectionType: 'wifi',
        ipAddress,
        isConnected: true,
        lastSync: new Date().toISOString(),
        model: 'WiFi-Enabled',
      };
      
      this.devices.push(device);
      await this.saveDevices();
      
      // Sync data immediately
      await this.syncDeviceData(device.id);
      
      return true;
    } catch (error) {
      console.error('Failed to connect WiFi device:', error);
      return false;
    }
  }

  /**
   * Disconnect from a device
   */
  async disconnectDevice(deviceId: string): Promise<void> {
    const device = this.devices.find(d => d.id === deviceId);
    if (device) {
      device.isConnected = false;
      await this.saveDevices();
    }
  }

  /**
   * Remove a paired device
   */
  async removeDevice(deviceId: string): Promise<void> {
    this.devices = this.devices.filter(d => d.id !== deviceId);
    await this.saveDevices();
  }

  /**
   * Sync data from a specific device
   */
  async syncDeviceData(deviceId: string): Promise<void> {
    const device = this.devices.find(d => d.id === deviceId);
    if (!device || !device.isConnected) {
      return;
    }

    try {
      // Simulate fetching data from device
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (device.type === 'blood_pressure') {
        // Simulate receiving blood pressure readings
        const readings: OmronBloodPressureReading[] = [
          {
            systolic: 118,
            diastolic: 76,
            heartRate: 72,
            timestamp: new Date().toISOString(),
            deviceId: device.id,
            irregular: false,
            bodyMovement: false,
          },
        ];
        
        await this.saveBloodPressureReadings(readings);
        
        // Update device last sync time
        device.lastSync = new Date().toISOString();
        await this.saveDevices();
        
        // Send notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Blood Pressure Synced',
            body: `New reading: ${readings[0].systolic}/${readings[0].diastolic} mmHg`,
            data: { type: 'omron_sync', reading: readings[0] },
          },
          trigger: null,
        });
      }
    } catch (error) {
      console.error('Failed to sync device data:', error);
    }
  }

  /**
   * Get all paired devices
   */
  getPairedDevices(): OmronDevice[] {
    return this.devices;
  }

  /**
   * Get device by ID
   */
  getDevice(deviceId: string): OmronDevice | undefined {
    return this.devices.find(d => d.id === deviceId);
  }

  /**
   * Check device connection status
   */
  async checkConnection(deviceId: string): Promise<boolean> {
    const device = this.devices.find(d => d.id === deviceId);
    if (!device) {
      return false;
    }

    try {
      // Simulate connection check
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Randomly simulate connection status for demo
      const isConnected = Math.random() > 0.2; // 80% success rate
      device.isConnected = isConnected;
      await this.saveDevices();
      
      return isConnected;
    } catch (error) {
      console.error('Failed to check connection:', error);
      return false;
    }
  }

  /**
   * Get battery level for a device
   */
  async getBatteryLevel(deviceId: string): Promise<number | null> {
    const device = this.devices.find(d => d.id === deviceId);
    if (!device || !device.isConnected) {
      return null;
    }

    try {
      // Simulate battery level check
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Random battery level for demo
      const batteryLevel = Math.floor(Math.random() * 40) + 60; // 60-100%
      device.batteryLevel = batteryLevel;
      await this.saveDevices();
      
      return batteryLevel;
    } catch (error) {
      console.error('Failed to get battery level:', error);
      return null;
    }
  }

  /**
   * Save blood pressure readings
   */
  private async saveBloodPressureReadings(readings: OmronBloodPressureReading[]): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(READINGS_KEY);
      const allReadings = stored ? JSON.parse(stored) : [];
      
      allReadings.push(...readings);
      
      // Keep only last 1000 readings
      if (allReadings.length > 1000) {
        allReadings.splice(0, allReadings.length - 1000);
      }
      
      await AsyncStorage.setItem(READINGS_KEY, JSON.stringify(allReadings));
      
      // Also save to vitals storage for main app integration
      await this.saveToVitals(readings);
    } catch (error) {
      console.error('Failed to save blood pressure readings:', error);
    }
  }

  /**
   * Save readings to main vitals storage
   */
  private async saveToVitals(readings: OmronBloodPressureReading[]): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('vitals');
      const vitals = stored ? JSON.parse(stored) : [];
      
      for (const reading of readings) {
        vitals.push({
          type: 'blood_pressure',
          systolic: reading.systolic,
          diastolic: reading.diastolic,
          heartRate: reading.heartRate,
          timestamp: reading.timestamp,
          source: 'omron',
          deviceId: reading.deviceId,
        });
      }
      
      await AsyncStorage.setItem('vitals', JSON.stringify(vitals));
    } catch (error) {
      console.error('Failed to save to vitals:', error);
    }
  }

  /**
   * Get all blood pressure readings from Omron devices
   */
  async getBloodPressureReadings(limit?: number): Promise<OmronBloodPressureReading[]> {
    try {
      const stored = await AsyncStorage.getItem(READINGS_KEY);
      if (!stored) {
        return [];
      }
      
      const readings = JSON.parse(stored);
      
      if (limit) {
        return readings.slice(-limit);
      }
      
      return readings;
    } catch (error) {
      console.error('Failed to get blood pressure readings:', error);
      return [];
    }
  }

  /**
   * Start automatic sync check
   */
  private startAutoSync(): void {
    // Check for connected devices every 5 minutes
    this.syncInterval = setInterval(async () => {
      for (const device of this.devices) {
        if (device.isConnected) {
          await this.syncDeviceData(device.id);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Save devices to storage
   */
  private async saveDevices(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.devices));
    } catch (error) {
      console.error('Failed to save devices:', error);
    }
  }
}

// Export singleton instance
export const omronService = new OmronService();
