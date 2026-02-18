import AsyncStorage from "@react-native-async-storage/async-storage";

export interface DeviceReading {
  id: string;
  deviceId: string;
  deviceType: "dexcom" | "omnipod" | "freestyle_libre" | "omron_bp" | "omron_weight";
  deviceName: string;
  timestamp: Date;
  value: number;
  unit: string;
  metadata?: {
    systolic?: number;
    diastolic?: number;
    pulse?: number;
    notes?: string;
  };
}

export interface DeviceInfo {
  id: string;
  type: "dexcom" | "omnipod" | "freestyle_libre" | "omron_bp" | "omron_weight";
  name: string;
  lastSyncTime: Date | null;
  syncStatus: "idle" | "syncing" | "success" | "error";
  connectionStatus: "connected" | "disconnected";
  autoSyncEnabled: boolean;
  errorMessage?: string;
}

export interface StatisticsPeriod {
  period: "daily" | "weekly" | "monthly";
  startDate: Date;
  endDate: Date;
  average: number;
  min: number;
  max: number;
  count: number;
  standardDeviation: number;
  trend: "improving" | "declining" | "stable";
}

class DeviceSyncService {
  private static readonly DEVICES_KEY = "connected_devices";
  private static readonly READINGS_KEY = "device_readings";
  private static readonly SYNC_HISTORY_KEY = "sync_history";

  // Get all connected devices
  async getConnectedDevices(): Promise<DeviceInfo[]> {
    try {
      const devicesJson = await AsyncStorage.getItem(DeviceSyncService.DEVICES_KEY);
      if (!devicesJson) return [];
      
      const devices = JSON.parse(devicesJson);
      return devices.map((d: any) => ({
        ...d,
        lastSyncTime: d.lastSyncTime ? new Date(d.lastSyncTime) : null,
      }));
    } catch (error) {
      console.error("Error loading devices:", error);
      return [];
    }
  }

  // Manual sync for specific device
  async manualSync(deviceId: string): Promise<{ success: boolean; readingsCount: number; error?: string }> {
    try {
      // Update device status to syncing
      await this.updateDeviceStatus(deviceId, "syncing");

      // Simulate device sync (in production, this would call actual device APIs)
      const newReadings = await this.fetchDeviceData(deviceId);

      // Save new readings
      await this.saveReadings(newReadings);

      // Update device status to success
      await this.updateDeviceStatus(deviceId, "success");
      await this.updateLastSyncTime(deviceId, new Date());

      // Log sync history
      await this.logSyncHistory(deviceId, true, newReadings.length);

      return { success: true, readingsCount: newReadings.length };
    } catch (error: any) {
      await this.updateDeviceStatus(deviceId, "error", error.message);
      await this.logSyncHistory(deviceId, false, 0, error.message);
      return { success: false, readingsCount: 0, error: error.message };
    }
  }

  // Fetch data from device (simulated)
  private async fetchDeviceData(deviceId: string): Promise<DeviceReading[]> {
    const devices = await this.getConnectedDevices();
    const device = devices.find(d => d.id === deviceId);
    if (!device) throw new Error("Device not found");

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock readings based on device type
    const readings: DeviceReading[] = [];
    const now = new Date();

    for (let i = 0; i < 10; i++) {
      const timestamp = new Date(now.getTime() - i * 3600000); // Every hour

      if (device.type === "dexcom" || device.type === "freestyle_libre") {
        readings.push({
          id: `reading_${Date.now()}_${i}`,
          deviceId,
          deviceType: device.type,
          deviceName: device.name,
          timestamp,
          value: 100 + Math.random() * 80, // 100-180 mg/dL
          unit: "mg/dL",
        });
      } else if (device.type === "omron_bp") {
        readings.push({
          id: `reading_${Date.now()}_${i}`,
          deviceId,
          deviceType: device.type,
          deviceName: device.name,
          timestamp,
          value: 120, // systolic
          unit: "mmHg",
          metadata: {
            systolic: 120 + Math.random() * 20,
            diastolic: 80 + Math.random() * 10,
            pulse: 70 + Math.random() * 20,
          },
        });
      } else if (device.type === "omron_weight") {
        readings.push({
          id: `reading_${Date.now()}_${i}`,
          deviceId,
          deviceType: device.type,
          deviceName: device.name,
          timestamp,
          value: 150 + Math.random() * 20,
          unit: "lbs",
        });
      }
    }

    return readings;
  }

  // Save readings to storage
  private async saveReadings(newReadings: DeviceReading[]): Promise<void> {
    try {
      const existingJson = await AsyncStorage.getItem(DeviceSyncService.READINGS_KEY);
      const existing: DeviceReading[] = existingJson ? JSON.parse(existingJson) : [];

      const updated = [...existing, ...newReadings];
      await AsyncStorage.setItem(DeviceSyncService.READINGS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving readings:", error);
      throw error;
    }
  }

  // Get all readings with optional filters
  async getReadings(filters?: {
    deviceType?: string;
    deviceId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<DeviceReading[]> {
    try {
      const readingsJson = await AsyncStorage.getItem(DeviceSyncService.READINGS_KEY);
      if (!readingsJson) return [];

      let readings: DeviceReading[] = JSON.parse(readingsJson);
      
      // Convert timestamp strings to Date objects
      readings = readings.map(r => ({
        ...r,
        timestamp: new Date(r.timestamp),
      }));

      // Apply filters
      if (filters) {
        if (filters.deviceType) {
          readings = readings.filter(r => r.deviceType === filters.deviceType);
        }
        if (filters.deviceId) {
          readings = readings.filter(r => r.deviceId === filters.deviceId);
        }
        if (filters.startDate) {
          readings = readings.filter(r => r.timestamp >= filters.startDate!);
        }
        if (filters.endDate) {
          readings = readings.filter(r => r.timestamp <= filters.endDate!);
        }
      }

      // Sort by timestamp descending (newest first)
      readings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return readings;
    } catch (error) {
      console.error("Error loading readings:", error);
      return [];
    }
  }

  // Calculate statistics for a period
  async calculateStatistics(
    deviceId: string,
    period: "daily" | "weekly" | "monthly"
  ): Promise<StatisticsPeriod[]> {
    const readings = await this.getReadings({ deviceId });
    if (readings.length === 0) return [];

    const now = new Date();
    const periods: StatisticsPeriod[] = [];

    // Determine number of periods to calculate
    const periodsCount = period === "daily" ? 30 : period === "weekly" ? 12 : 12;

    for (let i = 0; i < periodsCount; i++) {
      let startDate: Date, endDate: Date;

      if (period === "daily") {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - i);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
      } else if (period === "weekly") {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - (i * 7));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - i);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
      }

      const periodReadings = readings.filter(
        r => r.timestamp >= startDate && r.timestamp <= endDate
      );

      if (periodReadings.length > 0) {
        const values = periodReadings.map(r => r.value);
        const average = values.reduce((sum, v) => sum + v, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        // Calculate standard deviation
        const squaredDiffs = values.map(v => Math.pow(v - average, 2));
        const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
        const standardDeviation = Math.sqrt(variance);

        // Determine trend (compare to previous period)
        let trend: "improving" | "declining" | "stable" = "stable";
        if (i < periodsCount - 1 && periods.length > 0) {
          const prevAverage = periods[periods.length - 1].average;
          const diff = average - prevAverage;
          if (Math.abs(diff) > average * 0.05) {
            // 5% threshold
            trend = diff > 0 ? "improving" : "declining";
          }
        }

        periods.push({
          period,
          startDate,
          endDate,
          average: Math.round(average * 10) / 10,
          min,
          max,
          count: periodReadings.length,
          standardDeviation: Math.round(standardDeviation * 10) / 10,
          trend,
        });
      }
    }

    return periods.reverse(); // Return oldest to newest
  }

  // Update device status
  private async updateDeviceStatus(
    deviceId: string,
    status: "idle" | "syncing" | "success" | "error",
    errorMessage?: string
  ): Promise<void> {
    const devices = await this.getConnectedDevices();
    const updatedDevices = devices.map(d =>
      d.id === deviceId ? { ...d, syncStatus: status, errorMessage } : d
    );
    await AsyncStorage.setItem(DeviceSyncService.DEVICES_KEY, JSON.stringify(updatedDevices));
  }

  // Update last sync time
  private async updateLastSyncTime(deviceId: string, time: Date): Promise<void> {
    const devices = await this.getConnectedDevices();
    const updatedDevices = devices.map(d =>
      d.id === deviceId ? { ...d, lastSyncTime: time } : d
    );
    await AsyncStorage.setItem(DeviceSyncService.DEVICES_KEY, JSON.stringify(updatedDevices));
  }

  // Log sync history
  private async logSyncHistory(
    deviceId: string,
    success: boolean,
    readingsCount: number,
    error?: string
  ): Promise<void> {
    try {
      const historyJson = await AsyncStorage.getItem(DeviceSyncService.SYNC_HISTORY_KEY);
      const history = historyJson ? JSON.parse(historyJson) : [];

      history.unshift({
        deviceId,
        timestamp: new Date(),
        success,
        readingsCount,
        error,
      });

      // Keep only last 100 entries
      if (history.length > 100) {
        history.splice(100);
      }

      await AsyncStorage.setItem(DeviceSyncService.SYNC_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Error logging sync history:", error);
    }
  }

  // Toggle auto-sync for device
  async toggleAutoSync(deviceId: string, enabled: boolean): Promise<void> {
    const devices = await this.getConnectedDevices();
    const updatedDevices = devices.map(d =>
      d.id === deviceId ? { ...d, autoSyncEnabled: enabled } : d
    );
    await AsyncStorage.setItem(DeviceSyncService.DEVICES_KEY, JSON.stringify(updatedDevices));
  }
}

export default new DeviceSyncService();
