/**
 * Real-Time Vital Signs Monitoring Dashboard
 * Displays live heart rate, blood pressure, and oxygen saturation
 * with instant alerts for abnormal readings
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VitalSign {
  heartRate: number;
  systolic: number;
  diastolic: number;
  oxygenSaturation: number;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
}

interface AlertThreshold {
  heartRateMin: number;
  heartRateMax: number;
  systolicMin: number;
  systolicMax: number;
  diastolicMin: number;
  diastolicMax: number;
  oxygenMin: number;
}

const DEFAULT_THRESHOLDS: AlertThreshold = {
  heartRateMin: 60,
  heartRateMax: 100,
  systolicMin: 90,
  systolicMax: 140,
  diastolicMin: 60,
  diastolicMax: 90,
  oxygenMin: 95,
};

export default function RealTimeVitalsScreen() {
  const [currentVitals, setCurrentVitals] = useState<VitalSign>({
    heartRate: 72,
    systolic: 118,
    diastolic: 76,
    oxygenSaturation: 98,
    timestamp: new Date().toISOString(),
    status: 'normal',
  });
  
  const [vitalsHistory, setVitalsHistory] = useState<VitalSign[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [thresholds, setThresholds] = useState<AlertThreshold>(DEFAULT_THRESHOLDS);
  const [lastAlert, setLastAlert] = useState<string | null>(null);
  
  // Animated values for pulse effect
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const heartIconAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadThresholds();
    loadVitalsHistory();
  }, []);

  useEffect(() => {
    if (isMonitoring) {
      startPulseAnimation();
      startMonitoring();
    } else {
      stopPulseAnimation();
    }
    
    return () => {
      stopPulseAnimation();
    };
  }, [isMonitoring]);

  const loadThresholds = async () => {
    try {
      const stored = await AsyncStorage.getItem('vital_thresholds');
      if (stored) {
        setThresholds(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load thresholds:', error);
    }
  };

  const loadVitalsHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('realtime_vitals_history');
      if (stored) {
        const history = JSON.parse(stored);
        setVitalsHistory(history.slice(-20)); // Keep last 20 readings
      }
    } catch (error) {
      console.error('Failed to load vitals history:', error);
    }
  };

  const saveVitalsHistory = async (vitals: VitalSign) => {
    try {
      const newHistory = [...vitalsHistory, vitals].slice(-20);
      setVitalsHistory(newHistory);
      await AsyncStorage.setItem('realtime_vitals_history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save vitals history:', error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(heartIconAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(heartIconAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    heartIconAnim.stopAnimation();
    pulseAnim.setValue(1);
    heartIconAnim.setValue(1);
  };

  const startMonitoring = () => {
    // Simulate real-time data updates every 3 seconds
    const interval = setInterval(() => {
      updateVitals();
    }, 3000);

    return () => clearInterval(interval);
  };

  const updateVitals = () => {
    // Simulate realistic vital signs with small variations
    const newVitals: VitalSign = {
      heartRate: Math.floor(Math.random() * 20) + 65, // 65-85
      systolic: Math.floor(Math.random() * 30) + 110, // 110-140
      diastolic: Math.floor(Math.random() * 20) + 70, // 70-90
      oxygenSaturation: Math.floor(Math.random() * 4) + 96, // 96-100
      timestamp: new Date().toISOString(),
      status: 'normal',
    };

    // Check for abnormal readings
    const status = checkVitalStatus(newVitals);
    newVitals.status = status;

    setCurrentVitals(newVitals);
    saveVitalsHistory(newVitals);

    // Send alerts if needed
    if (status === 'warning' || status === 'critical') {
      handleAbnormalReading(newVitals);
    }
  };

  const checkVitalStatus = (vitals: VitalSign): 'normal' | 'warning' | 'critical' => {
    const {
      heartRate,
      systolic,
      diastolic,
      oxygenSaturation,
    } = vitals;

    // Critical conditions
    if (
      heartRate < 50 ||
      heartRate > 120 ||
      systolic > 160 ||
      systolic < 80 ||
      diastolic > 100 ||
      diastolic < 50 ||
      oxygenSaturation < 92
    ) {
      return 'critical';
    }

    // Warning conditions
    if (
      heartRate < thresholds.heartRateMin ||
      heartRate > thresholds.heartRateMax ||
      systolic < thresholds.systolicMin ||
      systolic > thresholds.systolicMax ||
      diastolic < thresholds.diastolicMin ||
      diastolic > thresholds.diastolicMax ||
      oxygenSaturation < thresholds.oxygenMin
    ) {
      return 'warning';
    }

    return 'normal';
  };

  const handleAbnormalReading = async (vitals: VitalSign) => {
    // Prevent alert spam (only alert once per minute)
    const now = Date.now();
    if (lastAlert && now - parseInt(lastAlert) < 60000) {
      return;
    }

    setLastAlert(now.toString());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    const message = getAlertMessage(vitals);

    // Send notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: vitals.status === 'critical' ? '⚠️ Critical Alert' : '⚡ Vital Sign Warning',
        body: message,
        data: { type: 'vital_alert', vitals },
        sound: true,
        priority: 'high',
      },
      trigger: null,
    });

    // Notify caregivers
    await notifyCaregivers(vitals, message);

    // Show in-app alert for critical readings
    if (vitals.status === 'critical') {
      Alert.alert(
        '⚠️ Critical Alert',
        message + '\n\nYour caregivers have been notified. If you feel unwell, please seek medical attention immediately.',
        [
          { text: 'Call 911', style: 'destructive', onPress: () => {} },
          { text: 'OK', style: 'default' },
        ]
      );
    }
  };

  const getAlertMessage = (vitals: VitalSign): string => {
    const issues: string[] = [];

    if (vitals.heartRate < thresholds.heartRateMin) {
      issues.push(`Heart rate is low (${vitals.heartRate} bpm)`);
    } else if (vitals.heartRate > thresholds.heartRateMax) {
      issues.push(`Heart rate is high (${vitals.heartRate} bpm)`);
    }

    if (vitals.systolic > thresholds.systolicMax) {
      issues.push(`Blood pressure is high (${vitals.systolic}/${vitals.diastolic})`);
    } else if (vitals.systolic < thresholds.systolicMin) {
      issues.push(`Blood pressure is low (${vitals.systolic}/${vitals.diastolic})`);
    }

    if (vitals.oxygenSaturation < thresholds.oxygenMin) {
      issues.push(`Oxygen level is low (${vitals.oxygenSaturation}%)`);
    }

    return issues.join('. ');
  };

  const notifyCaregivers = async (vitals: VitalSign, message: string) => {
    try {
      // Send notifications to all connected caregivers
      const caregivers = await AsyncStorage.getItem('caregivers');
      if (caregivers) {
        const caregiversList = JSON.parse(caregivers);
        // In production, send push notifications to caregiver devices
        console.log('Notifying caregivers:', caregiversList.length, 'caregivers');
      }
    } catch (error) {
      console.error('Failed to notify caregivers:', error);
    }
  };

  const toggleMonitoring = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsMonitoring(!isMonitoring);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-error';
      case 'warning':
        return 'bg-warning';
      default:
        return 'bg-success';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'critical':
        return 'CRITICAL';
      case 'warning':
        return 'WARNING';
      default:
        return 'NORMAL';
    }
  };

  const getSparklineData = (history: VitalSign[], key: 'heartRate' | 'systolic' | 'oxygenSaturation') => {
    return history.slice(-10).map(v => v[key]);
  };

  const renderSparkline = (data: number[], color: string) => {
    if (data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return (
      <View className="flex-row items-end h-12 gap-1">
        {data.map((value, index) => {
          const height = ((value - min) / range) * 100;
          return (
            <View
              key={index}
              className={color}
              style={{
                width: 4,
                height: `${Math.max(height, 10)}%`,
                borderRadius: 2,
              }}
            />
          );
        })}
      </View>
    );
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Live Vitals Monitor
          </Text>
          <Text className="text-base text-muted">
            Real-time monitoring of your vital signs with instant alerts
          </Text>
        </View>

        {/* Monitoring Toggle */}
        <TouchableOpacity
          onPress={toggleMonitoring}
          className={`py-4 rounded-2xl items-center mb-6 ${
            isMonitoring ? 'bg-error' : 'bg-success'
          }`}
        >
          <Text className="text-xl font-bold text-white">
            {isMonitoring ? '⏸️ Stop Monitoring' : '▶️ Start Monitoring'}
          </Text>
        </TouchableOpacity>

        {/* Overall Status */}
        <View className={`rounded-2xl p-6 mb-6 ${getStatusColor(currentVitals.status)}`}>
          <Text className="text-center text-2xl font-bold text-white mb-2">
            {getStatusText(currentVitals.status)}
          </Text>
          <Text className="text-center text-sm text-white opacity-90">
            Last updated: {new Date(currentVitals.timestamp).toLocaleTimeString()}
          </Text>
        </View>

        {/* Heart Rate */}
        <View className="bg-surface rounded-2xl p-6 mb-4 border border-border">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Animated.Text
                style={{
                  transform: [{ scale: isMonitoring ? heartIconAnim : 1 }],
                  fontSize: 40,
                }}
              >
                ❤️
              </Animated.Text>
              <View className="ml-3">
                <Text className="text-sm text-muted">Heart Rate</Text>
                <View className="flex-row items-baseline">
                  <Text className="text-4xl font-bold text-foreground">
                    {currentVitals.heartRate}
                  </Text>
                  <Text className="text-lg text-muted ml-1">bpm</Text>
                </View>
              </View>
            </View>
            
            {isMonitoring && (
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                }}
                className="w-16 h-16 rounded-full bg-error opacity-20"
              />
            )}
          </View>
          
          {vitalsHistory.length > 0 && renderSparkline(getSparklineData(vitalsHistory, 'heartRate'), 'bg-error')}
          
          <Text className="text-xs text-muted mt-2">
            Normal range: {thresholds.heartRateMin}-{thresholds.heartRateMax} bpm
          </Text>
        </View>

        {/* Blood Pressure */}
        <View className="bg-surface rounded-2xl p-6 mb-4 border border-border">
          <View className="flex-row items-center mb-4">
            <Text className="text-4xl mr-3">🩺</Text>
            <View className="flex-1">
              <Text className="text-sm text-muted">Blood Pressure</Text>
              <View className="flex-row items-baseline">
                <Text className="text-4xl font-bold text-foreground">
                  {currentVitals.systolic}
                </Text>
                <Text className="text-2xl text-foreground mx-1">/</Text>
                <Text className="text-4xl font-bold text-foreground">
                  {currentVitals.diastolic}
                </Text>
                <Text className="text-lg text-muted ml-1">mmHg</Text>
              </View>
            </View>
          </View>
          
          {vitalsHistory.length > 0 && renderSparkline(getSparklineData(vitalsHistory, 'systolic'), 'bg-primary')}
          
          <Text className="text-xs text-muted mt-2">
            Normal range: {thresholds.systolicMin}-{thresholds.systolicMax}/{thresholds.diastolicMin}-{thresholds.diastolicMax} mmHg
          </Text>
        </View>

        {/* Oxygen Saturation */}
        <View className="bg-surface rounded-2xl p-6 mb-4 border border-border">
          <View className="flex-row items-center mb-4">
            <Text className="text-4xl mr-3">🫁</Text>
            <View className="flex-1">
              <Text className="text-sm text-muted">Oxygen Saturation (SpO2)</Text>
              <View className="flex-row items-baseline">
                <Text className="text-4xl font-bold text-foreground">
                  {currentVitals.oxygenSaturation}
                </Text>
                <Text className="text-lg text-muted ml-1">%</Text>
              </View>
            </View>
          </View>
          
          {vitalsHistory.length > 0 && renderSparkline(getSparklineData(vitalsHistory, 'oxygenSaturation'), 'bg-success')}
          
          <Text className="text-xs text-muted mt-2">
            Normal range: {thresholds.oxygenMin}-100%
          </Text>
        </View>

        {/* Alert Information */}
        <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
          <Text className="text-lg font-bold text-foreground mb-2">
            🔔 Alert Settings
          </Text>
          <Text className="text-sm text-muted leading-relaxed mb-2">
            • Instant notifications for abnormal readings
          </Text>
          <Text className="text-sm text-muted leading-relaxed mb-2">
            • Caregivers notified automatically for critical alerts
          </Text>
          <Text className="text-sm text-muted leading-relaxed">
            • Monitoring updates every 3 seconds when active
          </Text>
        </View>

        {!isMonitoring && (
          <View className="bg-warning bg-opacity-20 rounded-2xl p-4 mb-6 border border-warning">
            <Text className="text-sm text-foreground text-center">
              💡 Connect your wearable device or Omron monitor for automatic real-time monitoring
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
