import { apiFetch } from "@/lib/api";
import type {
  InboundItem,
  CreateInboundRequest,
} from "@/types/inbound";

// POST /api/inbounds -> 201 Created { id }
export function createInbound(payload: CreateInboundRequest) {
  return apiFetch<{ id: string }>(
    "/api/inbounds",
    { method: "POST", body: JSON.stringify(payload) }
  );
}

// GET /api/inbounds/{id} -> InboundItem
export function getInbound(id: string) {
  return apiFetch<InboundItem>(`/api/inbounds/${encodeURIComponent(id)}`);
}

// GET /api/inbounds -> { items: InboundItem[] }
export function listInbounds(params?: {
  keyword?: string;
  warehouse?: string;
  status?: string;
  limit?: number;
  cursor?: string;
}) {
  return apiFetch<{ items: InboundItem[]; nextCursor?: string | null }>(
    "/api/inbounds",
    undefined,
    {
      keyword: params?.keyword,
      warehouse: params?.warehouse,
      status: params?.status,
      limit: params?.limit ?? 50,
      cursor: params?.cursor,
    }
  );
}

// GET /api/inbounds/page -> { items, nextCursor }
export function pageInbounds(params?: {
  keyword?: string;
  warehouse?: string;
  status?: string;
  limit?: number;
  cursor?: string;
}) {
  return apiFetch<{ items: InboundItem[]; nextCursor?: string | null }>(
    "/api/inbounds/page",
    undefined,
    {
      keyword: params?.keyword,
      warehouse: params?.warehouse,
      status: params?.status,
      limit: params?.limit ?? 50,
      cursor: params?.cursor,
    }
  );
}

// PUT /api/inbounds/{id} -> 204
export function updateInbound(
  id: string,
  payload: CreateInboundRequest
) {
  return apiFetch<void>(
    `/api/inbounds/${encodeURIComponent(id)}`,
    { method: "PUT", body: JSON.stringify(payload) }
  );
}

// DELETE /api/inbounds/{id} -> 204
export function deleteInbound(id: string) {
  return apiFetch<void>(
    `/api/inbounds/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}