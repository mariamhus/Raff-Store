import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../lib/types";

export type CatalogProduct = Pick<
  Product,
  "id" | "title" | "price" | "discountPercentage" | "rating" | "stock" | "category" | "brand" | "thumbnail"
> & { description?: string };

interface CatalogEditsState {
  edited: Record<number, Partial<CatalogProduct>>;
  added: CatalogProduct[];
  deleted: number[];
  save: (product: CatalogProduct, isNew: boolean) => void;
  remove: (id: number) => void;
}

export const useCatalogEdits = create<CatalogEditsState>()(
  persist(
    (set) => ({
      edited: {},
      added: [],
      deleted: [],
      save: (product, isNew) =>
        set((state) => {
          if (isNew) return { added: [product, ...state.added] };
          if (state.added.some((item) => item.id === product.id)) {
            return { added: state.added.map((item) => (item.id === product.id ? product : item)) };
          }
          return { edited: { ...state.edited, [product.id]: { ...state.edited[product.id], ...product } } };
        }),
      remove: (id) =>
        set((state) => ({
          added: state.added.filter((item) => item.id !== id),
          deleted: state.deleted.includes(id) ? state.deleted : [...state.deleted, id],
        })),
    }),
    { name: "raff:catalog-edits" },
  ),
);

export function applyEdits(
  products: CatalogProduct[],
  { edited, added, deleted }: Pick<CatalogEditsState, "edited" | "added" | "deleted">,
): CatalogProduct[] {
  const removed = new Set(deleted);
  return [...added, ...products]
    .filter((product) => !removed.has(product.id))
    .map((product) => (edited[product.id] ? { ...product, ...edited[product.id] } : product));
}
