import { apiFetch } from "@/lib/api";
import type {
  CreateOrderRequest,
  OrderRecord,
  UpdateOrderRequest,
} from "@/types/order";

export function listOrders(params?: { keyword?: string; limit?: number }) {
  return apiFetch<{ items: OrderRecord[]; nextCursor?: string | null }>(
    "/api/orders",
    undefined,
    {
      keyword: params?.keyword,
      limit: params?.limit ?? 500,
    }
  );
}

export function createOrder(payload: CreateOrderRequest) {
  return apiFetch<OrderRecord>("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateOrder(id: string, payload: UpdateOrderRequest) {
  return apiFetch<OrderRecord>(
    `/api/orders/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}

export function deleteOrder(id: string) {
  return apiFetch<void>(`/api/orders/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
