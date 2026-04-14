import { prisma } from "@/lib/prisma";
import { getAIProvider, AI_CONFIG } from "./ai";
import type { CandidateData, JobData } from "./ai";
import { extractResumeText } from "./resume";
import type { ParsedResumeData, AIEvaluationResult } from "@/lib/validations/ai";

/**
 * Rule-based scoring for hard requirements.
 * Returns a score 0-100 based on deterministic checks.
 */
function computeRuleBasedScore(
  candidate: {
    skills: string[];
    yearsOfExperience: number | null;
    location: string | null;
    parsedResume: ParsedResumeData | null;
  },
  job: {
    requiredSkills: string[];
    preferredSkills: string[];
    experienceLevel: string;
    location: string;
  }
): number {
  let score = 0;
  let maxScore = 0;

  // Required skills match (weight: 50)
  if (job.requiredSkills.length > 0) {
    maxScore += 50;
    const candidateSkillsLower = [
      ...candidate.skills.map((s) => s.toLowerCase()),
      ...(candidate.parsedResume?.skills?.map((s) => s.toLowerCase()) || []),
    ];
    const matched = job.requiredSkills.filter((rs) =>
      candidateSkillsLower.some(
        (cs) => cs.includes(rs.toLowerCase()) || rs.toLowerCase().includes(cs)
      )
    );
    score += Math.round((matched.length / job.requiredSkills.length) * 50);
  }

  // Preferred skills match (weight: 15)
  if (job.preferredSkills.length > 0) {
    maxScore += 15;
    const candidateSkillsLower = [
      ...candidate.skills.map((s) => s.toLowerCase()),
      ...(candidate.parsedResume?.skills?.map((s) => s.toLowerCase()) || []),
    ];
    const matched = job.preferredSkills.filter((ps) =>
      candidateSkillsLower.some(
        (cs) => cs.includes(ps.toLowerCase()) || ps.toLowerCase().includes(cs)
      )
    );
    score += Math.round((matched.length / job.preferredSkills.length) * 15);
  }

  // Experience level match (weight: 25)
  maxScore += 25;
  const expYears = candidate.yearsOfExperience ?? candidate.parsedResume?.totalYearsOfExperience ?? null;
  if (expYears !== null) {
    const levelRanges: Record<string, [number, number]> = {
      ENTRY: [0, 2],
      MID: [2, 5],
      SENIOR: [5, 10],
      LEAD: [8, 15],
      EXECUTIVE: [12, 30],
    };
    const [min, max] = levelRanges[job.experienceLevel] || [0, 30];
    if (expYears >= min && expYears <= max) {
      score += 25;
    } else if (expYears >= min - 1 && expYears <= max + 2) {
      score += 15; // Close enough
    } else {
      score += 5; // Has some experience
    }
  }

  // Location (weight: 10)
  maxScore += 10;
  if (candidate.location && job.location) {
    const candidateLoc = candidate.location.toLowerCase();
    const jobLoc = job.location.toLowerCase();
    if (
      candidateLoc.includes(jobLoc) ||
      jobLoc.includes(candidateLoc) ||
      jobLoc.includes("remote")
    ) {
      score += 10;
    }
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;
}

/**
 * Main evaluation pipeline.
 * Runs the full hybrid evaluation for an application.
 */
export async function evaluateApplication(applicationId: string): Promise<void> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: true,
      candidateProfile: {
        include: { user: true },
      },
      resume: true,
    },
  });

  if (!application) throw new Error(`Application ${applicationId} not found`);

  // Update status to under review
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "UNDER_REVIEW" },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      applicationId,
      action: "AI_EVALUATION_STARTED",
      details: { timestamp: new Date().toISOString() },
    },
  });

  let resumeText = "";
  let parsedResume: ParsedResumeData | null = null;

  // Step 1: Extract resume text
  if (application.resume) {
    try {
      resumeText = application.resume.extractedText || "";
      if (!resumeText) {
        resumeText = await extractResumeText(
          application.resume.filePath,
          application.resume.mimeType
        );
        await prisma.resume.update({
          where: { id: application.resume.id },
          data: { extractedText: resumeText },
        });
      }
    } catch (error) {
      console.error("Resume text extraction failed:", error);
    }
  }

  // Step 2: AI parse resume into structured data
  if (resumeText) {
    try {
      const provider = getAIProvider();
      parsedResume = await provider.parseResume(resumeText);
      if (application.resume) {
        await prisma.resume.update({
          where: { id: application.resume.id },
          data: { parsedData: JSON.parse(JSON.stringify(parsedResume)) },
        });
      }
    } catch (error) {
      console.error("AI resume parsing failed:", error);
    }
  }

  // Step 3: Rule-based scoring
  const ruleBasedScore = computeRuleBasedScore(
    {
      skills: application.candidateProfile.skills,
      yearsOfExperience: application.candidateProfile.yearsOfExperience,
      location: application.candidateProfile.location,
      parsedResume,
    },
    {
      requiredSkills: application.job.requiredSkills,
      preferredSkills: application.job.preferredSkills,
      experienceLevel: application.job.experienceLevel,
      location: application.job.location,
    }
  );

  // Step 4: AI evaluation
  let aiResult: AIEvaluationResult;
  try {
    const provider = getAIProvider();
    const candidateData: CandidateData = {
      name: application.candidateProfile.user.name,
      email: application.candidateProfile.user.email,
      skills: application.candidateProfile.skills,
      yearsOfExperience: application.candidateProfile.yearsOfExperience,
      education: application.candidateProfile.education,
      location: application.candidateProfile.location,
      workAuthorization: application.candidateProfile.workAuthorization,
      resumeText,
      parsedResume,
    };

    const jobData: JobData = {
      title: application.job.title,
      department: application.job.department,
      location: application.job.location,
      employmentType: application.job.employmentType,
      experienceLevel: application.job.experienceLevel,
      description: application.job.description,
      requiredSkills: application.job.requiredSkills,
      preferredSkills: application.job.preferredSkills,
    };

    aiResult = await provider.evaluateCandidate(candidateData, jobData);
  } catch (error) {
    console.error("AI evaluation failed:", error);
    aiResult = {
      matchScore: 0,
      confidenceScore: 0,
      summary: "AI evaluation failed. Manual review required.",
      strengths: [],
      concerns: ["AI evaluation could not be completed"],
      missingSkills: [],
      recommendation: "MANUAL_REVIEW",
      reasoning: "AI evaluation system error. Human review needed.",
      suggestedQuestions: [],
    };
  }

  // Step 5: Compute hybrid score
  const hybridScore = Math.round(0.4 * ruleBasedScore + 0.6 * aiResult.matchScore);

  // Step 6: Store evaluation
  await prisma.aIEvaluation.create({
    data: {
      applicationId,
      matchScore: hybridScore,
      confidenceScore: aiResult.confidenceScore,
      ruleBasedScore,
      summary: aiResult.summary,
      strengths: aiResult.strengths,
      concerns: aiResult.concerns,
      missingSkills: aiResult.missingSkills,
      recommendation: aiResult.recommendation,
      reasoning: aiResult.reasoning,
      suggestedQuestions: aiResult.suggestedQuestions,
      promptVersion: AI_CONFIG.promptVersion,
      providerUsed: AI_CONFIG.provider,
      modelUsed: AI_CONFIG.model,
      rawResponse: JSON.parse(JSON.stringify(aiResult)),
    },
  });

  // Step 7: Update application status based on recommendation
  const statusMap: Record<string, string> = {
    SHORTLIST: "SHORTLISTED",
    SCREENING: "SCREENING",
    REJECT: "REJECTED",
    MANUAL_REVIEW: "MANUAL_REVIEW",
  };

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: (statusMap[aiResult.recommendation] || "MANUAL_REVIEW") as "SHORTLISTED" | "SCREENING" | "REJECTED" | "MANUAL_REVIEW",
    },
  });

  // Log completion
  await prisma.activityLog.create({
    data: {
      applicationId,
      action: "AI_EVALUATION_COMPLETED",
      details: {
        matchScore: hybridScore,
        ruleBasedScore,
        aiScore: aiResult.matchScore,
        recommendation: aiResult.recommendation,
        provider: AI_CONFIG.provider,
        model: AI_CONFIG.model,
      },
    },
  });
}
