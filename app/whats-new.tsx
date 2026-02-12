import { ScrollView, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import updateService, { type FeatureUpdate } from "@/services/updateService";

/**
 * What's New Screen - Changelog Viewer
 * 
 * Displays version history and feature updates.
 */
export default function WhatsNewScreen() {
  const colors = useColors();
  const [currentVersion, setCurrentVersion] = useState("");
  const [latestVersion, setLatestVersion] = useState("");
  const [features, setFeatures] = useState<FeatureUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChangelog();
  }, []);

  const loadChangelog = async () => {
    try {
      const current = updateService.getCurrentVersion();
      const changelog = await updateService.getChangelog(current, "latest");
      
      setCurrentVersion(current);
      setLatestVersion("1.1.0"); // Would come from API
      setFeatures(changelog);
    } catch (error) {
      console.error("Error loading changelog:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: FeatureUpdate["category"]) => {
    switch (category) {
      case "new":
        return "sparkles";
      case "improved":
        return "arrow.up.circle.fill";
      case "fixed":
        return "checkmark.circle.fill";
    }
  };

  const getCategoryColor = (category: FeatureUpdate["category"]) => {
    switch (category) {
      case "new":
        return colors.primary;
      case "improved":
        return colors.success;
      case "fixed":
        return colors.warning;
    }
  };

  const getCategoryLabel = (category: FeatureUpdate["category"]) => {
    switch (category) {
      case "new":
        return "New Feature";
      case "improved":
        return "Improvement";
      case "fixed":
        return "Bug Fix";
    }
  };

  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, FeatureUpdate[]>);

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          className="flex-row items-center gap-2 mb-2"
        >
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          <Text className="text-lg text-primary" style={{ lineHeight: 24 }}>
            Back
          </Text>
        </Pressable>
        <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 40 }}>
          What's New
        </Text>
        <Text className="text-lg text-muted mt-1" style={{ lineHeight: 26 }}>
          Version {latestVersion} • Released Feb 9, 2026
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-lg text-muted" style={{ lineHeight: 24 }}>
              Loading changelog...
            </Text>
          </View>
        ) : (
          <>
            {/* Version Info Card */}
            <View className="bg-surface rounded-3xl p-6 border border-border mb-6">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xl font-bold text-foreground" style={{ lineHeight: 28 }}>
                    Current Version
                  </Text>
                  <Text className="text-3xl font-bold text-primary mt-2" style={{ lineHeight: 40 }}>
                    {currentVersion}
                  </Text>
                </View>
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: `${colors.primary}20` }}
                >
                  <IconSymbol name="checkmark.circle.fill" size={36} color={colors.primary} />
                </View>
              </View>
            </View>

            {/* New Features */}
            {groupedFeatures.new && groupedFeatures.new.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center gap-3 mb-4">
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center"
                    style={{ backgroundColor: `${getCategoryColor("new")}20` }}
                  >
                    <IconSymbol
                      name={getCategoryIcon("new") as any}
                      size={24}
                      color={getCategoryColor("new")}
                    />
                  </View>
                  <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
                    New Features
                  </Text>
                </View>

                <View className="gap-4">
                  {groupedFeatures.new.map((feature, index) => (
                    <View
                      key={index}
                      className="bg-surface rounded-2xl p-5 border border-border"
                    >
                      <Text className="text-xl font-semibold text-foreground" style={{ lineHeight: 28 }}>
                        {feature.title}
                      </Text>
                      <Text className="text-base text-muted mt-2" style={{ lineHeight: 22 }}>
                        {feature.description}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Improvements */}
            {groupedFeatures.improved && groupedFeatures.improved.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center gap-3 mb-4">
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center"
                    style={{ backgroundColor: `${getCategoryColor("improved")}20` }}
                  >
                    <IconSymbol
                      name={getCategoryIcon("improved") as any}
                      size={24}
                      color={getCategoryColor("improved")}
                    />
                  </View>
                  <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
                    Improvements
                  </Text>
                </View>

                <View className="gap-4">
                  {groupedFeatures.improved.map((feature, index) => (
                    <View
                      key={index}
                      className="bg-surface rounded-2xl p-5 border border-border"
                    >
                      <Text className="text-xl font-semibold text-foreground" style={{ lineHeight: 28 }}>
                        {feature.title}
                      </Text>
                      <Text className="text-base text-muted mt-2" style={{ lineHeight: 22 }}>
                        {feature.description}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Bug Fixes */}
            {groupedFeatures.fixed && groupedFeatures.fixed.length > 0 && (
              <View className="mb-8">
                <View className="flex-row items-center gap-3 mb-4">
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center"
                    style={{ backgroundColor: `${getCategoryColor("fixed")}20` }}
                  >
                    <IconSymbol
                      name={getCategoryIcon("fixed") as any}
                      size={24}
                      color={getCategoryColor("fixed")}
                    />
                  </View>
                  <Text className="text-2xl font-bold text-foreground" style={{ lineHeight: 32 }}>
                    Bug Fixes
                  </Text>
                </View>

                <View className="gap-4">
                  {groupedFeatures.fixed.map((feature, index) => (
                    <View
                      key={index}
                      className="bg-surface rounded-2xl p-5 border border-border"
                    >
                      <Text className="text-xl font-semibold text-foreground" style={{ lineHeight: 28 }}>
                        {feature.title}
                      </Text>
                      <Text className="text-base text-muted mt-2" style={{ lineHeight: 22 }}>
                        {feature.description}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Footer */}
            <View className="items-center mb-8">
              <Text className="text-base text-muted text-center" style={{ lineHeight: 22 }}>
                Thank you for using JACS Medical Monitoring System!
              </Text>
              <Text className="text-sm text-muted text-center mt-2" style={{ lineHeight: 18 }}>
                Your AI Health Companion
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
