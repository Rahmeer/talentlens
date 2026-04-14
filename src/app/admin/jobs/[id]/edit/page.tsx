import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";

export const metadata = { title: "Edit Job — TalentLens" };

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) redirect("/admin/jobs");

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-4">Edit: {job.title}</h1>
        <p className="text-gray-400 mb-8">Full edit form is planned for V2. Current job details:</p>
        <pre className="p-4 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 overflow-auto">
          {JSON.stringify({ title: job.title, department: job.department, location: job.location, employmentType: job.employmentType, experienceLevel: job.experienceLevel, salaryMin: job.salaryMin, salaryMax: job.salaryMax, requiredSkills: job.requiredSkills, preferredSkills: job.preferredSkills, status: job.status }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
