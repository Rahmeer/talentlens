import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardStats } from "@/actions/admin";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
} from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

export const metadata = { title: "Admin Dashboard — TalentLens" };

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const stats = await getDashboardStats();
  if (!stats) redirect("/login");

  const recentApplications = await prisma.application.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      job: { select: { title: true } },
      candidateProfile: { include: { user: { select: { name: true, email: true } } } },
      aiEvaluation: { select: { matchScore: true, recommendation: true } },
    },
  });

  const recentLogs = await prisma.activityLog.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      performedBy: { select: { name: true } },
    },
  });

  const statCards = [
    { label: "Total Jobs", value: stats.totalJobs, icon: Briefcase, color: "from-violet-500 to-indigo-500" },
    { label: "Total Applicants", value: stats.totalApplications, icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "Shortlisted", value: stats.shortlisted, icon: CheckCircle2, color: "from-emerald-500 to-teal-500" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, color: "from-red-500 to-rose-500" },
    { label: "Screening", value: stats.screening, icon: Clock, color: "from-amber-500 to-orange-500" },
    { label: "Manual Review", value: stats.manualReview, icon: AlertTriangle, color: "from-fuchsia-500 to-pink-500" },
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400 mt-1">Overview of your hiring pipeline</p>
          </div>
          <Link href="/admin/jobs/new">
            <Button>
              <Plus className="h-4 w-4" /> New Job
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 stagger-children">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-5 pb-5">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              <Link href="/admin/jobs" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentApplications.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No applications yet</p>
              ) : (
                <div className="space-y-3">
                  {recentApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {app.candidateProfile.user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {app.job.title} · {formatRelativeDate(app.createdAt)}
                        </p>
                      </div>
                      {app.aiEvaluation && (
                        <div className="text-right ml-3">
                          <div className="text-sm font-bold text-violet-400">
                            {app.aiEvaluation.matchScore}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {app.aiEvaluation.recommendation}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              {recentLogs.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No activity yet</p>
              ) : (
                <div className="space-y-3">
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5"
                    >
                      <div className="h-2 w-2 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300">
                          <span className="font-medium text-white">
                            {log.performedBy?.name || "System"}
                          </span>{" "}
                          {log.action.replace(/_/g, " ").toLowerCase()}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatRelativeDate(log.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

