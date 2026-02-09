import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

/**
 * Mood & Cognitive Baseline Tracker
 * 
 * Tracks mood, mental clarity, memory, concentration, and sleep quality over time.
 * Designed for patients with Multiple Psychosis to monitor changes and identify triggers.
 * Cross-references with thyroid and autoimmune conditions.
 */

interface MoodEntry {
  id: string;
  date: string;
  moodRating: number; // 1-10
  mentalClarity: number; // 1-10
  memoryFunction: number; // 1-10
  concentration: number; // 1-10
  sleepQuality: number; // 1-10
  notes: string;
  medications: string[];
  triggers?: string;
}

const STORAGE_KEY = "@mood_cognitive_entries";

export default function MoodCognitiveTrackerScreen() {
  const colors = useColors();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [showNewEntry, setShowNewEntry] = useState(false);

  // New entry state
  const [moodRating, setMoodRating] = useState(5);
  const [mentalClarity, setMentalClarity] = useState(5);
  const [memoryFunction, setMemoryFunction] = useState(5);
  const [concentration, setConcentration] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [notes, setNotes] = useState("");
  const [triggers, setTriggers] = useState("");

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setEntries(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading mood entries:", error);
    }
  };

  const saveEntry = async () => {
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      moodRating,
      mentalClarity,
      memoryFunction,
      concentration,
      sleepQuality,
      notes,
      medications: [], // TODO: Pull from medication tracking
      triggers: triggers || undefined,
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Reset form
    setMoodRating(5);
    setMentalClarity(5);
    setMemoryFunction(5);
    setConcentration(5);
    setSleepQuality(5);
    setNotes("");
    setTriggers("");
    setShowNewEntry(false);
  };

  const renderRatingScale = (
    label: string,
    value: number,
    setValue: (v: number) => void,
    lowLabel: string,
    highLabel: string
  ) => {
    return (
      <View className="mb-6">
        <Text
          style={{
            fontSize: 17,
            fontWeight: "600",
            color: colors.foreground,
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
        <View className="flex-row items-center justify-between mb-2">
          <Text style={{ fontSize: 13, color: colors.muted }}>{lowLabel}</Text>
          <Text style={{ fontSize: 13, color: colors.muted }}>{highLabel}</Text>
        </View>
        <View className="flex-row justify-between">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <TouchableOpacity
              key={num}
              onPress={() => setValue(num)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: value === num ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: value === num ? colors.primary : colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: value === num ? "700" : "600",
                  color: value === num ? "#FFFFFF" : colors.foreground,
                }}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const getAverages = () => {
    if (entries.length === 0) return null;

    const recent = entries.slice(0, 7); // Last 7 entries
    const avg = {
      mood: recent.reduce((sum, e) => sum + e.moodRating, 0) / recent.length,
      clarity: recent.reduce((sum, e) => sum + e.mentalClarity, 0) / recent.length,
      memory: recent.reduce((sum, e) => sum + e.memoryFunction, 0) / recent.length,
      concentration: recent.reduce((sum, e) => sum + e.concentration, 0) / recent.length,
      sleep: recent.reduce((sum, e) => sum + e.sleepQuality, 0) / recent.length,
    };

    return avg;
  };

  const averages = getAverages();

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="px-6 pt-4 pb-4">
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 16, color: colors.primary }}>← Back</Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 8,
            }}
          >
            Mood & Cognitive Baseline
          </Text>
          <Text style={{ fontSize: 16, color: colors.muted, lineHeight: 22, marginBottom: 16 }}>
            Track your mood and mental clarity over time. This helps identify patterns and potential triggers.
          </Text>

          {/* Info Box */}
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 12,
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 15, color: colors.foreground, lineHeight: 22 }}>
              <Text style={{ fontWeight: "700" }}>Why track this?</Text> Changes in mood and cognition can be linked to thyroid disorders, autoimmune conditions like Sjögren's, or medication changes. Regular tracking helps you and your doctor identify patterns.
            </Text>
          </View>

          {/* Averages Summary */}
          {averages && (
            <View
              style={{
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 12,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.foreground,
                  marginBottom: 12,
                }}
              >
                📊 7-Day Averages
              </Text>
              <View className="flex-row flex-wrap">
                {[
                  { label: "Mood", value: averages.mood },
                  { label: "Clarity", value: averages.clarity },
                  { label: "Memory", value: averages.memory },
                  { label: "Focus", value: averages.concentration },
                  { label: "Sleep", value: averages.sleep },
                ].map((item) => (
                  <View key={item.label} className="w-1/2 mb-3">
                    <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 4 }}>
                      {item.label}
                    </Text>
                    <Text style={{ fontSize: 24, fontWeight: "700", color: colors.primary }}>
                      {item.value.toFixed(1)}
                      <Text style={{ fontSize: 14, color: colors.muted }}>/10</Text>
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Add New Entry Button */}
          <TouchableOpacity
            onPress={() => setShowNewEntry(!showNewEntry)}
            style={{
              backgroundColor: showNewEntry ? colors.surface : colors.primary,
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderRadius: 12,
              borderWidth: showNewEntry ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "600",
                color: showNewEntry ? colors.foreground : "#FFFFFF",
                textAlign: "center",
              }}
            >
              {showNewEntry ? "Cancel" : "+ Add Today's Entry"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* New Entry Form */}
        {showNewEntry && (
          <View className="px-6 mb-6">
            <View
              style={{
                backgroundColor: colors.surface,
                padding: 20,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: colors.foreground,
                  marginBottom: 16,
                }}
              >
                How are you feeling today?
              </Text>

              {renderRatingScale(
                "Overall Mood",
                moodRating,
                setMoodRating,
                "Very Low",
                "Excellent"
              )}

              {renderRatingScale(
                "Mental Clarity",
                mentalClarity,
                setMentalClarity,
                "Very Foggy",
                "Very Clear"
              )}

              {renderRatingScale(
                "Memory Function",
                memoryFunction,
                setMemoryFunction,
                "Poor",
                "Excellent"
              )}

              {renderRatingScale(
                "Concentration",
                concentration,
                setConcentration,
                "Can't Focus",
                "Laser Focused"
              )}

              {renderRatingScale(
                "Sleep Quality (Last Night)",
                sleepQuality,
                setSleepQuality,
                "Terrible",
                "Excellent"
              )}

              {/* Notes */}
              <View className="mb-6">
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "600",
                    color: colors.foreground,
                    marginBottom: 8,
                  }}
                >
                  Notes (Optional)
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Any observations about your day..."
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={3}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    color: colors.foreground,
                    minHeight: 80,
                    textAlignVertical: "top",
                  }}
                />
              </View>

              {/* Triggers */}
              <View className="mb-6">
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "600",
                    color: colors.foreground,
                    marginBottom: 8,
                  }}
                >
                  Possible Triggers (Optional)
                </Text>
                <TextInput
                  value={triggers}
                  onChangeText={setTriggers}
                  placeholder="Stress, missed medication, poor sleep, etc."
                  placeholderTextColor={colors.muted}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    color: colors.foreground,
                  }}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={saveEntry}
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "600",
                    color: "#FFFFFF",
                    textAlign: "center",
                  }}
                >
                  Save Entry
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Entry History */}
        <View className="px-6">
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 12,
            }}
          >
            📅 Entry History
          </Text>

          {entries.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.surface,
                padding: 20,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, color: colors.muted, textAlign: "center" }}>
                No entries yet. Add your first entry to start tracking!
              </Text>
            </View>
          ) : (
            entries.map((entry) => (
              <View
                key={entry.id}
                style={{
                  backgroundColor: colors.surface,
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: colors.muted,
                    marginBottom: 8,
                  }}
                >
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
                <View className="flex-row flex-wrap mb-3">
                  <View className="w-1/3 mb-2">
                    <Text style={{ fontSize: 12, color: colors.muted }}>Mood</Text>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>
                      {entry.moodRating}/10
                    </Text>
                  </View>
                  <View className="w-1/3 mb-2">
                    <Text style={{ fontSize: 12, color: colors.muted }}>Clarity</Text>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>
                      {entry.mentalClarity}/10
                    </Text>
                  </View>
                  <View className="w-1/3 mb-2">
                    <Text style={{ fontSize: 12, color: colors.muted }}>Memory</Text>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>
                      {entry.memoryFunction}/10
                    </Text>
                  </View>
                  <View className="w-1/3 mb-2">
                    <Text style={{ fontSize: 12, color: colors.muted }}>Focus</Text>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>
                      {entry.concentration}/10
                    </Text>
                  </View>
                  <View className="w-1/3 mb-2">
                    <Text style={{ fontSize: 12, color: colors.muted }}>Sleep</Text>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>
                      {entry.sleepQuality}/10
                    </Text>
                  </View>
                </View>
                {entry.notes && (
                  <Text style={{ fontSize: 15, color: colors.foreground, marginBottom: 6 }}>
                    {entry.notes}
                  </Text>
                )}
                {entry.triggers && (
                  <Text style={{ fontSize: 14, color: colors.muted }}>
                    <Text style={{ fontWeight: "600" }}>Triggers:</Text> {entry.triggers}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* Share with Doctor */}
        {entries.length > 0 && (
          <View className="px-6 mt-6">
            <TouchableOpacity
              onPress={() => {
                // TODO: Generate PDF report
                router.push("/intake-review");
              }}
              style={{
                backgroundColor: colors.surface,
                paddingHorizontal: 20,
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "600",
                  color: colors.foreground,
                  textAlign: "center",
                }}
              >
                📄 Share with Doctor
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
