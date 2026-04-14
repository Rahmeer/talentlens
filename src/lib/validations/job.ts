import { z } from "zod";

export const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  department: z.string().optional().nullable(),
  location: z.string().min(2, "Location is required"),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]),
  experienceLevel: z.enum(["ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"]),
  salaryMin: z.coerce.number().int().positive().optional().nullable(),
  salaryMax: z.coerce.number().int().positive().optional().nullable(),
  description: z.string().min(50, "Description must be at least 50 characters"),
  requiredSkills: z.array(z.string()).min(1, "At least one required skill"),
  preferredSkills: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).default("DRAFT"),
});

export const screeningQuestionSchema = z.object({
  question: z.string().min(10, "Question must be at least 10 characters"),
  required: z.boolean().default(true),
  orderNum: z.number().int().default(0),
});

export type JobInput = z.infer<typeof jobSchema>;
export type ScreeningQuestionInput = z.infer<typeof screeningQuestionSchema>;
