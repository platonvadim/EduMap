import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { useStore } from '../store/useStore';
import { categorizeSpecialty, normalizeDisplayLabel, removeDiacritics } from '../utils/normalize';

export function useFuseSearch() {
  const { vacancies, searchQuery, filters } = useStore();

  const filteredVacancies = useMemo(() => {
    return vacancies.filter((v) => {
      if (filters.category && categorizeSpecialty(v.specialty_name) !== filters.category) return false;
      if (filters.institutionType && normalizeDisplayLabel(v.institution_type) !== normalizeDisplayLabel(filters.institutionType)) return false;
      if (filters.city && v.city !== filters.city) return false;
      return true;
    });
  }, [vacancies, filters]);

  const fuse = useMemo(() => {
    return new Fuse(filteredVacancies, {
      keys: ['city', 'institution', 'institution_type', 'specialty_name', 'specialty_code', 'olsdi'],
      threshold: 0.32,
      ignoreLocation: true,
      includeScore: true,
      getFn: (obj, path) => {
        const value = Fuse.config.getFn(obj, path);
        if (typeof value === 'string') return removeDiacritics(value).toLowerCase();
        return value;
      },
    });
  }, [filteredVacancies]);

  return useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return filteredVacancies;

    return fuse.search(removeDiacritics(query).toLowerCase()).map((res) => res.item);
  }, [searchQuery, fuse, filteredVacancies]);
}
