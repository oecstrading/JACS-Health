import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import DeviceSyncService, { type DeviceInfo } from "@/services/deviceSyncService";
import DeviceReportService, { type ReportOptions } from "@/services/deviceReportService";

export default function DeviceReportScreen() {
  const colors = useColors();
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [includeStatistics, setIncludeStatistics] = useState(true);
  const [includeReadings, setIncludeReadings] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const devs = await DeviceSyncService.getConnectedDevices();
      setDevices(devs);
      if (devs.length > 0 && !selectedDevice) {
        setSelectedDevice(devs[0].id);
      }
    } catch (error) {
      console.error("Error loading devices:", error);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedDevice) {
      Alert.alert("Error", "Please select a device");
      return;
    }

    const device = devices.find((d) => d.id === selectedDevice);
    if (!device) return;

    setGenerating(true);
    try {
      const options: ReportOptions = {
        deviceId: selectedDevice,
        deviceName: device.name,
        startDate,
        endDate,
        includeStatistics,
        includeReadings,
      };

      const filePath = await DeviceReportService.exportReport(options, "html");
      await DeviceReportService.shareReport(filePath);

      Alert.alert("Success", "Report generated and ready to share!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const setPeriod = (days: number) => {
    setEndDate(new Date());
    setStartDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <Text className="text-base font-semibold" style={{ color: colors.primary }}>
                ← Back
              </Text>
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Export Report</Text>
            <Text className="text-base text-muted mt-1">
              Generate PDF report with device data
            </Text>
          </View>

          {/* Device Selection */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">Select Device</Text>
            <View className="gap-3">
              {devices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  onPress={() => setSelectedDevice(device.id)}
                  className="rounded-2xl p-5"
                  style={{
                    backgroundColor:
                      selectedDevice === device.id ? colors.primary : colors.surface,
                  }}
                >
                  <Text
                    className="text-lg font-bold"
                    style={{
                      color: selectedDevice === device.id ? "#fff" : colors.foreground,
                    }}
                  >
                    {device.name}
                  </Text>
                  <Text
                    className="text-sm mt-1"
                    style={{
                      color: selectedDevice === device.id ? "#fff" : colors.muted,
                    }}
                  >
                    {device.type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Period Selection */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">Report Period</Text>
            <View className="flex-row flex-wrap gap-3">
              {[
                { label: "Last 7 Days", days: 7 },
                { label: "Last 30 Days", days: 30 },
                { label: "Last 90 Days", days: 90 },
                { label: "Last Year", days: 365 },
              ].map((period) => (
                <TouchableOpacity
                  key={period.days}
                  onPress={() => setPeriod(period.days)}
                  className="rounded-full px-6 py-3"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-sm font-semibold text-foreground">{period.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Report Options */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">Include in Report</Text>
            <View className="gap-3">
              <TouchableOpacity
                onPress={() => setIncludeStatistics(!includeStatistics)}
                className="rounded-2xl p-5 flex-row items-center justify-between"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground">Statistics</Text>
                  <Text className="text-sm text-muted mt-1">
                    Daily, weekly, and monthly averages
                  </Text>
                </View>
                <View
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: includeStatistics ? colors.success : colors.border,
                  }}
                >
                  <Text className="text-2xl">{includeStatistics ? "✓" : ""}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIncludeReadings(!includeReadings)}
                className="rounded-2xl p-5 flex-row items-center justify-between"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground">Reading History</Text>
                  <Text className="text-sm text-muted mt-1">
                    Detailed list of all readings with timestamps
                  </Text>
                </View>
                <View
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: includeReadings ? colors.success : colors.border,
                  }}
                >
                  <Text className="text-2xl">{includeReadings ? "✓" : ""}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            onPress={handleGenerateReport}
            disabled={generating || !selectedDevice}
            className="rounded-full p-5 items-center"
            style={{
              backgroundColor:
                generating || !selectedDevice ? colors.border : colors.primary,
            }}
          >
            {generating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-lg font-bold text-white">Generate & Share Report</Text>
            )}
          </TouchableOpacity>

          {/* Info */}
          <View
            className="rounded-2xl p-5"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-sm text-muted text-center">
              The report will be generated as an HTML file that can be viewed in any browser or
              converted to PDF. You can share it via email, messaging apps, or save it to your
              device.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
