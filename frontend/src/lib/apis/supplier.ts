import { apiFetch, type Paged } from "@/lib/api";
import type {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from "@/types/supplier";

const BASE = "/api/suppliers";

export function listSuppliers(params?: {
  keyword?: string;
  status?: string;
  region?: string;
  category?: string;
  riskLevel?: string;
  limit?: number;
  cursor?: string;
}) {
  return apiFetch<Paged<Supplier>>(BASE, undefined, {
    keyword: params?.keyword,
    status: params?.status,
    region: params?.region,
    category: params?.category,
    riskLevel: params?.riskLevel,
    limit: params?.limit ?? 1000,
    cursor: params?.cursor,
  });
}

export function getSupplier(id: string) {
  return apiFetch<Supplier>(`${BASE}/${encodeURIComponent(id)}`);
}

export function createSupplier(payload: CreateSupplierRequest) {
  return apiFetch<Supplier>(BASE, { method: "POST", body: JSON.stringify(payload) });
}

export function updateSupplier(id: string, payload: UpdateSupplierRequest) {
  return apiFetch<Supplier>(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteSupplier(id: string) {
  return apiFetch<void>(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function bulkDeleteSuppliers(ids: string[]) {
  return apiFetch<void>(`${BASE}/bulk-delete`, { method: "POST", body: JSON.stringify({ ids }) });
}
