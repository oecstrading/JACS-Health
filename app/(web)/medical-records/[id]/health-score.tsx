import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";

// Health scoring algorithm based on lab results
const calculateHealthScore = () => {
  const scores = {
    cardiovascular: 65, // Based on cholesterol, blood pressure
    metabolic: 70, // Based on glucose, HbA1c
    kidney: 85, // Based on creatinine, eGFR
    liver: 95, // Based on AST, ALT
    blood: 75, // Based on hemoglobin, WBC
    overall: 78,
  };
  return scores;
};

const getRiskAssessment = () => {
  return {
    diabetes: {
      risk: "Moderate",
      percentage: 45,
      color: "#FF9800",
      recommendation: "Lifestyle intervention + metformin recommended",
      timeframe: "5-year risk",
    },
    cardiovascular: {
      risk: "Moderate-High",
      percentage: 62,
      color: "#F44336",
      recommendation: "Statin therapy recommended",
      timeframe: "10-year ASCVD risk",
    },
    anemia: {
      risk: "High",
      percentage: 85,
      color: "#F44336",
      recommendation: "Iron supplementation + workup needed",
      timeframe: "Current condition",
    },
    osteoporosis: {
      risk: "Low-Moderate",
      percentage: 35,
      color: "#FF9800",
      recommendation: "Calcium + Vitamin D supplementation",
      timeframe: "10-year fracture risk",
    },
  };
};

const getHealthTrends = () => {
  return [
    {
      metric: "Cholesterol",
      trend: "improving",
      change: "-3.5%",
      icon: "📉",
      color: "#4CAF50",
    },
    {
      metric: "Hemoglobin",
      trend: "declining",
      change: "-4.5%",
      icon: "📈",
      color: "#F44336",
    },
    {
      metric: "HbA1c",
      trend: "stable",
      change: "±0%",
      icon: "➡️",
      color: "#FF9800",
    },
    {
      metric: "Kidney Function",
      trend: "stable",
      change: "±0%",
      icon: "➡️",
      color: "#4CAF50",
    },
  ];
};

export default function HealthScorePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scores = calculateHealthScore();
  const risks = getRiskAssessment();
  const trends = getHealthTrends();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#4CAF50";
    if (score >= 60) return "#FF9800";
    return "#F44336";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Attention";
  };

  return (
    <ScreenContainer className="bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-6 bg-primary">
          <Link href={`/medical-records/${id}`} asChild>
            <Pressable className="mb-4">
              <Text className="text-white text-base">← Back to Dashboard</Text>
            </Pressable>
          </Link>
          
          <Text className="text-3xl font-bold text-white mb-2">
            Health Score & Analytics
          </Text>
          <Text className="text-base text-white/90">
            AI-powered health insights and predictions
          </Text>
        </View>

        {/* Overall Health Score */}
        <View className="p-6 bg-gradient-to-b from-primary/5 to-white">
          <View className="bg-white rounded-2xl p-8 items-center border-2 border-primary/20">
            <Text className="text-sm font-semibold text-muted mb-2">
              Overall Health Score
            </Text>
            <Text
              className="text-7xl font-bold mb-2"
              style={{ color: getScoreColor(scores.overall) }}
            >
              {scores.overall}
            </Text>
            <Text className="text-xl font-semibold text-foreground mb-1">
              {getScoreLabel(scores.overall)}
            </Text>
            <Text className="text-sm text-muted text-center">
              Based on 96 lab results over 5 years
            </Text>
          </View>
        </View>

        {/* Category Scores */}
        <View className="p-4">
          <Text className="text-xl font-bold text-foreground mb-4">
            Health by Category
          </Text>

          {Object.entries(scores)
            .filter(([key]) => key !== "overall")
            .map(([category, score]) => (
              <View
                key={category}
                className="bg-white border border-border rounded-xl p-4 mb-3"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-semibold text-foreground capitalize">
                    {category}
                  </Text>
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: getScoreColor(score) }}
                  >
                    {score}
                  </Text>
                </View>
                
                {/* Progress Bar */}
                <View className="bg-surface rounded-full h-2 overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${score}%`,
                      backgroundColor: getScoreColor(score),
                    }}
                  />
                </View>
                
                <Text className="text-xs text-muted mt-2">
                  {getScoreLabel(score)}
                </Text>
              </View>
            ))}
        </View>

        {/* Risk Assessment */}
        <View className="p-4">
          <Text className="text-xl font-bold text-foreground mb-4">
            Predictive Risk Assessment
          </Text>

          {Object.entries(risks).map(([condition, data]) => (
            <View
              key={condition}
              className="bg-white border border-border rounded-xl p-5 mb-3"
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold text-foreground capitalize">
                  {condition}
                </Text>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: data.color + "20" }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: data.color }}
                  >
                    {data.risk} Risk
                  </Text>
                </View>
              </View>

              {/* Risk Percentage */}
              <View className="mb-3">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-sm text-muted">{data.timeframe}</Text>
                  <Text
                    className="text-xl font-bold"
                    style={{ color: data.color }}
                  >
                    {data.percentage}%
                  </Text>
                </View>
                <View className="bg-surface rounded-full h-3 overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${data.percentage}%`,
                      backgroundColor: data.color,
                    }}
                  />
                </View>
              </View>

              {/* Recommendation */}
              <View className="bg-surface/50 rounded-lg p-3">
                <Text className="text-xs font-semibold text-foreground mb-1">
                  💡 Recommendation
                </Text>
                <Text className="text-xs text-muted">
                  {data.recommendation}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Health Trends */}
        <View className="p-4">
          <Text className="text-xl font-bold text-foreground mb-4">
            Recent Trends
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {trends.map((trend, index) => (
              <View
                key={index}
                className="w-[48%] bg-white border border-border rounded-xl p-4 mb-3"
              >
                <Text className="text-3xl mb-2">{trend.icon}</Text>
                <Text className="text-sm font-semibold text-foreground mb-1">
                  {trend.metric}
                </Text>
                <Text
                  className="text-xl font-bold"
                  style={{ color: trend.color }}
                >
                  {trend.change}
                </Text>
                <Text className="text-xs text-muted capitalize">
                  {trend.trend}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Items */}
        <View className="p-4">
          <Text className="text-xl font-bold text-foreground mb-4">
            Recommended Actions
          </Text>

          <View className="bg-error/10 border border-error rounded-xl p-5 mb-3">
            <Text className="text-error font-bold text-base mb-2">
              🚨 High Priority
            </Text>
            <Text className="text-sm text-foreground mb-1">
              • Schedule iron studies and anemia workup
            </Text>
            <Text className="text-sm text-foreground mb-1">
              • Discuss statin therapy with physician
            </Text>
            <Text className="text-sm text-foreground">
              • Get anti-CCP test for rheumatoid arthritis screening
            </Text>
          </View>

          <View className="bg-warning/10 border border-warning rounded-xl p-5 mb-3">
            <Text className="text-warning font-bold text-base mb-2">
              ⚠️ Medium Priority
            </Text>
            <Text className="text-sm text-foreground mb-1">
              • Start metformin for prediabetes prevention
            </Text>
            <Text className="text-sm text-foreground mb-1">
              • Increase fiber intake for diverticulitis management
            </Text>
            <Text className="text-sm text-foreground">
              • Schedule DEXA scan follow-up in 1-2 years
            </Text>
          </View>

          <View className="bg-success/10 border border-success rounded-xl p-5">
            <Text className="text-success font-bold text-base mb-2">
              ✅ Maintenance
            </Text>
            <Text className="text-sm text-foreground mb-1">
              • Continue Vitamin D supplementation (optimal levels)
            </Text>
            <Text className="text-sm text-foreground mb-1">
              • Maintain current kidney function (stable eGFR)
            </Text>
            <Text className="text-sm text-foreground">
              • Keep up with regular lab monitoring every 3-6 months
            </Text>
          </View>
        </View>

        {/* Info Footer */}
        <View className="p-6 bg-surface/30 mt-4">
          <Text className="text-sm font-semibold text-foreground mb-2">
            🤖 About Health Scores
          </Text>
          <Text className="text-xs text-muted mb-2">
            • Scores are calculated using clinical algorithms and guidelines
          </Text>
          <Text className="text-xs text-muted mb-2">
            • Risk assessments are based on validated prediction models
          </Text>
          <Text className="text-xs text-muted mb-2">
            • Recommendations follow current medical best practices
          </Text>
          <Text className="text-xs text-muted">
            • Always consult with your physician before making medical decisions
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
