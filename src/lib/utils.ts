import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function getScoreColor(score: number): string {
  if (score >= 85) return "text-emerald-500";
  if (score >= 70) return "text-blue-500";
  if (score >= 55) return "text-amber-500";
  return "text-red-500";
}

export function getScoreBadge(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Sangat Baik", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
  if (score >= 70) return { label: "Baik", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
  if (score >= 55) return { label: "Cukup", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
  return { label: "Perlu Perbaikan", color: "bg-red-500/10 text-red-500 border-red-500/20" };
}
