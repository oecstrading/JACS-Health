import { ScrollView, Text, View, TouchableOpacity, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface JointPain {
  joint: string;
  severity: number; // 1-10
  timestamp: string;
}

interface FlareUp {
  id: string;
  startDate: string;
  endDate?: string;
  severity: number;
  triggers: string[];
  notes: string;
}

interface RAData {
  morningStiffnessDuration: number; // minutes
  fatigueLevel: number; // 1-10
  inflammationMarkers: {
    crp: number;
    esr: number;
    date: string;
  }[];
  jointPains: JointPain[];
  flareUps: FlareUp[];
  das28Score?: number;
}

const JOINTS = [
  "Left Shoulder", "Right Shoulder",
  "Left Elbow", "Right Elbow",
  "Left Wrist", "Right Wrist",
  "Left Hand", "Right Hand",
  "Left Hip", "Right Hip",
  "Left Knee", "Right Knee",
  "Left Ankle", "Right Ankle",
  "Left Foot", "Right Foot"
];

export default function RheumatoidArthritisScreen() {
  const colors = useColors();
  const [raData, setRAData] = useState<RAData>({
    morningStiffnessDuration: 0,
    fatigueLevel: 5,
    inflammationMarkers: [],
    jointPains: [],
    flareUps: []
  });
  const [selectedJoint, setSelectedJoint] = useState<string>("");
  const [painSeverity, setPainSeverity] = useState<number>(5);
  const [showJointTracker, setShowJointTracker] = useState(false);
  const [showFlareUpTracker, setShowFlareUpTracker] = useState(false);
  const [flareUpNotes, setFlareUpNotes] = useState("");

  useEffect(() => {
    loadRAData();
  }, []);

  const loadRAData = async () => {
    try {
      const stored = await AsyncStorage.getItem("ra_data");
      if (stored) {
        setRAData(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading RA data:", error);
    }
  };

  const saveRAData = async (data: RAData) => {
    try {
      await AsyncStorage.setItem("ra_data", JSON.stringify(data));
      setRAData(data);
    } catch (error) {
      console.error("Error saving RA data:", error);
    }
  };

  const logJointPain = () => {
    if (!selectedJoint) return;

    const newPain: JointPain = {
      joint: selectedJoint,
      severity: painSeverity,
      timestamp: new Date().toISOString()
    };

    const updated = {
      ...raData,
      jointPains: [newPain, ...raData.jointPains].slice(0, 100)
    };

    saveRAData(updated);
    setShowJointTracker(false);
    setSelectedJoint("");
    setPainSeverity(5);
  };

  const startFlareUp = () => {
    const newFlareUp: FlareUp = {
      id: Date.now().toString(),
      startDate: new Date().toISOString(),
      severity: 5,
      triggers: [],
      notes: flareUpNotes
    };

    const updated = {
      ...raData,
      flareUps: [newFlareUp, ...raData.flareUps]
    };

    saveRAData(updated);
    setShowFlareUpTracker(false);
    setFlareUpNotes("");
  };

  const endFlareUp = (flareUpId: string) => {
    const updated = {
      ...raData,
      flareUps: raData.flareUps.map(f => 
        f.id === flareUpId ? { ...f, endDate: new Date().toISOString() } : f
      )
    };
    saveRAData(updated);
  };

  const updateMorningStiffness = (minutes: number) => {
    saveRAData({ ...raData, morningStiffnessDuration: minutes });
  };

  const updateFatigueLevel = (level: number) => {
    saveRAData({ ...raData, fatigueLevel: level });
  };

  const activeFlareUp = raData.flareUps.find(f => !f.endDate);
  const recentPains = raData.jointPains.slice(0, 5);

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            🦴 Rheumatoid Arthritis
          </Text>
          <Text className="text-base text-muted">
            Track your symptoms, flare-ups, and joint health
          </Text>
        </View>

        {/* Active Flare-Up Alert */}
        {activeFlareUp && (
          <View className="bg-warning/10 border-2 border-warning rounded-xl p-4 mb-4">
            <Text className="text-lg font-semibold text-foreground mb-2">
              ⚠️ Active Flare-Up
            </Text>
            <Text className="text-muted mb-3">
              Started: {new Date(activeFlareUp.startDate).toLocaleDateString()}
            </Text>
            <TouchableOpacity
              onPress={() => endFlareUp(activeFlareUp.id)}
              className="bg-success rounded-lg p-3"
            >
              <Text className="text-white text-center font-semibold">
                Mark Flare-Up as Ended
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Stats */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-surface rounded-xl p-4">
            <Text className="text-muted text-sm mb-1">Morning Stiffness</Text>
            <Text className="text-2xl font-bold text-foreground">
              {raData.morningStiffnessDuration} min
            </Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl p-4">
            <Text className="text-muted text-sm mb-1">Fatigue Level</Text>
            <Text className="text-2xl font-bold text-foreground">
              {raData.fatigueLevel}/10
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="gap-3 mb-6">
          <TouchableOpacity
            onPress={() => setShowJointTracker(!showJointTracker)}
            className="bg-primary rounded-xl p-4 flex-row items-center justify-between"
          >
            <Text className="text-white text-lg font-semibold">
              📍 Log Joint Pain
            </Text>
            <Text className="text-white text-2xl">
              {showJointTracker ? "−" : "+"}
            </Text>
          </TouchableOpacity>

          {!activeFlareUp && (
            <TouchableOpacity
              onPress={() => setShowFlareUpTracker(!showFlareUpTracker)}
              className="bg-warning rounded-xl p-4 flex-row items-center justify-between"
            >
              <Text className="text-white text-lg font-semibold">
                🔥 Start Flare-Up Tracking
              </Text>
              <Text className="text-white text-2xl">
                {showFlareUpTracker ? "−" : "+"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Joint Pain Tracker */}
        {showJointTracker && (
          <View className="bg-surface rounded-xl p-4 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Select Joint
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {JOINTS.map((joint) => (
                <TouchableOpacity
                  key={joint}
                  onPress={() => setSelectedJoint(joint)}
                  className={`mr-2 px-4 py-2 rounded-lg ${
                    selectedJoint === joint ? "bg-primary" : "bg-border"
                  }`}
                >
                  <Text className={selectedJoint === joint ? "text-white" : "text-foreground"}>
                    {joint}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text className="text-lg font-semibold text-foreground mb-2">
              Pain Severity: {painSeverity}/10
            </Text>
            <View className="flex-row justify-between mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setPainSeverity(level)}
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    painSeverity >= level ? "bg-error" : "bg-border"
                  }`}
                >
                  <Text className={painSeverity >= level ? "text-white" : "text-muted"}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={logJointPain}
              className="bg-primary rounded-lg p-3"
              disabled={!selectedJoint}
            >
              <Text className="text-white text-center font-semibold">
                Log Pain
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Flare-Up Tracker */}
        {showFlareUpTracker && (
          <View className="bg-surface rounded-xl p-4 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Record Flare-Up
            </Text>
            <TextInput
              className="bg-background border border-border rounded-lg p-3 text-foreground mb-4"
              placeholder="Notes about triggers or symptoms..."
              placeholderTextColor={colors.muted}
              value={flareUpNotes}
              onChangeText={setFlareUpNotes}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              onPress={startFlareUp}
              className="bg-warning rounded-lg p-3"
            >
              <Text className="text-white text-center font-semibold">
                Start Tracking Flare-Up
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Joint Pains */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-3">
            Recent Joint Pain
          </Text>
          {recentPains.length === 0 ? (
            <View className="bg-surface rounded-xl p-6 items-center">
              <Text className="text-muted text-center">
                No joint pain recorded yet
              </Text>
            </View>
          ) : (
            recentPains.map((pain, index) => (
              <View key={index} className="bg-surface rounded-xl p-4 mb-2">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold">
                      {pain.joint}
                    </Text>
                    <Text className="text-muted text-sm">
                      {new Date(pain.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  <View className="bg-error rounded-full px-3 py-1">
                    <Text className="text-white font-bold">
                      {pain.severity}/10
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Daily Trackers */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-3">
            Daily Tracking
          </Text>

          {/* Morning Stiffness */}
          <View className="bg-surface rounded-xl p-4 mb-3">
            <Text className="text-foreground font-semibold mb-2">
              Morning Stiffness Duration (minutes)
            </Text>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => updateMorningStiffness(Math.max(0, raData.morningStiffnessDuration - 15))}
                className="bg-primary rounded-lg px-4 py-2"
              >
                <Text className="text-white text-xl">−</Text>
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-foreground flex-1 text-center">
                {raData.morningStiffnessDuration}
              </Text>
              <TouchableOpacity
                onPress={() => updateMorningStiffness(raData.morningStiffnessDuration + 15)}
                className="bg-primary rounded-lg px-4 py-2"
              >
                <Text className="text-white text-xl">+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Fatigue Level */}
          <View className="bg-surface rounded-xl p-4">
            <Text className="text-foreground font-semibold mb-2">
              Fatigue Level: {raData.fatigueLevel}/10
            </Text>
            <View className="flex-row justify-between">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => updateFatigueLevel(level)}
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    raData.fatigueLevel >= level ? "bg-warning" : "bg-border"
                  }`}
                >
                  <Text className={raData.fatigueLevel >= level ? "text-white" : "text-muted"}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Flare-Up History */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-foreground mb-3">
            Flare-Up History
          </Text>
          {raData.flareUps.length === 0 ? (
            <View className="bg-surface rounded-xl p-6 items-center">
              <Text className="text-muted text-center">
                No flare-ups recorded
              </Text>
            </View>
          ) : (
            raData.flareUps.slice(0, 5).map((flareUp) => (
              <View key={flareUp.id} className="bg-surface rounded-xl p-4 mb-2">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold">
                      {flareUp.endDate ? "Completed" : "Active"}
                    </Text>
                    <Text className="text-muted text-sm">
                      Started: {new Date(flareUp.startDate).toLocaleDateString()}
                    </Text>
                    {flareUp.endDate && (
                      <Text className="text-muted text-sm">
                        Ended: {new Date(flareUp.endDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  <View className={`rounded-full px-3 py-1 ${flareUp.endDate ? "bg-success" : "bg-warning"}`}>
                    <Text className="text-white text-xs font-bold">
                      {flareUp.endDate ? "✓" : "Active"}
                    </Text>
                  </View>
                </View>
                {flareUp.notes && (
                  <Text className="text-muted text-sm mt-2">
                    {flareUp.notes}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* Educational Info */}
        <View className="bg-primary/10 rounded-xl p-4 mb-6">
          <Text className="text-lg font-semibold text-foreground mb-2">
            💡 RA Management Tips
          </Text>
          <Text className="text-muted mb-2">
            • Track morning stiffness - duration over 30 minutes may indicate active inflammation
          </Text>
          <Text className="text-muted mb-2">
            • Identify flare-up triggers - stress, weather changes, certain foods
          </Text>
          <Text className="text-muted mb-2">
            • Stay active with low-impact exercises - swimming, walking, yoga
          </Text>
          <Text className="text-muted">
            • Maintain a healthy weight to reduce joint stress
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
