"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ApplicationStatus } from "@prisma/client";
import { deleteFile } from "@/services/file-storage";

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  reason?: string
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { aiEvaluation: true },
  });

  if (!application) {
    return { error: "Application not found" };
  }

  const previousStatus = application.status;

  await prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });

  // Check if this overrides AI recommendation
  const isOverride =
    application.aiEvaluation &&
    statusToRecommendation(status) !== application.aiEvaluation.recommendation;

  if (isOverride && application.aiEvaluation) {
    await prisma.aIEvaluation.update({
      where: { id: application.aiEvaluation.id },
      data: {
        adminOverride: true,
        overrideReason: reason || `Status changed from AI recommendation`,
        overriddenBy: session.user.id,
        overriddenAt: new Date(),
      },
    });
  }

  await prisma.activityLog.create({
    data: {
      applicationId,
      performedById: session.user.id,
      action: "STATUS_CHANGE",
      details: {
        from: previousStatus,
        to: status,
        reason,
        isOverride,
      },
    },
  });

  revalidatePath(`/admin/jobs/${application.jobId}/applicants`);
  revalidatePath(`/admin/jobs/${application.jobId}/applicants/${applicationId}`);

  return { success: true };
}
export async function deleteApplication(applicationId: string, jobId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { resume: true },
  });

  if (!application) {
    return { error: "Application not found" };
  }

  if (application.resume?.filePath) {
    await deleteFile(application.resume.filePath);
  }

  await prisma.application.delete({
    where: { id: applicationId },
  });

  revalidatePath(`/admin/jobs/${jobId}/applicants`);
  
  return { success: true };
}

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  const [totalJobs, publishedJobs, totalApplications, statusCounts] =
    await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { status: "PUBLISHED" } }),
      prisma.application.count(),
      prisma.application.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

  const countMap = statusCounts.reduce(
    (acc, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalJobs,
    publishedJobs,
    totalApplications,
    shortlisted: countMap["SHORTLISTED"] || 0,
    rejected: countMap["REJECTED"] || 0,
    screening: countMap["SCREENING"] || 0,
    manualReview: countMap["MANUAL_REVIEW"] || 0,
  };
}

function statusToRecommendation(
  status: ApplicationStatus
): string | null {
  const map: Record<string, string> = {
    SHORTLISTED: "SHORTLIST",
    REJECTED: "REJECT",
    SCREENING: "SCREENING",
    MANUAL_REVIEW: "MANUAL_REVIEW",
  };
  return map[status] || null;
}
