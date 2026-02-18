import { Modal, View, Text, Pressable, ScrollView, type ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";

import { IconSymbol } from "./ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import type { FeatureUpdate } from "@/services/updateService";

interface UpdateNotificationModalProps {
  visible: boolean;
  currentVersion: string;
  latestVersion: string;
  priority: "critical" | "recommended" | "optional";
  features: FeatureUpdate[];
  onUpdate: () => void;
  onRemindLater: () => void;
  onSkip: () => void;
  shouldForceUpdate: boolean;
}

export function UpdateNotificationModal({
  visible,
  currentVersion,
  latestVersion,
  priority,
  features,
  onUpdate,
  onRemindLater,
  onSkip,
  shouldForceUpdate,
}: UpdateNotificationModalProps) {
  const colors = useColors();

  const getPriorityColor = () => {
    switch (priority) {
      case "critical":
        return colors.error;
      case "recommended":
        return colors.primary;
      case "optional":
        return colors.success;
    }
  };

  const getPriorityLabel = () => {
    switch (priority) {
      case "critical":
        return "Critical Update";
      case "recommended":
        return "Recommended Update";
      case "optional":
        return "Optional Update";
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={shouldForceUpdate ? undefined : onRemindLater}
    >
      <View
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <View
          className="bg-background rounded-3xl w-full max-w-md"
          style={{ maxHeight: "80%" }}
        >
          {/* Header */}
          <View className="p-6 border-b border-border">
            <View className="items-center mb-4">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: `${getPriorityColor()}20` }}
              >
                <IconSymbol name="arrow.down.circle.fill" size={48} color={getPriorityColor()} />
              </View>
              <Text className="text-2xl font-bold text-foreground text-center" style={{ lineHeight: 32 }}>
                {getPriorityLabel()}
              </Text>
              <Text className="text-lg text-muted text-center mt-2" style={{ lineHeight: 24 }}>
                Version {latestVersion} is now available
              </Text>
              <Text className="text-base text-muted text-center mt-1" style={{ lineHeight: 20 }}>
                Current version: {currentVersion}
              </Text>
            </View>
          </View>

          {/* Features List */}
          <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
            <Text className="text-xl font-bold text-foreground mb-4" style={{ lineHeight: 28 }}>
              What's New
            </Text>

            {features.map((feature, index) => (
              <View key={index} className="flex-row gap-4 mb-4">
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: `${getCategoryColor(feature.category)}20` }}
                >
                  <IconSymbol
                    name={getCategoryIcon(feature.category) as any}
                    size={24}
                    color={getCategoryColor(feature.category)}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground" style={{ lineHeight: 24 }}>
                    {feature.title}
                  </Text>
                  <Text className="text-base text-muted mt-1" style={{ lineHeight: 22 }}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <View className="p-6 border-t border-border gap-3">
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onUpdate();
              }}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.98 : 1 }],
                opacity: pressed ? 0.9 : 1,
              })}
              className="bg-primary rounded-2xl py-4 items-center"
            >
              <Text className="text-xl font-bold text-white" style={{ lineHeight: 28 }}>
                {shouldForceUpdate ? "Update Required" : "Update Now"}
              </Text>
            </Pressable>

            {!shouldForceUpdate && (
              <>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onRemindLater();
                  }}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    opacity: pressed ? 0.7 : 1,
                  })}
                  className="bg-surface border-2 border-border rounded-2xl py-4 items-center"
                >
                  <Text className="text-lg font-semibold text-foreground" style={{ lineHeight: 24 }}>
                    Remind Me Later
                  </Text>
                </Pressable>

                {priority === "optional" && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onSkip();
                    }}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.5 : 0.7,
                    })}
                    className="py-3 items-center"
                  >
                    <Text className="text-base text-muted" style={{ lineHeight: 20 }}>
                      Skip This Version
                    </Text>
                  </Pressable>
                )}
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
