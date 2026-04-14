import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Brain, ArrowRight } from "lucide-react";
import { formatRelativeDate, getStatusColor, getScoreColor } from "@/lib/utils";

export default async function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      applications: {
        include: {
          candidateProfile: { include: { user: { select: { name: true, email: true } } } },
          aiEvaluation: { select: { matchScore: true, recommendation: true, summary: true, adminOverride: true, confidenceScore: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!job) notFound();

  const sortedApps = [...job.applications].sort((a, b) => (b.aiEvaluation?.matchScore ?? -1) - (a.aiEvaluation?.matchScore ?? -1));

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/admin/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6"><ArrowLeft className="h-4 w-4" /> Back to jobs</Link>
        <div className="mb-8"><h1 className="text-3xl font-bold mb-1">{job.title}</h1><p className="text-gray-400">Applicants and AI evaluations</p></div>
        <div className="grid grid-cols-5 gap-3 mb-8">
          {[
            { label: "Total", value: job.applications.length, cls: "text-white" },
            { label: "Shortlisted", value: job.applications.filter((a) => a.status === "SHORTLISTED").length, cls: "text-emerald-400" },
            { label: "Screening", value: job.applications.filter((a) => a.status === "SCREENING").length, cls: "text-amber-400" },
            { label: "Review", value: job.applications.filter((a) => a.status === "MANUAL_REVIEW").length, cls: "text-orange-400" },
            { label: "Rejected", value: job.applications.filter((a) => a.status === "REJECTED").length, cls: "text-red-400" },
          ].map((s) => (<Card key={s.label}><CardContent className="py-3 text-center"><div className={`text-xl font-bold ${s.cls}`}>{s.value}</div><div className="text-xs text-gray-500">{s.label}</div></CardContent></Card>))}
        </div>
        {sortedApps.length === 0 ? <EmptyState icon={Users} title="No applicants yet" description="Share this job to start receiving applications." /> : (
          <div className="space-y-3 stagger-children">
            {sortedApps.map((app, index) => (
              <Link key={app.id} href={`/admin/jobs/${id}/applicants/${app.id}`}>
                <div className="glass-card rounded-xl p-5 group">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-sm font-bold shrink-0">{index + 1}</div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors">{app.candidateProfile.user.name}</h3>
                        <p className="text-sm text-gray-400 truncate">{app.candidateProfile.user.email} · Applied {formatRelativeDate(app.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      {app.aiEvaluation && (
                        <div className="text-right">
                          <div className={`text-xl font-bold ${getScoreColor(app.aiEvaluation.matchScore)}`}>{app.aiEvaluation.matchScore}%</div>
                          <div className="flex items-center gap-1 text-xs text-gray-500"><Brain className="h-3 w-3" />{app.aiEvaluation.recommendation}{app.aiEvaluation.adminOverride && <span className="text-amber-400 ml-1">(overridden)</span>}</div>
                        </div>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>{app.status.replace(/_/g, " ")}</span>
                      <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-violet-400 transition-colors" />
                    </div>
                  </div>
                  {app.aiEvaluation?.summary && <p className="text-sm text-gray-500 mt-3 pl-14 line-clamp-1">{app.aiEvaluation.summary}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
