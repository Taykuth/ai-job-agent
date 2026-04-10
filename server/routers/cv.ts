import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createCV, deleteCV, getCVById, getCVsByUserId, updateCVParsed } from "../db";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

export const cvRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getCVsByUserId(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const cv = await getCVById(input.id, ctx.user.id);
      if (!cv) throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });
      return cv;
    }),

  upload: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        mimeType: z.string(),
        fileBase64: z.string(), // base64 encoded file
      })
    )
    .mutation(async ({ ctx, input }) => {
      const allowedMimes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain",
      ];
      if (!allowedMimes.includes(input.mimeType)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only PDF, DOCX, DOC, and TXT files are supported",
        });
      }

      const buffer = Buffer.from(input.fileBase64, "base64");
      if (buffer.byteLength > 10 * 1024 * 1024) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "File size must be under 10MB" });
      }

      const suffix = nanoid(8);
      const ext = input.fileName.split(".").pop() || "pdf";
      const fileKey = `cvs/${ctx.user.id}/${suffix}.${ext}`;

      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      const cv = await createCV({
        userId: ctx.user.id,
        fileName: input.fileName,
        fileUrl: url,
        fileKey,
        mimeType: input.mimeType,
      });

      return { id: cv.id, fileUrl: url, fileName: input.fileName };
    }),

  parse: protectedProcedure
    .input(z.object({ cvId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const cv = await getCVById(input.cvId, ctx.user.id);
      if (!cv) throw new TRPCError({ code: "NOT_FOUND", message: "CV not found" });

      // Use LLM with file_url to parse the CV
      // Determine mime type for file_url
      const supportedMimes = ["application/pdf", "audio/mpeg", "audio/wav", "audio/mp4", "video/mp4"];
      const isPdfSupported = supportedMimes.includes(cv.mimeType);

      const userContent: import("../_core/llm").MessageContent[] = isPdfSupported
        ? [
            {
              type: "file_url" as const,
              file_url: {
                url: cv.fileUrl,
                mime_type: cv.mimeType as "application/pdf",
              },
            },
            {
              type: "text" as const,
              text: "Please parse this CV document and return the structured JSON with all information extracted.",
            },
          ]
        : [
            {
              type: "text" as const,
              text: `Parse the CV available at this URL: ${cv.fileUrl}\n\nReturn a structured JSON with all CV information.`,
            },
          ];

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an expert CV parser. Extract all information from the provided CV document accurately and completely. Return a JSON object. Extract ONLY what is actually present in the CV. Do not invent or add information.`,
          },
          {
            role: "user",
            content: userContent,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "cv_parsed",
            strict: true,
            schema: {
              type: "object",
              properties: {
                fullName: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                location: { type: "string" },
                summary: { type: "string" },
                skills: { type: "array", items: { type: "string" } },
                languages: { type: "array", items: { type: "string" } },
                experience: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      company: { type: "string" },
                      duration: { type: "string" },
                      description: { type: "string" },
                    },
                    required: ["title", "company", "duration", "description"],
                    additionalProperties: false,
                  },
                },
                education: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      degree: { type: "string" },
                      institution: { type: "string" },
                      year: { type: "string" },
                    },
                    required: ["degree", "institution", "year"],
                    additionalProperties: false,
                  },
                },
                certifications: { type: "array", items: { type: "string" } },
                projects: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                    },
                    required: ["name", "description"],
                    additionalProperties: false,
                  },
                },
                rawText: { type: "string" },
              },
              required: [
                "fullName", "email", "phone", "location", "summary",
                "skills", "languages", "experience", "education",
                "certifications", "projects", "rawText",
              ],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
      if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to parse CV" });

      const parsed = JSON.parse(content);
      await updateCVParsed(cv.id, parsed.rawText || "", content);

      return { success: true, parsed };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteCV(input.id, ctx.user.id);
      return { success: true };
    }),
});
