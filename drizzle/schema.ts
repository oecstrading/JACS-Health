import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Hospice Tables
export const hospicePatients = mysqlTable("hospice_patients", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: varchar("user_id", { length: 128 }).notNull(),
  admissionDate: timestamp("admission_date").notNull(),
  dischargeDate: timestamp("discharge_date"),
  levelOfCare: mysqlEnum("level_of_care", [
    "routine_home",
    "continuous_home",
    "inpatient_respite",
    "general_inpatient",
  ]).notNull(),
  primaryDiagnosis: text("primary_diagnosis").notNull(),
  secondaryDiagnoses: json("secondary_diagnoses").$type<string[]>(),
  attendingPhysician: text("attending_physician").notNull(),
  hospicePhysician: text("hospice_physician").notNull(),
  status: mysqlEnum("status", ["active", "discharged", "deceased"])
    .notNull()
    .default("active"),
  dateOfDeath: timestamp("date_of_death"),
  locationOfDeath: text("location_of_death"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const hospiceAssessments = mysqlTable("hospice_assessments", {
  id: varchar("id", { length: 128 }).primaryKey(),
  patientId: varchar("patient_id", { length: 128 }).notNull(),
  assessmentType: mysqlEnum("assessment_type", ["admission", "discharge"]).notNull(),
  assessmentDate: timestamp("assessment_date").notNull(),

  // Seven Care Processes (HIS CBE #3235)
  painScreeningCompleted: boolean("pain_screening_completed")
    .notNull()
    .default(false),
  painIntensityScore: int("pain_intensity_score"),
  dyspneaScreeningCompleted: boolean("dyspnea_screening_completed")
    .notNull()
    .default(false),
  dyspneaTreatmentProvided: boolean("dyspnea_treatment_provided")
    .notNull()
    .default(false),
  treatmentPreferencesDiscussed: boolean("treatment_preferences_discussed")
    .notNull()
    .default(false),
  spiritualConcernsAddressed: boolean("spiritual_concerns_addressed")
    .notNull()
    .default(false),
  emotionalSupportProvided: boolean("emotional_support_provided")
    .notNull()
    .default(false),
  caregiverEducationCompleted: boolean("caregiver_education_completed")
    .notNull()
    .default(false),
  advanceDirectivesDocumented: boolean("advance_directives_documented")
    .notNull()
    .default(false),

  // Submission tracking
  submissionStatus: mysqlEnum("submission_status", [
    "pending",
    "ready",
    "submitted",
    "accepted",
    "rejected",
  ])
    .notNull()
    .default("pending"),
  submissionDate: timestamp("submission_date"),
  submissionDeadline: timestamp("submission_deadline").notNull(),
  iqiesConfirmationNumber: varchar("iqies_confirmation_number", { length: 255 }),
  validationErrors: json("validation_errors").$type<
    Array<{ field: string; message: string }>
  >(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const hospiceVisits = mysqlTable("hospice_visits", {
  id: varchar("id", { length: 128 }).primaryKey(),
  patientId: varchar("patient_id", { length: 128 }).notNull(),
  visitType: mysqlEnum("visit_type", [
    "skilled_nursing",
    "social_work",
    "chaplain",
    "volunteer",
    "aide",
  ]).notNull(),
  visitDate: timestamp("visit_date").notNull(),
  clinicianName: text("clinician_name").notNull(),
  clinicianRole: text("clinician_role").notNull(),
  durationMinutes: int("duration_minutes").notNull(),
  visitNotes: text("visit_notes"),
  servicesProvided: json("services_provided").$type<string[]>(),
  nextVisitScheduled: timestamp("next_visit_scheduled"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const hospiceExpenses = mysqlTable("hospice_expenses", {
  id: varchar("id", { length: 128 }).primaryKey(),
  patientId: varchar("patient_id", { length: 128 }),
  expenseDate: timestamp("expense_date").notNull(),
  costCenter: mysqlEnum("cost_center", [
    "nursing",
    "therapy",
    "social_work",
    "chaplain",
    "volunteer",
    "aide",
    "medical_supplies",
    "medications",
    "dme",
    "telehealth_salaries",
    "telehealth_equipment",
    "administrative",
    "facility",
    "other",
  ]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  levelOfCare: mysqlEnum("level_of_care", [
    "routine_home",
    "continuous_home",
    "inpatient_respite",
    "general_inpatient",
  ]),
  cmsWorksheet: mysqlEnum("cms_worksheet", ["A", "B", "C", "F"]).notNull(),
  description: text("description").notNull(),
  vendor: text("vendor"),
  invoiceNumber: varchar("invoice_number", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const hospiceCaregivers = mysqlTable("hospice_caregivers", {
  id: varchar("id", { length: 128 }).primaryKey(),
  patientId: varchar("patient_id", { length: 128 }).notNull(),
  caregiverName: text("caregiver_name").notNull(),
  relationship: text("relationship").notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: varchar("zip_code", { length: 10 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  isPrimaryCaregiver: boolean("is_primary_caregiver").notNull().default(false),
  cahpsEligible: boolean("cahps_eligible").notNull().default(false),
  cahpsSurveySent: boolean("cahps_survey_sent").notNull().default(false),
  cahpsSurveySentDate: timestamp("cahps_survey_sent_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const hospiceComplianceAlerts = mysqlTable("hospice_compliance_alerts", {
  id: varchar("id", { length: 128 }).primaryKey(),
  patientId: varchar("patient_id", { length: 128 }).notNull(),
  alertType: mysqlEnum("alert_type", [
    "his_submission_due",
    "hope_submission_due",
    "visit_gap",
    "cahps_export_due",
    "cost_report_due",
  ]).notNull(),
  alertLevel: mysqlEnum("alert_level", ["green", "yellow", "red"]).notNull(),
  dueDate: timestamp("due_date").notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["active", "resolved", "dismissed"])
    .notNull()
    .default("active"),
  resolvedDate: timestamp("resolved_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Type exports
export type HospicePatient = typeof hospicePatients.$inferSelect;
export type NewHospicePatient = typeof hospicePatients.$inferInsert;

export type HospiceAssessment = typeof hospiceAssessments.$inferSelect;
export type NewHospiceAssessment = typeof hospiceAssessments.$inferInsert;

export type HospiceVisit = typeof hospiceVisits.$inferSelect;
export type NewHospiceVisit = typeof hospiceVisits.$inferInsert;

export type HospiceExpense = typeof hospiceExpenses.$inferSelect;
export type NewHospiceExpense = typeof hospiceExpenses.$inferInsert;

export type HospiceCaregiver = typeof hospiceCaregivers.$inferSelect;
export type NewHospiceCaregiver = typeof hospiceCaregivers.$inferInsert;

export type HospiceComplianceAlert = typeof hospiceComplianceAlerts.$inferSelect;
export type NewHospiceComplianceAlert = typeof hospiceComplianceAlerts.$inferInsert;
