import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from "react-native";

interface LabResult {
  test_name: string;
  result: string;
  unit: string;
  test_date: string;
  reference_range: string;
  status: "Normal" | "High" | "Low";
  category: string;
}

interface LabTestTrendModalProps {
  visible: boolean;
  onClose: () => void;
  testName: string;
  allResults: LabResult[];
}

export function LabTestTrendModal({
  visible,
  onClose,
  testName,
  allResults,
}: LabTestTrendModalProps) {
  // Filter results for the selected test
  const testResults = allResults
    .filter((r) => r.test_name === testName)
    .sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime());

  if (testResults.length === 0) {
    return null;
  }

  // Calculate statistics
  const values = testResults.map((r) => parseFloat(r.result));
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
  const latestValue = values[values.length - 1];
  const firstValue = values[0];
  const percentChange = ((latestValue - firstValue) / firstValue) * 100;

  // Determine trend
  let trend = "Stable";
  let trendColor = "#F59E0B"; // yellow
  if (Math.abs(percentChange) < 5) {
    trend = "Stable";
    trendColor = "#10B981"; // green
  } else if (percentChange > 0) {
    trend = testResults[testResults.length - 1].status === "High" ? "Worsening" : "Improving";
    trendColor = testResults[testResults.length - 1].status === "High" ? "#EF4444" : "#10B981";
  } else {
    trend = testResults[testResults.length - 1].status === "Low" ? "Worsening" : "Improving";
    trendColor = testResults[testResults.length - 1].status === "Low" ? "#EF4444" : "#10B981";
  }

  // Parse reference range
  const refRange = testResults[0].reference_range;
  let refMin: number | null = null;
  let refMax: number | null = null;
  
  if (refRange.includes("-")) {
    const parts = refRange.split("-");
    refMin = parseFloat(parts[0]);
    refMax = parseFloat(parts[1]);
  } else if (refRange.startsWith(">")) {
    refMin = parseFloat(refRange.substring(1));
  } else if (refRange.startsWith("<")) {
    refMax = parseFloat(refRange.substring(1));
  }

  // Calculate chart dimensions
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 80;
  const chartHeight = 200;
  const chartMin = refMin !== null ? Math.min(minValue, refMin) * 0.9 : minValue * 0.9;
  const chartMax = refMax !== null ? Math.max(maxValue, refMax) * 1.1 : maxValue * 1.1;
  const chartRange = chartMax - chartMin;

  // Convert value to Y coordinate
  const valueToY = (value: number) => {
    return chartHeight - ((value - chartMin) / chartRange) * chartHeight;
  };

  // Generate SVG path for line chart
  const generatePath = () => {
    const points = testResults.map((r, i) => {
      const x = (i / (testResults.length - 1)) * chartWidth;
      const y = valueToY(parseFloat(r.result));
      return `${i === 0 ? "M" : "L"} ${x},${y}`;
    });
    return points.join(" ");
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90%]">
          <ScrollView>
            {/* Header */}
            <View className="p-6 border-b border-gray-200 dark:border-gray-700">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {testName}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {testResults[0].category} • {testResults.length} tests over{" "}
                    {Math.round(
                      (new Date(testResults[testResults.length - 1].test_date).getTime() -
                        new Date(testResults[0].test_date).getTime()) /
                        (1000 * 60 * 60 * 24 * 365)
                    )}{" "}
                    years
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="ml-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
                >
                  <Text className="text-gray-600 dark:text-gray-300 text-lg font-bold">×</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Statistics */}
            <View className="p-6 border-b border-gray-200 dark:border-gray-700">
              <View className="flex-row flex-wrap -mx-2">
                <View className="w-1/2 px-2 mb-4">
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">Latest Value</Text>
                  <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                    {latestValue.toFixed(1)} {testResults[0].unit}
                  </Text>
                </View>
                <View className="w-1/2 px-2 mb-4">
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trend</Text>
                  <Text className="text-2xl font-bold" style={{ color: trendColor }}>
                    {trend}
                  </Text>
                </View>
                <View className="w-1/3 px-2">
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">Min</Text>
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                    {minValue.toFixed(1)}
                  </Text>
                </View>
                <View className="w-1/3 px-2">
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">Average</Text>
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                    {avgValue.toFixed(1)}
                  </Text>
                </View>
                <View className="w-1/3 px-2">
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">Max</Text>
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                    {maxValue.toFixed(1)}
                  </Text>
                </View>
              </View>
              <View className="mt-4 px-2">
                <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">Change</Text>
                <Text
                  className="text-lg font-semibold"
                  style={{ color: percentChange > 0 ? "#EF4444" : "#10B981" }}
                >
                  {percentChange > 0 ? "+" : ""}
                  {percentChange.toFixed(1)}% from first test
                </Text>
              </View>
            </View>

            {/* Chart Placeholder */}
            <View className="p-6 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Trend Over Time
              </Text>
              <View className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4" style={{ height: chartHeight + 40 }}>
                <Text className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Chart visualization showing {testResults.length} data points
                </Text>
                <Text className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
                  Reference Range: {refRange} {testResults[0].unit}
                </Text>
              </View>
            </View>

            {/* Data Table */}
            <View className="p-6">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Historical Values
              </Text>
              {testResults.reverse().map((result, index) => {
                const statusColor =
                  result.status === "Normal"
                    ? "#10B981"
                    : result.status === "High"
                    ? "#EF4444"
                    : "#F59E0B";
                return (
                  <View
                    key={index}
                    className="flex-row justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700"
                  >
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 dark:text-white">
                        {parseFloat(result.result).toFixed(1)} {result.unit}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(result.test_date).toLocaleDateString()}
                      </Text>
                    </View>
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: statusColor + "20" }}
                    >
                      <Text className="text-xs font-semibold" style={{ color: statusColor }}>
                        {result.status}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
