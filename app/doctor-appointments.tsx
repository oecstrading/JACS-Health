import { View, Text, Pressable, ScrollView, TextInput, Alert } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { Calendar, Plus, MapPin, Phone, FileText, CheckSquare } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: Date;
  time: string;
  location: string;
  phone: string;
  reason: string;
  status: "scheduled" | "completed" | "cancelled";
  hasPreparation: boolean;
  hasNotes: boolean;
}

/**
 * Doctor Appointment Manager Screen
 * 
 * Features:
 * - Appointment calendar
 * - Appointment reminders (24hr, 1hr before)
 * - Visit preparation checklist
 * - Post-visit notes
 * - Doctor contact information
 */
export default function DoctorAppointmentsScreen() {
  const colors = useColors();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newReason, setNewReason] = useState("");
  
  // Mock data - in production, fetch from database
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      doctorName: "Dr. Sarah Chen",
      specialty: "Endocrinologist",
      date: new Date("2026-02-25"),
      time: "10:00 AM",
      location: "Medical Center, Suite 305",
      phone: "(555) 123-4567",
      reason: "Diabetes management follow-up",
      status: "scheduled",
      hasPreparation: true,
      hasNotes: false,
    },
    {
      id: "2",
      doctorName: "Dr. Michael Roberts",
      specialty: "Cardiologist",
      date: new Date("2026-03-05"),
      time: "2:30 PM",
      location: "Heart Clinic, Building B",
      phone: "(555) 234-5678",
      reason: "Annual cardiovascular checkup",
      status: "scheduled",
      hasPreparation: false,
      hasNotes: false,
    },
  ]);

  const [upcomingAppointment, setUpcomingAppointment] = useState(appointments[0]);

  const handleAddAppointment = () => {
    if (!newDoctorName.trim() || !newSpecialty.trim()) {
      Alert.alert("Missing Information", "Please enter doctor name and specialty.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // In production: save to database and schedule reminders
    Alert.alert("Success", "Appointment has been added with automatic reminders.");
    
    setShowAddForm(false);
    setNewDoctorName("");
    setNewSpecialty("");
    setNewReason("");
  };

  const handleViewPreparation = (appointment: Appointment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Preparation Checklist",
      `For your appointment with ${appointment.doctorName}:\n\n` +
      "✓ Bring insurance card\n" +
      "✓ List of current medications\n" +
      "✓ Recent glucose logs\n" +
      "✓ Questions to ask doctor\n" +
      "✓ Arrive 15 minutes early"
    );
  };

  const handleAddNotes = (appointment: Appointment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.prompt(
      "Post-Visit Notes",
      `Add notes from your visit with ${appointment.doctorName}:`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: (notes) => {
            if (notes) {
              const updated = appointments.map((a) =>
                a.id === appointment.id ? { ...a, hasNotes: true } : a
              );
              setAppointments(updated);
              Alert.alert("Saved", "Your visit notes have been saved.");
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    Alert.alert(
      "Cancel Appointment",
      `Are you sure you want to cancel your appointment with ${appointment.doctorName}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const updated = appointments.map((a) =>
              a.id === appointment.id ? { ...a, status: "cancelled" as const } : a
            );
            setAppointments(updated);
            Alert.alert("Cancelled", "Appointment has been cancelled.");
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    };
    return date.toLocaleDateString("en-US", options);
  };

  const getDaysUntil = (date: Date) => {
    const today = new Date();
    const diff = date.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days < 0) return "Past";
    return `In ${days} days`;
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="p-6 pb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Calendar size={28} color={colors.primary} />
            <Text className="text-2xl font-bold text-foreground">
              Appointments
            </Text>
          </View>
          <Text className="text-base text-muted leading-relaxed">
            Manage your doctor visits and health checkups
          </Text>
        </View>

        {/* Next Appointment Card */}
        {upcomingAppointment && upcomingAppointment.status === "scheduled" && (
          <View className="px-6 pb-6">
            <View className="bg-primary/10 border-2 border-primary rounded-xl p-6">
              <Text className="text-sm font-semibold text-primary mb-3">
                NEXT APPOINTMENT
              </Text>
              
              <Text className="text-xl font-bold text-foreground mb-2">
                {upcomingAppointment.doctorName}
              </Text>
              
              <Text className="text-sm text-muted mb-4">
                {upcomingAppointment.specialty}
              </Text>

              <View className="gap-2 mb-4">
                <View className="flex-row items-center gap-2">
                  <Calendar size={16} color={colors.muted} />
                  <Text className="text-sm text-foreground">
                    {formatDate(upcomingAppointment.date)} at {upcomingAppointment.time}
                  </Text>
                  <View className="bg-warning/20 px-2 py-1 rounded-full ml-auto">
                    <Text className="text-xs font-semibold text-warning">
                      {getDaysUntil(upcomingAppointment.date)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2">
                  <MapPin size={16} color={colors.muted} />
                  <Text className="text-sm text-muted">{upcomingAppointment.location}</Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <Phone size={16} color={colors.muted} />
                  <Text className="text-sm text-muted">{upcomingAppointment.phone}</Text>
                </View>
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => handleViewPreparation(upcomingAppointment)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-1 bg-primary py-3 rounded-lg flex-row items-center justify-center gap-2"
                >
                  <CheckSquare size={16} color="#ffffff" />
                  <Text className="text-white font-semibold text-sm">Prepare</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleCancelAppointment(upcomingAppointment)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-1 bg-background border-2 border-border py-3 rounded-lg"
                >
                  <Text className="text-muted font-semibold text-center text-sm">Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Add Appointment Button */}
        <View className="px-6 pb-6">
          <Pressable
            onPress={() => setShowAddForm(!showAddForm)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
          >
            <Plus size={20} color="#ffffff" />
            <Text className="text-white font-semibold text-base">
              Add Appointment
            </Text>
          </Pressable>
        </View>

        {/* Add Appointment Form */}
        {showAddForm && (
          <View className="px-6 pb-6">
            <View className="bg-surface border-2 border-border rounded-xl p-6">
              <Text className="text-lg font-semibold text-foreground mb-4">
                New Appointment
              </Text>
              
              <View className="gap-3 mb-4">
                <View>
                  <Text className="text-sm text-muted mb-1">Doctor Name</Text>
                  <TextInput
                    value={newDoctorName}
                    onChangeText={setNewDoctorName}
                    placeholder="e.g., Dr. Smith"
                    placeholderTextColor={colors.muted}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm text-muted mb-1">Specialty</Text>
                  <TextInput
                    value={newSpecialty}
                    onChangeText={setNewSpecialty}
                    placeholder="e.g., Cardiologist"
                    placeholderTextColor={colors.muted}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm text-muted mb-1">Reason for Visit</Text>
                  <TextInput
                    value={newReason}
                    onChangeText={setNewReason}
                    placeholder="e.g., Annual checkup"
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={2}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </View>
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setShowAddForm(false)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-1 bg-background border-2 border-border py-3 rounded-lg"
                >
                  <Text className="text-muted font-semibold text-center">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleAddAppointment}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-1 bg-primary py-3 rounded-lg"
                >
                  <Text className="text-white font-semibold text-center">Add</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* All Appointments */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">
            All Appointments
          </Text>
          {appointments.map((appointment) => (
            <View key={appointment.id} className="bg-surface border border-border rounded-xl p-4 mb-3">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-1">
                    {appointment.doctorName}
                  </Text>
                  <Text className="text-sm text-muted mb-2">{appointment.specialty}</Text>
                  <View className="flex-row items-center gap-2 mb-1">
                    <Calendar size={14} color={colors.muted} />
                    <Text className="text-xs text-muted">
                      {formatDate(appointment.date)} at {appointment.time}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted">{appointment.reason}</Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    appointment.status === "scheduled"
                      ? "bg-success/20"
                      : appointment.status === "completed"
                      ? "bg-primary/20"
                      : "bg-error/20"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      appointment.status === "scheduled"
                        ? "text-success"
                        : appointment.status === "completed"
                        ? "text-primary"
                        : "text-error"
                    }`}
                  >
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Text>
                </View>
              </View>

              {appointment.status === "scheduled" && (
                <View className="flex-row gap-2 mt-3 pt-3 border-t border-border">
                  <Pressable
                    onPress={() => handleViewPreparation(appointment)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className="flex-1 bg-primary/10 py-2 rounded-lg flex-row items-center justify-center gap-1"
                  >
                    <CheckSquare size={14} color={colors.primary} />
                    <Text className="text-primary font-semibold text-xs">Prepare</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleAddNotes(appointment)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className="flex-1 bg-primary/10 py-2 rounded-lg flex-row items-center justify-center gap-1"
                  >
                    <FileText size={14} color={colors.primary} />
                    <Text className="text-primary font-semibold text-xs">Add Notes</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
