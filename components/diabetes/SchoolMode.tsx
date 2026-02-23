import { View, Text, Pressable, ScrollView, Switch } from "react-native";
import { useState, useEffect } from "react";
import { Bell, Clock, School, CheckCircle } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";

interface ReminderTime {
  id: string;
  label: string;
  time: string;
  description: string;
  completed: boolean;
}

interface SchoolModeData {
  enabled: boolean;
  reminders: ReminderTime[];
  lastResetDate: string;
}

const DEFAULT_REMINDERS: ReminderTime[] = [
  { id: "breakfast", label: "Before Breakfast", time: "07:00", description: "Check glucose before eating", completed: false },
  { id: "morning_snack", label: "Morning Snack", time: "10:00", description: "Mid-morning check", completed: false },
  { id: "before_lunch", label: "Before Lunch", time: "11:30", description: "Check before eating lunch", completed: false },
  { id: "after_lunch", label: "After Lunch", time: "13:00", description: "Post-lunch check", completed: false },
  { id: "recess", label: "Recess/PE", time: "14:30", description: "Check after physical activity", completed: false },
  { id: "after_school", label: "After School", time: "16:00", description: "End of school day check", completed: false },
  { id: "before_dinner", label: "Before Dinner", time: "18:00", description: "Check before evening meal", completed: false },
  { id: "bedtime", label: "Bedtime", time: "21:00", description: "Final check of the day", completed: false },
];

/**
 * School Mode - 8-Time Daily Reminder Schedule
 * 
 * Features:
 * - 8 pre-configured reminder times for kids at school
 * - Toggle to enable/disable school mode
 * - Check-off system for completed checks
 * - Daily reset at midnight
 * - Push notifications for each reminder
 * - Visual progress tracking
 */
export function SchoolMode() {
  const colors = useColors();
  const [schoolData, setSchoolData] = useState<SchoolModeData>({
    enabled: false,
    reminders: DEFAULT_REMINDERS,
    lastResetDate: new Date().toDateString(),
  });

  useEffect(() => {
    loadSchoolData();
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    saveSchoolData();
    if (schoolData.enabled) {
      scheduleNotifications();
    } else {
      cancelNotifications();
    }
  }, [schoolData.enabled]);

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.log("Notification permissions not granted");
    }
  };

  const loadSchoolData = async () => {
    try {
      const stored = await AsyncStorage.getItem("school_mode_data");
      if (stored) {
        const parsed = JSON.parse(stored);
        checkDailyReset(parsed);
      }
    } catch (error) {
      console.error("Error loading school mode data:", error);
    }
  };

  const saveSchoolData = async () => {
    try {
      await AsyncStorage.setItem("school_mode_data", JSON.stringify(schoolData));
    } catch (error) {
      console.error("Error saving school mode data:", error);
    }
  };

  const checkDailyReset = (data: SchoolModeData) => {
    const today = new Date().toDateString();
    if (data.lastResetDate !== today) {
      // Reset all completed flags
      setSchoolData({
        ...data,
        reminders: data.reminders.map((r) => ({ ...r, completed: false })),
        lastResetDate: today,
      });
    } else {
      setSchoolData(data);
    }
  };

  const scheduleNotifications = async () => {
    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule new notifications for each reminder
    for (const reminder of schoolData.reminders) {
      const [hours, minutes] = reminder.time.split(":").map(Number);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ ${reminder.label}`,
          body: reminder.description,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });
    }
  };

  const cancelNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const toggleSchoolMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSchoolData((prev) => ({
      ...prev,
      enabled: !prev.enabled,
    }));
  };

  const markReminderComplete = (reminderId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setSchoolData((prev) => ({
      ...prev,
      reminders: prev.reminders.map((r) =>
        r.id === reminderId ? { ...r, completed: !r.completed } : r
      ),
    }));
  };

  const completedCount = schoolData.reminders.filter((r) => r.completed).length;
  const totalCount = schoolData.reminders.length;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="p-6">
        {/* Header */}
        <View className="items-center mb-6">
          <View className="bg-primary/20 rounded-full p-4 mb-3">
            <School size={40} color={colors.primary} />
          </View>
          <Text className="text-3xl font-bold text-foreground mb-2">
            School Mode
          </Text>
          <Text className="text-base text-muted text-center">
            8 daily reminders to help kids manage diabetes at school
          </Text>
        </View>

        {/* Enable/Disable Toggle */}
        <View className="bg-surface border border-border rounded-xl p-6 mb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-lg font-semibold text-foreground mb-1">
                Enable School Mode
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                Turn on to receive 8 daily reminders for glucose checks throughout the school day
              </Text>
            </View>
            <Switch
              value={schoolData.enabled}
              onValueChange={toggleSchoolMode}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {schoolData.enabled && (
          <>
            {/* Progress Card */}
            <View className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-white/80 text-sm mb-1">Today's Progress</Text>
                  <Text className="text-white text-3xl font-bold">
                    {completedCount}/{totalCount}
                  </Text>
                </View>
                <View className="bg-white/20 rounded-full p-3">
                  <CheckCircle size={32} color="#ffffff" />
                </View>
              </View>

              {/* Progress Bar */}
              <View className="h-3 bg-white/20 rounded-full overflow-hidden">
                <View
                  style={{ width: `${progressPercent}%` }}
                  className="h-full bg-white rounded-full"
                />
              </View>

              <Text className="text-white/80 text-sm mt-2">
                {completedCount === totalCount
                  ? "🎉 All checks completed today!"
                  : `${totalCount - completedCount} checks remaining`}
              </Text>
            </View>

            {/* Reminder List */}
            <View>
              <Text className="text-xl font-bold text-foreground mb-4">
                Daily Reminder Schedule
              </Text>

              <View className="gap-3">
                {schoolData.reminders.map((reminder) => (
                  <Pressable
                    key={reminder.id}
                    onPress={() => markReminderComplete(reminder.id)}
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                    className={`bg-surface border-2 rounded-xl p-4 ${
                      reminder.completed ? "border-success" : "border-border"
                    }`}
                  >
                    <View className="flex-row items-center">
                      {/* Time Badge */}
                      <View className={`rounded-lg p-3 mr-3 ${reminder.completed ? "bg-success/20" : "bg-primary/20"}`}>
                        <Clock size={24} color={reminder.completed ? colors.success : colors.primary} />
                      </View>

                      {/* Content */}
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground mb-1">
                          {reminder.label}
                        </Text>
                        <Text className="text-sm text-muted mb-1">
                          {reminder.time} • {reminder.description}
                        </Text>
                      </View>

                      {/* Checkmark */}
                      {reminder.completed && (
                        <View className="bg-success rounded-full p-2">
                          <Text className="text-white font-bold text-lg">✓</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Info Card */}
            <View className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <View className="flex-row items-start gap-3">
                <Bell size={20} color={colors.primary} />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground mb-1">
                    Notifications Enabled
                  </Text>
                  <Text className="text-xs text-muted leading-relaxed">
                    You'll receive push notifications at each reminder time. Tap any reminder to mark it as completed.
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {!schoolData.enabled && (
          <View className="bg-muted/10 border border-muted/30 rounded-xl p-6 items-center">
            <Bell size={48} color={colors.muted} />
            <Text className="text-lg font-semibold text-muted mt-3 mb-2">
              School Mode is Off
            </Text>
            <Text className="text-sm text-muted text-center leading-relaxed">
              Enable School Mode above to start receiving daily reminders for glucose checks throughout the school day.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
