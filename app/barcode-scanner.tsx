import { useState, useRef } from "react";
import { View, Text, Pressable, Alert, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

interface MedicationData {
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
}

// Mock medication database (in production, use a real API)
const MEDICATION_DATABASE: Record<string, MedicationData> = {
  "123456789012": {
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    instructions: "Take in the morning with water",
  },
  "987654321098": {
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    instructions: "Take with meals",
  },
  "555666777888": {
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily",
    instructions: "Take at bedtime",
  },
};

export default function BarcodeScannerScreen() {
  const colors = useColors();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [medicationData, setMedicationData] = useState<MedicationData | null>(null);

  if (!permission) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-muted">Loading camera...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-2xl font-bold text-foreground text-center">
            Camera Permission Required
          </Text>
          <Text className="text-lg text-muted text-center">
            We need camera access to scan medication barcodes
          </Text>
          <Pressable
            onPress={requestPermission}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
            })}
            className="bg-primary px-8 py-4 rounded-xl mt-4"
          >
            <Text className="text-white text-lg font-bold">Grant Permission</Text>
          </Pressable>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
            })}
            className="mt-2"
          >
            <Text className="text-primary text-lg">Go Back</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  function handleBarcodeScanned({ type, data }: BarcodeScanningResult) {
    if (scanned) return;
    
    setScanned(true);
    console.log(`Barcode scanned: ${type} - ${data}`);

    // Look up medication in database
    const medication = MEDICATION_DATABASE[data];

    if (medication) {
      setMedicationData(medication);
      Alert.alert(
        "Medication Found!",
        `${medication.name} ${medication.dosage}\n\n${medication.frequency}\n${medication.instructions}`,
        [
          {
            text: "Scan Again",
            onPress: () => {
              setScanned(false);
              setMedicationData(null);
            },
          },
          {
            text: "Add to List",
            onPress: () => {
              // In production, save to AsyncStorage
              Alert.alert("Success", "Medication added to your list!");
              router.back();
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Medication Not Found",
        `Barcode: ${data}\n\nWould you like to enter medication details manually?`,
        [
          {
            text: "Scan Again",
            onPress: () => setScanned(false),
          },
          {
            text: "Manual Entry",
            onPress: () => {
              // Navigate to manual entry form
              Alert.alert("Info", "Manual entry form would open here");
              router.back();
            },
          },
        ]
      );
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            padding: 16,
          })}
        >
          <Text style={[styles.backButton, { color: colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Scan Medication Barcode
        </Text>
        <View style={{ width: 80 }} />
      </View>

      {/* Camera View */}
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      >
        {/* Scanning Frame */}
        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.topRight, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.bottomRight, { borderColor: colors.primary }]} />
          </View>
        </View>

        {/* Instructions */}
        <View style={[styles.instructions, { backgroundColor: "rgba(0,0,0,0.7)" }]}>
          <Text style={styles.instructionText}>
            {scanned
              ? "Processing barcode..."
              : "Position the barcode within the frame"}
          </Text>
        </View>

        {/* Manual Entry Button */}
        {!scanned && (
          <View style={styles.bottomControls}>
            <Pressable
              onPress={() => {
                Alert.alert("Manual Entry", "Manual medication entry form would open here");
                router.back();
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                backgroundColor: colors.surface,
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
              })}
            >
              <Text style={[styles.manualButton, { color: colors.foreground }]}>
                Enter Manually
              </Text>
            </Pressable>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 8,
  },
  backButton: {
    fontSize: 18,
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 280,
    height: 180,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructions: {
    position: "absolute",
    bottom: 120,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  bottomControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  manualButton: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
