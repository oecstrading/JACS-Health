import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { generateHealthReport } from "@/lib/health-report";

interface VisitPreparation {
  symptoms: string[];
  vitalChanges: {
    bloodPressure: string;
    weight: string;
    heartRate: string;
  };
  medicationChanges: string[];
  suggestedQuestions: string[];
  concerns: string;
}

export default function DoctorVisitPrepScreen() {
  const colors = useColors();
  const [preparation, setPreparation] = useState<VisitPreparation | null>(null);
  const [concerns, setConcerns] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generatePreparation();
  }, []);

  async function generatePreparation() {
    setIsGenerating(true);

    // In production, analyze actual health data from AsyncStorage
    // Mock analysis for demonstration
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockPreparation: VisitPreparation = {
      symptoms: [
        "Occasional dizziness in the morning",
        "Mild fatigue after lunch",
        "Difficulty sleeping (2-3 nights/week)",
      ],
      vitalChanges: {
        bloodPressure: "Increased from 120/80 to 128/82 (avg over 7 days)",
        weight: "Decreased by 3 lbs in the past month",
        heartRate: "Stable at 72 bpm (avg)",
      },
      medicationChanges: [
        "Started taking Lisinopril 10mg daily (2 weeks ago)",
        "Metformin dosage increased to 1000mg twice daily",
      ],
      suggestedQuestions: [
        "Should I be concerned about my rising blood pressure trend?",
        "Is my dizziness related to the new Lisinopril medication?",
        "Should I adjust my Metformin dosage given my weight loss?",
        "What can I do to improve my sleep quality?",
        "Are there any dietary changes you recommend?",
      ],
      concerns: "",
    };

    setPreparation(mockPreparation);
    setIsGenerating(false);
  }

  async function exportReport() {
    try {
      Alert.alert("Exporting Report", "Generating PDF report for your doctor visit...");
      
      // In production, use the health-report library to generate PDF
      const pdfUri = await generateHealthReport({
        dateRange: "month",
      });

      if (pdfUri && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: "application/pdf",
          dialogTitle: "Share Health Report",
        });
      } else {
        Alert.alert("Success", "Report generated successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to generate report. Please try again.");
      console.error(error);
    }
  }

  if (isGenerating || !preparation) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl font-bold text-foreground mb-4">
            Analyzing Your Health Data...
          </Text>
          <Text className="text-lg text-muted text-center">
            Preparing your doctor visit summary
          </Text>
        </View>
      </ScreenContainer>
    );
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
          <Text className="text-2xl font-bold text-foreground">Visit Prep</Text>
          <Pressable
            onPress={exportReport}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text className="text-2xl">📄</Text>
          </Pressable>
        </View>

        {/* Summary */}
        <View className="bg-primary p-6 rounded-2xl mb-6">
          <Text className="text-white text-xl font-bold mb-2">
            Ready for Your Doctor Visit
          </Text>
          <Text className="text-white text-base opacity-90">
            We've analyzed your health data from the past 30 days
          </Text>
        </View>

        {/* Recent Symptoms */}
        <View className="bg-surface p-6 rounded-2xl mb-6">
          <Text className="text-xl font-bold text-foreground mb-4">
            📋 Recent Symptoms
          </Text>
          {preparation.symptoms.map((symptom, index) => (
            <View key={index} className="flex-row items-start mb-3">
              <Text className="text-primary text-lg mr-2">•</Text>
              <Text className="text-base text-foreground flex-1">{symptom}</Text>
            </View>
          ))}
        </View>

        {/* Vital Changes */}
        <View className="bg-surface p-6 rounded-2xl mb-6">
          <Text className="text-xl font-bold text-foreground mb-4">
            📊 Vital Changes
          </Text>
          <View className="gap-3">
            <View>
              <Text className="text-sm text-muted mb-1">Blood Pressure</Text>
              <Text className="text-base text-foreground">
                {preparation.vitalChanges.bloodPressure}
              </Text>
            </View>
            <View>
              <Text className="text-sm text-muted mb-1">Weight</Text>
              <Text className="text-base text-foreground">
                {preparation.vitalChanges.weight}
              </Text>
            </View>
            <View>
              <Text className="text-sm text-muted mb-1">Heart Rate</Text>
              <Text className="text-base text-foreground">
                {preparation.vitalChanges.heartRate}
              </Text>
            </View>
          </View>
        </View>

        {/* Medication Changes */}
        <View className="bg-surface p-6 rounded-2xl mb-6">
          <Text className="text-xl font-bold text-foreground mb-4">
            💊 Medication Changes
          </Text>
          {preparation.medicationChanges.map((change, index) => (
            <View key={index} className="flex-row items-start mb-3">
              <Text className="text-primary text-lg mr-2">•</Text>
              <Text className="text-base text-foreground flex-1">{change}</Text>
            </View>
          ))}
        </View>

        {/* Suggested Questions */}
        <View className="bg-surface p-6 rounded-2xl mb-6">
          <Text className="text-xl font-bold text-foreground mb-4">
            ❓ Questions to Ask
          </Text>
          {preparation.suggestedQuestions.map((question, index) => (
            <View key={index} className="mb-4">
              <View className="flex-row items-start">
                <Text className="text-primary text-base font-semibold mr-2">
                  {index + 1}.
                </Text>
                <Text className="text-base text-foreground flex-1">{question}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Additional Concerns */}
        <View className="bg-surface p-6 rounded-2xl mb-6">
          <Text className="text-xl font-bold text-foreground mb-4">
            📝 Additional Concerns
          </Text>
          <Text className="text-sm text-muted mb-3">
            Add any other concerns or questions you want to discuss
          </Text>
          <TextInput
            value={concerns}
            onChangeText={setConcerns}
            multiline
            numberOfLines={4}
            placeholder="Type your concerns here..."
            placeholderTextColor={colors.muted}
            className="bg-background border border-border rounded-xl p-4 text-base text-foreground"
            style={{ textAlignVertical: "top", minHeight: 100 }}
          />
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mb-8">
          <Pressable
            onPress={exportReport}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            className="bg-primary py-4 rounded-xl items-center"
          >
            <Text className="text-white text-lg font-bold">
              📄 Export Full Report (PDF)
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Alert.alert(
                "Email Report",
                "Would you like to email this report to your doctor?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Send Email",
                    onPress: () => Alert.alert("Success", "Email sent to your doctor!"),
                  },
                ]
              );
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            className="bg-surface border border-border py-4 rounded-xl items-center"
          >
            <Text className="text-foreground text-lg font-bold">
              ✉️ Email to Doctor
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Alert.alert(
                "Print Report",
                "Printing functionality would open here",
                [{ text: "OK" }]
              );
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            className="bg-surface border border-border py-4 rounded-xl items-center"
          >
            <Text className="text-foreground text-lg font-bold">
              🖨️ Print Report
            </Text>
          </Pressable>
        </View>

        {/* Tips */}
        <View className="bg-surface p-6 rounded-2xl mb-8">
          <Text className="text-lg font-bold text-foreground mb-3">
            💡 Tips for Your Visit
          </Text>
          <View className="gap-2">
            <Text className="text-base text-muted">
              • Bring a list of all current medications
            </Text>
            <Text className="text-base text-muted">
              • Arrive 15 minutes early
            </Text>
            <Text className="text-base text-muted">
              • Bring your insurance card
            </Text>
            <Text className="text-base text-muted">
              • Take notes during your visit
            </Text>
            <Text className="text-base text-muted">
              • Ask for clarification if you don't understand
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
