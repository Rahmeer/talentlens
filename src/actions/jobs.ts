"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jobSchema } from "@/lib/validations/job";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createJob(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const rawData = {
    title: formData.get("title") as string,
    department: (formData.get("department") as string) || null,
    location: formData.get("location") as string,
    employmentType: formData.get("employmentType") as string,
    experienceLevel: formData.get("experienceLevel") as string,
    salaryMin: formData.get("salaryMin") ? Number(formData.get("salaryMin")) : null,
    salaryMax: formData.get("salaryMax") ? Number(formData.get("salaryMax")) : null,
    description: formData.get("description") as string,
    requiredSkills: JSON.parse((formData.get("requiredSkills") as string) || "[]"),
    preferredSkills: JSON.parse((formData.get("preferredSkills") as string) || "[]"),
    status: (formData.get("status") as string) || "DRAFT",
  };

  const validation = jobSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  // Get screening questions
  const screeningQuestionsRaw = formData.get("screeningQuestions") as string;
  const screeningQuestions = screeningQuestionsRaw
    ? JSON.parse(screeningQuestionsRaw)
    : [];

  const job = await prisma.job.create({
    data: {
      ...validation.data,
      createdById: session.user.id,
      screeningQuestions: {
        create: screeningQuestions.map((q: { question: string; required: boolean }, i: number) => ({
          question: q.question,
          required: q.required ?? true,
          orderNum: i,
        })),
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      performedById: session.user.id,
      action: "JOB_CREATED",
      details: { jobId: job.id, title: job.title },
    },
  });

  revalidatePath("/admin/jobs");
  redirect("/admin/jobs");
}

export async function updateJob(jobId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const rawData = {
    title: formData.get("title") as string,
    department: (formData.get("department") as string) || null,
    location: formData.get("location") as string,
    employmentType: formData.get("employmentType") as string,
    experienceLevel: formData.get("experienceLevel") as string,
    salaryMin: formData.get("salaryMin") ? Number(formData.get("salaryMin")) : null,
    salaryMax: formData.get("salaryMax") ? Number(formData.get("salaryMax")) : null,
    description: formData.get("description") as string,
    requiredSkills: JSON.parse((formData.get("requiredSkills") as string) || "[]"),
    preferredSkills: JSON.parse((formData.get("preferredSkills") as string) || "[]"),
    status: (formData.get("status") as string) || "DRAFT",
  };

  const validation = jobSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  await prisma.job.update({
    where: { id: jobId },
    data: validation.data,
  });

  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
  redirect("/admin/jobs");
}

export async function updateJobStatus(jobId: string, status: "DRAFT" | "PUBLISHED" | "CLOSED") {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  await prisma.job.update({
    where: { id: jobId },
    data: { status },
  });

  await prisma.activityLog.create({
    data: {
      performedById: session.user.id,
      action: "JOB_STATUS_CHANGED",
      details: { jobId, status },
    },
  });

  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
}

export async function deleteJob(jobId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  await prisma.job.delete({ where: { id: jobId } });

  await prisma.activityLog.create({
    data: {
      performedById: session.user.id,
      action: "JOB_DELETED",
      details: { jobId },
    },
  });

  revalidatePath("/admin/jobs");
  redirect("/admin/jobs");
}
