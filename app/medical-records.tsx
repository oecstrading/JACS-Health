import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { BackButton } from "@/components/back-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";

/**
 * Medical Records Screen
 * Upload and manage past medical records, lab reports, prescriptions, etc.
 */
export default function MedicalRecordsScreen() {
  const colors = useColors();
  const [records, setRecords] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      setUploading(true);

      // TODO: Upload to S3 and save to database via tRPC
      // For now, just show success message
      Alert.alert("Success", "Document uploaded successfully");

      setUploading(false);
    } catch (error) {
      Alert.alert("Error", "Failed to upload document");
      setUploading(false);
    }
  };

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

      <ScrollView className="flex-1">
        <View className="p-4 gap-4">
          {/* Stats Cards */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface p-4 rounded-xl border" style={{ borderColor: colors.border }}>
              <Text className="text-2xl font-bold text-foreground">0</Text>
              <Text className="text-sm text-muted mt-1">Total Records</Text>
            </View>
            <View className="flex-1 bg-surface p-4 rounded-xl border" style={{ borderColor: colors.border }}>
              <Text className="text-2xl font-bold text-foreground">0 MB</Text>
              <Text className="text-sm text-muted mt-1">Storage Used</Text>
            </View>
          </View>

          {/* Document Categories */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Categories</Text>
            
            {[
              { type: "lab_report", label: "Lab Reports", icon: "flask", count: 0 },
              { type: "radiology_report", label: "Radiology Reports", icon: "xray", count: 0 },
              { type: "prescription", label: "Prescriptions", icon: "pill", count: 0 },
              { type: "discharge_summary", label: "Discharge Summaries", icon: "document", count: 0 },
              { type: "vaccination_record", label: "Vaccination Records", icon: "syringe", count: 0 },
            ].map((category) => (
              <TouchableOpacity
                key={category.type}
                className="bg-surface p-4 rounded-xl border flex-row items-center justify-between"
                style={{ borderColor: colors.border }}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                    <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-foreground">
                      {category.label}
                    </Text>
                    <Text className="text-sm text-muted">{category.count} documents</Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Empty State */}
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
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
