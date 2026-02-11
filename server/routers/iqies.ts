import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { hospiceAssessments } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { submitToIQIES, checkSubmissionStatus } from "../lib/iqies-service";

export const iqiesRouter = router({
  /**
   * Submit HOPE/HIS assessment to CMS iQIES
   */
  submitAssessment: publicProcedure
    .input(z.object({
      assessmentId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { 
          success: false, 
          error: "Database not available" 
        };
      }

      // Get assessment
      const [assessment] = await db
        .select()
        .from(hospiceAssessments)
        .where(eq(hospiceAssessments.id, input.assessmentId));

      if (!assessment) {
        return { 
          success: false, 
          error: "Assessment not found" 
        };
      }

      // Check if already submitted
      if (assessment.submissionStatus === "submitted" || assessment.submissionStatus === "accepted") {
        return { 
          success: false, 
          error: "Assessment already submitted" 
        };
      }

      // Submit to iQIES
      const result = await submitToIQIES(assessment);

      if (result.success && result.confirmationNumber) {
        // Update assessment with submission details
        await db
          .update(hospiceAssessments)
          .set({
            submissionStatus: "submitted",
            submissionDate: new Date(result.submissionDate!),
            iqiesConfirmationNumber: result.confirmationNumber,
          })
          .where(eq(hospiceAssessments.id, input.assessmentId));

        return {
          success: true,
          confirmationNumber: result.confirmationNumber,
          submissionDate: result.submissionDate,
        };
      } else {
        // Update assessment with validation errors
        await db
          .update(hospiceAssessments)
          .set({
            validationErrors: result.errors || [],
          })
          .where(eq(hospiceAssessments.id, input.assessmentId));

        return {
          success: false,
          errors: result.errors,
        };
      }
    }),

  /**
   * Check submission status in iQIES
   */
  checkStatus: publicProcedure
    .input(z.object({
      confirmationNumber: z.string(),
    }))
    .query(async ({ input }) => {
      const result = await checkSubmissionStatus(input.confirmationNumber);
      return result;
    }),

  /**
   * Get all submitted assessments with their status
   */
  getSubmittedAssessments: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];

      const assessments = await db
        .select()
        .from(hospiceAssessments)
        .where(eq(hospiceAssessments.submissionStatus, "submitted"));

      return assessments;
    }),
});
