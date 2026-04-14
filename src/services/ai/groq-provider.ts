import Groq from "groq-sdk";
import type { AIProvider, CandidateData, JobData, ScreeningData } from "./provider";
import { AI_CONFIG } from "./config";
import { parsedResumeSchema, aiEvaluationSchema, screeningEvaluationSchema } from "@/lib/validations/ai";
import type { ParsedResumeData, AIEvaluationResult, ScreeningEvaluationResult } from "@/lib/validations/ai";
import { getResumeParsePrompt } from "./prompts/resume-parse";
import { getCandidateEvaluationPrompt } from "./prompts/candidate-evaluate";
import { getScreeningEvaluationPrompt } from "./prompts/screening-evaluate";

export class GroqProvider implements AIProvider {
  readonly name = "groq";
  private client: Groq;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY environment variable is not set");
    }
    this.client = new Groq({ apiKey });
  }

  private async callGroq(prompt: string, retryCount = 0): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [
          {
            role: "system",
            content: "You are a precise data extraction and evaluation assistant. Always return valid JSON only, with no additional text, markdown, or explanations.",
          },
          { role: "user", content: prompt },
        ],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from Groq API");
      }
      return content;
    } catch (error) {
      if (retryCount < AI_CONFIG.maxRetries) {
        console.warn(`Groq API call failed, retrying (${retryCount + 1}/${AI_CONFIG.maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.callGroq(prompt, retryCount + 1);
      }
      throw error;
    }
  }

  async parseResume(resumeText: string): Promise<ParsedResumeData> {
    const prompt = getResumeParsePrompt(resumeText);
    const response = await this.callGroq(prompt);
    
    try {
      const parsed = JSON.parse(response);
      return parsedResumeSchema.parse(parsed);
    } catch (error) {
      console.error("Failed to parse resume AI response:", error);
      // Return minimal valid data on parse failure
      return {
        skills: [],
        experience: [],
        education: [],
        certifications: [],
      };
    }
  }

  async evaluateCandidate(
    candidate: CandidateData,
    job: JobData
  ): Promise<AIEvaluationResult> {
    const prompt = getCandidateEvaluationPrompt(candidate, job);
    const response = await this.callGroq(prompt);

    try {
      const parsed = JSON.parse(response);
      return aiEvaluationSchema.parse(parsed);
    } catch (error) {
      console.error("Failed to parse evaluation AI response:", error);
      // Fail safe to manual review
      return {
        matchScore: 0,
        confidenceScore: 0,
        summary: "AI evaluation failed to produce valid output. Manual review required.",
        strengths: [],
        concerns: ["AI evaluation could not be completed"],
        missingSkills: [],
        recommendation: "MANUAL_REVIEW",
        reasoning: "The AI evaluation system produced an invalid response. A human reviewer should assess this candidate.",
        suggestedQuestions: [],
      };
    }
  }

  async evaluateScreening(
    answers: ScreeningData[],
    job: JobData,
    candidateSummary: string
  ): Promise<ScreeningEvaluationResult> {
    const prompt = getScreeningEvaluationPrompt(answers, job, candidateSummary);
    const response = await this.callGroq(prompt);

    try {
      const parsed = JSON.parse(response);
      return screeningEvaluationSchema.parse(parsed);
    } catch (error) {
      console.error("Failed to parse screening AI response:", error);
      return {
        overallScore: 0,
        answerEvaluations: [],
        summary: "Screening evaluation failed. Manual review required.",
      };
    }
  }
}
