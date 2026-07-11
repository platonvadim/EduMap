import { useMemo } from 'react';
import schoolData from '../../schools.json';
import type { School, Vacancy } from '../types';
import { removeDiacritics } from '../utils/normalize';

export type SchoolWithVacancies = School & { vacancies: Vacancy[] };

function key(value: string | null | undefined): string {
  return removeDiacritics(value ?? '')
    .toLowerCase()
    .replace(/\b(institutia|institutie|publica|public|ip|ii|liceul|teoretic|gimnaziul|scoala|gradinita)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(value: string): Set<string> {
  return new Set(value.split(' ').filter((part) => part.length > 2));
}

function nameScore(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b || a.includes(b) || b.includes(a)) return 1;
  const left = tokens(a);
  const right = tokens(b);
  let common = 0;
  left.forEach((token) => { if (right.has(token)) common += 1; });
  return common / Math.max(left.size, right.size, 1);
}

function schoolCityKeys(school: School): string[] {
  return [school.district, school.locality].map(key).filter(Boolean);
}

export function useSchoolData(vacancies: Vacancy[]) {
  return useMemo(() => {
    const schools = schoolData.schools as School[];
    const vacancyIndex = vacancies.map((vacancy) => ({
      vacancy,
      institution: key(vacancy.institution),
      city: key(vacancy.city),
    }));

    return schools.map<SchoolWithVacancies>((school) => {
      const institution = key(school.name);
      const places = schoolCityKeys(school);
      const matches = vacancyIndex
        .filter(({ city }) => places.some((place) => place.includes(city) || city.includes(place)))
        .filter((candidate) => nameScore(institution, candidate.institution) >= 0.55)
        .map(({ vacancy }) => vacancy);
      return { ...school, vacancies: matches };
    });
  }, [vacancies]);
}
