import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { useStore } from '../store/useStore';
import { Vacancy } from '../types';
import { removeDiacritics } from '../utils/normalize';

export function useFuseSearch() {
  const { vacancies, searchQuery, filters } = useStore();

  const filteredVacancies = useMemo(() => {
    let result = vacancies;

    if (filters.category) {
      // filtering handled by categorizeSpecialty in real usage, 
      // but let's keep it simple or implement if needed
    }
    
    if (filters.institutionType) {
      result = result.filter(v => v.institution_type === filters.institutionType);
    }
    
    if (filters.city) {
      result = result.filter(v => v.city === filters.city);
    }

    return result;
  }, [vacancies, filters]);

  const fuse = useMemo(() => {
    return new Fuse(filteredVacancies, {
      keys: [
        'city',
        'institution',
        'institution_type',
        'specialty_name',
        'specialty_code'
      ],
      threshold: 0.3,
      getFn: (obj, path) => {
        const value = Fuse.config.getFn(obj, path);
        if (typeof value === 'string') {
          return removeDiacritics(value);
        }
        return value;
      }
    });
  }, [filteredVacancies]);

  const results = useMemo(() => {
    if (!searchQuery.trim()) return filteredVacancies;
    
    const normalizedQuery = removeDiacritics(searchQuery);
    return fuse.search(normalizedQuery).map(res => res.item);
  }, [searchQuery, fuse, filteredVacancies]);

  return results;
}
