import { ScrollView, Text, View, Pressable, Linking } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

type Tab = "overview" | "symptoms" | "treatment" | "lifestyle" | "resources";

export default function DiabetesScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const openURL = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="px-5 py-4 border-b border-border bg-surface">
        <View className="flex-row items-center gap-3 mb-2">
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <IconSymbol name="chevron.left" size={28} color={colors.primary} />
          </Pressable>
          <View className="flex-1">
            <Text
              className="text-2xl font-bold text-foreground"
              style={{ lineHeight: 30 }}
            >
              Diabetes
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b border-border bg-surface"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
      >
        {[
          { id: "overview", label: "Overview" },
          { id: "symptoms", label: "Symptoms" },
          { id: "treatment", label: "Treatment" },
          { id: "lifestyle", label: "Lifestyle" },
          { id: "resources", label: "Resources" },
        ].map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => setActiveTab(tab.id as Tab)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View
              className={`px-5 py-3 rounded-full ${
                activeTab === tab.id ? "bg-primary" : "bg-background"
              }`}
            >
              <Text
                className={`text-base font-semibold ${
                  activeTab === tab.id ? "text-white" : "text-muted"
                }`}
                style={{ lineHeight: 20 }}
              >
                {tab.label}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "overview" && (
          <View className="gap-6">
            {/* Statistics */}
            <View className="flex-row gap-4">
              <View className="flex-1 bg-primary/10 rounded-2xl p-5 border border-primary/20">
                <Text
                  className="text-3xl font-bold text-primary mb-1"
                  style={{ lineHeight: 38 }}
                >
                  37.3M
                </Text>
                <Text
                  className="text-sm text-muted"
                  style={{ lineHeight: 18 }}
                >
                  Americans have diabetes
                </Text>
              </View>
              <View className="flex-1 bg-warning/10 rounded-2xl p-5 border border-warning/20">
                <Text
                  className="text-3xl font-bold text-warning mb-1"
                  style={{ lineHeight: 38 }}
                >
                  96M
                </Text>
                <Text
                  className="text-sm text-muted"
                  style={{ lineHeight: 18 }}
                >
                  Have prediabetes
                </Text>
              </View>
            </View>

            {/* What is Diabetes */}
            <View className="bg-surface rounded-3xl p-6 border border-border">
              <Text
                className="text-xl font-bold text-foreground mb-3"
                style={{ lineHeight: 26 }}
              >
                What is Diabetes?
              </Text>
              <Text
                className="text-base text-foreground mb-4"
                style={{ lineHeight: 24 }}
              >
                Diabetes is a condition where blood sugar (glucose) levels are too high. It occurs when the pancreas doesn't make enough insulin or the body can't use insulin effectively.
              </Text>
              <Text
                className="text-base text-foreground"
                style={{ lineHeight: 24 }}
              >
                Insulin is a hormone that helps glucose enter cells to be used for energy. Without proper insulin function, glucose builds up in the bloodstream, leading to serious health problems.
              </Text>
            </View>

            {/* Types */}
            <View className="bg-surface rounded-3xl p-6 border border-border">
              <Text
                className="text-xl font-bold text-foreground mb-4"
                style={{ lineHeight: 26 }}
              >
                Types of Diabetes
              </Text>
              
              <View className="gap-4">
                <View>
                  <Text
                    className="text-lg font-semibold text-foreground mb-2"
                    style={{ lineHeight: 24 }}
                  >
                    Type 1 Diabetes
                  </Text>
                  <Text
                    className="text-base text-muted"
                    style={{ lineHeight: 22 }}
                  >
                    Autoimmune condition where the pancreas produces little or no insulin. Usually diagnosed in children and young adults.
                  </Text>
                </View>

                <View>
                  <Text
                    className="text-lg font-semibold text-foreground mb-2"
                    style={{ lineHeight: 24 }}
                  >
                    Type 2 Diabetes
                  </Text>
                  <Text
                    className="text-base text-muted"
                    style={{ lineHeight: 22 }}
                  >
                    Most common type (90-95% of cases). The body doesn't use insulin properly (insulin resistance). Can be prevented or delayed with lifestyle changes.
                  </Text>
                </View>

                <View>
                  <Text
                    className="text-lg font-semibold text-foreground mb-2"
                    style={{ lineHeight: 24 }}
                  >
                    Gestational Diabetes
                  </Text>
                  <Text
                    className="text-base text-muted"
                    style={{ lineHeight: 22 }}
                  >
                    Develops during pregnancy and usually goes away after delivery. Increases risk of Type 2 diabetes later in life.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === "symptoms" && (
          <View className="gap-6">
            <View className="bg-surface rounded-3xl p-6 border border-border">
              <Text
                className="text-xl font-bold text-foreground mb-4"
                style={{ lineHeight: 26 }}
              >
                Common Symptoms
              </Text>
              
              {[
                { icon: "💧", text: "Urinating often, especially at night" },
                { icon: "🚰", text: "Feeling very thirsty" },
                { icon: "🍽️", text: "Feeling very hungry even after eating" },
                { icon: "😴", text: "Extreme fatigue and weakness" },
                { icon: "👁️", text: "Blurry vision" },
                { icon: "🩹", text: "Cuts and bruises that heal slowly" },
                { icon: "🦶", text: "Tingling, pain, or numbness in hands/feet" },
                { icon: "⚖️", text: "Unexplained weight loss (Type 1)" },
              ].map((symptom, index) => (
                <View
                  key={index}
                  className="flex-row items-start gap-3 mb-3"
                >
                  <Text className="text-2xl">{symptom.icon}</Text>
                  <Text
                    className="flex-1 text-base text-foreground"
                    style={{ lineHeight: 24 }}
                  >
                    {symptom.text}
                  </Text>
                </View>
              ))}
            </View>

            <View className="bg-error/10 rounded-3xl p-6 border border-error/20">
              <View className="flex-row items-start gap-3">
                <IconSymbol
                  name="exclamationmark.triangle.fill"
                  size={24}
                  color={colors.error}
                />
                <View className="flex-1">
                  <Text
                    className="text-lg font-bold text-foreground mb-2"
                    style={{ lineHeight: 24 }}
                  >
                    When to See a Doctor
                  </Text>
                  <Text
                    className="text-base text-foreground"
                    style={{ lineHeight: 22 }}
                  >
                    If you experience any of these symptoms, especially multiple symptoms together, consult your healthcare provider for testing.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === "treatment" && (
          <View className="gap-6">
            <View className="bg-surface rounded-3xl p-6 border border-border">
              <Text
                className="text-xl font-bold text-foreground mb-4"
                style={{ lineHeight: 26 }}
              >
                Treatment Approach
              </Text>
              
              {[
                {
                  title: "Monitor Blood Glucose",
                  description: "Check blood sugar levels regularly as recommended by your doctor. Keep a log to track patterns.",
                },
                {
                  title: "Take Medications",
                  description: "Take prescribed medications (insulin, metformin, etc.) exactly as directed. Never skip doses.",
                },
                {
                  title: "Healthy Diet",
                  description: "Follow a balanced diet with controlled carbohydrates. Work with a dietician for personalized meal plans.",
                },
                {
                  title: "Physical Activity",
                  description: "Aim for 150 minutes of moderate exercise per week. Walking, swimming, and cycling are excellent choices.",
                },
                {
                  title: "Weight Management",
                  description: "Losing 7% of body weight can significantly reduce diabetes risk and improve blood sugar control.",
                },
                {
                  title: "Regular Checkups",
                  description: "See your healthcare team regularly for A1C tests, eye exams, foot exams, and kidney function tests.",
                },
              ].map((item, index) => (
                <View key={index} className="mb-4">
                  <Text
                    className="text-lg font-semibold text-foreground mb-2"
                    style={{ lineHeight: 24 }}
                  >
                    {index + 1}. {item.title}
                  </Text>
                  <Text
                    className="text-base text-muted"
                    style={{ lineHeight: 22 }}
                  >
                    {item.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === "lifestyle" && (
          <View className="gap-6">
            <View className="bg-surface rounded-3xl p-6 border border-border">
              <Text
                className="text-xl font-bold text-foreground mb-4"
                style={{ lineHeight: 26 }}
              >
                Lifestyle Tips
              </Text>
              
              {[
                {
                  icon: "🥗",
                  title: "Eat Smart",
                  tips: [
                    "Choose whole grains over refined carbs",
                    "Fill half your plate with non-starchy vegetables",
                    "Include lean proteins and healthy fats",
                    "Limit sugary drinks and processed foods",
                    "Control portion sizes",
                  ],
                },
                {
                  icon: "🏃",
                  title: "Stay Active",
                  tips: [
                    "Walk for 30 minutes most days",
                    "Try strength training 2-3 times per week",
                    "Take stairs instead of elevators",
                    "Stand and stretch every hour",
                    "Find activities you enjoy",
                  ],
                },
                {
                  icon: "😴",
                  title: "Get Quality Sleep",
                  tips: [
                    "Aim for 7-9 hours per night",
                    "Keep a consistent sleep schedule",
                    "Create a relaxing bedtime routine",
                    "Avoid screens before bed",
                    "Keep bedroom cool and dark",
                  ],
                },
                {
                  icon: "🧘",
                  title: "Manage Stress",
                  tips: [
                    "Practice deep breathing exercises",
                    "Try meditation or yoga",
                    "Connect with friends and family",
                    "Pursue hobbies you enjoy",
                    "Seek support when needed",
                  ],
                },
              ].map((section, index) => (
                <View key={index} className="mb-6">
                  <View className="flex-row items-center gap-3 mb-3">
                    <Text className="text-3xl">{section.icon}</Text>
                    <Text
                      className="text-lg font-bold text-foreground"
                      style={{ lineHeight: 24 }}
                    >
                      {section.title}
                    </Text>
                  </View>
                  {section.tips.map((tip, tipIndex) => (
                    <View key={tipIndex} className="flex-row items-start gap-2 mb-2">
                      <Text className="text-primary mt-1">•</Text>
                      <Text
                        className="flex-1 text-base text-muted"
                        style={{ lineHeight: 22 }}
                      >
                        {tip}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === "resources" && (
          <View className="gap-6">
            <View className="bg-surface rounded-3xl p-6 border border-border">
              <Text
                className="text-xl font-bold text-foreground mb-4"
                style={{ lineHeight: 26 }}
              >
                Trusted Resources
              </Text>
              
              {[
                {
                  name: "American Diabetes Association",
                  url: "https://diabetes.org/",
                  description: "Comprehensive diabetes information and support",
                },
                {
                  name: "Cleveland Clinic - Diabetes",
                  url: "https://my.clevelandclinic.org/health/diseases/7104-diabetes",
                  description: "Symptoms, causes, and treatment information",
                },
                {
                  name: "Mayo Clinic - Diabetes",
                  url: "https://www.mayoclinic.org/diseases-conditions/diabetes/symptoms-causes/syc-20371444",
                  description: "Expert medical information and advice",
                },
                {
                  name: "CDC Diabetes Basics",
                  url: "https://www.cdc.gov/diabetes/about/index.html",
                  description: "Prevention and management resources",
                },
                {
                  name: "CDC Diabetes Prevention Program",
                  url: "https://www.cdc.gov/diabetes-prevention/lifestyle-change-program/index.html",
                  description: "Lifestyle change program to prevent Type 2",
                },
              ].map((resource, index) => (
                <Pressable
                  key={index}
                  onPress={() => openURL(resource.url)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    marginBottom: 16,
                  })}
                >
                  <View className="bg-background rounded-2xl p-4 border border-border">
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text
                          className="text-lg font-semibold text-primary mb-1"
                          style={{ lineHeight: 24 }}
                        >
                          {resource.name}
                        </Text>
                        <Text
                          className="text-sm text-muted mb-2"
                          style={{ lineHeight: 18 }}
                        >
                          {resource.description}
                        </Text>
                        <Text
                          className="text-xs text-muted"
                          style={{ lineHeight: 16 }}
                          numberOfLines={1}
                        >
                          {resource.url}
                        </Text>
                      </View>
                      <IconSymbol
                        name="chevron.right"
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Padding */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
