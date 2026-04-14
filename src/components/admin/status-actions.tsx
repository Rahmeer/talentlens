"use client";

import { useState } from "react";
import { updateApplicationStatus } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, AlertTriangle, Loader2 } from "lucide-react";
import type { ApplicationStatus } from "@prisma/client";

export function StatusActions({ applicationId, currentStatus }: { applicationId: string; currentStatus: ApplicationStatus }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  async function handleStatusChange(status: ApplicationStatus) {
    setLoading(status); setError("");
    const result = await updateApplicationStatus(applicationId, status, reason || undefined);
    if (result?.error) setError(result.error);
    setLoading(null); setReason("");
  }

  const actions = [
    { status: "SHORTLISTED" as ApplicationStatus, label: "Shortlist", icon: CheckCircle2, variant: "success" as const },
    { status: "SCREENING" as ApplicationStatus, label: "Screening", icon: Clock, variant: "outline" as const },
    { status: "MANUAL_REVIEW" as ApplicationStatus, label: "Manual Review", icon: AlertTriangle, variant: "outline" as const },
    { status: "REJECTED" as ApplicationStatus, label: "Reject", icon: XCircle, variant: "destructive" as const },
  ];

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {error && <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>}
        <div className="grid grid-cols-2 gap-2">
          {actions.filter((a) => a.status !== currentStatus).map((action) => (
            <Button key={action.status} variant={action.variant} size="sm" className="w-full" disabled={loading !== null}
              onClick={() => handleStatusChange(action.status)}>
              {loading === action.status ? <Loader2 className="h-4 w-4 animate-spin" /> : <action.icon className="h-4 w-4" />}{action.label}
            </Button>
          ))}
        </div>
        <div className="pt-2 border-t border-white/5">
          <p className="text-xs text-gray-500 mb-2">Override reason (optional)</p>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for overriding AI recommendation..." rows={2} className="text-xs" />
        </div>
      </CardContent>
    </Card>
  );
}
