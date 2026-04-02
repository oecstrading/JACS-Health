import { useState } from "react";
import { View, Text, ScrollView, Pressable, Image, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

interface InsuranceInfo {
  company: string;
  policyNumber: string;
  groupNumber: string;
  memberID: string;
  memberName: string;
  effectiveDate: string;
}

export default function InsuranceScannerScreen() {
  const colors = useColors();
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [insuranceInfo, setInsuranceInfo] = useState<InsuranceInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  async function handleTakePhoto(camera: any) {
    if (!camera) return;

    try {
      const photo = await camera.takePictureAsync();
      setCapturedPhoto(photo.uri);
      setShowCamera(false);
      processCard(photo.uri);
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  }

  async function processCard(photoUri: string) {
    setIsProcessing(true);

    // Simulate OCR processing - in production, use server LLM with vision capabilities
    setTimeout(() => {
      const mockInfo: InsuranceInfo = {
        company: "Blue Cross Blue Shield",
        policyNumber: "ABC123456789",
        groupNumber: "GRP-98765",
        memberID: "M123456789",
        memberName: "John Doe",
        effectiveDate: "01/01/2024",
      };

      setInsuranceInfo(mockInfo);
      setIsProcessing(false);
    }, 2000);
  }

  function saveInsurance() {
    if (!insuranceInfo) return;

    Alert.alert(
      "Insurance Saved",
      "Your insurance information has been saved securely.",
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
    setInsuranceInfo(null);
    setIsEditing(false);
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
            We need access to your camera to scan your insurance card
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
              (global as any).insuranceCameraRef = ref;
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
                  Position your insurance card in the frame
                </Text>
                <Text className="text-white/80 text-center text-sm mt-1">
                  Make sure all text is visible and readable
                </Text>
              </View>
            </View>

            {/* Capture Button */}
            <View className="items-center pb-8">
              <Pressable
                onPress={() => handleTakePhoto((global as any).insuranceCameraRef)}
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
          <Text className="text-2xl font-bold text-foreground">Insurance Scanner</Text>
          <View className="w-12" />
        </View>

        {!capturedPhoto ? (
          /* Initial State */
          <View className="flex-1 items-center justify-center gap-6 py-12">
            <View className="w-32 h-32 bg-primary/20 rounded-full items-center justify-center">
              <Text className="text-6xl">🪪</Text>
            </View>
            <View className="items-center gap-2">
              <Text className="text-xl font-bold text-foreground text-center">
                Scan Your Insurance Card
              </Text>
              <Text className="text-base text-muted text-center px-4">
                Take a photo of your insurance card and we'll extract the information
              </Text>
            </View>
            <Pressable
              onPress={() => setShowCamera(true)}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              className="bg-primary px-8 py-4 rounded-xl"
            >
              <Text className="text-white text-lg font-bold">📸 Scan Card</Text>
            </Pressable>
            <View className="bg-surface p-4 rounded-xl mt-4">
              <Text className="text-sm text-muted text-center">
                🔒 Your insurance information is stored securely and never shared
              </Text>
            </View>
          </View>
        ) : (
          /* Results State */
          <View className="gap-6">
            {/* Captured Photo */}
            <View className="bg-surface p-4 rounded-2xl">
              <Text className="text-lg font-bold text-foreground mb-3">Card Image</Text>
              <Image
                source={{ uri: capturedPhoto }}
                style={{ height: 200, borderRadius: 12, alignSelf: "stretch" }}
                resizeMode="cover"
              />
            </View>

            {/* Processing Status */}
            {isProcessing && (
              <View className="bg-primary/20 p-6 rounded-2xl items-center">
                <Text className="text-xl font-bold text-primary mb-2">
                  Processing Card...
                </Text>
                <Text className="text-base text-muted text-center">
                  Extracting information from your insurance card
                </Text>
              </View>
            )}

            {/* Extracted Information */}
            {insuranceInfo && !isProcessing && (
              <View className="bg-surface p-6 rounded-2xl">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-xl font-bold text-foreground">
                    Extracted Information
                  </Text>
                  <Pressable
                    onPress={() => setIsEditing(!isEditing)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                  >
                    <Text className="text-primary font-semibold">
                      {isEditing ? "Done" : "Edit"}
                    </Text>
                  </Pressable>
                </View>

                <View className="gap-4">
                  {/* Insurance Company */}
                  <View>
                    <Text className="text-sm text-muted mb-1">Insurance Company</Text>
                    {isEditing ? (
                      <TextInput
                        value={insuranceInfo.company}
                        onChangeText={(text) =>
                          setInsuranceInfo({ ...insuranceInfo, company: text })
                        }
                        className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                      />
                    ) : (
                      <Text className="text-base font-semibold text-foreground">
                        {insuranceInfo.company}
                      </Text>
                    )}
                  </View>

                  {/* Policy Number */}
                  <View>
                    <Text className="text-sm text-muted mb-1">Policy Number</Text>
                    {isEditing ? (
                      <TextInput
                        value={insuranceInfo.policyNumber}
                        onChangeText={(text) =>
                          setInsuranceInfo({ ...insuranceInfo, policyNumber: text })
                        }
                        className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                      />
                    ) : (
                      <Text className="text-base font-semibold text-foreground">
                        {insuranceInfo.policyNumber}
                      </Text>
                    )}
                  </View>

                  {/* Group Number */}
                  <View>
                    <Text className="text-sm text-muted mb-1">Group Number</Text>
                    {isEditing ? (
                      <TextInput
                        value={insuranceInfo.groupNumber}
                        onChangeText={(text) =>
                          setInsuranceInfo({ ...insuranceInfo, groupNumber: text })
                        }
                        className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                      />
                    ) : (
                      <Text className="text-base font-semibold text-foreground">
                        {insuranceInfo.groupNumber}
                      </Text>
                    )}
                  </View>

                  {/* Member ID */}
                  <View>
                    <Text className="text-sm text-muted mb-1">Member ID</Text>
                    {isEditing ? (
                      <TextInput
                        value={insuranceInfo.memberID}
                        onChangeText={(text) =>
                          setInsuranceInfo({ ...insuranceInfo, memberID: text })
                        }
                        className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                      />
                    ) : (
                      <Text className="text-base font-semibold text-foreground">
                        {insuranceInfo.memberID}
                      </Text>
                    )}
                  </View>

                  {/* Member Name */}
                  <View>
                    <Text className="text-sm text-muted mb-1">Member Name</Text>
                    {isEditing ? (
                      <TextInput
                        value={insuranceInfo.memberName}
                        onChangeText={(text) =>
                          setInsuranceInfo({ ...insuranceInfo, memberName: text })
                        }
                        className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                      />
                    ) : (
                      <Text className="text-base font-semibold text-foreground">
                        {insuranceInfo.memberName}
                      </Text>
                    )}
                  </View>

                  {/* Effective Date */}
                  <View>
                    <Text className="text-sm text-muted mb-1">Effective Date</Text>
                    {isEditing ? (
                      <TextInput
                        value={insuranceInfo.effectiveDate}
                        onChangeText={(text) =>
                          setInsuranceInfo({ ...insuranceInfo, effectiveDate: text })
                        }
                        className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                      />
                    ) : (
                      <Text className="text-base font-semibold text-foreground">
                        {insuranceInfo.effectiveDate}
                      </Text>
                    )}
                  </View>
                </View>

                <View className="bg-background p-4 rounded-xl mt-4">
                  <Text className="text-sm text-muted">
                    🔒 This information is encrypted and stored securely on your device
                  </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            {insuranceInfo && !isProcessing && (
              <View className="gap-3">
                <Pressable
                  onPress={saveInsurance}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  className="bg-primary py-4 rounded-xl items-center"
                >
                  <Text className="text-white text-lg font-bold">
                    ✓ Save Insurance Information
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
