import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Medication, Appointment } from "./storage";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Notification permission not granted");
      return false;
    }

    // For Android, create notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("medication-reminders", {
        name: "Medication Reminders",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0a7ea4",
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("appointment-reminders", {
        name: "Appointment Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0a7ea4",
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("health-alerts", {
        name: "Health Alerts",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: "#EF4444",
        sound: "default",
      });
    }

    return true;
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}

/**
 * Schedule medication reminder notification
 */
export async function scheduleMedicationReminder(
  medication: Medication
): Promise<string | null> {
  try {
    // Parse time (format: "8:00 AM" or "20:00")
    const timeParts = medication.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!timeParts) {
      console.error("Invalid time format:", medication.time);
      return null;
    }

    let hour = parseInt(timeParts[1]);
    const minute = parseInt(timeParts[2]);
    const period = timeParts[3]?.toUpperCase();

    // Convert to 24-hour format
    if (period === "PM" && hour !== 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }

    const trigger: Notifications.DailyTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "💊 Time for Your Medication",
        body: `It's time to take ${medication.name} (${medication.dosage})`,
        data: {
          type: "medication",
          medicationId: medication.id,
          medicationName: medication.name,
        },
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.HIGH,
        categoryIdentifier: "medication-reminder",
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling medication reminder:", error);
    return null;
  }
}

/**
 * Schedule appointment reminder notification
 */
export async function scheduleAppointmentReminder(
  appointment: Appointment,
  minutesBefore: number = 60 // Default: 1 hour before
): Promise<string | null> {
  try {
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
    const reminderDate = new Date(appointmentDate.getTime() - minutesBefore * 60 * 1000);

    if (reminderDate.getTime() <= Date.now()) {
      console.warn("Appointment time is in the past");
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "📅 Upcoming Appointment",
        body: `${appointment.title} with ${appointment.doctor} in ${minutesBefore} minutes`,
        data: {
          type: "appointment",
          appointmentId: appointment.id,
          appointmentTitle: appointment.title,
        },
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.HIGH,
        categoryIdentifier: "appointment-reminder",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      } as Notifications.DateTriggerInput,
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling appointment reminder:", error);
    return null;
  }
}

/**
 * Send immediate health alert notification
 */
export async function sendHealthAlert(
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<string | null> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚠️ ${title}`,
        body: message,
        data: {
          type: "health-alert",
          ...data,
        },
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.MAX,
        categoryIdentifier: "health-alert",
      },
      trigger: null, // Send immediately
    });

    return notificationId;
  } catch (error) {
    console.error("Error sending health alert:", error);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error("Error canceling notification:", error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error canceling all notifications:", error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error getting scheduled notifications:", error);
    return [];
  }
}

/**
 * Set up notification response listener
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Set up notification received listener (for foreground notifications)
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Schedule daily health check-in reminder
 */
export async function scheduleDailyHealthCheckIn(hour: number = 9): Promise<string | null> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🌅 Good Morning!",
        body: "Time to log your morning vitals and medications",
        data: {
          type: "daily-checkin",
        },
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
      } as Notifications.DailyTriggerInput,
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling daily health check-in:", error);
    return null;
  }
}

/**
 * Reschedule all medication reminders
 */
export async function rescheduleMedicationReminders(medications: Medication[]): Promise<void> {
  try {
    // Cancel existing medication notifications
    const scheduled = await getAllScheduledNotifications();
    const medicationNotifications = scheduled.filter(
      n => n.content.data?.type === "medication"
    );
    
    for (const notification of medicationNotifications) {
      await cancelNotification(notification.identifier);
    }

    // Schedule new reminders
    for (const medication of medications) {
      await scheduleMedicationReminder(medication);
    }
  } catch (error) {
    console.error("Error rescheduling medication reminders:", error);
  }
}
