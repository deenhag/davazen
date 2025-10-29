import { create } from "zustand";
import { Case } from "@shared/types";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
type ScrapedCase = Omit<Case, "id" | "userId" | "notes">;
type CaseState = {
  cases: Case[];
  isLoading: boolean;
  error: string | null;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isBatchAdding: boolean;
  fetchCases: () => Promise<void>;
  addCase: (newCase: Omit<Case, "id" | "notes" | "userId">) => Promise<void>;
  addMultipleCases: (newCases: ScrapedCase[]) => Promise<void>;
  updateCase: (id: string, updatedData: Partial<Omit<Case, "id" | "userId">>) => Promise<void>;
  deleteCase: (id: string) => Promise<void>;
  clearCases: () => void;
};
export const useCases = create<CaseState>((set, get) => ({
  cases: [],
  isLoading: false,
  error: null,
  isAdding: false,
  isUpdating: false,
  isDeleting: false,
  isBatchAdding: false,
  fetchCases: async () => {
    const token = useAuth.getState().token;
    if (!token) return;
    set({ isLoading: true, error: null });
    try {
      const result = await api<{items: Case[];}>("/api/cases", { token });
      set({ cases: result.items, isLoading: false });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Davalar yüklenemedi.";
      set({ error, isLoading: false });
      toast.error(error);
    }
  },
  addCase: async (newCase) => {
    const token = useAuth.getState().token;
    if (!token) return;
    set({ isAdding: true });
    try {
      const createdCase = await api<Case>("/api/cases", {
        method: "POST",
        body: JSON.stringify(newCase),
        token
      });
      set((state) => ({ cases: [...state.cases, createdCase], isAdding: false }));
      toast.success("Dava başarıyla eklendi.");
    } catch (err) {
      const error = err instanceof Error ? err.message : "Dava eklenemedi.";
      set({ error, isAdding: false });
      toast.error(error);
    }
  },
  addMultipleCases: async (newCases) => {
    const token = useAuth.getState().token;
    if (!token) return;
    const existingFileNumbers = new Set(get().cases.map((c) => c.fileNumber));
    const casesToAdd = newCases.filter((c) => !existingFileNumbers.has(c.fileNumber));
    if (casesToAdd.length === 0) {
      toast.info("Tüm davalar zaten mevcut.", { description: "İ��e aktarılacak yeni dava bulunamadı." });
      return;
    }
    set({ isBatchAdding: true });
    try {
      const createdCases = await api<Case[]>("/api/cases/batch", {
        method: "POST",
        body: JSON.stringify(casesToAdd),
        token
      });
      set((state) => ({
        cases: [...state.cases, ...createdCases],
        isBatchAdding: false
      }));
      toast.success(`${createdCases.length} yeni dava başarıyla içe aktarıldı.`);
    } catch (err) {
      const error = err instanceof Error ? err.message : "Davalar içe aktarılamadı.";
      set({ error, isBatchAdding: false });
      toast.error(error);
    }
  },
  updateCase: async (id, updatedData) => {
    const token = useAuth.getState().token;
    if (!token) return;
    set({ isUpdating: true });
    try {
      const updatedCase = await api<Case>(`/api/cases/${id}`, {
        method: "PUT",
        body: JSON.stringify(updatedData),
        token
      });
      set((state) => ({
        cases: state.cases.map((c) => c.id === id ? updatedCase : c),
        isUpdating: false
      }));
      toast.success("Not başarıyla eklendi.");
    } catch (err) {
      const error = err instanceof Error ? err.message : "Dava güncellenemedi.";
      set({ error, isUpdating: false });
      toast.error(error);
    }
  },
  deleteCase: async (id) => {
    const token = useAuth.getState().token;
    if (!token) return;
    set({ isDeleting: true });
    try {
      await api<{id: string;deleted: boolean;}>(`/api/cases/${id}`, {
        method: "DELETE",
        token
      });
      set((state) => ({
        cases: state.cases.filter((c) => c.id !== id),
        isDeleting: false
      }));
      toast.success("Dava başarıyla silindi.");
    } catch (err) {
      const error = err instanceof Error ? err.message : "Dava silinemedi.";
      set({ error, isDeleting: false });
      toast.error(error);
    }
  },
  clearCases: () => {
    set({ cases: [] });
  }
}));