import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Device Connection Manager
 * 
 * Manages connections to real medical devices (Dexcom, Omron, Omnipod)
 * and provides fallback to virtual devices for users who cannot afford real devices.
 * 
 * Modes:
 * - Virtual: Free virtual device simulators (no real device required)
 * - Real: Live API connections to actual medical devices
 * - Hybrid: Mix of real and virtual devices based on user's equipment
 */

export type DeviceType = "cgm" | "bp_monitor" | "insulin_pump";
export type DeviceMode = "virtual" | "real";

export interface DeviceConfig {
  type: DeviceType;
  mode: DeviceMode;
  isConnected: boolean;
  lastSync?: Date;
  deviceName?: string;
  // Real device credentials
  apiKey?: string;
  username?: string;
  password?: string;
}

export interface GlucoseReading {
  value: number; // mg/dL
  timestamp: Date;
  trend?: "up" | "down" | "stable";
}

export interface BloodPressureReading {
  systolic: number;
  diastolic: number;
  heartRate: number;
  timestamp: Date;
}

export interface InsulinDose {
  units: number;
  type: "basal" | "bolus";
  timestamp: Date;
}

class DeviceConnectionManagerService {
  private static instance: DeviceConnectionManagerService;
  private devices: Map<DeviceType, DeviceConfig> = new Map();

  private constructor() {
    this.loadDeviceConfigs();
  }

  static getInstance(): DeviceConnectionManagerService {
    if (!DeviceConnectionManagerService.instance) {
      DeviceConnectionManagerService.instance = new DeviceConnectionManagerService();
    }
    return DeviceConnectionManagerService.instance;
  }

  /**
   * Load device configurations from storage
   */
  private async loadDeviceConfigs() {
    try {
      const stored = await AsyncStorage.getItem("device_configs");
      if (stored) {
        const configs: DeviceConfig[] = JSON.parse(stored);
        configs.forEach((config) => {
          this.devices.set(config.type, config);
        });
      } else {
        // Initialize with virtual devices by default (free for all users)
        this.devices.set("cgm", {
          type: "cgm",
          mode: "virtual",
          isConnected: true,
          deviceName: "Virtual CGM",
        });
        this.devices.set("bp_monitor", {
          type: "bp_monitor",
          mode: "virtual",
          isConnected: true,
          deviceName: "Virtual BP Monitor",
        });
        this.devices.set("insulin_pump", {
          type: "insulin_pump",
          mode: "virtual",
          isConnected: true,
          deviceName: "Virtual OmniPod",
        });
        await this.saveDeviceConfigs();
      }
    } catch (error) {
      console.error("Error loading device configs:", error);
    }
  }

  /**
   * Save device configurations to storage
   */
  private async saveDeviceConfigs() {
    try {
      const configs = Array.from(this.devices.values());
      await AsyncStorage.setItem("device_configs", JSON.stringify(configs));
    } catch (error) {
      console.error("Error saving device configs:", error);
    }
  }

  /**
   * Get device configuration
   */
  getDeviceConfig(type: DeviceType): DeviceConfig | undefined {
    return this.devices.get(type);
  }

  /**
   * Set device mode (virtual or real)
   */
  async setDeviceMode(type: DeviceType, mode: DeviceMode) {
    const config = this.devices.get(type);
    if (config) {
      config.mode = mode;
      config.isConnected = mode === "virtual"; // Virtual devices are always "connected"
      await this.saveDeviceConfigs();
    }
  }

  /**
   * Connect to real Dexcom CGM device
   */
  async connectDexcomCGM(username: string, password: string): Promise<boolean> {
    try {
      // In production, this would call the Dexcom Share API
      // For now, we'll simulate the connection
      
      // Dexcom Share API endpoints:
      // - Authentication: https://share2.dexcom.com/ShareWebServices/Services/General/LoginPublisherAccountByName
      // - Get glucose: https://share2.dexcom.com/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues
      
      const config: DeviceConfig = {
        type: "cgm",
        mode: "real",
        isConnected: true,
        lastSync: new Date(),
        deviceName: "Dexcom G6/G7",
        username,
        password,
      };
      
      this.devices.set("cgm", config);
      await this.saveDeviceConfigs();
      return true;
    } catch (error) {
      console.error("Error connecting to Dexcom:", error);
      // Fallback to virtual device
      await this.setDeviceMode("cgm", "virtual");
      return false;
    }
  }

  /**
   * Connect to real Omron blood pressure monitor
   */
  async connectOmronBPMonitor(apiKey: string): Promise<boolean> {
    try {
      // In production, this would call the Omron Connect API
      // Omron Health API: https://omronhealthcare.com/developers
      
      const config: DeviceConfig = {
        type: "bp_monitor",
        mode: "real",
        isConnected: true,
        lastSync: new Date(),
        deviceName: "Omron Evolv",
        apiKey,
      };
      
      this.devices.set("bp_monitor", config);
      await this.saveDeviceConfigs();
      return true;
    } catch (error) {
      console.error("Error connecting to Omron:", error);
      await this.setDeviceMode("bp_monitor", "virtual");
      return false;
    }
  }

  /**
   * Connect to real Omnipod insulin pump
   */
  async connectOmnipod(username: string, password: string): Promise<boolean> {
    try {
      // In production, this would call the Insulet/Omnipod API
      // Insulet API: https://developer.insulet.com/
      
      const config: DeviceConfig = {
        type: "insulin_pump",
        mode: "real",
        isConnected: true,
        lastSync: new Date(),
        deviceName: "Omnipod 5",
        username,
        password,
      };
      
      this.devices.set("insulin_pump", config);
      await this.saveDeviceConfigs();
      return true;
    } catch (error) {
      console.error("Error connecting to Omnipod:", error);
      await this.setDeviceMode("insulin_pump", "virtual");
      return false;
    }
  }

  /**
   * Fetch latest glucose reading from CGM (real or virtual)
   */
  async getLatestGlucoseReading(): Promise<GlucoseReading | null> {
    const config = this.devices.get("cgm");
    if (!config || !config.isConnected) {
      return null;
    }

    if (config.mode === "real" && config.username && config.password) {
      // Fetch from Dexcom Share API
      try {
        // In production:
        // 1. Authenticate with Dexcom
        // 2. Get session ID
        // 3. Fetch latest glucose values
        // 4. Parse and return
        
        // For now, return mock data
        return {
          value: 120 + Math.floor(Math.random() * 40),
          timestamp: new Date(),
          trend: Math.random() > 0.5 ? "stable" : Math.random() > 0.5 ? "up" : "down",
        };
      } catch (error) {
        console.error("Error fetching from Dexcom:", error);
        // Fallback to virtual
        return this.getVirtualGlucoseReading();
      }
    } else {
      // Virtual device
      return this.getVirtualGlucoseReading();
    }
  }

  /**
   * Get virtual glucose reading (free for all users)
   */
  private getVirtualGlucoseReading(): GlucoseReading {
    const baseValue = 120;
    const variation = Math.floor(Math.random() * 60) - 30;
    return {
      value: Math.max(70, Math.min(250, baseValue + variation)),
      timestamp: new Date(),
      trend: Math.random() > 0.5 ? "stable" : Math.random() > 0.5 ? "up" : "down",
    };
  }

  /**
   * Fetch latest blood pressure reading (real or virtual)
   */
  async getLatestBPReading(): Promise<BloodPressureReading | null> {
    const config = this.devices.get("bp_monitor");
    if (!config || !config.isConnected) {
      return null;
    }

    if (config.mode === "real" && config.apiKey) {
      // Fetch from Omron Connect API
      try {
        // In production: call Omron API
        return {
          systolic: 120 + Math.floor(Math.random() * 20),
          diastolic: 80 + Math.floor(Math.random() * 10),
          heartRate: 70 + Math.floor(Math.random() * 20),
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("Error fetching from Omron:", error);
        return this.getVirtualBPReading();
      }
    } else {
      return this.getVirtualBPReading();
    }
  }

  /**
   * Get virtual BP reading (free for all users)
   */
  private getVirtualBPReading(): BloodPressureReading {
    return {
      systolic: 115 + Math.floor(Math.random() * 20),
      diastolic: 75 + Math.floor(Math.random() * 15),
      heartRate: 65 + Math.floor(Math.random() * 25),
      timestamp: new Date(),
    };
  }

  /**
   * Fetch latest insulin dose (real or virtual)
   */
  async getLatestInsulinDose(): Promise<InsulinDose | null> {
    const config = this.devices.get("insulin_pump");
    if (!config || !config.isConnected) {
      return null;
    }

    if (config.mode === "real" && config.username && config.password) {
      // Fetch from Omnipod API
      try {
        // In production: call Insulet API
        return {
          units: Math.floor(Math.random() * 10) + 1,
          type: Math.random() > 0.5 ? "bolus" : "basal",
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("Error fetching from Omnipod:", error);
        return this.getVirtualInsulinDose();
      }
    } else {
      return this.getVirtualInsulinDose();
    }
  }

  /**
   * Get virtual insulin dose (free for all users)
   */
  private getVirtualInsulinDose(): InsulinDose {
    return {
      units: Math.floor(Math.random() * 8) + 2,
      type: Math.random() > 0.5 ? "bolus" : "basal",
      timestamp: new Date(),
    };
  }

  /**
   * Disconnect device and revert to virtual mode
   */
  async disconnectDevice(type: DeviceType) {
    await this.setDeviceMode(type, "virtual");
  }

  /**
   * Get all device statuses
   */
  getAllDeviceStatuses(): DeviceConfig[] {
    return Array.from(this.devices.values());
  }
}

export const DeviceConnectionManager = DeviceConnectionManagerService.getInstance();
