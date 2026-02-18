import { View, Text, ScrollView, Pressable } from "react-native";
import { Link } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  latestMetrics: {
    cholesterol?: number;
    ldl?: number;
    hdl?: number;
    glucose?: number;
    hba1c?: number;
    hemoglobin?: number;
    bmi?: number;
  };
  conditions: string[];
}

// Sample family data
const FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: "janice-john",
    name: "Janice John",
    relationship: "Self",
    age: 68,
    latestMetrics: {
      cholesterol: 218,
      ldl: 123,
      hdl: 79,
      glucose: 98,
      hba1c: 6.0,
      hemoglobin: 10.5,
      bmi: 26.5,
    },
    conditions: ["Prediabetes", "High Cholesterol", "Anemia", "Osteopenia"],
  },
  {
    id: "john-doe",
    name: "John Doe",
    relationship: "Spouse",
    age: 70,
    latestMetrics: {
      cholesterol: 245,
      ldl: 155,
      hdl: 65,
      glucose: 110,
      hba1c: 6.5,
      bmi: 28.2,
    },
    conditions: ["Type 2 Diabetes", "High Cholesterol", "Hypertension"],
  },
  {
    id: "mary-smith",
    name: "Mary Smith",
    relationship: "Daughter",
    age: 42,
    latestMetrics: {
      cholesterol: 195,
      ldl: 115,
      hdl: 72,
      glucose: 92,
      hba1c: 5.4,
      hemoglobin: 13.2,
      bmi: 23.8,
    },
    conditions: ["None"],
  },
];

type MetricKey = "cholesterol" | "ldl" | "hdl" | "glucose" | "hba1c" | "hemoglobin" | "bmi";

const METRICS = [
  { key: "cholesterol" as MetricKey, name: "Total Cholesterol", unit: "mg/dL", target: "<200", icon: "💊" },
  { key: "ldl" as MetricKey, name: "LDL Cholesterol", unit: "mg/dL", target: "<100", icon: "🔴" },
  { key: "hdl" as MetricKey, name: "HDL Cholesterol", unit: "mg/dL", target: ">60", icon: "🟢" },
  { key: "glucose" as MetricKey, name: "Glucose", unit: "mg/dL", target: "<100", icon: "🍬" },
  { key: "hba1c" as MetricKey, name: "HbA1c", unit: "%", target: "<5.7", icon: "📊" },
  { key: "hemoglobin" as MetricKey, name: "Hemoglobin", unit: "G/DL", target: "11.5-15.5", icon: "🩸" },
  { key: "bmi" as MetricKey, name: "BMI", unit: "", target: "18.5-24.9", icon: "⚖️" },
];

export default function FamilyComparisonPage() {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("cholesterol");

  const selectedMetricInfo = METRICS.find((m) => m.key === selectedMetric)!;

  const getMetricStatus = (value: number | undefined, metricKey: MetricKey) => {
    if (value === undefined) return "unknown";
    
    switch (metricKey) {
      case "cholesterol":
        return value < 200 ? "good" : value < 240 ? "borderline" : "high";
      case "ldl":
        return value < 100 ? "good" : value < 130 ? "borderline" : "high";
      case "hdl":
        return value >= 60 ? "good" : value >= 40 ? "borderline" : "low";
      case "glucose":
        return value < 100 ? "good" : value < 126 ? "borderline" : "high";
      case "hba1c":
        return value < 5.7 ? "good" : value < 6.5 ? "borderline" : "high";
      case "hemoglobin":
        return value >= 11.5 && value <= 15.5 ? "good" : "abnormal";
      case "bmi":
        return value >= 18.5 && value < 25 ? "good" : value < 30 ? "borderline" : "high";
      default:
        return "unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "#4CAF50";
      case "borderline":
        return "#FF9800";
      case "high":
      case "low":
      case "abnormal":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  return (
    <ScreenContainer className="bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-6 bg-primary">
          <Link href="/medical-records" asChild>
            <Pressable className="mb-4">
              <Text className="text-white text-base">← Back to Patients</Text>
            </Pressable>
          </Link>
          
          <Text className="text-3xl font-bold text-white mb-2">
            Family Health Comparison
          </Text>
          <Text className="text-base text-white/90">
            Compare health metrics across {FAMILY_MEMBERS.length} family members
          </Text>
        </View>

        {/* Metric Selector */}
        <View className="p-4 bg-surface/50">
          <Text className="text-sm font-semibold text-foreground mb-3">
            Select Metric to Compare
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {METRICS.map((metric) => (
                <Pressable
                  key={metric.key}
                  onPress={() => setSelectedMetric(metric.key)}
                  className={`px-4 py-3 mr-2 rounded-lg ${
                    selectedMetric === metric.key
                      ? "bg-primary"
                      : "bg-white border border-border"
                  }`}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text className="text-xl mb-1">{metric.icon}</Text>
                  <Text
                    className={`text-xs font-semibold ${
                      selectedMetric === metric.key ? "text-white" : "text-foreground"
                    }`}
                  >
                    {metric.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Comparison View */}
        <View className="p-4">
          <View className="bg-white border border-border rounded-xl p-5 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-2xl mb-1">{selectedMetricInfo.icon}</Text>
                <Text className="text-lg font-bold text-foreground">
                  {selectedMetricInfo.name}
                </Text>
                <Text className="text-sm text-muted">
                  Target: {selectedMetricInfo.target} {selectedMetricInfo.unit}
                </Text>
              </View>
            </View>
          </View>

          {/* Family Members Comparison */}
          {FAMILY_MEMBERS.map((member) => {
            const value = member.latestMetrics[selectedMetric];
            const status = getMetricStatus(value, selectedMetric);
            const statusColor = getStatusColor(status);

            return (
              <View
                key={member.id}
                className="bg-white border border-border rounded-xl p-5 mb-3"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground">
                      {member.name}
                    </Text>
                    <Text className="text-sm text-muted">
                      {member.relationship} • Age {member.age}
                    </Text>
                  </View>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: statusColor + "20" }}
                  >
                    <Text
                      className="text-xs font-semibold capitalize"
                      style={{ color: statusColor }}
                    >
                      {status}
                    </Text>
                  </View>
                </View>

                {value !== undefined ? (
                  <>
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-4xl font-bold" style={{ color: statusColor }}>
                        {value}
                      </Text>
                      <Text className="text-sm text-muted">
                        {selectedMetricInfo.unit}
                      </Text>
                    </View>

                    {/* Visual Bar */}
                    <View className="bg-surface rounded-full h-3 overflow-hidden mb-2">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min((value / 300) * 100, 100)}%`,
                          backgroundColor: statusColor,
                        }}
                      />
                    </View>

                    <Link href={`/medical-records/${member.id}`} asChild>
                      <Pressable>
                        <Text className="text-primary font-semibold text-sm text-right">
                          View Details →
                        </Text>
                      </Pressable>
                    </Link>
                  </>
                ) : (
                  <Text className="text-muted text-center py-4">
                    No data available
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Hereditary Patterns */}
        <View className="p-4">
          <Text className="text-xl font-bold text-foreground mb-4">
            Hereditary Patterns & Shared Risks
          </Text>

          {/* High Cholesterol Pattern */}
          <View className="bg-warning/10 border border-warning rounded-xl p-5 mb-3">
            <Text className="text-warning font-bold text-base mb-2">
              ⚠️ High Cholesterol Pattern
            </Text>
            <Text className="text-sm text-foreground mb-2">
              2 of 3 family members have elevated cholesterol levels
            </Text>
            <View className="bg-white rounded-lg p-3 mt-2">
              <Text className="text-xs font-semibold text-foreground mb-2">
                Affected Members:
              </Text>
              <Text className="text-xs text-muted">• Janice John (218 mg/dL)</Text>
              <Text className="text-xs text-muted">• John Doe (245 mg/dL)</Text>
            </View>
            <View className="bg-white rounded-lg p-3 mt-2">
              <Text className="text-xs font-semibold text-foreground mb-1">
                💡 Recommendation
              </Text>
              <Text className="text-xs text-muted">
                Family history suggests genetic predisposition. All family members should have regular lipid screening and consider lifestyle modifications.
              </Text>
            </View>
          </View>

          {/* Diabetes Risk Pattern */}
          <View className="bg-error/10 border border-error rounded-xl p-5 mb-3">
            <Text className="text-error font-bold text-base mb-2">
              🚨 Diabetes Risk Pattern
            </Text>
            <Text className="text-sm text-foreground mb-2">
              2 of 3 family members have diabetes or prediabetes
            </Text>
            <View className="bg-white rounded-lg p-3 mt-2">
              <Text className="text-xs font-semibold text-foreground mb-2">
                Affected Members:
              </Text>
              <Text className="text-xs text-muted">• Janice John (HbA1c 6.0% - Prediabetes)</Text>
              <Text className="text-xs text-muted">• John Doe (HbA1c 6.5% - Type 2 Diabetes)</Text>
            </View>
            <View className="bg-white rounded-lg p-3 mt-2">
              <Text className="text-xs font-semibold text-foreground mb-1">
                💡 Recommendation
              </Text>
              <Text className="text-xs text-muted">
                Strong family history of diabetes. Mary Smith should have annual HbA1c screening despite normal current levels. Lifestyle interventions recommended for all members.
              </Text>
            </View>
          </View>

          {/* Positive Pattern */}
          <View className="bg-success/10 border border-success rounded-xl p-5">
            <Text className="text-success font-bold text-base mb-2">
              ✅ Healthy HDL Levels
            </Text>
            <Text className="text-sm text-foreground mb-2">
              All family members maintain good HDL cholesterol levels
            </Text>
            <View className="bg-white rounded-lg p-3 mt-2">
              <Text className="text-xs font-semibold text-foreground mb-2">
                Family Members:
              </Text>
              <Text className="text-xs text-muted">• Janice John (79 mg/dL - Good)</Text>
              <Text className="text-xs text-muted">• John Doe (65 mg/dL - Good)</Text>
              <Text className="text-xs text-muted">• Mary Smith (72 mg/dL - Good)</Text>
            </View>
          </View>
        </View>

        {/* Family Health Summary */}
        <View className="p-4">
          <Text className="text-xl font-bold text-foreground mb-4">
            Family Health Summary
          </Text>

          <View className="bg-white border border-border rounded-xl p-5">
            <Text className="text-sm font-semibold text-foreground mb-3">
              Common Conditions
            </Text>
            <View className="mb-2">
              <Text className="text-sm text-foreground font-semibold">
                High Cholesterol
              </Text>
              <Text className="text-xs text-muted">
                2 of 3 members (67%) • Genetic predisposition likely
              </Text>
            </View>
            <View className="mb-2">
              <Text className="text-sm text-foreground font-semibold">
                Diabetes/Prediabetes
              </Text>
              <Text className="text-xs text-muted">
                2 of 3 members (67%) • High familial risk
              </Text>
            </View>
            <View>
              <Text className="text-sm text-foreground font-semibold">
                Anemia
              </Text>
              <Text className="text-xs text-muted">
                1 of 3 members (33%) • Monitor younger generation
              </Text>
            </View>
          </View>
        </View>

        {/* Info Footer */}
        <View className="p-6 bg-surface/30 mt-4">
          <Text className="text-sm font-semibold text-foreground mb-2">
            🧬 About Family Health Comparison
          </Text>
          <Text className="text-xs text-muted mb-2">
            • Identifies hereditary patterns and shared risk factors
          </Text>
          <Text className="text-xs text-muted mb-2">
            • Helps predict health risks for younger family members
          </Text>
          <Text className="text-xs text-muted mb-2">
            • Enables proactive preventive care strategies
          </Text>
          <Text className="text-xs text-muted">
            • Share this analysis with your family physician
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
