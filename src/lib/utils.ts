import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(date);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-amber-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-emerald-500/10 border-emerald-500/20";
  if (score >= 60) return "bg-amber-500/10 border-amber-500/20";
  if (score >= 40) return "bg-orange-500/10 border-orange-500/20";
  return "bg-red-500/10 border-red-500/20";
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    SUBMITTED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    UNDER_REVIEW: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    SHORTLISTED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    SCREENING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
    MANUAL_REVIEW: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    HIRED: "bg-green-500/10 text-green-500 border-green-500/20",
    WITHDRAWN: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    DRAFT: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    PUBLISHED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    CLOSED: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return colors[status] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
}

export function formatEmploymentType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatSalary(min?: number | null, max?: number | null): string {
  if (!min && !max) return "Not specified";
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
