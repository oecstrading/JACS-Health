import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Image, ActivityIndicator, Platform } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import FoodScanService, { type FoodItem, type GlucoseImpactPrediction } from "@/services/foodScanService";
import {
  searchFoodDatabase,
  recognizeFoodFromCamera,
  getCarbsForPortion,
  type AIFoodRecognitionResult,
} from "@/services/foodRecognition";
import { offlineStorage } from "@/services/offlineStorage";

const SERVER_URL = "http://127.0.0.1:3000";

export default function FoodScannerScreen() {
  const colors = useColors();
  const [scannedFood, setScannedFood] = useState<FoodItem | null>(null);
  const [prediction, setPrediction] = useState<GlucoseImpactPrediction | null>(null);
  const [currentGlucose, setCurrentGlucose] = useState("120");
  const [portionSize, setPortionSize] = useState("1.0");
  const [isScanning, setIsScanning] = useState(false);
  const [dbQuery, setDbQuery] = useState("");
  const [dbResults, setDbResults] = useState<ReturnType<typeof searchFoodDatabase>>([]);
  const [aiResult, setAiResult] = useState<AIFoodRecognitionResult | null>(null);
  const [savedMsg, setSavedMsg] = useState("");

  const handlePhotoScan = async (source: "camera" | "library" = "camera") => {
    setIsScanning(true);
    setAiResult(null);
    try {
      const result = await recognizeFoodFromCamera(SERVER_URL, source);
      if (result) {
        setAiResult(result);
        // Also search our offline DB for the recognized food
        if (result.recognizedFood && !result.recognizedFood.includes("offline")) {
          const dbMatches = searchFoodDatabase(result.recognizedFood, 3);
          setDbResults(dbMatches);
          setDbQuery(result.recognizedFood);
        }
        Alert.alert("Recognized", `${result.recognizedFood} (~${result.estimatedCarbsG}g carbs)`);
      }
    } catch {
      Alert.alert("Error", "Failed to recognize food from photo.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleDbSearch = (text: string) => {
    setDbQuery(text);
    if (text.length >= 2) {
      setDbResults(searchFoodDatabase(text));
    } else {
      setDbResults([]);
    }
  };

  const handleBarcodeScan = async () => {
    setIsScanning(true);
    try {
      const mockBarcode = "012345678901";
      const food = await FoodScanService.scanBarcode(mockBarcode);
      setScannedFood(food);
      calculatePrediction(food);
      Alert.alert("Success", `Scanned: ${food.name}`);
    } catch {
      Alert.alert("Error", "Failed to scan barcode.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleLogToOfflineStorage = async () => {
    if (!scannedFood) return;
    const portion = parseFloat(portionSize) || 1;
    const carbs = Math.round(scannedFood.nutrition.carbs * portion);
    const calories = Math.round(scannedFood.nutrition.calories * portion);
    const protein = Math.round(scannedFood.nutrition.protein * portion);
    const fat = Math.round(scannedFood.nutrition.fat * portion);
    try {
      await offlineStorage.saveMealEntry(scannedFood.name, carbs, protein, fat, calories, "scanner");
      setSavedMsg(`✓ Logged ${carbs}g carbs`);
      setTimeout(() => setSavedMsg(""), 3000);
    } catch {
      Alert.alert("Error", "Failed to save meal.");
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
              onPress={() => handlePhotoScan("camera")}
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

          {/* Offline DB Search */}
          <View
            className="rounded-2xl p-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-base font-semibold text-foreground mb-3">Search Food Database (Offline)</Text>
            <View
              className="flex-row items-center rounded-xl px-3"
              style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}
            >
              <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
              <TextInput
                value={dbQuery}
                onChangeText={handleDbSearch}
                placeholder="e.g. banana, rice, pizza..."
                placeholderTextColor={colors.muted}
                className="flex-1 py-3 text-foreground"
                returnKeyType="search"
              />
            </View>
            {dbResults.length > 0 && (
              <View className="mt-2 gap-1">
                {dbResults.map((r) => (
                  <TouchableOpacity
                    key={r.item.id}
                    onPress={() => {
                      setScannedFood({
                        id: r.item.id,
                        name: r.item.name,
                        brand: r.item.category,
                        nutrition: {
                          calories: r.item.caloriesPer100g,
                          carbs: r.item.carbsPer100g,
                          protein: r.item.proteinPer100g,
                          fat: r.item.fatPer100g,
                          fiber: 0,
                          glycemicIndex: r.item.glycemicIndex,
                          servingSize: r.item.servingLabel,
                        },
                      } as any);
                      setPortionSize("1.0");
                      setDbResults([]);
                    }}
                    className="flex-row justify-between items-center p-3 rounded-xl"
                    style={{ backgroundColor: colors.background }}
                  >
                    <View>
                      <Text className="text-sm font-semibold text-foreground">{r.item.name}</Text>
                      <Text className="text-xs text-muted">{r.item.servingLabel} · GI {r.item.glycemicIndex}</Text>
                    </View>
                    <Text className="text-base font-bold" style={{ color: colors.primary }}>{r.servingCarbs}g carbs</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Action Buttons */}
          {scannedFood && (
            <View className="gap-3">
              <TouchableOpacity
                onPress={handleLogToOfflineStorage}
                className="rounded-full p-4 items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-lg font-semibold text-white">Log This Meal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setScannedFood(null); setPrediction(null); setAiResult(null); }}
                className="rounded-full p-4 items-center"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-lg font-semibold" style={{ color: colors.primary }}>Scan Another Food</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Success Banner */}
          {savedMsg ? (
            <View
              className="rounded-2xl p-4 items-center"
              style={{ backgroundColor: "#22C55E20", borderWidth: 1, borderColor: "#22C55E" }}
            >
              <Text style={{ color: "#22C55E", fontWeight: "700" }}>{savedMsg}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
