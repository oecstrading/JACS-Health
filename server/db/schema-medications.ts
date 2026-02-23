import { mysqlTable, varchar, text, timestamp, int, boolean, mysqlEnum } from "drizzle-orm/mysql-core";

/**
 * Medication Reminders Schema
 * 
 * Enables:
 * - Medication schedule management
 * - Push notification reminders
 * - Adherence tracking
 * - Medication history
 */

export const medicationReminders = mysqlTable("medication_reminders", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: varchar("user_id", { length: 128 }).notNull(),
  
  // Medication details
  medicationName: text("medication_name").notNull(),
  dosage: varchar("dosage", { length: 100 }).notNull(), // e.g., "10mg", "2 tablets"
  instructions: text("instructions"), // e.g., "Take with food"
  
  // Schedule
  frequency: mysqlEnum("frequency", [
    "once_daily",
    "twice_daily",
    "three_times_daily",
    "four_times_daily",
    "every_other_day",
    "weekly",
    "as_needed",
    "custom",
  ]).notNull(),
  
  // Times (JSON array of time strings, e.g., ["08:00", "20:00"])
  reminderTimes: text("reminder_times").notNull(),
  
  // Refill tracking
  pillCount: int("pill_count"),
  refillReminderDays: int("refill_reminder_days").default(7),
  
  // Status
  isActive: boolean("is_active").notNull().default(true),
  
  // Timestamps
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const medicationLogs = mysqlTable("medication_logs", {
  id: varchar("id", { length: 128 }).primaryKey(),
  reminderId: varchar("reminder_id", { length: 128 }).notNull(),
  userId: varchar("user_id", { length: 128 }).notNull(),
  
  // Log details
  scheduledTime: timestamp("scheduled_time").notNull(),
  takenTime: timestamp("taken_time"),
  status: mysqlEnum("status", ["taken", "skipped", "missed"]).notNull(),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MedicationReminder = typeof medicationReminders.$inferSelect;
export type InsertMedicationReminder = typeof medicationReminders.$inferInsert;

export type MedicationLog = typeof medicationLogs.$inferSelect;
export type InsertMedicationLog = typeof medicationLogs.$inferInsert;
