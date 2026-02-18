import { ScrollView, Text, View, TouchableOpacity, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface GlucoseReading {
  value: number; // mg/dL
  timestamp: string;
  context: "fasting" | "before-meal" | "after-meal" | "bedtime" | "other";
}

interface InsulinDose {
  type: "basal" | "bolus";
  units: number;
  timestamp: string;
  notes?: string;
}

interface Meal {
  name: string;
  carbs: number; // grams
  timestamp: string;
}

interface DiabetesData {
  glucoseReadings: GlucoseReading[];
  insulinDoses: InsulinDose[];
  meals: Meal[];
  a1c: number[];
  insulinToCarbRatio: number; // 1 unit per X grams
  correctionFactor: number; // 1 unit lowers glucose by X mg/dL
  targetGlucose: number; // mg/dL
}

const GLUCOSE_CONTEXTS = [
  { value: "fasting", label: "Fasting" },
  { value: "before-meal", label: "Before Meal" },
  { value: "after-meal", label: "After Meal" },
  { value: "bedtime", label: "Bedtime" },
  { value: "other", label: "Other" }
];

export default function Type1DiabetesScreen() {
  const colors = useColors();
  const [diabetesData, setDiabetesData] = useState<DiabetesData>({
    glucoseReadings: [],
    insulinDoses: [],
    meals: [],
    a1c: [],
    insulinToCarbRatio: 15,
    correctionFactor: 50,
    targetGlucose: 100
  });

  const [showGlucoseLogger, setShowGlucoseLogger] = useState(false);
  const [glucoseValue, setGlucoseValue] = useState("");
  const [glucoseContext, setGlucoseContext] = useState<string>("before-meal");

  const [showInsulinLogger, setShowInsulinLogger] = useState(false);
  const [insulinUnits, setInsulinUnits] = useState("");
  const [insulinType, setInsulinType] = useState<"basal" | "bolus">("bolus");

  const [showMealLogger, setShowMealLogger] = useState(false);
  const [mealName, setMealName] = useState("");
  const [mealCarbs, setMealCarbs] = useState("");

  useEffect(() => {
    loadDiabetesData();
  }, []);

  const loadDiabetesData = async () => {
    try {
      const stored = await AsyncStorage.getItem("diabetes_data");
      if (stored) {
        setDiabetesData(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading diabetes data:", error);
    }
  };

  const saveDiabetesData = async (data: DiabetesData) => {
    try {
      await AsyncStorage.setItem("diabetes_data", JSON.stringify(data));
      setDiabetesData(data);
    } catch (error) {
      console.error("Error saving diabetes data:", error);
    }
  };

  const logGlucose = () => {
    const value = parseFloat(glucoseValue);
    if (isNaN(value) || value <= 0) return;

    const newReading: GlucoseReading = {
      value,
      timestamp: new Date().toISOString(),
      context: glucoseContext as any
    };

    const updated = {
      ...diabetesData,
      glucoseReadings: [newReading, ...diabetesData.glucoseReadings].slice(0, 200)
    };

    saveDiabetesData(updated);
    setShowGlucoseLogger(false);
    setGlucoseValue("");
  };

  const logInsulin = () => {
    const units = parseFloat(insulinUnits);
    if (isNaN(units) || units <= 0) return;

    const newDose: InsulinDose = {
      type: insulinType,
      units,
      timestamp: new Date().toISOString()
    };

    const updated = {
      ...diabetesData,
      insulinDoses: [newDose, ...diabetesData.insulinDoses].slice(0, 200)
    };

    saveDiabetesData(updated);
    setShowInsulinLogger(false);
    setInsulinUnits("");
  };

  const logMeal = () => {
    const carbs = parseFloat(mealCarbs);
    if (isNaN(carbs) || carbs <= 0 || !mealName) return;

    const newMeal: Meal = {
      name: mealName,
      carbs,
      timestamp: new Date().toISOString()
    };

    const updated = {
      ...diabetesData,
      meals: [newMeal, ...diabetesData.meals].slice(0, 100)
    };

    saveDiabetesData(updated);
    setShowMealLogger(false);
    setMealName("");
    setMealCarbs("");
  };

  const calculateBolusInsulin = (carbs: number, currentGlucose?: number) => {
    const carbInsulin = carbs / diabetesData.insulinToCarbRatio;
    let correctionInsulin = 0;

    if (currentGlucose && currentGlucose > diabetesData.targetGlucose) {
      correctionInsulin = (currentGlucose - diabetesData.targetGlucose) / diabetesData.correctionFactor;
    }

    return Math.round((carbInsulin + correctionInsulin) * 10) / 10;
  };

  const getGlucoseStatus = (value: number) => {
    if (value < 70) return { status: "Low", color: "bg-error", textColor: "text-error" };
    if (value < 100) return { status: "Normal", color: "bg-success", textColor: "text-success" };
    if (value < 140) return { status: "Elevated", color: "bg-warning", textColor: "text-warning" };
    return { status: "High", color: "bg-error", textColor: "text-error" };
  };

  const latestGlucose = diabetesData.glucoseReadings[0];
  const todayInsulin = diabetesData.insulinDoses
    .filter(d => new Date(d.timestamp).toDateString() === new Date().toDateString())
    .reduce((sum, d) => sum + d.units, 0);

  const avgGlucose = diabetesData.glucoseReadings.length > 0
    ? Math.round(diabetesData.glucoseReadings.slice(0, 10).reduce((sum, r) => sum + r.value, 0) / Math.min(10, diabetesData.glucoseReadings.length))
    : 0;

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            💉 Type 1 Diabetes
          </Text>
          <Text className="text-base text-muted">
            Track glucose, insulin, and carbohydrates
          </Text>
        </View>

        {/* Current Glucose Alert */}
        {latestGlucose && (
          <View className={`${getGlucoseStatus(latestGlucose.value).color}/10 border-2 ${getGlucoseStatus(latestGlucose.value).color.replace('bg-', 'border-')} rounded-xl p-4 mb-4`}>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Current Glucose: {latestGlucose.value} mg/dL
            </Text>
            <Text className={`text-base font-bold ${getGlucoseStatus(latestGlucose.value).textColor}`}>
              Status: {getGlucoseStatus(latestGlucose.value).status}
            </Text>
            <Text className="text-muted text-sm mt-1">
              {new Date(latestGlucose.timestamp).toLocaleString()}
            </Text>
          </View>
        )}

        {/* Quick Stats */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-surface rounded-xl p-4">
            <Text className="text-muted text-sm mb-1">Avg Glucose</Text>
            <Text className="text-2xl font-bold text-foreground">
              {avgGlucose} mg/dL
            </Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl p-4">
            <Text className="text-muted text-sm mb-1">Today's Insulin</Text>
            <Text className="text-2xl font-bold text-foreground">
              {todayInsulin.toFixed(1)} U
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="gap-3 mb-6">
          <TouchableOpacity
            onPress={() => setShowGlucoseLogger(!showGlucoseLogger)}
            className="bg-primary rounded-xl p-4 flex-row items-center justify-between"
          >
            <Text className="text-white text-lg font-semibold">
              🩸 Log Blood Glucose
            </Text>
            <Text className="text-white text-2xl">
              {showGlucoseLogger ? "−" : "+"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowInsulinLogger(!showInsulinLogger)}
            className="bg-secondary rounded-xl p-4 flex-row items-center justify-between"
          >
            <Text className="text-white text-lg font-semibold">
              💉 Log Insulin Dose
            </Text>
            <Text className="text-white text-2xl">
              {showInsulinLogger ? "−" : "+"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowMealLogger(!showMealLogger)}
            className="bg-success rounded-xl p-4 flex-row items-center justify-between"
          >
            <Text className="text-white text-lg font-semibold">
              🍽️ Log Meal & Carbs
            </Text>
            <Text className="text-white text-2xl">
              {showMealLogger ? "−" : "+"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Glucose Logger */}
        {showGlucoseLogger && (
          <View className="bg-surface rounded-xl p-4 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Blood Glucose Reading
            </Text>
            
            <TextInput
              className="bg-background border border-border rounded-lg p-3 text-2xl font-bold text-foreground mb-4 text-center"
              placeholder="Enter glucose (mg/dL)"
              placeholderTextColor={colors.muted}
              value={glucoseValue}
              onChangeText={setGlucoseValue}
              keyboardType="numeric"
            />

            <Text className="text-foreground font-semibold mb-2">Context:</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {GLUCOSE_CONTEXTS.map((ctx) => (
                <TouchableOpacity
                  key={ctx.value}
                  onPress={() => setGlucoseContext(ctx.value)}
                  className={`px-4 py-2 rounded-lg ${
                    glucoseContext === ctx.value ? "bg-primary" : "bg-border"
                  }`}
                >
                  <Text className={glucoseContext === ctx.value ? "text-white" : "text-foreground"}>
                    {ctx.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={logGlucose}
              className="bg-primary rounded-lg p-3"
            >
              <Text className="text-white text-center font-semibold">
                Log Glucose
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Insulin Logger */}
        {showInsulinLogger && (
          <View className="bg-surface rounded-xl p-4 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Insulin Dose
            </Text>

            <View className="flex-row gap-2 mb-4">
              <TouchableOpacity
                onPress={() => setInsulinType("bolus")}
                className={`flex-1 py-3 rounded-lg ${
                  insulinType === "bolus" ? "bg-primary" : "bg-border"
                }`}
              >
                <Text className={`text-center font-semibold ${insulinType === "bolus" ? "text-white" : "text-foreground"}`}>
                  Bolus (Meal)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setInsulinType("basal")}
                className={`flex-1 py-3 rounded-lg ${
                  insulinType === "basal" ? "bg-primary" : "bg-border"
                }`}
              >
                <Text className={`text-center font-semibold ${insulinType === "basal" ? "text-white" : "text-foreground"}`}>
                  Basal (Long-acting)
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              className="bg-background border border-border rounded-lg p-3 text-2xl font-bold text-foreground mb-4 text-center"
              placeholder="Enter units"
              placeholderTextColor={colors.muted}
              value={insulinUnits}
              onChangeText={setInsulinUnits}
              keyboardType="decimal-pad"
            />

            <TouchableOpacity
              onPress={logInsulin}
              className="bg-secondary rounded-lg p-3"
            >
              <Text className="text-white text-center font-semibold">
                Log Insulin
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Meal Logger */}
        {showMealLogger && (
          <View className="bg-surface rounded-xl p-4 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Log Meal
            </Text>

            <TextInput
              className="bg-background border border-border rounded-lg p-3 text-foreground mb-3"
              placeholder="Meal name (e.g., Breakfast)"
              placeholderTextColor={colors.muted}
              value={mealName}
              onChangeText={setMealName}
            />

            <TextInput
              className="bg-background border border-border rounded-lg p-3 text-2xl font-bold text-foreground mb-4 text-center"
              placeholder="Carbs (grams)"
              placeholderTextColor={colors.muted}
              value={mealCarbs}
              onChangeText={setMealCarbs}
              keyboardType="numeric"
            />

            {mealCarbs && !isNaN(parseFloat(mealCarbs)) && (
              <View className="bg-primary/10 rounded-lg p-3 mb-4">
                <Text className="text-foreground font-semibold">
                  💡 Suggested Bolus Insulin:
                </Text>
                <Text className="text-2xl font-bold text-primary">
                  {calculateBolusInsulin(parseFloat(mealCarbs), latestGlucose?.value)} units
                </Text>
                <Text className="text-muted text-sm mt-1">
                  Based on {diabetesData.insulinToCarbRatio}g carbs per unit
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={logMeal}
              className="bg-success rounded-lg p-3"
            >
              <Text className="text-white text-center font-semibold">
                Log Meal
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Glucose Readings */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-3">
            Recent Glucose Readings
          </Text>
          {diabetesData.glucoseReadings.length === 0 ? (
            <View className="bg-surface rounded-xl p-6 items-center">
              <Text className="text-muted text-center">
                No glucose readings yet
              </Text>
            </View>
          ) : (
            diabetesData.glucoseReadings.slice(0, 5).map((reading, index) => {
              const status = getGlucoseStatus(reading.value);
              return (
                <View key={index} className="bg-surface rounded-xl p-4 mb-2">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className="text-2xl font-bold text-foreground">
                        {reading.value} mg/dL
                      </Text>
                      <Text className="text-muted text-sm">
                        {reading.context.replace("-", " ")} • {new Date(reading.timestamp).toLocaleString()}
                      </Text>
                    </View>
                    <View className={`${status.color} rounded-full px-3 py-1`}>
                      <Text className="text-white font-bold text-sm">
                        {status.status}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Recent Insulin Doses */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-3">
            Recent Insulin Doses
          </Text>
          {diabetesData.insulinDoses.length === 0 ? (
            <View className="bg-surface rounded-xl p-6 items-center">
              <Text className="text-muted text-center">
                No insulin doses logged yet
              </Text>
            </View>
          ) : (
            diabetesData.insulinDoses.slice(0, 5).map((dose, index) => (
              <View key={index} className="bg-surface rounded-xl p-4 mb-2">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold">
                      {dose.type === "bolus" ? "Bolus (Meal)" : "Basal (Long-acting)"}
                    </Text>
                    <Text className="text-muted text-sm">
                      {new Date(dose.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  <View className="bg-secondary rounded-full px-3 py-1">
                    <Text className="text-white font-bold">
                      {dose.units} U
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Insulin Calculator Settings */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-3">
            Insulin Calculator Settings
          </Text>
          <View className="bg-surface rounded-xl p-4">
            <View className="mb-3">
              <Text className="text-foreground font-semibold mb-1">
                Insulin-to-Carb Ratio
              </Text>
              <Text className="text-muted text-sm">
                1 unit of insulin per {diabetesData.insulinToCarbRatio}g carbs
              </Text>
            </View>
            <View className="mb-3">
              <Text className="text-foreground font-semibold mb-1">
                Correction Factor
              </Text>
              <Text className="text-muted text-sm">
                1 unit lowers glucose by {diabetesData.correctionFactor} mg/dL
              </Text>
            </View>
            <View>
              <Text className="text-foreground font-semibold mb-1">
                Target Glucose
              </Text>
              <Text className="text-muted text-sm">
                {diabetesData.targetGlucose} mg/dL
              </Text>
            </View>
          </View>
        </View>

        {/* Educational Info */}
        <View className="bg-primary/10 rounded-xl p-4 mb-6">
          <Text className="text-lg font-semibold text-foreground mb-2">
            💡 Type 1 Diabetes Management Tips
          </Text>
          <Text className="text-muted mb-2">
            • Check glucose before meals and at bedtime
          </Text>
          <Text className="text-muted mb-2">
            • Count carbohydrates accurately for insulin dosing
          </Text>
          <Text className="text-muted mb-2">
            • Always carry fast-acting carbs for low blood sugar
          </Text>
          <Text className="text-muted mb-2">
            • Exercise can lower blood sugar - check before and after
          </Text>
          <Text className="text-muted">
            • Keep your A1C below 7% for optimal health
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
