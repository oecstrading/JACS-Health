import { View, Text, Pressable, ScrollView, Switch, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { Cloud, RefreshCw, Download, Upload, Shield, Wifi } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { CloudSyncService, SyncStatus, SyncConfig } from "@/services/CloudSyncService";

/**
 * Cloud Sync Settings Screen
 * 
 * Features:
 * - View sync status and statistics
 * - Configure auto-sync settings
 * - Manual sync trigger
 * - Data backup and restore
 * - Encryption settings
 * - WiFi-only mode
 */
export default function CloudSyncSettingsScreen() {
  const colors = useColors();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(CloudSyncService.getSyncStatus());
  const [syncConfig, setSyncConfig] = useState<SyncConfig>(CloudSyncService.getSyncConfig());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    // Update status every second while syncing
    const interval = setInterval(() => {
      const status = CloudSyncService.getSyncStatus();
      setSyncStatus(status);
      if (!status.isSyncing) {
        setIsSyncing(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleAutoSync = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await CloudSyncService.updateSyncConfig({ autoSync: value });
    setSyncConfig(CloudSyncService.getSyncConfig());
  };

  const handleToggleWifiOnly = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await CloudSyncService.updateSyncConfig({ wifiOnly: value });
    setSyncConfig(CloudSyncService.getSyncConfig());
  };

  const handleToggleEncryption = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await CloudSyncService.updateSyncConfig({ encryptionEnabled: value });
    setSyncConfig(CloudSyncService.getSyncConfig());
  };

  const handleSyncNow = async () => {
    if (syncStatus.isSyncing) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSyncing(true);
    
    const success = await CloudSyncService.syncNow();
    
    Haptics.notificationAsync(
      success ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
    
    if (success) {
      Alert.alert("Sync Complete", "All your data has been backed up to the cloud.");
    } else {
      Alert.alert("Sync Failed", "Some items could not be synced. They will be retried automatically.");
    }
    
    setSyncStatus(CloudSyncService.getSyncStatus());
    setIsSyncing(false);
  };

  const handleRestoreBackup = () => {
    Alert.alert(
      "Restore from Backup",
      "This will replace your local data with the latest cloud backup. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsRestoring(true);
            
            const success = await CloudSyncService.restoreFromBackup();
            
            setIsRestoring(false);
            
            if (success) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Restore Complete", "Your data has been restored from the cloud backup.");
            } else {
              Alert.alert("Restore Failed", "Could not restore data from backup. Please try again.");
            }
          },
        },
      ]
    );
  };

  const formatLastSync = () => {
    if (!syncStatus.lastSyncTime) {
      return "Never";
    }
    const now = new Date();
    const diff = now.getTime() - new Date(syncStatus.lastSyncTime).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="p-6 pb-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Cloud size={28} color={colors.primary} />
            <Text className="text-2xl font-bold text-foreground">
              Cloud Sync
            </Text>
          </View>
          <Text className="text-base text-muted leading-relaxed">
            Backup and sync your health data across devices
          </Text>
        </View>

        {/* Sync Status Card */}
        <View className="px-6 pb-6">
          <View className="bg-surface border border-border rounded-xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-foreground">
                Sync Status
              </Text>
              {syncStatus.isSyncing && (
                <ActivityIndicator size="small" color={colors.primary} />
              )}
            </View>

            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Last Sync</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {formatLastSync()}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Pending Changes</Text>
                <View
                  className={`px-3 py-1 rounded-full ${
                    syncStatus.pendingChanges > 0 ? "bg-warning/20" : "bg-success/20"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      syncStatus.pendingChanges > 0 ? "text-warning" : "text-success"
                    }`}
                  >
                    {syncStatus.pendingChanges}
                  </Text>
                </View>
              </View>

              {syncStatus.syncErrors.length > 0 && (
                <View className="bg-error/10 rounded-lg p-3 mt-2">
                  <Text className="text-xs text-error font-semibold mb-1">
                    Sync Errors:
                  </Text>
                  {syncStatus.syncErrors.map((error, index) => (
                    <Text key={index} className="text-xs text-error">
                      • {error}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Sync Actions */}
        <View className="px-6 pb-6">
          <View className="flex-row gap-3">
            <Pressable
              onPress={handleSyncNow}
              disabled={isSyncing || syncStatus.isSyncing}
              style={({ pressed }) => [
                {
                  opacity: pressed || isSyncing || syncStatus.isSyncing ? 0.7 : 1,
                },
              ]}
              className="flex-1 bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
            >
              {isSyncing || syncStatus.isSyncing ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="text-white font-semibold">Syncing...</Text>
                </>
              ) : (
                <>
                  <RefreshCw size={20} color="#ffffff" />
                  <Text className="text-white font-semibold">Sync Now</Text>
                </>
              )}
            </Pressable>

            <Pressable
              onPress={handleRestoreBackup}
              disabled={isRestoring}
              style={({ pressed }) => [
                {
                  opacity: pressed || isRestoring ? 0.7 : 1,
                },
              ]}
              className="flex-1 bg-surface border-2 border-border py-4 rounded-xl flex-row items-center justify-center gap-2"
            >
              {isRestoring ? (
                <>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text className="text-foreground font-semibold">Restoring...</Text>
                </>
              ) : (
                <>
                  <Download size={20} color={colors.primary} />
                  <Text className="text-foreground font-semibold">Restore</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {/* Auto Sync Setting */}
        <View className="px-6 pb-6">
          <View className="bg-surface border border-border rounded-xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="bg-primary/20 rounded-full p-3">
                  <Upload size={24} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground mb-1">
                    Automatic Sync
                  </Text>
                  <Text className="text-sm text-muted leading-relaxed">
                    Sync changes automatically every {syncConfig.syncInterval} minutes
                  </Text>
                </View>
              </View>
              <Switch
                value={syncConfig.autoSync}
                onValueChange={handleToggleAutoSync}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* WiFi Only Setting */}
        <View className="px-6 pb-6">
          <View className="bg-surface border border-border rounded-xl p-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="bg-primary/20 rounded-full p-3">
                  <Wifi size={24} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground mb-1">
                    WiFi Only
                  </Text>
                  <Text className="text-sm text-muted leading-relaxed">
                    Only sync when connected to WiFi
                  </Text>
                </View>
              </View>
              <Switch
                value={syncConfig.wifiOnly}
                onValueChange={handleToggleWifiOnly}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Encryption Setting */}
        <View className="px-6 pb-6">
          <View className="bg-surface border border-border rounded-xl p-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="bg-primary/20 rounded-full p-3">
                  <Shield size={24} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground mb-1">
                    End-to-End Encryption
                  </Text>
                  <Text className="text-sm text-muted leading-relaxed">
                    Encrypt data before uploading to cloud
                  </Text>
                </View>
              </View>
              <Switch
                value={syncConfig.encryptionEnabled}
                onValueChange={handleToggleEncryption}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View className="px-6 pb-6">
          <View className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <View className="flex-row items-start gap-3">
              <Cloud size={20} color={colors.primary} />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground mb-1">
                  Secure Cloud Backup
                </Text>
                <Text className="text-xs text-muted leading-relaxed">
                  Your health data is encrypted and securely stored in the cloud. You can access it from any device by logging in with your account.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
