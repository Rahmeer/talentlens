import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Brain, CheckCircle2, XCircle, AlertTriangle, Clock, Shield, FileText, User, Mail, Phone, MapPin, Briefcase, GraduationCap, ExternalLink } from "lucide-react";
import { formatRelativeDate, getScoreColor, getScoreBgColor, getStatusColor } from "@/lib/utils";
import { StatusActions } from "@/components/admin/status-actions";
import { DeleteApplicationButton } from "@/components/admin/delete-application-button";
export default async function ApplicantDetailPage({ params }: { params: Promise<{ id: string; appId: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
  const { id: jobId, appId } = await params;

  const application = await prisma.application.findUnique({
    where: { id: appId },
    include: {
      job: true,
      candidateProfile: { include: { user: true } },
      resume: true,
      aiEvaluation: true,
      screeningAnswers: { include: { question: true } },
      activityLogs: { orderBy: { createdAt: "desc" }, take: 10, include: { performedBy: { select: { name: true } } } },
    },
  });
  if (!application) notFound();

  const eval_ = application.aiEvaluation;
  const profile = application.candidateProfile;
  const user = profile.user;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <Link href={`/admin/jobs/${jobId}/applicants`} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6"><ArrowLeft className="h-4 w-4" /> Back to applicants</Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
            <p className="text-gray-400">{application.job.title}</p>
            <span className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>{application.status.replace(/_/g, " ")}</span>
          </div>
          {eval_ && (
            <div className={`flex items-center gap-4 p-4 rounded-xl border ${getScoreBgColor(eval_.matchScore)}`}>
              <div className="text-center"><div className={`text-4xl font-black ${getScoreColor(eval_.matchScore)}`}>{eval_.matchScore}%</div><div className="text-xs text-gray-400 mt-0.5">Match Score</div></div>
              <div className="h-12 w-px bg-white/10" />
              <div className="text-center"><div className="text-lg font-bold text-white">{Math.round(eval_.confidenceScore * 100)}%</div><div className="text-xs text-gray-400">Confidence</div></div>
              {eval_.ruleBasedScore != null && (<><div className="h-12 w-px bg-white/10" /><div className="text-center"><div className="text-lg font-bold text-white">{eval_.ruleBasedScore}%</div><div className="text-xs text-gray-400">Rule Score</div></div></>)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {eval_ && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-violet-500" />AI Evaluation{eval_.adminOverride && <Badge variant="warning">Overridden</Badge>}</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                  <div><h4 className="text-sm font-medium text-gray-400 mb-2">Summary</h4><p className="text-sm text-gray-300 leading-relaxed">{eval_.summary}</p></div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">AI Recommendation</h4>
                    <div className="flex items-center gap-2">
                      {eval_.recommendation === "SHORTLIST" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                      {eval_.recommendation === "REJECT" && <XCircle className="h-5 w-5 text-red-500" />}
                      {eval_.recommendation === "SCREENING" && <Clock className="h-5 w-5 text-amber-500" />}
                      {eval_.recommendation === "MANUAL_REVIEW" && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                      <span className="font-semibold text-white">{eval_.recommendation.replace(/_/g, " ")}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{eval_.reasoning}</p>
                  </div>
                  {eval_.strengths.length > 0 && <div><h4 className="text-sm font-medium text-gray-400 mb-2">Strengths</h4><ul className="space-y-1.5">{eval_.strengths.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-300"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />{s}</li>)}</ul></div>}
                  {eval_.concerns.length > 0 && <div><h4 className="text-sm font-medium text-gray-400 mb-2">Concerns</h4><ul className="space-y-1.5">{eval_.concerns.map((c, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-300"><AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />{c}</li>)}</ul></div>}
                  {eval_.missingSkills.length > 0 && <div><h4 className="text-sm font-medium text-gray-400 mb-2">Missing Required Skills</h4><div className="flex flex-wrap gap-2">{eval_.missingSkills.map((s) => <Badge key={s} variant="danger">{s}</Badge>)}</div></div>}
                  {eval_.suggestedQuestions.length > 0 && <div><h4 className="text-sm font-medium text-gray-400 mb-2">Suggested Questions</h4><ul className="space-y-1.5">{eval_.suggestedQuestions.map((q, i) => <li key={i} className="text-sm text-gray-300 pl-4 border-l-2 border-violet-500/30">{q}</li>)}</ul></div>}
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Shield className="h-3 w-3" />Provider: {eval_.providerUsed}</span>
                      <span>Model: {eval_.modelUsed}</span><span>Prompt: {eval_.promptVersion}</span>
                      <span>Evaluated: {formatRelativeDate(eval_.evaluatedAt)}</span>
                    </div>
                    {eval_.adminOverride && <div className="mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">Override reason: {eval_.overrideReason || "Not specified"}</div>}
                  </div>
                </CardContent>
              </Card>
            )}
            {application.screeningAnswers.length > 0 && (
              <Card><CardHeader><CardTitle>Screening Answers</CardTitle></CardHeader><CardContent className="space-y-4">
                {application.screeningAnswers.map((sa) => <div key={sa.id}><p className="text-sm font-medium text-gray-300 mb-1">{sa.question.question}</p><p className="text-sm text-gray-400 pl-4 border-l-2 border-white/10">{sa.answer}</p></div>)}
              </CardContent></Card>
            )}
            {application.activityLogs.length > 0 && (
              <Card><CardHeader><CardTitle>Activity Log</CardTitle></CardHeader><CardContent>
                <div className="space-y-3">{application.activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3"><div className="h-2 w-2 rounded-full bg-violet-500 mt-2 shrink-0" /><div><p className="text-sm text-gray-300"><span className="font-medium text-white">{log.performedBy?.name || "System"}</span> {log.action.replace(/_/g, " ").toLowerCase()}</p><p className="text-xs text-gray-500">{formatRelativeDate(log.createdAt)}</p></div></div>
                ))}</div>
              </CardContent></Card>
            )}
          </div>
          <div className="space-y-6">
            <StatusActions applicationId={appId} currentStatus={application.status} />
            <DeleteApplicationButton applicationId={appId} jobId={jobId} />
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-gray-500" /><span className="text-gray-300">{user.email}</span></div>
                {profile.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-gray-500" /><span className="text-gray-300">{profile.phone}</span></div>}
                {profile.location && <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-gray-500" /><span className="text-gray-300">{profile.location}</span></div>}
                {profile.yearsOfExperience != null && <div className="flex items-center gap-2 text-sm"><Briefcase className="h-4 w-4 text-gray-500" /><span className="text-gray-300">{profile.yearsOfExperience} years experience</span></div>}
                {profile.education && <div className="flex items-center gap-2 text-sm"><GraduationCap className="h-4 w-4 text-gray-500" /><span className="text-gray-300">{profile.education}</span></div>}
                {profile.linkedIn && <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300"><ExternalLink className="h-4 w-4" /> LinkedIn</a>}
                {profile.portfolio && <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300"><ExternalLink className="h-4 w-4" /> Portfolio</a>}
                {profile.skills.length > 0 && <div className="pt-3 border-t border-white/5"><p className="text-xs text-gray-500 mb-2">Skills</p><div className="flex flex-wrap gap-1.5">{profile.skills.map((s) => <Badge key={s}>{s}</Badge>)}</div></div>}
              </CardContent>
            </Card>
            {application.resume && <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Resume</CardTitle></CardHeader><CardContent><p className="text-sm text-gray-300">{application.resume.originalName}</p></CardContent></Card>}
            {application.coverLetter && <Card><CardHeader><CardTitle>Cover Letter</CardTitle></CardHeader><CardContent><p className="text-sm text-gray-400 whitespace-pre-wrap">{application.coverLetter}</p></CardContent></Card>}
          </div>
        </div>
      </div>
    </div>
  );
}
