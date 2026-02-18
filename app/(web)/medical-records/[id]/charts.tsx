import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";

const CHART_CATEGORIES = [
  {
    id: "all",
    name: "All Trends",
    icon: "📊",
    charts: [
      {
        id: "master",
        name: "Master Lab Trends (5-Year)",
        description: "Comprehensive 23-panel visualization of all lab trends",
        imagePath: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663129142386/ldLnHEVgbnTWASbA.png",
      },
    ],
  },
  {
    id: "blood",
    name: "Blood Count",
    icon: "🩸",
    charts: [
      {
        id: "blood-count",
        name: "Blood Count Trends",
        description: "Hemoglobin, Hematocrit, RBC, WBC, Platelets, Neutrophils",
        imagePath: "/medical-charts/Trends_Blood_Count.png",
      },
      {
        id: "anemia",
        name: "5-Year Anemia Progression",
        description: "Detailed hemoglobin and hematocrit decline analysis",
        imagePath: "/medical-charts/Anemia_5Year_Progression_Chart.png",
      },
    ],
  },
  {
    id: "lipids",
    name: "Lipids",
    icon: "💊",
    charts: [
      {
        id: "lipids",
        name: "Lipid Panel Trends",
        description: "Total Cholesterol, LDL, HDL, Triglycerides",
        imagePath: "/medical-charts/Trends_Lipids.png",
      },
    ],
  },
  {
    id: "kidney",
    name: "Kidney",
    icon: "🫘",
    charts: [
      {
        id: "kidney",
        name: "Kidney Function Trends",
        description: "Creatinine, BUN, eGFR over 5 years",
        imagePath: "/medical-charts/Trends_Kidney.png",
      },
    ],
  },
  {
    id: "liver",
    name: "Liver",
    icon: "🫀",
    charts: [
      {
        id: "liver",
        name: "Liver Function Trends",
        description: "AST, ALT, Alkaline Phosphatase, Albumin, Total Protein",
        imagePath: "/medical-charts/Trends_Liver.png",
      },
    ],
  },
  {
    id: "diabetes",
    name: "Diabetes",
    icon: "🍬",
    charts: [
      {
        id: "diabetes",
        name: "Diabetes Monitoring",
        description: "Glucose and HbA1c trends",
        imagePath: "/medical-charts/Trends_Diabetes.png",
      },
      {
        id: "diabetes-risk",
        name: "Diabetes Risk Progression",
        description: "HbA1c progression with risk zones",
        imagePath: "/medical-charts/Diabetes_Risk_Progression_Chart.png",
      },
    ],
  },
  {
    id: "thyroid",
    name: "Thyroid",
    icon: "🦋",
    charts: [
      {
        id: "thyroid",
        name: "Thyroid Function",
        description: "TSH, Free T4, Free T3, T3 Total",
        imagePath: "/medical-charts/Trends_Thyroid.png",
      },
    ],
  },
  {
    id: "electrolytes",
    name: "Electrolytes",
    icon: "⚡",
    charts: [
      {
        id: "electrolytes",
        name: "Electrolyte Trends",
        description: "Sodium, Potassium, Calcium, Chloride, CO2",
        imagePath: "/medical-charts/Trends_Electrolytes.png",
      },
    ],
  },
  {
    id: "other",
    name: "Other",
    icon: "🔬",
    charts: [
      {
        id: "iron",
        name: "Iron Studies",
        description: "Ferritin, Iron Serum",
        imagePath: "/medical-charts/Trends_Iron_Studies.png",
      },
      {
        id: "autoimmune",
        name: "Autoimmune Markers",
        description: "Rheumatoid Factor",
        imagePath: "/medical-charts/Trends_Autoimmune.png",
      },
      {
        id: "vitamins",
        name: "Vitamin Levels",
        description: "Vitamin D",
        imagePath: "/medical-charts/Trends_Vitamins.png",
      },
    ],
  },
];

export default function ChartsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const currentCategory = CHART_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <ScreenContainer className="bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-6 bg-primary">
          <Link href={`/medical-records/${id}`} asChild>
            <Pressable className="mb-4">
              <Text className="text-white text-base">← Back to Dashboard</Text>
            </Pressable>
          </Link>
          
          <Text className="text-3xl font-bold text-white mb-2">
            Medical Trends & Charts
          </Text>
          <Text className="text-base text-white/90">
            5-Year Longitudinal Analysis (Sept 2021 - Feb 2026)
          </Text>
        </View>

        {/* Category Selector */}
        <View className="bg-surface/50 border-b border-border">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
            <View className="flex-row py-3">
              {CHART_CATEGORIES.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 mr-2 rounded-full ${
                    selectedCategory === category.id
                      ? "bg-primary"
                      : "bg-white border border-border"
                  }`}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text
                    className={`font-semibold text-sm ${
                      selectedCategory === category.id ? "text-white" : "text-foreground"
                    }`}
                  >
                    {category.icon} {category.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Charts Grid */}
        <View className="p-4">
          <Text className="text-xl font-bold text-foreground mb-4">
            {currentCategory?.name} ({currentCategory?.charts.length})
          </Text>

          {currentCategory?.charts.map((chart) => (
            <View key={chart.id} className="mb-6">
              <View className="bg-white rounded-xl border border-border overflow-hidden">
                {/* Chart Header */}
                <View className="p-4 bg-surface border-b border-border">
                  <Text className="text-lg font-bold text-foreground mb-1">
                    {chart.name}
                  </Text>
                  <Text className="text-sm text-muted">
                    {chart.description}
                  </Text>
                </View>

                {/* Chart Image */}
                <View className="bg-white p-4">
                  <Image
                    source={{ uri: chart.imagePath }}
                    style={{
                      width: "100%",
                      height: 400,
                      resizeMode: "contain",
                    }}
                  />
                </View>

                {/* Chart Actions */}
                <View className="p-4 bg-surface/50 flex-row justify-between border-t border-border">
                  <Pressable
                    className="flex-1 bg-primary py-3 rounded-lg mr-2"
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  >
                    <Text className="text-white font-semibold text-center">
                      View Full Size
                    </Text>
                  </Pressable>
                  <Pressable
                    className="flex-1 bg-white border border-border py-3 rounded-lg ml-2"
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  >
                    <Text className="text-foreground font-semibold text-center">
                      Download
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Info Footer */}
        <View className="p-6 bg-surface/30 mt-4">
          <Text className="text-sm font-semibold text-foreground mb-2">
            📊 About These Charts
          </Text>
          <Text className="text-xs text-muted mb-2">
            • All charts show 5-year trends (September 2021 - February 2026)
          </Text>
          <Text className="text-xs text-muted mb-2">
            • Green dots = Normal values, Orange dots = Low values, Red dots = High values
          </Text>
          <Text className="text-xs text-muted mb-2">
            • Reference ranges shown as shaded areas
          </Text>
          <Text className="text-xs text-muted">
            • Data points annotated with exact values and dates
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
