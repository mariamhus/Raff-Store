import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchMe, login as loginRequest } from "../lib/api";
import type { AuthUser } from "../lib/types";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: async (username, password) => {
        const { accessToken } = await loginRequest(username.trim(), password);
        const user = await fetchMe(accessToken);
        set({ token: accessToken, user });
        return user;
      },
      logout: () => set({ token: null, user: null }),
    }),
    { name: "raff:auth" },
  ),
);
