import { pgTable, text, timestamp, uuid, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Family Sharing & Caregiver Access Schema
 * 
 * Enables:
 * - Parent-child account linking
 * - Caregiver access to patient data
 * - Permission-based data sharing
 * - Alert forwarding to family members
 */

// Permission levels for family members
export const permissionLevelEnum = pgEnum("permission_level", [
  "view_only",      // Can view data but not modify
  "alerts",         // Can view data and receive alerts
  "full_access",    // Can view, modify, and manage settings
]);

// Relationship types
export const relationshipTypeEnum = pgEnum("relationship_type", [
  "parent",
  "child",
  "spouse",
  "caregiver",
  "guardian",
  "sibling",
  "other",
]);

/**
 * Family Connections Table
 * Links users in family/caregiver relationships
 */
export const familyConnections = pgTable("family_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // The user who owns the health data
  patientUserId: text("patient_user_id").notNull(),
  
  // The family member/caregiver who has access
  caregiverUserId: text("caregiver_user_id").notNull(),
  
  // Type of relationship
  relationshipType: relationshipTypeEnum("relationship_type").notNull(),
  
  // Permission level granted
  permissionLevel: permissionLevelEnum("permission_level").notNull().default("view_only"),
  
  // Whether the connection is active
  isActive: boolean("is_active").notNull().default(true),
  
  // Whether the patient approved this connection
  isApproved: boolean("is_approved").notNull().default(false),
  
  // Invitation token for pending connections
  invitationToken: text("invitation_token"),
  
  // When the invitation expires
  invitationExpiresAt: timestamp("invitation_expires_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  approvedAt: timestamp("approved_at"),
});

/**
 * Alert Forwarding Settings
 * Controls which alerts are forwarded to family members
 */
export const alertForwardingSettings = pgTable("alert_forwarding_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // The family connection this applies to
  familyConnectionId: uuid("family_connection_id").notNull().references(() => familyConnections.id, { onDelete: "cascade" }),
  
  // Alert types to forward
  forwardGlucoseAlerts: boolean("forward_glucose_alerts").notNull().default(true),
  forwardMedicationAlerts: boolean("forward_medication_alerts").notNull().default(true),
  forwardAppointmentAlerts: boolean("forward_appointment_alerts").notNull().default(false),
  forwardEmergencyAlerts: boolean("forward_emergency_alerts").notNull().default(true),
  
  // Time restrictions (24-hour format)
  quietHoursStart: text("quiet_hours_start"), // e.g., "22:00"
  quietHoursEnd: text("quiet_hours_end"),     // e.g., "08:00"
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Shared Health Data Access Log
 * Audit trail of family member data access
 */
export const sharedDataAccessLog = pgTable("shared_data_access_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // The family connection
  familyConnectionId: uuid("family_connection_id").notNull().references(() => familyConnections.id, { onDelete: "cascade" }),
  
  // What was accessed
  dataType: text("data_type").notNull(), // "glucose", "medications", "reports", etc.
  action: text("action").notNull(),      // "viewed", "exported", "modified"
  
  // Details
  details: text("details"), // JSON string with additional context
  
  // Timestamp
  accessedAt: timestamp("accessed_at").notNull().defaultNow(),
});

// Relations
export const familyConnectionsRelations = relations(familyConnections, ({ one, many }) => ({
  alertSettings: one(alertForwardingSettings, {
    fields: [familyConnections.id],
    references: [alertForwardingSettings.familyConnectionId],
  }),
  accessLogs: many(sharedDataAccessLog),
}));

export const alertForwardingSettingsRelations = relations(alertForwardingSettings, ({ one }) => ({
  familyConnection: one(familyConnections, {
    fields: [alertForwardingSettings.familyConnectionId],
    references: [familyConnections.id],
  }),
}));

export const sharedDataAccessLogRelations = relations(sharedDataAccessLog, ({ one }) => ({
  familyConnection: one(familyConnections, {
    fields: [sharedDataAccessLog.familyConnectionId],
    references: [familyConnections.id],
  }),
}));
