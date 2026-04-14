import { z } from "zod";

export const applicationSchema = z.object({
  jobId: z.string().cuid(),
  coverLetter: z.string().optional().nullable(),
  // Profile fields
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  linkedIn: z.string().url().optional().nullable().or(z.literal("")),
  portfolio: z.string().url().optional().nullable().or(z.literal("")),
  yearsOfExperience: z.coerce.number().int().min(0).optional().nullable(),
  skills: z.array(z.string()).default([]),
  education: z.string().optional().nullable(),
  workAuthorization: z.string().optional().nullable(),
  noticePeriod: z.string().optional().nullable(),
  // Screening answers
  screeningAnswers: z.array(z.object({
    questionId: z.string().cuid(),
    answer: z.string().min(1, "Answer is required"),
  })).default([]),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
