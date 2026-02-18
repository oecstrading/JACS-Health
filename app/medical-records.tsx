import { ScrollView, Text, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { BackButton } from "@/components/back-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { trpc } from "@/lib/trpc";

/**
 * Medical Records Screen
 * Upload and manage past medical records, lab reports, prescriptions, etc.
 */
export default function MedicalRecordsScreen() {
  const colors = useColors();
  const [uploading, setUploading] = useState(false);

  // Fetch medical records from database
  const { data: records = [], isLoading, refetch } = trpc.medicalRecords.list.useQuery();
  const createRecord = trpc.medicalRecords.create.useMutation();

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      setUploading(true);

      const file = result.assets[0];
      
      // TODO: Upload file to S3 first, then save metadata to database
      // For now, save with local file path
      await createRecord.mutateAsync({
        documentType: "other",
        title: file.name,
        filePath: file.uri,
        fileType: file.mimeType || "application/pdf",
        fileSize: file.size || 0,
        category: "other",
      });

      Alert.alert("Success", "Document uploaded successfully");
      refetch();
      setUploading(false);
    } catch (error) {
      Alert.alert("Error", "Failed to upload document");
      setUploading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      lab_report: "flask",
      radiology_report: "xray",
      prescription: "pill",
      discharge_summary: "document",
      vaccination_record: "syringe",
    };
    return icons[category] || "paperplane.fill";
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      lab_report: "Lab Reports",
      radiology_report: "Radiology Reports",
      prescription: "Prescriptions",
      discharge_summary: "Discharge Summaries",
      vaccination_record: "Vaccination Records",
      other: "Other Documents",
    };
    return labels[category] || "Other";
  };

  // Group records by category
  const recordsByCategory = records.reduce((acc: Record<string, any[]>, record: any) => {
    const category = record.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(record);
    return acc;
  }, {});

  const totalSize = records.reduce((sum: number, r: any) => sum + (r.fileSize || 0), 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b" style={{ borderBottomColor: colors.border }}>
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text className="text-2xl font-bold text-foreground">Medical Records</Text>
        </View>
        <TouchableOpacity
          onPress={handleUpload}
          disabled={uploading}
          className="bg-primary px-4 py-2 rounded-lg"
          style={{ opacity: uploading ? 0.5 : 1 }}
        >
          <Text className="text-white font-semibold">
            {uploading ? "Uploading..." : "Upload"}
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
                <Text className="text-2xl font-bold text-foreground">{records.length}</Text>
                <Text className="text-sm text-muted mt-1">Total Records</Text>
              </View>
              <View className="flex-1 bg-surface p-4 rounded-xl border" style={{ borderColor: colors.border }}>
                <Text className="text-2xl font-bold text-foreground">{totalSizeMB} MB</Text>
                <Text className="text-sm text-muted mt-1">Storage Used</Text>
              </View>
            </View>

            {/* Document Categories */}
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">Categories</Text>
              
              {["lab_report", "radiology_report", "prescription", "discharge_summary", "vaccination_record", "other"].map((category) => {
                const count = recordsByCategory[category]?.length || 0;
                return (
                  <TouchableOpacity
                    key={category}
                    className="bg-surface p-4 rounded-xl border flex-row items-center justify-between"
                    style={{ borderColor: colors.border }}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                        <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
                      </View>
                      <View>
                        <Text className="text-base font-semibold text-foreground">
                          {getCategoryLabel(category)}
                        </Text>
                        <Text className="text-sm text-muted">{count} documents</Text>
                      </View>
                    </View>
                    <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Recent Documents */}
            {records.length > 0 && (
              <View className="gap-3">
                <Text className="text-lg font-semibold text-foreground">Recent Documents</Text>
                {records.slice(0, 5).map((record: any) => (
                  <View
                    key={record.id}
                    className="bg-surface p-4 rounded-xl border"
                    style={{ borderColor: colors.border }}
                  >
                    <Text className="text-base font-semibold text-foreground mb-1">
                      {record.fileName}
                    </Text>
                    <Text className="text-sm text-muted">
                      {getCategoryLabel(record.category)} • {new Date(record.uploadedAt).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Empty State */}
            {records.length === 0 && (
              <View className="items-center justify-center py-12">
                <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-4">
                  <IconSymbol name="paperplane.fill" size={32} color={colors.muted} />
                </View>
                <Text className="text-lg font-semibold text-foreground mb-2">
                  No Records Yet
                </Text>
                <Text className="text-sm text-muted text-center px-8">
                  Upload your medical records, lab reports, and prescriptions to keep them organized and accessible
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
