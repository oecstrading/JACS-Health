import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

interface Patient {
  id: string;
  name: string;
  age: number;
  photo?: string;
  healthStatus: "good" | "warning" | "critical";
  lastUpdate: Date;
  alerts: number;
  medicationAdherence: number; // 0-100
  todaysVitals: {
    bloodPressure?: string;
    heartRate?: number;
    weight?: number;
  };
}

export default function CaregiverDashboardScreen() {
  const colors = useColors();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    // In production, fetch from backend
    // Mock data for demonstration
    const mockPatients: Patient[] = [
      {
        id: "patient1",
        name: "Mom (Mary Johnson)",
        age: 72,
        healthStatus: "good",
        lastUpdate: new Date(),
        alerts: 0,
        medicationAdherence: 95,
        todaysVitals: {
          bloodPressure: "128/82",
          heartRate: 72,
          weight: 145,
        },
      },
      {
        id: "patient2",
        name: "Dad (Robert Johnson)",
        age: 75,
        healthStatus: "warning",
        lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        alerts: 2,
        medicationAdherence: 78,
        todaysVitals: {
          bloodPressure: "142/88",
          heartRate: 85,
        },
      },
      {
        id: "patient3",
        name: "Grandma (Helen Smith)",
        age: 88,
        healthStatus: "good",
        lastUpdate: new Date(Date.now() - 30 * 60 * 1000),
        alerts: 0,
        medicationAdherence: 100,
        todaysVitals: {
          bloodPressure: "118/76",
          heartRate: 68,
          weight: 132,
        },
      },
    ];

    setPatients(mockPatients);
  }

  function getStatusColor(status: Patient["healthStatus"]): string {
    switch (status) {
      case "good":
        return colors.success;
      case "warning":
        return "#F59E0B";
      case "critical":
        return colors.error;
      default:
        return colors.muted;
    }
  }

  function getStatusIcon(status: Patient["healthStatus"]): string {
    switch (status) {
      case "good":
        return "✅";
      case "warning":
        return "⚠️";
      case "critical":
        return "🚨";
      default:
        return "ℹ️";
    }
  }

  function formatLastUpdate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  if (selectedPatient) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Pressable
              onPress={() => setSelectedPatient(null)}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Text className="text-lg text-primary">← Back</Text>
            </Pressable>
            <Text className="text-2xl font-bold text-foreground">
              {selectedPatient.name}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Patient Details */}
          <View className="bg-surface p-6 rounded-2xl mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="w-16 h-16 rounded-full bg-primary items-center justify-center">
                <Text className="text-white text-2xl font-bold">
                  {selectedPatient.name.charAt(0)}
                </Text>
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-xl font-bold text-foreground">
                  {selectedPatient.name}
                </Text>
                <Text className="text-base text-muted">
                  Age: {selectedPatient.age}
                </Text>
              </View>
              <Text className="text-3xl">{getStatusIcon(selectedPatient.healthStatus)}</Text>
            </View>

            <View className="pt-4 border-t border-border">
              <Text className="text-sm text-muted mb-2">Last Update</Text>
              <Text className="text-base font-semibold text-foreground">
                {formatLastUpdate(selectedPatient.lastUpdate)}
              </Text>
            </View>
          </View>

          {/* Today's Vitals */}
          <View className="bg-surface p-6 rounded-2xl mb-6">
            <Text className="text-xl font-bold text-foreground mb-4">
              Today's Vitals
            </Text>
            <View className="gap-3">
              {selectedPatient.todaysVitals.bloodPressure && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-muted">Blood Pressure</Text>
                  <Text className="text-lg font-semibold text-foreground">
                    {selectedPatient.todaysVitals.bloodPressure} mmHg
                  </Text>
                </View>
              )}
              {selectedPatient.todaysVitals.heartRate && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-muted">Heart Rate</Text>
                  <Text className="text-lg font-semibold text-foreground">
                    {selectedPatient.todaysVitals.heartRate} bpm
                  </Text>
                </View>
              )}
              {selectedPatient.todaysVitals.weight && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-muted">Weight</Text>
                  <Text className="text-lg font-semibold text-foreground">
                    {selectedPatient.todaysVitals.weight} lbs
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Medication Adherence */}
          <View className="bg-surface p-6 rounded-2xl mb-6">
            <Text className="text-xl font-bold text-foreground mb-4">
              Medication Adherence
            </Text>
            <View className="flex-row items-center">
              <View className="flex-1 h-4 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full bg-success rounded-full"
                  style={{ width: `${selectedPatient.medicationAdherence}%` }}
                />
              </View>
              <Text className="text-lg font-bold text-foreground ml-4">
                {selectedPatient.medicationAdherence}%
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="gap-3 mb-8">
            <Pressable
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
              })}
              className="bg-primary py-4 rounded-xl items-center"
            >
              <Text className="text-white text-lg font-bold">View Full Health Report</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
              })}
              className="bg-surface py-4 rounded-xl items-center border border-border"
            >
              <Text className="text-foreground text-lg font-bold">Send Message</Text>
            </Pressable>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Family Dashboard
          </Text>
          <Text className="text-lg text-muted">
            Monitor your loved ones' health
          </Text>
        </View>

        {/* Summary Cards */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-surface p-4 rounded-2xl">
            <Text className="text-3xl font-bold text-foreground mb-1">
              {patients.length}
            </Text>
            <Text className="text-sm text-muted">Patients</Text>
          </View>
          <View className="flex-1 bg-surface p-4 rounded-2xl">
            <Text className="text-3xl font-bold text-error mb-1">
              {patients.reduce((sum, p) => sum + p.alerts, 0)}
            </Text>
            <Text className="text-sm text-muted">Active Alerts</Text>
          </View>
        </View>

        {/* Patients List */}
        <Text className="text-xl font-bold text-foreground mb-4">
          Your Patients
        </Text>

        {patients.map(patient => (
          <Pressable
            key={patient.id}
            onPress={() => setSelectedPatient(patient)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
            className="bg-surface p-5 rounded-2xl mb-4"
          >
            <View className="flex-row items-start">
              <View className="w-14 h-14 rounded-full bg-primary items-center justify-center mr-4">
                <Text className="text-white text-xl font-bold">
                  {patient.name.charAt(0)}
                </Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-lg font-bold text-foreground">
                    {patient.name}
                  </Text>
                  <Text className="text-2xl">{getStatusIcon(patient.healthStatus)}</Text>
                </View>
                <Text className="text-sm text-muted mb-3">
                  Age {patient.age} • Updated {formatLastUpdate(patient.lastUpdate)}
                </Text>

                <View className="flex-row items-center gap-4">
                  <View className="flex-row items-center">
                    <Text className="text-sm text-muted mr-1">Meds:</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {patient.medicationAdherence}%
                    </Text>
                  </View>
                  {patient.alerts > 0 && (
                    <View className="flex-row items-center">
                      <Text className="text-sm text-error font-semibold">
                        {patient.alerts} alert{patient.alerts > 1 ? "s" : ""}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Pressable>
        ))}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
