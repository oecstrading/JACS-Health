import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  familyHealthHistoryService,
  type FamilyMember,
  type RiskProfile,
  type FamilyHealthTree,
} from "@/services/familyHealthHistory";

export default function FamilyHealthHistoryScreen() {
  const router = useRouter();
  const colors = useColors();
  
  const [tree, setTree] = useState<FamilyHealthTree | null>(null);
  const [riskProfiles, setRiskProfiles] = useState<RiskProfile[]>([]);
  const [view, setView] = useState<"tree" | "risk">("tree");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFamilyTree();
  }, []);

  const loadFamilyTree = async () => {
    try {
      let existingTree = await familyHealthHistoryService.getUserFamilyTree("user123");
      
      if (!existingTree) {
        existingTree = await familyHealthHistoryService.createFamilyTree("user123");
      }
      
      setTree(existingTree);
      
      if (existingTree) {
        const profiles = await familyHealthHistoryService.calculateRiskProfile(existingTree.id);
        setRiskProfiles(profiles);
      }
    } catch (error) {
      console.error("Error loading family tree:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!tree) return;
    
    // In production, show a modal with form
    const newMember = {
      name: "Family Member",
      relationship: "mother" as const,
      gender: "female" as const,
      isDeceased: false,
      conditions: [],
    };
    
    try {
      await familyHealthHistoryService.addFamilyMember(tree.id, newMember);
      await loadFamilyTree();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error adding family member:", error);
    }
  };

  const relationshipLabels: Record<FamilyMember["relationship"], string> = {
    self: "You",
    mother: "Mother",
    father: "Father",
    maternal_grandmother: "Maternal Grandmother",
    maternal_grandfather: "Maternal Grandfather",
    paternal_grandmother: "Paternal Grandmother",
    paternal_grandfather: "Paternal Grandfather",
    sibling: "Sibling",
    child: "Child",
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-muted">Loading family history...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-6 py-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
            Family Health History
          </Text>
          <Text className="text-base text-muted mt-2" style={{ lineHeight: 24 }}>
            Track hereditary conditions and understand your genetic risk
          </Text>
        </View>

        {/* View Toggle */}
        <View className="flex-row mb-6" style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 4 }}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setView("tree");
            }}
            style={{
              flex: 1,
              backgroundColor: view === "tree" ? colors.primary : "transparent",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text
              className="text-center font-semibold"
              style={{
                color: view === "tree" ? "#FFFFFF" : colors.foreground,
                lineHeight: 22,
              }}
            >
              Family Tree
            </Text>
          </Pressable>
          
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setView("risk");
            }}
            style={{
              flex: 1,
              backgroundColor: view === "risk" ? colors.primary : "transparent",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text
              className="text-center font-semibold"
              style={{
                color: view === "risk" ? "#FFFFFF" : colors.foreground,
                lineHeight: 22,
              }}
            >
              Risk Profile
            </Text>
          </Pressable>
        </View>

        {/* Family Tree View */}
        {view === "tree" && tree && (
          <View className="gap-4">
            {tree.members.map((member) => (
              <View
                key={member.id}
                style={{
                  backgroundColor: colors.surface,
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground" style={{ lineHeight: 26 }}>
                      {member.name}
                    </Text>
                    <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
                      {relationshipLabels[member.relationship]}
                      {member.birthYear && ` • Born ${member.birthYear}`}
                      {member.isDeceased && " • Deceased"}
                    </Text>
                  </View>
                  <Text className="text-2xl">{member.gender === "male" ? "👨" : member.gender === "female" ? "👩" : "🧑"}</Text>
                </View>

                {member.conditions.length > 0 && (
                  <View className="mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
                    <Text className="text-sm font-semibold text-foreground mb-2" style={{ lineHeight: 20 }}>
                      Health Conditions:
                    </Text>
                    {member.conditions.map((condition, index) => (
                      <View key={index} className="flex-row items-center mb-1">
                        <Text className="text-sm text-primary mr-2">•</Text>
                        <Text className="text-sm text-foreground" style={{ lineHeight: 20 }}>
                          {condition.conditionName}
                          {condition.ageOfDiagnosis && ` (diagnosed at age ${condition.ageOfDiagnosis})`}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {member.conditions.length === 0 && (
                  <Text className="text-sm text-muted mt-2" style={{ lineHeight: 20 }}>
                    No conditions recorded
                  </Text>
                )}
              </View>
            ))}

            {/* Add Member Button */}
            <Pressable
              onPress={handleAddMember}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                  backgroundColor: colors.surface,
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: colors.primary,
                  borderStyle: "dashed",
                } as ViewStyle,
              ]}
            >
              <Text
                className="text-center text-lg font-semibold text-primary"
                style={{ lineHeight: 26 }}
              >
                + Add Family Member
              </Text>
            </Pressable>
          </View>
        )}

        {/* Risk Profile View */}
        {view === "risk" && (
          <View className="gap-4">
            {riskProfiles.length === 0 ? (
              <View
                style={{
                  backgroundColor: colors.surface,
                  padding: 24,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text className="text-lg text-center text-foreground mb-2" style={{ lineHeight: 26 }}>
                  No Risk Factors Identified
                </Text>
                <Text className="text-base text-center text-muted" style={{ lineHeight: 24 }}>
                  Add family members and their health conditions to calculate your genetic risk profile
                </Text>
              </View>
            ) : (
              <>
                <Text className="text-xl font-bold text-foreground mb-2" style={{ lineHeight: 28 }}>
                  Your Genetic Risk Profile
                </Text>

                {riskProfiles.map((profile) => {
                  const riskColor =
                    profile.riskLevel === "very_high"
                      ? colors.error
                      : profile.riskLevel === "high"
                      ? "#F59E0B"
                      : profile.riskLevel === "moderate"
                      ? "#FBBF24"
                      : colors.success;

                  return (
                    <View
                      key={profile.conditionId}
                      style={{
                        backgroundColor: colors.surface,
                        padding: 16,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: riskColor,
                      }}
                    >
                      <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-lg font-semibold text-foreground flex-1" style={{ lineHeight: 26 }}>
                          {profile.conditionName}
                        </Text>
                        <View
                          style={{
                            backgroundColor: riskColor,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 8,
                          }}
                        >
                          <Text className="text-sm font-bold" style={{ color: "#FFFFFF", lineHeight: 20 }}>
                            {profile.riskPercentage}%
                          </Text>
                        </View>
                      </View>

                      <Text className="text-base text-foreground mb-3" style={{ lineHeight: 24 }}>
                        {profile.explanation}
                      </Text>

                      <View className="mb-3">
                        <Text className="text-sm font-semibold text-foreground mb-2" style={{ lineHeight: 20 }}>
                          Affected Relatives:
                        </Text>
                        <Text className="text-sm text-muted" style={{ lineHeight: 20 }}>
                          {profile.affectedRelatives.join(", ")}
                        </Text>
                      </View>

                      <View className="pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
                        <Text className="text-sm font-semibold text-foreground mb-2" style={{ lineHeight: 20 }}>
                          Screening Recommendations:
                        </Text>
                        {profile.screeningRecommendations.map((rec, index) => (
                          <View key={index} className="flex-row items-start mb-1">
                            <Text className="text-sm text-primary mr-2">•</Text>
                            <Text className="text-sm text-foreground flex-1" style={{ lineHeight: 20 }}>
                              {rec}
                            </Text>
                          </View>
                        ))}
                      </View>

                      <Pressable
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          router.push(`/disease-detail?id=${profile.conditionId}` as any);
                        }}
                        style={{ marginTop: 12 }}
                      >
                        <Text className="text-base text-primary font-semibold">
                          Learn More About {profile.conditionName} →
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}

                {/* Export Button */}
                <Pressable
                  onPress={async () => {
                    if (!tree) return;
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    try {
                      await familyHealthHistoryService.exportFamilyHistoryPDF(tree.id);
                      alert("Family history exported! You can now share it with your doctor.");
                    } catch (error) {
                      console.error("Error exporting family history:", error);
                    }
                  }}
                  style={({ pressed }) => [
                    {
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      opacity: pressed ? 0.9 : 1,
                      backgroundColor: colors.primary,
                      padding: 16,
                      borderRadius: 12,
                      marginTop: 8,
                    } as ViewStyle,
                  ]}
                >
                  <Text
                    className="text-center text-lg font-bold"
                    style={{ color: "#FFFFFF", lineHeight: 26 }}
                  >
                    Export for Doctor
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
