import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Image } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import FoodScanService, { type FoodItem, type GlucoseImpactPrediction } from "@/services/foodScanService";

export default function FoodScannerScreen() {
  const colors = useColors();
  const [scannedFood, setScannedFood] = useState<FoodItem | null>(null);
  const [prediction, setPrediction] = useState<GlucoseImpactPrediction | null>(null);
  const [currentGlucose, setCurrentGlucose] = useState("120");
  const [portionSize, setPortionSize] = useState("1.0");
  const [isScanning, setIsScanning] = useState(false);

  const handlePhotoScan = async () => {
    setIsScanning(true);
    try {
      // In production, this would open camera and use AI recognition
      // For now, we'll simulate with mock data
      const mockPhotoUri = "mock://photo.jpg";
      const food = await FoodScanService.recognizeFood(mockPhotoUri);
      setScannedFood(food);
      calculatePrediction(food);
      Alert.alert("Success", `Recognized: ${food.name}`);
    } catch (error) {
      Alert.alert("Error", "Failed to recognize food from photo.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleBarcodeScan = async () => {
    setIsScanning(true);
    try {
      // In production, this would open barcode scanner
      // For now, we'll simulate with mock barcode
      const mockBarcode = "012345678901";
      const food = await FoodScanService.scanBarcode(mockBarcode);
      setScannedFood(food);
      calculatePrediction(food);
      Alert.alert("Success", `Scanned: ${food.name}`);
    } catch (error) {
      Alert.alert("Error", "Failed to scan barcode.");
    } finally {
      setIsScanning(false);
    }
  };

  const calculatePrediction = (food: FoodItem) => {
    const glucose = parseInt(currentGlucose) || 120;
    const portion = parseFloat(portionSize) || 1.0;
    const pred = FoodScanService.predictGlucoseImpact(food, glucose, portion);
    setPrediction(pred);
  };

  const handlePortionChange = (value: string) => {
    setPortionSize(value);
    if (scannedFood) {
      calculatePrediction(scannedFood);
    }
  };

  const handleGlucoseChange = (value: string) => {
    setCurrentGlucose(value);
    if (scannedFood) {
      calculatePrediction(scannedFood);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "#10B981";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#DC2626";
      default:
        return colors.muted;
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">Food Scanner</Text>
            <Text className="text-base text-muted mt-1">
              Scan food to analyze nutrition and glucose impact
            </Text>
          </View>

          {/* Scan Options */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handlePhotoScan}
              disabled={isScanning}
              className="rounded-2xl p-6 items-center"
              style={{ backgroundColor: colors.primary, opacity: isScanning ? 0.6 : 1 }}
            >
              <Text className="text-4xl mb-2">📸</Text>
              <Text className="text-xl font-semibold text-white">
                {isScanning ? "Scanning..." : "Take Photo"}
              </Text>
              <Text className="text-sm text-white mt-1">
                AI-powered food recognition
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBarcodeScan}
              disabled={isScanning}
              className="rounded-2xl p-6 items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-4xl mb-2">🔍</Text>
              <Text className="text-xl font-semibold text-foreground">
                Scan Barcode
              </Text>
              <Text className="text-sm text-muted mt-1">
                For packaged foods
              </Text>
            </TouchableOpacity>
          </View>

          {/* Current Glucose Input */}
          <View
            className="rounded-2xl p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-lg font-semibold text-foreground mb-3">
              Current Glucose Level
            </Text>
            <View className="flex-row items-center gap-3">
              <TextInput
                value={currentGlucose}
                onChangeText={handleGlucoseChange}
                keyboardType="numeric"
                placeholder="120"
                className="flex-1 text-2xl font-bold text-foreground p-4 rounded-xl"
                style={{ backgroundColor: colors.background }}
              />
              <Text className="text-lg text-muted">mg/dL</Text>
            </View>
          </View>

          {/* Scanned Food Results */}
          {scannedFood && (
            <View
              className="rounded-2xl p-6"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-2xl font-bold text-foreground mb-4">
                {scannedFood.name}
              </Text>
              {scannedFood.brand && (
                <Text className="text-base text-muted mb-4">{scannedFood.brand}</Text>
              )}

              {/* Portion Size */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-foreground mb-2">
                  Portion Size
                </Text>
                <View className="flex-row items-center gap-3">
                  <TextInput
                    value={portionSize}
                    onChangeText={handlePortionChange}
                    keyboardType="decimal-pad"
                    placeholder="1.0"
                    className="flex-1 text-xl font-bold text-foreground p-3 rounded-xl"
                    style={{ backgroundColor: colors.background }}
                  />
                  <Text className="text-base text-muted">
                    × {scannedFood.nutrition.servingSize}
                  </Text>
                </View>
              </View>

              {/* Nutritional Info */}
              <View className="gap-2">
                <Text className="text-lg font-semibold text-foreground mb-2">
                  Nutritional Information
                </Text>
                
                <View className="flex-row justify-between">
                  <Text className="text-base text-muted">Calories</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {Math.round(scannedFood.nutrition.calories * parseFloat(portionSize || "1"))}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-base text-muted">Carbohydrates</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {Math.round(scannedFood.nutrition.carbs * parseFloat(portionSize || "1"))}g
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-base text-muted">Protein</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {Math.round(scannedFood.nutrition.protein * parseFloat(portionSize || "1"))}g
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-base text-muted">Fat</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {Math.round(scannedFood.nutrition.fat * parseFloat(portionSize || "1"))}g
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-base text-muted">Fiber</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {Math.round(scannedFood.nutrition.fiber * parseFloat(portionSize || "1"))}g
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-base text-muted">Glycemic Index</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {scannedFood.nutrition.glycemicIndex}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Glucose Impact Prediction */}
          {prediction && (
            <View
              className="rounded-2xl p-6"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-2xl font-bold text-foreground mb-4">
                Glucose Impact Prediction
              </Text>
              
              <View className="gap-4">
                <View>
                  <Text className="text-base text-muted mb-1">Estimated Peak Glucose</Text>
                  <Text className="text-3xl font-bold" style={{ color: colors.primary }}>
                    {prediction.estimatedPeakGlucose} mg/dL
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-base text-muted mb-1">Time to Peak</Text>
                    <Text className="text-xl font-semibold text-foreground">
                      {prediction.timeToPeak} min
                    </Text>
                  </View>
                  
                  <View>
                    <Text className="text-base text-muted mb-1">Duration</Text>
                    <Text className="text-xl font-semibold text-foreground">
                      {prediction.duration} min
                    </Text>
                  </View>
                </View>
                
                <View>
                  <Text className="text-base text-muted mb-1">Recommended Insulin</Text>
                  <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                    {prediction.recommendedInsulin} units
                  </Text>
                </View>
                
                <View className="flex-row items-center gap-2">
                  <Text className="text-base text-muted">Confidence:</Text>
                  <Text
                    className="text-base font-semibold"
                    style={{ color: getConfidenceColor(prediction.confidence) }}
                  >
                    {prediction.confidence.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View
                className="mt-4 p-4 rounded-xl"
                style={{ backgroundColor: colors.background }}
              >
                <Text className="text-sm text-muted">
                  ⚠️ This is an estimate based on average responses. Always consult your
                  healthcare provider for personalized insulin dosing.
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          {scannedFood && (
            <View className="gap-3">
              <TouchableOpacity
                onPress={() => Alert.alert("Coming Soon", "Meal logging will be available soon.")}
                className="rounded-full p-4 items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-lg font-semibold text-white">
                  Log This Meal
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  setScannedFood(null);
                  setPrediction(null);
                }}
                className="rounded-full p-4 items-center"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-lg font-semibold" style={{ color: colors.primary }}>
                  Scan Another Food
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
