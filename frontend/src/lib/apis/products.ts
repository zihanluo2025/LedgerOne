import { apiFetch } from "@/lib/api";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types/product";

const BASE = "/api/products";

// GET /api/products/all -> every non-deleted product for the organisation.
export function listProducts(params?: { keyword?: string }) {
  return apiFetch<{ items: Product[] }>(`${BASE}/all`, undefined, {
    keyword: params?.keyword,
  });
}

export function getProduct(id: string) {
  return apiFetch<Product>(`${BASE}/${encodeURIComponent(id)}`);
}

export function createProduct(payload: CreateProductRequest) {
  return apiFetch<{ id: string }>(BASE, { method: "POST", body: JSON.stringify(payload) });
}

export function updateProduct(id: string, payload: UpdateProductRequest) {
  return apiFetch<void>(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(id: string) {
  return apiFetch<void>(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
}
