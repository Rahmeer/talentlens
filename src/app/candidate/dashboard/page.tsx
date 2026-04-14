import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, MapPin, Clock, FileText, ArrowRight } from "lucide-react";
import { formatRelativeDate, getStatusColor } from "@/lib/utils";

export const metadata = { title: "My Applications — TalentLens" };

export default async function CandidateDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const profile = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/login");

  const applications = await prisma.application.findMany({
    where: { candidateProfileId: profile.id },
    include: { job: true, aiEvaluation: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">My Applications</h1>
          <p className="text-gray-400">Track your job applications and AI evaluation results.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: applications.length, color: "text-white" },
            { label: "Shortlisted", value: applications.filter((a) => a.status === "SHORTLISTED").length, color: "text-emerald-400" },
            { label: "Under Review", value: applications.filter((a) => ["SUBMITTED", "UNDER_REVIEW", "SCREENING"].includes(a.status)).length, color: "text-amber-400" },
            { label: "Rejected", value: applications.filter((a) => a.status === "REJECTED").length, color: "text-red-400" },
          ].map((stat) => (
            <Card key={stat.label}><CardContent className="pt-4 pb-4 text-center"><div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div><div className="text-xs text-gray-500 mt-1">{stat.label}</div></CardContent></Card>
          ))}
        </div>
        {applications.length === 0 ? (
          <EmptyState icon={FileText} title="No applications yet" description="Browse open positions and apply to get started."
            action={<Link href="/jobs" className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1">Browse Jobs <ArrowRight className="h-4 w-4" /></Link>} />
        ) : (
          <div className="space-y-3 stagger-children">
            {applications.map((app) => (
              <div key={app.id} className="glass-card rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{app.job.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                      {app.job.department && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{app.job.department}</span>}
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{app.job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Applied {formatRelativeDate(app.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.aiEvaluation && <div className="text-right"><div className="text-xs text-gray-500">AI Score</div><div className="text-lg font-bold text-violet-400">{app.aiEvaluation.matchScore}%</div></div>}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>{app.status.replace(/_/g, " ")}</span>
                  </div>
                </div>
                {app.aiEvaluation && <div className="mt-3 pt-3 border-t border-white/5"><p className="text-sm text-gray-400">{app.aiEvaluation.summary}</p></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

