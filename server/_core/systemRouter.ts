import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./trpc";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      }),
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  chat: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1, "message is required"),
        systemPrompt: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Simple echo response for now - in production, integrate with LLM service
      const responses = [
        "That's a great question! Based on current medical guidelines, I recommend consulting with your healthcare provider for personalized advice.",
        "I understand your concern. Here's what I can tell you: Always follow your doctor's recommendations and maintain regular check-ups.",
        "Thank you for asking. While I can provide general information, it's important to discuss your specific situation with a healthcare professional.",
        "I'm here to help! For accurate medical advice tailored to your needs, please consult with your doctor or healthcare provider.",
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      return {
        message: randomResponse,
      };
    }),
});
