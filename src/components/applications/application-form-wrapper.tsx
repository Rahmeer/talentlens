"use client";

import { useState } from "react";
import { submitApplication } from "@/actions/applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, CheckCircle2, X } from "lucide-react";

interface ScreeningQuestion {
  id: string;
  question: string;
  required: boolean;
}

export function ApplicationFormWrapper({
  jobId,
  screeningQuestions,
}: {
  jobId: string;
  screeningQuestions: ScreeningQuestion[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [resumeFile, setResumeFile] = useState<{
    filePath: string; originalName: string; mimeType: string; fileSize: number;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, string>>({});

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) setResumeFile(data.file);
      else setError(data.error || "Upload failed");
    } catch { setError("Failed to upload resume"); }
    finally { setUploading(false); }
  }

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); setSkillInput(""); }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    formData.set("jobId", jobId);
    formData.set("skills", JSON.stringify(skills));
    formData.set("screeningAnswers", JSON.stringify(
      Object.entries(screeningAnswers).map(([questionId, answer]) => ({ questionId, answer }))
    ));
    if (resumeFile) {
      formData.set("resumeFilePath", resumeFile.filePath);
      formData.set("resumeOriginalName", resumeFile.originalName);
      formData.set("resumeMimeType", resumeFile.mimeType);
      formData.set("resumeFileSize", String(resumeFile.fileSize));
    }
    const result = await submitApplication(formData);
    if (result?.error) { setError(result.error); setLoading(false); }
    else { setSuccess(true); setLoading(false); }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="font-semibold text-white mb-1">Application Submitted!</h3>
          <p className="text-sm text-gray-400">Your application is being evaluated. Check your dashboard for updates.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Apply for this position</CardTitle></CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          <div className="space-y-2">
            <Label>Resume (PDF or DOCX)</Label>
            {resumeFile ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-emerald-300 flex-1 truncate">{resumeFile.originalName}</span>
                <button type="button" onClick={() => setResumeFile(null)} className="text-gray-400 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-white/10 hover:border-violet-500/30 cursor-pointer transition-colors">
                {uploading ? <Loader2 className="h-6 w-6 text-violet-500 animate-spin" /> : (
                  <><Upload className="h-6 w-6 text-gray-500 mb-2" /><span className="text-sm text-gray-400">Click to upload</span><span className="text-xs text-gray-500 mt-1">PDF or DOCX, max 10MB</span></>
                )}
                <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleResumeUpload} disabled={uploading} />
              </label>
            )}
          </div>
          <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" placeholder="+1 (555) 000-0000" /></div>
          <div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" name="location" placeholder="City, Country" /></div>
          <div className="space-y-2"><Label htmlFor="yearsOfExperience">Years of Experience</Label><Input id="yearsOfExperience" name="yearsOfExperience" type="number" min={0} /></div>
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add a skill"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} />
              <Button type="button" variant="outline" size="sm" onClick={addSkill}>Add</Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs">
                    {s}<button type="button" onClick={() => setSkills(skills.filter((sk) => sk !== s))}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2"><Label htmlFor="education">Education</Label><Input id="education" name="education" placeholder="BS Computer Science" /></div>
          <div className="space-y-2"><Label htmlFor="linkedIn">LinkedIn (optional)</Label><Input id="linkedIn" name="linkedIn" placeholder="https://linkedin.com/in/..." /></div>
          <div className="space-y-2"><Label htmlFor="portfolio">Portfolio / GitHub (optional)</Label><Input id="portfolio" name="portfolio" placeholder="https://github.com/..." /></div>
          <div className="space-y-2"><Label htmlFor="coverLetter">Cover Letter (optional)</Label><Textarea id="coverLetter" name="coverLetter" placeholder="Why are you interested..." rows={3} /></div>
          {screeningQuestions.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-white/10">
              <h4 className="text-sm font-medium text-white">Screening Questions</h4>
              {screeningQuestions.map((q) => (
                <div key={q.id} className="space-y-1.5">
                  <Label className="text-sm">{q.question}{q.required && <span className="text-red-400 ml-1">*</span>}</Label>
                  <Textarea value={screeningAnswers[q.id] || ""} onChange={(e) => setScreeningAnswers({ ...screeningAnswers, [q.id]: e.target.value })} required={q.required} rows={2} />
                </div>
              ))}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Submitting &amp; Evaluating...</>) : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
