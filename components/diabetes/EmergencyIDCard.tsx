import { View, Text, Pressable, ScrollView, TextInput, Alert } from "react-native";
import { useState, useEffect } from "react";
import { CreditCard, Download, Share2, AlertTriangle, User, Phone, Pill } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

interface EmergencyCardData {
  patientName: string;
  dateOfBirth: string;
  diabetesType: string;
  emergencyContact1Name: string;
  emergencyContact1Phone: string;
  emergencyContact2Name: string;
  emergencyContact2Phone: string;
  medications: string;
  allergies: string;
  doctorName: string;
  doctorPhone: string;
  insuranceProvider: string;
  insuranceNumber: string;
}

/**
 * Emergency ID Card Generator
 * 
 * Features:
 * - Editable patient information form
 * - Emergency contact details (2 contacts)
 * - Current medications and allergies
 * - Doctor and insurance information
 * - Print to PDF functionality
 * - Share via messaging/email
 * - Wallet-sized card format
 */
export function EmergencyIDCard() {
  const colors = useColors();
  const [cardData, setCardData] = useState<EmergencyCardData>({
    patientName: "",
    dateOfBirth: "",
    diabetesType: "Type 1",
    emergencyContact1Name: "",
    emergencyContact1Phone: "",
    emergencyContact2Name: "",
    emergencyContact2Phone: "",
    medications: "",
    allergies: "None",
    doctorName: "",
    doctorPhone: "",
    insuranceProvider: "",
    insuranceNumber: "",
  });

  useEffect(() => {
    loadCardData();
  }, []);

  const loadCardData = async () => {
    try {
      const stored = await AsyncStorage.getItem("emergency_card_data");
      if (stored) {
        setCardData(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading emergency card data:", error);
    }
  };

  const saveCardData = async () => {
    try {
      await AsyncStorage.setItem("emergency_card_data", JSON.stringify(cardData));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved", "Emergency card information has been saved.");
    } catch (error) {
      console.error("Error saving emergency card data:", error);
      Alert.alert("Error", "Could not save emergency card data.");
    }
  };

  const generateCardHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Emergency Medical ID Card</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background: #f5f5f5;
    }
    .card {
      width: 3.375in;
      height: 2.125in;
      background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
      border-radius: 12px;
      padding: 16px;
      color: white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin: 20px auto;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid rgba(255,255,255,0.3);
    }
    .title {
      font-size: 14px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .alert-badge {
      background: white;
      color: #DC2626;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
    }
    .patient-info {
      margin-bottom: 10px;
    }
    .patient-name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 2px;
    }
    .patient-details {
      font-size: 9px;
      opacity: 0.9;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      font-size: 8px;
    }
    .info-item {
      background: rgba(255,255,255,0.15);
      padding: 4px 6px;
      border-radius: 4px;
    }
    .info-label {
      font-weight: bold;
      margin-bottom: 2px;
      opacity: 0.8;
    }
    .info-value {
      font-size: 9px;
    }
    @media print {
      body { background: white; }
      .card { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="title">⚕️ Emergency Medical ID</div>
      <div class="alert-badge">DIABETES</div>
    </div>
    
    <div class="patient-info">
      <div class="patient-name">${cardData.patientName || "Patient Name"}</div>
      <div class="patient-details">
        DOB: ${cardData.dateOfBirth || "MM/DD/YYYY"} • ${cardData.diabetesType}
      </div>
    </div>
    
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Emergency Contact</div>
        <div class="info-value">${cardData.emergencyContact1Name || "Name"}</div>
        <div class="info-value">${cardData.emergencyContact1Phone || "Phone"}</div>
      </div>
      
      <div class="info-item">
        <div class="info-label">Doctor</div>
        <div class="info-value">${cardData.doctorName || "Dr. Name"}</div>
        <div class="info-value">${cardData.doctorPhone || "Phone"}</div>
      </div>
      
      <div class="info-item">
        <div class="info-label">Medications</div>
        <div class="info-value">${cardData.medications || "None listed"}</div>
      </div>
      
      <div class="info-item">
        <div class="info-label">Allergies</div>
        <div class="info-value">${cardData.allergies || "None"}</div>
      </div>
    </div>
  </div>
  
  <p style="text-align: center; font-size: 10px; color: #666; margin-top: 20px;">
    In case of emergency, please contact the listed emergency contact or doctor immediately.
  </p>
</body>
</html>
    `;
  };

  const handlePrint = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const html = generateCardHTML();
      const { uri } = await Print.printToFileAsync({ html });
      
      Alert.alert(
        "Card Generated",
        "Your emergency ID card has been generated as a PDF.",
        [
          { text: "Share", onPress: () => handleShare(uri) },
          { text: "OK" },
        ]
      );
    } catch (error) {
      console.error("Error printing card:", error);
      Alert.alert("Error", "Could not generate emergency card.");
    }
  };

  const handleShare = async (uri?: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      let shareUri = uri;
      if (!shareUri) {
        const html = generateCardHTML();
        const { uri: generatedUri } = await Print.printToFileAsync({ html });
        shareUri = generatedUri;
      }
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareUri);
      } else {
        Alert.alert("Error", "Sharing is not available on this device.");
      }
    } catch (error) {
      console.error("Error sharing card:", error);
      Alert.alert("Error", "Could not share emergency card.");
    }
  };

  const updateField = (field: keyof EmergencyCardData, value: string) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="p-6">
        {/* Header */}
        <View className="items-center mb-6">
          <View className="bg-error/20 rounded-full p-4 mb-3">
            <CreditCard size={40} color={colors.error} />
          </View>
          <Text className="text-3xl font-bold text-foreground mb-2">
            Emergency ID Card
          </Text>
          <Text className="text-base text-muted text-center">
            Create a wallet-sized medical alert card for emergencies
          </Text>
        </View>

        {/* Alert Banner */}
        <View className="bg-error/10 border-2 border-error/30 rounded-xl p-4 mb-6 flex-row items-start gap-3">
          <AlertTriangle size={24} color={colors.error} />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground mb-1">
              Important Medical Information
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              Fill out all fields below. Keep this card in your wallet or bag at all times.
            </Text>
          </View>
        </View>

        {/* Form */}
        <View className="gap-4 mb-6">
          {/* Patient Information */}
          <View className="bg-surface border border-border rounded-xl p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <User size={20} color={colors.primary} />
              <Text className="text-lg font-semibold text-foreground">
                Patient Information
              </Text>
            </View>

            <View className="gap-3">
              <View>
                <Text className="text-sm text-muted mb-1">Full Name *</Text>
                <TextInput
                  value={cardData.patientName}
                  onChangeText={(text) => updateField("patientName", text)}
                  placeholder="Enter full name"
                  placeholderTextColor={colors.muted}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                />
              </View>

              <View>
                <Text className="text-sm text-muted mb-1">Date of Birth *</Text>
                <TextInput
                  value={cardData.dateOfBirth}
                  onChangeText={(text) => updateField("dateOfBirth", text)}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={colors.muted}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                />
              </View>

              <View>
                <Text className="text-sm text-muted mb-1">Diabetes Type *</Text>
                <View className="flex-row gap-2">
                  {["Type 1", "Type 2", "Gestational"].map((type) => (
                    <Pressable
                      key={type}
                      onPress={() => updateField("diabetesType", type)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                      className={`flex-1 py-2 rounded-lg border-2 ${
                        cardData.diabetesType === type
                          ? "bg-primary/20 border-primary"
                          : "bg-background border-border"
                      }`}
                    >
                      <Text
                        className={`text-center text-sm font-semibold ${
                          cardData.diabetesType === type ? "text-primary" : "text-muted"
                        }`}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Emergency Contacts */}
          <View className="bg-surface border border-border rounded-xl p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <Phone size={20} color={colors.error} />
              <Text className="text-lg font-semibold text-foreground">
                Emergency Contacts
              </Text>
            </View>

            <View className="gap-3">
              <View>
                <Text className="text-sm text-muted mb-1">Contact 1 Name *</Text>
                <TextInput
                  value={cardData.emergencyContact1Name}
                  onChangeText={(text) => updateField("emergencyContact1Name", text)}
                  placeholder="Enter name"
                  placeholderTextColor={colors.muted}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                />
              </View>

              <View>
                <Text className="text-sm text-muted mb-1">Contact 1 Phone *</Text>
                <TextInput
                  value={cardData.emergencyContact1Phone}
                  onChangeText={(text) => updateField("emergencyContact1Phone", text)}
                  placeholder="(555) 123-4567"
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                />
              </View>

              <View>
                <Text className="text-sm text-muted mb-1">Contact 2 Name</Text>
                <TextInput
                  value={cardData.emergencyContact2Name}
                  onChangeText={(text) => updateField("emergencyContact2Name", text)}
                  placeholder="Enter name (optional)"
                  placeholderTextColor={colors.muted}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                />
              </View>

              <View>
                <Text className="text-sm text-muted mb-1">Contact 2 Phone</Text>
                <TextInput
                  value={cardData.emergencyContact2Phone}
                  onChangeText={(text) => updateField("emergencyContact2Phone", text)}
                  placeholder="(555) 123-4567"
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                />
              </View>
            </View>
          </View>

          {/* Medical Information */}
          <View className="bg-surface border border-border rounded-xl p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <Pill size={20} color={colors.primary} />
              <Text className="text-lg font-semibold text-foreground">
                Medical Information
              </Text>
            </View>

            <View className="gap-3">
              <View>
                <Text className="text-sm text-muted mb-1">Current Medications</Text>
                <TextInput
                  value={cardData.medications}
                  onChangeText={(text) => updateField("medications", text)}
                  placeholder="e.g., Insulin, Metformin"
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={2}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                />
              </View>

              <View>
                <Text className="text-sm text-muted mb-1">Allergies</Text>
                <TextInput
                  value={cardData.allergies}
                  onChangeText={(text) => updateField("allergies", text)}
                  placeholder="None"
                  placeholderTextColor={colors.muted}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                />
              </View>

              <View>
                <Text className="text-sm text-muted mb-1">Doctor Name</Text>
                <TextInput
                  value={cardData.doctorName}
                  onChangeText={(text) => updateField("doctorName", text)}
                  placeholder="Dr. Name"
                  placeholderTextColor={colors.muted}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                />
              </View>

              <View>
                <Text className="text-sm text-muted mb-1">Doctor Phone</Text>
                <TextInput
                  value={cardData.doctorPhone}
                  onChangeText={(text) => updateField("doctorPhone", text)}
                  placeholder="(555) 123-4567"
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                />
              </View>

              <View>
                <Text className="text-sm text-muted mb-1">Insurance Provider</Text>
                <TextInput
                  value={cardData.insuranceProvider}
                  onChangeText={(text) => updateField("insuranceProvider", text)}
                  placeholder="Insurance company name"
                  placeholderTextColor={colors.muted}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                />
              </View>

              <View>
                <Text className="text-sm text-muted mb-1">Insurance Number</Text>
                <TextInput
                  value={cardData.insuranceNumber}
                  onChangeText={(text) => updateField("insuranceNumber", text)}
                  placeholder="Policy/Member ID"
                  placeholderTextColor={colors.muted}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-3">
          <Pressable
            onPress={saveCardData}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
            className="bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
          >
            <Text className="text-white font-semibold text-base">
              Save Information
            </Text>
          </Pressable>

          <Pressable
            onPress={handlePrint}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            className="bg-surface border-2 border-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
          >
            <Download size={20} color={colors.primary} />
            <Text className="text-primary font-semibold text-base">
              Generate PDF Card
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleShare()}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            className="bg-surface border-2 border-border py-4 rounded-xl flex-row items-center justify-center gap-2"
          >
            <Share2 size={20} color={colors.foreground} />
            <Text className="text-foreground font-semibold text-base">
              Share Card
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
