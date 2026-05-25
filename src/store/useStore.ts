import { create } from 'zustand';
import { Vacancy } from '../types';

interface AppState {
  vacancies: Vacancy[];
  isLoading: boolean;
  selectedCity: string | null;
  flyToCity: string | null;
  searchQuery: string;
  filters: {
    category: string | null;
    institutionType: string | null;
    city: string | null;
  };
  setVacancies: (v: Vacancy[]) => void;
  setLoading: (b: boolean) => void;
  setSelectedCity: (city: string | null) => void;
  setFlyToCity: (city: string | null) => void;
  setSearchQuery: (q: string) => void;
  setFilter: (key: keyof AppState['filters'], value: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  vacancies: [],
  isLoading: true,
  selectedCity: null,
  flyToCity: null,
  searchQuery: "",
  filters: {
    category: null,
    institutionType: null,
    city: null,
  },
  setVacancies: (v) => set({ vacancies: v }),
  setLoading: (b) => set({ isLoading: b }),
  setSelectedCity: (city) => set({ selectedCity: city }),
  setFlyToCity: (city) => set({ flyToCity: city }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value },
  })),
}));
