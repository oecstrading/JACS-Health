import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * Diabetes Reminders Service
 * 
 * Manages automated reminders for CGM sensor changes (every 10 days)
 * and Omnipod pod changes (every 3 days) to prevent lapses in monitoring.
 */

export type ReminderType = "cgm_sensor" | "omnipod_pod";

export interface DeviceChangeRecord {
  id: string;
  type: ReminderType;
  changeDate: Date;
  nextChangeDate: Date;
  notes?: string;
}

export interface ReminderSettings {
  cgmEnabled: boolean;
  cgmIntervalDays: number; // Default: 10
  cgmNotificationTime: string; // HH:MM format, e.g., "09:00"
  omnipodEnabled: boolean;
  omnipodIntervalDays: number; // Default: 3
  omnipodNotificationTime: string; // HH:MM format, e.g., "09:00"
  advanceWarningHours: number; // Hours before due date to send warning (default: 24)
}

const DEFAULT_SETTINGS: ReminderSettings = {
  cgmEnabled: true,
  cgmIntervalDays: 10,
  cgmNotificationTime: "09:00",
  omnipodEnabled: true,
  omnipodIntervalDays: 3,
  omnipodNotificationTime: "09:00",
  advanceWarningHours: 24,
};

class DiabetesRemindersService {
  private static instance: DiabetesRemindersService;
  private settings: ReminderSettings = DEFAULT_SETTINGS;
  private changeHistory: DeviceChangeRecord[] = [];
  private notificationIds: Map<string, string> = new Map();

  private constructor() {
    this.loadData();
    this.setupNotifications();
  }

  static getInstance(): DiabetesRemindersService {
    if (!DiabetesRemindersService.instance) {
      DiabetesRemindersService.instance = new DiabetesRemindersService();
    }
    return DiabetesRemindersService.instance;
  }

  private async loadData() {
    try {
      const [settingsData, historyData] = await Promise.all([
        AsyncStorage.getItem("diabetes_reminder_settings"),
        AsyncStorage.getItem("device_change_history"),
      ]);

      if (settingsData) {
        this.settings = JSON.parse(settingsData);
      }

      if (historyData) {
        this.changeHistory = JSON.parse(historyData).map((record: any) => ({
          ...record,
          changeDate: new Date(record.changeDate),
          nextChangeDate: new Date(record.nextChangeDate),
        }));
      }
    } catch (error) {
      console.error("Error loading diabetes reminders data:", error);
    }
  }

  private async saveData() {
    try {
      await Promise.all([
        AsyncStorage.setItem("diabetes_reminder_settings", JSON.stringify(this.settings)),
        AsyncStorage.setItem("device_change_history", JSON.stringify(this.changeHistory)),
      ]);
    } catch (error) {
      console.error("Error saving diabetes reminders data:", error);
    }
  }

  private async setupNotifications() {
    if (Platform.OS === "web") return;

    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.warn("Notification permissions not granted");
      return;
    }

    // Configure notification behavior
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }

  // Record a device change
  async recordDeviceChange(type: ReminderType, notes?: string): Promise<DeviceChangeRecord> {
    const changeDate = new Date();
    const intervalDays = type === "cgm_sensor" ? this.settings.cgmIntervalDays : this.settings.omnipodIntervalDays;
    
    const nextChangeDate = new Date(changeDate);
    nextChangeDate.setDate(nextChangeDate.getDate() + intervalDays);

    const record: DeviceChangeRecord = {
      id: `change_${type}_${Date.now()}`,
      type,
      changeDate,
      nextChangeDate,
      notes,
    };

    this.changeHistory.push(record);

    // Keep only last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    this.changeHistory = this.changeHistory.filter((r) => r.changeDate >= ninetyDaysAgo);

    await this.saveData();

    // Schedule notification for next change
    await this.scheduleReminder(type, nextChangeDate);

    return record;
  }

  // Schedule a reminder notification
  private async scheduleReminder(type: ReminderType, dueDate: Date): Promise<void> {
    if (Platform.OS === "web") return;

    const enabled = type === "cgm_sensor" ? this.settings.cgmEnabled : this.settings.omnipodEnabled;
    if (!enabled) return;

    // Cancel existing notification for this type
    const existingId = this.notificationIds.get(type);
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId);
    }

    const deviceName = type === "cgm_sensor" ? "CGM Sensor" : "Omnipod Pod";
    const notificationTime = type === "cgm_sensor" 
      ? this.settings.cgmNotificationTime 
      : this.settings.omnipodNotificationTime;

    // Parse notification time
    const [hours, minutes] = notificationTime.split(":").map(Number);
    
    // Set notification date/time
    const notificationDate = new Date(dueDate);
    notificationDate.setHours(hours, minutes, 0, 0);

    // Schedule advance warning (24 hours before)
    const warningDate = new Date(notificationDate);
    warningDate.setHours(warningDate.getHours() - this.settings.advanceWarningHours);

    try {
      // Schedule warning notification
      if (warningDate > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${deviceName} Change Reminder`,
            body: `Your ${deviceName.toLowerCase()} is due for change tomorrow. Have a replacement ready!`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: warningDate },
        });
      }

      // Schedule due notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${deviceName} Change Due Today!`,
          body: `It's time to change your ${deviceName.toLowerCase()}. Tap to log the change.`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: { type, action: "log_change" },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: notificationDate },
      });

      this.notificationIds.set(type, notificationId);
    } catch (error) {
      console.error(`Error scheduling ${type} reminder:`, error);
    }
  }

  // Get next change date for a device type
  getNextChangeDate(type: ReminderType): Date | null {
    const lastChange = this.changeHistory
      .filter((r) => r.type === type)
      .sort((a, b) => b.changeDate.getTime() - a.changeDate.getTime())[0];

    return lastChange ? lastChange.nextChangeDate : null;
  }

  // Get days until next change
  getDaysUntilChange(type: ReminderType): number | null {
    const nextDate = this.getNextChangeDate(type);
    if (!nextDate) return null;

    const now = new Date();
    const diffMs = nextDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  // Check if device change is overdue
  isOverdue(type: ReminderType): boolean {
    const daysUntil = this.getDaysUntilChange(type);
    return daysUntil !== null && daysUntil < 0;
  }

  // Get change history for a device type
  getChangeHistory(type: ReminderType, limit: number = 10): DeviceChangeRecord[] {
    return this.changeHistory
      .filter((r) => r.type === type)
      .sort((a, b) => b.changeDate.getTime() - a.changeDate.getTime())
      .slice(0, limit);
  }

  // Get all change history
  getAllChangeHistory(limit: number = 20): DeviceChangeRecord[] {
    return this.changeHistory
      .sort((a, b) => b.changeDate.getTime() - a.changeDate.getTime())
      .slice(0, limit);
  }

  // Update reminder settings
  async updateSettings(settings: Partial<ReminderSettings>): Promise<void> {
    this.settings = {
      ...this.settings,
      ...settings,
    };
    await this.saveData();

    // Reschedule notifications with new settings
    const cgmNext = this.getNextChangeDate("cgm_sensor");
    const omnipodNext = this.getNextChangeDate("omnipod_pod");

    if (cgmNext) await this.scheduleReminder("cgm_sensor", cgmNext);
    if (omnipodNext) await this.scheduleReminder("omnipod_pod", omnipodNext);
  }

  // Get current settings
  getSettings(): ReminderSettings {
    return this.settings;
  }

  // Snooze a reminder (postpone by specified hours)
  async snoozeReminder(type: ReminderType, hours: number = 2): Promise<void> {
    const nextDate = this.getNextChangeDate(type);
    if (!nextDate) return;

    const snoozeDate = new Date();
    snoozeDate.setHours(snoozeDate.getHours() + hours);

    await this.scheduleReminder(type, snoozeDate);
  }

  // Dismiss a reminder (mark as acknowledged)
  async dismissReminder(type: ReminderType): Promise<void> {
    const existingId = this.notificationIds.get(type);
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId);
      this.notificationIds.delete(type);
    }
  }

  // Get reminder status summary
  getReminderStatus(): {
    cgm: {
      enabled: boolean;
      nextChangeDate: Date | null;
      daysUntil: number | null;
      isOverdue: boolean;
      lastChangeDate: Date | null;
    };
    omnipod: {
      enabled: boolean;
      nextChangeDate: Date | null;
      daysUntil: number | null;
      isOverdue: boolean;
      lastChangeDate: Date | null;
    };
  } {
    const cgmHistory = this.getChangeHistory("cgm_sensor", 1);
    const omnipodHistory = this.getChangeHistory("omnipod_pod", 1);

    return {
      cgm: {
        enabled: this.settings.cgmEnabled,
        nextChangeDate: this.getNextChangeDate("cgm_sensor"),
        daysUntil: this.getDaysUntilChange("cgm_sensor"),
        isOverdue: this.isOverdue("cgm_sensor"),
        lastChangeDate: cgmHistory[0]?.changeDate || null,
      },
      omnipod: {
        enabled: this.settings.omnipodEnabled,
        nextChangeDate: this.getNextChangeDate("omnipod_pod"),
        daysUntil: this.getDaysUntilChange("omnipod_pod"),
        isOverdue: this.isOverdue("omnipod_pod"),
        lastChangeDate: omnipodHistory[0]?.changeDate || null,
      },
    };
  }

  // Calculate average days between changes (for compliance tracking)
  getAverageDaysBetweenChanges(type: ReminderType): number | null {
    const history = this.getChangeHistory(type);
    if (history.length < 2) return null;

    let totalDays = 0;
    for (let i = 0; i < history.length - 1; i++) {
      const diffMs = history[i].changeDate.getTime() - history[i + 1].changeDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      totalDays += diffDays;
    }

    return Math.round(totalDays / (history.length - 1));
  }

  // Check compliance (are changes happening on schedule?)
  getComplianceStatus(type: ReminderType): {
    isCompliant: boolean;
    averageDays: number | null;
    expectedDays: number;
    compliancePercentage: number;
  } {
    const averageDays = this.getAverageDaysBetweenChanges(type);
    const expectedDays = type === "cgm_sensor" ? this.settings.cgmIntervalDays : this.settings.omnipodIntervalDays;

    if (averageDays === null) {
      return {
        isCompliant: true,
        averageDays: null,
        expectedDays,
        compliancePercentage: 100,
      };
    }

    const compliancePercentage = Math.min(100, Math.round((expectedDays / averageDays) * 100));
    const isCompliant = averageDays <= expectedDays + 1; // Allow 1 day grace period

    return {
      isCompliant,
      averageDays,
      expectedDays,
      compliancePercentage,
    };
  }
}

export default DiabetesRemindersService.getInstance();
