import { ScrollView, Text, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { BackButton } from "@/components/back-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { trpc } from "@/lib/trpc";
import { ReportShareButton } from "@/components/report-share-button";

/**
 * Imaging Analysis Screen
 * Upload medical images and get AI-powered radiological analysis
 */
export default function ImagingAnalysisScreen() {
  const colors = useColors();
  const [analyzing, setAnalyzing] = useState(false);

  // Fetch imaging analyses from database
  const { data: analyses = [], isLoading, refetch } = trpc.imagingAnalysis.list.useQuery();
  const createAndAnalyze = trpc.imagingAnalysis.createAndAnalyze.useMutation();

  const handleUploadAndAnalyze = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (result.canceled) return;

      setAnalyzing(true);

      const imagePaths = result.assets.map((asset) => asset.uri);

      // TODO: Upload images to S3 first, then use S3 URLs
      // For now, use local file paths
      await createAndAnalyze.mutateAsync({
        imagingType: "other",
        bodyPart: "Unknown",
        imagePaths,
      });

      Alert.alert("Success", "Images analyzed successfully");
      refetch();
      setAnalyzing(false);
    } catch (error) {
      Alert.alert("Error", "Failed to analyze images");
      setAnalyzing(false);
    }
  };

  const criticalCount = analyses.filter((a: any) => 
    a.report && a.report.toLowerCase().includes("critical")
  ).length;

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b" style={{ borderBottomColor: colors.border }}>
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text className="text-2xl font-bold text-foreground">Imaging Analysis</Text>
        </View>
        <TouchableOpacity
          onPress={handleUploadAndAnalyze}
          disabled={analyzing}
          className="bg-primary px-4 py-2 rounded-lg"
          style={{ opacity: analyzing ? 0.5 : 1 }}
        >
          <Text className="text-white font-semibold">
            {analyzing ? "Analyzing..." : "Upload & Analyze"}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="p-4 gap-4">
            {/* Stats Cards */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface p-4 rounded-xl border" style={{ borderColor: colors.border }}>
                <Text className="text-2xl font-bold text-foreground">{analyses.length}</Text>
                <Text className="text-sm text-muted mt-1">Total Analyses</Text>
              </View>
              <View className="flex-1 bg-surface p-4 rounded-xl border" style={{ borderColor: colors.border }}>
                <Text className="text-2xl font-bold text-foreground">{criticalCount}</Text>
                <Text className="text-sm text-muted mt-1">Critical Findings</Text>
              </View>
            </View>

            {/* How It Works */}
            <View className="bg-surface p-4 rounded-xl border" style={{ borderColor: colors.border }}>
              <Text className="text-lg font-semibold text-foreground mb-3">How It Works</Text>
              <View className="gap-3">
                {[
                  { step: "1", text: "Upload your medical images (X-ray, CT, MRI, etc.)" },
                  { step: "2", text: "AI analyzes images using advanced radiology models" },
                  { step: "3", text: "Receive detailed report with findings & recommendations" },
                  { step: "4", text: "Share report with your doctor for professional review" },
                ].map((item) => (
                  <View key={item.step} className="flex-row gap-3">
                    <View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
                      <Text className="text-white font-bold">{item.step}</Text>
                    </View>
                    <Text className="flex-1 text-sm text-foreground">{item.text}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Recent Analyses */}
            {analyses.length > 0 && (
              <View className="gap-3">
                <Text className="text-lg font-semibold text-foreground">Recent Analyses</Text>
                {analyses.slice(0, 5).map((analysis: any) => (
                  <View
                    key={analysis.id}
                    className="bg-surface p-4 rounded-xl border"
                    style={{ borderColor: colors.border }}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-base font-semibold text-foreground">
                        {analysis.imagingType.replace("_", " ").toUpperCase()} - {analysis.bodyPart}
                      </Text>
                      <View
                        className="px-2 py-1 rounded"
                        style={{
                          backgroundColor:
                            analysis.status === "analyzed"
                              ? `${colors.success}20`
                              : `${colors.warning}20`,
                        }}
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{
                            color:
                              analysis.status === "analyzed"
                                ? colors.success
                                : colors.warning,
                          }}
                        >
                          {analysis.status.replace("_", " ").toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm text-muted">
                      {new Date(analysis.createdAt).toLocaleDateString()} • {analysis.imagePaths?.length || 0} images
                    </Text>
                    {analysis.report && (
                      <>
                        <Text className="text-sm text-foreground mt-2" numberOfLines={2}>
                          {analysis.report}
                        </Text>
                        <View className="flex-row gap-2 mt-3">
                          <ReportShareButton
                            report={analysis.report}
                            title={`${analysis.imagingType} - ${analysis.bodyPart}`}
                            type="email"
                          />
                        </View>
                      </>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Disclaimer */}
            <View className="bg-warning/10 p-4 rounded-xl border" style={{ borderColor: colors.warning }}>
              <Text className="text-sm font-semibold text-warning mb-2">⚠️ Important Disclaimer</Text>
              <Text className="text-xs text-foreground">
                This AI analysis is for informational purposes only and should not replace professional medical advice. 
                Always consult with a qualified healthcare provider for diagnosis and treatment decisions.
              </Text>
            </View>

            {analyzing && (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color={colors.primary} />
                <Text className="text-base text-muted mt-4">Analyzing images...</Text>
                <Text className="text-sm text-muted mt-2">This may take a few moments</Text>
              </View>
            )}

            {/* Empty State */}
            {!analyzing && analyses.length === 0 && (
              <View className="items-center justify-center py-12">
                <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-4">
                  <IconSymbol name="paperplane.fill" size={32} color={colors.muted} />
                </View>
                <Text className="text-lg font-semibold text-foreground mb-2">
                  No Analyses Yet
                </Text>
                <Text className="text-sm text-muted text-center px-8">
                  Upload medical images to get AI-powered radiological analysis with detailed findings and recommendations
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
