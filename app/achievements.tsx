import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  ACHIEVEMENTS,
  type Achievement,
  getAchievementProgress,
  getRarityColor,
} from "@/services/recoveryAchievements";

/**
 * Full Achievements Screen
 * 
 * Display all recovery achievement badges with:
 * - Earned/locked states
 * - Progress bars for locked badges
 * - Rarity color coding
 * - Category filtering
 * - Achievement details
 */

export default function AchievementsScreen() {
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Mobility", "Milestones", "Exercise", "Progress"];

  const filteredAchievements = ACHIEVEMENTS.filter((achievement) => {
    return selectedCategory === "All" || achievement.category === selectedCategory;
  });

  const earnedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length;
  const totalCount = ACHIEVEMENTS.length;

  const handleAchievementPress = (achievement: Achievement) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const progress = getAchievementProgress(achievement);
    const status = achievement.unlocked
      ? `Unlocked on ${achievement.unlockedDate || "Unknown"}`
      : `Progress: ${progress}% (${achievement.unlockCriteria.current || 0}/${achievement.unlockCriteria.target})`;
    
    alert(`${achievement.title}\n\n${achievement.description}\n\nRarity: ${achievement.rarity}\nCategory: ${achievement.category}\n\n${status}`);
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          Recovery Achievements
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          {earnedCount} of {totalCount} badges earned
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Category Filter */}
        <View className="px-6 mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
            {categories.map((category) => (
              <Pressable
                key={category}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(category);
                }}
                style={({ pressed }) => ({
                  backgroundColor: selectedCategory === category ? colors.primary : colors.surface,
                  borderRadius: 20,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: selectedCategory === category ? colors.primary : colors.border,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  className="text-base font-bold"
                  style={{
                    color: selectedCategory === category ? "#ffffff" : colors.foreground,
                    lineHeight: 22,
                  }}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Achievements Grid */}
        <View className="px-6 pb-8">
          <View className="gap-4">
            {filteredAchievements.map((achievement) => {
              const progress = getAchievementProgress(achievement);
              const rarityColor = getRarityColor(achievement.rarity);

              return (
                <Pressable
                  key={achievement.id}
                  onPress={() => handleAchievementPress(achievement)}
                  style={({ pressed }) => ({
                    backgroundColor: colors.surface,
                    borderRadius: 24,
                    padding: 20,
                    borderWidth: 2,
                    borderColor: achievement.unlocked ? rarityColor : colors.border,
                    opacity: pressed ? 0.7 : achievement.unlocked ? 1 : 0.6,
                  })}
                >
                  <View className="flex-row items-start gap-4">
                    {/* Badge Icon */}
                    <View
                      className="w-20 h-20 rounded-3xl items-center justify-center"
                      style={{
                        backgroundColor: achievement.unlocked
                          ? `${rarityColor}20`
                          : `${colors.muted}20`,
                      }}
                    >
                      <Text style={{ fontSize: 40, opacity: achievement.unlocked ? 1 : 0.4 }}>
                        {achievement.icon}
                      </Text>
                    </View>

                    {/* Badge Info */}
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-2">
                        <View
                          className="px-3 py-1 rounded-full"
                          style={{ backgroundColor: `${rarityColor}20` }}
                        >
                          <Text
                            className="text-sm font-bold"
                            style={{ color: rarityColor, lineHeight: 20 }}
                          >
                            {achievement.rarity}
                          </Text>
                        </View>
                        {achievement.unlocked && (
                          <View
                            className="px-3 py-1 rounded-full"
                            style={{ backgroundColor: `${colors.success}20` }}
                          >
                            <Text
                              className="text-sm font-bold"
                              style={{ color: colors.success, lineHeight: 20 }}
                            >
                              ✓ Earned
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        className="text-xl font-bold text-foreground mb-1"
                        style={{ lineHeight: 28 }}
                      >
                        {achievement.title}
                      </Text>
                      <Text className="text-base text-muted mb-3" style={{ lineHeight: 22 }}>
                        {achievement.description}
                      </Text>

                      {/* Progress Bar (for locked achievements) */}
                      {!achievement.unlocked && (
                        <View>
                          <View
                            className="h-2 rounded-full mb-2"
                            style={{ backgroundColor: `${colors.muted}20` }}
                          >
                            <View
                              className="h-2 rounded-full"
                              style={{
                                width: `${progress}%`,
                                backgroundColor: rarityColor,
                              }}
                            />
                          </View>
                          <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
                            {progress}% Complete ({achievement.unlockCriteria.current || 0}/
                            {achievement.unlockCriteria.target})
                          </Text>
                        </View>
                      )}

                      {/* Unlock Date (for earned achievements) */}
                      {achievement.unlocked && achievement.unlockedDate && (
                        <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
                          Unlocked: {new Date(achievement.unlockedDate).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
