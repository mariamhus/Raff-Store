import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OrderLine {
  id: number;
  title: string;
  thumbnail: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: number | null;
  customer: string;
  email: string;
  createdAt: string;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  address: string;
}

interface OrdersState {
  orders: Order[];
  add: (order: Order) => void;
}

export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      add: (order) => set((state) => ({ orders: [order, ...state.orders] })),
    }),
    { name: "raff:orders" },
  ),
);
