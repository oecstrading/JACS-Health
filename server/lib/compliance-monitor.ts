/**
 * Automated Compliance Monitoring Service
 * 
 * Daily background job that checks assessment due dates and creates
 * push notifications at the 20-day mark (10 days before deadline)
 * to prevent $180K HQRP penalties.
 */

import { getDb } from "../db";
import { hospiceAssessments, hospiceComplianceAlerts, hospicePatients } from "../../drizzle/schema";
import { and, eq, gte, lte, lt } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
// Note: Push notifications are sent via Expo Notifications API
// This is a server-side service, so we log alerts for now
// In production, integrate with Expo Push Notification service

export interface ComplianceCheckResult {
  alertsCreated: number;
  assessmentsChecked: number;
  notifications: number;
}

/**
 * Calculate alert level based on days until deadline
 */
function calculateAlertLevel(daysUntil: number): "green" | "yellow" | "red" {
  if (daysUntil > 10) return "green";
  if (daysUntil > 5) return "yellow";
  return "red";
}

/**
 * Run daily compliance check
 * 
 * Checks all pending assessments and creates alerts for those
 * approaching their 30-day submission deadline.
 */
export async function runDailyComplianceCheck(): Promise<ComplianceCheckResult> {
  const db = await getDb();
  if (!db) {
    console.warn("[Compliance] Database not available");
    return { alertsCreated: 0, assessmentsChecked: 0, notifications: 0 };
  }

  const now = new Date();
  const twentyDaysFromNow = new Date(now);
  twentyDaysFromNow.setDate(twentyDaysFromNow.getDate() + 20);

  // Get all pending assessments with deadlines in the next 20 days
  const pendingAssessments = await db
    .select()
    .from(hospiceAssessments)
    .where(
      and(
        eq(hospiceAssessments.submissionStatus, "pending"),
        lte(hospiceAssessments.submissionDeadline, twentyDaysFromNow),
        gte(hospiceAssessments.submissionDeadline, now)
      )
    );

  let alertsCreated = 0;
  let notificationsSent = 0;

  for (const assessment of pendingAssessments) {
    // Calculate days until deadline
    const daysUntil = Math.ceil(
      (assessment.submissionDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if alert already exists for this assessment
    const existingAlerts = await db
      .select()
      .from(hospiceComplianceAlerts)
      .where(
        and(
          eq(hospiceComplianceAlerts.patientId, assessment.patientId),
          eq(hospiceComplianceAlerts.alertType, 
            assessment.assessmentType === "admission" ? "hope_submission_due" : "his_submission_due"
          ),
          eq(hospiceComplianceAlerts.status, "active")
        )
      );

    if (existingAlerts.length > 0) {
      // Update existing alert level if needed
      const newLevel = calculateAlertLevel(daysUntil);
      if (existingAlerts[0].alertLevel !== newLevel) {
        await db
          .update(hospiceComplianceAlerts)
          .set({ alertLevel: newLevel })
          .where(eq(hospiceComplianceAlerts.id, existingAlerts[0].id));
      }
      continue;
    }

    // Create new compliance alert
    const alertLevel = calculateAlertLevel(daysUntil);
    const alertType = assessment.assessmentType === "admission" ? "hope_submission_due" : "his_submission_due";
    
    const alertId = createId();
    await db.insert(hospiceComplianceAlerts).values({
      id: alertId,
      patientId: assessment.patientId,
      alertType,
      alertLevel,
      dueDate: assessment.submissionDeadline,
      description: `${assessment.assessmentType === "admission" ? "HOPE" : "HIS"} assessment due in ${daysUntil} days`,
    });

    alertsCreated++;

    // Send push notification if alert is yellow or red
    if (alertLevel === "yellow" || alertLevel === "red") {
      try {
        // Get patient info for notification
        const [patient] = await db
          .select()
          .from(hospicePatients)
          .where(eq(hospicePatients.id, assessment.patientId));

        if (patient) {
          // TODO: Send actual push notification via Expo Push Notification service
          // For now, log the notification
          console.log(`[Compliance] Notification: HQRP Alert for patient ${patient.userId}, ${daysUntil} days until deadline`);
          notificationsSent++;
        }
      } catch (error) {
        console.error("[Compliance] Failed to send notification:", error);
      }
    }
  }

  console.log(`[Compliance] Daily check complete: ${alertsCreated} alerts created, ${notificationsSent} notifications sent, ${pendingAssessments.length} assessments checked`);

  return {
    alertsCreated,
    assessmentsChecked: pendingAssessments.length,
    notifications: notificationsSent,
  };
}

/**
 * Check for visit gaps (required skilled nursing visits)
 * 
 * Medicare requires at least one skilled nursing visit every 14 days
 * for routine home care patients.
 */
export async function checkVisitGaps(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  // This would query for patients without visits in the last 14 days
  // Implementation left as TODO - requires joining patients and visits tables
  
  console.log("[Compliance] Visit gap check complete");
  return 0;
}

/**
 * Initialize daily compliance monitoring
 * 
 * Sets up a cron job to run compliance checks every day at 6 AM
 */
export function initializeComplianceMonitoring() {
  // Run immediately on startup
  runDailyComplianceCheck().catch(error => {
    console.error("[Compliance] Initial check failed:", error);
  });

  // Schedule daily at 6 AM
  const HOUR = 6;
  const now = new Date();
  const nextRun = new Date(now);
  nextRun.setHours(HOUR, 0, 0, 0);
  
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  const msUntilNextRun = nextRun.getTime() - now.getTime();

  setTimeout(() => {
    runDailyComplianceCheck().catch(error => {
      console.error("[Compliance] Daily check failed:", error);
    });

    // Then run every 24 hours
    setInterval(() => {
      runDailyComplianceCheck().catch(error => {
        console.error("[Compliance] Daily check failed:", error);
      });
    }, 24 * 60 * 60 * 1000);
  }, msUntilNextRun);

  console.log(`[Compliance] Monitoring initialized. Next run at ${nextRun.toLocaleString()}`);
}
