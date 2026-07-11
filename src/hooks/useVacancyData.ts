import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { DataFile, Vacancy } from '../types';
import { normalizeDisplayLabel, normalizeInstitution, normalizeSpecialty } from '../utils/normalize';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function normalizeVacancy(raw: unknown, cityKey: string, fallbackIndex: number): Vacancy | null {
  if (!isRecord(raw)) return null;

  const city = normalizeDisplayLabel(asString(raw.city) || cityKey);
  const id = asString(raw.id) || `${city}-${fallbackIndex}`;
  const institution = normalizeInstitution(asString(raw.institution));
  const specialtyName = normalizeSpecialty(asString(raw.specialty_name));

  if (!city || !institution || !specialtyName) return null;

  return {
    id,
    city,
    olsdi: normalizeDisplayLabel(asString(raw.olsdi)),
    institution_type: normalizeDisplayLabel(asString(raw.institution_type)),
    institution,
    specialty_code: normalizeSpecialty(asString(raw.specialty_code)),
    specialty_name: specialtyName,
  };
}


function publicAssetUrl(path: string): string {
  const cleanPath = path.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL || '/';

  // Relative build for local file/static previews.
  if (base === './' || base === '') {
    return `${base}${cleanPath}`;
  }

  return `${base.replace(/\/$/, '')}/${cleanPath}`;
}

function flattenData(data: unknown): Vacancy[] {
  if (!isRecord(data)) {
    throw new Error('Fișierul de date nu are formatul așteptat.');
  }

  const flattened: Vacancy[] = [];

  Object.entries(data as DataFile).forEach(([cityKey, cityVacancies]) => {
    if (!Array.isArray(cityVacancies)) return;

    cityVacancies.forEach((rawVacancy, index) => {
      const vacancy = normalizeVacancy(rawVacancy, cityKey, flattened.length + index + 1);
      if (vacancy) flattened.push(vacancy);
    });
  });

  return flattened;
}

export function useVacancyData() {
  const {
    hasLoadedVacancies,
    isLoading,
    setDataError,
    setHasLoadedVacancies,
    setLoading,
    setVacancies,
  } = useStore();

  useEffect(() => {
    if (hasLoadedVacancies || (!isLoading && hasLoadedVacancies)) return;

    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setDataError(null);

      try {
        const res = await fetch(publicAssetUrl('data/vacante_by_city.json'), {
          signal: controller.signal,
          cache: 'no-cache',
        });

        if (!res.ok) {
          throw new Error(`Nu pot încărca datele (${res.status}).`);
        }

        const data = await res.json();
        const flattened = flattenData(data);

        if (flattened.length === 0) {
          throw new Error('Fișierul de date nu conține vacante valide.');
        }

        setVacancies(flattened);
        setHasLoadedVacancies(true);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('Failed to fetch vacancies', err);
        setDataError(err instanceof Error ? err.message : 'Eroare necunoscută la încărcarea datelor.');
        setVacancies([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadData();

    return () => controller.abort();
  }, [hasLoadedVacancies, isLoading, setDataError, setHasLoadedVacancies, setLoading, setVacancies]);
}
