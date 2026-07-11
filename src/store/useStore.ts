import { create } from 'zustand';
import { Vacancy } from '../types';

interface AppState {
  vacancies: Vacancy[];
  isLoading: boolean;
  dataError: string | null;
  hasLoadedVacancies: boolean;
  selectedCity: string | null;
  selectedInstitution: string | null;
  mapTargetInstitution: string | null;
  userLocation: [number, number] | null;
  distanceKm: number | null;
  mapInstitutionTypes: string[];
  flyToCity: string | null;
  showAllSchools: boolean;
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
  setSelectedInstitution: (institution: string | null) => void;
  setMapTargetInstitution: (institution: string | null) => void;
  setUserLocation: (location: [number, number] | null) => void;
  setDistanceKm: (distance: number | null) => void;
  setMapInstitutionTypes: (types: string[]) => void;
  setFlyToCity: (city: string | null) => void;
  setShowAllSchools: (show: boolean) => void;
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
  selectedInstitution: null,
  mapTargetInstitution: null,
  userLocation: null,
  distanceKm: null,
  mapInstitutionTypes: ['lyceum', 'gymnasium', 'primary_school'],
  flyToCity: null,
  showAllSchools: false,
  searchQuery: '',
  filters: initialFilters,
  setVacancies: (v) => set({ vacancies: v }),
  setLoading: (b) => set({ isLoading: b }),
  setDataError: (message) => set({ dataError: message }),
  setHasLoadedVacancies: (loaded) => set({ hasLoadedVacancies: loaded }),
  setSelectedCity: (city) => set({ selectedCity: city }),
  setSelectedInstitution: (institution) => set({ selectedInstitution: institution }),
  setMapTargetInstitution: (institution) => set({ mapTargetInstitution: institution }),
  setUserLocation: (location) => set({ userLocation: location }),
  setDistanceKm: (distance) => set({ distanceKm: distance }),
  setMapInstitutionTypes: (types) => set({ mapInstitutionTypes: types }),
  setFlyToCity: (city) => set({ flyToCity: city }),
  setShowAllSchools: (show) => set({ showAllSchools: show }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value },
  })),
  resetFilters: () => set({
    filters: initialFilters,
    searchQuery: '',
    mapInstitutionTypes: ['lyceum', 'gymnasium', 'primary_school'],
  }),
}));
