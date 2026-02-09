import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import WatchComplicationsService, { type ComplicationData } from "@/services/watchComplicationsService";

export default function WatchComplicationsScreen() {
  const colors = useColors();
  const [complicationData, setComplicationData] = useState<ComplicationData | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    loadComplicationData();
    
    // Initialize watch complications service
    WatchComplicationsService.initialize();

    return () => {
      WatchComplicationsService.cleanup();
    };
  }, []);

  const loadComplicationData = async () => {
    try {
      const data = await WatchComplicationsService.getComplicationData();
      setComplicationData(data);
    } catch (error) {
      console.error("Error loading complication data:", error);
    }
  };

  const handleRefresh = async () => {
    await WatchComplicationsService.updateComplications();
    await loadComplicationData();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "rising":
        return "↗️";
      case "falling":
        return "↘️";
      default:
        return "→";
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">Apple Watch</Text>
            <Text className="text-base text-muted mt-1">
              Complications & Quick Actions
            </Text>
          </View>

          {/* Enable/Disable Toggle */}
          <View
            className="rounded-2xl p-5 flex-row items-center justify-between"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground">
                Watch Complications
              </Text>
              <Text className="text-sm text-muted mt-1">
                Display health data on your watch face
              </Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={setIsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {isEnabled && complicationData && (
            <>
              {/* Glucose Complication */}
              <View
                className="rounded-2xl p-6"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-xl font-bold text-foreground mb-4">
                  Glucose Level
                </Text>
                <View className="items-center">
                  <View className="flex-row items-baseline gap-2">
                    <Text className="text-5xl font-bold" style={{ color: colors.primary }}>
                      {complicationData.glucose.value}
                    </Text>
                    <Text className="text-2xl text-muted">
                      {complicationData.glucose.unit}
                    </Text>
                    <Text className="text-3xl">
                      {getTrendIcon(complicationData.glucose.trend)}
                    </Text>
                  </View>
                  <Text className="text-base text-muted mt-2">
                    {new Date(complicationData.glucose.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              </View>

              {/* Medication Complication */}
              <View
                className="rounded-2xl p-6"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-xl font-bold text-foreground mb-4">
                  Next Medication
                </Text>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-foreground">
                    {complicationData.medication.medicationName || "No medications"}
                  </Text>
                  {complicationData.medication.nextDose && (
                    <>
                      <Text className="text-3xl font-bold mt-2" style={{ color: colors.primary }}>
                        {complicationData.medication.nextDose}
                      </Text>
                      <Text className="text-base text-muted mt-1">
                        in {complicationData.medication.timeUntil}
                      </Text>
                    </>
                  )}
                </View>
              </View>

              {/* Quick Stats Complication */}
              <View
                className="rounded-2xl p-6"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-xl font-bold text-foreground mb-4">
                  Today's Activity
                </Text>
                <View className="gap-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base text-muted">Steps</Text>
                    <Text className="text-2xl font-bold text-foreground">
                      {complicationData.quickStats.stepsToday.toLocaleString()}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base text-muted">Medications Taken</Text>
                    <Text className="text-2xl font-bold text-foreground">
                      {complicationData.quickStats.medicationsTaken}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base text-muted">Vitals Logged</Text>
                    <Text className="text-2xl font-bold text-foreground">
                      {complicationData.quickStats.vitalsLogged}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Available Complications */}
              <View
                className="rounded-2xl p-6"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-xl font-bold text-foreground mb-4">
                  Available Complications
                </Text>
                <View className="gap-3">
                  {[
                    { name: "Circular", description: "Small circular display" },
                    { name: "Modular", description: "Large rectangular display" },
                    { name: "Infograph", description: "Corner or center display" },
                    { name: "Graphic Corner", description: "Curved corner display" },
                    { name: "Graphic Circular", description: "Full-circle display" },
                  ].map((comp) => (
                    <View key={comp.name} className="flex-row items-center gap-3">
                      <View
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors.primary }}
                      />
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          {comp.name}
                        </Text>
                        <Text className="text-sm text-muted">{comp.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Refresh Button */}
              <TouchableOpacity
                onPress={handleRefresh}
                className="rounded-full p-4 items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-lg font-semibold text-white">
                  Refresh Complications
                </Text>
              </TouchableOpacity>

              {/* Setup Instructions */}
              <View
                className="rounded-2xl p-6"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-lg font-bold text-foreground mb-3">
                  Setup Instructions
                </Text>
                <View className="gap-2">
                  <Text className="text-base text-muted">
                    1. Open the Watch app on your iPhone
                  </Text>
                  <Text className="text-base text-muted">
                    2. Tap "My Watch" tab
                  </Text>
                  <Text className="text-base text-muted">
                    3. Tap "Complications"
                  </Text>
                  <Text className="text-base text-muted">
                    4. Select "HealthMate" from the list
                  </Text>
                  <Text className="text-base text-muted">
                    5. Choose which complications to display
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
