import { View, Text, TextInput, Pressable, Switch, Alert } from "react-native";
import { useState, useEffect } from "react";
import { Syringe, Activity, Clock, Droplets } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

interface InsulinDose {
  timestamp: number;
  type: "basal" | "bolus";
  units: number;
  duration: number; // minutes for insulin action
}

interface OmniPodData {
  isActive: boolean;
  podActivatedAt: number | null;
  basalRate: number; // units per hour
  insulinOnBoard: number;
  doses: InsulinDose[];
  totalDailyDose: number;
}

/**
 * Virtual OmniPod Insulin Pump
 * 
 * Features:
 * - Pod activation/deactivation
 * - Basal rate tracking
 * - Bolus dose logging
 * - Insulin on Board (IOB) calculation
 * - Total daily dose tracking
 * - Persistent data storage
 */
export function VirtualOmniPod() {
  const colors = useColors();
  const [podData, setPodData] = useState<OmniPodData>({
    isActive: false,
    podActivatedAt: null,
    basalRate: 1.0,
    insulinOnBoard: 0,
    doses: [],
    totalDailyDose: 0,
  });
  const [bolusInput, setBolusInput] = useState("");
  const [basalRateInput, setBasalRateInput] = useState("1.0");

  useEffect(() => {
    loadPodData();
  }, []);

  useEffect(() => {
    if (podData.isActive) {
      savePodData();
      calculateIOB();
    }
  }, [podData.doses]);

  useEffect(() => {
    // Update IOB every minute
    const interval = setInterval(() => {
      if (podData.isActive) {
        calculateIOB();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [podData.isActive, podData.doses]);

  const loadPodData = async () => {
    try {
      const stored = await AsyncStorage.getItem("virtual_omnipod_data");
      if (stored) {
        const parsed = JSON.parse(stored);
        setPodData(parsed);
        setBasalRateInput(parsed.basalRate.toString());
      }
    } catch (error) {
      console.error("Error loading OmniPod data:", error);
    }
  };

  const savePodData = async () => {
    try {
      await AsyncStorage.setItem("virtual_omnipod_data", JSON.stringify(podData));
      // Also save IOB for Today's Snapshot
      await AsyncStorage.setItem(
        "insulin_on_board",
        JSON.stringify({ currentIOB: podData.insulinOnBoard })
      );
    } catch (error) {
      console.error("Error saving OmniPod data:", error);
    }
  };

  const calculateIOB = () => {
    const now = Date.now();
    const DIA = 240; // Duration of Insulin Action in minutes (4 hours)
    
    let totalIOB = 0;

    podData.doses.forEach((dose) => {
      const minutesSinceDose = (now - dose.timestamp) / (1000 * 60);
      
      if (minutesSinceDose < DIA) {
        // Linear decay model (simplified)
        const remainingPercent = 1 - minutesSinceDose / DIA;
        totalIOB += dose.units * remainingPercent;
      }
    });

    setPodData((prev) => ({ ...prev, insulinOnBoard: Math.max(0, totalIOB) }));
  };

  const handleTogglePod = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!podData.isActive) {
      // Activate pod
      setPodData((prev) => ({
        ...prev,
        isActive: true,
        podActivatedAt: Date.now(),
      }));
    } else {
      // Deactivate pod
      Alert.alert(
        "Deactivate Pod",
        "Are you sure you want to deactivate the virtual OmniPod? This will clear all data.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Deactivate",
            style: "destructive",
            onPress: () => {
              setPodData({
                isActive: false,
                podActivatedAt: null,
                basalRate: 1.0,
                insulinOnBoard: 0,
                doses: [],
                totalDailyDose: 0,
              });
            },
          },
        ]
      );
    }
  };

  const handleLogBolus = () => {
    const units = parseFloat(bolusInput);
    
    if (isNaN(units) || units <= 0 || units > 30) {
      Alert.alert("Invalid Dose", "Please enter a bolus dose between 0.1 and 30 units");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newDose: InsulinDose = {
      timestamp: Date.now(),
      type: "bolus",
      units,
      duration: 240, // 4 hours DIA
    };

    setPodData((prev) => ({
      ...prev,
      doses: [...prev.doses, newDose],
      totalDailyDose: prev.totalDailyDose + units,
    }));

    setBolusInput("");
  };

  const handleUpdateBasalRate = () => {
    const rate = parseFloat(basalRateInput);

    if (isNaN(rate) || rate < 0 || rate > 10) {
      Alert.alert("Invalid Rate", "Please enter a basal rate between 0 and 10 U/hr");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPodData((prev) => ({ ...prev, basalRate: rate }));
  };

  const getPodAge = () => {
    if (!podData.podActivatedAt) return "N/A";
    
    const ageMs = Date.now() - podData.podActivatedAt;
    const hours = Math.floor(ageMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h`;
  };

  return (
    <View className="bg-surface border border-border rounded-xl p-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Syringe size={24} color={colors.primary} />
          <Text className="text-lg font-semibold text-foreground">
            Virtual OmniPod
          </Text>
        </View>
        <Switch
          value={podData.isActive}
          onValueChange={handleTogglePod}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#ffffff"
        />
      </View>

      {/* Status Badge */}
      <View className="mb-4">
        <View
          className={`self-start px-3 py-1 rounded-full ${
            podData.isActive ? "bg-success/20" : "bg-muted/20"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              podData.isActive ? "text-success" : "text-muted"
            }`}
          >
            {podData.isActive ? "● Pod Active" : "○ Pod Inactive"}
          </Text>
        </View>
      </View>

      {podData.isActive && (
        <>
          {/* IOB Display */}
          <View className="bg-background rounded-xl p-4 mb-4">
            <Text className="text-sm text-muted mb-2">Insulin on Board (IOB)</Text>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-4xl font-bold text-primary">
                {podData.insulinOnBoard.toFixed(1)}
              </Text>
              <Text className="text-lg text-muted">U</Text>
            </View>
            <Text className="text-xs text-muted mt-2">
              Active insulin from recent doses
            </Text>
          </View>

          {/* Pod Stats */}
          <View className="flex-row gap-2 mb-4">
            <View className="flex-1 bg-background rounded-xl p-3">
              <View className="flex-row items-center gap-1 mb-1">
                <Clock size={14} color={colors.muted} />
                <Text className="text-xs text-muted">Pod Age</Text>
              </View>
              <Text className="text-lg font-semibold text-foreground">
                {getPodAge()}
              </Text>
            </View>
            <View className="flex-1 bg-background rounded-xl p-3">
              <View className="flex-row items-center gap-1 mb-1">
                <Droplets size={14} color={colors.muted} />
                <Text className="text-xs text-muted">Daily Total</Text>
              </View>
              <Text className="text-lg font-semibold text-foreground">
                {podData.totalDailyDose.toFixed(1)} U
              </Text>
            </View>
          </View>

          {/* Log Bolus */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">
              Log Bolus Dose
            </Text>
            <View className="flex-row gap-2">
              <TextInput
                className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-foreground text-base"
                placeholder="Enter units (e.g., 5.5)"
                placeholderTextColor={colors.muted}
                value={bolusInput}
                onChangeText={setBolusInput}
                keyboardType="decimal-pad"
                returnKeyType="done"
                onSubmitEditing={handleLogBolus}
              />
              <Pressable
                onPress={handleLogBolus}
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

          {/* Basal Rate */}
          <View className="bg-primary/10 border border-primary/30 rounded-xl p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <Activity size={18} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground">
                Basal Rate
              </Text>
            </View>
            <View className="flex-row gap-2 items-end">
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Units per hour</Text>
                <TextInput
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  value={basalRateInput}
                  onChangeText={setBasalRateInput}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
              </View>
              <Pressable
                onPress={handleUpdateBasalRate}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                className="bg-primary/20 px-4 py-2 rounded-lg"
              >
                <Text className="text-primary font-semibold text-sm">
                  Update
                </Text>
              </Pressable>
            </View>
            <Text className="text-xs text-muted mt-2">
              Current: {podData.basalRate} U/hr
            </Text>
          </View>

          {/* Dose History */}
          <View className="mt-4">
            <Text className="text-xs text-center text-muted">
              {podData.doses.length} dose{podData.doses.length !== 1 ? "s" : ""} logged today
            </Text>
          </View>
        </>
      )}

      {!podData.isActive && (
        <View className="py-6">
          <Text className="text-center text-muted leading-relaxed">
            Activate Virtual OmniPod to start logging insulin doses and tracking Insulin on Board (IOB).
          </Text>
        </View>
      )}
    </View>
  );
}
