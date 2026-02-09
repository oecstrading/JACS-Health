import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import medicalLibraryCategoriesService, {
  type MedicalCategory,
  type CategoryInfo,
  type DiseaseEntry,
} from "@/services/medicalLibraryCategories";

/**
 * Categorized Medical Library Screen
 * 
 * Displays diseases organized into 6 clinical categories with tabbed navigation.
 * Implements visual-first standards with high-contrast UI for seniors.
 */
export default function MedicalLibraryCategorizedScreen() {
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState<MedicalCategory>("Cancer");

  const categories = medicalLibraryCategoriesService.getCategories();
  const diseases = medicalLibraryCategoriesService.getDiseasesByCategory(selectedCategory);

  const renderCategoryTab = ({ item }: { item: CategoryInfo }) => {
    const isSelected = item.id === selectedCategory;
    
    return (
      <TouchableOpacity
        onPress={() => setSelectedCategory(item.id)}
        style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          backgroundColor: isSelected ? colors.primary : colors.surface,
          borderRadius: 12,
          marginRight: 12,
          borderWidth: isSelected ? 0 : 1,
          borderColor: colors.border,
        }}
      >
        <View className="items-center">
          <Text style={{ fontSize: 28, marginBottom: 4 }}>{item.icon}</Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: isSelected ? "700" : "600",
              color: isSelected ? "#FFFFFF" : colors.foreground,
              textAlign: "center",
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: isSelected ? "#FFFFFF" : colors.muted,
              marginTop: 2,
            }}
          >
            {item.conditionCount} {item.conditionCount === 1 ? "condition" : "conditions"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDiseaseCard = ({ item }: { item: DiseaseEntry }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/disease-detail",
            params: { diseaseId: item.id },
          });
        }}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: colors.foreground,
                marginBottom: 4,
              }}
            >
              {item.name}
            </Text>
            {item.relatedConditions && item.relatedConditions.length > 0 && (
              <View className="flex-row items-center mt-1">
                <Text style={{ fontSize: 12, color: colors.primary, fontWeight: "600" }}>
                  🔗 Related Conditions
                </Text>
              </View>
            )}
          </View>
          {item.screeningGuidelines && (
            <View
              style={{
                backgroundColor: colors.primary + "20",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 11, color: colors.primary, fontWeight: "600" }}>
                Screening Available
              </Text>
            </View>
          )}
        </View>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.foreground,
            marginBottom: 12,
          }}
        >
          {item.plainEnglishSummary}
        </Text>

        {item.redFlags && item.redFlags.length > 0 && (
          <View
            style={{
              backgroundColor: "#FEF2F2",
              padding: 12,
              borderRadius: 8,
              borderLeftWidth: 4,
              borderLeftColor: "#EF4444",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#DC2626", marginBottom: 6 }}>
              ⚠️ Red Flags - Seek Immediate Care:
            </Text>
            <Text style={{ fontSize: 14, color: "#991B1B", lineHeight: 20 }}>
              {item.redFlags[0]}
            </Text>
            {item.redFlags.length > 1 && (
              <Text style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>
                +{item.redFlags.length - 1} more warning signs
              </Text>
            )}
          </View>
        )}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text style={{ fontSize: 12, color: colors.muted }}>
              Sources: {item.sources.map((s) => s.organization).join(", ")}
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.primary, fontWeight: "600" }}>
            Learn More →
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginBottom: 12 }}
          >
            <Text style={{ fontSize: 16, color: colors.primary }}>← Back</Text>
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 6,
            }}
          >
            Medical Library
          </Text>
          <Text style={{ fontSize: 16, color: colors.muted, lineHeight: 22 }}>
            Browse conditions by category. Tap any condition for detailed information, symptoms, and local resources.
          </Text>
        </View>

        {/* Category Tabs */}
        <View className="mb-4">
          <FlatList
            data={categories}
            renderItem={renderCategoryTab}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8 }}
          />
        </View>

        {/* Category Description */}
        <View className="px-6 mb-3">
          <Text style={{ fontSize: 15, color: colors.muted, lineHeight: 21 }}>
            {categories.find((c) => c.id === selectedCategory)?.description}
          </Text>
        </View>

        {/* Disease List */}
        <FlatList
          data={diseases}
          renderItem={renderDiseaseCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScreenContainer>
  );
}
