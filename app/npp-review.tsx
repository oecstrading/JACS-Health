import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router, useLocalSearchParams } from "expo-router";
import { getCurrentNPP, getNPPSections } from "@/services/noticeOfPrivacyPractices";

export default function NPPReviewScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const [acknowledged, setAcknowledged] = useState(false);
  const npp = getCurrentNPP();
  const sections = getNPPSections();

  const handleAcknowledge = () => {
    // Store NPP acknowledgment
    // In production, save to database with timestamp
    
    // Navigate back to intake form
    if (params.returnTo) {
      router.push(params.returnTo as any);
    } else {
      router.back();
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Legal Header */}
          <View
            style={{ backgroundColor: colors.warning }}
            className="rounded-2xl p-4"
          >
            <Text
              className="text-base font-bold leading-relaxed text-center"
              style={{ color: colors.background }}
            >
              {npp.content.legalHeader}
            </Text>
          </View>

          {/* Title */}
          <View>
            <Text
              className="text-3xl font-bold mb-2"
              style={{ color: colors.foreground }}
            >
              Notice of Privacy Practices
            </Text>
            <Text
              className="text-base"
              style={{ color: colors.muted }}
            >
              Effective Date: {new Date(npp.effectiveDate).toLocaleDateString()}
            </Text>
            <Text
              className="text-base mb-4"
              style={{ color: colors.muted }}
            >
              Version: {npp.version}
            </Text>
          </View>

          {/* Introduction */}
          <View
            style={{ backgroundColor: colors.surface }}
            className="rounded-2xl p-4"
          >
            <Text
              className="text-base leading-relaxed"
              style={{ color: colors.foreground }}
            >
              {npp.content.introduction}
            </Text>
          </View>

          {/* Sections */}
          {sections.map((section) => (
            <View key={section.id} className="gap-3">
              <Text
                className="text-xl font-bold"
                style={{ color: colors.foreground }}
              >
                {section.title}
              </Text>

              <Text
                className="text-base leading-relaxed"
                style={{ color: colors.foreground }}
              >
                {section.content}
              </Text>

              {section.subsections && section.subsections.map((subsection, idx) => (
                <View
                  key={idx}
                  style={{ backgroundColor: colors.surface }}
                  className="rounded-xl p-4"
                >
                  <Text
                    className="text-base font-semibold mb-2"
                    style={{ color: colors.foreground }}
                  >
                    {subsection.title}
                  </Text>
                  <Text
                    className="text-base leading-relaxed"
                    style={{ color: colors.muted }}
                  >
                    {subsection.content}
                  </Text>
                </View>
              ))}
            </View>
          ))}

          {/* Footer */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 2,
            }}
            className="rounded-2xl p-4"
          >
            <Text
              className="text-base leading-relaxed"
              style={{ color: colors.foreground }}
            >
              {npp.content.footer}
            </Text>
          </View>

          {/* Acknowledgment Checkbox */}
          <TouchableOpacity
            onPress={() => setAcknowledged(!acknowledged)}
            style={{
              backgroundColor: colors.surface,
              borderColor: acknowledged ? colors.success : colors.border,
              borderWidth: 2,
            }}
            className="rounded-2xl p-4 flex-row items-center gap-3"
          >
            <View
              style={{
                backgroundColor: acknowledged ? colors.success : colors.background,
                borderColor: colors.border,
                borderWidth: acknowledged ? 0 : 2,
              }}
              className="w-8 h-8 rounded-lg items-center justify-center"
            >
              {acknowledged && (
                <Text className="text-xl" style={{ color: colors.background }}>
                  ✓
                </Text>
              )}
            </View>

            <Text
              className="text-base font-medium flex-1"
              style={{ color: colors.foreground }}
            >
              I have read and understand this Notice of Privacy Practices
            </Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleAcknowledge}
              disabled={!acknowledged}
              style={{
                backgroundColor: acknowledged ? colors.primary : colors.surface,
                opacity: acknowledged ? 1 : 0.5,
              }}
              className="rounded-2xl p-4 items-center"
            >
              <Text
                className="text-lg font-semibold"
                style={{ color: acknowledged ? colors.background : colors.muted }}
              >
                Acknowledge & Continue
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              style={{ backgroundColor: colors.surface }}
              className="rounded-2xl p-4 items-center"
            >
              <Text
                className="text-base font-medium"
                style={{ color: colors.foreground }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
