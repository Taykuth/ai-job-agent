import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  countUserApplications,
  createApplication,
  deleteApplication,
  getApplicationById,
  getApplicationsByUserId,
  getCVById,
  updateApplicationGenerated,
  updateApplicationStatus,
} from "../db";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";

const FREE_LIMIT = 5;

export const applicationRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getApplicationsByUserId(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const app = await getApplicationById(input.id, ctx.user.id);
      if (!app) throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      return app;
    }),

  create: protectedProcedure
    .input(
      z.object({
        cvId: z.number().optional(),
        jobTitle: z.string().optional(),
        company: z.string().optional(),
        jobUrl: z.string().optional(),
        jobDescription: z.string().min(50, "Please provide a more detailed job description"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Freemium limit check
      if (ctx.user.plan === "free") {
        const count = await countUserApplications(ctx.user.id);
        if (count >= FREE_LIMIT) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Free plan allows up to ${FREE_LIMIT} applications. Please upgrade to Premium for unlimited applications.`,
          });
        }
      }

      const result = await createApplication({
        userId: ctx.user.id,
        cvId: input.cvId,
        jobTitle: input.jobTitle,
        company: input.company,
        jobUrl: input.jobUrl,
        jobDescription: input.jobDescription,
        status: "draft",
      });

      return { id: result.id };
    }),

  generateTailoredCV: protectedProcedure
    .input(z.object({ applicationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const app = await getApplicationById(input.applicationId, ctx.user.id);
      if (!app) throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });

      if (!app.cvId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No CV linked to this application" });
      }

      const cv = await getCVById(app.cvId, ctx.user.id);
      if (!cv || !cv.parsedJson) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "CV has not been parsed yet. Please parse your CV first.",
        });
      }

      const cvData = JSON.parse(cv.parsedJson);

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an expert CV writer. Your task is to tailor a CV for a specific job posting.

CRITICAL RULES:
1. Use ONLY the information provided in the candidate's CV data. Do NOT invent, fabricate, or add any experience, skills, education, or achievements that are not in the original CV.
2. You may rephrase, reorder, and emphasize existing information to better match the job requirements.
3. Highlight relevant skills and experiences that match the job description.
4. Use professional, clear language.
5. Format the output as clean, well-structured markdown.

Output a complete, tailored CV in markdown format.`,
          },
          {
            role: "user",
            content: `Here is the candidate's CV data:
${JSON.stringify(cvData, null, 2)}

Here is the job description:
${app.jobDescription}

${app.jobTitle ? `Job Title: ${app.jobTitle}` : ""}
${app.company ? `Company: ${app.company}` : ""}

Please create a tailored CV that highlights the most relevant aspects of the candidate's background for this specific role. Remember: only use information from the CV data above.`,
          },
        ],
      });

      const rawContent = response.choices[0]?.message?.content;
      const tailoredCv = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);

      if (!tailoredCv) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate tailored CV" });
      }

      await updateApplicationGenerated(input.applicationId, ctx.user.id, tailoredCv, undefined);

      return { tailoredCv };
    }),

  generateCoverLetter: protectedProcedure
    .input(z.object({ applicationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const app = await getApplicationById(input.applicationId, ctx.user.id);
      if (!app) throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });

      if (!app.cvId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No CV linked to this application" });
      }

      const cv = await getCVById(app.cvId, ctx.user.id);
      if (!cv || !cv.parsedJson) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "CV has not been parsed yet. Please parse your CV first.",
        });
      }

      const cvData = JSON.parse(cv.parsedJson);

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an expert cover letter writer. Your task is to write a compelling, personalized cover letter.

CRITICAL RULES:
1. Use ONLY the information provided in the candidate's CV data. Do NOT invent or fabricate any experience, achievements, or skills.
2. Connect the candidate's real experience to the job requirements.
3. Write in a professional, engaging, and authentic tone.
4. Keep it concise (3-4 paragraphs).
5. Format as clean markdown.

Structure:
- Opening paragraph: Express genuine interest in the role and company
- Body (1-2 paragraphs): Connect specific real experiences to job requirements
- Closing: Call to action`,
          },
          {
            role: "user",
            content: `Candidate's CV data:
${JSON.stringify(cvData, null, 2)}

Job Description:
${app.jobDescription}

${app.jobTitle ? `Job Title: ${app.jobTitle}` : ""}
${app.company ? `Company: ${app.company}` : ""}

Write a tailored cover letter using only the candidate's real information.`,
          },
        ],
      });

      const rawContent = response.choices[0]?.message?.content;
      const coverLetter = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);

      if (!coverLetter) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate cover letter" });
      }

      await updateApplicationGenerated(input.applicationId, ctx.user.id, undefined, coverLetter);

      return { coverLetter };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["draft", "applied", "interview", "rejected", "offer"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const app = await getApplicationById(input.id, ctx.user.id);
      if (!app) throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      await updateApplicationStatus(input.id, ctx.user.id, input.status, input.notes);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const app = await getApplicationById(input.id, ctx.user.id);
      if (!app) throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      await deleteApplication(input.id, ctx.user.id);
      return { success: true };
    }),

  getUsage: protectedProcedure.query(async ({ ctx }) => {
    const count = await countUserApplications(ctx.user.id);
    return {
      used: count,
      limit: ctx.user.plan === "free" ? FREE_LIMIT : null,
      plan: ctx.user.plan,
      canCreate: ctx.user.plan === "premium" || count < FREE_LIMIT,
    };
  }),
});
