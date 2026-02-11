import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import type { HospicePatient } from "../../drizzle/schema";
import { 
  hospicePatients, 
  hospiceAssessments, 
  hospiceVisits, 
  hospiceExpenses, 
  hospiceCaregivers, 
  hospiceComplianceAlerts 
} from "../../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const hospiceRouter = router({
  // Patient operations
  getPatients: publicProcedure
    .input(z.object({
      levelOfCare: z.enum(["routine_home", "continuous_home", "inpatient_respite", "general_inpatient"]).optional(),
      searchQuery: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      let conditions = [];
      
      if (input.levelOfCare) {
        conditions.push(eq(hospicePatients.levelOfCare, input.levelOfCare));
      }
      
      const patients = await db
        .select()
        .from(hospicePatients)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(hospicePatients.admissionDate));
      
      if (input.searchQuery) {
        const searchLower = input.searchQuery.toLowerCase();
        return patients.filter((p: HospicePatient) => 
          p.userId.toLowerCase().includes(searchLower) ||
          p.primaryDiagnosis.toLowerCase().includes(searchLower)
        );
      }
      
      return patients;
    }),

  getPatient: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return undefined;
      
      const [patient] = await db
        .select()
        .from(hospicePatients)
        .where(eq(hospicePatients.id, input.id));
      return patient;
    }),

  createPatient: publicProcedure
    .input(z.object({
      userId: z.string(),
      admissionDate: z.string(),
      levelOfCare: z.enum(["routine_home", "continuous_home", "inpatient_respite", "general_inpatient"]),
      primaryDiagnosis: z.string(),
      secondaryDiagnoses: z.array(z.string()).optional(),
      attendingPhysician: z.string(),
      hospicePhysician: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, id: "" };
      
      const id = createId();
      await db.insert(hospicePatients).values({
        id,
        ...input,
        admissionDate: new Date(input.admissionDate),
        secondaryDiagnoses: input.secondaryDiagnoses || [],
      });
      return { success: true, id };
    }),

  updatePatient: publicProcedure
    .input(z.object({
      id: z.string(),
      levelOfCare: z.enum(["routine_home", "continuous_home", "inpatient_respite", "general_inpatient"]).optional(),
      status: z.enum(["active", "discharged", "deceased"]).optional(),
      dischargeDate: z.string().optional(),
      dateOfDeath: z.string().optional(),
      locationOfDeath: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      
      const { id, dischargeDate, dateOfDeath, ...data } = input;
      await db
        .update(hospicePatients)
        .set({
          ...data,
          dischargeDate: dischargeDate ? new Date(dischargeDate) : undefined,
          dateOfDeath: dateOfDeath ? new Date(dateOfDeath) : undefined,
        })
        .where(eq(hospicePatients.id, id));
      return { success: true };
    }),

  // Assessment operations
  getAssessments: publicProcedure
    .input(z.object({
      patientId: z.string().optional(),
      submissionStatus: z.enum(["pending", "ready", "submitted", "accepted", "rejected"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      let conditions = [];
      
      if (input.patientId) {
        conditions.push(eq(hospiceAssessments.patientId, input.patientId));
      }
      
      if (input.submissionStatus) {
        conditions.push(eq(hospiceAssessments.submissionStatus, input.submissionStatus));
      }
      
      return await db
        .select()
        .from(hospiceAssessments)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(hospiceAssessments.assessmentDate));
    }),

  createAssessment: publicProcedure
    .input(z.object({
      patientId: z.string(),
      assessmentType: z.enum(["admission", "discharge"]),
      assessmentDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, id: "" };
      
      const id = createId();
      const assessmentDate = new Date(input.assessmentDate);
      const submissionDeadline = new Date(assessmentDate);
      submissionDeadline.setDate(submissionDeadline.getDate() + 30);
      
      await db.insert(hospiceAssessments).values({
        id,
        patientId: input.patientId,
        assessmentType: input.assessmentType,
        assessmentDate,
        submissionDeadline,
      });
      return { success: true, id };
    }),

  updateAssessment: publicProcedure
    .input(z.object({
      id: z.string(),
      painScreeningCompleted: z.boolean().optional(),
      painIntensityScore: z.number().optional(),
      dyspneaScreeningCompleted: z.boolean().optional(),
      dyspneaTreatmentProvided: z.boolean().optional(),
      treatmentPreferencesDiscussed: z.boolean().optional(),
      spiritualConcernsAddressed: z.boolean().optional(),
      emotionalSupportProvided: z.boolean().optional(),
      caregiverEducationCompleted: z.boolean().optional(),
      advanceDirectivesDocumented: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, ready: false };
      
      const { id, ...data } = input;
      
      const [assessment] = await db
        .select()
        .from(hospiceAssessments)
        .where(eq(hospiceAssessments.id, id));
      
      const updated = { ...assessment, ...data };
      const allCompleted = 
        updated.painScreeningCompleted &&
        updated.dyspneaScreeningCompleted &&
        updated.dyspneaTreatmentProvided &&
        updated.treatmentPreferencesDiscussed &&
        updated.spiritualConcernsAddressed &&
        updated.emotionalSupportProvided &&
        updated.caregiverEducationCompleted &&
        updated.advanceDirectivesDocumented;
      
      await db
        .update(hospiceAssessments)
        .set({
          ...data,
          submissionStatus: allCompleted ? "ready" : "pending",
        })
        .where(eq(hospiceAssessments.id, id));
      
      return { success: true, ready: allCompleted };
    }),

  submitAssessment: publicProcedure
    .input(z.object({
      id: z.string(),
      iqiesConfirmationNumber: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, submissionDate: "" };
      
      const submissionDate = new Date();
      
      await db
        .update(hospiceAssessments)
        .set({ 
          submissionStatus: "submitted",
          submissionDate,
          iqiesConfirmationNumber: input.iqiesConfirmationNumber,
        })
        .where(eq(hospiceAssessments.id, input.id));
      
      return { success: true, submissionDate: submissionDate.toISOString() };
    }),

  // Visit operations
  getVisits: publicProcedure
    .input(z.object({
      patientId: z.string().optional(),
      visitType: z.enum(["skilled_nursing", "social_work", "chaplain", "volunteer", "aide"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      let conditions = [];
      
      if (input.patientId) {
        conditions.push(eq(hospiceVisits.patientId, input.patientId));
      }
      
      if (input.visitType) {
        conditions.push(eq(hospiceVisits.visitType, input.visitType));
      }
      
      return await db
        .select()
        .from(hospiceVisits)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(hospiceVisits.visitDate));
    }),

  createVisit: publicProcedure
    .input(z.object({
      patientId: z.string(),
      visitType: z.enum(["skilled_nursing", "social_work", "chaplain", "volunteer", "aide"]),
      clinicianName: z.string(),
      clinicianRole: z.string(),
      visitDate: z.string(),
      durationMinutes: z.number(),
      visitNotes: z.string().optional(),
      servicesProvided: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, id: "" };
      
      const id = createId();
      await db.insert(hospiceVisits).values({
        id,
        ...input,
        visitDate: new Date(input.visitDate),
        servicesProvided: input.servicesProvided || [],
      });
      return { success: true, id };
    }),

  // Expense operations
  getExpenses: publicProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      levelOfCare: z.enum(["routine_home", "continuous_home", "inpatient_respite", "general_inpatient"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      let conditions = [];
      
      if (input.startDate && input.endDate) {
        conditions.push(
          gte(hospiceExpenses.expenseDate, new Date(input.startDate)),
          lte(hospiceExpenses.expenseDate, new Date(input.endDate))
        );
      }
      
      if (input.levelOfCare) {
        conditions.push(eq(hospiceExpenses.levelOfCare, input.levelOfCare));
      }
      
      return await db
        .select()
        .from(hospiceExpenses)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(hospiceExpenses.expenseDate));
    }),

  createExpense: publicProcedure
    .input(z.object({
      patientId: z.string().optional(),
      expenseDate: z.string(),
      costCenter: z.enum([
        "nursing", "therapy", "social_work", "chaplain", "volunteer", "aide",
        "medical_supplies", "medications", "dme", "telehealth_salaries",
        "telehealth_equipment", "administrative", "facility", "other"
      ]),
      amount: z.string(),
      levelOfCare: z.enum(["routine_home", "continuous_home", "inpatient_respite", "general_inpatient"]).optional(),
      cmsWorksheet: z.enum(["A", "B", "C", "F"]),
      description: z.string(),
      vendor: z.string().optional(),
      invoiceNumber: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, id: "" };
      
      const id = createId();
      await db.insert(hospiceExpenses).values({
        id,
        ...input,
        expenseDate: new Date(input.expenseDate),
      });
      return { success: true, id };
    }),

  // Caregiver operations
  getCaregivers: publicProcedure
    .input(z.object({
      patientId: z.string().optional(),
      cahpsEligible: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      let conditions = [];
      
      if (input.patientId) {
        conditions.push(eq(hospiceCaregivers.patientId, input.patientId));
      }
      
      if (input.cahpsEligible !== undefined) {
        conditions.push(eq(hospiceCaregivers.cahpsEligible, input.cahpsEligible));
      }
      
      return await db
        .select()
        .from(hospiceCaregivers)
        .where(conditions.length > 0 ? and(...conditions) : undefined);
    }),

  createCaregiver: publicProcedure
    .input(z.object({
      patientId: z.string(),
      caregiverName: z.string(),
      relationship: z.string(),
      addressLine1: z.string(),
      addressLine2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      phone: z.string().optional(),
      email: z.string().optional(),
      isPrimaryCaregiver: z.boolean().default(false),
      cahpsEligible: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, id: "" };
      
      const id = createId();
      await db.insert(hospiceCaregivers).values({
        id,
        ...input,
      });
      return { success: true, id };
    }),

  // Compliance alert operations
  getComplianceAlerts: publicProcedure
    .input(z.object({
      status: z.enum(["active", "resolved", "dismissed"]).optional(),
      patientId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      let conditions = [];
      
      if (input.status) {
        conditions.push(eq(hospiceComplianceAlerts.status, input.status));
      }
      
      if (input.patientId) {
        conditions.push(eq(hospiceComplianceAlerts.patientId, input.patientId));
      }
      
      return await db
        .select()
        .from(hospiceComplianceAlerts)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(hospiceComplianceAlerts.dueDate));
    }),

  createComplianceAlert: publicProcedure
    .input(z.object({
      patientId: z.string(),
      alertType: z.enum(["his_submission_due", "hope_submission_due", "visit_gap", "cahps_export_due", "cost_report_due"]),
      alertLevel: z.enum(["green", "yellow", "red"]),
      dueDate: z.string(),
      description: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, id: "" };
      
      const id = createId();
      await db.insert(hospiceComplianceAlerts).values({
        id,
        ...input,
        dueDate: new Date(input.dueDate),
      });
      return { success: true, id };
    }),

  resolveComplianceAlert: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      
      await db
        .update(hospiceComplianceAlerts)
        .set({ 
          status: "resolved",
          resolvedDate: new Date(),
        })
        .where(eq(hospiceComplianceAlerts.id, input.id));
      return { success: true };
    }),
});
