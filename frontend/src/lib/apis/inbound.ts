import { apiFetch, type Paged } from "@/lib/api";
import type {
  InboundItem,
  CreateInboundRequest,
  UpdateInboundRequest,
} from "@/types/inbound";

const BASE = "/api/inbounds";

export function listInbounds(params?: {
  keyword?: string;
  warehouse?: string;
  status?: string;
  limit?: number;
  cursor?: string;
}) {
  return apiFetch<Paged<InboundItem>>(BASE, undefined, {
    keyword: params?.keyword,
    warehouse: params?.warehouse,
    status: params?.status,
    limit: params?.limit ?? 1000,
    cursor: params?.cursor,
  });
}

export function getInbound(id: string) {
  return apiFetch<InboundItem>(`${BASE}/${encodeURIComponent(id)}`);
}

export function createInbound(payload: CreateInboundRequest) {
  return apiFetch<InboundItem>(BASE, { method: "POST", body: JSON.stringify(payload) });
}

export function updateInbound(id: string, payload: UpdateInboundRequest) {
  return apiFetch<InboundItem>(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteInbound(id: string) {
  return apiFetch<void>(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
}
