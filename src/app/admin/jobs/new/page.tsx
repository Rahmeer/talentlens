"use client";

import { useState } from "react";
import { createJob } from "@/actions/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X, Plus } from "lucide-react";

export default function NewJobPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [prefSkillInput, setPrefSkillInput] = useState("");
  const [screeningQuestions, setScreeningQuestions] = useState<{ question: string; required: boolean }[]>([]);
  const [questionInput, setQuestionInput] = useState("");

  function addSkill(type: "required" | "preferred") {
    const input = type === "required" ? skillInput : prefSkillInput;
    const s = input.trim();
    if (!s) return;
    if (type === "required" && !requiredSkills.includes(s)) { setRequiredSkills([...requiredSkills, s]); setSkillInput(""); }
    else if (type === "preferred" && !preferredSkills.includes(s)) { setPreferredSkills([...preferredSkills, s]); setPrefSkillInput(""); }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true); setError("");
    formData.set("requiredSkills", JSON.stringify(requiredSkills));
    formData.set("preferredSkills", JSON.stringify(preferredSkills));
    formData.set("screeningQuestions", JSON.stringify(screeningQuestions));
    const result = await createJob(formData);
    if (result?.error) { setError(result.error); setLoading(false); }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Create New Job</h1>
        <Card><CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-6">
            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="title">Job Title *</Label><Input id="title" name="title" placeholder="Senior Full-Stack Engineer" required /></div>
              <div className="space-y-2"><Label htmlFor="department">Department</Label><Input id="department" name="department" placeholder="Engineering" /></div>
              <div className="space-y-2"><Label htmlFor="location">Location *</Label><Input id="location" name="location" placeholder="Remote / San Francisco, CA" required /></div>
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select name="employmentType" defaultValue="FULL_TIME"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="FULL_TIME">Full Time</SelectItem><SelectItem value="PART_TIME">Part Time</SelectItem><SelectItem value="CONTRACT">Contract</SelectItem><SelectItem value="INTERNSHIP">Internship</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select name="experienceLevel" defaultValue="MID"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="ENTRY">Entry</SelectItem><SelectItem value="MID">Mid</SelectItem><SelectItem value="SENIOR">Senior</SelectItem><SelectItem value="LEAD">Lead</SelectItem><SelectItem value="EXECUTIVE">Executive</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="salaryMin">Salary Min ($)</Label><Input id="salaryMin" name="salaryMin" type="number" placeholder="80000" /></div>
              <div className="space-y-2"><Label htmlFor="salaryMax">Salary Max ($)</Label><Input id="salaryMax" name="salaryMax" type="number" placeholder="150000" /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="description">Job Description *</Label><Textarea id="description" name="description" placeholder="Describe the role..." rows={8} required /></div>
            <div className="space-y-2">
              <Label>Required Skills *</Label>
              <div className="flex gap-2"><Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="e.g. React, TypeScript"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill("required"); } }} /><Button type="button" variant="outline" onClick={() => addSkill("required")}>Add</Button></div>
              <div className="flex flex-wrap gap-1.5">{requiredSkills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs">{s}<button type="button" onClick={() => setRequiredSkills(requiredSkills.filter((sk) => sk !== s))}><X className="h-3 w-3" /></button></span>
              ))}</div>
            </div>
            <div className="space-y-2">
              <Label>Preferred Skills</Label>
              <div className="flex gap-2"><Input value={prefSkillInput} onChange={(e) => setPrefSkillInput(e.target.value)} placeholder="e.g. GraphQL, AWS"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill("preferred"); } }} /><Button type="button" variant="outline" onClick={() => addSkill("preferred")}>Add</Button></div>
              <div className="flex flex-wrap gap-1.5">{preferredSkills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs">{s}<button type="button" onClick={() => setPreferredSkills(preferredSkills.filter((sk) => sk !== s))}><X className="h-3 w-3" /></button></span>
              ))}</div>
            </div>
            <div className="space-y-2">
              <Label>Screening Questions (optional)</Label>
              <div className="flex gap-2"><Input value={questionInput} onChange={(e) => setQuestionInput(e.target.value)} placeholder="e.g. Describe your experience..."
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (questionInput.trim()) { setScreeningQuestions([...screeningQuestions, { question: questionInput.trim(), required: true }]); setQuestionInput(""); } } }} />
                <Button type="button" variant="outline" onClick={() => { if (questionInput.trim()) { setScreeningQuestions([...screeningQuestions, { question: questionInput.trim(), required: true }]); setQuestionInput(""); } }}>Add</Button></div>
              {screeningQuestions.map((q, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/5"><span className="text-sm text-gray-300 flex-1">{q.question}</span>
                  <button type="button" onClick={() => setScreeningQuestions(screeningQuestions.filter((_, j) => j !== i))} className="text-gray-500 hover:text-red-400"><X className="h-4 w-4" /></button></div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select name="status" defaultValue="DRAFT"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="DRAFT">Draft</SelectItem><SelectItem value="PUBLISHED">Published</SelectItem></SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : <><Plus className="h-4 w-4" /> Create Job</>}
            </Button>
          </form>
        </CardContent></Card>
      </div>
    </div>
  );
}

