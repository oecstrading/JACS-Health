import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import HealthKnowledgeEngineService, {
  type HealthSearchResult,
  type HealthSearchQuery,
  type HealthImage,
} from "@/services/healthKnowledgeEngine";
import * as ImagePicker from "expo-image-picker";

export default function HealthKnowledgeScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<HealthSearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<HealthSearchQuery[]>([]);
  const [selectedResult, setSelectedResult] = useState<HealthSearchResult | null>(null);
  const [reading, setReading] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(0.9);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    const history = await HealthKnowledgeEngineService.getSearchHistory();
    setSearchHistory(history.slice(0, 5)); // Show last 5 searches
  };

  const handleSearch = async (query: string, type: "text" | "voice" | "photo" = "text") => {
    if (!query.trim() && type !== "photo") return;

    setSearching(true);
    try {
      const searchResults = await HealthKnowledgeEngineService.search(query, type);
      setResults(searchResults);
      if (searchResults.length > 0) {
        setSelectedResult(searchResults[0]);
      }
      await loadSearchHistory();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to search");
    } finally {
      setSearching(false);
    }
  };

  const handleVoiceSearch = () => {
    Alert.alert("Voice Search", "Voice search feature coming soon!");
    // In production, this would use expo-speech-recognition
  };

  const handlePhotoSearch = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        Alert.alert("Photo Search", "Analyzing image...");
        // In production, this would use OCR/image recognition
        await handleSearch("Medication identification from photo", "photo");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to capture image");
    }
  };

  const handleReadAloud = async () => {
    if (!selectedResult) return;

    if (reading) {
      await HealthKnowledgeEngineService.stopReading();
      setReading(false);
    } else {
      setReading(true);
      try {
        await HealthKnowledgeEngineService.readAloud(selectedResult.simplifiedSummary, {
          rate: readingSpeed,
        });
      } catch (error) {
        Alert.alert("Error", "Failed to read content aloud");
      } finally {
        setReading(false);
      }
    }
  };

  const handleSaveToHealthCenter = async () => {
    if (!selectedResult) return;

    try {
      await HealthKnowledgeEngineService.saveToHealthCenter(selectedResult);
      Alert.alert("Success", "Saved to your Health Center!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save");
    }
  };

  const handleTalkToResult = () => {
    if (!selectedResult) return;
    // Navigate to AI assistant with context
    router.push({
      pathname: "/assistant" as any,
      params: { context: selectedResult.title },
    });
  };

  const renderSearchBar = () => (
    <View className="gap-4">
      {/* Main Search Input */}
      <View
        className="rounded-2xl p-4 flex-row items-center gap-3"
        style={{ backgroundColor: colors.surface }}
      >
        <TextInput
          className="flex-1 text-lg text-foreground"
          placeholder="Search health topics, medications, symptoms..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => handleSearch(searchQuery)}
          returnKeyType="search"
          style={{ fontSize: 18 }}
        />
        <TouchableOpacity
          onPress={() => handleSearch(searchQuery)}
          disabled={searching}
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.primary }}
        >
          {searching ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-2xl">🔍</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Multi-Modal Search Buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={handleVoiceSearch}
          className="flex-1 rounded-full p-4 items-center"
          style={{ backgroundColor: colors.surface }}
        >
          <Text className="text-3xl mb-1">🎤</Text>
          <Text className="text-sm font-semibold text-foreground">Voice Search</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePhotoSearch}
          className="flex-1 rounded-full p-4 items-center"
          style={{ backgroundColor: colors.surface }}
        >
          <Text className="text-3xl mb-1">📷</Text>
          <Text className="text-sm font-semibold text-foreground">Photo Search</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Searches */}
      {searchHistory.length > 0 && results.length === 0 && (
        <View>
          <Text className="text-base font-semibold text-muted mb-2">Recent Searches</Text>
          <View className="flex-row flex-wrap gap-2">
            {searchHistory.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSearch(item.query, "text")}
                className="rounded-full px-4 py-2"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-sm text-foreground">{item.query}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderResult = (result: HealthSearchResult) => (
    <View className="gap-6">
      {/* Title and Category */}
      <View>
        <View
          className="self-start rounded-full px-4 py-2 mb-3"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-sm font-bold text-white uppercase">{result.category}</Text>
        </View>
        <Text className="text-3xl font-bold text-foreground mb-2">{result.title}</Text>
        <Text className="text-sm text-muted">
          Last verified: {new Date(result.lastVerified).toLocaleDateString()}
        </Text>
      </View>

      {/* Visual-First Display: Images */}
      <View>
        <Text className="text-lg font-semibold text-foreground mb-3">Visual Guide</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4">
          {result.images.map((img, index) => (
            <View key={index} className="mr-4" style={{ width: 300 }}>
              <Image
                source={{ uri: img.url }}
                style={{ width: 300, height: 200, borderRadius: 16 }}
                resizeMode="cover"
              />
              <View
                className="mt-2 p-3 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-sm font-bold text-foreground">{img.caption}</Text>
                  {img.sourceVerified && (
                    <View
                      className="rounded-full px-3 py-1"
                      style={{ backgroundColor: colors.success }}
                    >
                      <Text className="text-xs font-bold text-white">✓ Verified</Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs text-muted">Source: {img.source}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Plain English Summary */}
      <View
        className="rounded-2xl p-5"
        style={{ backgroundColor: colors.surface }}
      >
        <Text className="text-lg font-bold text-foreground mb-3">What You Need to Know</Text>
        <Text className="text-base text-foreground leading-relaxed" style={{ fontSize: 18, lineHeight: 28 }}>
          {result.simplifiedSummary}
        </Text>
      </View>

      {/* Read Aloud Controls */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={handleReadAloud}
          className="flex-1 rounded-full p-4 items-center"
          style={{ backgroundColor: reading ? colors.error : colors.primary }}
        >
          <Text className="text-lg font-bold text-white">
            {reading ? "⏸ Stop Reading" : "🔊 Read Aloud"}
          </Text>
        </TouchableOpacity>

        {!reading && (
          <TouchableOpacity
            onPress={() => setReadingSpeed(readingSpeed === 0.9 ? 0.7 : 0.9)}
            className="rounded-full px-6 py-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-base font-semibold text-foreground">
              {readingSpeed === 0.9 ? "🐢 Slower" : "🐇 Normal"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Interactive Actions */}
      <View className="gap-3">
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/find-care" as any, params: { condition: result.title } })}
          className="rounded-2xl p-5 flex-row items-center justify-between"
          style={{ backgroundColor: colors.success }}
        >
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">🏥 Find Care Near Me</Text>
            <Text className="text-sm text-white mt-1 opacity-90">
              Connect with local doctors and specialists in Fulshear/Houston
            </Text>
          </View>
          <Text className="text-2xl text-white">→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleTalkToResult}
          className="rounded-2xl p-5 flex-row items-center justify-between"
          style={{ backgroundColor: colors.primary }}
        >
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">💬 Talk to this Result</Text>
            <Text className="text-sm text-white mt-1 opacity-90">
              Ask follow-up questions about {result.title}
            </Text>
          </View>
          <Text className="text-2xl text-white">→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSaveToHealthCenter}
          className="rounded-2xl p-5 flex-row items-center justify-between"
          style={{ backgroundColor: colors.surface }}
        >
          <View className="flex-1">
            <Text className="text-lg font-bold text-foreground">💾 Save to My Health Center</Text>
            <Text className="text-sm text-muted mt-1">
              Build your personal health library
            </Text>
          </View>
          <Text className="text-2xl" style={{ color: colors.primary }}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Related Terms */}
      <View>
        <Text className="text-lg font-semibold text-foreground mb-3">Related Topics</Text>
        <View className="flex-row flex-wrap gap-2">
          {result.relatedTerms.map((term, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSearch(term, "text")}
              className="rounded-full px-4 py-3"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-base font-semibold text-foreground">{term}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sources */}
      <View>
        <Text className="text-lg font-semibold text-foreground mb-3">Trusted Sources</Text>
        <View className="gap-3">
          {result.sources.map((source, index) => (
            <View
              key={index}
              className="rounded-2xl p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base font-bold text-foreground flex-1">{source.name}</Text>
                <View
                  className="rounded-full px-3 py-1"
                  style={{
                    backgroundColor:
                      source.level === 1 ? colors.success : source.level === 2 ? colors.primary : colors.warning,
                  }}
                >
                  <Text className="text-xs font-bold text-white">Level {source.level}</Text>
                </View>
              </View>
              {source.peerReviewed && (
                <Text className="text-sm text-muted mb-1">✓ Peer-Reviewed</Text>
              )}
              {source.lastUpdated && (
                <Text className="text-sm text-muted">Updated: {source.lastUpdated}</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );

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
            <Text className="text-3xl font-bold text-foreground">Global Health Knowledge</Text>
            <Text className="text-base text-muted mt-1">
              Search trusted medical information
            </Text>
          </View>

          {/* Search Interface */}
          {renderSearchBar()}

          {/* Results */}
          {selectedResult && renderResult(selectedResult)}

          {/* Empty State */}
          {!selectedResult && !searching && (
            <View className="items-center py-12">
              <Text className="text-6xl mb-4">🔍</Text>
              <Text className="text-xl font-bold text-foreground text-center mb-2">
                Search Health Topics
              </Text>
              <Text className="text-base text-muted text-center">
                Search for medications, conditions, or symptoms{"\n"}to get trusted medical information
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
