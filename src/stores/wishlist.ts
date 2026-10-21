import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../lib/types";

export type WishlistItem = Pick<Product, "id" | "title" | "thumbnail" | "price" | "discountPercentage" | "rating" | "stock" | "category">;

interface WishlistState {
  items: WishlistItem[];
  toggle: (product: WishlistItem) => boolean;
  remove: (id: number) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const exists = get().items.some((item) => item.id === product.id);
        if (exists) {
          set((state) => ({ items: state.items.filter((item) => item.id !== product.id) }));
          return false;
        }
        const { id, title, thumbnail, price, discountPercentage, rating, stock, category } = product;
        set((state) => ({ items: [{ id, title, thumbnail, price, discountPercentage, rating, stock, category }, ...state.items] }));
        return true;
      },
      remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
    }),
    { name: "raff:wishlist" },
  ),
);
