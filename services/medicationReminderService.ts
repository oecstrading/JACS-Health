/**
 * Medication Reminder Automation Service
 * Sends voice reminders and push notifications for medications
 * with one-tap confirmation logging
 */

import { safeStorage as AsyncStorage } from '../lib/safeStorage';
import * as Notifications from 'expo-notifications';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export interface MedicationReminder {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  time: string; // HH:MM format
  enabled: boolean;
  voiceEnabled: boolean;
  notificationId?: string;
  lastTaken?: string;
  missedCount: number;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  takenTime: string;
  status: 'taken' | 'missed' | 'late';
}

const STORAGE_KEY = 'medication_reminders';
const LOG_KEY = 'medication_logs';

class MedicationReminderService {
  private reminders: MedicationReminder[] = [];
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Initialize the service and schedule all reminders
   */
  async initialize(): Promise<void> {
    try {
      await this.loadReminders();
      await this.scheduleAllReminders();
      this.startMissedDoseCheck();
    } catch (error) {
      console.error('Failed to initialize medication reminder service:', error);
    }
  }

  /**
   * Load reminders from storage
   */
  private async loadReminders(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.reminders = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  }

  /**
   * Save reminders to storage
   */
  private async saveReminders(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.reminders));
    } catch (error) {
      console.error('Failed to save reminders:', error);
    }
  }

  /**
   * Create a new medication reminder
   */
  async createReminder(
    medicationId: string,
    medicationName: string,
    dosage: string,
    time: string,
    voiceEnabled: boolean = true
  ): Promise<MedicationReminder> {
    const reminder: MedicationReminder = {
      id: `reminder-${Date.now()}`,
      medicationId,
      medicationName,
      dosage,
      time,
      enabled: true,
      voiceEnabled,
      missedCount: 0,
    };

    this.reminders.push(reminder);
    await this.saveReminders();
    await this.scheduleReminder(reminder);

    return reminder;
  }

  /**
   * Update an existing reminder
   */
  async updateReminder(reminderId: string, updates: Partial<MedicationReminder>): Promise<void> {
    const index = this.reminders.findIndex(r => r.id === reminderId);
    if (index === -1) return;

    const reminder = this.reminders[index];
    
    // Cancel old notification
    if (reminder.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
    }

    // Update reminder
    this.reminders[index] = { ...reminder, ...updates };
    await this.saveReminders();

    // Reschedule if enabled
    if (this.reminders[index].enabled) {
      await this.scheduleReminder(this.reminders[index]);
    }
  }

  /**
   * Delete a reminder
   */
  async deleteReminder(reminderId: string): Promise<void> {
    const reminder = this.reminders.find(r => r.id === reminderId);
    if (reminder && reminder.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
    }

    this.reminders = this.reminders.filter(r => r.id !== reminderId);
    await this.saveReminders();
  }

  /**
   * Schedule a single reminder
   */
  private async scheduleReminder(reminder: MedicationReminder): Promise<void> {
    if (!reminder.enabled) return;

    try {
      // Parse time (HH:MM)
      const [hours, minutes] = reminder.time.split(':').map(Number);
      
      // Schedule daily notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Time for Your Medication',
          body: `${reminder.medicationName} - ${reminder.dosage}`,
          data: {
            type: 'medication_reminder',
            reminderId: reminder.id,
            medicationId: reminder.medicationId,
            medicationName: reminder.medicationName,
            dosage: reminder.dosage,
            voiceEnabled: reminder.voiceEnabled,
          },
          sound: true,
          priority: 'high',
          categoryIdentifier: 'medication',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      reminder.notificationId = notificationId;
      await this.saveReminders();
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
    }
  }

  /**
   * Schedule all reminders
   */
  private async scheduleAllReminders(): Promise<void> {
    // Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule each enabled reminder
    for (const reminder of this.reminders) {
      if (reminder.enabled) {
        await this.scheduleReminder(reminder);
      }
    }
  }

  /**
   * Handle notification received (play voice reminder)
   */
  async handleNotificationReceived(notification: Notifications.Notification): Promise<void> {
    const data = notification.request.content.data as any;
    
    if (data.type === 'medication_reminder' && data.voiceEnabled) {
      await this.playVoiceReminder(data.medicationName as string, data.dosage as string);
    }
  }

  /**
   * Play voice reminder using text-to-speech
   */
  private async playVoiceReminder(medicationName: string, dosage: string): Promise<void> {
    if (Platform.OS === 'web') return; // Voice not supported on web

    try {
      const message = `It's time to take your medication. ${medicationName}, ${dosage}. Please tap the notification to confirm.`;
      
      await Speech.speak(message, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9, // Slightly slower for clarity
        voice: 'com.apple.ttsbundle.Samantha-compact', // iOS voice
      });
    } catch (error) {
      console.error('Failed to play voice reminder:', error);
    }
  }

  /**
   * Log medication taken (one-tap confirmation)
   */
  async logMedicationTaken(
    reminderId: string,
    takenTime?: string
  ): Promise<void> {
    const reminder = this.reminders.find(r => r.id === reminderId);
    if (!reminder) return;

    const now = takenTime || new Date().toISOString();
    
    // Update reminder
    reminder.lastTaken = now;
    reminder.missedCount = 0;
    await this.saveReminders();

    // Create log entry
    const log: MedicationLog = {
      id: `log-${Date.now()}`,
      medicationId: reminder.medicationId,
      medicationName: reminder.medicationName,
      dosage: reminder.dosage,
      scheduledTime: this.getTodayScheduledTime(reminder.time),
      takenTime: now,
      status: this.getLogStatus(reminder.time, now),
    };

    await this.saveMedicationLog(log);

    // Update medication adherence in main storage
    await this.updateMedicationAdherence(reminder.medicationId);
  }

  /**
   * Get today's scheduled time for a reminder
   */
  private getTodayScheduledTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  }

  /**
   * Determine if medication was taken on time, late, or missed
   */
  private getLogStatus(scheduledTime: string, takenTime: string): 'taken' | 'late' | 'missed' {
    const scheduled = this.getTodayScheduledTime(scheduledTime);
    const scheduledDate = new Date(scheduled);
    const takenDate = new Date(takenTime);
    
    const diffMinutes = (takenDate.getTime() - scheduledDate.getTime()) / (1000 * 60);
    
    if (diffMinutes <= 30) {
      return 'taken'; // Within 30 minutes
    } else if (diffMinutes <= 120) {
      return 'late'; // Within 2 hours
    } else {
      return 'missed'; // More than 2 hours late
    }
  }

  /**
   * Save medication log
   */
  private async saveMedicationLog(log: MedicationLog): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(LOG_KEY);
      const logs = stored ? JSON.parse(stored) : [];
      
      logs.push(log);
      
      // Keep only last 1000 logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }
      
      await AsyncStorage.setItem(LOG_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to save medication log:', error);
    }
  }

  /**
   * Update medication adherence tracking
   */
  private async updateMedicationAdherence(medicationId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('medications');
      if (!stored) return;
      
      const medications = JSON.parse(stored);
      const medication = medications.find((m: any) => m.id === medicationId);
      
      if (medication && typeof medication === 'object') {
        (medication as any).lastTaken = new Date().toISOString();
        medication.adherenceCount = (medication.adherenceCount || 0) + 1;
        await AsyncStorage.setItem('medications', JSON.stringify(medications));
      }
    } catch (error) {
      console.error('Failed to update medication adherence:', error);
    }
  }

  /**
   * Snooze a reminder (5, 10, or 15 minutes)
   */
  async snoozeReminder(reminderId: string, minutes: 5 | 10 | 15): Promise<void> {
    const reminder = this.reminders.find(r => r.id === reminderId);
    if (!reminder) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Medication Reminder (Snoozed)',
          body: `${reminder.medicationName} - ${reminder.dosage}`,
          data: {
            type: 'medication_reminder',
            reminderId: reminder.id,
            medicationId: reminder.medicationId,
            medicationName: reminder.medicationName,
            dosage: reminder.dosage,
            voiceEnabled: reminder.voiceEnabled,
          },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: minutes * 60,
        },
      });
    } catch (error) {
      console.error('Failed to snooze reminder:', error);
    }
  }

  /**
   * Check for missed doses and send follow-up notifications
   */
  private startMissedDoseCheck(): void {
    // Check every 30 minutes
    this.checkInterval = setInterval(async () => {
      await this.checkMissedDoses();
    }, 30 * 60 * 1000);
  }

  /**
   * Check for missed doses
   */
  private async checkMissedDoses(): Promise<void> {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (const reminder of this.reminders) {
      if (!reminder.enabled) continue;

      const [reminderHour, reminderMinute] = reminder.time.split(':').map(Number);
      
      // Check if reminder time has passed
      if (
        currentHour > reminderHour ||
        (currentHour === reminderHour && currentMinute > reminderMinute + 30)
      ) {
        // Check if medication was taken today
        const takenToday = reminder.lastTaken && 
          new Date(reminder.lastTaken).toDateString() === now.toDateString();

        if (!takenToday) {
          // Missed dose - send follow-up notification
          reminder.missedCount++;
          await this.saveReminders();
          await this.sendMissedDoseNotification(reminder);
        }
      }
    }
  }

  /**
   * Send missed dose notification
   */
  private async sendMissedDoseNotification(reminder: MedicationReminder): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Missed Medication',
          body: `You haven't taken ${reminder.medicationName} yet today. Please take it as soon as possible.`,
          data: {
            type: 'missed_medication',
            reminderId: reminder.id,
            medicationId: reminder.medicationId,
          },
          sound: true,
          priority: 'high',
        },
        trigger: null,
      });

      // Notify caregivers if multiple doses missed
      if (reminder.missedCount >= 2) {
        await this.notifyCaregivers(reminder);
      }
    } catch (error) {
      console.error('Failed to send missed dose notification:', error);
    }
  }

  /**
   * Notify caregivers about missed medications
   */
  private async notifyCaregivers(reminder: MedicationReminder): Promise<void> {
    try {
      const caregivers = await AsyncStorage.getItem('caregivers');
      if (caregivers) {
        // In production, send push notifications to caregiver devices
        console.log('Notifying caregivers about missed medication:', reminder.medicationName);
      }
    } catch (error) {
      console.error('Failed to notify caregivers:', error);
    }
  }

  /**
   * Get all reminders
   */
  getReminders(): MedicationReminder[] {
    return this.reminders;
  }

  /**
   * Get reminders for a specific medication
   */
  getRemindersForMedication(medicationId: string): MedicationReminder[] {
    return this.reminders.filter(r => r.medicationId === medicationId);
  }

  /**
   * Get medication logs
   */
  async getMedicationLogs(limit?: number): Promise<MedicationLog[]> {
    try {
      const stored = await AsyncStorage.getItem(LOG_KEY);
      if (!stored) return [];
      
      const logs = JSON.parse(stored);
      
      if (limit) {
        return logs.slice(-limit);
      }
      
      return logs;
    } catch (error) {
      console.error('Failed to get medication logs:', error);
      return [];
    }
  }

  /**
   * Get adherence statistics
   */
  async getAdherenceStats(days: number = 30): Promise<{
    totalDoses: number;
    takenOnTime: number;
    takenLate: number;
    missed: number;
    adherenceRate: number;
  }> {
    try {
      const logs = await this.getMedicationLogs();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const recentLogs = logs.filter(
        log => new Date(log.takenTime) >= cutoffDate
      );

      const takenOnTime = recentLogs.filter(log => log.status === 'taken').length;
      const takenLate = recentLogs.filter(log => log.status === 'late').length;
      const missed = recentLogs.filter(log => log.status === 'missed').length;
      const totalDoses = recentLogs.length;

      const adherenceRate = totalDoses > 0
        ? ((takenOnTime + takenLate) / totalDoses) * 100
        : 0;

      return {
        totalDoses,
        takenOnTime,
        takenLate,
        missed,
        adherenceRate,
      };
    } catch (error) {
      console.error('Failed to get adherence stats:', error);
      return {
        totalDoses: 0,
        takenOnTime: 0,
        takenLate: 0,
        missed: 0,
        adherenceRate: 0,
      };
    }
  }

  /**
   * Stop the service
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// Export singleton instance
export const medicationReminderService = new MedicationReminderService();
