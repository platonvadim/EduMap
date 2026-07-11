import { useMemo, useState } from 'react';
import { Building2, GraduationCap, MapPin, Phone, RotateCcw, Navigation } from 'lucide-react';
import { Layout } from '../components/Layout';
import { VacancyCard } from '../components/VacancyCard';
import { useVacancyData } from '../hooks/useVacancyData';
import { useFuseSearch } from '../hooks/useFuseSearch';
import { useSchoolData } from '../hooks/useSchoolData';
import { useStore } from '../store/useStore';
import { removeDiacritics } from '../utils/normalize';
import { Helmet } from 'react-helmet-async';

const SCHOOL_TYPES: Record<string, string> = {
  primary_school: 'Școală primară',
  gymnasium: 'Gimnaziu',
  lyceum: 'Liceu',
  other_school: 'Altă instituție',
};

export default function CatalogPage() {
  useVacancyData();
  const { vacancies, searchQuery, setSearchQuery } = useStore();
  const vacancyResults = useFuseSearch();
  const schools = useSchoolData(vacancies);
  const [tab, setTab] = useState<'vacancies' | 'schools'>('vacancies');
  const [city, setCity] = useState('');
  const [schoolType, setSchoolType] = useState('');
  const [onlyWithVacancies, setOnlyWithVacancies] = useState(false);
  const [limit, setLimit] = useState(48);

  const cities = useMemo(() => [...new Set(vacancies.map((item) => item.city))].sort((a, b) => a.localeCompare(b, 'ro')), [vacancies]);
  const query = removeDiacritics(searchQuery).toLowerCase().trim();

  const filteredVacancies = useMemo(
    () => vacancyResults.filter((item) => !city || item.city === city),
    [vacancyResults, city]
  );

  const filteredSchools = useMemo(() => schools.filter((school) => {
    if (schoolType && school.type !== schoolType) return false;
    if (onlyWithVacancies && school.vacancies.length === 0) return false;
    if (city) {
      const cityKey = removeDiacritics(city).toLowerCase().replace(/[^a-z]/g, '');
      const districtKey = removeDiacritics(school.district ?? '').toLowerCase().replace(/[^a-z]/g, '');
      const localityKey = removeDiacritics(school.locality ?? '').toLowerCase().replace(/[^a-z]/g, '');
      const vacancyMatches = school.vacancies.some((vacancy) => vacancy.city === city);
      if (!vacancyMatches && !districtKey.includes(cityKey) && !localityKey.includes(cityKey)) return false;
    }
    if (!query) return true;
    const haystack = removeDiacritics([school.name, school.locality, school.district, school.address].filter(Boolean).join(' ')).toLowerCase();
    return haystack.includes(query);
  }), [schools, schoolType, onlyWithVacancies, city, query]);

  const total = tab === 'vacancies' ? filteredVacancies.length : filteredSchools.length;
  const resetCatalog = () => {
    setSearchQuery('');
    setCity('');
    setSchoolType('');
    setOnlyWithVacancies(false);
    setLimit(48);
  };

  return (
    <Layout>
      <Helmet>
        <title>Catalog Școli și Funcții Vacante | EduMap Moldova</title>
        <meta name="description" content="Caută prin catalogul tuturor instituțiilor de învățământ din Moldova și vezi ce posturi didactice sunt disponibile în fiecare școală sau grădiniță." />
      </Helmet>
      <div className="h-full w-full overflow-y-auto bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-5 md:px-6 md:pb-10 md:pt-8">
          <header className="mb-5 md:mb-7">
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Catalog educațional</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Explorează toate posturile vacante și instituțiile de învățământ din Moldova.</p>
          </header>

          <div className="sticky top-0 z-20 -mx-4 mb-5 border-y border-border/60 bg-background/95 px-4 py-3 backdrop-blur-xl md:static md:mx-0 md:rounded-2xl md:border md:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1 md:w-72">
                <button onClick={() => { setTab('vacancies'); setLimit(48); }} className={`rounded-lg px-3 py-2 text-sm font-bold ${tab === 'vacancies' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>Locuri vacante</button>
                <button onClick={() => { setTab('schools'); setLimit(48); }} className={`rounded-lg px-3 py-2 text-sm font-bold ${tab === 'schools' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>Școli</button>
              </div>
              <select value={city} onChange={(event) => { setCity(event.target.value); setLimit(48); }} className="h-10 rounded-xl border border-border bg-background px-3 text-sm md:min-w-48">
                <option value="">Toate localitățile</option>
                {cities.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              {tab === 'schools' && (
                <>
                  <select value={schoolType} onChange={(event) => { setSchoolType(event.target.value); setLimit(48); }} className="h-10 rounded-xl border border-border bg-background px-3 text-sm md:min-w-44">
                    <option value="">Toate tipurile</option>
                    {Object.entries(SCHOOL_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium">
                    <input type="checkbox" checked={onlyWithVacancies} onChange={(event) => setOnlyWithVacancies(event.target.checked)} className="accent-primary" />
                    Doar cu locuri vacante
                  </label>
                </>
              )}
              <button onClick={resetCatalog} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground md:ml-auto">
                <RotateCcw size={14} /> Resetează
              </button>
            </div>
          </div>

          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">{tab === 'vacancies' ? 'Locuri vacante' : 'Instituții'}</h2>
              <p className="text-sm text-muted-foreground">{total} rezultate</p>
            </div>
          </div>

          {total === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="font-bold">Nu am găsit rezultate</p>
              <p className="mt-1 text-sm text-muted-foreground">Schimbă termenul de căutare sau filtrele selectate.</p>
            </div>
          ) : tab === 'vacancies' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredVacancies.slice(0, limit).map((vacancy) => <VacancyCard key={vacancy.id} vacancy={vacancy} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredSchools.slice(0, limit).map((school) => (
                <article key={school.id} className="rounded-2xl border border-border/70 bg-card p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><GraduationCap size={19} /></span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-primary">{SCHOOL_TYPES[school.type]}</p>
                      <h3 className="mt-0.5 font-bold leading-snug">{school.name}</h3>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" />{[school.locality, school.district].filter(Boolean).join(', ')}</p>
                    {school.phone && <p className="flex items-center gap-2"><Phone size={14} />{school.phone}</p>}
                    <p className="flex items-center gap-2"><Building2 size={14} />{school.vacancies.length ? `${school.vacancies.length} locuri vacante` : 'Fără locuri publicate'}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${school.latitude},${school.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-secondary/70 px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      Cum ajung (Traseu)
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}

          {limit < total && (
            <div className="mt-6 flex justify-center">
              <button onClick={() => setLimit((value) => value + 48)} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90">Arată mai multe</button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
