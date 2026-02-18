/**
 * De-identification Service
 * 
 * Removes personally identifiable information (PII) from health data
 * before processing by AI models, ensuring HIPAA compliance
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  address?: string;
  emergencyContacts?: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
}

export interface HealthData {
  vitals?: Array<{
    type: string;
    value: number;
    unit: string;
    timestamp: string;
  }>;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  activities?: Array<{
    type: string;
    duration: number;
    timestamp: string;
  }>;
  symptoms?: Array<{
    description: string;
    severity: number;
    timestamp: string;
  }>;
}

export interface DeidentifiedData {
  anonymousId: string;
  ageRange: string;
  healthData: HealthData;
  metadata: {
    deidentifiedAt: string;
    method: 'hash' | 'pseudonym';
  };
}

class DeidentificationService {
  private pseudonymMap: Map<string, string> = new Map();

  /**
   * De-identify user data by removing PII
   * 
   * @param userId - Original user ID
   * @param profile - User profile with PII
   * @param healthData - Health data to anonymize
   * @returns De-identified data safe for AI processing
   */
  async deidentify(
    userId: string,
    profile: UserProfile,
    healthData: HealthData
  ): Promise<DeidentifiedData> {
    // Generate anonymous ID (consistent hash of user ID)
    const anonymousId = await this.generateAnonymousId(userId);

    // Convert exact date of birth to age range
    const ageRange = this.calculateAgeRange(profile.dateOfBirth);

    // Remove timestamps from health data (keep only date)
    const sanitizedHealthData = this.sanitizeHealthData(healthData);

    return {
      anonymousId,
      ageRange,
      healthData: sanitizedHealthData,
      metadata: {
        deidentifiedAt: new Date().toISOString(),
        method: 'hash',
      },
    };
  }

  /**
   * Generate a consistent anonymous ID from user ID
   * Uses SHA-256 hash to ensure same user always gets same anonymous ID
   */
  private async generateAnonymousId(userId: string): Promise<string> {
    const { encryptionService } = await import('./encryptionService');
    const hash = await encryptionService.hash(userId + 'healthmate_salt');
    // Return first 16 characters of hash
    return hash.substring(0, 16);
  }

  /**
   * Convert exact date of birth to age range for privacy
   * 
   * @param dateOfBirth - ISO date string
   * @returns Age range (e.g., "65-70", "70-75")
   */
  private calculateAgeRange(dateOfBirth: string): string {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    // Group into 5-year ranges
    const rangeStart = Math.floor(age / 5) * 5;
    const rangeEnd = rangeStart + 4;

    return `${rangeStart}-${rangeEnd}`;
  }

  /**
   * Sanitize health data by removing precise timestamps
   * Keeps only date information to prevent re-identification
   */
  private sanitizeHealthData(healthData: HealthData): HealthData {
    const sanitized: HealthData = {};

    // Sanitize vitals
    if (healthData.vitals) {
      sanitized.vitals = healthData.vitals.map(vital => ({
        ...vital,
        timestamp: this.truncateToDate(vital.timestamp),
      }));
    }

    // Medications don't need timestamp sanitization
    if (healthData.medications) {
      sanitized.medications = healthData.medications;
    }

    // Sanitize activities
    if (healthData.activities) {
      sanitized.activities = healthData.activities.map(activity => ({
        ...activity,
        timestamp: this.truncateToDate(activity.timestamp),
      }));
    }

    // Sanitize symptoms
    if (healthData.symptoms) {
      sanitized.symptoms = healthData.symptoms.map(symptom => ({
        ...symptom,
        timestamp: this.truncateToDate(symptom.timestamp),
      }));
    }

    return sanitized;
  }

  /**
   * Truncate ISO timestamp to date only (YYYY-MM-DD)
   */
  private truncateToDate(timestamp: string): string {
    return timestamp.split('T')[0];
  }

  /**
   * Re-identify data (map anonymous ID back to user ID)
   * Only used when necessary for delivering personalized results
   * 
   * @param anonymousId - Anonymous ID from de-identified data
   * @returns Original user ID or null if not found
   */
  async reidentify(anonymousId: string): Promise<string | null> {
    // In production, this would query a secure mapping database
    // For now, return null as we use one-way hashing
    return null;
  }

  /**
   * Check if data contains PII that should be removed
   */
  containsPII(data: any): boolean {
    const piiPatterns = [
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/, // Names (First Last)
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{3}-\d{3}-\d{4}\b/, // Phone numbers
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{1,5}\s\w+\s(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)\b/i, // Addresses
    ];

    const dataString = JSON.stringify(data);

    return piiPatterns.some(pattern => pattern.test(dataString));
  }

  /**
   * Remove specific PII fields from an object
   */
  removePII(data: any): any {
    const piiFields = [
      'name',
      'email',
      'phone',
      'address',
      'ssn',
      'emergencyContacts',
      'fullName',
      'firstName',
      'lastName',
    ];

    const cleaned = { ...data };

    for (const field of piiFields) {
      if (field in cleaned) {
        delete cleaned[field];
      }
    }

    return cleaned;
  }

  /**
   * Aggregate data for trend analysis without individual identification
   * 
   * @param dataPoints - Array of health data points
   * @returns Aggregated statistics
   */
  aggregateData(dataPoints: Array<{ value: number; timestamp: string }>): {
    average: number;
    min: number;
    max: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  } {
    if (dataPoints.length === 0) {
      return { average: 0, min: 0, max: 0, trend: 'stable' };
    }

    const values = dataPoints.map(dp => dp.value);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Calculate trend
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (changePercent > 5) {
      trend = 'increasing';
    } else if (changePercent < -5) {
      trend = 'decreasing';
    }

    return { average, min, max, trend };
  }
}

export const deidentificationService = new DeidentificationService();
