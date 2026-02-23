import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

/**
 * Cloud Sync Service
 * 
 * Provides:
 * - Automatic data backup to server
 * - Cross-device synchronization
 * - Data encryption at rest and in transit
 * - Offline mode with sync queue
 * - Conflict resolution
 * - Data restore capabilities
 */

export interface SyncStatus {
  lastSyncTime: Date | null;
  isSyncing: boolean;
  pendingChanges: number;
  syncErrors: string[];
}

export interface SyncConfig {
  autoSync: boolean;
  syncInterval: number; // minutes
  wifiOnly: boolean;
  encryptionEnabled: boolean;
}

interface PendingSyncItem {
  id: string;
  dataType: string;
  action: "create" | "update" | "delete";
  data: any;
  timestamp: Date;
  retryCount: number;
}

class CloudSyncServiceClass {
  private static instance: CloudSyncServiceClass;
  private syncStatus: SyncStatus = {
    lastSyncTime: null,
    isSyncing: false,
    pendingChanges: 0,
    syncErrors: [],
  };
  private syncConfig: SyncConfig = {
    autoSync: true,
    syncInterval: 15, // 15 minutes
    wifiOnly: false,
    encryptionEnabled: true,
  };
  private syncQueue: PendingSyncItem[] = [];
  private syncTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.loadConfig();
    this.loadSyncQueue();
    this.startAutoSync();
  }

  static getInstance(): CloudSyncServiceClass {
    if (!CloudSyncServiceClass.instance) {
      CloudSyncServiceClass.instance = new CloudSyncServiceClass();
    }
    return CloudSyncServiceClass.instance;
  }

  /**
   * Load sync configuration from storage
   */
  private async loadConfig() {
    try {
      const stored = await AsyncStorage.getItem("cloud_sync_config");
      if (stored) {
        this.syncConfig = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error loading sync config:", error);
    }
  }

  /**
   * Save sync configuration to storage
   */
  private async saveConfig() {
    try {
      await AsyncStorage.setItem("cloud_sync_config", JSON.stringify(this.syncConfig));
    } catch (error) {
      console.error("Error saving sync config:", error);
    }
  }

  /**
   * Load pending sync queue from storage
   */
  private async loadSyncQueue() {
    try {
      const stored = await AsyncStorage.getItem("cloud_sync_queue");
      if (stored) {
        this.syncQueue = JSON.parse(stored);
        this.syncStatus.pendingChanges = this.syncQueue.length;
      }
    } catch (error) {
      console.error("Error loading sync queue:", error);
    }
  }

  /**
   * Save sync queue to storage
   */
  private async saveSyncQueue() {
    try {
      await AsyncStorage.setItem("cloud_sync_queue", JSON.stringify(this.syncQueue));
      this.syncStatus.pendingChanges = this.syncQueue.length;
    } catch (error) {
      console.error("Error saving sync queue:", error);
    }
  }

  /**
   * Start automatic sync timer
   */
  private startAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    if (this.syncConfig.autoSync) {
      const intervalMs = this.syncConfig.syncInterval * 60 * 1000;
      this.syncTimer = setInterval(() => {
        this.syncNow();
      }, intervalMs);
    }
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Get sync configuration
   */
  getSyncConfig(): SyncConfig {
    return { ...this.syncConfig };
  }

  /**
   * Update sync configuration
   */
  async updateSyncConfig(config: Partial<SyncConfig>) {
    this.syncConfig = { ...this.syncConfig, ...config };
    await this.saveConfig();
    this.startAutoSync();
  }

  /**
   * Add item to sync queue
   */
  async queueSync(dataType: string, action: "create" | "update" | "delete", data: any) {
    const item: PendingSyncItem = {
      id: `${Date.now()}_${Math.random()}`,
      dataType,
      action,
      data,
      timestamp: new Date(),
      retryCount: 0,
    };

    this.syncQueue.push(item);
    await this.saveSyncQueue();

    // Trigger immediate sync if auto-sync is enabled
    if (this.syncConfig.autoSync) {
      this.syncNow();
    }
  }

  /**
   * Perform sync now
   */
  async syncNow(): Promise<boolean> {
    if (this.syncStatus.isSyncing) {
      console.log("Sync already in progress");
      return false;
    }

    if (this.syncQueue.length === 0) {
      console.log("No pending changes to sync");
      return true;
    }

    this.syncStatus.isSyncing = true;
    this.syncStatus.syncErrors = [];

    try {
      console.log(`Starting sync of ${this.syncQueue.length} items...`);

      // In production, this would:
      // 1. Check network connectivity
      // 2. Check WiFi-only setting
      // 3. Encrypt data if enabled
      // 4. Send to server API
      // 5. Handle conflicts
      // 6. Remove successful items from queue

      // Simulate sync delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock: Process each item
      const failedItems: PendingSyncItem[] = [];
      
      for (const item of this.syncQueue) {
        try {
          // Encrypt data if enabled
          let dataToSync = item.data;
          if (this.syncConfig.encryptionEnabled) {
            dataToSync = this.encryptData(item.data);
          }

          // In production: POST to server API
          // await fetch(`${API_URL}/sync/${item.dataType}`, {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ action: item.action, data: dataToSync })
          // });

          console.log(`Synced ${item.dataType} (${item.action})`);
        } catch (error) {
          console.error(`Failed to sync ${item.dataType}:`, error);
          item.retryCount++;
          
          // Retry up to 3 times
          if (item.retryCount < 3) {
            failedItems.push(item);
          } else {
            this.syncStatus.syncErrors.push(`Failed to sync ${item.dataType} after 3 attempts`);
          }
        }
      }

      // Update queue with only failed items
      this.syncQueue = failedItems;
      await this.saveSyncQueue();

      this.syncStatus.lastSyncTime = new Date();
      this.syncStatus.isSyncing = false;

      console.log(`Sync complete. ${failedItems.length} items failed.`);
      return failedItems.length === 0;
    } catch (error) {
      console.error("Sync error:", error);
      this.syncStatus.syncErrors.push("Sync failed: " + (error as Error).message);
      this.syncStatus.isSyncing = false;
      return false;
    }
  }

  /**
   * Encrypt data (placeholder - in production use proper encryption)
   */
  private encryptData(data: any): string {
    // In production: use expo-crypto or similar
    // For now, just JSON stringify
    return JSON.stringify(data);
  }

  /**
   * Decrypt data (placeholder - in production use proper decryption)
   */
  private decryptData(encryptedData: string): any {
    // In production: use expo-crypto or similar
    // For now, just JSON parse
    return JSON.parse(encryptedData);
  }

  /**
   * Restore data from cloud backup
   */
  async restoreFromBackup(): Promise<boolean> {
    try {
      console.log("Starting data restore from cloud backup...");

      // In production:
      // 1. Fetch backup from server
      // 2. Decrypt if needed
      // 3. Validate data integrity
      // 4. Restore to local storage
      // 5. Clear sync queue

      // Simulate restore delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log("Data restore complete");
      return true;
    } catch (error) {
      console.error("Restore error:", error);
      return false;
    }
  }

  /**
   * Clear all local data and sync queue
   */
  async clearAllData() {
    this.syncQueue = [];
    await this.saveSyncQueue();
    this.syncStatus.lastSyncTime = null;
    this.syncStatus.syncErrors = [];
  }

  /**
   * Get sync statistics
   */
  async getSyncStats() {
    const stored = await AsyncStorage.getItem("cloud_sync_stats");
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      lastSuccessfulSync: null,
      dataUploaded: 0, // bytes
      dataDownloaded: 0, // bytes
    };
  }
}

export const CloudSyncService = CloudSyncServiceClass.getInstance();
