import type { AuthUser, Category, Product, ProductPage, ServerCart, SortId } from "./types";

export const API_URL = "https://dummyjson.com";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  if (init.token) headers.set("Authorization", `Bearer ${init.token}`);
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch (error) {
    if (init.signal?.aborted) throw error;
    throw new ApiError(0, "network");
  }
  if (!response.ok) {
    let message = "request";
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      message = "request";
    }
    throw new ApiError(response.status, message);
  }
  return response.json() as Promise<T>;
}

export const PAGE_SIZE = 12;

const SORTS: Record<SortId, { field: keyof Product; order: "asc" | "desc" } | null> = {
  featured: null,
  "price-asc": { field: "price", order: "asc" },
  "price-desc": { field: "price", order: "desc" },
  rating: { field: "rating", order: "desc" },
  discount: { field: "discountPercentage", order: "desc" },
  title: { field: "title", order: "asc" },
};

export function isSortId(value: string | null): value is SortId {
  return value !== null && value in SORTS;
}

function sortLocally(products: Product[], sort: SortId): Product[] {
  const rule = SORTS[sort];
  if (!rule) return products;
  return [...products].sort((a, b) => {
    const left = a[rule.field];
    const right = b[rule.field];
    const result =
      typeof left === "string" && typeof right === "string" ? left.localeCompare(right) : Number(left) - Number(right);
    return rule.order === "asc" ? result : -result;
  });
}

export interface ProductQuery {
  q?: string;
  category?: string;
  sort: SortId;
  page: number;
}

export async function fetchProducts({ q, category, sort, page }: ProductQuery, signal?: AbortSignal): Promise<ProductPage> {
  const skip = (page - 1) * PAGE_SIZE;
  if (!q && !category) {
    const rule = SORTS[sort];
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), skip: String(skip) });
    if (rule) {
      params.set("sortBy", String(rule.field));
      params.set("order", rule.order);
    }
    return request<ProductPage>(`/products?${params}`, { signal });
  }
  const path = q
    ? `/products/search?q=${encodeURIComponent(q)}&limit=0`
    : `/products/category/${encodeURIComponent(category!)}?limit=0`;
  const data = await request<ProductPage>(path, { signal });
  const filtered = q && category ? data.products.filter((product) => product.category === category) : data.products;
  const sorted = sortLocally(filtered, sort);
  return { products: sorted.slice(skip, skip + PAGE_SIZE), total: sorted.length, skip, limit: PAGE_SIZE };
}

export function fetchHighlights(sortBy: "rating" | "discountPercentage", limit: number, signal?: AbortSignal) {
  return request<ProductPage>(`/products?limit=${limit}&sortBy=${sortBy}&order=desc`, { signal });
}

export function fetchAllProducts(signal?: AbortSignal) {
  return request<ProductPage>(
    "/products?limit=0&select=title,description,price,discountPercentage,rating,stock,category,brand,thumbnail",
    { signal },
  );
}

export function fetchProduct(id: number, signal?: AbortSignal) {
  return request<Product>(`/products/${id}`, { signal });
}

export function fetchCategoryProducts(slug: string, limit: number, signal?: AbortSignal) {
  return request<ProductPage>(`/products/category/${encodeURIComponent(slug)}?limit=${limit}`, { signal });
}

export function fetchCategories(signal?: AbortSignal) {
  return request<Category[]>("/products/categories", { signal });
}

export function login(username: string, password: string) {
  return request<{ accessToken: string; id: number }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password, expiresInMins: 120 }),
  });
}

export function fetchMe(token: string) {
  return request<AuthUser>("/auth/me", { token });
}

export function createServerCart(userId: number, items: { id: number; quantity: number }[]) {
  return request<ServerCart>("/carts/add", {
    method: "POST",
    body: JSON.stringify({ userId, products: items }),
  });
}

export type ProductInput = Pick<Product, "title" | "description" | "category" | "price" | "discountPercentage" | "stock"> & {
  brand?: string;
};

export function addProduct(input: ProductInput) {
  return request<Product>("/products/add", { method: "POST", body: JSON.stringify(input) });
}

export function updateProduct(id: number, input: Partial<ProductInput>) {
  return request<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function deleteProduct(id: number) {
  return request<Product & { isDeleted: boolean }>(`/products/${id}`, { method: "DELETE" });
}
