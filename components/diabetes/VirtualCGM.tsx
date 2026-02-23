import { View, Text, TextInput, Pressable, Switch, Alert } from "react-native";
import { useState, useEffect } from "react";
import { Activity, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

interface CGMData {
  isActive: boolean;
  latestGlucose: number;
  trend: "up" | "down" | "stable";
  lowThreshold: number;
  highThreshold: number;
  readings: Array<{ timestamp: number; value: number }>;
}

/**
 * Virtual CGM (Continuous Glucose Monitor)
 * 
 * Features:
 * - Manual glucose input
 * - Configurable low/high alert thresholds
 * - Trend indicators (up/down/stable)
 * - Persistent data storage
 * - Alert notifications for out-of-range values
 */
export function VirtualCGM() {
  const colors = useColors();
  const [cgmData, setCGMData] = useState<CGMData>({
    isActive: false,
    latestGlucose: 120,
    trend: "stable",
    lowThreshold: 70,
    highThreshold: 180,
    readings: [],
  });
  const [glucoseInput, setGlucoseInput] = useState("");
  const [lowThresholdInput, setLowThresholdInput] = useState("70");
  const [highThresholdInput, setHighThresholdInput] = useState("180");

  useEffect(() => {
    loadCGMData();
  }, []);

  useEffect(() => {
    if (cgmData.isActive) {
      saveCGMData();
      checkAlerts();
    }
  }, [cgmData]);

  const loadCGMData = async () => {
    try {
      const stored = await AsyncStorage.getItem("virtual_cgm_data");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCGMData(parsed);
        setLowThresholdInput(parsed.lowThreshold.toString());
        setHighThresholdInput(parsed.highThreshold.toString());
      }
    } catch (error) {
      console.error("Error loading CGM data:", error);
    }
  };

  const saveCGMData = async () => {
    try {
      await AsyncStorage.setItem("virtual_cgm_data", JSON.stringify(cgmData));
    } catch (error) {
      console.error("Error saving CGM data:", error);
    }
  };

  const checkAlerts = () => {
    const { latestGlucose, lowThreshold, highThreshold, isActive } = cgmData;
    
    if (!isActive) return;

    if (latestGlucose < lowThreshold) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      // In production, trigger push notification
    } else if (latestGlucose > highThreshold) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      // In production, trigger push notification
    }
  };

  const handleToggleCGM = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCGMData((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleAddReading = () => {
    const value = parseFloat(glucoseInput);
    
    if (isNaN(value) || value < 20 || value > 600) {
      Alert.alert("Invalid Reading", "Please enter a glucose value between 20 and 600 mg/dL");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newReading = {
      timestamp: Date.now(),
      value,
    };

    // Calculate trend
    let trend: "up" | "down" | "stable" = "stable";
    if (cgmData.readings.length > 0) {
      const lastReading = cgmData.readings[cgmData.readings.length - 1];
      const diff = value - lastReading.value;
      if (diff > 10) trend = "up";
      else if (diff < -10) trend = "down";
    }

    setCGMData((prev) => ({
      ...prev,
      latestGlucose: value,
      trend,
      readings: [...prev.readings.slice(-99), newReading], // Keep last 100 readings
    }));

    setGlucoseInput("");
  };

  const handleUpdateThresholds = () => {
    const low = parseFloat(lowThresholdInput);
    const high = parseFloat(highThresholdInput);

    if (isNaN(low) || isNaN(high) || low >= high) {
      Alert.alert("Invalid Thresholds", "Low threshold must be less than high threshold");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCGMData((prev) => ({
      ...prev,
      lowThreshold: low,
      highThreshold: high,
    }));
  };

  const getGlucoseColor = (value: number) => {
    if (value < cgmData.lowThreshold) return colors.error;
    if (value > cgmData.highThreshold) return colors.warning;
    return colors.success;
  };

  const getTrendIcon = () => {
    switch (cgmData.trend) {
      case "up":
        return TrendingUp;
      case "down":
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <View className="bg-surface border border-border rounded-xl p-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Activity size={24} color={colors.primary} />
          <Text className="text-lg font-semibold text-foreground">
            Virtual CGM
          </Text>
        </View>
        <Switch
          value={cgmData.isActive}
          onValueChange={handleToggleCGM}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#ffffff"
        />
      </View>

      {/* Status Badge */}
      <View className="mb-4">
        <View
          className={`self-start px-3 py-1 rounded-full ${
            cgmData.isActive ? "bg-success/20" : "bg-muted/20"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              cgmData.isActive ? "text-success" : "text-muted"
            }`}
          >
            {cgmData.isActive ? "● Active" : "○ Inactive"}
          </Text>
        </View>
      </View>

      {cgmData.isActive && (
        <>
          {/* Current Reading */}
          <View className="bg-background rounded-xl p-4 mb-4">
            <Text className="text-sm text-muted mb-2">Current Glucose</Text>
            <View className="flex-row items-baseline gap-2">
              <Text
                className="text-4xl font-bold"
                style={{ color: getGlucoseColor(cgmData.latestGlucose) }}
              >
                {cgmData.latestGlucose}
              </Text>
              <Text className="text-lg text-muted">mg/dL</Text>
              <TrendIcon
                size={24}
                color={getGlucoseColor(cgmData.latestGlucose)}
              />
            </View>
            <Text className="text-xs text-muted mt-2">
              {cgmData.readings.length > 0
                ? `Last updated ${new Date(
                    cgmData.readings[cgmData.readings.length - 1].timestamp
                  ).toLocaleTimeString()}`
                : "No readings yet"}
            </Text>
          </View>

          {/* Add Reading */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">
              Log Glucose Reading
            </Text>
            <View className="flex-row gap-2">
              <TextInput
                className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-foreground text-base"
                placeholder="Enter glucose (mg/dL)"
                placeholderTextColor={colors.muted}
                value={glucoseInput}
                onChangeText={setGlucoseInput}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleAddReading}
              />
              <Pressable
                onPress={handleAddReading}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
                className="bg-primary px-6 rounded-xl items-center justify-center"
              >
                <Text className="text-white font-semibold">Log</Text>
              </Pressable>
            </View>
          </View>

          {/* Alert Thresholds */}
          <View className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-4">
            <View className="flex-row items-center gap-2 mb-3">
              <AlertCircle size={18} color={colors.warning} />
              <Text className="text-sm font-semibold text-foreground">
                Alert Thresholds
              </Text>
            </View>
            <View className="flex-row gap-2 mb-2">
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Low (mg/dL)</Text>
                <TextInput
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  value={lowThresholdInput}
                  onChangeText={setLowThresholdInput}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">High (mg/dL)</Text>
                <TextInput
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  value={highThresholdInput}
                  onChangeText={setHighThresholdInput}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
            </View>
            <Pressable
              onPress={handleUpdateThresholds}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              className="bg-warning/20 py-2 rounded-lg mt-2"
            >
              <Text className="text-center text-warning font-semibold text-sm">
                Update Thresholds
              </Text>
            </Pressable>
          </View>

          {/* Reading Count */}
          <Text className="text-xs text-center text-muted">
            {cgmData.readings.length} reading{cgmData.readings.length !== 1 ? "s" : ""} logged
          </Text>
        </>
      )}

      {!cgmData.isActive && (
        <View className="py-6">
          <Text className="text-center text-muted leading-relaxed">
            Activate Virtual CGM to start logging glucose readings and receive alerts for out-of-range values.
          </Text>
        </View>
      )}
    </View>
  );
}
