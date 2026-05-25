import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { DataFile, Vacancy } from '../types';
import { normalizeSpecialty, normalizeInstitution } from '../utils/normalize';

export function useVacancyData() {
  const { setVacancies, setLoading } = useStore();

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}data/vacante_by_city.json`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data: DataFile = await res.json();
        
        const flattened: Vacancy[] = [];
        for (const [city, cityVacancies] of Object.entries(data)) {
          for (const v of cityVacancies) {
            flattened.push({
              ...v,
              city, // Ensure city is set correctly from key if needed
              institution: normalizeInstitution(v.institution),
              specialty_name: normalizeSpecialty(v.specialty_name),
              institution_type: v.institution_type ? v.institution_type.replace(/[\n\r]+/g, " ").trim() : "",
            });
          }
        }
        setVacancies(flattened);
      } catch (err) {
        console.error("Failed to fetch vacancies", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [setVacancies, setLoading]);
}
