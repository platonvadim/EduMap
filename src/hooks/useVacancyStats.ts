import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { categorizeSpecialty } from '../utils/normalize';

export function useVacancyStats() {
  const { vacancies, filters, searchQuery } = useStore();

  return useMemo(() => {
    // We could apply global filters here if needed, 
    // but stats are usually global or based on a filtered subset.
    // Let's compute global stats for insights and top-level.
    let activeVacancies = vacancies;

    if (filters.city) {
      activeVacancies = activeVacancies.filter(v => v.city === filters.city);
    }

    const totalVacancies = activeVacancies.length;
    const citiesWithVacancies = new Set(activeVacancies.map(v => v.city)).size;
    const totalInstitutions = new Set(activeVacancies.map(v => v.institution)).size;
    const totalSpecialties = new Set(activeVacancies.map(v => v.specialty_name)).size;

    const cityCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const specialtyCounts: Record<string, number> = {};
    const institutionTypeCounts: Record<string, number> = {};

    activeVacancies.forEach(v => {
      cityCounts[v.city] = (cityCounts[v.city] || 0) + 1;
      
      const cat = categorizeSpecialty(v.specialty_name);
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      specialtyCounts[v.specialty_name] = (specialtyCounts[v.specialty_name] || 0) + 1;
      
      const iType = v.institution_type || "Nespecificat";
      institutionTypeCounts[iType] = (institutionTypeCounts[iType] || 0) + 1;
    });

    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, count]) => ({ name, count }));

    const topSpecialties = Object.entries(specialtyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));

    const rareSpecialties = Object.entries(specialtyCounts)
      .filter(([_, count]) => count < 3)
      .sort((a, b) => a[1] - b[1])
      .map(([name, count]) => ({ name, count }));

    const categoryData = Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const institutionData = Object.entries(institutionTypeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Most in demand
    const mostInDemand = topSpecialties[0]?.name || "N/A";
    const mostVacanciesCity = topCities[0]?.name || "N/A";

    return {
      totalVacancies,
      citiesWithVacancies,
      totalInstitutions,
      totalSpecialties,
      topCities,
      topSpecialties,
      rareSpecialties,
      categoryData,
      institutionData,
      cityCounts,
      mostInDemand,
      mostVacanciesCity,
    };
  }, [vacancies, filters]);
}
