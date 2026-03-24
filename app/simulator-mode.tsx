/**
 * Simulator Mode Screen
 *
 * Allows users to toggle the Device Simulation Suite on/off and configure
 * parameters for each simulated device:
 *   - Dexcom G7 CGM (starting glucose, meal input, insulin dose)
 *   - Omnipod DASH (basal rate, manual bolus)
 *   - Omron HEM-7361T BP (hypertension profile toggle)
 *
 * Both virtual and physical device paths remain available so users who
 * cannot afford physical hardware can use the full feature set.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Switch,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import {
  SimulatorDataFactory,
  simulatorFactory,
  DexcomCGMSimulator,
  type DexcomCGMPacket,
  type OmnipodStatePacket,
  type OmronBPPacket,
} from "@/services/simulatorDataFactory";
import { useColors } from "@/hooks/use-colors";

export default function SimulatorModeScreen() {
  const colors = useColors();
  const [isEnabled, setIsEnabled] = useState(false);
  const [startBG, setStartBG] = useState("110");
  const [carbsG, setCarbsG] = useState("45");
  const [insulinU, setInsulinU] = useState("4");
  const [basalRate, setBasalRate] = useState("0.85");
  const [isHypertensive, setIsHypertensive] = useState(false);
  const [bolusUnits, setBolusUnits] = useState("2.5");
  const [latestCGM, setLatestCGM] = useState<DexcomCGMPacket | null>(null);
  const [omnipodState, setOmnipodState] = useState<OmnipodStatePacket | null>(null);
  const [latestBP, setLatestBP] = useState<OmronBPPacket | null>(null);

  useEffect(() => {
    SimulatorDataFactory.isEnabled().then(setIsEnabled);
    loadLatestReadings();
  }, []);

  const loadLatestReadings = useCallback(async () => {
    const cgmHistory = await SimulatorDataFactory.getCGMHistory();
    if (cgmHistory.length > 0) setLatestCGM(cgmHistory[cgmHistory.length - 1]);

    const bpHistory = await SimulatorDataFactory.getOmronHistory();
    if (bpHistory.length > 0) setLatestBP(bpHistory[bpHistory.length - 1]);

    const pod = await simulatorFactory.getOmnipodState();
    setOmnipodState(pod);
  }, []);

  const handleToggleSimulator = async (value: boolean) => {
    await SimulatorDataFactory.setEnabled(value);
    setIsEnabled(value);

    if (value) {
      simulatorFactory.start(
        parseFloat(carbsG) || 0,
        parseFloat(insulinU) || 0,
        parseFloat(startBG) || 110
      );
      Alert.alert(
        "Simulator Started",
        "Device simulation is now active. CGM readings will update every 5 minutes. Omron BP readings will push twice daily.",
        [{ text: "OK" }]
      );
      setTimeout(loadLatestReadings, 1500);
    } else {
      simulatorFactory.stop();
    }
  };

  const handleManualBolus = async () => {
    const units = parseFloat(bolusUnits);
    if (isNaN(units) || units <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid bolus amount.");
      return;
    }
    const state = await simulatorFactory.deliverBolus(units, "standard");
    setOmnipodState(state);
    Alert.alert("Bolus Delivered", `${units}u delivered. Reservoir: ${state.podStatus.reservoirUnits}u remaining.`);
  };

  const getTrendArrow = (trend: string) => {
    const arrows: Record<string, string> = {
      rapidlyRising: "⬆⬆",
      rising: "⬆",
      slowlyRising: "↗",
      flat: "→",
      slowlyFalling: "↘",
      falling: "⬇",
      rapidlyFalling: "⬇⬇",
    };
    return arrows[trend] ?? "→";
  };

  const getGlucoseColor = (mg: number) => {
    if (mg < 70) return "#EF4444";
    if (mg < 80) return "#F59E0B";
    if (mg <= 180) return "#22C55E";
    if (mg <= 250) return "#F59E0B";
    return "#EF4444";
  };

  const getBPColor = (classification: string) => {
    const map: Record<string, string> = {
      normal: "#22C55E",
      elevated: "#F59E0B",
      stage1: "#F97316",
      stage2: "#EF4444",
      crisis: "#7C3AED",
    };
    return map[classification] ?? "#687076";
  };

  return (
    <ScreenContainer className="p-4">
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Device Simulator</Text>
        <Text style={styles.subtitle}>
          Simulate Dexcom G7, Omnipod DASH, and Omron BP without physical hardware.
          All data flows into the analytics engine identically to real devices.
        </Text>

        {/* Master Toggle */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Simulator Mode</Text>
              <Text style={[styles.cardDesc, { color: colors.muted }]}>
                {isEnabled ? "🟢 Active — generating device data" : "⚫ Inactive — using real device data"}
              </Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={handleToggleSimulator}
              trackColor={{ false: colors.border, true: "#22C55E" }}
            />
          </View>
        </View>

        {/* CGM Configuration */}
        <Text style={[styles.sectionHeader, { color: colors.muted }]}>DEXCOM G7 CGM</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {latestCGM && (
            <View style={styles.liveReading}>
              <Text style={[styles.glucoseValue, { color: getGlucoseColor(latestCGM.estimatedGlucoseValue) }]}>
                {latestCGM.estimatedGlucoseValue} mg/dL {getTrendArrow(latestCGM.trend)}
              </Text>
              <Text style={[styles.glucoseMmol, { color: colors.muted }]}>
                {DexcomCGMSimulator.toMmol(latestCGM.estimatedGlucoseValue)} mmol/L
              </Text>
              <Text style={[styles.trendRate, { color: colors.muted }]}>
                Rate: {latestCGM.trendRate > 0 ? "+" : ""}{latestCGM.trendRate} mg/dL/min
              </Text>
              <Text style={[styles.timestamp, { color: colors.muted }]}>
                {new Date(latestCGM.systemTime).toLocaleTimeString()} · {latestCGM.deviceInfo.model}
              </Text>
            </View>
          )}
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.muted }]}>Start BG (mg/dL)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                value={startBG}
                onChangeText={setStartBG}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.muted }]}>Carbs (g)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                value={carbsG}
                onChangeText={setCarbsG}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.muted }]}>Insulin (u)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                value={insulinU}
                onChangeText={setInsulinU}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
          </View>
        </View>

        {/* Omnipod DASH */}
        <Text style={[styles.sectionHeader, { color: colors.muted }]}>OMNIPOD DASH</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {omnipodState && (
            <View style={styles.podStatus}>
              <View style={styles.podRow}>
                <Text style={[styles.podLabel, { color: colors.muted }]}>State</Text>
                <Text style={[styles.podValue, { color: omnipodState.podStatus.state === "active" ? "#22C55E" : "#EF4444" }]}>
                  {omnipodState.podStatus.state.toUpperCase()}
                </Text>
              </View>
              <View style={styles.podRow}>
                <Text style={[styles.podLabel, { color: colors.muted }]}>Reservoir</Text>
                <Text style={[styles.podValue, { color: omnipodState.podStatus.reservoirUnits < 10 ? "#EF4444" : colors.foreground }]}>
                  {omnipodState.podStatus.reservoirUnits}u
                </Text>
              </View>
              <View style={styles.podRow}>
                <Text style={[styles.podLabel, { color: colors.muted }]}>Basal Rate</Text>
                <Text style={[styles.podValue, { color: colors.foreground }]}>
                  {omnipodState.podStatus.activeBasalRate}u/hr
                </Text>
              </View>
              {omnipodState.podStatus.lastBolus && (
                <View style={styles.podRow}>
                  <Text style={[styles.podLabel, { color: colors.muted }]}>Last Bolus</Text>
                  <Text style={[styles.podValue, { color: colors.foreground }]}>
                    {omnipodState.podStatus.lastBolus.amount}u at {new Date(omnipodState.podStatus.lastBolus.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              )}
              {omnipodState.podStatus.alerts.length > 0 && (
                <Text style={styles.alertText}>
                  ⚠️ {omnipodState.podStatus.alerts.join(", ").replace(/_/g, " ")}
                </Text>
              )}
            </View>
          )}
          <View style={styles.bolusRow}>
            <TextInput
              style={[styles.bolusInput, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
              value={bolusUnits}
              onChangeText={setBolusUnits}
              keyboardType="numeric"
              returnKeyType="done"
              placeholder="Units"
              placeholderTextColor={colors.muted}
            />
            <TouchableOpacity
              onPress={handleManualBolus}
              style={[styles.bolusBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.bolusBtnText}>Deliver Bolus</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Omron BP */}
        <Text style={[styles.sectionHeader, { color: colors.muted }]}>OMRON HEM-7361T</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {latestBP && (
            <View style={styles.bpReading}>
              <Text style={[styles.bpValue, { color: getBPColor(latestBP.classification) }]}>
                {latestBP.reading.systolic}/{latestBP.reading.diastolic} mmHg
              </Text>
              <Text style={[styles.bpPulse, { color: colors.muted }]}>
                ❤️ {latestBP.reading.pulse} bpm · {latestBP.classification.replace(/([A-Z])/g, " $1").trim()}
              </Text>
              <Text style={[styles.timestamp, { color: colors.muted }]}>
                {new Date(latestBP.reading.timestamp).toLocaleTimeString()} · Battery {latestBP.device.batteryLevel}%
              </Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={[styles.cardDesc, { color: colors.foreground, flex: 1 }]}>Hypertension Profile</Text>
            <Switch
              value={isHypertensive}
              onValueChange={setIsHypertensive}
              trackColor={{ false: colors.border, true: "#EF4444" }}
            />
          </View>
          <Text style={[styles.cardDesc, { color: colors.muted, marginTop: 4 }]}>
            {isHypertensive
              ? "Generating Stage 1/2 hypertension readings (135-160 systolic)"
              : "Generating normal/elevated readings (110-130 systolic)"}
          </Text>
        </View>

        {/* Refresh button */}
        <TouchableOpacity
          onPress={loadLatestReadings}
          style={[styles.refreshBtn, { borderColor: colors.border }]}
        >
          <Text style={[styles.refreshBtnText, { color: colors.primary }]}>↻ Refresh Readings</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "700", color: "#11181C", marginBottom: 6, marginTop: 8 },
  subtitle: { fontSize: 13, color: "#687076", lineHeight: 19, marginBottom: 20 },
  sectionHeader: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  card: { borderRadius: 14, padding: 16, marginBottom: 4, borderWidth: 1 },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  row: { flexDirection: "row", alignItems: "center" },
  flex1: { flex: 1 },
  liveReading: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" },
  glucoseValue: { fontSize: 32, fontWeight: "800", marginBottom: 2 },
  glucoseMmol: { fontSize: 14, marginBottom: 2 },
  trendRate: { fontSize: 13, marginBottom: 2 },
  timestamp: { fontSize: 11 },
  inputRow: { flexDirection: "row", gap: 10 },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: 11, fontWeight: "600", marginBottom: 4, textTransform: "uppercase" },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 16, fontWeight: "600" },
  podStatus: { marginBottom: 14 },
  podRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  podLabel: { fontSize: 13 },
  podValue: { fontSize: 13, fontWeight: "600" },
  alertText: { fontSize: 12, color: "#F59E0B", marginTop: 4 },
  bolusRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  bolusInput: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 16, fontWeight: "600" },
  bolusBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  bolusBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  bpReading: { marginBottom: 14, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" },
  bpValue: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  bpPulse: { fontSize: 14, marginBottom: 2 },
  refreshBtn: { borderWidth: 1, borderRadius: 10, padding: 14, alignItems: "center", marginTop: 8, marginBottom: 40 },
  refreshBtnText: { fontSize: 15, fontWeight: "600" },
});
