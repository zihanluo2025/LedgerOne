import { apiFetch } from "@/lib/api";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types/product";



// POST /products -> 201 Created { id }
export function createProduct(payload: CreateProductRequest) {
  return apiFetch<{ id: string }>(
    "/products",
    { method: "POST", body: JSON.stringify(payload) }
  );
}

// GET /products/{id} -> Product
export function getProduct(id: string) {
  return apiFetch<Product>(`/products/${encodeURIComponent(id)}`);
}

// GET /products -> { items: Product[] }
export function listProducts(params?: { keyword?: string; limit?: number; cursor?: string }) {
  return apiFetch<{ items: Product[] }>(
    "/products",
    undefined,
    {
      keyword: params?.keyword,
      limit: params?.limit ?? 50,
      cursor: params?.cursor,
    }
  );
}

// GET /products/page -> { items, nextCursor }
export function pageProducts(params?: { keyword?: string; limit?: number; cursor?: string }) {
  return apiFetch<{ items: Product[]; nextCursor?: string | null }>(
    "/products/page",
    undefined,
    {
      keyword: params?.keyword,
      limit: params?.limit ?? 50,
      cursor: params?.cursor,
    }
  );
}

// PUT /products/{id} -> 204
export function updateProduct(id: string, payload: UpdateProductRequest) {
  return apiFetch<void>(
    `/products/${encodeURIComponent(id)}`,
    { method: "PUT", body: JSON.stringify(payload) }
  );
}

// DELETE /products/{id} -> 204
export function deleteProduct(id: string) {
  return apiFetch<void>(
    `/products/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}

