import { apiFetch, type Paged } from "@/lib/api";
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "@/types/customer";

const BASE = "/api/customers";

export function listCustomers(params?: {
  keyword?: string;
  status?: string;
  segment?: string;
  limit?: number;
  cursor?: string;
}) {
  return apiFetch<Paged<Customer>>(BASE, undefined, {
    keyword: params?.keyword,
    status: params?.status,
    segment: params?.segment,
    limit: params?.limit ?? 1000,
    cursor: params?.cursor,
  });
}

export function getCustomer(id: string) {
  return apiFetch<Customer>(`${BASE}/${encodeURIComponent(id)}`);
}

export function createCustomer(payload: CreateCustomerRequest) {
  return apiFetch<Customer>(BASE, { method: "POST", body: JSON.stringify(payload) });
}

export function updateCustomer(id: string, payload: UpdateCustomerRequest) {
  return apiFetch<Customer>(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteCustomer(id: string) {
  return apiFetch<void>(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function bulkDeleteCustomers(ids: string[]) {
  return apiFetch<void>(`${BASE}/bulk-delete`, { method: "POST", body: JSON.stringify({ ids }) });
}
