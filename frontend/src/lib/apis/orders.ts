import { apiFetch, type Paged } from "@/lib/api";
import type {
  CreateOrderRequest,
  OrderRecord,
  OrderStatus,
  UpdateOrderRequest,
} from "@/types/order";

const BASE = "/api/orders";

export function listOrders(params?: { keyword?: string; status?: OrderStatus; limit?: number; cursor?: string }) {
  return apiFetch<Paged<OrderRecord>>(BASE, undefined, {
    keyword: params?.keyword,
    status: params?.status,
    limit: params?.limit ?? 1000,
    cursor: params?.cursor,
  });
}

export function createOrder(payload: CreateOrderRequest) {
  return apiFetch<OrderRecord>(BASE, { method: "POST", body: JSON.stringify(payload) });
}

export function updateOrder(id: string, payload: UpdateOrderRequest) {
  return apiFetch<OrderRecord>(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteOrder(id: string) {
  return apiFetch<void>(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
}
