import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { BackButton } from "@/components/back-button";

interface Exercise {
  id: string;
  name: string;
  category: "strength" | "flexibility" | "balance" | "cardio" | "therapy";
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number; // minutes
  description: string;
  steps: string[];
  safetyTips: string[];
  videoUrl?: string;
}

interface WorkoutLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  date: Date;
  duration: number;
  completed: boolean;
}

export default function ExerciseScreen() {
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

  useEffect(() => {
    loadExercises();
    loadWorkoutLogs();
  }, []);

  async function loadExercises() {
    // Mock exercise library - in production, load from database
    const mockExercises: Exercise[] = [
      {
        id: "1",
        name: "Chair Squats",
        category: "strength",
        difficulty: "beginner",
        duration: 5,
        description: "Strengthen your legs and improve mobility using a chair for support",
        steps: [
          "Stand in front of a sturdy chair with feet shoulder-width apart",
          "Slowly lower yourself as if sitting down, keeping back straight",
          "Lightly touch the chair seat, then stand back up",
          "Repeat 10-15 times",
        ],
        safetyTips: [
          "Keep your knees behind your toes",
          "Use armrests for extra support if needed",
          "Stop if you feel pain or dizziness",
        ],
      },
      {
        id: "2",
        name: "Seated Arm Circles",
        category: "flexibility",
        difficulty: "beginner",
        duration: 3,
        description: "Improve shoulder flexibility and range of motion",
        steps: [
          "Sit upright in a chair with feet flat on floor",
          "Extend arms out to sides at shoulder height",
          "Make small circles forward for 30 seconds",
          "Reverse direction for 30 seconds",
          "Repeat 3 times",
        ],
        safetyTips: [
          "Keep movements slow and controlled",
          "Breathe normally throughout",
          "Stop if you feel shoulder pain",
        ],
      },
      {
        id: "3",
        name: "Standing Balance",
        category: "balance",
        difficulty: "beginner",
        duration: 5,
        description: "Improve balance and prevent falls",
        steps: [
          "Stand behind a sturdy chair, holding the back",
          "Lift one foot off the ground",
          "Hold for 10 seconds",
          "Lower foot and repeat with other leg",
          "Do 5 repetitions on each side",
        ],
        safetyTips: [
          "Always have chair support nearby",
          "Practice near a wall for extra safety",
          "Wear non-slip shoes",
        ],
      },
      {
        id: "4",
        name: "Gentle Walking",
        category: "cardio",
        difficulty: "beginner",
        duration: 15,
        description: "Low-impact cardio to improve heart health",
        steps: [
          "Walk at a comfortable pace",
          "Swing arms naturally",
          "Take breaks as needed",
          "Aim for 15-30 minutes total",
        ],
        safetyTips: [
          "Stay hydrated",
          "Walk in well-lit, safe areas",
          "Bring your phone",
        ],
      },
      {
        id: "5",
        name: "Ankle Rotations",
        category: "therapy",
        difficulty: "beginner",
        duration: 3,
        description: "Physical therapy exercise for ankle mobility",
        steps: [
          "Sit in a chair with one leg extended",
          "Rotate ankle in clockwise circles 10 times",
          "Rotate ankle counter-clockwise 10 times",
          "Repeat with other ankle",
        ],
        safetyTips: [
          "Move slowly and gently",
          "Stop if you feel pain",
          "Do 2-3 times daily",
        ],
      },
    ];

    setExercises(mockExercises);
  }

  async function loadWorkoutLogs() {
    // Mock workout history
    const mockLogs: WorkoutLog[] = [
      {
        id: "1",
        exerciseId: "1",
        exerciseName: "Chair Squats",
        date: new Date(2026, 1, 7),
        duration: 5,
        completed: true,
      },
      {
        id: "2",
        exerciseId: "3",
        exerciseName: "Standing Balance",
        date: new Date(2026, 1, 7),
        duration: 5,
        completed: true,
      },
    ];

    setWorkoutLogs(mockLogs);
  }

  function logWorkout(exercise: Exercise) {
    const newLog: WorkoutLog = {
      id: Date.now().toString(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      date: new Date(),
      duration: exercise.duration,
      completed: true,
    };

    setWorkoutLogs([...workoutLogs, newLog]);
    Alert.alert("Great Job!", `You completed ${exercise.name}! Keep up the good work! 🎉`);
  }

  const categories = [
    { id: "all", label: "All", icon: "📋" },
    { id: "strength", label: "Strength", icon: "💪" },
    { id: "flexibility", label: "Flexibility", icon: "🤸" },
    { id: "balance", label: "Balance", icon: "⚖️" },
    { id: "cardio", label: "Cardio", icon: "❤️" },
    { id: "therapy", label: "Therapy", icon: "🏥" },
  ];

  const filteredExercises =
    selectedCategory === "all"
      ? exercises
      : exercises.filter((e) => e.category === selectedCategory);

  const thisWeekWorkouts = workoutLogs.filter((log) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return log.date >= weekAgo;
  });

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackButton />
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-foreground">Exercise</Text>
          <View className="w-12" />
        </View>

        {/* Weekly Progress */}
        <View className="bg-primary p-6 rounded-2xl mb-6">
          <Text className="text-white text-xl font-bold mb-2">This Week</Text>
          <Text className="text-white text-4xl font-bold mb-1">
            {thisWeekWorkouts.length}
          </Text>
          <Text className="text-white opacity-90">workouts completed</Text>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
          contentContainerStyle={{ gap: 8 }}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === cat.id
                  ? "bg-primary"
                  : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`text-base font-semibold ${
                  selectedCategory === cat.id ? "text-white" : "text-foreground"
                }`}
              >
                {cat.icon} {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Exercise List */}
        <View className="gap-4 mb-8">
          {filteredExercises.map((exercise) => (
            <View key={exercise.id} className="bg-surface p-6 rounded-2xl">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-foreground mb-1">
                    {exercise.name}
                  </Text>
                  <View className="flex-row gap-2 mb-2">
                    <View className="bg-primary/20 px-3 py-1 rounded-full">
                      <Text className="text-sm text-primary capitalize">
                        {exercise.difficulty}
                      </Text>
                    </View>
                    <View className="bg-background px-3 py-1 rounded-full">
                      <Text className="text-sm text-muted">{exercise.duration} min</Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text className="text-base text-muted mb-4">{exercise.description}</Text>

              {/* Steps */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-foreground mb-2">
                  Steps:
                </Text>
                {exercise.steps.map((step, index) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <Text className="text-primary font-semibold mr-2">{index + 1}.</Text>
                    <Text className="text-base text-foreground flex-1">{step}</Text>
                  </View>
                ))}
              </View>

              {/* Safety Tips */}
              <View className="bg-background p-4 rounded-xl mb-4">
                <Text className="text-base font-semibold text-foreground mb-2">
                  ⚠️ Safety Tips:
                </Text>
                {exercise.safetyTips.map((tip, index) => (
                  <View key={index} className="flex-row items-start mb-1">
                    <Text className="text-warning mr-2">•</Text>
                    <Text className="text-sm text-muted flex-1">{tip}</Text>
                  </View>
                ))}
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => logWorkout(exercise)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  className="flex-1 bg-primary py-3 rounded-xl items-center"
                >
                  <Text className="text-white font-bold">✓ Mark Complete</Text>
                </Pressable>
                {exercise.videoUrl && (
                  <Pressable
                    onPress={() => Alert.alert("Video", "Video player would open here")}
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                    className="bg-background border border-border py-3 px-4 rounded-xl items-center"
                  >
                    <Text className="text-foreground font-bold">▶️</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Workout History */}
        <View className="bg-surface p-6 rounded-2xl mb-8">
          <Text className="text-xl font-bold text-foreground mb-4">Recent Workouts</Text>
          {workoutLogs.length === 0 ? (
            <Text className="text-base text-muted text-center py-4">
              No workouts logged yet. Complete an exercise to get started!
            </Text>
          ) : (
            <View className="gap-3">
              {workoutLogs.slice(-5).reverse().map((log) => (
                <View key={log.id} className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {log.exerciseName}
                    </Text>
                    <Text className="text-sm text-muted">
                      {log.date.toLocaleDateString()} • {log.duration} min
                    </Text>
                  </View>
                  <Text className="text-2xl">✅</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
