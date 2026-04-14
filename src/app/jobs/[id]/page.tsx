import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Briefcase, Clock, DollarSign,
  CheckCircle2, Star, ArrowLeft,
} from "lucide-react";
import { formatEmploymentType, formatSalary, formatRelativeDate } from "@/lib/utils";
import { ApplicationFormWrapper } from "@/components/applications/application-form-wrapper";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id, status: "PUBLISHED" },
    include: {
      screeningQuestions: { orderBy: { orderNum: "asc" } },
      _count: { select: { applications: true } },
    },
  });
  if (!job) notFound();

  const session = await auth();
  let hasApplied = false;
  if (session?.user) {
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } });
    if (profile) {
      const existing = await prisma.application.findUnique({
        where: { jobId_candidateProfileId: { jobId: job.id, candidateProfileId: profile.id } },
      });
      hasApplied = !!existing;
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to all jobs
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge>{formatEmploymentType(job.employmentType)}</Badge>
                <Badge variant="purple">{job.experienceLevel}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                {job.department && (<span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {job.department}</span>)}
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {job.location}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Posted {formatRelativeDate(job.createdAt)}</span>
                {(job.salaryMin || job.salaryMax) && (<span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4" />{formatSalary(job.salaryMin, job.salaryMax)}</span>)}
              </div>
            </div>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Job Description</h3>
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">{job.description}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {job.requiredSkills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm">
                      <CheckCircle2 className="h-3.5 w-3.5" />{skill}
                    </span>
                  ))}
                </div>
                {job.preferredSkills.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold text-white mb-4">Preferred Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.preferredSkills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm">
                          <Star className="h-3.5 w-3.5" />{skill}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {hasApplied ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    </div>
                    <h3 className="font-semibold text-white mb-1">Already Applied</h3>
                    <p className="text-sm text-gray-400 mb-4">You&apos;ve already submitted an application for this position.</p>
                    <Link href="/candidate/dashboard"><Button variant="outline" className="w-full">View My Applications</Button></Link>
                  </CardContent>
                </Card>
              ) : session?.user?.role === "CANDIDATE" ? (
                <ApplicationFormWrapper jobId={job.id} screeningQuestions={job.screeningQuestions} />
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <h3 className="font-semibold text-white mb-2">Interested?</h3>
                    <p className="text-sm text-gray-400 mb-4">Sign in or create an account to apply.</p>
                    <div className="space-y-2">
                      <Link href="/login" className="block"><Button className="w-full">Sign In to Apply</Button></Link>
                      <Link href="/signup" className="block"><Button variant="outline" className="w-full">Create Account</Button></Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
