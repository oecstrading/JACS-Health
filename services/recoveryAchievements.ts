/**
 * Recovery Achievement Badges System
 * 
 * Gamified milestone tracking for hip replacement recovery:
 * - Achievement definitions with unlock criteria
 * - Progress tracking
 * - Badge unlock notifications
 * - Celebration screens
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "Mobility" | "Milestones" | "Exercise" | "Progress";
  unlockCriteria: {
    type: "steps" | "distance" | "exercises" | "days" | "milestone";
    target: number;
    current?: number;
  };
  unlocked: boolean;
  unlockedDate?: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-walk",
    title: "First Steps",
    description: "Take your first walk after surgery",
    icon: "👣",
    category: "Milestones",
    unlockCriteria: { type: "steps", target: 10, current: 0 },
    unlocked: false,
    rarity: "Common",
  },
  {
    id: "100-steps",
    title: "Century Walker",
    description: "Walk 100 steps in a single day",
    icon: "🚶",
    category: "Mobility",
    unlockCriteria: { type: "steps", target: 100, current: 0 },
    unlocked: false,
    rarity: "Common",
  },
  {
    id: "1000-steps",
    title: "Thousand Steps",
    description: "Reach 1,000 steps in a day",
    icon: "🏃",
    category: "Mobility",
    unlockCriteria: { type: "steps", target: 1000, current: 0 },
    unlocked: false,
    rarity: "Rare",
  },
  {
    id: "5000-steps",
    title: "Step Master",
    description: "Achieve 5,000 steps in a day",
    icon: "⭐",
    category: "Mobility",
    unlockCriteria: { type: "steps", target: 5000, current: 0 },
    unlocked: false,
    rarity: "Epic",
  },
  {
    id: "first-stairs",
    title: "Stair Climber",
    description: "Climb your first flight of stairs",
    icon: "🪜",
    category: "Milestones",
    unlockCriteria: { type: "milestone", target: 1, current: 0 },
    unlocked: false,
    rarity: "Rare",
  },
  {
    id: "walker-free",
    title: "Walker Free",
    description: "Walk without assistive device for first time",
    icon: "🎉",
    category: "Milestones",
    unlockCriteria: { type: "milestone", target: 1, current: 0 },
    unlocked: false,
    rarity: "Epic",
  },
  {
    id: "7-day-streak",
    title: "Week Warrior",
    description: "Complete PT exercises for 7 days straight",
    icon: "💪",
    category: "Exercise",
    unlockCriteria: { type: "days", target: 7, current: 0 },
    unlocked: false,
    rarity: "Rare",
  },
  {
    id: "30-day-streak",
    title: "Monthly Champion",
    description: "Complete PT exercises for 30 days straight",
    icon: "🏆",
    category: "Exercise",
    unlockCriteria: { type: "days", target: 30, current: 0 },
    unlocked: false,
    rarity: "Legendary",
  },
  {
    id: "30-days-post-op",
    title: "One Month Strong",
    description: "Reach 30 days post-surgery",
    icon: "📅",
    category: "Progress",
    unlockCriteria: { type: "days", target: 30, current: 0 },
    unlocked: false,
    rarity: "Common",
  },
  {
    id: "90-days-post-op",
    title: "Three Month Milestone",
    description: "Reach 90 days post-surgery",
    icon: "🎯",
    category: "Progress",
    unlockCriteria: { type: "days", target: 90, current: 0 },
    unlocked: false,
    rarity: "Rare",
  },
  {
    id: "6-month-recovery",
    title: "Half Year Hero",
    description: "Reach 6 months post-surgery",
    icon: "🌟",
    category: "Progress",
    unlockCriteria: { type: "days", target: 180, current: 0 },
    unlocked: false,
    rarity: "Epic",
  },
  {
    id: "full-recovery",
    title: "Full Recovery Champion",
    description: "Complete 1 year of recovery",
    icon: "👑",
    category: "Progress",
    unlockCriteria: { type: "days", target: 365, current: 0 },
    unlocked: false,
    rarity: "Legendary",
  },
  {
    id: "exercise-master",
    title: "Exercise Master",
    description: "Complete 100 PT exercises total",
    icon: "💯",
    category: "Exercise",
    unlockCriteria: { type: "exercises", target: 100, current: 0 },
    unlocked: false,
    rarity: "Epic",
  },
  {
    id: "mile-walker",
    title: "Mile Walker",
    description: "Walk 1 mile (5,280 feet) in a day",
    icon: "🚶‍♂️",
    category: "Mobility",
    unlockCriteria: { type: "distance", target: 5280, current: 0 },
    unlocked: false,
    rarity: "Rare",
  },
];

export const checkAchievementUnlock = (
  achievement: Achievement,
  currentValue: number
): boolean => {
  return currentValue >= achievement.unlockCriteria.target;
};

export const getAchievementProgress = (achievement: Achievement): number => {
  const current = achievement.unlockCriteria.current || 0;
  const target = achievement.unlockCriteria.target;
  return Math.min(Math.round((current / target) * 100), 100);
};

export const getUnlockedAchievements = (achievements: Achievement[]): Achievement[] => {
  return achievements.filter((a) => a.unlocked);
};

export const getNextAchievements = (achievements: Achievement[]): Achievement[] => {
  // Return top 3 closest to unlocking
  return achievements
    .filter((a) => !a.unlocked)
    .sort((a, b) => {
      const progressA = getAchievementProgress(a);
      const progressB = getAchievementProgress(b);
      return progressB - progressA;
    })
    .slice(0, 3);
};

export const getRarityColor = (rarity: Achievement["rarity"]): string => {
  switch (rarity) {
    case "Common":
      return "#9CA3AF"; // Gray
    case "Rare":
      return "#3B82F6"; // Blue
    case "Epic":
      return "#A855F7"; // Purple
    case "Legendary":
      return "#F59E0B"; // Gold
  }
};

export const getCategoryIcon = (category: Achievement["category"]): string => {
  switch (category) {
    case "Mobility":
      return "🚶";
    case "Milestones":
      return "🎯";
    case "Exercise":
      return "💪";
    case "Progress":
      return "📈";
  }
};
