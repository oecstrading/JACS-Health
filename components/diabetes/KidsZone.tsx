import { View, Text, Pressable, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { Star, Trophy, Zap, Heart, Droplet, Camera, Award, Crown } from "lucide-react-native";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

interface KidsZoneData {
  xp: number;
  level: number;
  streak: number;
  badges: {
    firstLog: boolean;
    threeDayStreak: boolean;
    weekWarrior: boolean;
    inRangePro: boolean;
    foodDetective: boolean;
    hydrationHero: boolean;
    levelFive: boolean;
    champion: boolean;
  };
  dailyMissions: {
    logBloodSugar: boolean;
    scanMeal: boolean;
    drinkWater: boolean;
    checkInWithBuddy: boolean;
  };
  lastCheckInDate: string;
}

const BADGE_INFO = [
  { id: "firstLog", name: "First Log", icon: Star, description: "Log your first blood sugar", xp: 10 },
  { id: "threeDayStreak", name: "3-Day Streak", icon: Zap, description: "Log 3 days in a row", xp: 25 },
  { id: "weekWarrior", name: "Week Warrior", icon: Trophy, description: "Complete 7 days straight", xp: 50 },
  { id: "inRangePro", name: "In Range Pro", icon: Heart, description: "70%+ time in range for a week", xp: 40 },
  { id: "foodDetective", name: "Food Detective", icon: Camera, description: "Scan 10 meals with AI", xp: 30 },
  { id: "hydrationHero", name: "Hydration Hero", icon: Droplet, description: "Log water 7 days straight", xp: 35 },
  { id: "levelFive", name: "Level 5", icon: Award, description: "Reach level 5", xp: 100 },
  { id: "champion", name: "Champion", icon: Crown, description: "Earn all other badges", xp: 200 },
];

const DAILY_MISSIONS = [
  { id: "logBloodSugar", name: "Log Blood Sugar", xp: 10, icon: Droplet },
  { id: "scanMeal", name: "Scan a Meal", xp: 15, icon: Camera },
  { id: "drinkWater", name: "Drink Water", xp: 5, icon: Droplet },
  { id: "checkInWithBuddy", name: "Check in with Buddy", xp: 10, icon: Heart },
];

/**
 * Kids Zone - Gamification System
 * 
 * Features:
 * - XP (Experience Points) and leveling
 * - 8 achievement badges
 * - Daily missions with XP rewards
 * - Streak counter
 * - Friendly buddy character
 * - Progress tracking
 */
export function KidsZone() {
  const colors = useColors();
  const [kidsData, setKidsData] = useState<KidsZoneData>({
    xp: 0,
    level: 1,
    streak: 0,
    badges: {
      firstLog: false,
      threeDayStreak: false,
      weekWarrior: false,
      inRangePro: false,
      foodDetective: false,
      hydrationHero: false,
      levelFive: false,
      champion: false,
    },
    dailyMissions: {
      logBloodSugar: false,
      scanMeal: false,
      drinkWater: false,
      checkInWithBuddy: false,
    },
    lastCheckInDate: new Date().toDateString(),
  });

  useEffect(() => {
    loadKidsData();
  }, []);

  useEffect(() => {
    saveKidsData();
    checkLevelUp();
    checkBadgeUnlocks();
  }, [kidsData.xp]);

  const loadKidsData = async () => {
    try {
      const stored = await AsyncStorage.getItem("kids_zone_data");
      if (stored) {
        const parsed = JSON.parse(stored);
        setKidsData(parsed);
        checkDailyReset(parsed);
      }
    } catch (error) {
      console.error("Error loading kids zone data:", error);
    }
  };

  const saveKidsData = async () => {
    try {
      await AsyncStorage.setItem("kids_zone_data", JSON.stringify(kidsData));
    } catch (error) {
      console.error("Error saving kids zone data:", error);
    }
  };

  const checkDailyReset = (data: KidsZoneData) => {
    const today = new Date().toDateString();
    if (data.lastCheckInDate !== today) {
      // Reset daily missions
      setKidsData((prev) => ({
        ...prev,
        dailyMissions: {
          logBloodSugar: false,
          scanMeal: false,
          drinkWater: false,
          checkInWithBuddy: false,
        },
        lastCheckInDate: today,
      }));
    }
  };

  const checkLevelUp = () => {
    const xpForNextLevel = kidsData.level * 100;
    if (kidsData.xp >= xpForNextLevel) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setKidsData((prev) => ({
        ...prev,
        level: prev.level + 1,
      }));
    }
  };

  const checkBadgeUnlocks = () => {
    // Check level 5 badge
    if (kidsData.level >= 5 && !kidsData.badges.levelFive) {
      unlockBadge("levelFive");
    }

    // Check champion badge (all others unlocked)
    const otherBadges = Object.entries(kidsData.badges).filter(([key]) => key !== "champion");
    if (otherBadges.every(([_, unlocked]) => unlocked) && !kidsData.badges.champion) {
      unlockBadge("champion");
    }
  };

  const unlockBadge = (badgeId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setKidsData((prev) => ({
      ...prev,
      badges: {
        ...prev.badges,
        [badgeId]: true,
      },
    }));
  };

  const completeMission = (missionId: keyof typeof kidsData.dailyMissions) => {
    if (kidsData.dailyMissions[missionId]) return; // Already completed

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const mission = DAILY_MISSIONS.find((m) => m.id === missionId);
    const xpReward = mission?.xp || 0;

    setKidsData((prev) => ({
      ...prev,
      xp: prev.xp + xpReward,
      dailyMissions: {
        ...prev.dailyMissions,
        [missionId]: true,
      },
    }));
  };

  const xpForNextLevel = kidsData.level * 100;
  const xpProgress = (kidsData.xp % xpForNextLevel) / xpForNextLevel;
  const xpToNextLevel = xpForNextLevel - (kidsData.xp % xpForNextLevel);

  const earnedBadgesCount = Object.values(kidsData.badges).filter(Boolean).length;
  const completedMissionsCount = Object.values(kidsData.dailyMissions).filter(Boolean).length;

  const buddyMessages = [
    "You're doing amazing! Keep it up! 🌟",
    "Every log helps you stay healthy! 💪",
    "I'm so proud of your progress! 🎉",
    "You're a diabetes champion! 👑",
    "Great job staying on track! ⭐",
  ];

  const randomBuddyMessage = buddyMessages[Math.floor(Math.random() * buddyMessages.length)];

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="p-6">
        {/* Header */}
        <View className="items-center mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Kids Zone 🎮
          </Text>
          <Text className="text-base text-muted text-center">
            Complete missions, earn XP, and unlock badges!
          </Text>
        </View>

        {/* Level & XP Card */}
        <View className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-white/80 text-sm mb-1">Your Level</Text>
              <Text className="text-white text-4xl font-bold">Level {kidsData.level}</Text>
            </View>
            <View className="bg-white/20 rounded-full p-4">
              <Trophy size={32} color="#ffffff" />
            </View>
          </View>

          {/* XP Progress Bar */}
          <View className="mb-2">
            <View className="flex-row justify-between mb-1">
              <Text className="text-white/80 text-xs">XP Progress</Text>
              <Text className="text-white/80 text-xs">{xpToNextLevel} XP to Level {kidsData.level + 1}</Text>
            </View>
            <View className="h-3 bg-white/20 rounded-full overflow-hidden">
              <View
                style={{ width: `${xpProgress * 100}%` }}
                className="h-full bg-white rounded-full"
              />
            </View>
          </View>

          {/* Streak */}
          <View className="flex-row items-center gap-2 mt-3">
            <Zap size={16} color="#ffffff" />
            <Text className="text-white font-semibold">
              {kidsData.streak} Day Streak 🔥
            </Text>
          </View>
        </View>

        {/* Buddy Message */}
        <View className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-6">
          <View className="flex-row items-start gap-3">
            <View className="bg-blue-500 rounded-full p-2">
              <Heart size={24} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground mb-1">
                Your Buddy Says:
              </Text>
              <Text className="text-sm text-foreground leading-relaxed">
                {randomBuddyMessage}
              </Text>
            </View>
          </View>
        </View>

        {/* Daily Missions */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xl font-bold text-foreground">
              Daily Missions
            </Text>
            <Text className="text-sm text-muted">
              {completedMissionsCount}/{DAILY_MISSIONS.length}
            </Text>
          </View>

          <View className="gap-3">
            {DAILY_MISSIONS.map((mission) => {
              const MissionIcon = mission.icon;
              const isCompleted = kidsData.dailyMissions[mission.id as keyof typeof kidsData.dailyMissions];

              return (
                <Pressable
                  key={mission.id}
                  onPress={() => completeMission(mission.id as keyof typeof kidsData.dailyMissions)}
                  disabled={isCompleted}
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  className={`bg-surface border-2 rounded-xl p-4 flex-row items-center ${
                    isCompleted ? "border-success" : "border-border"
                  }`}
                >
                  <View className={`rounded-full p-3 mr-3 ${isCompleted ? "bg-success/20" : "bg-primary/20"}`}>
                    <MissionIcon size={24} color={isCompleted ? colors.success : colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground mb-1">
                      {mission.name}
                    </Text>
                    <Text className="text-sm text-muted">
                      +{mission.xp} XP
                    </Text>
                  </View>
                  {isCompleted && (
                    <View className="bg-success rounded-full p-2">
                      <Text className="text-white font-bold">✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Badges */}
        <View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xl font-bold text-foreground">
              Achievement Badges
            </Text>
            <Text className="text-sm text-muted">
              {earnedBadgesCount}/{BADGE_INFO.length}
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-3">
            {BADGE_INFO.map((badge) => {
              const BadgeIcon = badge.icon;
              const isEarned = kidsData.badges[badge.id as keyof typeof kidsData.badges];

              return (
                <View
                  key={badge.id}
                  className={`w-[48%] bg-surface border-2 rounded-xl p-4 items-center ${
                    isEarned ? "border-warning" : "border-border"
                  }`}
                >
                  <View className={`rounded-full p-4 mb-2 ${isEarned ? "bg-warning/20" : "bg-muted/20"}`}>
                    <BadgeIcon size={32} color={isEarned ? colors.warning : colors.muted} />
                  </View>
                  <Text className={`text-sm font-semibold text-center mb-1 ${isEarned ? "text-foreground" : "text-muted"}`}>
                    {badge.name}
                  </Text>
                  <Text className="text-xs text-muted text-center">
                    {badge.description}
                  </Text>
                  {isEarned && (
                    <View className="mt-2 bg-warning/20 px-2 py-1 rounded-full">
                      <Text className="text-xs font-semibold text-warning">Earned!</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
