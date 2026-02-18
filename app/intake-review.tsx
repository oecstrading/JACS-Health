import { View, Text, ScrollView, TouchableOpacity, Alert, Share, TextInput } from "react-native";
import { useState, useEffect, useRef } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router, useLocalSearchParams } from "expo-router";
import PatientIntakeService, { type PatientIntakeForm } from "@/services/patientIntake";

export default function IntakeReviewScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const formId = params.formId as string;
  
  const [form, setForm] = useState<PatientIntakeForm | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [hasConsented, setHasConsented] = useState(false);
  const formRef = useRef<View>(null);

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    try {
      const forms = await PatientIntakeService.getAllIntakeForms();
      const foundForm = forms.find((f) => f.id === formId);
      if (foundForm) {
        setForm(foundForm);
        setHasConsented(foundForm.hipaaConsent.consentToTreat && foundForm.hipaaConsent.consentToShareData);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load intake form");
    }
  };

  const handleEdit = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValue(String(currentValue || ""));
  };

  const handleSaveEdit = async () => {
    if (!form || !editingField) return;

    try {
      PatientIntakeService.updateFieldValue(form, editingField, editValue);
      await PatientIntakeService.saveIntakeForm(form);
      setEditingField(null);
      setEditValue("");
      loadForm();
    } catch (error) {
      Alert.alert("Error", "Failed to save changes");
    }
  };

  const handleSign = () => {
    Alert.prompt(
      "Digital Signature",
      "Please type your full name to sign this form",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign",
          onPress: (name?: string) => {
            if (name && name.trim()) {
              setSignature(name.trim());
              handleConsent(name.trim());
            } else {
              Alert.alert("Error", "Please enter your full name");
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const handleConsent = async (signatureName: string) => {
    if (!form) return;

    try {
      form.hipaaConsent.consentToTreat = true;
      form.hipaaConsent.consentToShareData = true;
      form.hipaaConsent.signatureDate = new Date().toISOString();
      form.status = "completed";
      
      await PatientIntakeService.saveIntakeForm(form);
      setHasConsented(true);
      
      Alert.alert(
        "Form Signed!",
        "Your intake form has been completed and signed.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save signature");
    }
  };

  const handleGeneratePDF = async () => {
    if (!form) return;

    try {
      Alert.alert(
        "Generate PDF",
        "This feature will create a PDF of your intake form that you can email to your doctor's office.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Generate & Share",
            onPress: async () => {
              // In production, this would use a PDF generation library
              // For now, we'll simulate it
              Alert.alert(
                "PDF Generated",
                "Your intake form PDF has been created. You can now share it with your doctor's office.",
                [
                  {
                    text: "Share via Email",
                    onPress: () => handleSharePDF(),
                  },
                  {
                    text: "Done",
                    style: "cancel",
                  },
                ]
              );
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to generate PDF");
    }
  };

  const handleSharePDF = async () => {
    try {
      await Share.share({
        message: `Patient Intake Form for ${form?.demographics.firstName} ${form?.demographics.lastName}`,
        title: "Patient Intake Form",
      });
    } catch (error) {
      console.error("Error sharing PDF:", error);
    }
  };

  if (!form) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <Text className="text-lg text-muted">Loading form...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6" ref={formRef}>
          {/* Header */}
          <View>
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <Text className="text-base font-semibold" style={{ color: colors.primary }}>
                ← Back
              </Text>
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Review & Sign</Text>
            <Text className="text-base text-muted mt-1">
              Review your information and sign to complete
            </Text>
          </View>

          {/* Completion Status */}
          <View
            className="rounded-2xl p-5"
            style={{ backgroundColor: form.completionPercentage === 100 ? colors.success : colors.warning }}
          >
            <Text className="text-xl font-bold text-white mb-2">
              {form.completionPercentage === 100 ? "✓ Form Complete" : "⚠️ Form Incomplete"}
            </Text>
            <Text className="text-base text-white opacity-90">
              {form.completionPercentage}% of required fields filled
            </Text>
          </View>

          {/* Demographics Section */}
          <View
            className="rounded-2xl p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-2xl font-bold text-foreground mb-4">Personal Information</Text>
            
            <InfoRow
              label="Full Name"
              value={`${form.demographics.firstName || ""} ${form.demographics.middleName || ""} ${form.demographics.lastName || ""}`.trim()}
              onEdit={() => handleEdit("demographics.firstName", form.demographics.firstName)}
              colors={colors}
            />
            <InfoRow
              label="Date of Birth"
              value={form.demographics.dateOfBirth ? new Date(form.demographics.dateOfBirth).toLocaleDateString() : "Not provided"}
              onEdit={() => handleEdit("demographics.dateOfBirth", form.demographics.dateOfBirth)}
              colors={colors}
            />
            <InfoRow
              label="Gender"
              value={form.demographics.gender || "Not provided"}
              onEdit={() => handleEdit("demographics.gender", form.demographics.gender)}
              colors={colors}
            />
            <InfoRow
              label="Address"
              value={form.demographics.address ? `${form.demographics.address.street}, ${form.demographics.address.city}, ${form.demographics.address.state} ${form.demographics.address.zipCode}` : "Not provided"}
              onEdit={() => handleEdit("demographics.address.street", form.demographics.address?.street)}
              colors={colors}
            />
            <InfoRow
              label="Phone"
              value={form.demographics.phone || "Not provided"}
              onEdit={() => handleEdit("demographics.phone", form.demographics.phone)}
              colors={colors}
              isLast
            />
          </View>

          {/* Emergency Contact Section */}
          <View
            className="rounded-2xl p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-2xl font-bold text-foreground mb-4">Emergency Contact</Text>
            
            {form.emergencyContacts.length > 0 ? (
              form.emergencyContacts.map((contact, index) => (
                <View key={index}>
                  <InfoRow
                    label="Name"
                    value={contact.name}
                    colors={colors}
                  />
                  <InfoRow
                    label="Relationship"
                    value={contact.relationship}
                    colors={colors}
                  />
                  <InfoRow
                    label="Phone"
                    value={contact.phone}
                    colors={colors}
                    isLast
                  />
                </View>
              ))
            ) : (
              <Text className="text-base text-muted">No emergency contact provided</Text>
            )}
          </View>

          {/* Insurance Section */}
          {form.primaryInsurance && (
            <View
              className="rounded-2xl p-6"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-2xl font-bold text-foreground mb-4">Primary Insurance</Text>
              
              <InfoRow
                label="Provider"
                value={form.primaryInsurance.provider}
                colors={colors}
              />
              <InfoRow
                label="Policy Number"
                value={form.primaryInsurance.policyNumber}
                colors={colors}
              />
              {form.primaryInsurance.groupNumber && (
                <InfoRow
                  label="Group Number"
                  value={form.primaryInsurance.groupNumber}
                  colors={colors}
                />
              )}
              <InfoRow
                label="Subscriber"
                value={form.primaryInsurance.subscriberName}
                colors={colors}
                isLast
              />
            </View>
          )}

          {/* Medical History Section */}
          <View
            className="rounded-2xl p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-2xl font-bold text-foreground mb-4">Medical History</Text>
            
            <InfoRow
              label="Chronic Conditions"
              value={form.medicalHistory.chronicConditions.length > 0 ? form.medicalHistory.chronicConditions.join(", ") : "None reported"}
              colors={colors}
            />
            <InfoRow
              label="Surgeries"
              value={form.medicalHistory.surgeries.length > 0 ? `${form.medicalHistory.surgeries.length} surgery(ies)` : "None reported"}
              colors={colors}
            />
            <InfoRow
              label="Hospitalizations"
              value={form.medicalHistory.hospitalizations.length > 0 ? `${form.medicalHistory.hospitalizations.length} hospitalization(s)` : "None reported"}
              colors={colors}
              isLast
            />
          </View>

          {/* Social History Section */}
          <View
            className="rounded-2xl p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-2xl font-bold text-foreground mb-4">Social History</Text>
            
            <InfoRow
              label="Smoking Status"
              value={form.socialHistory.smokingStatus || "Not provided"}
              colors={colors}
            />
            <InfoRow
              label="Alcohol Use"
              value={form.socialHistory.alcoholUse || "Not provided"}
              colors={colors}
            />
            <InfoRow
              label="Exercise"
              value={form.socialHistory.exerciseFrequency || "Not provided"}
              colors={colors}
              isLast
            />
          </View>

          {/* Medications Section */}
          <View
            className="rounded-2xl p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-2xl font-bold text-foreground mb-4">Current Medications</Text>
            
            {form.medications.length > 0 ? (
              form.medications.map((med, index) => (
                <View key={index} className="mb-4">
                  <Text className="text-lg font-bold text-foreground">{med.name}</Text>
                  <Text className="text-base text-muted">{med.dosage} - {med.frequency}</Text>
                </View>
              ))
            ) : (
              <Text className="text-base text-muted">No medications reported</Text>
            )}
          </View>

          {/* Allergies Section */}
          <View
            className="rounded-2xl p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-2xl font-bold text-foreground mb-4">Allergies</Text>
            
            {form.allergies.length > 0 ? (
              form.allergies.map((allergy, index) => (
                <View key={index} className="mb-4">
                  <Text className="text-lg font-bold text-foreground">{allergy.allergen}</Text>
                  <Text className="text-base text-muted">
                    {allergy.type} - {allergy.reaction} ({allergy.severity})
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-base text-muted">No allergies reported</Text>
            )}
          </View>

          {/* HIPAA Consent Section */}
          <View
            className="rounded-2xl p-6"
            style={{ backgroundColor: hasConsented ? colors.success : colors.surface }}
          >
            <Text className="text-2xl font-bold mb-4" style={{ color: hasConsented ? "#fff" : colors.foreground }}>
              HIPAA Authorization & Consent
            </Text>
            
            <View className="gap-4">
              <View>
                <Text className="text-base font-semibold mb-2" style={{ color: hasConsented ? "#fff" : colors.foreground }}>
                  Consent to Treat
                </Text>
                <Text className="text-sm mb-2" style={{ color: hasConsented ? "#fff" : colors.muted, opacity: hasConsented ? 0.9 : 1 }}>
                  I authorize the healthcare provider to examine and treat me. I understand that I have the right to refuse treatment.
                </Text>
                <Text className="text-base font-bold" style={{ color: hasConsented ? "#fff" : (form.hipaaConsent.consentToTreat ? colors.success : colors.error) }}>
                  {form.hipaaConsent.consentToTreat ? "✓ Consented" : "✗ Not Consented"}
                </Text>
              </View>

              <View>
                <Text className="text-base font-semibold mb-2" style={{ color: hasConsented ? "#fff" : colors.foreground }}>
                  Consent to Share Health Information
                </Text>
                <Text className="text-sm mb-2" style={{ color: hasConsented ? "#fff" : colors.muted, opacity: hasConsented ? 0.9 : 1 }}>
                  I authorize the healthcare provider to share my health information with other providers involved in my care.
                </Text>
                <Text className="text-base font-bold" style={{ color: hasConsented ? "#fff" : (form.hipaaConsent.consentToShareData ? colors.success : colors.error) }}>
                  {form.hipaaConsent.consentToShareData ? "✓ Consented" : "✗ Not Consented"}
                </Text>
              </View>

              {form.hipaaConsent.signatureDate && (
                <View>
                  <Text className="text-base font-semibold mb-1" style={{ color: hasConsented ? "#fff" : colors.foreground }}>
                    Signed On
                  </Text>
                  <Text className="text-base" style={{ color: hasConsented ? "#fff" : colors.muted, opacity: hasConsented ? 0.9 : 1 }}>
                    {new Date(form.hipaaConsent.signatureDate).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            {!hasConsented && (
              <TouchableOpacity
                onPress={handleSign}
                className="rounded-2xl p-6 items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-2xl font-bold text-white">✍️ Sign Form</Text>
                <Text className="text-base text-white mt-1 opacity-90">
                  Digitally sign to complete this form
                </Text>
              </TouchableOpacity>
            )}

            {hasConsented && (
              <>
                <TouchableOpacity
                  onPress={handleGeneratePDF}
                  className="rounded-2xl p-6 items-center"
                  style={{ backgroundColor: colors.success }}
                >
                  <Text className="text-2xl font-bold text-white">📄 Generate PDF</Text>
                  <Text className="text-base text-white mt-1 opacity-90">
                    Create PDF to email to your doctor
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSharePDF}
                  className="rounded-2xl p-6 items-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-2xl font-bold text-white">📧 Share via Email</Text>
                  <Text className="text-base text-white mt-1 opacity-90">
                    Send this form to your doctor's office
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              onPress={() => router.push({ pathname: "/voice-intake" as any, params: { formId: form.id } })}
              className="rounded-full p-4 items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-base font-bold text-foreground">← Back to Questions</Text>
            </TouchableOpacity>
          </View>

          {/* Edit Dialog */}
          {editingField && (
            <View
              className="rounded-2xl p-6"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-xl font-bold text-white mb-3">Edit Field</Text>
              <TextInput
                value={editValue}
                onChangeText={setEditValue}
                className="rounded-xl p-4 mb-4 text-lg"
                style={{ backgroundColor: "#fff", color: colors.foreground }}
                autoFocus
              />
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleSaveEdit}
                  className="flex-1 rounded-full p-4 items-center"
                  style={{ backgroundColor: colors.success }}
                >
                  <Text className="text-lg font-bold text-white">✓ Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setEditingField(null)}
                  className="flex-1 rounded-full p-4 items-center"
                  style={{ backgroundColor: colors.error }}
                >
                  <Text className="text-lg font-bold text-white">✗ Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// Helper component for displaying info rows
function InfoRow({
  label,
  value,
  onEdit,
  colors,
  isLast = false,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
  colors: any;
  isLast?: boolean;
}) {
  return (
    <View
      className="py-4"
      style={{
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-sm font-semibold text-muted uppercase">{label}</Text>
        {onEdit && (
          <TouchableOpacity onPress={onEdit}>
            <Text className="text-sm font-bold" style={{ color: colors.primary }}>
              Edit
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Text className="text-lg text-foreground" style={{ lineHeight: 26 }}>
        {value}
      </Text>
    </View>
  );
}
