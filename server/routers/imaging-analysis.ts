import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { imagingAnalyses, medicalRecords } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { invokeLLM } from "../_core/llm";

export const imagingAnalysisRouter = router({
  // Get all imaging analyses for the current user
  list: protectedProcedure
    .input(
      z
        .object({
          imagingType: z
            .enum([
              "xray",
              "ct_scan",
              "mri",
              "ultrasound",
              "pet_scan",
              "mammogram",
              "other",
            ])
            .optional(),
          status: z
            .enum(["pending_analysis", "analyzed", "reviewed"])
            .optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user.openId;

      if (!db) throw new Error("Database not available");

      const results = await db
        .select()
        .from(imagingAnalyses)
        .where(eq(imagingAnalyses.userId, userId))
        .orderBy(desc(imagingAnalyses.createdAt));

      // Filter by imagingType and status if provided
      let filtered = results;
      if (input?.imagingType) {
        filtered = filtered.filter((r) => r.imagingType === input.imagingType);
      }
      if (input?.status) {
        filtered = filtered.filter((r) => r.status === input.status);
      }

      return filtered;
    }),

  // Get a single imaging analysis by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user.openId;

      if (!db) throw new Error("Database not available");

      const [analysis] = await db
        .select()
        .from(imagingAnalyses)
        .where(
          and(
            eq(imagingAnalyses.id, input.id),
            eq(imagingAnalyses.userId, userId)
          )
        )
        .limit(1);

      if (!analysis) {
        throw new Error("Imaging analysis not found");
      }

      return analysis;
    }),

  // Create and analyze imaging study
  createAndAnalyze: protectedProcedure
    .input(
      z.object({
        imagingType: z.enum([
          "xray",
          "ct_scan",
          "mri",
          "ultrasound",
          "pet_scan",
          "mammogram",
          "other",
        ]),
        bodyPart: z.string(),
        studyDate: z.date().optional(),
        imagePaths: z.array(z.string()),
        medicalRecordId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user.openId;

      if (!db) throw new Error("Database not available");

      const id = createId();

      // Insert initial record with pending status
      await db.insert(imagingAnalyses).values({
        id,
        userId,
        medicalRecordId: input.medicalRecordId,
        imagingType: input.imagingType,
        bodyPart: input.bodyPart,
        studyDate: input.studyDate,
        imagePaths: input.imagePaths,
        status: "pending_analysis",
      });

      // Perform AI analysis
      try {
        const analysisPrompt = `You are an expert radiologist. Analyze the following ${input.imagingType} imaging study of the ${input.bodyPart}.

Provide a comprehensive radiological analysis in the following structured format:

1. **FINDINGS**: List all visible anatomical structures and any abnormalities detected
2. **IMPRESSIONS**: Summarize the key diagnostic conclusions
3. **RECOMMENDATIONS**: Suggest any follow-up imaging, clinical correlation, or specialist referrals needed
4. **CRITICAL FINDINGS**: List any urgent or critical findings that require immediate attention

Be thorough, professional, and use standard radiological terminology. If you identify any concerning findings, clearly state their significance and urgency.`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a board-certified radiologist with expertise in all imaging modalities. Provide detailed, accurate, and professional radiological interpretations.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: analysisPrompt },
                ...input.imagePaths.map((path) => ({
                  type: "image_url" as const,
                  image_url: { url: path },
                })),
              ],
            },
          ],
          maxTokens: 2000,
        });

        const reportText = typeof response.choices[0]?.message?.content === 'string' 
          ? response.choices[0].message.content 
          : Array.isArray(response.choices[0]?.message?.content)
          ? response.choices[0].message.content.map(c => c.type === 'text' ? c.text : '').join('')
          : '';

        // Parse the report to extract structured data
        const findings: string[] = [];
        const impressions: string[] = [];
        const recommendations: string[] = [];
        const criticalFindings: string[] = [];

        // Simple parsing logic (can be enhanced with more sophisticated NLP)
        const sections = reportText.split(/\*\*\d+\.\s+/);
        sections.forEach((section: string) => {
          if (section.includes("FINDINGS")) {
            const content = section
              .split("FINDINGS")[1]
              ?.split("**")[0]
              ?.trim();
            if (content) {
              findings.push(
                ...content
                  .split("\n")
                  .filter((line: string) => line.trim() && !line.startsWith("*"))
              );
            }
          } else if (section.includes("IMPRESSIONS")) {
            const content = section
              .split("IMPRESSIONS")[1]
              ?.split("**")[0]
              ?.trim();
            if (content) {
              impressions.push(
                ...content
                  .split("\n")
                  .filter((line: string) => line.trim() && !line.startsWith("*"))
              );
            }
          } else if (section.includes("RECOMMENDATIONS")) {
            const content = section
              .split("RECOMMENDATIONS")[1]
              ?.split("**")[0]
              ?.trim();
            if (content) {
              recommendations.push(
                ...content
                  .split("\n")
                  .filter((line: string) => line.trim() && !line.startsWith("*"))
              );
            }
          } else if (section.includes("CRITICAL FINDINGS")) {
            const content = section
              .split("CRITICAL FINDINGS")[1]
              ?.split("**")[0]
              ?.trim();
            if (content) {
              criticalFindings.push(
                ...content
                  .split("\n")
                  .filter((line: string) => line.trim() && !line.startsWith("*"))
              );
            }
          }
        });

        const aiAnalysis = {
          findings,
          impressions,
          recommendations,
          criticalFindings,
          confidence: 0.85, // Can be enhanced with actual confidence scoring
        };

        // Update the record with analysis results
        await db
          .update(imagingAnalyses)
          .set({
            aiAnalysis,
            reportText,
            status: "analyzed",
          })
          .where(eq(imagingAnalyses.id, id));

        return { id, success: true, analysis: aiAnalysis, reportText };
      } catch (error) {
        console.error("AI analysis error:", error);
        // Update status to indicate failure
        await db
          .update(imagingAnalyses)
          .set({
            status: "pending_analysis",
            reportText: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          })
          .where(eq(imagingAnalyses.id, id));

        throw new Error("Failed to analyze imaging study");
      }
    }),

  // Add radiologist review
  addReview: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        radiologistReview: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user.openId;

      if (!db) throw new Error("Database not available");

      await db
        .update(imagingAnalyses)
        .set({
          radiologistReview: input.radiologistReview,
          status: "reviewed",
        })
        .where(
          and(
            eq(imagingAnalyses.id, input.id),
            eq(imagingAnalyses.userId, userId)
          )
        );

      return { success: true };
    }),

  // Delete an imaging analysis
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user.openId;

      if (!db) throw new Error("Database not available");

      await db
        .delete(imagingAnalyses)
        .where(
          and(
            eq(imagingAnalyses.id, input.id),
            eq(imagingAnalyses.userId, userId)
          )
        );

      return { success: true };
    }),

  // Get statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const userId = ctx.user.openId;

    if (!db) throw new Error("Database not available");

    const analyses = await db
      .select()
      .from(imagingAnalyses)
      .where(eq(imagingAnalyses.userId, userId));

    const totalAnalyses = analyses.length;
    const criticalCount = analyses.filter(
      (a) => a.aiAnalysis && a.aiAnalysis.criticalFindings.length > 0
    ).length;

    const byType = analyses.reduce((acc: Record<string, number>, a) => {
      acc[a.imagingType] = (acc[a.imagingType] || 0) + 1;
      return acc;
    }, {});

    const byStatus = analyses.reduce((acc: Record<string, number>, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalAnalyses,
      criticalCount,
      byType,
      byStatus,
    };
  }),
});
