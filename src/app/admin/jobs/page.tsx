import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Briefcase, MapPin, Users, Eye, Pencil } from "lucide-react";
import { getStatusColor, formatEmploymentType } from "@/lib/utils";
import { updateJobStatus } from "@/actions/jobs";
import { DeleteJobButton } from "@/components/admin/delete-job-button";

export const metadata = { title: "Manage Jobs — TalentLens" };

export default async function AdminJobsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold">Jobs</h1><p className="text-gray-400 mt-1">{jobs.length} total jobs</p></div>
          <Link href="/admin/jobs/new"><Button><Plus className="h-4 w-4" /> Create Job</Button></Link>
        </div>
        {jobs.length === 0 ? (
          <EmptyState icon={Briefcase} title="No jobs created yet" description="Create your first job posting."
            action={<Link href="/admin/jobs/new"><Button size="sm"><Plus className="h-4 w-4" /> Create Job</Button></Link>} />
        ) : (
          <div className="space-y-3 stagger-children">
            {jobs.map((job) => (
              <div key={job.id} className="glass-card rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>{job.status}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      {job.department && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job.department}</span>}
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{job._count.applications} applicants</span>
                      <Badge>{formatEmploymentType(job.employmentType)}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {job._count.applications > 0 && <Link href={`/admin/jobs/${job.id}/applicants`}><Button variant="outline" size="sm"><Eye className="h-4 w-4" /> Applicants</Button></Link>}
                    <Link href={`/admin/jobs/${job.id}/edit`}><Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button></Link>
                    {job.status === "DRAFT" && (
                      <form action={async () => { "use server"; await updateJobStatus(job.id, "PUBLISHED"); }}><Button variant="success" size="sm" type="submit">Publish</Button></form>
                    )}
                    {job.status === "PUBLISHED" && (
                      <form action={async () => { "use server"; await updateJobStatus(job.id, "CLOSED"); }}><Button variant="destructive" size="sm" type="submit">Close</Button></form>
                    )}
                    <DeleteJobButton jobId={job.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

