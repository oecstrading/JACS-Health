/**
 * Compliance Score Dashboard Widget
 * 
 * Displays 2026 Medicare compliance status for CPT codes:
 * - CPT 99454: Device Consistency (16+ days of data)
 * - CPT 99470: Interactive Communication (10+ minutes)
 * - CPT 99457: Extended Communication (20+ minutes)
 */

import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';
import { isInteractiveCommunicationMet, getTotalCommunicationTime } from '@/lib/communication-log';
import { getTotalReviewTime } from '@/lib/clinical-review-timer';

interface ComplianceStatus {
  deviceConsistency: boolean;
  interactionStatus: boolean;
  reviewTime: number;
  cpt99454Eligible: boolean;
  cpt99470Eligible: boolean;
  cpt99457Eligible: boolean;
}

export function ComplianceDashboard() {
  const colors = useColors();
  const [status, setStatus] = useState<ComplianceStatus>({
    deviceConsistency: false,
    interactionStatus: false,
    reviewTime: 0,
    cpt99454Eligible: false,
    cpt99470Eligible: false,
    cpt99457Eligible: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplianceStatus();
  }, []);

  const loadComplianceStatus = async () => {
    try {
      // Check device consistency (16+ days of data synced this month)
      const deviceConsistency = await checkDeviceConsistency();
      
      // Check interactive communication
      const interactionStatus = await isInteractiveCommunicationMet();
      
      // Get total communication time
      const commTime = await getTotalCommunicationTime();
      
      // Get total review time
      const reviewTime = await getTotalReviewTime();
      
      // Calculate CPT eligibility
      const cpt99454Eligible = deviceConsistency;
      const cpt99470Eligible = commTime >= 10 || reviewTime >= 10;
      const cpt99457Eligible = commTime >= 20 || reviewTime >= 20;
      
      setStatus({
        deviceConsistency,
        interactionStatus,
        reviewTime: commTime + reviewTime,
        cpt99454Eligible,
        cpt99470Eligible,
        cpt99457Eligible,
      });
    } catch (error) {
      console.error('Error loading compliance status:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkDeviceConsistency = async (): Promise<boolean> => {
    // TODO: Implement actual device data check
    // For now, return mock data
    // This should check if 16+ days of data were synced from devices this month
    return true;
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/communication-log' as any);
  };

  if (loading) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-surface p-4 rounded-xl border border-border mb-4"
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xl font-bold text-foreground">
          Medicare Compliance
        </Text>
        <Text className="text-sm text-primary">View Details →</Text>
      </View>

      {/* Compliance Indicators */}
      <View className="gap-2">
        {/* Device Consistency */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View
              className={`w-3 h-3 rounded-full ${
                status.deviceConsistency ? 'bg-success' : 'bg-warning'
              }`}
            />
            <Text className="text-base text-foreground">
              Device Consistency
            </Text>
          </View>
          <Text className="text-sm text-muted">
            {status.deviceConsistency ? '16+ days' : 'In Progress'}
          </Text>
        </View>

        {/* Interaction Status */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            {status.interactionStatus ? (
              <Text className="text-lg">✅</Text>
            ) : (
              <Text className="text-lg">⏳</Text>
            )}
            <Text className="text-base text-foreground">
              Interactive Communication
            </Text>
          </View>
          <Text className="text-sm text-muted">
            {status.interactionStatus ? 'Logged' : 'Pending'}
          </Text>
        </View>

        {/* Review Time */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg">⏱️</Text>
            <Text className="text-base text-foreground">
              Review Time
            </Text>
          </View>
          <Text className="text-sm text-muted">
            {status.reviewTime} minutes
          </Text>
        </View>
      </View>

      {/* CPT Code Eligibility */}
      <View className="mt-4 pt-4 border-t border-border">
        <Text className="text-sm font-semibold text-muted mb-2">
          CPT Code Eligibility
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <View
            className={`px-3 py-1 rounded-full ${
              status.cpt99454Eligible ? 'bg-success' : 'bg-surface'
            }`}
            style={{
              borderWidth: 1,
              borderColor: status.cpt99454Eligible ? colors.success : colors.border,
            }}
          >
            <Text
              className={`text-xs font-semibold ${
                status.cpt99454Eligible ? 'text-background' : 'text-muted'
              }`}
            >
              CPT 99454
            </Text>
          </View>

          <View
            className={`px-3 py-1 rounded-full ${
              status.cpt99470Eligible ? 'bg-success' : 'bg-surface'
            }`}
            style={{
              borderWidth: 1,
              borderColor: status.cpt99470Eligible ? colors.success : colors.border,
            }}
          >
            <Text
              className={`text-xs font-semibold ${
                status.cpt99470Eligible ? 'text-background' : 'text-muted'
              }`}
            >
              CPT 99470 (10 min)
            </Text>
          </View>

          <View
            className={`px-3 py-1 rounded-full ${
              status.cpt99457Eligible ? 'bg-success' : 'bg-surface'
            }`}
            style={{
              borderWidth: 1,
              borderColor: status.cpt99457Eligible ? colors.success : colors.border,
            }}
          >
            <Text
              className={`text-xs font-semibold ${
                status.cpt99457Eligible ? 'text-background' : 'text-muted'
              }`}
            >
              CPT 99457 (20 min)
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
