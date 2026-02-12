import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { medications, medicationLogs, vitals } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const medicationsRouter = router({
  // Get all medications for current user
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return await db
      .select()
      .from(medications)
      .where(eq(medications.userId, ctx.user.id.toString()))
      .orderBy(desc(medications.createdAt));
  }),

  // Get single medication by ID
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db
        .select()
        .from(medications)
        .where(
          and(
            eq(medications.id, input.id),
            eq(medications.userId, ctx.user.id.toString())
          )
        )
        .limit(1);
      return result[0] || null;
    }),

  // Create new medication
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        dosage: z.string(),
        frequency: z.string(),
        instructions: z.string().optional(),
        prescribedBy: z.string().optional(),
        pharmacy: z.string().optional(),
        refillsRemaining: z.number().optional(),
        startDate: z.date(),
        endDate: z.date().optional(),
        reminderEnabled: z.boolean().default(true),
        reminderTimes: z.array(z.string()).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const id = `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(medications).values({
        id,
        userId: ctx.user.id.toString(),
        ...input,
        reminderTimes: input.reminderTimes ? JSON.stringify(input.reminderTimes) : null,
        isActive: true,
      });
      return { id };
    }),

  // Update medication
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        dosage: z.string().optional(),
        frequency: z.string().optional(),
        instructions: z.string().optional(),
        prescribedBy: z.string().optional(),
        pharmacy: z.string().optional(),
        refillsRemaining: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        isActive: z.boolean().optional(),
        reminderEnabled: z.boolean().optional(),
        reminderTimes: z.array(z.string()).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db
        .update(medications)
        .set({
          ...data,
          reminderTimes: data.reminderTimes ? JSON.stringify(data.reminderTimes) : undefined,
        })
        .where(
          and(eq(medications.id, id), eq(medications.userId, ctx.user.id.toString()))
        );
      return { success: true };
    }),

  // Delete medication
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .delete(medications)
        .where(
          and(
            eq(medications.id, input.id),
            eq(medications.userId, ctx.user.id.toString())
          )
        );
      return { success: true };
    }),

  // Log medication taken/skipped/missed
  logMedication: protectedProcedure
    .input(
      z.object({
        medicationId: z.string(),
        status: z.enum(["taken", "skipped", "missed"]),
        takenAt: z.date(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(medicationLogs).values({
        id,
        userId: ctx.user.id.toString(),
        ...input,
      });
      return { id };
    }),

  // Get medication logs
  getLogs: protectedProcedure
    .input(z.object({ medicationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db
        .select()
        .from(medicationLogs)
        .where(
          and(
            eq(medicationLogs.medicationId, input.medicationId),
            eq(medicationLogs.userId, ctx.user.id.toString())
          )
        )
        .orderBy(desc(medicationLogs.takenAt));
    }),

  // Get adherence stats
  getAdherenceStats: protectedProcedure
    .input(z.object({ medicationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { total: 0, taken: 0, skipped: 0, missed: 0, adherenceRate: 0 };
      
      const logs = await db
        .select()
        .from(medicationLogs)
        .where(
          and(
            eq(medicationLogs.medicationId, input.medicationId),
            eq(medicationLogs.userId, ctx.user.id.toString())
          )
        );

      const total = logs.length;
      const taken = logs.filter((log) => log.status === "taken").length;
      const skipped = logs.filter((log) => log.status === "skipped").length;
      const missed = logs.filter((log) => log.status === "missed").length;

      return {
        total,
        taken,
        skipped,
        missed,
        adherenceRate: total > 0 ? Math.round((taken / total) * 100) : 0,
      };
    }),
});

export const vitalsRouter = router({
  // Get all vitals for current user
  list: protectedProcedure
    .input(
      z.object({
        vitalType: z
          .enum([
            "blood_pressure",
            "heart_rate",
            "blood_glucose",
            "weight",
            "temperature",
            "oxygen_saturation",
          ])
          .optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      
      if (input.vitalType) {
        const results = await db
          .select()
          .from(vitals)
          .where(
            and(
              eq(vitals.userId, ctx.user.id.toString()),
              eq(vitals.vitalType, input.vitalType)
            )
          )
          .orderBy(desc(vitals.recordedAt))
          .limit(input.limit || 100);
        return results;
      }

      return await db
        .select()
        .from(vitals)
        .where(eq(vitals.userId, ctx.user.id.toString()))
        .orderBy(desc(vitals.recordedAt))
        .limit(input.limit || 100);
    }),

  // Create new vital reading
  create: protectedProcedure
    .input(
      z.object({
        vitalType: z.enum([
          "blood_pressure",
          "heart_rate",
          "blood_glucose",
          "weight",
          "temperature",
          "oxygen_saturation",
        ]),
        systolic: z.number().optional(),
        diastolic: z.number().optional(),
        value: z.number().optional(),
        unit: z.string(),
        notes: z.string().optional(),
        recordedAt: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const id = `vital_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(vitals).values({
        id,
        userId: ctx.user.id.toString(),
        ...input,
        value: input.value?.toString(),
      });
      return { id };
    }),

  // Delete vital reading
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .delete(vitals)
        .where(
          and(eq(vitals.id, input.id), eq(vitals.userId, ctx.user.id.toString()))
        );
      return { success: true };
    }),

  // Get vital statistics
  getStats: protectedProcedure
    .input(
      z.object({
        vitalType: z.enum([
          "blood_pressure",
          "heart_rate",
          "blood_glucose",
          "weight",
          "temperature",
          "oxygen_saturation",
        ]),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { average: 0, min: 0, max: 0, latest: 0, count: 0 };
      
      const readings = await db
        .select()
        .from(vitals)
        .where(
          and(
            eq(vitals.userId, ctx.user.id.toString()),
            eq(vitals.vitalType, input.vitalType)
          )
        )
        .orderBy(desc(vitals.recordedAt))
        .limit(30);

      if (readings.length === 0) {
        return { average: 0, min: 0, max: 0, latest: 0, count: 0 };
      }

      const values = readings
        .map((r: any) => (r.value ? parseFloat(r.value) : 0))
        .filter((v: number) => v > 0);

      return {
        average: values.length > 0 ? Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length) : 0,
        min: values.length > 0 ? Math.min(...values) : 0,
        max: values.length > 0 ? Math.max(...values) : 0,
        latest: values[0] || 0,
        count: readings.length,
      };
    }),
});
