import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import HealthKnowledgeEngineService, {
  type SavedHealthContent,
} from "@/services/healthKnowledgeEngine";

export default function MyHealthCenterScreen() {
  const colors = useColors();
  const [savedItems, setSavedItems] = useState<SavedHealthContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadSavedItems();
  }, [selectedFolder]);

  const loadSavedItems = async () => {
    setLoading(true);
    try {
      const items = await HealthKnowledgeEngineService.getSavedContent(selectedFolder);
      setSavedItems(items);
    } catch (error) {
      Alert.alert("Error", "Failed to load saved items");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const items = savedItems.filter((item) => item.id !== itemId);
              setSavedItems(items);
              Alert.alert("Success", "Item deleted");
            } catch (error) {
              Alert.alert("Error", "Failed to delete item");
            }
          },
        },
      ]
    );
  };

  const folders = ["My Conditions", "My Medications", "Symptoms", "Procedures"];

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <Text className="text-base font-semibold" style={{ color: colors.primary }}>
                ← Back
              </Text>
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">My Health Center</Text>
            <Text className="text-base text-muted mt-1">
              Your personal health library
            </Text>
          </View>

          {/* Folder Filters */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">Folders</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
              <TouchableOpacity
                onPress={() => setSelectedFolder(undefined)}
                className="rounded-full px-6 py-3"
                style={{
                  backgroundColor: !selectedFolder ? colors.primary : colors.surface,
                }}
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: !selectedFolder ? "#fff" : colors.foreground }}
                >
                  All Items
                </Text>
              </TouchableOpacity>

              {folders.map((folder) => (
                <TouchableOpacity
                  key={folder}
                  onPress={() => setSelectedFolder(folder)}
                  className="rounded-full px-6 py-3 mr-3"
                  style={{
                    backgroundColor: selectedFolder === folder ? colors.primary : colors.surface,
                  }}
                >
                  <Text
                    className="text-base font-semibold"
                    style={{ color: selectedFolder === folder ? "#fff" : colors.foreground }}
                  >
                    {folder}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Saved Items */}
          <View className="gap-4">
            {savedItems.length === 0 ? (
              <View className="items-center py-12">
                <Text className="text-6xl mb-4">📚</Text>
                <Text className="text-xl font-bold text-foreground text-center mb-2">
                  No Saved Items Yet
                </Text>
                <Text className="text-base text-muted text-center">
                  Search health topics and save them{"\n"}to build your personal library
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/health-knowledge" as any)}
                  className="rounded-full px-8 py-4 mt-6"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-lg font-bold text-white">Search Health Topics</Text>
                </TouchableOpacity>
              </View>
            ) : (
              savedItems.map((item) => (
                <View
                  key={item.id}
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: colors.surface }}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View
                        className="self-start rounded-full px-3 py-1 mb-2"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Text className="text-xs font-bold text-white uppercase">
                          {item.result.category}
                        </Text>
                      </View>
                      <Text className="text-xl font-bold text-foreground mb-1">
                        {item.result.title}
                      </Text>
                      <Text className="text-sm text-muted">
                        Saved {new Date(item.savedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteItem(item.id)}
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.error }}
                    >
                      <Text className="text-white text-lg">🗑️</Text>
                    </TouchableOpacity>
                  </View>

                  {item.notes && (
                    <View
                      className="rounded-xl p-3 mb-3"
                      style={{ backgroundColor: colors.background }}
                    >
                      <Text className="text-sm font-semibold text-foreground mb-1">
                        My Notes:
                      </Text>
                      <Text className="text-base text-foreground">{item.notes}</Text>
                    </View>
                  )}

                  <Text
                    className="text-base text-foreground mb-4"
                    numberOfLines={3}
                    style={{ lineHeight: 24 }}
                  >
                    {item.result.simplifiedSummary}
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      // Navigate back to health knowledge with this result
                      router.push("/health-knowledge" as any);
                    }}
                    className="rounded-full p-4 items-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-base font-bold text-white">View Full Details</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* Quick Actions */}
          {savedItems.length > 0 && (
            <View className="gap-3">
              <TouchableOpacity
                onPress={() => router.push("/health-knowledge" as any)}
                className="rounded-2xl p-5 flex-row items-center justify-between"
                style={{ backgroundColor: colors.primary }}
              >
                <View className="flex-1">
                  <Text className="text-lg font-bold text-white">Search More Topics</Text>
                  <Text className="text-sm text-white mt-1 opacity-90">
                    Add more to your health library
                  </Text>
                </View>
                <Text className="text-2xl text-white">→</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
