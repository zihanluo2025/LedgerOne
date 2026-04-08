import { apiFetch } from "@/lib/api";
import type {
  CreateReturnRequest,
  ReturnRecord,
  UpdateReturnRequest,
} from "@/types/return";

export function listReturns(params?: { keyword?: string; limit?: number }) {
  return apiFetch<{ items: ReturnRecord[]; nextCursor?: string | null }>(
    "/api/returns",
    undefined,
    {
      keyword: params?.keyword,
      limit: params?.limit ?? 200,
    }
  );
}

export function createReturn(payload: CreateReturnRequest) {
  return apiFetch<ReturnRecord>("/api/returns", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateReturn(id: string, payload: UpdateReturnRequest) {
  return apiFetch<ReturnRecord>(
    `/api/returns/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}

export function deleteReturn(id: string) {
  return apiFetch<void>(`/api/returns/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
