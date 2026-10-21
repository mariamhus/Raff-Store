import { create } from "zustand";
import { persist } from "zustand/middleware";
import { maxQuantity } from "../lib/pricing";
import type { Product } from "../lib/types";

export interface CartItem {
  id: number;
  title: string;
  thumbnail: string;
  price: number;
  discountPercentage: number;
  stock: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (product: Pick<Product, "id" | "title" | "thumbnail" | "price" | "discountPercentage" | "stock">, quantity?: number) => void;
  setQuantity: (id: number, quantity: number) => void;
  remove: (id: number) => CartItem | undefined;
  restore: (item: CartItem, index: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product, quantity = 1) =>
        set((state) => {
          const limit = maxQuantity(product.stock);
          if (limit === 0) return state;
          const existing = state.items.find((item) => item.id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id ? { ...item, quantity: Math.min(limit, item.quantity + quantity) } : item,
              ),
            };
          }
          const { id, title, thumbnail, price, discountPercentage, stock } = product;
          return {
            items: [...state.items, { id, title, thumbnail, price, discountPercentage, stock, quantity: Math.min(limit, quantity) }],
          };
        }),
      setQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, Math.min(maxQuantity(item.stock), quantity)) } : item,
          ),
        })),
      remove: (id) => {
        const item = get().items.find((entry) => entry.id === id);
        set((state) => ({ items: state.items.filter((entry) => entry.id !== id) }));
        return item;
      },
      restore: (item, index) =>
        set((state) => {
          if (state.items.some((entry) => entry.id === item.id)) return state;
          const items = [...state.items];
          items.splice(index, 0, item);
          return { items };
        }),
      clear: () => set({ items: [] }),
    }),
    { name: "raff:cart" },
  ),
);
