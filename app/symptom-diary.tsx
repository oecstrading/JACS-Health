import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

interface SymptomEntry {
  id: string;
  date: Date;
  symptom: string;
  severity: number; // 1-10
  category: "pain" | "fatigue" | "nausea" | "dizziness" | "headache" | "other";
  notes?: string;
  triggers?: string[];
}

interface Pattern {
  symptom: string;
  frequency: number;
  avgSeverity: number;
  commonTriggers: string[];
  timeOfDay: string;
}

export default function SymptomDiaryScreen() {
  const colors = useColors();
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [symptom, setSymptom] = useState("");
  const [category, setCategory] = useState<SymptomEntry["category"]>("pain");
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    // Mock data - in production, load from AsyncStorage
    const mockEntries: SymptomEntry[] = [
      {
        id: "1",
        date: new Date(2026, 1, 5, 14, 30),
        symptom: "Lower back pain",
        severity: 6,
        category: "pain",
        notes: "After sitting for 2 hours",
        triggers: ["prolonged sitting"],
      },
      {
        id: "2",
        date: new Date(2026, 1, 6, 9, 0),
        symptom: "Morning headache",
        severity: 4,
        category: "headache",
        notes: "Woke up with headache",
        triggers: ["poor sleep"],
      },
      {
        id: "3",
        date: new Date(2026, 1, 7, 15, 0),
        symptom: "Dizziness",
        severity: 7,
        category: "dizziness",
        notes: "Stood up too quickly",
        triggers: ["sudden movement"],
      },
      {
        id: "4",
        date: new Date(2026, 1, 8, 10, 30),
        symptom: "Fatigue",
        severity: 5,
        category: "fatigue",
        notes: "Tired after morning walk",
      },
    ];

    setEntries(mockEntries.sort((a, b) => b.date.getTime() - a.date.getTime()));
  }

  function detectPatterns(): Pattern[] {
    // Simple pattern detection - in production, use more sophisticated algorithm
    const symptomGroups = entries.reduce((acc, entry) => {
      if (!acc[entry.symptom]) {
        acc[entry.symptom] = [];
      }
      acc[entry.symptom].push(entry);
      return acc;
    }, {} as Record<string, SymptomEntry[]>);

    return Object.entries(symptomGroups)
      .filter(([_, group]) => group.length >= 2)
      .map(([symptom, group]) => {
        const avgSeverity = group.reduce((sum, e) => sum + e.severity, 0) / group.length;
        const allTriggers = group.flatMap((e) => e.triggers || []);
        const triggerCounts = allTriggers.reduce((acc, t) => {
          acc[t] = (acc[t] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const commonTriggers = Object.entries(triggerCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([trigger]) => trigger);

        const hours = group.map((e) => e.date.getHours());
        const avgHour = Math.round(hours.reduce((sum, h) => sum + h, 0) / hours.length);
        const timeOfDay =
          avgHour < 12 ? "morning" : avgHour < 17 ? "afternoon" : "evening";

        return {
          symptom,
          frequency: group.length,
          avgSeverity: Math.round(avgSeverity * 10) / 10,
          commonTriggers,
          timeOfDay,
        };
      });
  }

  function addEntry() {
    if (!symptom) {
      Alert.alert("Missing Information", "Please enter a symptom description");
      return;
    }

    const newEntry: SymptomEntry = {
      id: Date.now().toString(),
      date: new Date(),
      symptom,
      severity,
      category,
      notes: notes || undefined,
    };

    setEntries([newEntry, ...entries]);
    setSymptom("");
    setSeverity(5);
    setNotes("");
    setShowAddForm(false);
  }

  const patterns = detectPatterns();
  const categories = [
    { id: "pain", label: "Pain", icon: "🤕" },
    { id: "fatigue", label: "Fatigue", icon: "😴" },
    { id: "nausea", label: "Nausea", icon: "🤢" },
    { id: "dizziness", label: "Dizziness", icon: "😵" },
    { id: "headache", label: "Headache", icon: "🤯" },
    { id: "other", label: "Other", icon: "📝" },
  ] as const;

  function getSeverityColor(severity: number): string {
    if (severity <= 3) return colors.success;
    if (severity <= 6) return "#F59E0B";
    return colors.error;
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text className="text-lg text-primary">← Back</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-foreground">Symptom Diary</Text>
          <Pressable
            onPress={() => setShowAddForm(!showAddForm)}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text className="text-3xl">{showAddForm ? "×" : "+"}</Text>
          </Pressable>
        </View>

        {/* Add Entry Form */}
        {showAddForm && (
          <View className="bg-surface p-6 rounded-2xl mb-6">
            <Text className="text-xl font-bold text-foreground mb-4">Log Symptom</Text>

            {/* Category Selector */}
            <View className="mb-4">
              <Text className="text-sm text-muted mb-2">Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategory(cat.id)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                    className={`px-4 py-2 rounded-full ${
                      category === cat.id
                        ? "bg-primary"
                        : "bg-background border border-border"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        category === cat.id ? "text-white" : "text-foreground"
                      }`}
                    >
                      {cat.icon} {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View className="mb-4">
              <Text className="text-sm text-muted mb-2">Symptom Description</Text>
              <TextInput
                value={symptom}
                onChangeText={setSymptom}
                placeholder="e.g., Lower back pain"
                placeholderTextColor={colors.muted}
                className="bg-background border border-border rounded-xl px-4 py-3 text-lg text-foreground"
              />
            </View>

            <View className="mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-muted">Severity</Text>
                <Text
                  className="text-lg font-bold"
                  style={{ color: getSeverityColor(severity) }}
                >
                  {severity}/10
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <Pressable
                    key={level}
                    onPress={() => setSeverity(level)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                    className={`flex-1 h-10 rounded-lg items-center justify-center ${
                      severity >= level ? "bg-primary" : "bg-background border border-border"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        severity >= level ? "text-white" : "text-muted"
                      }`}
                    >
                      {level}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm text-muted mb-2">Notes (optional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholder="Any additional details or triggers..."
                placeholderTextColor={colors.muted}
                className="bg-background border border-border rounded-xl p-4 text-base text-foreground"
                style={{ textAlignVertical: "top", minHeight: 80 }}
              />
            </View>

            <Pressable
              onPress={addEntry}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              className="bg-primary py-4 rounded-xl items-center"
            >
              <Text className="text-white text-lg font-bold">Save Entry</Text>
            </Pressable>
          </View>
        )}

        {/* Detected Patterns */}
        {patterns.length > 0 && (
          <View className="bg-surface p-6 rounded-2xl mb-6">
            <Text className="text-xl font-bold text-foreground mb-4">
              🔍 Detected Patterns
            </Text>
            <View className="gap-4">
              {patterns.map((pattern, index) => (
                <View key={index} className="bg-background p-4 rounded-xl">
                  <Text className="text-lg font-semibold text-foreground mb-2">
                    {pattern.symptom}
                  </Text>
                  <View className="gap-1">
                    <Text className="text-sm text-muted">
                      • Occurred {pattern.frequency} times
                    </Text>
                    <Text className="text-sm text-muted">
                      • Average severity: {pattern.avgSeverity}/10
                    </Text>
                    <Text className="text-sm text-muted">
                      • Most common in the {pattern.timeOfDay}
                    </Text>
                    {pattern.commonTriggers.length > 0 && (
                      <Text className="text-sm text-muted">
                        • Triggers: {pattern.commonTriggers.join(", ")}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Entries */}
        <View className="bg-surface p-6 rounded-2xl mb-8">
          <Text className="text-xl font-bold text-foreground mb-4">Recent Entries</Text>
          {entries.length === 0 ? (
            <Text className="text-base text-muted text-center py-4">
              No symptoms logged yet. Tap + to add an entry.
            </Text>
          ) : (
            <View className="gap-3">
              {entries.slice(0, 10).map((entry) => (
                <View key={entry.id} className="bg-background p-4 rounded-xl">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-foreground mb-1">
                        {entry.symptom}
                      </Text>
                      <Text className="text-sm text-muted">
                        {entry.date.toLocaleDateString()} at{" "}
                        {entry.date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: getSeverityColor(entry.severity) + "20" }}
                    >
                      <Text
                        className="text-sm font-bold"
                        style={{ color: getSeverityColor(entry.severity) }}
                      >
                        {entry.severity}/10
                      </Text>
                    </View>
                  </View>
                  {entry.notes && (
                    <Text className="text-sm text-muted mt-2">{entry.notes}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Export Button */}
        <Pressable
          onPress={() => {
            Alert.alert(
              "Export Symptom Report",
              "Generate a PDF report to share with your doctor?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Generate PDF",
                  onPress: () => Alert.alert("Success", "Symptom report generated!"),
                },
              ]
            );
          }}
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          className="bg-primary py-4 rounded-xl items-center mb-8"
        >
          <Text className="text-white text-lg font-bold">
            📄 Export Report for Doctor
          </Text>
        </Pressable>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
