import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Linking } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { getAllArticles, getArticle, searchArticles, MedicalArticle } from "@/lib/medical-library";

/**
 * Medical Library Screen
 *
 * Browse health education articles with search functionality and links to
 * AHA/CDC/Mayo Clinic resources.
 */

export default function MedicalLibraryScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const articleId = params.id as string | undefined;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<MedicalArticle | null>(
    articleId ? getArticle(articleId) : null
  );
  
  const articles = searchQuery ? searchArticles(searchQuery) : getAllArticles();

  const handleArticlePress = (article: MedicalArticle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedArticle(article);
    setSearchQuery("");
  };

  const handleBackToList = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedArticle(null);
  };

  const handleExternalLink = async (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  // Article Detail View
  if (selectedArticle) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Back Button */}
          <TouchableOpacity onPress={handleBackToList} style={{ marginBottom: 16 }}>
            <View className="flex-row items-center">
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
              <Text className="text-base text-foreground ml-2">Back to Library</Text>
            </View>
          </TouchableOpacity>

          {/* Article Header */}
          <View className="mb-6">
            <View
              className="px-3 py-1 rounded-full self-start mb-3"
              style={{ backgroundColor: colors.primary + "20" }}
            >
              <Text className="text-sm font-medium" style={{ color: colors.primary }}>
                {selectedArticle.category}
              </Text>
            </View>
            <Text className="text-3xl font-bold text-foreground mb-3">
              {selectedArticle.title}
            </Text>
            <Text className="text-base text-muted leading-relaxed">
              {selectedArticle.summary}
            </Text>
          </View>

          {/* Article Content */}
          <View className="mb-6">
            <Text className="text-base text-foreground leading-relaxed">
              {selectedArticle.content}
            </Text>
          </View>

          {/* External Links */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-foreground mb-4">Trusted Resources</Text>
            {selectedArticle.externalLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleExternalLink(link.url)}
                className="mb-3 p-4 rounded-xl flex-row items-center justify-between"
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
              >
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">{link.name}</Text>
                  <Text className="text-sm text-muted mt-1" numberOfLines={1}>
                    {link.url}
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Related Conditions */}
          {selectedArticle.relatedConditions.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-foreground mb-3">Related Conditions</Text>
              <View className="flex-row flex-wrap gap-2">
                {selectedArticle.relatedConditions.map((condition, index) => (
                  <View
                    key={index}
                    className="px-3 py-2 rounded-full"
                    style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
                  >
                    <Text className="text-sm text-foreground">{condition}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Article List View
  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="mb-6">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={{ marginBottom: 16 }}
          >
            <IconSymbol name="chevron.left" size={28} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground mb-2">Medical Library</Text>
          <Text className="text-base text-muted">
            Evidence-based health information from trusted sources
          </Text>
        </View>

        {/* Search Bar */}
        <View
          className="mb-6 p-4 rounded-xl flex-row items-center"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <Text className="text-xl mr-3">🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search health topics..."
            placeholderTextColor={colors.muted}
            className="flex-1 text-base text-foreground"
            style={{ outlineStyle: "none" } as any}
          />
        </View>

        {/* Article Cards */}
        <View className="gap-4">
          {articles.map(article => (
            <TouchableOpacity
              key={article.id}
              onPress={() => handleArticlePress(article)}
              className="p-4 rounded-xl"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            >
              <View
                className="px-3 py-1 rounded-full self-start mb-3"
                style={{ backgroundColor: colors.primary + "20" }}
              >
                <Text className="text-xs font-medium" style={{ color: colors.primary }}>
                  {article.category}
                </Text>
              </View>
              <Text className="text-lg font-semibold text-foreground mb-2">
                {article.title}
              </Text>
              <Text className="text-sm text-muted leading-relaxed mb-3">
                {article.summary}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-sm font-medium" style={{ color: colors.primary }}>
                  Read More
                </Text>
                <IconSymbol
                  name="chevron.right"
                  size={16}
                  color={colors.primary}
                  style={{ marginLeft: 4 }}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* No Results */}
        {searchQuery && articles.length === 0 && (
          <View className="items-center justify-center py-12">
            <Text className="text-5xl mb-4">🔍</Text>
            <Text className="text-lg font-semibold text-foreground mb-2">No results found</Text>
            <Text className="text-base text-muted text-center">
              Try searching for different health topics
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
