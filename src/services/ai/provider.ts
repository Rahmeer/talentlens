import type { ParsedResumeData, AIEvaluationResult, ScreeningEvaluationResult } from "@/lib/validations/ai";

export interface CandidateData {
  name: string;
  email: string;
  skills: string[];
  yearsOfExperience: number | null;
  education: string | null;
  location: string | null;
  workAuthorization: string | null;
  resumeText: string;
  parsedResume: ParsedResumeData | null;
}

export interface JobData {
  title: string;
  department: string | null;
  location: string;
  employmentType: string;
  experienceLevel: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
}

export interface ScreeningData {
  questionId: string;
  question: string;
  answer: string;
  required: boolean;
}

/**
 * AI Provider Interface — all providers must implement this.
 * This abstraction allows swapping Groq for OpenAI, Anthropic, etc.
 */
export interface AIProvider {
  readonly name: string;

  /**
   * Parse raw resume text into structured data
   */
  parseResume(resumeText: string): Promise<ParsedResumeData>;

  /**
   * Evaluate a candidate against a job posting
   */
  evaluateCandidate(
    candidate: CandidateData,
    job: JobData
  ): Promise<AIEvaluationResult>;

  /**
   * Evaluate screening question answers
   */
  evaluateScreening(
    answers: ScreeningData[],
    job: JobData,
    candidateSummary: string
  ): Promise<ScreeningEvaluationResult>;
}
