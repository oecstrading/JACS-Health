import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import medicalLibraryCategoriesService from "@/services/medicalLibraryCategories";
import * as Speech from "expo-speech";

/**
 * Disease Detail Screen
 * 
 * Displays comprehensive information about a specific disease including
 * symptoms, diagnosis, treatment, prevention, and related conditions.
 */
export default function DiseaseDetailScreen() {
  const colors = useColors();
  const { diseaseId } = useLocalSearchParams<{ diseaseId: string }>();
  const [isReading, setIsReading] = useState(false);

  const disease = medicalLibraryCategoriesService.getDiseaseById(diseaseId || "");
  const relatedDiseases = disease
    ? medicalLibraryCategoriesService.getRelatedDiseases(disease.id)
    : [];

  if (!disease) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center p-6">
          <Text style={{ fontSize: 18, color: colors.muted }}>
            Disease not found
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginTop: 20,
              backgroundColor: colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 16, color: "#FFFFFF", fontWeight: "600" }}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const handleReadAloud = async () => {
    if (isReading) {
      Speech.stop();
      setIsReading(false);
    } else {
      setIsReading(true);
      const textToRead = `${disease.name}. ${disease.plainEnglishSummary}`;
      await Speech.speak(textToRead, {
        rate: 0.85,
        onDone: () => setIsReading(false),
        onStopped: () => setIsReading(false),
      });
    }
  };

  const renderSection = (title: string, items: string[], icon?: string) => {
    if (!items || items.length === 0) return null;

    return (
      <View className="mb-6">
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: colors.foreground,
            marginBottom: 12,
          }}
        >
          {icon} {title}
        </Text>
        {items.map((item, index) => (
          <View key={index} className="flex-row mb-3">
            <Text style={{ fontSize: 18, color: colors.primary, marginRight: 8 }}>
              •
            </Text>
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                lineHeight: 24,
                color: colors.foreground,
              }}
            >
              {item}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="px-6 pt-4 pb-4">
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 16, color: colors.primary }}>← Back to Library</Text>
          </TouchableOpacity>

          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1">
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: colors.foreground,
                  marginBottom: 8,
                }}
              >
                {disease.name}
              </Text>
              <View
                style={{
                  backgroundColor: colors.primary + "20",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  alignSelf: "flex-start",
                }}
              >
                <Text style={{ fontSize: 13, color: colors.primary, fontWeight: "600" }}>
                  {disease.category}
                </Text>
              </View>
            </View>
          </View>

          {/* Read Aloud Button */}
          <TouchableOpacity
            onPress={handleReadAloud}
            style={{
              backgroundColor: isReading ? colors.surface : colors.primary,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              borderWidth: isReading ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 20, marginRight: 8 }}>
              {isReading ? "⏸️" : "🔊"}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: isReading ? colors.foreground : "#FFFFFF",
              }}
            >
              {isReading ? "Stop Reading" : "Read Aloud"}
            </Text>
          </TouchableOpacity>

          {/* Plain English Summary */}
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 12,
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                lineHeight: 26,
                color: colors.foreground,
              }}
            >
              {disease.plainEnglishSummary}
            </Text>
          </View>
        </View>

        {/* Red Flags */}
        {disease.redFlags && disease.redFlags.length > 0 && (
          <View className="px-6 mb-6">
            <View
              style={{
                backgroundColor: "#FEF2F2",
                padding: 16,
                borderRadius: 12,
                borderLeftWidth: 4,
                borderLeftColor: "#EF4444",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#DC2626",
                  marginBottom: 12,
                }}
              >
                ⚠️ Red Flags - Seek Immediate Care
              </Text>
              {disease.redFlags.map((flag, index) => (
                <View key={index} className="flex-row mb-2">
                  <Text style={{ fontSize: 18, color: "#DC2626", marginRight: 8 }}>
                    •
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 16,
                      lineHeight: 24,
                      color: "#991B1B",
                      fontWeight: "600",
                    }}
                  >
                    {flag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Main Content Sections */}
        <View className="px-6">
          {renderSection("Symptoms", disease.symptoms, "📋")}
          {renderSection("Risk Factors", disease.riskFactors, "⚠️")}
          {renderSection("Diagnosis", disease.diagnosis, "🔬")}
          {renderSection("Treatment", disease.treatment, "💊")}
          {renderSection("Prevention", disease.prevention, "🛡️")}

          {/* Screening Guidelines */}
          {disease.screeningGuidelines && (
            <View className="mb-6">
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: colors.foreground,
                  marginBottom: 12,
                }}
              >
                🗓️ Screening Guidelines
              </Text>
              <View
                style={{
                  backgroundColor: colors.surface,
                  padding: 16,
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontSize: 16, color: colors.foreground, marginBottom: 8 }}>
                  <Text style={{ fontWeight: "700" }}>Start Age:</Text>{" "}
                  {disease.screeningGuidelines.ageStart}
                </Text>
                <Text style={{ fontSize: 16, color: colors.foreground, marginBottom: 8 }}>
                  <Text style={{ fontWeight: "700" }}>Frequency:</Text>{" "}
                  {disease.screeningGuidelines.frequency}
                </Text>
                <Text style={{ fontSize: 16, color: colors.foreground, marginBottom: 12 }}>
                  <Text style={{ fontWeight: "700" }}>Tests:</Text>{" "}
                  {disease.screeningGuidelines.testTypes.join(", ")}
                </Text>
                {disease.screeningGuidelines.localScreeningCenters && (
                  <TouchableOpacity
                    onPress={() => router.push("/find-care")}
                    style={{
                      backgroundColor: colors.primary,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 15, color: "#FFFFFF", fontWeight: "600", textAlign: "center" }}>
                      Find Screening Centers Near You
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Related Conditions */}
          {relatedDiseases.length > 0 && (
            <View className="mb-6">
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: colors.foreground,
                  marginBottom: 12,
                }}
              >
                🔗 Related Conditions
              </Text>
              {disease.crossReferenceNotes && (
                <Text
                  style={{
                    fontSize: 15,
                    lineHeight: 22,
                    color: colors.muted,
                    marginBottom: 12,
                    fontStyle: "italic",
                  }}
                >
                  {disease.crossReferenceNotes}
                </Text>
              )}
              {relatedDiseases.map((related) => (
                <TouchableOpacity
                  key={related.id}
                  onPress={() => {
                    router.push({
                      pathname: "/disease-detail",
                      params: { diseaseId: related.id },
                    });
                  }}
                  style={{
                    backgroundColor: colors.surface,
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "600",
                      color: colors.foreground,
                      marginBottom: 4,
                    }}
                  >
                    {related.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.muted }}>
                    {related.plainEnglishSummary}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Sources */}
          <View className="mb-6">
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: colors.foreground,
                marginBottom: 12,
              }}
            >
              📚 Verified Sources
            </Text>
            {disease.sources.map((source, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: colors.surface,
                  padding: 14,
                  borderRadius: 12,
                  marginBottom: 10,
                }}
              >
                <View className="flex-row items-center mb-2">
                  <View
                    style={{
                      backgroundColor: colors.primary + "20",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      marginRight: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: colors.primary, fontWeight: "600" }}>
                      {source.organization}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: colors.muted }}>
                    Updated: {source.lastUpdated}
                  </Text>
                </View>
                <Text style={{ fontSize: 15, color: colors.foreground }}>
                  {source.title}
                </Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View className="mb-6">
            <TouchableOpacity
              onPress={() => router.push("/find-care")}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 20,
                paddingVertical: 14,
                borderRadius: 12,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 17, color: "#FFFFFF", fontWeight: "600", textAlign: "center" }}>
                Find Care Near Me
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                // Save to My Health Center
                router.push("/my-health-center");
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
              <Text style={{ fontSize: 17, color: colors.foreground, fontWeight: "600", textAlign: "center" }}>
                Save to My Health Center
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
