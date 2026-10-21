import { create } from "zustand";

export interface Toast {
  id: number;
  message: string;
  actionLabel?: string;
  action?: () => void;
  link?: { label: string; to: string };
}

interface ToastState {
  toast: Toast | null;
  show: (toast: Omit<Toast, "id">) => void;
  dismiss: () => void;
}

let nextId = 1;
let timer: ReturnType<typeof setTimeout> | undefined;

export const useToasts = create<ToastState>()((set) => ({
  toast: null,
  show: (toast) => {
    if (timer) clearTimeout(timer);
    set({ toast: { ...toast, id: nextId++ } });
    timer = setTimeout(() => set({ toast: null }), 5000);
  },
  dismiss: () => {
    if (timer) clearTimeout(timer);
    set({ toast: null });
  },
}));
