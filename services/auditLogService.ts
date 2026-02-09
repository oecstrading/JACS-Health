/**
 * Audit Log Service
 * 
 * Tracks all access to sensitive health data for HIPAA compliance
 * Creates immutable, timestamped logs of caregiver actions
 */

import { secureStorage } from './secureStorageService';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string; // Patient ID
  caregiverId: string;
  caregiverName: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId?: string;
  ipAddress?: string;
  deviceInfo?: string;
  success: boolean;
  failureReason?: string;
  metadata?: Record<string, any>;
}

export enum AuditAction {
  VIEW_DASHBOARD = 'view_dashboard',
  VIEW_VITALS = 'view_vitals',
  VIEW_MEDICATIONS = 'view_medications',
  VIEW_ACTIVITIES = 'view_activities',
  VIEW_HEALTH_RECORDS = 'view_health_records',
  EXPORT_DATA = 'export_data',
  LOGIN = 'login',
  LOGOUT = 'logout',
  FAILED_LOGIN = 'failed_login',
  CHANGE_PERMISSIONS = 'change_permissions',
  SEND_MESSAGE = 'send_message',
  VIEW_ALERTS = 'view_alerts',
}

export enum ResourceType {
  DASHBOARD = 'dashboard',
  VITALS = 'vitals',
  MEDICATIONS = 'medications',
  ACTIVITIES = 'activities',
  HEALTH_RECORDS = 'health_records',
  PROFILE = 'profile',
  ALERTS = 'alerts',
  MESSAGES = 'messages',
}

class AuditLogService {
  private readonly STORAGE_KEY = 'audit_logs';
  private readonly MAX_LOGS = 10000; // Keep last 10,000 entries

  /**
   * Log an access event
   */
  async logAccess(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      const logEntry: AuditLogEntry = {
        ...entry,
        id: this.generateLogId(),
        timestamp: new Date().toISOString(),
      };

      // Get existing logs
      const logs = await this.getLogs(entry.userId);

      // Add new log
      logs.unshift(logEntry);

      // Keep only MAX_LOGS entries
      if (logs.length > this.MAX_LOGS) {
        logs.splice(this.MAX_LOGS);
      }

      // Save updated logs
      await secureStorage.setItem(`${this.STORAGE_KEY}_${entry.userId}`, logs);

      // Also log to console in development
      if (__DEV__) {
        console.log('[AUDIT]', {
          action: entry.action,
          caregiver: entry.caregiverName,
          resource: entry.resourceType,
          success: entry.success,
        });
      }
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // Don't throw - audit logging should not break app functionality
    }
  }

  /**
   * Get all audit logs for a user
   */
  async getLogs(userId: string): Promise<AuditLogEntry[]> {
    try {
      const logs = await secureStorage.getItem<AuditLogEntry[]>(
        `${this.STORAGE_KEY}_${userId}`
      );
      return logs || [];
    } catch (error) {
      console.error('Failed to retrieve audit logs:', error);
      return [];
    }
  }

  /**
   * Get logs filtered by caregiver
   */
  async getLogsByCaregiver(
    userId: string,
    caregiverId: string
  ): Promise<AuditLogEntry[]> {
    const allLogs = await this.getLogs(userId);
    return allLogs.filter(log => log.caregiverId === caregiverId);
  }

  /**
   * Get logs filtered by action
   */
  async getLogsByAction(
    userId: string,
    action: AuditAction
  ): Promise<AuditLogEntry[]> {
    const allLogs = await this.getLogs(userId);
    return allLogs.filter(log => log.action === action);
  }

  /**
   * Get logs within a date range
   */
  async getLogsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AuditLogEntry[]> {
    const allLogs = await this.getLogs(userId);
    return allLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  /**
   * Get failed access attempts (security monitoring)
   */
  async getFailedAttempts(userId: string): Promise<AuditLogEntry[]> {
    const allLogs = await this.getLogs(userId);
    return allLogs.filter(log => !log.success);
  }

  /**
   * Get recent access summary for a caregiver
   */
  async getCaregiverAccessSummary(
    userId: string,
    caregiverId: string,
    days: number = 30
  ): Promise<{
    totalAccesses: number;
    lastAccess: string | null;
    accessesByType: Record<string, number>;
    failedAttempts: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.getLogsByCaregiver(userId, caregiverId);
    const recentLogs = logs.filter(
      log => new Date(log.timestamp) >= startDate
    );

    const accessesByType: Record<string, number> = {};
    let failedAttempts = 0;

    for (const log of recentLogs) {
      if (!log.success) {
        failedAttempts++;
      }

      const key = log.resourceType;
      accessesByType[key] = (accessesByType[key] || 0) + 1;
    }

    return {
      totalAccesses: recentLogs.length,
      lastAccess: recentLogs[0]?.timestamp || null,
      accessesByType,
      failedAttempts,
    };
  }

  /**
   * Export audit logs for compliance reporting
   */
  async exportLogs(
    userId: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const logs = await this.getLogs(userId);

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    } else {
      // CSV format
      const headers = [
        'Timestamp',
        'Caregiver',
        'Action',
        'Resource Type',
        'Success',
        'IP Address',
      ];

      const rows = logs.map(log => [
        log.timestamp,
        log.caregiverName,
        log.action,
        log.resourceType,
        log.success ? 'Yes' : 'No',
        log.ipAddress || 'N/A',
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');

      return csv;
    }
  }

  /**
   * Detect suspicious activity patterns
   */
  async detectSuspiciousActivity(userId: string): Promise<{
    suspicious: boolean;
    reasons: string[];
  }> {
    const logs = await this.getLogs(userId);
    const reasons: string[] = [];

    // Check for excessive failed login attempts
    const recentFailedLogins = logs
      .filter(log => log.action === AuditAction.FAILED_LOGIN)
      .filter(log => {
        const logDate = new Date(log.timestamp);
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        return logDate >= oneHourAgo;
      });

    if (recentFailedLogins.length >= 5) {
      reasons.push('Multiple failed login attempts in the past hour');
    }

    // Check for unusual access patterns (accessing many resources quickly)
    const recentAccesses = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      return logDate >= fiveMinutesAgo;
    });

    if (recentAccesses.length >= 20) {
      reasons.push('Unusually high number of accesses in short time period');
    }

    // Check for access from multiple IP addresses
    const uniqueIPs = new Set(
      logs
        .slice(0, 50) // Last 50 logs
        .map(log => log.ipAddress)
        .filter(Boolean)
    );

    if (uniqueIPs.size >= 5) {
      reasons.push('Access from multiple IP addresses');
    }

    return {
      suspicious: reasons.length > 0,
      reasons,
    };
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Clear all audit logs (use with caution - for account deletion only)
   */
  async clearLogs(userId: string): Promise<void> {
    await secureStorage.removeItem(`${this.STORAGE_KEY}_${userId}`);
  }
}

export const auditLogService = new AuditLogService();
