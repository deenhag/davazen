import { create } from "zustand";
import { User } from "@shared/types";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};
export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  checkAuth: () => {
    try {
      const token = localStorage.getItem("dava_token");
      const userString = localStorage.getItem("dava_user");
      if (token && userString) {
        const user = JSON.parse(userString);
        set({ token, user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Failed to check auth status:", error);
      set({ isLoading: false, isAuthenticated: false, token: null, user: null });
      localStorage.removeItem("dava_token");
      localStorage.removeItem("dava_user");
    }
  },
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { token, user } = await api<{token: string;user: User;}>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem("dava_token", token);
      localStorage.setItem("dava_user", JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
      toast.success("Giriş başarılı!");
    } catch (err) {
      const error = err instanceof Error ? err.message : "Giriş yapılamadı.";
      set({ isLoading: false });
      toast.error(error);
    }
  },
  register: async (email, password) => {
    set({ isLoading: true });
    try {
      const { token, user } = await api<{token: string;user: User;}>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem("dava_token", token);
      localStorage.setItem("dava_user", JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
      toast.success("Kayıt başarılı! Giriş yapılıyor...");
    } catch (err) {
      const error = err instanceof Error ? err.message : "Kayıt işlemi başarısız.";
      set({ isLoading: false });
      toast.error(error);
    }
  },
  logout: () => {
    localStorage.removeItem("dava_token");
    localStorage.removeItem("dava_user");
    set({ user: null, token: null, isAuthenticated: false });
    toast.info("Başarıyla çıkış yapıldı.");
  }
}));