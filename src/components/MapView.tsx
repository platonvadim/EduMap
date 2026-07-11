import { useCallback, useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '../store/useStore';
import { cityCoordinates } from '../data/cityCoordinates';
import { useVacancyStats } from '../hooks/useVacancyStats';
import { useSchoolData } from '../hooks/useSchoolData';
import { categorizeSpecialty, removeDiacritics } from '../utils/normalize';
import type { SchoolWithVacancies } from '../hooks/useSchoolData';
import { ChevronUp, LocateFixed, RotateCcw, SlidersHorizontal, X, Navigation } from 'lucide-react';
import { FilterChips } from './FilterChips';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createLabelIcon(city: string, count: number, isSelected: boolean) {
  const bg = isSelected ? '#1d4ed8' : 'rgba(255,255,255,0.94)';
  const textColor = isSelected ? '#ffffff' : '#1e1b4b';
  const border = isSelected ? 'transparent' : 'rgba(37,99,235,0.25)';
  const badgeBg = isSelected ? 'rgba(255,255,255,0.25)' : '#2563eb';
  const shadow = isSelected
    ? '0 4px 18px rgba(37,99,235,0.45), 0 1px 4px rgba(0,0,0,0.15)'
    : '0 2px 10px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)';
  const short = escapeHtml(city.length > 12 ? `${city.slice(0, 12)}…` : city);

  const html = `<div role="button" aria-label="${escapeHtml(city)}: ${count} vacante" style="
    display:inline-flex;align-items:center;gap:5px;
    background:${bg};border:1.5px solid ${border};border-radius:999px;
    padding:3px 6px 3px 9px;box-shadow:${shadow};cursor:pointer;
    white-space:nowrap;font-family:system-ui,-apple-system,sans-serif;
    pointer-events:auto;backdrop-filter:blur(8px);
  ">
    <span style="font-size:11px;font-weight:${isSelected ? 700 : 600};color:${textColor};letter-spacing:-0.01em;line-height:1">${short}</span>
    <span style="display:inline-flex;align-items:center;justify-content:center;
      background:${badgeBg};color:#fff;border-radius:999px;
      font-size:10px;font-weight:700;min-width:19px;height:18px;padding:0 4px;line-height:1">
      ${count}
    </span>
  </div>`;

  return L.divIcon({ html, className: '', iconAnchor: [0, 0] });
}

function FlyToCity() {
  const { selectedCity, flyToCity, setFlyToCity } = useStore();
  const map = useMap();

  useEffect(() => {
    if (selectedCity && cityCoordinates[selectedCity]) {
      map.flyTo(cityCoordinates[selectedCity], 11, { duration: 1.0 });
    }
  }, [selectedCity, map]);

  useEffect(() => {
    if (flyToCity && cityCoordinates[flyToCity]) {
      map.flyTo(cityCoordinates[flyToCity], 11, { duration: 1.0 });
      setFlyToCity(null);
    }
  }, [flyToCity, map, setFlyToCity]);

  return null;
}

function FlyToSchool({ schools, approximateInstitutions }: {
  schools: SchoolWithVacancies[];
  approximateInstitutions: Array<{ institution: string; position: [number, number] }>;
}) {
  const { mapTargetInstitution, setMapTargetInstitution } = useStore();
  const map = useMap();

  useEffect(() => {
    if (!mapTargetInstitution) return;
    const school = schools.find((item) =>
      item.vacancies.some((vacancy) => vacancy.institution === mapTargetInstitution)
    );
    if (school) {
      map.flyTo([school.latitude, school.longitude], 14, { duration: 1.1 });
    } else {
      const approximate = approximateInstitutions.find((item) => item.institution === mapTargetInstitution);
      if (approximate) map.flyTo(approximate.position, 12, { duration: 1.1 });
    }
    setMapTargetInstitution(null);
  }, [map, mapTargetInstitution, schools, approximateInstitutions, setMapTargetInstitution]);

  return null;
}

function distanceBetween(a: [number, number], b: [number, number]): number {
  const toRad = (value: number) => value * Math.PI / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function approximateOffset(seed: string): [number, number] {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0;
  const angle = (Math.abs(hash) % 360) * Math.PI / 180;
  const radius = 0.018 + (Math.abs(hash >> 8) % 18) / 1000;
  return [Math.sin(angle) * radius, Math.cos(angle) * radius];
}

const MAP_INSTITUTION_TYPES = [
  { id: 'lyceum', label: 'Liceu' },
  { id: 'gymnasium', label: 'Gimnaziu' },
  { id: 'primary_school', label: 'Școală primară' },
  { id: 'kindergarten', label: 'Grădiniță' },
  { id: 'other_school', label: 'Altele' },
] as const;

function vacancyInstitutionType(value: string): string {
  const normalized = removeDiacritics(value).toLowerCase();
  if (/liceu/.test(normalized)) return 'lyceum';
  if (/gimnaz/.test(normalized)) return 'gymnasium';
  if (/gradin|cresa|educatie timpurie|prescolar/.test(normalized)) return 'kindergarten';
  if (/scoala primara|invatamant primar/.test(normalized)) return 'primary_school';
  return 'other_school';
}

export function MapView() {
  const { vacancies, filters, resetFilters, setFilter, setSelectedCity, setSelectedInstitution, selectedCity, showAllSchools, setShowAllSchools, userLocation, setUserLocation, distanceKm, setDistanceKm, mapInstitutionTypes, setMapInstitutionTypes } = useStore();
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  const [unmappedOpen, setUnmappedOpen] = useState(false);
  const [disciplineOpen, setDisciplineOpen] = useState(false);

  useEffect(() => {
    if (!unmappedOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setUnmappedOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [unmappedOpen]);
  const { cityCounts } = useVacancyStats();
  const vacanciesForMap = useMemo(
    () => vacancies.filter((vacancy) => {
      if (filters.category && categorizeSpecialty(vacancy.specialty_name) !== filters.category) return false;
      if (filters.city && vacancy.city !== filters.city) return false;
      if (!mapInstitutionTypes.includes(vacancyInstitutionType(vacancy.institution_type))) return false;
      return true;
    }),
    [vacancies, filters.category, filters.city, mapInstitutionTypes]
  );
  const schools = useSchoolData(vacanciesForMap);
  const cities = useMemo(
    () => [...new Set(vacancies.map((vacancy) => vacancy.city))].sort((a, b) => a.localeCompare(b, 'ro')),
    [vacancies]
  );

  const areaSchools = useMemo(() => {
    const cityKey = removeDiacritics(filters.city ?? '').toLowerCase().replace(/[^a-z]/g, '');
    const byType = schools.filter((school) => mapInstitutionTypes.includes(school.type));
    const byCity = !filters.city ? byType : byType.filter((school) => {
      if (school.vacancies.some((vacancy) => vacancy.city === filters.city)) return true;
      const districtKey = removeDiacritics(school.district ?? '').toLowerCase().replace(/[^a-z]/g, '');
      const localityKey = removeDiacritics(school.locality ?? '').toLowerCase().replace(/[^a-z]/g, '');
      return districtKey.includes(cityKey) || localityKey.includes(cityKey);
    });
    if (!userLocation || distanceKm === null) return byCity;
    return byCity.filter((school) =>
      distanceBetween(userLocation, [school.latitude, school.longitude]) <= distanceKm
    );
  }, [schools, userLocation, distanceKm, filters.city, mapInstitutionTypes]);

  const visibleSchools = useMemo(
    () => showAllSchools ? areaSchools : areaSchools.filter((school) => school.vacancies.length > 0),
    [areaSchools, showAllSchools]
  );

  const areaStats = useMemo(() => {
    const matchedVacancyIds = new Set(
      schools.flatMap((school) => school.vacancies.map((vacancy) => vacancy.id))
    );
    const relevantVacancies = filters.city
      ? vacanciesForMap.filter((vacancy) => vacancy.city === filters.city)
      : vacanciesForMap;

    const unmappedVacancies = relevantVacancies.filter((vacancy) => !matchedVacancyIds.has(vacancy.id));

    return {
      totalSchools: areaSchools.length,
      totalVacancies: relevantVacancies.length,
      schoolsWithVacancies: areaSchools.filter((school) => school.vacancies.length > 0).length,
      unmappedVacancies,
    };
  }, [areaSchools, schools, vacanciesForMap, filters.city]);

  const approximateInstitutions = useMemo(() => {
    const groups = new Map<string, typeof areaStats.unmappedVacancies>();
    areaStats.unmappedVacancies.forEach((vacancy) => {
      const groupKey = `${vacancy.city}::${vacancy.institution}`;
      groups.set(groupKey, [...(groups.get(groupKey) ?? []), vacancy]);
    });

    return [...groups.entries()].flatMap(([groupKey, groupVacancies]) => {
      const first = groupVacancies[0];
      const center = cityCoordinates[first.city];
      if (!center) return [];
      const offset = approximateOffset(groupKey);
      return [{
        key: groupKey,
        institution: first.institution,
        city: first.city,
        vacancies: groupVacancies,
        position: [center[0] + offset[0], center[1] + offset[1]] as [number, number],
      }];
    });
  }, [areaStats.unmappedVacancies]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocația nu este disponibilă în acest browser.');
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation([coords.latitude, coords.longitude]);
        setDistanceKm(distanceKm ?? 25);
        setLocating(false);
      },
      () => {
        setLocationError('Nu am putut determina poziția. Verifică permisiunea de localizare.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [distanceKm, setDistanceKm, setUserLocation]);

  const resolveSchoolCity = useCallback((district: string | null) => {
    if (!district) return null;
    const districtKey = removeDiacritics(district).toLowerCase().replace(/[^a-z]/g, '');
    return Object.keys(cityCounts).find((city) =>
      removeDiacritics(city).toLowerCase().replace(/[^a-z]/g, '') === districtKey
    ) ?? null;
  }, [cityCounts]);

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={[47.1, 28.5]}
        zoom={8.25}
        minZoom={8}
        maxZoom={13}
        maxBounds={[[45.35, 26.55], [48.55, 30.35]]}
        maxBoundsViscosity={1}
        className="w-full h-full bg-slate-50 dark:bg-slate-900"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />
        <ZoomControl position="bottomright" />

        {visibleSchools.map((school) => {
          const hasVacancies = school.vacancies.length > 0;
          return (
            <CircleMarker
              key={school.id}
              center={[school.latitude, school.longitude]}
              radius={hasVacancies ? 7 : 4}
              pathOptions={{
                color: hasVacancies ? '#ffffff' : '#64748b',
                weight: hasVacancies ? 2 : 1,
                fillColor: hasVacancies ? '#16a34a' : '#94a3b8',
                fillOpacity: hasVacancies ? 0.95 : 0.68,
              }}
            >
              <Popup minWidth={260} maxWidth={340}>
                <article className="school-popup">
                  <p className="school-popup__eyebrow">{hasVacancies ? `${school.vacancies.length} locuri vacante` : 'Fără locuri publicate'}</p>
                  <h3>{school.name}</h3>
                  <p>{[school.locality, school.district].filter(Boolean).join(' · ')}</p>
                  {school.address && <p><strong>Adresă:</strong> {school.address}</p>}
                  {school.phone && <p><strong>Telefon:</strong> {school.phone}</p>}
                  {school.instruction_language && <p><strong>Limba:</strong> {school.instruction_language}</p>}
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {hasVacancies && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedInstitution(school.vacancies[0].institution);
                          setSelectedCity(school.vacancies[0].city);
                        }}
                      >
                        Vezi locurile vacante
                      </button>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${school.latitude},${school.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '6px 12px', background: 'rgba(241, 245, 249, 0.8)', color: '#0f172a',
                        textDecoration: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                        border: '1px solid rgba(203, 213, 225, 0.6)'
                      }}
                    >
                      <Navigation size={12} />
                      Cum ajung (Traseu)
                    </a>
                  </div>
                </article>
              </Popup>
            </CircleMarker>
          );
        })}

        {approximateInstitutions.map((institution) => (
          <CircleMarker
            key={`approx-${institution.key}`}
            center={institution.position}
            radius={6}
            pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#d97706', fillOpacity: 0.9, dashArray: '3 2' }}
          >
            <Popup minWidth={250} maxWidth={330}>
              <article className="school-popup">
                <p className="school-popup__eyebrow">Poziție aproximativă</p>
                <h3>{institution.institution}</h3>
                <p><strong>Localitate:</strong> {institution.city}</p>
                <p><strong>Locuri vacante:</strong> {institution.vacancies.length}</p>
                <div className="mt-2 space-y-1">
                  {institution.vacancies.slice(0, 5).map((vacancy) => <p key={vacancy.id}>• {vacancy.specialty_name}</p>)}
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">Instituția nu are coordonate exacte în sursa disponibilă. Marcajul indică doar zona.</p>
              </article>
            </Popup>
          </CircleMarker>
        ))}

        <FlyToCity />
        <FlyToSchool schools={schools} approximateInstitutions={approximateInstitutions} />
        {userLocation && (
          <CircleMarker center={userLocation} radius={8} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }}>
            <Popup>Poziția ta</Popup>
          </CircleMarker>
        )}
      </MapContainer>

      <section className="map-control-panel absolute left-3 right-3 z-[1000] max-h-[70dvh] overflow-y-auto overscroll-contain rounded-2xl border border-border/70 bg-card/95 p-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-xl md:bottom-auto md:left-3 md:right-auto md:top-6 md:h-fit md:w-64 md:max-h-[calc(100%-3rem)] md:p-2" aria-label="Filtrele hărții">
        <button
          data-tour="map-filter-button"
          type="button"
          className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-left md:hidden"
          onClick={() => setMobileControlsOpen((open) => !open)}
          aria-expanded={mobileControlsOpen}
          aria-controls="map-filter-controls"
        >
          <span className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <SlidersHorizontal size={17} />
            </span>
            <span>
              <span className="block text-sm font-bold text-foreground">Filtrele hărții</span>
              <span className="block text-[11px] text-muted-foreground">{visibleSchools.length} școli afișate</span>
            </span>
          </span>
          {mobileControlsOpen ? <X size={18} className="text-muted-foreground" /> : <ChevronUp size={18} className="text-muted-foreground" />}
        </button>

        <div id="map-filter-controls" className={`${mobileControlsOpen ? 'block' : 'hidden'} border-t border-border/60 px-1 pb-1 pt-3 md:block md:border-0 md:p-0`}>
          <div className="mb-2 hidden items-center justify-between px-1 md:flex">
            <div>
              <p className="text-sm font-bold text-foreground">Școli pe hartă</p>
              <p className="text-[11px] text-muted-foreground">{visibleSchools.length} rezultate</p>
            </div>
            {(filters.category || filters.city || distanceKm !== null || mapInstitutionTypes.join(',') !== 'lyceum,gymnasium,primary_school') && (
              <button type="button" onClick={() => { resetFilters(); setDistanceKm(null); setSelectedInstitution(null); setSelectedCity(null); }} className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                <RotateCcw size={12} /> Resetează
              </button>
            )}
          </div>

        <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary/70 p-1">
          <button
            type="button"
            className={`rounded-lg px-3 py-2.5 md:py-2 text-xs font-semibold transition-all ${!showAllSchools ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setShowAllSchools(false)}
            aria-pressed={!showAllSchools}
          >
            Cu locuri vacante
          </button>
          <button
            data-tour="all-schools"
            type="button"
            className={`rounded-lg px-3 py-2.5 md:py-2 text-xs font-semibold transition-all ${showAllSchools ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setShowAllSchools(true)}
            aria-pressed={showAllSchools}
          >
            Toate școlile
          </button>
        </div>
        <label className="mt-2 block px-1 text-[11px] font-semibold text-muted-foreground">
          Oraș sau raion
          <select
            data-tour="city-filter"
            value={filters.city ?? ''}
            onChange={(event) => {
              const city = event.target.value || null;
              setFilter('city', city);
              setSelectedInstitution(null);
              setSelectedCity(city);
            }}
            className="mt-1 h-11 md:h-9 w-full rounded-lg border border-border bg-background px-3 md:px-2 text-sm md:text-xs text-foreground"
          >
            <option value="">Toată Moldova</option>
            {cities.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </label>
        <div className="mt-3 border-t border-border/60 px-1 pt-3">
          <button
            data-tour="discipline-button"
            type="button"
            onClick={() => setDisciplineOpen((open) => !open)}
            aria-expanded={disciplineOpen}
            aria-controls="map-discipline-filters"
            className="flex h-11 md:h-9 w-full items-center justify-between rounded-lg border border-border/70 bg-background px-3 md:px-2.5 text-sm md:text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <span className="inline-flex items-center gap-2"><SlidersHorizontal size={14} /> Discipline</span>
            <ChevronUp size={14} className={`transition-transform ${disciplineOpen ? 'rotate-180' : ''}`} />
          </button>
          {disciplineOpen && (
            <div id="map-discipline-filters" className="mt-2 rounded-xl bg-secondary/55 p-2">
              <FilterChips />
            </div>
          )}
        </div>
        <fieldset className="mt-3 border-t border-border/60 px-1 pt-3">
          <legend className="text-[11px] font-semibold text-muted-foreground">Tipul instituției</legend>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {MAP_INSTITUTION_TYPES.map((type) => {
              const checked = mapInstitutionTypes.includes(type.id);
              return (
                <label
                  key={type.id}
                  className={`flex h-11 md:h-9 cursor-pointer items-center justify-center rounded-lg border text-sm md:text-xs font-semibold transition-colors ${
                    checked
                      ? 'border-primary/50 bg-primary/10 text-primary dark:bg-primary/20'
                      : 'border-border/60 bg-background text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setMapInstitutionTypes(
                      checked
                        ? mapInstitutionTypes.filter((value) => value !== type.id)
                        : [...mapInstitutionTypes, type.id]
                    )}
                    className="h-3.5 w-3.5 accent-primary"
                  />
                  <span>{type.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-border/60 px-1 pt-3" aria-label="Statistica zonei selectate">
          <div className="min-w-0 rounded-lg bg-secondary/65 px-2 py-2">
            <strong className="block text-base font-extrabold tabular-nums text-foreground">{areaStats.totalSchools}</strong>
            <span className="mt-0.5 block text-[9px] leading-tight text-muted-foreground">Școli în total</span>
          </div>
          <div className="min-w-0 rounded-lg bg-secondary/65 px-2 py-2">
            <strong className="block text-base font-extrabold tabular-nums text-primary">{areaStats.totalVacancies}</strong>
            <span className="mt-0.5 block text-[9px] leading-tight text-muted-foreground">Locuri vacante</span>
          </div>
          <div className="min-w-0 rounded-lg bg-secondary/65 px-2 py-2">
            <strong className="block text-base font-extrabold tabular-nums text-foreground">{areaStats.schoolsWithVacancies}</strong>
            <span className="mt-0.5 block text-[9px] leading-tight text-muted-foreground">Școli cu locuri</span>
          </div>
          <button
            type="button"
            onClick={() => setUnmappedOpen(true)}
            disabled={areaStats.unmappedVacancies.length === 0}
            className="min-w-0 rounded-lg bg-amber-50 px-2 py-2 text-left transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:cursor-default disabled:opacity-60 dark:bg-amber-950/35 dark:hover:bg-amber-950/55"
            aria-label={`Arată cele ${areaStats.unmappedVacancies.length} locuri cu poziție aproximativă`}
          >
            <strong className="block text-base font-extrabold tabular-nums text-amber-800 dark:text-amber-300">{areaStats.unmappedVacancies.length}</strong>
            <span className="mt-0.5 block text-[9px] leading-tight text-amber-800/75 dark:text-amber-300/75">Locuri cu poziție aproximativă</span>
          </button>
        </div>
        <div className="mt-3 border-t border-border/60 px-1 pt-3">
          <p className="mb-2 text-[10px] font-bold text-foreground">Legenda hărții</p>
          <div className="space-y-1.5">
            {[
              { color: '#16a34a', label: 'Cu locuri vacante' },
              { color: '#d97706', label: 'Poziție aproximativă' },
              { color: '#94a3b8', label: 'Fără locuri publicate' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-3.5 shrink-0 rounded-[3px]" style={{ background: color }} />
                <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="px-2 pb-1 pt-2 text-[11px] text-muted-foreground md:hidden">
          {showAllSchools ? `${visibleSchools.length} instituții` : `${visibleSchools.length} instituții cu posturi`}
        </p>
        <div className="border-t border-border/60 px-1 pt-2">
          {!userLocation ? (
            <button type="button" onClick={requestLocation} disabled={locating} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/15 disabled:opacity-60">
              <LocateFixed size={14} />
              {locating ? 'Se determină poziția...' : 'Folosește poziția mea'}
            </button>
          ) : (
            <label className="block text-[11px] font-semibold text-muted-foreground">
              Distanță
              <select
                value={distanceKm ?? ''}
                onChange={(event) => setDistanceKm(event.target.value ? Number(event.target.value) : null)}
                className="mt-1 h-8 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground"
              >
                <option value="">Oriunde</option>
                <option value="5">Până la 5 km</option>
                <option value="10">Până la 10 km</option>
                <option value="25">Până la 25 km</option>
                <option value="50">Până la 50 km</option>
                <option value="100">Până la 100 km</option>
              </select>
            </label>
          )}
          {locationError && <p className="mt-2 max-w-52 text-[10px] leading-snug text-destructive">{locationError}</p>}
        </div>
        <button
          type="button"
          onClick={() => { resetFilters(); setDistanceKm(null); setSelectedInstitution(null); setSelectedCity(null); }}
          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden"
        >
          <RotateCcw size={13} /> Resetează filtrele
        </button>
        </div>
      </section>

      {unmappedOpen && (
        <div
          className="absolute inset-0 z-[1200] flex items-end justify-center bg-slate-950/35 p-0 backdrop-blur-[2px] md:items-center md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unmapped-title"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setUnmappedOpen(false); }}
        >
          <section className="flex max-h-[82dvh] w-full flex-col rounded-t-2xl border border-border bg-background shadow-2xl md:max-w-2xl md:rounded-2xl">
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border/60 px-4 py-4 md:px-5">
              <div>
                <h2 id="unmapped-title" className="text-lg font-extrabold text-foreground">Locuri cu poziție aproximativă</h2>
                <p className="mt-1 text-xs text-muted-foreground">Instituțiile sunt marcate în zona orașului sau raionului deoarece sursa nu conține coordonate exacte.</p>
              </div>
              <button type="button" onClick={() => setUnmappedOpen(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Închide lista">
                <X size={18} />
              </button>
            </header>
            <div className="overflow-y-auto p-3 md:p-4">
              <div className="space-y-2">
                {areaStats.unmappedVacancies.map((vacancy) => (
                  <article key={vacancy.id} className="rounded-xl border border-border/70 bg-card px-3.5 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold leading-snug text-foreground">{vacancy.institution}</h3>
                        <p className="mt-1 text-xs font-semibold text-primary">{vacancy.specialty_name}</p>
                      </div>
                      <span className="shrink-0 rounded-md bg-secondary px-2 py-1 text-[10px] font-semibold text-muted-foreground">{vacancy.city}</span>
                    </div>
                    {vacancy.institution_type && <p className="mt-2 text-[11px] text-muted-foreground">{vacancy.institution_type}</p>}
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

    </div>
  );
}
