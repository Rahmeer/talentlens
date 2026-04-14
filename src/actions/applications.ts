"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicationSchema } from "@/lib/validations/application";
import { evaluateApplication } from "@/services/evaluation";
import { revalidatePath } from "next/cache";

export async function submitApplication(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "You must be logged in to apply" };
  }

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return { error: "Candidate profile not found. Please complete your profile first." };
  }

  const rawData = {
    jobId: formData.get("jobId") as string,
    coverLetter: (formData.get("coverLetter") as string) || null,
    phone: (formData.get("phone") as string) || null,
    location: (formData.get("location") as string) || null,
    linkedIn: (formData.get("linkedIn") as string) || null,
    portfolio: (formData.get("portfolio") as string) || null,
    yearsOfExperience: formData.get("yearsOfExperience")
      ? Number(formData.get("yearsOfExperience"))
      : null,
    skills: JSON.parse((formData.get("skills") as string) || "[]"),
    education: (formData.get("education") as string) || null,
    workAuthorization: (formData.get("workAuthorization") as string) || null,
    noticePeriod: (formData.get("noticePeriod") as string) || null,
    screeningAnswers: JSON.parse(
      (formData.get("screeningAnswers") as string) || "[]"
    ),
  };

  const validation = applicationSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  // Check for duplicate application
  const existing = await prisma.application.findUnique({
    where: {
      jobId_candidateProfileId: {
        jobId: validation.data.jobId,
        candidateProfileId: profile.id,
      },
    },
  });

  if (existing) {
    return { error: "You have already applied to this job" };
  }

  // Check if job is published
  const job = await prisma.job.findUnique({
    where: { id: validation.data.jobId },
  });

  if (!job || job.status !== "PUBLISHED") {
    return { error: "This job is no longer accepting applications" };
  }

  // Update candidate profile
  await prisma.candidateProfile.update({
    where: { id: profile.id },
    data: {
      phone: rawData.phone,
      location: rawData.location,
      linkedIn: rawData.linkedIn,
      portfolio: rawData.portfolio,
      yearsOfExperience: rawData.yearsOfExperience,
      skills: rawData.skills,
      education: rawData.education,
      workAuthorization: rawData.workAuthorization,
      noticePeriod: rawData.noticePeriod,
    },
  });

  // Create application
  const application = await prisma.application.create({
    data: {
      jobId: validation.data.jobId,
      candidateProfileId: profile.id,
      coverLetter: validation.data.coverLetter,
      status: "SUBMITTED",
    },
  });

  // Handle resume file info (uploaded separately via /api/upload)
  const resumeFilePath = formData.get("resumeFilePath") as string;
  const resumeOriginalName = formData.get("resumeOriginalName") as string;
  const resumeMimeType = formData.get("resumeMimeType") as string;
  const resumeFileSize = formData.get("resumeFileSize") as string;

  if (resumeFilePath) {
    await prisma.resume.create({
      data: {
        applicationId: application.id,
        filePath: resumeFilePath,
        originalName: resumeOriginalName || "resume",
        mimeType: resumeMimeType || "application/pdf",
        fileSize: parseInt(resumeFileSize || "0", 10),
      },
    });
  }

  // Save screening answers
  if (validation.data.screeningAnswers.length > 0) {
    await prisma.screeningAnswer.createMany({
      data: validation.data.screeningAnswers.map((sa) => ({
        questionId: sa.questionId,
        applicationId: application.id,
        answer: sa.answer,
      })),
    });
  }

  // Log activity
  await prisma.activityLog.create({
    data: {
      applicationId: application.id,
      performedById: session.user.id,
      action: "APPLICATION_SUBMITTED",
      details: { jobTitle: job.title },
    },
  });

  // Trigger AI evaluation (synchronous for MVP)
  try {
    await evaluateApplication(application.id);
  } catch (error) {
    console.error("Evaluation failed:", error);
    // Mark as manual review if evaluation fails
    await prisma.application.update({
      where: { id: application.id },
      data: { status: "MANUAL_REVIEW" },
    });
  }

  revalidatePath("/candidate/dashboard");
  revalidatePath(`/admin/jobs/${job.id}/applicants`);

  return { success: true, applicationId: application.id };
}
