import { apiFetch, type Paged } from "@/lib/api";
import type {
  ApprovalAction,
  ApprovalBusinessType,
  ApprovalLog,
  ApprovalRequest,
  ApprovalScope,
  ApprovalStatus,
  BatchApprovalResult,
} from "@/types/approval";

const BASE = "/api/approvals";

export function listApprovals(params: {
  scope: ApprovalScope;
  keyword?: string;
  businessType?: ApprovalBusinessType;
  status?: ApprovalStatus;
  limit?: number;
}) {
  return apiFetch<Paged<ApprovalRequest>>(BASE, undefined, {
    scope: params.scope,
    keyword: params.keyword,
    businessType: params.businessType,
    status: params.status,
    limit: params.limit ?? 1000,
  });
}

export function listApprovalLogs(params?: { keyword?: string; action?: ApprovalAction; limit?: number }) {
  return apiFetch<Paged<ApprovalLog>>(`${BASE}/audit`, undefined, {
    keyword: params?.keyword,
    action: params?.action,
    limit: params?.limit ?? 1000,
  });
}

export function approveRequest(id: string, comment?: string) {
  return apiFetch<ApprovalRequest>(`${BASE}/${encodeURIComponent(id)}/approve`, {
    method: "POST",
    body: JSON.stringify({ comment: comment ?? null }),
  });
}

export function rejectRequest(id: string, comment: string) {
  return apiFetch<ApprovalRequest>(`${BASE}/${encodeURIComponent(id)}/reject`, {
    method: "POST",
    body: JSON.stringify({ comment }),
  });
}

export function withdrawRequest(id: string) {
  return apiFetch<ApprovalRequest>(`${BASE}/${encodeURIComponent(id)}/withdraw`, { method: "POST" });
}

export function batchApprove(ids: string[], comment?: string) {
  return apiFetch<BatchApprovalResult>(`${BASE}/batch-approve`, {
    method: "POST",
    body: JSON.stringify({ ids, comment: comment ?? null }),
  });
}
