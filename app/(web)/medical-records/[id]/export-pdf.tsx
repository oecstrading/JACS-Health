import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";

export default function ExportPDFPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState<"full" | "summary">("full");

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would call the API endpoint
      // const response = await fetch('/api/medical-records/export-pdf', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ patientId: id, reportType })
      // });
      
      // For now, trigger download of the markdown report
      alert(`PDF Report Generated!\n\nIn production, this would download a professional PDF report.\n\nReport Type: ${reportType}\nPatient: ${id}`);
      
    } catch (error) {
      alert("Error generating PDF: " + error);
    } finally {
      setIsGenerating(false);
    }
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
            📄 Export Medical Report
          </Text>
          <Text className="text-base text-white/90">
            Generate a professional PDF report for doctor visits
          </Text>
        </View>

        {/* Report Type Selection */}
        <View className="p-6">
          <Text className="text-xl font-bold text-foreground mb-4">
            Select Report Type
          </Text>

          <Pressable
            onPress={() => setReportType("full")}
            className={`border-2 rounded-xl p-5 mb-4 ${
              reportType === "full"
                ? "bg-primary/10 border-primary"
                : "bg-white border-border"
            }`}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-bold text-foreground">
                📊 Full Comprehensive Report
              </Text>
              {reportType === "full" && (
                <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                  <Text className="text-white text-xs">✓</Text>
                </View>
              )}
            </View>
            <Text className="text-sm text-muted mb-3">
              Complete medical analysis with all details
            </Text>
            <View className="bg-surface/50 rounded-lg p-3">
              <Text className="text-xs font-semibold text-foreground mb-2">
                Includes:
              </Text>
              <Text className="text-xs text-muted">• Patient summary & demographics</Text>
              <Text className="text-xs text-muted">• Complete lab results (96 tests)</Text>
              <Text className="text-xs text-muted">• All 13 trend charts</Text>
              <Text className="text-xs text-muted">• Comprehensive medical analysis (60+ pages)</Text>
              <Text className="text-xs text-muted">• Current medications & dosing schedules</Text>
              <Text className="text-xs text-muted">• Test reminders & upcoming appointments</Text>
              <Text className="text-xs text-muted">• Family health comparison</Text>
              <Text className="text-xs text-muted">• Predictive risk analytics</Text>
              <Text className="text-xs text-muted">• Treatment recommendations</Text>
            </View>
            <Text className="text-xs text-muted mt-2">
              📄 Estimated pages: 70-80 pages
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setReportType("summary")}
            className={`border-2 rounded-xl p-5 ${
              reportType === "summary"
                ? "bg-primary/10 border-primary"
                : "bg-white border-border"
            }`}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-bold text-foreground">
                📋 Quick Summary Report
              </Text>
              {reportType === "summary" && (
                <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                  <Text className="text-white text-xs">✓</Text>
                </View>
              )}
            </View>
            <Text className="text-sm text-muted mb-3">
              Essential findings for quick physician review
            </Text>
            <View className="bg-surface/50 rounded-lg p-3">
              <Text className="text-xs font-semibold text-foreground mb-2">
                Includes:
              </Text>
              <Text className="text-xs text-muted">• Patient summary & critical findings</Text>
              <Text className="text-xs text-muted">• Abnormal lab results only</Text>
              <Text className="text-xs text-muted">• Key trend charts (5 most important)</Text>
              <Text className="text-xs text-muted">• Executive summary (5 pages)</Text>
              <Text className="text-xs text-muted">• Active medications</Text>
              <Text className="text-xs text-muted">• Overdue test reminders</Text>
              <Text className="text-xs text-muted">• Top 3 health concerns</Text>
            </View>
            <Text className="text-xs text-muted mt-2">
              📄 Estimated pages: 8-12 pages
            </Text>
          </Pressable>
        </View>

        {/* Report Preview */}
        <View className="p-6 bg-surface/30">
          <Text className="text-xl font-bold text-foreground mb-4">
            Report Preview
          </Text>

          <View className="bg-white border border-border rounded-xl p-5">
            <Text className="text-sm font-semibold text-foreground mb-3">
              📄 {reportType === "full" ? "Full Comprehensive Report" : "Quick Summary Report"}
            </Text>
            
            <View className="border-t border-border pt-3 mt-3">
              <Text className="text-xs font-semibold text-foreground mb-2">
                Patient Information
              </Text>
              <Text className="text-xs text-muted">Name: Janice John</Text>
              <Text className="text-xs text-muted">Age: 68 years</Text>
              <Text className="text-xs text-muted">Medical Record #: MRN-2021-001</Text>
              <Text className="text-xs text-muted">Report Date: {new Date().toLocaleDateString()}</Text>
            </View>

            <View className="border-t border-border pt-3 mt-3">
              <Text className="text-xs font-semibold text-foreground mb-2">
                Data Period
              </Text>
              <Text className="text-xs text-muted">September 2021 - February 2026 (5 years)</Text>
              <Text className="text-xs text-muted">Total Lab Results: 96 tests</Text>
            </View>

            <View className="border-t border-border pt-3 mt-3">
              <Text className="text-xs font-semibold text-foreground mb-2">
                Critical Findings
              </Text>
              <Text className="text-xs text-error">• Chronic Anemia (Hemoglobin 10.5 G/DL)</Text>
              <Text className="text-xs text-warning">• Persistent Prediabetes (HbA1c 6.0%)</Text>
              <Text className="text-xs text-warning">• High Cholesterol (Total 218 mg/dL)</Text>
              <Text className="text-xs text-warning">• Elevated Rheumatoid Factor (52 IU/ML)</Text>
            </View>

            {reportType === "full" && (
              <View className="border-t border-border pt-3 mt-3">
                <Text className="text-xs font-semibold text-foreground mb-2">
                  Additional Sections
                </Text>
                <Text className="text-xs text-muted">• Cardiovascular Risk Analysis</Text>
                <Text className="text-xs text-muted">• Hematologic System Review</Text>
                <Text className="text-xs text-muted">• Endocrine Function Assessment</Text>
                <Text className="text-xs text-muted">• Renal Function Trends</Text>
                <Text className="text-xs text-muted">• GI System Findings</Text>
                <Text className="text-xs text-muted">• Musculoskeletal Health</Text>
                <Text className="text-xs text-muted">• Rheumatologic Assessment</Text>
                <Text className="text-xs text-muted">• Thyroid Function</Text>
                <Text className="text-xs text-muted">• Treatment Recommendations</Text>
                <Text className="text-xs text-muted">• Follow-up Schedule</Text>
              </View>
            )}
          </View>
        </View>

        {/* Generate Button */}
        <View className="p-6">
          <Pressable
            onPress={handleGeneratePDF}
            disabled={isGenerating}
            className="bg-primary rounded-xl p-5 items-center"
            style={({ pressed }) => ({
              opacity: pressed || isGenerating ? 0.7 : 1,
            })}
          >
            {isGenerating ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="white" className="mr-2" />
                <Text className="text-white font-bold text-lg">
                  Generating PDF...
                </Text>
              </View>
            ) : (
              <>
                <Text className="text-white font-bold text-lg mb-1">
                  📥 Generate & Download PDF
                </Text>
                <Text className="text-white/80 text-sm">
                  Professional medical report for doctor visits
                </Text>
              </>
            )}
          </Pressable>

          <Text className="text-xs text-muted text-center mt-4">
            💡 Tip: Bring this report to your next doctor appointment for comprehensive review
          </Text>
        </View>

        {/* Info Section */}
        <View className="p-6 bg-surface/30">
          <Text className="text-sm font-semibold text-foreground mb-3">
            📋 About PDF Reports
          </Text>
          <Text className="text-xs text-muted mb-2">
            • Professional medical format suitable for physician review
          </Text>
          <Text className="text-xs text-muted mb-2">
            • Includes all charts, trends, and clinical interpretations
          </Text>
          <Text className="text-xs text-muted mb-2">
            • Printer-friendly layout with page numbers and table of contents
          </Text>
          <Text className="text-xs text-muted mb-2">
            • HIPAA-compliant formatting for medical records
          </Text>
          <Text className="text-xs text-muted">
            • Can be emailed directly to your healthcare provider
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
