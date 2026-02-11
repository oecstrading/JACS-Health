import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { medicalRecords } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const medicalRecordsRouter = router({
  // Get all medical records for the current user
  list: protectedProcedure
    .input(
      z
        .object({
          documentType: z
            .enum([
              "lab_report",
              "radiology_report",
              "prescription",
              "discharge_summary",
              "consultation_note",
              "insurance_card",
              "vaccination_record",
              "other",
            ])
            .optional(),
          category: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user.openId;

      if (!db) throw new Error("Database not available");

      let query = db
        .select()
        .from(medicalRecords)
        .where(eq(medicalRecords.userId, userId))
        .orderBy(desc(medicalRecords.uploadDate));

      const results = await query;

      // Filter by documentType and category if provided
      let filtered = results;
      if (input?.documentType) {
        filtered = filtered.filter((r) => r.documentType === input.documentType);
      }
      if (input?.category) {
        filtered = filtered.filter((r) => r.category === input.category);
      }

      return filtered;
    }),

  // Get a single medical record by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user.openId;

      if (!db) throw new Error("Database not available");

      const [record] = await db
        .select()
        .from(medicalRecords)
        .where(
          and(
            eq(medicalRecords.id, input.id),
            eq(medicalRecords.userId, userId)
          )
        )
        .limit(1);

      if (!record) {
        throw new Error("Medical record not found");
      }

      return record;
    }),

  // Create a new medical record
  create: protectedProcedure
    .input(
      z.object({
        documentType: z.enum([
          "lab_report",
          "radiology_report",
          "prescription",
          "discharge_summary",
          "consultation_note",
          "insurance_card",
          "vaccination_record",
          "other",
        ]),
        title: z.string(),
        description: z.string().optional(),
        filePath: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        documentDate: z.date().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user.openId;

      const id = createId();

      if (!db) throw new Error("Database not available");

      await db.insert(medicalRecords).values({
        id,
        userId,
        documentType: input.documentType,
        title: input.title,
        description: input.description,
        filePath: input.filePath,
        fileType: input.fileType,
        fileSize: input.fileSize,
        documentDate: input.documentDate,
        category: input.category,
        tags: input.tags,
      });

      return { id, success: true };
    }),

  // Update a medical record
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        documentDate: z.date().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user.openId;

      const updateData: any = {};
      if (input.title) updateData.title = input.title;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.documentDate) updateData.documentDate = input.documentDate;
      if (input.category) updateData.category = input.category;
      if (input.tags) updateData.tags = input.tags;

      if (!db) throw new Error("Database not available");

      await db
        .update(medicalRecords)
        .set(updateData)
        .where(
          and(
            eq(medicalRecords.id, input.id),
            eq(medicalRecords.userId, userId)
          )
        );

      return { success: true };
    }),

  // Delete a medical record
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user.openId;

      if (!db) throw new Error("Database not available");

      await db
        .delete(medicalRecords)
        .where(
          and(
            eq(medicalRecords.id, input.id),
            eq(medicalRecords.userId, userId)
          )
        );

      return { success: true };
    }),

  // Get statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const userId = ctx.user.openId;

    if (!db) throw new Error("Database not available");

    const records = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.userId, userId));

    const totalRecords = records.length;
    const totalSize = records.reduce((sum, r) => sum + r.fileSize, 0);

    const byType = records.reduce((acc: Record<string, number>, r) => {
      acc[r.documentType] = (acc[r.documentType] || 0) + 1;
      return acc;
    }, {});

    return {
      totalRecords,
      totalSize,
      byType,
    };
  }),
});
