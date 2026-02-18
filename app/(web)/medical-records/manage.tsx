import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { Link, router } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function ManagePatients() {
  const colors = useColors();
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    gender: "Female",
    relationship: "Self",
    medicalRecordNumber: "",
    emergencyContact: "",
    primaryPhysician: "",
  });

  const relationships = ["Self", "Spouse", "Parent", "Child", "Sibling", "Other"];
  const genders = ["Male", "Female", "Other"];

  const handleSubmit = () => {
    // In production, this would save to database
    console.log("Saving patient:", formData);
    setShowAddForm(false);
    router.push("/medical-records");
  };

  return (
    <ScreenContainer className="bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-6 bg-primary">
          <Link href="/medical-records" asChild>
            <Pressable className="mb-4">
              <Text className="text-white text-base">← Back to Patients</Text>
            </Pressable>
          </Link>
          
          <Text className="text-3xl font-bold text-white mb-2">
            Manage Family Members
          </Text>
          <Text className="text-base text-white/90">
            Add and manage medical records for your family
          </Text>
        </View>

        {!showAddForm ? (
          // Management Options View
          <View className="p-4">
            {/* Add New Patient Card */}
            <Pressable
              onPress={() => setShowAddForm(true)}
              className="bg-success/10 border-2 border-success rounded-xl p-6 mb-4"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text className="text-2xl mb-2">👤</Text>
              <Text className="text-success font-bold text-xl mb-2">
                Add New Family Member
              </Text>
              <Text className="text-success/70 text-sm">
                Create a new medical record profile for a family member
              </Text>
            </Pressable>

            {/* Import Data Card */}
            <Pressable
              className="bg-primary/10 border-2 border-primary rounded-xl p-6 mb-4"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text className="text-2xl mb-2">📊</Text>
              <Text className="text-primary font-bold text-xl mb-2">
                Import Lab Results (CSV)
              </Text>
              <Text className="text-primary/70 text-sm mb-3">
                Upload lab results from a CSV file
              </Text>
              <View className="bg-white border border-primary rounded-lg p-3">
                <Text className="text-xs text-muted mb-2">
                  Required CSV format:
                </Text>
                <Text className="text-xs font-mono text-foreground">
                  Test_Date, Test_Name, Result, Unit, Reference_Range, Status, Category
                </Text>
              </View>
            </Pressable>

            {/* Upload Documents Card */}
            <Pressable
              className="bg-warning/10 border-2 border-warning rounded-xl p-6 mb-4"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text className="text-2xl mb-2">📄</Text>
              <Text className="text-warning font-bold text-xl mb-2">
                Upload Medical Documents
              </Text>
              <Text className="text-warning/70 text-sm">
                Upload PDFs, images, or other medical documents
              </Text>
            </Pressable>

            {/* Export Data Card */}
            <Pressable
              className="bg-surface border-2 border-border rounded-xl p-6 mb-4"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text className="text-2xl mb-2">📤</Text>
              <Text className="text-foreground font-bold text-xl mb-2">
                Export All Data
              </Text>
              <Text className="text-muted text-sm">
                Download all medical records as PDF or CSV
              </Text>
            </Pressable>

            {/* Info Card */}
            <View className="bg-surface/50 rounded-xl p-6 mt-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                🔒 Privacy & Security
              </Text>
              <Text className="text-xs text-muted mb-2">
                • All medical data is encrypted and stored securely
              </Text>
              <Text className="text-xs text-muted mb-2">
                • Only you have access to your family's medical records
              </Text>
              <Text className="text-xs text-muted mb-2">
                • Data is never shared without your explicit permission
              </Text>
              <Text className="text-xs text-muted">
                • You can export or delete your data at any time
              </Text>
            </View>
          </View>
        ) : (
          // Add Patient Form View
          <View className="p-4">
            <View className="bg-white border border-border rounded-xl p-6">
              <Text className="text-2xl font-bold text-foreground mb-6">
                Add New Family Member
              </Text>

              {/* Name */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Full Name *
                </Text>
                <TextInput
                  className="bg-surface p-4 rounded-lg text-foreground text-base border border-border"
                  placeholder="Enter full name"
                  placeholderTextColor={colors.muted}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              {/* Date of Birth */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Date of Birth *
                </Text>
                <TextInput
                  className="bg-surface p-4 rounded-lg text-foreground text-base border border-border"
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.muted}
                  value={formData.dateOfBirth}
                  onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
                />
              </View>

              {/* Gender */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Gender *
                </Text>
                <View className="flex-row">
                  {genders.map((gender) => (
                    <Pressable
                      key={gender}
                      onPress={() => setFormData({ ...formData, gender })}
                      className={`px-4 py-3 mr-2 rounded-lg ${
                        formData.gender === gender
                          ? "bg-primary"
                          : "bg-surface border border-border"
                      }`}
                      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    >
                      <Text
                        className={`font-semibold ${
                          formData.gender === gender ? "text-white" : "text-foreground"
                        }`}
                      >
                        {gender}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Relationship */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Relationship *
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row">
                    {relationships.map((relationship) => (
                      <Pressable
                        key={relationship}
                        onPress={() => setFormData({ ...formData, relationship })}
                        className={`px-4 py-3 mr-2 rounded-lg ${
                          formData.relationship === relationship
                            ? "bg-primary"
                            : "bg-surface border border-border"
                        }`}
                        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                      >
                        <Text
                          className={`font-semibold ${
                            formData.relationship === relationship
                              ? "text-white"
                              : "text-foreground"
                          }`}
                        >
                          {relationship}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Medical Record Number */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Medical Record Number (Optional)
                </Text>
                <TextInput
                  className="bg-surface p-4 rounded-lg text-foreground text-base border border-border"
                  placeholder="e.g., MRN-123456"
                  placeholderTextColor={colors.muted}
                  value={formData.medicalRecordNumber}
                  onChangeText={(text) =>
                    setFormData({ ...formData, medicalRecordNumber: text })
                  }
                />
              </View>

              {/* Primary Physician */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Primary Physician (Optional)
                </Text>
                <TextInput
                  className="bg-surface p-4 rounded-lg text-foreground text-base border border-border"
                  placeholder="Dr. Name"
                  placeholderTextColor={colors.muted}
                  value={formData.primaryPhysician}
                  onChangeText={(text) =>
                    setFormData({ ...formData, primaryPhysician: text })
                  }
                />
              </View>

              {/* Emergency Contact */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Emergency Contact (Optional)
                </Text>
                <TextInput
                  className="bg-surface p-4 rounded-lg text-foreground text-base border border-border"
                  placeholder="Name and phone number"
                  placeholderTextColor={colors.muted}
                  value={formData.emergencyContact}
                  onChangeText={(text) =>
                    setFormData({ ...formData, emergencyContact: text })
                  }
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row">
                <Pressable
                  onPress={handleSubmit}
                  className="flex-1 bg-primary py-4 rounded-lg mr-2"
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text className="text-white font-bold text-center text-base">
                    Save Patient
                  </Text>
                </Pressable>
                
                <Pressable
                  onPress={() => setShowAddForm(false)}
                  className="flex-1 bg-white border border-border py-4 rounded-lg ml-2"
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text className="text-foreground font-bold text-center text-base">
                    Cancel
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
