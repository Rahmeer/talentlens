import type { JobData, ScreeningData } from "../provider";

/**
 * Prompt template for evaluating screening answers.
 * Version: v1.0
 */
export function getScreeningEvaluationPrompt(
  answers: ScreeningData[],
  job: JobData,
  candidateSummary: string
): string {
  const answersText = answers
    .map(
      (a, i) => `Q${i + 1} (${a.required ? "Required" : "Optional"}): ${a.question}
A${i + 1}: ${a.answer}`
    )
    .join("\n\n");

  return `You are an expert hiring evaluation assistant reviewing screening question answers.

CRITICAL RULES:
1. NEVER consider protected characteristics
2. Evaluate answers based on relevance, depth, and technical accuracy
3. Focus on job-relevant competencies only
4. Be fair and consistent in scoring

JOB: ${job.title} (${job.experienceLevel} level)
Required Skills: ${job.requiredSkills.join(", ")}

CANDIDATE SUMMARY: ${candidateSummary}

SCREENING ANSWERS:
${answersText}

Return a JSON object:
{
  "overallScore": <integer 0-100>,
  "answerEvaluations": [
    {
      "questionId": "<question id>",
      "score": <integer 0-100>,
      "feedback": "<brief feedback on answer quality>"
    }
  ],
  "summary": "<overall assessment of screening answers>",
  "updatedRecommendation": "<REJECT | SHORTLIST | SCREENING | MANUAL_REVIEW or null if no change>"
}

Return ONLY valid JSON, no additional text.`;
}
