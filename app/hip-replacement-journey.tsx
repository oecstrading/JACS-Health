import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

/**
 * Hip Replacement Journey Tracker
 * 
 * Comprehensive pre-op and post-op tracking:
 * - Surgery date countdown
 * - Pre-op checklist (medical clearance, PT, home prep)
 * - Post-op recovery timeline (Week 1-12 milestones)
 * - Recovery phase indicators
 * - Weight-bearing progression
 * - Surgeon contact and appointments
 */

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

interface RecoveryMilestone {
  week: number;
  title: string;
  goals: string[];
  completed: boolean;
}

const PRE_OP_CHECKLIST: ChecklistItem[] = [
  { id: "medical-clearance", title: "Medical clearance from primary doctor", completed: false },
  { id: "blood-work", title: "Pre-op blood work and tests", completed: false },
  { id: "dental-check", title: "Dental check-up (prevent infection)", completed: false },
  { id: "pt-exercises", title: "Pre-hab PT exercises (strengthen muscles)", completed: false },
  { id: "home-prep", title: "Prepare home (remove trip hazards, grab bars)", completed: false },
  { id: "equipment", title: "Get equipment (walker, raised toilet seat, reacher)", completed: false },
  { id: "meal-prep", title: "Prepare meals and freeze", completed: false },
  { id: "caregiver", title: "Arrange caregiver for first 2 weeks", completed: false },
];

const RECOVERY_MILESTONES: RecoveryMilestone[] = [
  {
    week: 1,
    title: "Week 1: Immediate Post-Op",
    goals: [
      "Walk 50-100 feet with walker 3x/day",
      "Ankle pumps and quad sets every hour",
      "Ice hip 20 min every 2-3 hours",
      "Pain management with prescribed meds",
    ],
    completed: false,
  },
  {
    week: 2,
    title: "Week 2: Early Recovery",
    goals: [
      "Walk 200-300 feet with walker",
      "Begin gentle hip exercises (PT approved)",
      "Attend 2-week follow-up appointment",
      "Wound check and staple removal",
    ],
    completed: false,
  },
  {
    week: 4,
    title: "Week 4: Progressing",
    goals: [
      "Transition from walker to cane",
      "Walk 500+ feet multiple times daily",
      "Climb stairs with assistance",
      "Increase exercise repetitions",
    ],
    completed: false,
  },
  {
    week: 6,
    title: "Week 6: Mid-Recovery",
    goals: [
      "6-week follow-up with surgeon",
      "Walk without assistive device (if cleared)",
      "Resume light activities (cooking, light housework)",
      "Drive short distances (if cleared)",
    ],
    completed: false,
  },
  {
    week: 12,
    title: "Week 12: Full Recovery",
    goals: [
      "12-week follow-up and X-rays",
      "Return to most normal activities",
      "Resume low-impact exercise (swimming, cycling)",
      "Minimal to no pain",
    ],
    completed: false,
  },
];

export default function HipReplacementJourney() {
  const colors = useColors();
  const [surgeryDate, setSurgeryDate] = useState<Date | null>(null);
  const [daysUntilSurgery, setDaysUntilSurgery] = useState<number | null>(null);
  const [daysSinceSurgery, setDaysSinceSurgery] = useState<number | null>(null);
  const [preOpChecklist, setPreOpChecklist] = useState<ChecklistItem[]>(PRE_OP_CHECKLIST);
  const [recoveryMilestones, setRecoveryMilestones] = useState<RecoveryMilestone[]>(RECOVERY_MILESTONES);
  const [currentPhase, setCurrentPhase] = useState<string>("Pre-Surgery");

  useEffect(() => {
    loadJourneyData();
  }, []);

  useEffect(() => {
    if (surgeryDate) {
      calculateDays();
    }
  }, [surgeryDate]);

  const loadJourneyData = async () => {
    try {
      const savedDate = await AsyncStorage.getItem("surgery_date");
      if (savedDate) {
        setSurgeryDate(new Date(savedDate));
      }
      // Load checklist and milestones from AsyncStorage
    } catch (error) {
      console.error("Error loading journey data:", error);
    }
  };

  const calculateDays = () => {
    if (!surgeryDate) return;
    
    const today = new Date();
    const diffTime = surgeryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      setDaysUntilSurgery(diffDays);
      setDaysSinceSurgery(null);
      setCurrentPhase("Pre-Surgery");
    } else {
      setDaysUntilSurgery(null);
      setDaysSinceSurgery(Math.abs(diffDays));
      
      // Determine recovery phase
      const daysSince = Math.abs(diffDays);
      if (daysSince <= 7) setCurrentPhase("Immediate Recovery");
      else if (daysSince <= 28) setCurrentPhase("Early Recovery");
      else if (daysSince <= 42) setCurrentPhase("Mid Recovery");
      else if (daysSince <= 84) setCurrentPhase("Late Recovery");
      else setCurrentPhase("Full Recovery");
    }
  };

  const handleSetSurgeryDate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Set Surgery Date",
      "In production, this would open a date picker. For demo, setting to 30 days from now.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Set Date",
          onPress: async () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);
            setSurgeryDate(futureDate);
            await AsyncStorage.setItem("surgery_date", futureDate.toISOString());
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleToggleChecklistItem = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = preOpChecklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setPreOpChecklist(updated);
    // Save to AsyncStorage
  };

  const handleToggleMilestone = async (week: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = recoveryMilestones.map((milestone) =>
      milestone.week === week ? { ...milestone, completed: !milestone.completed } : milestone
    );
    setRecoveryMilestones(updated);
    // Save to AsyncStorage
  };

  const completedChecklistItems = preOpChecklist.filter((item) => item.completed).length;
  const completedMilestones = recoveryMilestones.filter((m) => m.completed).length;

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          Hip Replacement Journey
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Track your surgery and recovery milestones
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Surgery Countdown/Progress */}
        {!surgeryDate ? (
          <Pressable
            onPress={handleSetSurgeryDate}
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              borderRadius: 24,
              padding: 24,
              marginBottom: 24,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View className="items-center">
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📅</Text>
              <Text className="text-2xl font-bold text-white text-center mb-2" style={{ lineHeight: 32 }}>
                Set Your Surgery Date
              </Text>
              <Text className="text-lg text-white opacity-90 text-center" style={{ lineHeight: 26 }}>
                Tap to schedule and start tracking
              </Text>
            </View>
          </Pressable>
        ) : (
          <View className="bg-surface rounded-3xl p-6 mb-6 border border-border">
            <View className="items-center">
              <Text style={{ fontSize: 48, marginBottom: 12 }}>
                {daysUntilSurgery !== null ? "⏳" : "✅"}
              </Text>
              {daysUntilSurgery !== null ? (
                <>
                  <Text className="text-5xl font-bold text-foreground mb-2" style={{ lineHeight: 60 }}>
                    {daysUntilSurgery}
                  </Text>
                  <Text className="text-2xl font-bold text-foreground mb-2" style={{ lineHeight: 32 }}>
                    Days Until Surgery
                  </Text>
                  <Text className="text-lg text-muted text-center" style={{ lineHeight: 26 }}>
                    {surgeryDate.toLocaleDateString("en-US", { 
                      weekday: "long", 
                      year: "numeric", 
                      month: "long", 
                      day: "numeric" 
                    })}
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-5xl font-bold text-foreground mb-2" style={{ lineHeight: 60 }}>
                    Day {daysSinceSurgery}
                  </Text>
                  <Text className="text-2xl font-bold text-foreground mb-2" style={{ lineHeight: 32 }}>
                    Post-Surgery
                  </Text>
                  <View
                    className="px-4 py-2 rounded-full mt-2"
                    style={{ backgroundColor: `${colors.success}20` }}
                  >
                    <Text className="text-base font-bold" style={{ color: colors.success, lineHeight: 22 }}>
                      {currentPhase}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Pre-Op Checklist */}
        {daysUntilSurgery !== null && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
                Pre-Op Checklist
              </Text>
              <Text className="text-lg font-bold" style={{ color: colors.primary, lineHeight: 26 }}>
                {completedChecklistItems}/{preOpChecklist.length}
              </Text>
            </View>
            <View className="gap-3">
              {preOpChecklist.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleToggleChecklistItem(item.id)}
                  style={({ pressed }) => ({
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: item.completed ? colors.success : `${colors.muted}20`,
                      }}
                    >
                      {item.completed && (
                        <IconSymbol name="checkmark" size={18} color="#ffffff" />
                      )}
                    </View>
                    <Text
                      className="flex-1 text-base text-foreground"
                      style={{
                        lineHeight: 22,
                        textDecorationLine: item.completed ? "line-through" : "none",
                        opacity: item.completed ? 0.6 : 1,
                      }}
                    >
                      {item.title}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Recovery Milestones */}
        {daysSinceSurgery !== null && (
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
                Recovery Milestones
              </Text>
              <Text className="text-lg font-bold" style={{ color: colors.success, lineHeight: 26 }}>
                {completedMilestones}/{recoveryMilestones.length}
              </Text>
            </View>
            <View className="gap-4">
              {recoveryMilestones.map((milestone) => (
                <View
                  key={milestone.week}
                  className="bg-surface rounded-3xl p-6 border border-border"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                      {milestone.title}
                    </Text>
                    <Pressable
                      onPress={() => handleToggleMilestone(milestone.week)}
                      style={({ pressed }) => ({
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: milestone.completed ? colors.success : `${colors.muted}20`,
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      {milestone.completed && (
                        <IconSymbol name="checkmark" size={18} color="#ffffff" />
                      )}
                    </Pressable>
                  </View>
                  <View className="gap-2">
                    {milestone.goals.map((goal, index) => (
                      <View key={index} className="flex-row items-start gap-2">
                        <Text className="text-base text-foreground" style={{ lineHeight: 22 }}>
                          •
                        </Text>
                        <Text className="flex-1 text-base text-foreground" style={{ lineHeight: 22 }}>
                          {goal}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Surgeon Contact */}
        <View className="bg-surface rounded-3xl p-6 mb-8 border border-border">
          <Text className="text-xl font-bold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Surgeon Contact
          </Text>
          <View className="gap-3">
            <View className="flex-row items-center gap-3">
              <IconSymbol name="person.fill" size={24} color={colors.primary} />
              <Text className="text-base text-foreground" style={{ lineHeight: 22 }}>
                Dr. Sarah Johnson, MD
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <IconSymbol name="phone.fill" size={24} color={colors.primary} />
              <Text className="text-base text-foreground" style={{ lineHeight: 22 }}>
                (555) 123-4567
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <IconSymbol name="envelope.fill" size={24} color={colors.primary} />
              <Text className="text-base text-foreground" style={{ lineHeight: 22 }}>
                orthopedics@hospital.com
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert("Call Surgeon", "In production, this would dial the surgeon's office.");
            }}
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              borderRadius: 12,
              padding: 16,
              marginTop: 16,
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text className="text-lg font-bold text-white" style={{ lineHeight: 26 }}>
              Call Surgeon's Office
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
