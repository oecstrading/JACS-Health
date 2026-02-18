import { useState } from "react";
import { View, Text, ScrollView, Pressable, Image, Alert } from "react-native";
import { router } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

interface PillIdentification {
  name: string;
  dosage: string;
  shape: string;
  color: string;
  imprint: string;
  confidence: number;
}

export default function PillIdentifierScreen() {
  const colors = useColors();
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [identification, setIdentification] = useState<PillIdentification | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function handleTakePhoto(camera: any) {
    if (!camera) return;

    try {
      const photo = await camera.takePictureAsync();
      setCapturedPhoto(photo.uri);
      setShowCamera(false);
      analyzePhoto(photo.uri);
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  }

  async function analyzePhoto(photoUri: string) {
    setIsAnalyzing(true);

    // Simulate AI analysis - in production, call server LLM with vision capabilities
    setTimeout(() => {
      const mockResult: PillIdentification = {
        name: "Lisinopril",
        dosage: "10 mg",
        shape: "Round",
        color: "Pink",
        imprint: "E 101",
        confidence: 0.92,
      };

      setIdentification(mockResult);
      setIsAnalyzing(false);
    }, 2000);
  }

  function addMedication() {
    if (!identification) return;

    Alert.alert(
      "Medication Added",
      `${identification.name} ${identification.dosage} has been added to your medications list.`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  }

  function retakePhoto() {
    setCapturedPhoto(null);
    setIdentification(null);
    setShowCamera(true);
  }

  if (!permission) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-muted">Requesting camera permission...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-xl font-bold text-foreground text-center">
            Camera Permission Required
          </Text>
          <Text className="text-base text-muted text-center">
            We need access to your camera to identify pills
          </Text>
          <Pressable
            onPress={requestPermission}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            className="bg-primary px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-bold">Grant Permission</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  if (showCamera) {
    return (
      <View className="flex-1">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          ref={(ref) => {
            if (ref) {
              // Store camera ref for taking photos
              (global as any).cameraRef = ref;
            }
          }}
        >
          <View className="flex-1 justify-between p-6">
            {/* Header */}
            <View className="flex-row justify-between items-center">
              <Pressable
                onPress={() => {
                  setShowCamera(false);
                  if (!capturedPhoto) router.back();
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                className="bg-black/50 px-4 py-2 rounded-full"
              >
                <Text className="text-white font-bold">Cancel</Text>
              </Pressable>
            </View>

            {/* Instructions */}
            <View className="items-center">
              <View className="bg-black/70 px-6 py-4 rounded-2xl">
                <Text className="text-white text-center font-semibold">
                  Center the pill in the frame
                </Text>
                <Text className="text-white/80 text-center text-sm mt-1">
                  Make sure it's well-lit and in focus
                </Text>
              </View>
            </View>

            {/* Capture Button */}
            <View className="items-center pb-8">
              <Pressable
                onPress={() => handleTakePhoto((global as any).cameraRef)}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                className="w-20 h-20 rounded-full bg-white border-4 border-primary items-center justify-center"
              >
                <View className="w-16 h-16 rounded-full bg-primary" />
              </Pressable>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text className="text-lg text-primary">← Back</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-foreground">Pill Identifier</Text>
          <View className="w-12" />
        </View>

        {!capturedPhoto ? (
          /* Initial State */
          <View className="flex-1 items-center justify-center gap-6 py-12">
            <View className="w-32 h-32 bg-primary/20 rounded-full items-center justify-center">
              <Text className="text-6xl">💊</Text>
            </View>
            <View className="items-center gap-2">
              <Text className="text-xl font-bold text-foreground text-center">
                Identify Your Medication
              </Text>
              <Text className="text-base text-muted text-center px-4">
                Take a photo of your pill and we'll identify it using AI
              </Text>
            </View>
            <Pressable
              onPress={() => setShowCamera(true)}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              className="bg-primary px-8 py-4 rounded-xl"
            >
              <Text className="text-white text-lg font-bold">📸 Take Photo</Text>
            </Pressable>
            <View className="bg-surface p-4 rounded-xl mt-4">
              <Text className="text-sm text-muted text-center">
                ⚠️ Always verify the identified medication with your pharmacist or doctor
              </Text>
            </View>
          </View>
        ) : (
          /* Results State */
          <View className="gap-6">
            {/* Captured Photo */}
            <View className="bg-surface p-4 rounded-2xl">
              <Text className="text-lg font-bold text-foreground mb-3">Captured Image</Text>
              <Image
                source={{ uri: capturedPhoto }}
                style={{ width: "100%", height: 200, borderRadius: 12 }}
                resizeMode="cover"
              />
            </View>

            {/* Analysis Status */}
            {isAnalyzing && (
              <View className="bg-primary/20 p-6 rounded-2xl items-center">
                <Text className="text-xl font-bold text-primary mb-2">
                  Analyzing Image...
                </Text>
                <Text className="text-base text-muted text-center">
                  Our AI is identifying your medication
                </Text>
              </View>
            )}

            {/* Identification Results */}
            {identification && !isAnalyzing && (
              <View className="bg-surface p-6 rounded-2xl">
                <View className="flex-row justify-between items-start mb-4">
                  <Text className="text-xl font-bold text-foreground">
                    Identification Results
                  </Text>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor:
                        identification.confidence >= 0.8
                          ? colors.success + "20"
                          : "#F59E0B20",
                    }}
                  >
                    <Text
                      className="text-sm font-bold"
                      style={{
                        color: identification.confidence >= 0.8 ? colors.success : "#F59E0B",
                      }}
                    >
                      {Math.round(identification.confidence * 100)}% confident
                    </Text>
                  </View>
                </View>

                <View className="gap-3">
                  <View className="flex-row justify-between">
                    <Text className="text-base text-muted">Medication Name:</Text>
                    <Text className="text-base font-semibold text-foreground">
                      {identification.name}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-base text-muted">Dosage:</Text>
                    <Text className="text-base font-semibold text-foreground">
                      {identification.dosage}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-base text-muted">Shape:</Text>
                    <Text className="text-base font-semibold text-foreground">
                      {identification.shape}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-base text-muted">Color:</Text>
                    <Text className="text-base font-semibold text-foreground">
                      {identification.color}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-base text-muted">Imprint:</Text>
                    <Text className="text-base font-semibold text-foreground">
                      {identification.imprint}
                    </Text>
                  </View>
                </View>

                <View className="bg-background p-4 rounded-xl mt-4">
                  <Text className="text-sm text-warning font-semibold mb-1">
                    ⚠️ Important Notice
                  </Text>
                  <Text className="text-sm text-muted">
                    This identification is AI-generated and may not be 100% accurate. Always
                    verify with your pharmacist or doctor before taking any medication.
                  </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            {identification && !isAnalyzing && (
              <View className="gap-3">
                <Pressable
                  onPress={addMedication}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  className="bg-primary py-4 rounded-xl items-center"
                >
                  <Text className="text-white text-lg font-bold">
                    ✓ Add to My Medications
                  </Text>
                </Pressable>
                <Pressable
                  onPress={retakePhoto}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  className="bg-surface border border-border py-4 rounded-xl items-center"
                >
                  <Text className="text-foreground text-lg font-bold">📸 Retake Photo</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
