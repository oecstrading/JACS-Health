import { ScrollView, Text, View, Pressable, type ViewStyle } from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { BackButton } from "@/components/back-button";
import { getAppointments, type Appointment } from "@/lib/storage";

/**
 * Appointments Screen - Medical Appointment Scheduling
 *
 * View and manage upcoming medical appointments with reminders.
 */
export default function AppointmentsScreen() {
  const colors = useColors();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const appointmentsData = await getAppointments();

      // If no appointments, show sample data
      if (appointmentsData.length === 0) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const sampleAppointments: Appointment[] = [
          {
            id: "1",
            title: "Annual Physical Exam",
            doctor: "Dr. Sarah Johnson",
            location: "HealthCare Clinic, 123 Main St",
            date: tomorrow.toISOString().split("T")[0],
            time: "10:00 AM",
            notes: "Bring medication list and insurance card",
            reminderSet: true,
          },
          {
            id: "2",
            title: "Cardiology Follow-up",
            doctor: "Dr. Michael Chen",
            location: "Heart Center, 456 Oak Ave",
            date: nextWeek.toISOString().split("T")[0],
            time: "2:30 PM",
            notes: "Discuss blood pressure medication",
            reminderSet: true,
          },
        ];
        setAppointments(sampleAppointments);
      } else {
        // Sort by date
        const sorted = appointmentsData.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setAppointments(sorted);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    alert(`Appointment Details:\n\n${appointment.title}\nwith ${appointment.doctor}\n\n${formatDate(appointment.date)} at ${appointment.time}\n\nLocation: ${appointment.location}\n\nNotes: ${appointment.notes || "None"}`);
  };

  const handleAddAppointment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    alert("Add appointment feature coming soon. You'll be able to schedule appointments with your doctors.");
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", { 
        weekday: "long", 
        month: "long", 
        day: "numeric" 
      });
    }
  };

  const getDaysUntil = (dateStr: string): number => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl text-muted" style={{ lineHeight: 28 }}>
            Loading appointments...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="px-6 pt-6">
        <BackButton />
      </View>
      {/* Header */}
      <View className="px-6 pb-4">
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          Appointments
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Manage your medical appointments
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Upcoming Appointments */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Upcoming Appointments
          </Text>
          {appointments.length === 0 ? (
            <View className="bg-surface rounded-3xl p-8 border border-border items-center">
              <IconSymbol name="clock.fill" size={48} color={colors.muted} />
              <Text className="text-lg text-muted text-center mt-4" style={{ lineHeight: 26 }}>
                No upcoming appointments
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {appointments.map(appointment => {
                const daysUntil = getDaysUntil(appointment.date);
                const isUrgent = daysUntil <= 1;

                return (
                  <Pressable
                    key={appointment.id}
                    onPress={() => handleAppointmentPress(appointment)}
                    style={({ pressed }) => [
                      {
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                        opacity: pressed ? 0.9 : 1,
                      } as ViewStyle,
                    ]}
                  >
                    <View 
                      className="bg-surface rounded-3xl p-6 border-2"
                      style={{ 
                        borderColor: isUrgent ? colors.warning : colors.border 
                      }}
                    >
                      {/* Date Badge */}
                      <View className="flex-row items-center justify-between mb-4">
                        <View
                          className="px-4 py-2 rounded-full"
                          style={{ backgroundColor: isUrgent ? `${colors.warning}20` : `${colors.primary}20` }}
                        >
                          <Text
                            className="text-sm font-semibold"
                            style={{ 
                              color: isUrgent ? colors.warning : colors.primary,
                              lineHeight: 18 
                            }}
                          >
                            {formatDate(appointment.date)}
                          </Text>
                        </View>
                        {appointment.reminderSet && (
                          <View className="flex-row items-center gap-2">
                            <IconSymbol name="bell.fill" size={16} color={colors.muted} />
                            <Text className="text-sm text-muted" style={{ lineHeight: 18 }}>
                              Reminder set
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Appointment Details */}
                      <View className="gap-3">
                        <View className="flex-row items-start gap-3">
                          <View
                            className="w-12 h-12 rounded-2xl items-center justify-center"
                            style={{ backgroundColor: `${colors.primary}20` }}
                          >
                            <IconSymbol name="heart.fill" size={24} color={colors.primary} />
                          </View>
                          <View className="flex-1">
                            <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                              {appointment.title}
                            </Text>
                            <Text className="text-lg text-muted mt-1" style={{ lineHeight: 24 }}>
                              {appointment.doctor}
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row items-center gap-2">
                          <IconSymbol name="clock.fill" size={20} color={colors.muted} />
                          <Text className="text-base text-foreground" style={{ lineHeight: 22 }}>
                            {appointment.time}
                          </Text>
                        </View>

                        <View className="flex-row items-start gap-2">
                          <IconSymbol name="location.fill" size={20} color={colors.muted} />
                          <Text className="text-base text-foreground flex-1" style={{ lineHeight: 22 }}>
                            {appointment.location}
                          </Text>
                        </View>

                        {appointment.notes && (
                          <View className="mt-2 p-3 bg-background rounded-2xl">
                            <Text className="text-base text-muted" style={{ lineHeight: 22 }}>
                              📝 {appointment.notes}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Add Appointment Button */}
        <View className="mb-8">
          <Pressable
            onPress={handleAddAppointment}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.8 : 1,
              } as ViewStyle,
            ]}
          >
            <View className="bg-surface rounded-3xl p-6 border-2 border-dashed border-border">
              <View className="flex-row items-center justify-center gap-3">
                <IconSymbol name="plus.circle.fill" size={32} color={colors.primary} />
                <Text className="text-xl font-semibold" style={{ color: colors.primary, lineHeight: 28 }}>
                  Schedule Appointment
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Quick Actions */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Quick Actions
          </Text>
          <View className="gap-4">
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                alert("Calendar sync coming soon");
              }}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                } as ViewStyle,
              ]}
            >
              <View className="bg-surface rounded-3xl p-5 border border-border flex-row items-center gap-4">
                <IconSymbol name="clock.fill" size={28} color={colors.primary} />
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground" style={{ lineHeight: 24 }}>
                    Sync with Calendar
                  </Text>
                  <Text className="text-sm text-muted mt-1" style={{ lineHeight: 18 }}>
                    Add to your device calendar
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={24} color={colors.muted} />
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                alert("Reminder settings coming soon");
              }}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                } as ViewStyle,
              ]}
            >
              <View className="bg-surface rounded-3xl p-5 border border-border flex-row items-center gap-4">
                <IconSymbol name="bell.fill" size={28} color={colors.primary} />
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground" style={{ lineHeight: 24 }}>
                    Reminder Settings
                  </Text>
                  <Text className="text-sm text-muted mt-1" style={{ lineHeight: 18 }}>
                    Customize notification timing
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={24} color={colors.muted} />
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
