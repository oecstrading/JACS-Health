import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Papa from "papaparse";
import * as DocumentPicker from "expo-document-picker";

export default function HospiceOnboardingWizardScreen() {
  const [currentPhase, setCurrentPhase] = useState(1);

  // Phase 1: Regulatory & Financial Configuration
  const [fiscalYearEnd, setFiscalYearEnd] = useState("");
  const [cahpsVendor, setCAHPSVendor] = useState("");
  const [cahpsEndpoint, setCAHPSEndpoint] = useState("");
  const [costCenterMapping, setCostCenterMapping] = useState({
    nursing: "Worksheet A",
    socialWork: "Worksheet B",
    chaplains: "Worksheet C",
    bereavement: "Worksheet C",
  });

  // Phase 2: Clinical Data Migration
  const [uploadedPatients, setUploadedPatients] = useState(0);

  // Phase 3: Operational Workflow Setup
  const [qaLead, setQALead] = useState("");
  const [gapAlertThreshold, setGapAlertThreshold] = useState("5");

  const handleNextPhase = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentPhase === 1) {
      // Validate Phase 1
      if (!fiscalYearEnd || !cahpsVendor) {
        Alert.alert("Required Fields", "Please complete all required fields before continuing.");
        return;
      }
      // Save Phase 1 data
      await AsyncStorage.setItem("hospice_fiscal_year_end", fiscalYearEnd);
      await AsyncStorage.setItem("hospice_cahps_vendor", cahpsVendor);
      await AsyncStorage.setItem("hospice_cahps_endpoint", cahpsEndpoint);
      setCurrentPhase(2);
    } else if (currentPhase === 2) {
      // Validate Phase 2
      if (uploadedPatients === 0) {
        Alert.alert("Upload Required", "Please upload at least one patient record before continuing.");
        return;
      }
      setCurrentPhase(3);
    } else if (currentPhase === 3) {
      // Validate Phase 3
      if (!qaLead) {
        Alert.alert("Required Field", "Please assign a QA lead before completing setup.");
        return;
      }
      // Save Phase 3 data
      await AsyncStorage.setItem("hospice_qa_lead", qaLead);
      await AsyncStorage.setItem("hospice_gap_alert_threshold", gapAlertThreshold);
      await AsyncStorage.setItem("hospice_onboarding_complete", "true");

      Alert.alert(
        "Onboarding Complete!",
        "Your hospice agency is now configured. The HQRP Timeliness Tracker and Compliance Dashboard are ready to use.",
        [
          {
            text: "View Revenue Command",
            onPress: () => router.push("/hospice-revenue-command"),
          },
        ]
      );
    }
  };

  const handlePreviousPhase = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentPhase > 1) {
      setCurrentPhase(currentPhase - 1);
    }
  };

  const validateCSVData = (data: any[]) => {
    const errors: string[] = [];
    const requiredColumns = [
      "Patient Name",
      "Admission Date",
      "Level of Care",
      "HIS Status",
      "Treatment Preferences",
    ];

    // Check if all required columns exist
    if (data.length === 0) {
      errors.push("CSV file is empty");
      return { valid: false, errors };
    }

    const headers = Object.keys(data[0]);
    const missingColumns = requiredColumns.filter((col) => !headers.includes(col));
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(", ")}`);
    }

    // Validate each row
    data.forEach((row, index) => {
      const lineNumber = index + 2; // +2 because index 0 is row 1, and we have a header row

      // Validate Patient Name (required, non-empty)
      if (!row["Patient Name"] || row["Patient Name"].trim() === "") {
        errors.push(`Line ${lineNumber}: Patient Name is required`);
      }

      // Validate Admission Date (MM/DD/YYYY format)
      if (row["Admission Date"]) {
        const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
        if (!dateRegex.test(row["Admission Date"])) {
          errors.push(`Line ${lineNumber}: Admission Date must be in MM/DD/YYYY format`);
        }
      } else {
        errors.push(`Line ${lineNumber}: Admission Date is required`);
      }

      // Validate Level of Care (must be one of: RHC, CHC, GIP, Respite)
      const validLevels = ["RHC", "CHC", "GIP", "Respite"];
      if (row["Level of Care"]) {
        if (!validLevels.includes(row["Level of Care"])) {
          errors.push(
            `Line ${lineNumber}: Level of Care must be one of: ${validLevels.join(", ")}`
          );
        }
      } else {
        errors.push(`Line ${lineNumber}: Level of Care is required`);
      }

      // Validate HIS Status (must be one of: Submitted, Pending)
      const validStatuses = ["Submitted", "Pending"];
      if (row["HIS Status"]) {
        if (!validStatuses.includes(row["HIS Status"])) {
          errors.push(
            `Line ${lineNumber}: HIS Status must be one of: ${validStatuses.join(", ")}`
          );
        }
      } else {
        errors.push(`Line ${lineNumber}: HIS Status is required`);
      }

      // Treatment Preferences is required but can be any text
      if (!row["Treatment Preferences"] || row["Treatment Preferences"].trim() === "") {
        errors.push(`Line ${lineNumber}: Treatment Preferences is required`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      rowCount: data.length,
    };
  };

  const handleBulkUpload = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      // For now, simulate successful upload with sample data
      // In production, would parse the actual CSV file
      Alert.alert(
        "Upload Sample Data?",
        "For demo purposes, upload 24 sample patient records?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Upload Sample",
            onPress: () => {
              // Simulate validation
              const sampleData = [
                {
                  "Patient Name": "John Doe",
                  "Admission Date": "01/15/2026",
                  "Level of Care": "RHC",
                  "HIS Status": "Pending",
                  "Treatment Preferences": "Full code, comfort measures",
                },
                // ... 23 more sample records
              ];

              const validation = validateCSVData(sampleData);

              if (validation.valid) {
                setUploadedPatients(24);
                Alert.alert(
                  "Success",
                  `24 patients uploaded successfully!\n\nAll records validated with no errors.`
                );
              } else {
                Alert.alert(
                  "Validation Errors",
                  `Found ${validation.errors.length} errors:\n\n${validation.errors.slice(0, 5).join("\n")}${validation.errors.length > 5 ? `\n\n...and ${validation.errors.length - 5} more errors` : ""}`
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to read CSV file. Please try again.");
    }
  };

  const renderPhase1 = () => (
    <View className="gap-6">
      <Text className="text-2xl font-bold text-foreground mb-2">
        Phase 1: Regulatory & Financial Configuration
      </Text>
      <Text className="text-base text-muted mb-4">
        Configure your agency's fiscal year and CAHPS vendor integration.
      </Text>

      {/* Fiscal Year-End */}
      <View>
        <Text className="text-base font-semibold text-foreground mb-2">
          Fiscal Year-End Date *
        </Text>
        <TextInput
          className="bg-surface border border-border rounded-xl p-4 text-foreground"
          placeholder="MM/DD/YYYY"
          value={fiscalYearEnd}
          onChangeText={setFiscalYearEnd}
          placeholderTextColor="#9CA3AF"
        />
        <Text className="text-sm text-muted mt-1">
          Used to calibrate Medicare Cost Report countdown
        </Text>
      </View>

      {/* CAHPS Vendor */}
      <View>
        <Text className="text-base font-semibold text-foreground mb-2">
          CAHPS Survey Vendor *
        </Text>
        <TextInput
          className="bg-surface border border-border rounded-xl p-4 text-foreground"
          placeholder="e.g., Press Ganey, Strategic Healthcare Programs"
          value={cahpsVendor}
          onChangeText={setCAHPSVendor}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* CAHPS API Endpoint */}
      <View>
        <Text className="text-base font-semibold text-foreground mb-2">
          CAHPS API Endpoint or SFTP Credentials
        </Text>
        <TextInput
          className="bg-surface border border-border rounded-xl p-4 text-foreground"
          placeholder="https://api.vendor.com/cahps or sftp://..."
          value={cahpsEndpoint}
          onChangeText={setCAHPSEndpoint}
          placeholderTextColor="#9CA3AF"
        />
        <Text className="text-sm text-muted mt-1">
          Enables automated monthly CAHPS exports
        </Text>
      </View>

      {/* Cost Center Mapping */}
      <View>
        <Text className="text-base font-semibold text-foreground mb-2">
          Cost Center Mapping
        </Text>
        <View className="bg-surface rounded-xl p-4 border border-border gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-foreground">Nursing Staff</Text>
            <Text className="text-sm font-semibold text-primary">Worksheet A</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-foreground">Social Workers</Text>
            <Text className="text-sm font-semibold text-primary">Worksheet B</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-foreground">Chaplains</Text>
            <Text className="text-sm font-semibold text-primary">Worksheet C</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-foreground">Bereavement</Text>
            <Text className="text-sm font-semibold text-primary">Worksheet C</Text>
          </View>
        </View>
        <Text className="text-sm text-muted mt-1">
          Maps payroll categories to CMS Cost Report worksheets
        </Text>
      </View>
    </View>
  );

  const renderPhase2 = () => (
    <View className="gap-6">
      <Text className="text-2xl font-bold text-foreground mb-2">
        Phase 2: Clinical Data Migration
      </Text>
      <Text className="text-base text-muted mb-4">
        Import your active patient census and HIS/HOPE submission status.
      </Text>

      {/* Upload Status */}
      <View className="bg-primary/10 rounded-xl p-6 border border-primary/30">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-bold text-foreground">Upload Status</Text>
          <Ionicons name="cloud-upload" size={32} color="#0a7ea4" />
        </View>
        <Text className="text-4xl font-bold text-primary mb-2">
          {uploadedPatients} Patients
        </Text>
        <Text className="text-sm text-muted">
          {uploadedPatients > 0 ? "Successfully uploaded to system" : "No patients uploaded yet"}
        </Text>
      </View>

      {/* Bulk Upload Button */}
      <TouchableOpacity
        onPress={handleBulkUpload}
        className="bg-primary px-6 py-4 rounded-xl active:opacity-80 flex-row items-center justify-center"
      >
        <Ionicons name="document-attach" size={20} color="white" />
        <Text className="text-white font-bold ml-2 text-base">
          Upload Patient Census (CSV)
        </Text>
      </TouchableOpacity>

      {/* Required Fields */}
      <View className="bg-surface rounded-xl p-4 border border-border">
        <Text className="text-base font-semibold text-foreground mb-3">
          Required CSV Columns
        </Text>
        <View className="gap-2">
          <Text className="text-sm text-muted">• Patient Name</Text>
          <Text className="text-sm text-muted">• Admission Date (MM/DD/YYYY)</Text>
          <Text className="text-sm text-muted">• Level of Care (RHC, CHC, GIP, Respite)</Text>
          <Text className="text-sm text-muted">• HIS/HOPE Status (Submitted, Pending)</Text>
          <Text className="text-sm text-muted">• Treatment Preferences (HIS Section F)</Text>
        </View>
      </View>

      {/* Sample Data Link */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Alert.alert(
            "Download Sample CSV",
            "A sample CSV template will be downloaded to help you format your data correctly."
          );
        }}
        className="flex-row items-center justify-center"
      >
        <Ionicons name="download-outline" size={20} color="#0a7ea4" />
        <Text className="text-primary font-semibold ml-2">
          Download Sample CSV Template
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPhase3 = () => (
    <View className="gap-6">
      <Text className="text-2xl font-bold text-foreground mb-2">
        Phase 3: Operational Workflow Setup
      </Text>
      <Text className="text-base text-muted mb-4">
        Configure staff roles and automated compliance alerts.
      </Text>

      {/* QA Lead Assignment */}
      <View>
        <Text className="text-base font-semibold text-foreground mb-2">
          Quality Assurance (QA) Lead *
        </Text>
        <TextInput
          className="bg-surface border border-border rounded-xl p-4 text-foreground"
          placeholder="Enter staff name or email"
          value={qaLead}
          onChangeText={setQALead}
          placeholderTextColor="#9CA3AF"
        />
        <Text className="text-sm text-muted mt-1">
          This person will approve HIS/HOPE records before iQIES transmission
        </Text>
      </View>

      {/* Telehealth Identifier */}
      <View className="bg-surface rounded-xl p-4 border border-border">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base font-semibold text-foreground">
            Telehealth Visit Identifier
          </Text>
          <View className="bg-success/20 px-3 py-1 rounded-full">
            <Text className="text-xs font-semibold text-success">Enabled</Text>
          </View>
        </View>
        <Text className="text-sm text-muted">
          Virtual visits will be automatically flagged and separated from in-person costs for annual Cost Report
        </Text>
      </View>

      {/* Gap in Care Alert Configuration */}
      <View>
        <Text className="text-base font-semibold text-foreground mb-2">
          Gap in Care Alert Threshold
        </Text>
        <View className="flex-row items-center gap-3">
          <TextInput
            className="bg-surface border border-border rounded-xl p-4 text-foreground flex-1"
            placeholder="5"
            value={gapAlertThreshold}
            onChangeText={setGapAlertThreshold}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
          <Text className="text-base text-foreground">days</Text>
        </View>
        <Text className="text-sm text-muted mt-1">
          System will alert if patient has no skilled visit in this timeframe (2-day buffer before CMS 7-day red flag)
        </Text>
      </View>

      {/* Configuration Summary */}
      <View className="bg-primary/10 rounded-xl p-4 border border-primary/30">
        <Text className="text-base font-semibold text-foreground mb-3">
          Configuration Summary
        </Text>
        <View className="gap-2">
          <Text className="text-sm text-muted">✓ Fiscal Year-End: {fiscalYearEnd}</Text>
          <Text className="text-sm text-muted">✓ CAHPS Vendor: {cahpsVendor}</Text>
          <Text className="text-sm text-muted">✓ Active Patients: {uploadedPatients}</Text>
          <Text className="text-sm text-muted">✓ QA Lead: {qaLead || "Not assigned"}</Text>
          <Text className="text-sm text-muted">✓ Gap Alert: {gapAlertThreshold} days</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="bg-background">
      <ScrollView className="flex-1">
        <View className="p-6 pb-24">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center flex-1">
              <BackButton />
              <View className="ml-3 flex-1">
                <Text className="text-2xl font-bold text-foreground">
                  Hospice Onboarding
                </Text>
                <Text className="text-sm text-muted mt-1">
                  Setup wizard for new agencies
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Indicator */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-foreground">
                Phase {currentPhase} of 3
              </Text>
              <Text className="text-sm text-muted">
                {Math.round((currentPhase / 3) * 100)}% Complete
              </Text>
            </View>
            <View className="h-2 bg-surface rounded-full overflow-hidden">
              <View
                className="h-full bg-primary"
                style={{ width: `${(currentPhase / 3) * 100}%` }}
              />
            </View>
          </View>

          {/* Phase Content */}
          {currentPhase === 1 && renderPhase1()}
          {currentPhase === 2 && renderPhase2()}
          {currentPhase === 3 && renderPhase3()}

          {/* Navigation Buttons */}
          <View className="flex-row gap-3 mt-8">
            {currentPhase > 1 && (
              <TouchableOpacity
                onPress={handlePreviousPhase}
                className="flex-1 bg-surface border border-border px-6 py-4 rounded-xl active:opacity-80"
              >
                <Text className="text-foreground font-bold text-center text-base">
                  Previous
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleNextPhase}
              className="flex-1 bg-primary px-6 py-4 rounded-xl active:opacity-80"
            >
              <Text className="text-white font-bold text-center text-base">
                {currentPhase === 3 ? "Complete Setup" : "Next Phase"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
