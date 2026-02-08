/**
 * Milestones Screen
 * Display health milestones, progress, and achievements with celebrations
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import * as Haptics from 'expo-haptics';
import { milestoneService, type Milestone, type Achievement } from '@/services/milestoneService';

export default function MilestonesScreen() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  
  // Animation values
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const badgeScaleAnim = useRef(new Animated.Value(0)).current;
  const badgeRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    milestoneService.initialize();
    
    // Check for uncelebrated achievements
    checkForCelebrations();
  }, []);

  const loadData = async () => {
    const milestonesData = milestoneService.getMilestones();
    const achievementsData = milestoneService.getAchievements();
    
    setMilestones(milestonesData);
    setAchievements(achievementsData);
  };

  const checkForCelebrations = async () => {
    const uncelebrated = milestoneService.getUncelebratedAchievements();
    
    if (uncelebrated.length > 0) {
      // Show celebration for the first uncelebrated achievement
      setCurrentAchievement(uncelebrated[0]);
      setShowCelebration(true);
      startCelebrationAnimation();
      
      // Mark as celebrated
      await milestoneService.markAsCelebrated(uncelebrated[0].id);
      
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const startCelebrationAnimation = () => {
    // Reset animations
    confettiAnim.setValue(0);
    badgeScaleAnim.setValue(0);
    badgeRotateAnim.setValue(0);

    // Confetti falling animation
    Animated.timing(confettiAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    // Badge entrance animation
    Animated.sequence([
      Animated.spring(badgeScaleAnim, {
        toValue: 1.2,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(badgeScaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Badge rotation animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(badgeRotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(badgeRotateAnim, {
          toValue: -1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(badgeRotateAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const closeCelebration = () => {
    setShowCelebration(false);
    setCurrentAchievement(null);
    loadData(); // Refresh data
  };

  const getProgressPercentage = (milestone: Milestone): number => {
    return Math.min((milestone.progress / milestone.target) * 100, 100);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return 'bg-success';
    if (percentage >= 75) return 'bg-primary';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-muted';
  };

  const renderConfetti = () => {
    const confettiPieces = Array.from({ length: 50 }, (_, i) => i);
    
    return confettiPieces.map((i) => {
      const randomX = Math.random() * 100;
      const randomDelay = Math.random() * 500;
      const randomColor = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][
        Math.floor(Math.random() * 5)
      ];
      
      const translateY = confettiAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 600],
      });
      
      return (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: `${randomX}%`,
            width: 10,
            height: 10,
            backgroundColor: randomColor,
            transform: [{ translateY }],
            opacity: confettiAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 1, 0],
            }),
          }}
        />
      );
    });
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            🏆 Your Milestones
          </Text>
          <Text className="text-base text-muted">
            Track your progress and celebrate your health achievements
          </Text>
        </View>

        {/* Achievements Summary */}
        <View className="bg-primary rounded-2xl p-6 mb-6">
          <Text className="text-2xl font-bold text-white mb-2">
            {achievements.length} Achievements Unlocked
          </Text>
          <Text className="text-base text-white opacity-90">
            Keep up the great work! You're making amazing progress.
          </Text>
        </View>

        {/* Active Milestones */}
        <Text className="text-xl font-bold text-foreground mb-3">
          In Progress
        </Text>
        
        {milestones
          .filter(m => !m.achieved)
          .map((milestone) => {
            const percentage = getProgressPercentage(milestone);
            const progressColor = getProgressColor(percentage);
            
            return (
              <View
                key={milestone.id}
                className="bg-surface rounded-2xl p-4 mb-4 border border-border"
              >
                <View className="flex-row items-center mb-3">
                  <Text className="text-5xl mr-3">{milestone.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground">
                      {milestone.title}
                    </Text>
                    <Text className="text-sm text-muted">
                      {milestone.description}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="mb-2">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs text-muted">
                      {milestone.progress} / {milestone.target}
                    </Text>
                    <Text className="text-xs text-muted">
                      {percentage.toFixed(0)}%
                    </Text>
                  </View>
                  <View className="h-3 bg-border rounded-full overflow-hidden">
                    <View
                      className={`h-full ${progressColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </View>
                </View>

                <Text className="text-xs text-muted">
                  {milestone.requirement}
                </Text>

                {percentage >= 75 && percentage < 100 && (
                  <View className="mt-2 bg-warning bg-opacity-20 rounded-lg p-2">
                    <Text className="text-xs text-foreground text-center">
                      🔥 Almost there! Keep going!
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

        {/* Completed Milestones */}
        {achievements.length > 0 && (
          <>
            <Text className="text-xl font-bold text-foreground mb-3 mt-6">
              Completed
            </Text>
            
            {milestones
              .filter(m => m.achieved)
              .map((milestone) => (
                <View
                  key={milestone.id}
                  className="bg-success bg-opacity-10 rounded-2xl p-4 mb-4 border border-success"
                >
                  <View className="flex-row items-center">
                    <Text className="text-5xl mr-3">{milestone.icon}</Text>
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-lg font-bold text-foreground mr-2">
                          {milestone.title}
                        </Text>
                        <Text className="text-2xl">{milestone.badge}</Text>
                      </View>
                      <Text className="text-sm text-muted">
                        Achieved on {new Date(milestone.achievedDate!).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
          </>
        )}

        {/* Empty State */}
        {milestones.filter(m => !m.achieved).length === 0 && achievements.length === 0 && (
          <View className="bg-surface rounded-2xl p-8 items-center">
            <Text className="text-6xl mb-4">🎯</Text>
            <Text className="text-lg font-bold text-foreground mb-2">
              Start Your Journey
            </Text>
            <Text className="text-sm text-muted text-center">
              Begin tracking your health to unlock milestones and earn badges!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Celebration Modal */}
      <Modal
        visible={showCelebration}
        transparent
        animationType="fade"
        onRequestClose={closeCelebration}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          {/* Confetti */}
          <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
            {renderConfetti()}
          </View>

          {/* Celebration Card */}
          <View className="bg-background rounded-3xl p-8 mx-6 items-center">
            <Text className="text-3xl font-bold text-foreground mb-4">
              🎉 Congratulations! 🎉
            </Text>

            {currentAchievement && (
              <>
                <Animated.Text
                  style={{
                    fontSize: 80,
                    transform: [
                      { scale: badgeScaleAnim },
                      {
                        rotate: badgeRotateAnim.interpolate({
                          inputRange: [-1, 1],
                          outputRange: ['-10deg', '10deg'],
                        }),
                      },
                    ],
                  }}
                >
                  {currentAchievement.badge}
                </Animated.Text>

                <Text className="text-2xl font-bold text-foreground text-center mt-4 mb-2">
                  {currentAchievement.title}
                </Text>

                <Text className="text-base text-muted text-center mb-6">
                  You've unlocked a new achievement! Your family has been notified.
                </Text>
              </>
            )}

            <TouchableOpacity
              onPress={closeCelebration}
              className="bg-primary px-8 py-4 rounded-full"
            >
              <Text className="text-lg font-bold text-white">
                Awesome! 🎊
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
