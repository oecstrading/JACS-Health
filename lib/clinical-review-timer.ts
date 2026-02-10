/**
 * Clinical Review Timer Module
 * 
 * Tracks staff session time when viewing shared dashboard for Medicare billing.
 * Generates Monthly Billing Support Statement for CPT 99470/99457 codes.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReviewSession {
  id: string;
  staffName: string;
  staffRole: string; // 'doctor', 'nurse', 'medical_assistant'
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  pagesViewed: string[];
  createdAt: Date;
}

const STORAGE_KEY = '@healthmate_review_sessions';

/**
 * Get all review sessions
 */
export async function getReviewSessions(): Promise<ReviewSession[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    
    const sessions = JSON.parse(json);
    return sessions.map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: new Date(session.endTime),
      createdAt: new Date(session.createdAt),
    }));
  } catch (error) {
    console.error('Error loading review sessions:', error);
    return [];
  }
}

/**
 * Start a new review session
 */
export async function startReviewSession(
  staffName: string,
  staffRole: string
): Promise<string> {
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: Partial<ReviewSession> = {
      id: sessionId,
      staffName,
      staffRole,
      startTime: new Date(),
      pagesViewed: [],
      createdAt: new Date(),
    };
    
    // Store active session separately
    await AsyncStorage.setItem('@healthmate_active_session', JSON.stringify(session));
    
    return sessionId;
  } catch (error) {
    console.error('Error starting review session:', error);
    throw error;
  }
}

/**
 * Track page view in active session
 */
export async function trackPageView(pageName: string): Promise<void> {
  try {
    const activeSessionJson = await AsyncStorage.getItem('@healthmate_active_session');
    if (!activeSessionJson) return;
    
    const session = JSON.parse(activeSessionJson);
    if (!session.pagesViewed.includes(pageName)) {
      session.pagesViewed.push(pageName);
      await AsyncStorage.setItem('@healthmate_active_session', JSON.stringify(session));
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

/**
 * End the active review session
 */
export async function endReviewSession(): Promise<ReviewSession | null> {
  try {
    const activeSessionJson = await AsyncStorage.getItem('@healthmate_active_session');
    if (!activeSessionJson) return null;
    
    const session = JSON.parse(activeSessionJson);
    const endTime = new Date();
    const startTime = new Date(session.startTime);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000); // minutes
    
    const completedSession: ReviewSession = {
      ...session,
      startTime,
      endTime,
      duration,
      createdAt: new Date(session.createdAt),
    };
    
    // Add to sessions list
    const sessions = await getReviewSessions();
    sessions.unshift(completedSession);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    
    // Clear active session
    await AsyncStorage.removeItem('@healthmate_active_session');
    
    return completedSession;
  } catch (error) {
    console.error('Error ending review session:', error);
    return null;
  }
}

/**
 * Get review sessions for a specific date range
 */
export async function getReviewSessionsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<ReviewSession[]> {
  const sessions = await getReviewSessions();
  
  return sessions.filter(session => {
    const sessionDate = new Date(session.startTime);
    return sessionDate >= startDate && sessionDate <= endDate;
  });
}

/**
 * Get review sessions for current billing cycle (current month)
 */
export async function getCurrentBillingCycleReviewSessions(): Promise<ReviewSession[]> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  return getReviewSessionsByDateRange(startOfMonth, endOfMonth);
}

/**
 * Get total review time for current billing cycle
 */
export async function getTotalReviewTime(): Promise<number> {
  const sessions = await getCurrentBillingCycleReviewSessions();
  return sessions.reduce((total, session) => total + session.duration, 0);
}

/**
 * Generate Monthly Billing Support Statement
 */
export interface ReviewBillingStatement {
  month: string;
  year: number;
  totalSessions: number;
  totalDuration: number;
  eligibleForCPT99470: boolean; // 10+ minutes
  eligibleForCPT99457: boolean; // 20+ minutes
  sessionsByStaff: {
    staffName: string;
    staffRole: string;
    sessionCount: number;
    totalDuration: number;
  }[];
  sessions: ReviewSession[];
}

export async function generateReviewBillingStatement(
  month: number,
  year: number
): Promise<ReviewBillingStatement> {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);
  
  const sessions = await getReviewSessionsByDateRange(startDate, endDate);
  const totalDuration = sessions.reduce((total, session) => total + session.duration, 0);
  
  // Group by staff
  const staffMap = new Map<string, { role: string; count: number; duration: number }>();
  sessions.forEach(session => {
    const existing = staffMap.get(session.staffName);
    if (existing) {
      existing.count++;
      existing.duration += session.duration;
    } else {
      staffMap.set(session.staffName, {
        role: session.staffRole,
        count: 1,
        duration: session.duration,
      });
    }
  });
  
  const sessionsByStaff = Array.from(staffMap.entries()).map(([staffName, data]) => ({
    staffName,
    staffRole: data.role,
    sessionCount: data.count,
    totalDuration: data.duration,
  }));
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return {
    month: monthNames[month],
    year,
    totalSessions: sessions.length,
    totalDuration,
    eligibleForCPT99470: totalDuration >= 10,
    eligibleForCPT99457: totalDuration >= 20,
    sessionsByStaff,
    sessions,
  };
}

/**
 * Check if review time threshold is met for current billing cycle
 */
export async function isReviewTimeThresholdMet(minutes: number): Promise<boolean> {
  const totalTime = await getTotalReviewTime();
  return totalTime >= minutes;
}
