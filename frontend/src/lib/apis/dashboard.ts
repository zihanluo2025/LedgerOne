import { apiFetch } from "@/lib/api";
import type { DashboardSummary } from "@/types/dashboard";

export function getDashboardSummary(days = 7) {
  return apiFetch<DashboardSummary>("/api/dashboard/summary", undefined, { days });
}
