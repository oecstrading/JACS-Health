import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { getAllTemplates, type IntakeTemplate } from "@/services/intakeTemplates";
import PatientIntakeService from "@/services/patientIntake";

export default function IntakeTemplateSelectionScreen() {
  const colors = useColors();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const templates = getAllTemplates();

  const handleTemplateSelect = async (template: IntakeTemplate) => {
    try {
      // Create new intake form
      const form = await PatientIntakeService.createIntakeForm(
        template.appointmentType,
        undefined
      );

      // Navigate to voice intake with template
      router.push({
        pathname: "/voice-intake" as any,
        params: {
          formId: form.id,
          templateId: template.id,
        },
      });
    } catch (error) {
      console.error("Error creating form from template:", error);
    }
  };

  const handleSkipTemplate = async () => {
    try {
      // Create standard form without template
      const form = await PatientIntakeService.createIntakeForm();
      router.push({
        pathname: "/voice-intake" as any,
        params: { formId: form.id },
      });
    } catch (error) {
      console.error("Error creating form:", error);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Header */}
          <View className="mb-2">
            <Text
              className="text-3xl font-bold mb-2"
              style={{ color: colors.foreground }}
            >
              Choose Form Type
            </Text>
            <Text
              className="text-base leading-relaxed"
              style={{ color: colors.muted }}
            >
              Select the type of appointment to use a pre-configured form that saves time and asks only relevant questions.
            </Text>
          </View>

          {/* Template Cards */}
          {templates.map((template) => (
            <TouchableOpacity
              key={template.id}
              onPress={() => handleTemplateSelect(template)}
              style={{
                backgroundColor: colors.surface,
                borderColor: selectedTemplate === template.id ? colors.primary : colors.border,
                borderWidth: selectedTemplate === template.id ? 2 : 1,
              }}
              className="rounded-2xl p-4"
            >
              <View className="flex-row items-start gap-3">
                {/* Icon */}
                <View
                  style={{ backgroundColor: colors.primary }}
                  className="w-12 h-12 rounded-xl items-center justify-center"
                >
                  <Text className="text-2xl">
                    {template.icon === "heart.text.square.fill" && "💓"}
                    {template.icon === "stethoscope" && "🩺"}
                    {template.icon === "cross.case.fill" && "🏥"}
                    {template.icon === "person.badge.plus" && "👤"}
                    {template.icon === "arrow.clockwise" && "🔄"}
                    {template.icon === "bolt.fill" && "⚡"}
                    {template.icon === "video.fill" && "📹"}
                    {template.icon === "leaf.fill" && "🌿"}
                    {template.icon === "heart.text.square" && "❤️"}
                  </Text>
                </View>

                {/* Content */}
                <View className="flex-1">
                  <Text
                    className="text-lg font-semibold mb-1"
                    style={{ color: colors.foreground }}
                  >
                    {template.name}
                  </Text>
                  <Text
                    className="text-sm leading-relaxed mb-2"
                    style={{ color: colors.muted }}
                  >
                    {template.description}
                  </Text>

                  {/* Metadata */}
                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1">
                      <Text style={{ color: colors.primary }}>⏱️</Text>
                      <Text
                        className="text-sm font-medium"
                        style={{ color: colors.primary }}
                      >
                        ~{template.estimatedMinutes} min
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-1">
                      <Text style={{ color: colors.success }}>✓</Text>
                      <Text
                        className="text-sm"
                        style={{ color: colors.muted }}
                      >
                        {template.requiredSections.length} sections
                      </Text>
                    </View>

                    {template.customQuestions && template.customQuestions.length > 0 && (
                      <View className="flex-row items-center gap-1">
                        <Text style={{ color: colors.muted }}>❓</Text>
                        <Text
                          className="text-sm"
                          style={{ color: colors.muted }}
                        >
                          {template.customQuestions.length} custom
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Skip Template Option */}
          <TouchableOpacity
            onPress={handleSkipTemplate}
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              borderWidth: 1,
              borderStyle: "dashed",
            }}
            className="rounded-2xl p-4 items-center"
          >
            <Text
              className="text-base font-medium mb-1"
              style={{ color: colors.foreground }}
            >
              Use Standard Form
            </Text>
            <Text
              className="text-sm text-center"
              style={{ color: colors.muted }}
            >
              Complete the full intake form without a template (~15 minutes)
            </Text>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ backgroundColor: colors.surface }}
            className="rounded-2xl p-4 items-center mt-2"
          >
            <Text
              className="text-base font-medium"
              style={{ color: colors.foreground }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
