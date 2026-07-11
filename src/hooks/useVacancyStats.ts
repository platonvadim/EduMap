import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { categorizeSpecialty, normalizeDisplayLabel, normalizeSpecialty } from '../utils/normalize';

export function useVacancyStats() {
  const { vacancies, filters } = useStore();

  return useMemo(() => {
    const activeVacancies = vacancies.filter((v) => {
      if (filters.city && v.city !== filters.city) return false;
      if (filters.category && categorizeSpecialty(v.specialty_name) !== filters.category) return false;
      if (filters.institutionType && normalizeDisplayLabel(v.institution_type) !== normalizeDisplayLabel(filters.institutionType)) return false;
      return true;
    });

    const totalVacancies = activeVacancies.length;
    const citiesWithVacancies = new Set(activeVacancies.map((v) => v.city)).size;
    const totalInstitutions = new Set(activeVacancies.map((v) => `${v.city}::${v.institution}`)).size;
    const totalSpecialties = new Set(activeVacancies.map((v) => normalizeSpecialty(v.specialty_name))).size;

    const cityCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const specialtyCounts: Record<string, number> = {};
    const institutionTypeCounts: Record<string, number> = {};
    const institutionCounts: Record<string, number> = {};

    activeVacancies.forEach((v) => {
      cityCounts[v.city] = (cityCounts[v.city] || 0) + 1;

      const cat = categorizeSpecialty(v.specialty_name);
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      const specialty = normalizeSpecialty(v.specialty_name);
      specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1;

      const iType = normalizeDisplayLabel(v.institution_type || 'Nespecificat');
      institutionTypeCounts[iType] = (institutionTypeCounts[iType] || 0) + 1;

      const instKey = `${v.institution} (${v.city})`;
      institutionCounts[instKey] = (institutionCounts[instKey] || 0) + 1;
    });

    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ro'))
      .slice(0, 15)
      .map(([name, count]) => ({ name: normalizeDisplayLabel(name), count }));

    const topSpecialties = Object.entries(specialtyCounts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ro'))
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));

    const rareSpecialties = Object.entries(specialtyCounts)
      .filter(([, count]) => count < 3)
      .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0], 'ro'))
      .map(([name, count]) => ({ name, count }));

    const categoryData = Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'ro'));

    const institutionData = Object.entries(institutionTypeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ro'));

    const topSchools = Object.entries(institutionCounts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ro'))
      .slice(0, 15)
      .map(([name, count]) => ({ name, count }));

    return {
      totalVacancies,
      citiesWithVacancies,
      totalInstitutions,
      totalSpecialties,
      topCities,
      topSpecialties,
      topSchools,
      rareSpecialties,
      categoryData,
      institutionData,
      cityCounts,
      mostInDemand: topSpecialties[0]?.name || 'N/A',
      mostVacanciesCity: topCities[0]?.name || 'N/A',
    };
  }, [vacancies, filters]);
}
