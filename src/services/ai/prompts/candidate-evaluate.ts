import type { CandidateData, JobData } from "../provider";

/**
 * Prompt template for evaluating a candidate against a job posting.
 * Version: v1.0
 */
export function getCandidateEvaluationPrompt(
  candidate: CandidateData,
  job: JobData
): string {
  const candidateInfo = `
CANDIDATE PROFILE:
- Skills: ${candidate.skills.join(", ") || "Not specified"}
- Years of Experience: ${candidate.yearsOfExperience ?? "Not specified"}
- Education: ${candidate.education || "Not specified"}
- Location: ${candidate.location || "Not specified"}

RESUME CONTENT:
${candidate.resumeText.slice(0, 3000)}
${candidate.parsedResume ? `
PARSED RESUME DATA:
${JSON.stringify(candidate.parsedResume, null, 2)}` : ""}`;

  const jobInfo = `
JOB POSTING:
- Title: ${job.title}
- Department: ${job.department || "Not specified"}
- Location: ${job.location}
- Employment Type: ${job.employmentType}
- Experience Level: ${job.experienceLevel}
- Required Skills: ${job.requiredSkills.join(", ")}
- Preferred Skills: ${job.preferredSkills.join(", ") || "None specified"}

JOB DESCRIPTION:
${job.description.slice(0, 2000)}`;

  return `You are an expert hiring evaluation assistant. Your role is to provide a fair, unbiased assessment of a candidate's fit for a job position.

CRITICAL RULES:
1. NEVER consider protected characteristics: age, gender, race, ethnicity, religion, disability, sexual orientation, marital status, pregnancy, national origin, or genetic information
2. NEVER make assumptions about a candidate based on their name, location, or school
3. Focus ONLY on skills, experience, qualifications, and demonstrated competencies
4. Be objective and evidence-based in your assessment
5. You are an ASSISTANT — your evaluation supports human decision-making but does NOT make final hiring decisions
6. When uncertain, recommend MANUAL_REVIEW rather than making a definitive judgment
7. Score conservatively — a 70+ score should indicate genuine strong fit

${jobInfo}

${candidateInfo}

Evaluate this candidate and return a JSON object with this exact structure:
{
  "matchScore": <integer 0-100>,
  "confidenceScore": <float 0.0-1.0, how confident you are in your assessment>,
  "summary": "<2-3 sentence summary of candidate fit>",
  "strengths": ["<list of specific strengths relevant to this role>"],
  "concerns": ["<list of specific concerns or gaps>"],
  "missingSkills": ["<required skills the candidate appears to lack>"],
  "recommendation": "<one of: REJECT | SHORTLIST | SCREENING | MANUAL_REVIEW>",
  "reasoning": "<concise explanation of recommendation>",
  "suggestedQuestions": ["<screening questions to ask if further evaluation needed>"]
}

RECOMMENDATION GUIDELINES:
- SHORTLIST (score 75+): Strong match with most required skills, relevant experience
- SCREENING (score 50-74): Promising but needs further evaluation via screening questions
- MANUAL_REVIEW (score 30-49): Unclear fit, human judgment needed
- REJECT (score <30): Clear mismatch with fundamental requirements

Return ONLY valid JSON, no additional text.`;
}
