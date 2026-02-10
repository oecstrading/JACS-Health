import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import {
  analyzeHealthData,
  getSeverityColor,
  getSeverityIcon,
  type HealthInsight,
} from "@/lib/health-insights-ai";

export default function HealthInsightsScreen() {
  const colors = useColors();
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealthInsights();
  }, []);

  const loadHealthInsights = async () => {
    setLoading(true);
    try {
      // Load vitals data from storage
      const [bpJson, hrJson, weightJson] = await Promise.all([
        AsyncStorage.getItem("vitals_blood_pressure"),
        AsyncStorage.getItem("vitals_heart_rate"),
        AsyncStorage.getItem("vitals_weight"),
      ]);

      const bloodPressure = bpJson ? JSON.parse(bpJson) : [];
      const heartRate = hrJson ? JSON.parse(hrJson) : [];
      const weight = weightJson ? JSON.parse(weightJson) : [];

      // Filter to last 30 days
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const recentBP = bloodPressure.filter(
        (r: any) => new Date(r.timestamp) >= thirtyDaysAgo
      );
      const recentHR = heartRate.filter(
        (r: any) => new Date(r.timestamp) >= thirtyDaysAgo
      );
      const recentWeight = weight.filter(
        (r: any) => new Date(r.timestamp) >= thirtyDaysAgo
      );

      // Analyze data and generate insights
      const generatedInsights = analyzeHealthData({
        bloodPressure: recentBP,
        heartRate: recentHR,
        weight: recentWeight,
      });

      setInsights(generatedInsights);
    } catch (error) {
      console.error("Error loading health insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLearnMore = (url?: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-2">
            <Text className="text-lg" style={{ color: colors.primary }}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground">
            Health Insights
          </Text>
          <Text className="text-base text-muted mt-1">
            AI-powered analysis of your health trends
          </Text>
        </View>

        {loading ? (
          <View className="items-center justify-center py-20">
            <Text className="text-lg text-muted">Analyzing your health data...</Text>
          </View>
        ) : insights.length === 0 ? (
          <View
            className="p-8 rounded-2xl items-center"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-2xl mb-4">📊</Text>
            <Text className="text-xl font-semibold text-foreground text-center mb-2">
              Not Enough Data Yet
            </Text>
            <Text className="text-base text-muted text-center">
              Sync your Bluetooth devices (Omron 3550, Samsung Watch 7, iHome Scale) to
              get personalized health insights and recommendations.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/bluetooth-devices")}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
                marginTop: 16,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
                Connect Devices
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Summary */}
            <View
              className="p-4 rounded-2xl mb-6"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-lg font-semibold text-foreground mb-2">
                Summary
              </Text>
              <Text className="text-base text-muted">
                Based on your last 30 days of data, we've identified{" "}
                <Text className="font-semibold text-foreground">
                  {insights.length} insight{insights.length !== 1 ? "s" : ""}
                </Text>
                {" "}to help you optimize your health.
              </Text>
            </View>

            {/* Insights List */}
            {insights.map((insight) => (
              <View
                key={insight.id}
                className="p-5 rounded-2xl mb-4"
                style={{
                  backgroundColor: colors.surface,
                  borderLeftWidth: 4,
                  borderLeftColor: getSeverityColor(insight.severity),
                }}
              >
                {/* Header */}
                <View className="flex-row items-start mb-3">
                  <Text className="text-3xl mr-3">
                    {getSeverityIcon(insight.severity)}
                  </Text>
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <View
                        style={{
                          backgroundColor: getSeverityColor(insight.severity),
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 4,
                          marginRight: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 12,
                            fontWeight: "600",
                            textTransform: "uppercase",
                          }}
                        >
                          {insight.severity}
                        </Text>
                      </View>
                      <Text className="text-xs text-muted">
                        {getCategoryLabel(insight.category)}
                      </Text>
                    </View>
                    <Text className="text-xl font-bold text-foreground">
                      {insight.title}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text className="text-base text-foreground mb-3 leading-relaxed">
                  {insight.description}
                </Text>

                {/* Recommendation */}
                <View
                  className="p-3 rounded-xl mb-3"
                  style={{ backgroundColor: colors.background }}
                >
                  <Text className="text-sm font-semibold text-foreground mb-1">
                    💡 Recommendation
                  </Text>
                  <Text className="text-base text-muted leading-relaxed">
                    {insight.recommendation}
                  </Text>
                </View>

                {/* Learn More Button */}
                {insight.learnMoreUrl && (
                  <TouchableOpacity
                    onPress={() => handleLearnMore(insight.learnMoreUrl)}
                    style={{
                      backgroundColor: colors.primary,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 8,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "600" }}>
                      Learn More →
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* Refresh Button */}
            <TouchableOpacity
              onPress={loadHealthInsights}
              style={{
                backgroundColor: colors.surface,
                paddingHorizontal: 24,
                paddingVertical: 16,
                borderRadius: 12,
                marginBottom: 24,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 16 }}>
                🔄 Refresh Insights
              </Text>
            </TouchableOpacity>

            {/* Disclaimer */}
            <View
              className="p-4 rounded-2xl mb-6"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-sm text-muted text-center leading-relaxed">
                <Text className="font-semibold">Disclaimer:</Text> These insights are
                generated by AI and are for informational purposes only. They do not
                constitute medical advice. Always consult your healthcare provider for
                medical decisions.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function getCategoryLabel(
  category: "blood_pressure" | "heart_rate" | "weight" | "activity"
): string {
  switch (category) {
    case "blood_pressure":
      return "Blood Pressure";
    case "heart_rate":
      return "Heart Rate";
    case "weight":
      return "Weight";
    case "activity":
      return "Activity";
  }
}
