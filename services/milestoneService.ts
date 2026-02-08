/**
 * Health Milestone Celebrations Service
 * Tracks achievements and celebrates milestones with animated badges
 * and family notifications
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export type MilestoneType =
  | 'medication_adherence_30'
  | 'steps_10000'
  | 'vitals_logging_7'
  | 'weight_goal'
  | 'bp_control_30'
  | 'exercise_streak_7'
  | 'perfect_week'
  | 'health_score_90';

export interface Milestone {
  id: string;
  type: MilestoneType;
  title: string;
  description: string;
  icon: string;
  requirement: string;
  progress: number;
  target: number;
  achieved: boolean;
  achievedDate?: string;
  badge: string;
}

export interface Achievement {
  id: string;
  milestoneId: string;
  milestoneType: MilestoneType;
  title: string;
  achievedDate: string;
  badge: string;
  celebrated: boolean;
}

const STORAGE_KEY = 'health_milestones';
const ACHIEVEMENTS_KEY = 'health_achievements';

class MilestoneService {
  private milestones: Milestone[] = [];
  private achievements: Achievement[] = [];
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Initialize the milestone service
   */
  async initialize(): Promise<void> {
    try {
      await this.loadMilestones();
      await this.loadAchievements();
      await this.initializeDefaultMilestones();
      this.startProgressTracking();
    } catch (error) {
      console.error('Failed to initialize milestone service:', error);
    }
  }

  /**
   * Load milestones from storage
   */
  private async loadMilestones(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.milestones = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load milestones:', error);
    }
  }

  /**
   * Load achievements from storage
   */
  private async loadAchievements(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
      if (stored) {
        this.achievements = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  }

  /**
   * Save milestones to storage
   */
  private async saveMilestones(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.milestones));
    } catch (error) {
      console.error('Failed to save milestones:', error);
    }
  }

  /**
   * Save achievements to storage
   */
  private async saveAchievements(): Promise<void> {
    try {
      await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(this.achievements));
    } catch (error) {
      console.error('Failed to save achievements:', error);
    }
  }

  /**
   * Initialize default milestones if not already created
   */
  private async initializeDefaultMilestones(): Promise<void> {
    if (this.milestones.length > 0) return;

    const defaultMilestones: Milestone[] = [
      {
        id: 'milestone-med-30',
        type: 'medication_adherence_30',
        title: '30-Day Medication Master',
        description: 'Take all medications on time for 30 consecutive days',
        icon: '💊',
        requirement: '30 days perfect adherence',
        progress: 0,
        target: 30,
        achieved: false,
        badge: '🏆',
      },
      {
        id: 'milestone-steps-10k',
        type: 'steps_10000',
        title: '10,000 Steps Champion',
        description: 'Walk 10,000 steps in a single day',
        icon: '👟',
        requirement: '10,000 steps in one day',
        progress: 0,
        target: 10000,
        achieved: false,
        badge: '🥇',
      },
      {
        id: 'milestone-vitals-7',
        type: 'vitals_logging_7',
        title: '7-Day Health Tracker',
        description: 'Log your vitals every day for 7 consecutive days',
        icon: '📊',
        requirement: '7 days consecutive logging',
        progress: 0,
        target: 7,
        achieved: false,
        badge: '⭐',
      },
      {
        id: 'milestone-bp-30',
        type: 'bp_control_30',
        title: 'Blood Pressure Pro',
        description: 'Maintain healthy blood pressure for 30 days',
        icon: '❤️',
        requirement: '30 days in normal range',
        progress: 0,
        target: 30,
        achieved: false,
        badge: '💙',
      },
      {
        id: 'milestone-exercise-7',
        type: 'exercise_streak_7',
        title: '7-Day Exercise Streak',
        description: 'Exercise every day for 7 consecutive days',
        icon: '💪',
        requirement: '7 days consecutive exercise',
        progress: 0,
        target: 7,
        achieved: false,
        badge: '🔥',
      },
      {
        id: 'milestone-perfect-week',
        type: 'perfect_week',
        title: 'Perfect Week',
        description: 'Complete all health goals for 7 consecutive days',
        icon: '🌟',
        requirement: 'All goals met for 7 days',
        progress: 0,
        target: 7,
        achieved: false,
        badge: '💫',
      },
      {
        id: 'milestone-health-score',
        type: 'health_score_90',
        title: 'Health Score Elite',
        description: 'Achieve a health score of 90 or higher',
        icon: '📈',
        requirement: 'Health score ≥ 90',
        progress: 0,
        target: 90,
        achieved: false,
        badge: '🎯',
      },
    ];

    this.milestones = defaultMilestones;
    await this.saveMilestones();
  }

  /**
   * Start automatic progress tracking
   */
  private startProgressTracking(): void {
    // Check progress every hour
    this.checkInterval = setInterval(async () => {
      await this.updateAllProgress();
    }, 60 * 60 * 1000); // 1 hour

    // Also check immediately
    this.updateAllProgress();
  }

  /**
   * Update progress for all milestones
   */
  async updateAllProgress(): Promise<void> {
    await this.updateMedicationAdherenceMilestone();
    await this.updateStepsMilestone();
    await this.updateVitalsLoggingMilestone();
    await this.updateBPControlMilestone();
    await this.updateExerciseStreakMilestone();
    await this.updatePerfectWeekMilestone();
    await this.updateHealthScoreMilestone();
  }

  /**
   * Update 30-day medication adherence milestone
   */
  private async updateMedicationAdherenceMilestone(): Promise<void> {
    try {
      const milestone = this.milestones.find(m => m.type === 'medication_adherence_30');
      if (!milestone || milestone.achieved) return;

      // Get medication logs from the last 30 days
      const logs = await this.getMedicationLogs(30);
      
      // Calculate consecutive days of perfect adherence
      const consecutiveDays = this.calculateConsecutiveDays(logs);
      
      milestone.progress = consecutiveDays;
      
      if (consecutiveDays >= 30) {
        await this.achieveMilestone(milestone);
      }
      
      await this.saveMilestones();
    } catch (error) {
      console.error('Failed to update medication adherence milestone:', error);
    }
  }

  /**
   * Update 10,000 steps milestone
   */
  private async updateStepsMilestone(): Promise<void> {
    try {
      const milestone = this.milestones.find(m => m.type === 'steps_10000');
      if (!milestone || milestone.achieved) return;

      // Get today's step count
      const steps = await this.getTodaySteps();
      
      milestone.progress = steps;
      
      if (steps >= 10000) {
        await this.achieveMilestone(milestone);
      }
      
      await this.saveMilestones();
    } catch (error) {
      console.error('Failed to update steps milestone:', error);
    }
  }

  /**
   * Update 7-day vitals logging milestone
   */
  private async updateVitalsLoggingMilestone(): Promise<void> {
    try {
      const milestone = this.milestones.find(m => m.type === 'vitals_logging_7');
      if (!milestone || milestone.achieved) return;

      // Get vitals logs from the last 7 days
      const consecutiveDays = await this.getConsecutiveVitalsLoggingDays();
      
      milestone.progress = consecutiveDays;
      
      if (consecutiveDays >= 7) {
        await this.achieveMilestone(milestone);
      }
      
      await this.saveMilestones();
    } catch (error) {
      console.error('Failed to update vitals logging milestone:', error);
    }
  }

  /**
   * Update 30-day blood pressure control milestone
   */
  private async updateBPControlMilestone(): Promise<void> {
    try {
      const milestone = this.milestones.find(m => m.type === 'bp_control_30');
      if (!milestone || milestone.achieved) return;

      // Get BP readings from the last 30 days
      const consecutiveDays = await this.getConsecutiveBPControlDays();
      
      milestone.progress = consecutiveDays;
      
      if (consecutiveDays >= 30) {
        await this.achieveMilestone(milestone);
      }
      
      await this.saveMilestones();
    } catch (error) {
      console.error('Failed to update BP control milestone:', error);
    }
  }

  /**
   * Update 7-day exercise streak milestone
   */
  private async updateExerciseStreakMilestone(): Promise<void> {
    try {
      const milestone = this.milestones.find(m => m.type === 'exercise_streak_7');
      if (!milestone || milestone.achieved) return;

      // Get exercise logs from the last 7 days
      const consecutiveDays = await this.getConsecutiveExerciseDays();
      
      milestone.progress = consecutiveDays;
      
      if (consecutiveDays >= 7) {
        await this.achieveMilestone(milestone);
      }
      
      await this.saveMilestones();
    } catch (error) {
      console.error('Failed to update exercise streak milestone:', error);
    }
  }

  /**
   * Update perfect week milestone
   */
  private async updatePerfectWeekMilestone(): Promise<void> {
    try {
      const milestone = this.milestones.find(m => m.type === 'perfect_week');
      if (!milestone || milestone.achieved) return;

      // Check if all goals were met for the last 7 days
      const perfectDays = await this.getConsecutivePerfectDays();
      
      milestone.progress = perfectDays;
      
      if (perfectDays >= 7) {
        await this.achieveMilestone(milestone);
      }
      
      await this.saveMilestones();
    } catch (error) {
      console.error('Failed to update perfect week milestone:', error);
    }
  }

  /**
   * Update health score milestone
   */
  private async updateHealthScoreMilestone(): Promise<void> {
    try {
      const milestone = this.milestones.find(m => m.type === 'health_score_90');
      if (!milestone || milestone.achieved) return;

      // Get current health score
      const score = await this.getCurrentHealthScore();
      
      milestone.progress = score;
      
      if (score >= 90) {
        await this.achieveMilestone(milestone);
      }
      
      await this.saveMilestones();
    } catch (error) {
      console.error('Failed to update health score milestone:', error);
    }
  }

  /**
   * Mark a milestone as achieved and celebrate
   */
  private async achieveMilestone(milestone: Milestone): Promise<void> {
    if (milestone.achieved) return;

    milestone.achieved = true;
    milestone.achievedDate = new Date().toISOString();
    
    // Create achievement record
    const achievement: Achievement = {
      id: `achievement-${Date.now()}`,
      milestoneId: milestone.id,
      milestoneType: milestone.type,
      title: milestone.title,
      achievedDate: milestone.achievedDate,
      badge: milestone.badge,
      celebrated: false,
    };
    
    this.achievements.push(achievement);
    await this.saveAchievements();
    await this.saveMilestones();
    
    // Send celebration notification
    await this.sendCelebrationNotification(milestone);
    
    // Notify family members
    await this.notifyFamily(milestone);
  }

  /**
   * Send celebration notification
   */
  private async sendCelebrationNotification(milestone: Milestone): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🎉 Milestone Achieved!`,
          body: `Congratulations! You've earned "${milestone.title}" ${milestone.badge}`,
          data: {
            type: 'milestone_achieved',
            milestoneId: milestone.id,
            milestoneType: milestone.type,
          },
          sound: true,
          priority: 'high',
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to send celebration notification:', error);
    }
  }

  /**
   * Notify family members about milestone achievement
   */
  private async notifyFamily(milestone: Milestone): Promise<void> {
    try {
      const caregivers = await AsyncStorage.getItem('caregivers');
      if (caregivers) {
        const caregiversList = JSON.parse(caregivers);
        
        // In production, send push notifications to caregiver devices
        console.log('Notifying family about milestone:', milestone.title);
        
        // Also add to Care Circle feed
        await this.addToCareCircleFeed(milestone);
      }
    } catch (error) {
      console.error('Failed to notify family:', error);
    }
  }

  /**
   * Add milestone achievement to Care Circle feed
   */
  private async addToCareCircleFeed(milestone: Milestone): Promise<void> {
    try {
      const feed = await AsyncStorage.getItem('care_circle_feed');
      const feedItems = feed ? JSON.parse(feed) : [];
      
      feedItems.push({
        id: `feed-${Date.now()}`,
        type: 'milestone',
        title: `🎉 Milestone Achieved!`,
        message: `${milestone.title} - ${milestone.description}`,
        badge: milestone.badge,
        timestamp: new Date().toISOString(),
      });
      
      await AsyncStorage.setItem('care_circle_feed', JSON.stringify(feedItems));
    } catch (error) {
      console.error('Failed to add to Care Circle feed:', error);
    }
  }

  /**
   * Helper methods to calculate progress
   */
  
  private async getMedicationLogs(days: number): Promise<any[]> {
    try {
      const stored = await AsyncStorage.getItem('medication_logs');
      if (!stored) return [];
      
      const logs = JSON.parse(stored);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return logs.filter((log: any) => new Date(log.takenTime) >= cutoffDate);
    } catch (error) {
      return [];
    }
  }

  private calculateConsecutiveDays(logs: any[]): number {
    // Simplified: count days with at least one medication taken
    const uniqueDays = new Set(
      logs.map(log => new Date(log.takenTime).toDateString())
    );
    return uniqueDays.size;
  }

  private async getTodaySteps(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem('activities');
      if (!stored) return 0;
      
      const activities = JSON.parse(stored);
      const today = new Date().toDateString();
      const todayActivity = activities.find(
        (a: any) => new Date(a.date).toDateString() === today
      );
      
      return todayActivity?.steps || 0;
    } catch (error) {
      return 0;
    }
  }

  private async getConsecutiveVitalsLoggingDays(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem('vitals');
      if (!stored) return 0;
      
      const vitals = JSON.parse(stored);
      const uniqueDays = new Set(
        vitals.map((v: any) => new Date(v.timestamp).toDateString())
      );
      
      return Math.min(uniqueDays.size, 7);
    } catch (error) {
      return 0;
    }
  }

  private async getConsecutiveBPControlDays(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem('vitals');
      if (!stored) return 0;
      
      const vitals = JSON.parse(stored);
      const bpReadings = vitals.filter((v: any) => v.type === 'blood_pressure');
      
      const normalDays = bpReadings.filter(
        (v: any) => v.systolic >= 90 && v.systolic <= 140 && v.diastolic >= 60 && v.diastolic <= 90
      );
      
      const uniqueDays = new Set(
        normalDays.map((v: any) => new Date(v.timestamp).toDateString())
      );
      
      return Math.min(uniqueDays.size, 30);
    } catch (error) {
      return 0;
    }
  }

  private async getConsecutiveExerciseDays(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem('activities');
      if (!stored) return 0;
      
      const activities = JSON.parse(stored);
      const exerciseDays = activities.filter((a: any) => a.exercised === true);
      
      return Math.min(exerciseDays.length, 7);
    } catch (error) {
      return 0;
    }
  }

  private async getConsecutivePerfectDays(): Promise<number> {
    // Simplified: check if all health goals were met
    return 0; // Implement based on your goals system
  }

  private async getCurrentHealthScore(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem('health_score');
      if (!stored) return 0;
      
      const scoreData = JSON.parse(stored);
      return scoreData.score || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get all milestones
   */
  getMilestones(): Milestone[] {
    return this.milestones;
  }

  /**
   * Get all achievements
   */
  getAchievements(): Achievement[] {
    return this.achievements;
  }

  /**
   * Get uncelebrated achievements
   */
  getUncelebratedAchievements(): Achievement[] {
    return this.achievements.filter(a => !a.celebrated);
  }

  /**
   * Mark achievement as celebrated
   */
  async markAsCelebrated(achievementId: string): Promise<void> {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (achievement) {
      achievement.celebrated = true;
      await this.saveAchievements();
    }
  }

  /**
   * Stop the service
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// Export singleton instance
export const milestoneService = new MilestoneService();
