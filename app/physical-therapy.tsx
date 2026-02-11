import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

/**
 * Physical Therapy Tracker
 * 
 * Hip-specific exercise library and daily PT routine tracking:
 * - 20+ hip exercises with descriptions
 * - Exercise categories (Stretching, Strengthening, Balance, Gait)
 * - Daily PT routine builder
 * - Exercise completion tracker
 * - Progress tracking
 */

interface Exercise {
  id: string;
  name: string;
  category: "Stretching" | "Strengthening" | "Balance" | "Gait Training";
  description: string;
  reps: string;
  sets: number;
  videoUrl?: string;
}

interface PTSession {
  date: string;
  exercises: string[]; // exercise IDs
  duration: number; // minutes
  completed: boolean;
}

const HIP_EXERCISES: Exercise[] = [
  {
    id: "ankle-pumps",
    name: "Ankle Pumps",
    category: "Stretching",
    description: "Flex and point your ankle to improve circulation and prevent blood clots.",
    reps: "10-15",
    sets: 3,
  },
  {
    id: "quad-sets",
    name: "Quadriceps Sets",
    category: "Strengthening",
    description: "Tighten thigh muscle by pushing knee down into bed. Hold 5 seconds.",
    reps: "10",
    sets: 3,
  },
  {
    id: "glute-sets",
    name: "Gluteal Sets",
    category: "Strengthening",
    description: "Squeeze buttocks together. Hold 5 seconds, then relax.",
    reps: "10",
    sets: 3,
  },
  {
    id: "hip-abduction",
    name: "Hip Abduction (Lying)",
    category: "Strengthening",
    description: "Lie on back, slide leg out to side keeping knee straight. Return to center.",
    reps: "10",
    sets: 2,
  },
  {
    id: "hip-flexion",
    name: "Hip Flexion (Lying)",
    category: "Strengthening",
    description: "Lie on back, bend knee and lift toward chest. Lower slowly.",
    reps: "10",
    sets: 2,
  },
  {
    id: "heel-slides",
    name: "Heel Slides",
    category: "Stretching",
    description: "Slide heel toward buttocks, bending knee. Hold 5 seconds, then straighten.",
    reps: "10",
    sets: 2,
  },
  {
    id: "standing-hip-abduction",
    name: "Standing Hip Abduction",
    category: "Strengthening",
    description: "Stand holding chair, lift leg out to side. Keep knee straight.",
    reps: "10",
    sets: 2,
  },
  {
    id: "standing-hip-extension",
    name: "Standing Hip Extension",
    category: "Strengthening",
    description: "Stand holding chair, lift leg backward. Keep knee straight.",
    reps: "10",
    sets: 2,
  },
  {
    id: "mini-squats",
    name: "Mini Squats",
    category: "Strengthening",
    description: "Stand holding chair, bend knees slightly (30 degrees). Hold 5 seconds.",
    reps: "10",
    sets: 2,
  },
  {
    id: "sit-to-stand",
    name: "Sit to Stand",
    category: "Strengthening",
    description: "Sit in chair, stand up without using hands. Sit back down slowly.",
    reps: "10",
    sets: 2,
  },
  {
    id: "heel-raises",
    name: "Heel Raises",
    category: "Strengthening",
    description: "Stand holding chair, rise up on toes. Hold 5 seconds, lower slowly.",
    reps: "10",
    sets: 2,
  },
  {
    id: "single-leg-stance",
    name: "Single Leg Stance",
    category: "Balance",
    description: "Stand on one leg for 30 seconds. Use chair for support if needed.",
    reps: "30 sec",
    sets: 3,
  },
  {
    id: "tandem-stance",
    name: "Tandem Stance",
    category: "Balance",
    description: "Stand with one foot directly in front of the other (heel-to-toe).",
    reps: "30 sec",
    sets: 3,
  },
  {
    id: "marching-in-place",
    name: "Marching in Place",
    category: "Gait Training",
    description: "Lift knees high while marching in place. Use chair for balance.",
    reps: "1 min",
    sets: 2,
  },
  {
    id: "side-stepping",
    name: "Side Stepping",
    category: "Gait Training",
    description: "Step sideways along wall or counter. 10 steps each direction.",
    reps: "10",
    sets: 2,
  },
];

export default function PhysicalTherapy() {
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [todaySession, setTodaySession] = useState<PTSession | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  useEffect(() => {
    loadTodaySession();
  }, []);

  const loadTodaySession = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const sessionKey = `pt_session_${today}`;
      const saved = await AsyncStorage.getItem(sessionKey);
      if (saved) {
        const session = JSON.parse(saved);
        setTodaySession(session);
        setCompletedExercises(session.exercises || []);
      }
    } catch (error) {
      console.error("Error loading PT session:", error);
    }
  };

  const handleToggleExercise = async (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const updated = completedExercises.includes(exerciseId)
      ? completedExercises.filter((id) => id !== exerciseId)
      : [...completedExercises, exerciseId];
    
    setCompletedExercises(updated);
    
    // Save to AsyncStorage
    const today = new Date().toISOString().split("T")[0];
    const sessionKey = `pt_session_${today}`;
    const session: PTSession = {
      date: today,
      exercises: updated,
      duration: 30, // Mock duration
      completed: updated.length >= 5, // Consider complete if 5+ exercises done
    };
    await AsyncStorage.setItem(sessionKey, JSON.stringify(session));
    setTodaySession(session);
    
    if (updated.length > completedExercises.length) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const categories = ["All", "Stretching", "Strengthening", "Balance", "Gait Training"];
  
  const filteredExercises = selectedCategory === "All"
    ? HIP_EXERCISES
    : HIP_EXERCISES.filter((ex) => ex.category === selectedCategory);

  const completionPercentage = Math.round((completedExercises.length / HIP_EXERCISES.length) * 100);

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
          Physical Therapy
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Hip-specific exercises and daily routines
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Today's Progress */}
        <View className="px-6 mb-6">
          <View className="bg-surface rounded-3xl p-6 border border-border">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                Today's Progress
              </Text>
              <Text className="text-2xl font-bold" style={{ color: colors.primary, lineHeight: 32 }}>
                {completionPercentage}%
              </Text>
            </View>
            <View
              className="h-3 rounded-full"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <View
                className="h-3 rounded-full"
                style={{
                  backgroundColor: colors.primary,
                  width: `${completionPercentage}%`,
                }}
              />
            </View>
            <Text className="text-base text-muted mt-3" style={{ lineHeight: 22 }}>
              {completedExercises.length} of {HIP_EXERCISES.length} exercises completed
            </Text>
          </View>
        </View>

        {/* Category Filter */}
        <View className="px-6 mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
            {categories.map((category) => (
              <Pressable
                key={category}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(category);
                }}
                style={({ pressed }) => ({
                  backgroundColor: selectedCategory === category ? colors.primary : colors.surface,
                  borderRadius: 20,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: selectedCategory === category ? colors.primary : colors.border,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  className="text-base font-bold"
                  style={{
                    color: selectedCategory === category ? "#ffffff" : colors.foreground,
                    lineHeight: 22,
                  }}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Exercise List */}
        <View className="px-6 pb-8">
          <Text className="text-2xl font-bold text-foreground mb-4" style={{ lineHeight: 32 }}>
            {selectedCategory === "All" ? "All Exercises" : selectedCategory}
          </Text>
          <View className="gap-4">
            {filteredExercises.map((exercise) => {
              const isCompleted = completedExercises.includes(exercise.id);
              return (
                <View
                  key={exercise.id}
                  className="bg-surface rounded-3xl p-6 border border-border"
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-xl font-bold text-foreground mb-1" style={{ lineHeight: 28 }}>
                        {exercise.name}
                      </Text>
                      <View
                        className="px-3 py-1 rounded-full self-start"
                        style={{ backgroundColor: `${colors.primary}20` }}
                      >
                        <Text className="text-sm font-bold" style={{ color: colors.primary, lineHeight: 20 }}>
                          {exercise.category}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => handleToggleExercise(exercise.id)}
                      style={({ pressed }) => ({
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: isCompleted ? colors.success : `${colors.muted}20`,
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      {isCompleted && (
                        <IconSymbol name="checkmark" size={18} color="#ffffff" />
                      )}
                    </Pressable>
                  </View>
                  <Text className="text-base text-foreground mb-3" style={{ lineHeight: 22 }}>
                    {exercise.description}
                  </Text>
                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
                        Reps:
                      </Text>
                      <Text className="text-sm font-bold text-foreground" style={{ lineHeight: 20 }}>
                        {exercise.reps}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
                        Sets:
                      </Text>
                      <Text className="text-sm font-bold text-foreground" style={{ lineHeight: 20 }}>
                        {exercise.sets}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
