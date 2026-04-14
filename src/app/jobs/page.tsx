import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  MapPin,
  Briefcase,
  Clock,
  Search,
  ArrowRight,
} from "lucide-react";
import { formatEmploymentType, formatSalary, formatRelativeDate } from "@/lib/utils";

export const metadata = {
  title: "Browse Jobs — TalentLens",
  description: "Browse open positions and apply with AI-powered evaluation",
};

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Open Positions</h1>
          <p className="text-gray-400">
            {jobs.length} {jobs.length === 1 ? "position" : "positions"} available
          </p>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No open positions"
            description="Check back soon — new roles are posted regularly."
          />
        ) : (
          <div className="space-y-4 stagger-children">
            {jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <div className="glass-card rounded-xl p-6 group">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-white group-hover:text-violet-400 transition-colors mb-2">
                        {job.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-3">
                        {job.department && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" />
                            {job.department}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatRelativeDate(job.createdAt)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{formatEmploymentType(job.employmentType)}</Badge>
                        <Badge variant="purple">{job.experienceLevel}</Badge>
                        {(job.salaryMin || job.salaryMax) && (
                          <Badge variant="success">
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-xs text-gray-500">
                        {job._count.applications} applicant{job._count.applications !== 1 ? "s" : ""}
                      </span>
                      <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-violet-400 transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

