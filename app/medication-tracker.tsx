import { ScrollView, Text, View, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface MedicationEntry {
  id: string;
  medicationName: string;
  dosage: string;
  notes: string;
  timestamp: string;
}

export default function MedicationTrackerScreen() {
  const colors = useColors();
  const [entries, setEntries] = useState<MedicationEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await AsyncStorage.getItem("medication_log");
      if (data) {
        setEntries(JSON.parse(data));
      }
    } catch (error) {
      console.error("Failed to load medication log:", error);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const todayEntries = entries.filter(e => {
    const entryDate = new Date(e.timestamp).toDateString();
    const today = new Date().toDateString();
    return entryDate === today;
  });

  const adherenceRate = entries.length > 0 ? Math.min(100, (todayEntries.length / 3) * 100) : 0;

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-6 pt-6">
        {/* Header with Back Button */}
        <View className="mb-6">
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              marginBottom: 16,
            })}
          >
            <IconSymbol name="chevron.left" size={28} color={colors.foreground} />
          </Pressable>
          <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
            Medication Tracker
          </Text>
          <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
            View adherence and history
          </Text>
        </View>

        {/* Adherence Card */}
        <View className="mb-6 bg-surface rounded-2xl p-6 border border-border">
          <Text className="text-lg font-semibold text-foreground mb-4" style={{ lineHeight: 24 }}>
            Today's Adherence
          </Text>
          <View className="items-center mb-4">
            <Text className="text-5xl font-bold" style={{ color: adherenceRate >= 80 ? colors.success : adherenceRate >= 50 ? colors.warning : colors.error }}>
              {Math.round(adherenceRate)}%
            </Text>
            <Text className="text-sm text-muted mt-2">{todayEntries.length} medications taken today</Text>
          </View>
        </View>

        {/* Recent Entries */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-4" style={{ lineHeight: 28 }}>
            Recent Entries ({entries.length})
          </Text>
          
          {entries.length === 0 ? (
            <View className="bg-surface rounded-2xl p-8 border border-border items-center">
              <Text className="text-lg text-muted text-center" style={{ lineHeight: 26 }}>
                No medications logged yet.{"\n"}Tap "Log Medication" to get started.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {entries.slice(0, 20).map((entry) => (
                <View
                  key={entry.id}
                  className="bg-surface rounded-xl p-4 border border-border"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-lg font-semibold text-foreground flex-1" style={{ lineHeight: 24 }}>
                      {entry.medicationName}
                    </Text>
                    <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
                      {getTimeAgo(entry.timestamp)}
                    </Text>
                  </View>
                  {entry.dosage && (
                    <Text className="text-base text-muted mb-1" style={{ lineHeight: 22 }}>
                      💊 {entry.dosage}
                    </Text>
                  )}
                  {entry.notes && (
                    <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
                      📝 {entry.notes}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Log Button */}
        <Pressable
          onPress={() => router.push("/medication-log" as any)}
          style={{
            backgroundColor: colors.primary,
            padding: 18,
            borderRadius: 16,
            marginBottom: 32,
          }}
        >
          <Text className="text-xl font-bold text-center" style={{ color: "#fff", lineHeight: 28 }}>
            Log Medication
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
