import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  fetchAllProducts,
  fetchCategories,
  fetchCategoryProducts,
  fetchHighlights,
  fetchProduct,
  fetchProducts,
  type ProductQuery,
} from "../lib/api";

export function useProducts(query: ProductQuery) {
  return useQuery({
    queryKey: ["products", query],
    queryFn: ({ signal }) => fetchProducts(query, signal),
    placeholderData: keepPreviousData,
  });
}

export function useHighlights(sortBy: "rating" | "discountPercentage", limit = 8) {
  return useQuery({
    queryKey: ["highlights", sortBy, limit],
    queryFn: ({ signal }) => fetchHighlights(sortBy, limit, signal),
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: ({ signal }) => fetchProduct(id, signal),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useRelated(category: string | undefined) {
  return useQuery({
    queryKey: ["related", category],
    queryFn: ({ signal }) => fetchCategoryProducts(category!, 9, signal),
    enabled: Boolean(category),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: ({ signal }) => fetchCategories(signal),
    staleTime: Infinity,
  });
}

export function useCatalog() {
  return useQuery({
    queryKey: ["catalog"],
    queryFn: ({ signal }) => fetchAllProducts(signal),
    staleTime: 10 * 60 * 1000,
  });
}
