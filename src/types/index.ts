import {
  ApplicationStatus,
  EmploymentType,
  ExperienceLevel,
  JobStatus,
  AIRecommendation,
} from "@prisma/client";

export type { 
  User, 
  Job, 
  Application, 
  Resume, 
  AIEvaluation, 
  CandidateProfile,
  ScreeningQuestion,
  ScreeningAnswer,
  ActivityLog,
} from "@prisma/client";

export {
  ApplicationStatus,
  EmploymentType,
  ExperienceLevel,
  JobStatus,
  AIRecommendation,
};

// Extended types with relations
export interface JobWithCounts {
  id: string;
  title: string;
  department: string | null;
  location: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    applications: number;
  };
}

export interface ApplicationWithDetails {
  id: string;
  jobId: string;
  candidateProfileId: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  createdAt: Date;
  updatedAt: Date;
  job: {
    id: string;
    title: string;
    department: string | null;
    location: string;
    status: JobStatus;
  };
  candidateProfile: {
    id: string;
    userId: string;
    phone: string | null;
    location: string | null;
    yearsOfExperience: number | null;
    skills: string[];
    user: {
      name: string;
      email: string;
    };
  };
  resume: {
    id: string;
    originalName: string;
    filePath: string;
  } | null;
  aiEvaluation: {
    id: string;
    matchScore: number;
    confidenceScore: number;
    ruleBasedScore: number | null;
    summary: string;
    strengths: string[];
    concerns: string[];
    missingSkills: string[];
    recommendation: AIRecommendation;
    reasoning: string;
    suggestedQuestions: string[];
    providerUsed: string;
    modelUsed: string;
    promptVersion: string;
    adminOverride: boolean;
    overrideReason: string | null;
    evaluatedAt: Date;
  } | null;
  screeningAnswers: {
    id: string;
    answer: string;
    question: {
      id: string;
      question: string;
    };
  }[];
}

export interface DashboardStats {
  totalJobs: number;
  publishedJobs: number;
  totalApplications: number;
  shortlisted: number;
  rejected: number;
  screening: number;
  manualReview: number;
}
