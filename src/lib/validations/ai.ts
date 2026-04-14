import { z } from "zod";

// Schema for AI-parsed resume data
export const parsedResumeSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  skills: z.array(z.string()).default([]),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    duration: z.string().optional(),
    description: z.string().optional(),
  })).default([]),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.string().optional(),
  })).default([]),
  certifications: z.array(z.string()).default([]),
  totalYearsOfExperience: z.number().optional(),
});

// Schema for AI evaluation output
export const aiEvaluationSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  confidenceScore: z.number().min(0).max(1),
  summary: z.string(),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
  missingSkills: z.array(z.string()),
  recommendation: z.enum(["REJECT", "SHORTLIST", "SCREENING", "MANUAL_REVIEW"]),
  reasoning: z.string(),
  suggestedQuestions: z.array(z.string()).default([]),
});

// Schema for screening answer evaluation
export const screeningEvaluationSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  answerEvaluations: z.array(z.object({
    questionId: z.string(),
    score: z.number().int().min(0).max(100),
    feedback: z.string(),
  })),
  summary: z.string(),
  updatedRecommendation: z.enum(["REJECT", "SHORTLIST", "SCREENING", "MANUAL_REVIEW"]).optional(),
});

export type ParsedResumeData = z.infer<typeof parsedResumeSchema>;
export type AIEvaluationResult = z.infer<typeof aiEvaluationSchema>;
export type ScreeningEvaluationResult = z.infer<typeof screeningEvaluationSchema>;
