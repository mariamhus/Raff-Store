import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Review } from "../lib/types";

interface ReviewsState {
  byProduct: Record<number, Review[]>;
  add: (productId: number, review: Review) => void;
}

export const useReviews = create<ReviewsState>()(
  persist(
    (set) => ({
      byProduct: {},
      add: (productId, review) =>
        set((state) => ({ byProduct: { ...state.byProduct, [productId]: [review, ...(state.byProduct[productId] ?? [])] } })),
    }),
    { name: "raff:reviews" },
  ),
);
