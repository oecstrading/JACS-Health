import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";

interface MedicalReport {
  id: string;
  title: string;
  type: string;
  date: string;
  filePath: string;
  summary: string;
}

const AVAILABLE_REPORTS: MedicalReport[] = [
  {
    id: "comprehensive",
    title: "Comprehensive Medical Analysis (5-Year Longitudinal Study)",
    type: "Comprehensive Medical Report",
    date: "2026-02-18",
    filePath: "/medical-data/Janice_John_UPDATED_Comprehensive_Medical_Report_2026.md",
    summary: "Complete 60+ page physician-ready medical analysis with detailed findings by body system, clinical interpretations, treatment recommendations, and follow-up schedules.",
  },
  {
    id: "quick-summary",
    title: "Quick Medical Records Summary (5-Year Perspective)",
    type: "Quick Summary",
    date: "2026-02-18",
    filePath: "/medical-data/Janice_John_UPDATED_Quick_Summary_5Year.md",
    summary: "5-page executive summary with key findings, critical conditions, and immediate action items for physician consultation.",
  },
];

export default function ReportsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [reportContent, setReportContent] = useState("");
  const [loading, setLoading] = useState(false);

  const loadReport = async (report: MedicalReport) => {
    setLoading(true);
    setSelectedReport(report);
    
    try {
      const response = await fetch(report.filePath);
      const content = await response.text();
      setReportContent(content);
    } catch (error) {
      console.error("Error loading report:", error);
      setReportContent("Error loading report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Simple markdown to styled text converter
  const renderMarkdown = (markdown: string) => {
    const lines = markdown.split("\n");
    const elements: React.ReactElement[] = [];

    lines.forEach((line, index) => {
      // Headers
      if (line.startsWith("# ")) {
        elements.push(
          <Text key={index} className="text-3xl font-bold text-foreground mt-6 mb-3">
            {line.replace("# ", "")}
          </Text>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <Text key={index} className="text-2xl font-bold text-foreground mt-5 mb-2">
            {line.replace("## ", "")}
          </Text>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <Text key={index} className="text-xl font-semibold text-foreground mt-4 mb-2">
            {line.replace("### ", "")}
          </Text>
        );
      }
      // Bold text
      else if (line.includes("**")) {
        const parts = line.split("**");
        elements.push(
          <Text key={index} className="text-base text-foreground mb-2">
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <Text key={i} className="font-bold">
                  {part}
                </Text>
              ) : (
                part
              )
            )}
          </Text>
        );
      }
      // Bullet points
      else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        elements.push(
          <Text key={index} className="text-base text-foreground mb-1 ml-4">
            • {line.trim().substring(2)}
          </Text>
        );
      }
      // Numbered lists
      else if (/^\d+\./.test(line.trim())) {
        elements.push(
          <Text key={index} className="text-base text-foreground mb-1 ml-4">
            {line.trim()}
          </Text>
        );
      }
      // Horizontal rule
      else if (line.trim() === "---" || line.trim() === "***") {
        elements.push(
          <View key={index} className="border-b border-border my-4" />
        );
      }
      // Regular paragraph
      else if (line.trim()) {
        elements.push(
          <Text key={index} className="text-base text-foreground mb-2 leading-relaxed">
            {line}
          </Text>
        );
      }
      // Empty line
      else {
        elements.push(<View key={index} className="h-2" />);
      }
    });

    return elements;
  };

  return (
    <ScreenContainer className="bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="p-6 bg-primary">
          <Link href={`/medical-records/${id}`} asChild>
            <Pressable className="mb-4">
              <Text className="text-white text-base">← Back to Dashboard</Text>
            </Pressable>
          </Link>
          
          <Text className="text-3xl font-bold text-white mb-2">
            Medical Reports
          </Text>
          <Text className="text-base text-white/90">
            Comprehensive analysis and summaries
          </Text>
        </View>

        {!selectedReport ? (
          // Report List View
          <ScrollView className="flex-1 p-4">
            <Text className="text-xl font-bold text-foreground mb-4">
              Available Reports ({AVAILABLE_REPORTS.length})
            </Text>

            {AVAILABLE_REPORTS.map((report) => (
              <Pressable
                key={report.id}
                onPress={() => loadReport(report)}
                className="bg-white border border-border rounded-xl p-6 mb-4"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View
                    className="px-3 py-1 rounded-full bg-primary/10"
                  >
                    <Text className="text-xs font-semibold text-primary">
                      {report.type}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted">
                    {new Date(report.date).toLocaleDateString()}
                  </Text>
                </View>

                <Text className="text-lg font-bold text-foreground mb-2">
                  {report.title}
                </Text>

                <Text className="text-sm text-muted mb-4 leading-relaxed">
                  {report.summary}
                </Text>

                <View className="flex-row justify-between items-center pt-4 border-t border-border">
                  <Text className="text-primary font-semibold">
                    View Report →
                  </Text>
                  <View className="flex-row">
                    <Pressable className="ml-3">
                      <Text className="text-sm text-muted">📤 Share</Text>
                    </Pressable>
                    <Pressable className="ml-3">
                      <Text className="text-sm text-muted">📥 Download</Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}

            {/* Info Card */}
            <View className="bg-surface/50 rounded-xl p-6 mt-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                📄 About Medical Reports
              </Text>
              <Text className="text-xs text-muted mb-2">
                • Reports are generated from your complete medical history
              </Text>
              <Text className="text-xs text-muted mb-2">
                • All findings are based on clinical practice guidelines
              </Text>
              <Text className="text-xs text-muted mb-2">
                • Share reports with your physician for informed consultations
              </Text>
              <Text className="text-xs text-muted">
                • Reports are automatically updated when new data is added
              </Text>
            </View>
          </ScrollView>
        ) : (
          // Report Content View
          <View className="flex-1">
            {/* Report Header */}
            <View className="p-4 bg-surface/50 border-b border-border">
              <Pressable
                onPress={() => setSelectedReport(null)}
                className="mb-3"
              >
                <Text className="text-primary font-semibold">← Back to Reports</Text>
              </Pressable>
              
              <Text className="text-lg font-bold text-foreground mb-1">
                {selectedReport.title}
              </Text>
              <Text className="text-xs text-muted">
                Generated: {new Date(selectedReport.date).toLocaleDateString()}
              </Text>
            </View>

            {/* Report Actions */}
            <View className="flex-row p-4 bg-white border-b border-border">
              <Pressable
                className="flex-1 bg-primary py-3 rounded-lg mr-2"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text className="text-white font-semibold text-center">
                  📤 Share with Doctor
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-white border border-border py-3 rounded-lg ml-2"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text className="text-foreground font-semibold text-center">
                  📥 Download PDF
                </Text>
              </Pressable>
            </View>

            {/* Report Content */}
            <ScrollView className="flex-1 p-6 bg-white">
              {loading ? (
                <View className="py-12 items-center">
                  <Text className="text-muted">Loading report...</Text>
                </View>
              ) : (
                <View>{renderMarkdown(reportContent)}</View>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
