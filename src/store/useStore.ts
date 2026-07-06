import { create } from 'zustand';
import { Vacancy } from '../types';

interface AppState {
  vacancies: Vacancy[];
  isLoading: boolean;
  dataError: string | null;
  hasLoadedVacancies: boolean;
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
  setDataError: (message: string | null) => void;
  setHasLoadedVacancies: (loaded: boolean) => void;
  setSelectedCity: (city: string | null) => void;
  setFlyToCity: (city: string | null) => void;
  setSearchQuery: (q: string) => void;
  setFilter: (key: keyof AppState['filters'], value: string | null) => void;
  resetFilters: () => void;
}

const initialFilters: AppState['filters'] = {
  category: null,
  institutionType: null,
  city: null,
};

export const useStore = create<AppState>((set) => ({
  vacancies: [],
  isLoading: true,
  dataError: null,
  hasLoadedVacancies: false,
  selectedCity: null,
  flyToCity: null,
  searchQuery: '',
  filters: initialFilters,
  setVacancies: (v) => set({ vacancies: v }),
  setLoading: (b) => set({ isLoading: b }),
  setDataError: (message) => set({ dataError: message }),
  setHasLoadedVacancies: (loaded) => set({ hasLoadedVacancies: loaded }),
  setSelectedCity: (city) => set({ selectedCity: city }),
  setFlyToCity: (city) => set({ flyToCity: city }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value },
  })),
  resetFilters: () => set({ filters: initialFilters, searchQuery: '' }),
}));
