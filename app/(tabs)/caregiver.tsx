import { ScrollView, Text, View, Pressable, type ViewStyle } from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { getCaregivers, getMedications, getVitals, type Caregiver } from "@/lib/storage";

/**
 * Caregiver Screen - Family Connection and Monitoring
 *
 * Allows family caregivers to monitor health data and receive alerts.
 */
export default function CaregiverScreen() {
  const colors = useColors();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [medicationAdherence, setMedicationAdherence] = useState(0);
  const [lastVitalCheck, setLastVitalCheck] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCaregiverData();
  }, []);

  const loadCaregiverData = async () => {
    try {
      setLoading(true);
      const [caregiversData, medications, vitals] = await Promise.all([
        getCaregivers(),
        getMedications(),
        getVitals(),
      ]);

      // If no caregivers, show sample data
      if (caregiversData.length === 0) {
        const sampleCaregivers: Caregiver[] = [
          {
            id: "1",
            name: "Sarah Johnson",
            email: "sarah@example.com",
            phone: "+1 (555) 123-4567",
            relationship: "Daughter",
            permissions: {
              viewMedications: true,
              viewVitals: true,
              viewActivity: true,
              receiveAlerts: true,
            },
          },
          {
            id: "2",
            name: "Dr. Michael Chen",
            email: "dr.chen@healthclinic.com",
            phone: "+1 (555) 987-6543",
            relationship: "Primary Care Physician",
            permissions: {
              viewMedications: true,
              viewVitals: true,
              viewActivity: true,
              receiveAlerts: true,
            },
          },
        ];
        setCaregivers(sampleCaregivers);
      } else {
        setCaregivers(caregiversData);
      }

      // Calculate medication adherence (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentMeds = medications.filter(m => new Date(m.date) >= sevenDaysAgo);
      const takenMeds = recentMeds.filter(m => m.taken).length;
      const adherence = recentMeds.length > 0 ? (takenMeds / recentMeds.length) * 100 : 0;
      setMedicationAdherence(Math.round(adherence));

      // Get last vital check time
      if (vitals.length > 0) {
        const sortedVitals = vitals.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const lastVital = sortedVitals[0];
        const vitalDate = new Date(lastVital.date);
        const now = new Date();
        const hoursDiff = Math.floor((now.getTime() - vitalDate.getTime()) / (1000 * 60 * 60));
        
        if (hoursDiff < 24) {
          setLastVitalCheck(`${hoursDiff} hours ago`);
        } else {
          const daysDiff = Math.floor(hoursDiff / 24);
          setLastVitalCheck(`${daysDiff} day${daysDiff > 1 ? 's' : ''} ago`);
        }
      } else {
        setLastVitalCheck("No vitals recorded");
      }
    } catch (error) {
      console.error("Error loading caregiver data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteCaregiver = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    alert("Invite caregiver feature coming soon. You'll be able to send email or SMS invitations.");
  };

  const handleCaregiverPress = (caregiver: Caregiver) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    alert(`Contact ${caregiver.name} at ${caregiver.phone}`);
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl text-muted" style={{ lineHeight: 28 }}>
            Loading caregiver data...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          Family Caregivers
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Stay connected with your care team
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Health Summary for Caregivers */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Health Summary
          </Text>
          <View className="gap-4">
            <View className="bg-surface rounded-3xl p-6 border border-border">
              <View className="flex-row items-center gap-4">
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: `${colors.success}20` }}
                >
                  <IconSymbol name="pills.fill" size={32} color={colors.success} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg text-muted" style={{ lineHeight: 24 }}>
                    Medication Adherence
                  </Text>
                  <Text className="text-3xl font-bold text-foreground mt-1" style={{ lineHeight: 40 }}>
                    {medicationAdherence}%
                  </Text>
                </View>
              </View>
              <View className="mt-4 h-3 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{ width: `${medicationAdherence}%`, backgroundColor: colors.success }}
                />
              </View>
              <Text className="text-base text-muted mt-2" style={{ lineHeight: 22 }}>
                Last 7 days
              </Text>
            </View>

            <View className="bg-surface rounded-3xl p-6 border border-border">
              <View className="flex-row items-center gap-4">
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: `${colors.primary}20` }}
                >
                  <IconSymbol name="heart.fill" size={32} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg text-muted" style={{ lineHeight: 24 }}>
                    Last Vital Check
                  </Text>
                  <Text className="text-2xl font-bold text-foreground mt-1" style={{ lineHeight: 32 }}>
                    {lastVitalCheck}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Connected Caregivers */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Connected Caregivers
          </Text>
          <View className="gap-4">
            {caregivers.map(caregiver => (
              <Pressable
                key={caregiver.id}
                onPress={() => handleCaregiverPress(caregiver)}
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    opacity: pressed ? 0.9 : 1,
                  } as ViewStyle,
                ]}
              >
                <View className="bg-surface rounded-3xl p-6 border border-border">
                  <View className="flex-row items-center gap-4">
                    <View
                      className="w-16 h-16 rounded-full items-center justify-center"
                      style={{ backgroundColor: `${colors.primary}20` }}
                    >
                      <IconSymbol name="person.2.fill" size={32} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xl font-semibold text-foreground" style={{ lineHeight: 28 }}>
                        {caregiver.name}
                      </Text>
                      <Text className="text-base text-muted mt-1" style={{ lineHeight: 22 }}>
                        {caregiver.relationship}
                      </Text>
                      <Text className="text-sm text-muted mt-1" style={{ lineHeight: 18 }}>
                        {caregiver.phone}
                      </Text>
                    </View>
                    <IconSymbol name="chevron.right" size={24} color={colors.muted} />
                  </View>

                  {/* Permissions */}
                  <View className="mt-4 pt-4 border-t border-border">
                    <Text className="text-sm text-muted mb-2" style={{ lineHeight: 18 }}>
                      Can view:
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {caregiver.permissions.viewMedications && (
                        <View className="bg-background px-3 py-1 rounded-full">
                          <Text className="text-sm text-foreground" style={{ lineHeight: 18 }}>
                            Medications
                          </Text>
                        </View>
                      )}
                      {caregiver.permissions.viewVitals && (
                        <View className="bg-background px-3 py-1 rounded-full">
                          <Text className="text-sm text-foreground" style={{ lineHeight: 18 }}>
                            Vitals
                          </Text>
                        </View>
                      )}
                      {caregiver.permissions.viewActivity && (
                        <View className="bg-background px-3 py-1 rounded-full">
                          <Text className="text-sm text-foreground" style={{ lineHeight: 18 }}>
                            Activity
                          </Text>
                        </View>
                      )}
                      {caregiver.permissions.receiveAlerts && (
                        <View className="bg-background px-3 py-1 rounded-full">
                          <Text className="text-sm text-foreground" style={{ lineHeight: 18 }}>
                            Alerts
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Invite Caregiver Button */}
        <View className="mb-8">
          <Pressable
            onPress={handleInviteCaregiver}
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
                  Invite Caregiver
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Privacy Notice */}
        <View className="bg-surface rounded-2xl p-4 mb-8 border border-border">
          <View className="flex-row items-start gap-3">
            <IconSymbol name="gearshape.fill" size={20} color={colors.muted} />
            <View className="flex-1">
              <Text className="text-sm text-muted" style={{ lineHeight: 18 }}>
                You control who sees your health data. Manage permissions in Settings.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
