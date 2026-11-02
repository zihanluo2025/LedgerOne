import { apiFetch, type Paged } from "@/lib/api";
import type {
  CreateReturnRequest,
  ReturnRecord,
  UpdateReturnRequest,
} from "@/types/return";

const BASE = "/api/returns";

export function listReturns(params?: { keyword?: string; limit?: number; cursor?: string }) {
  return apiFetch<Paged<ReturnRecord>>(BASE, undefined, {
    keyword: params?.keyword,
    limit: params?.limit ?? 1000,
    cursor: params?.cursor,
  });
}

export function createReturn(payload: CreateReturnRequest) {
  return apiFetch<ReturnRecord>(BASE, { method: "POST", body: JSON.stringify(payload) });
}

export function updateReturn(id: string, payload: UpdateReturnRequest) {
  return apiFetch<ReturnRecord>(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteReturn(id: string) {
  return apiFetch<void>(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
}
