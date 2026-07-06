import { Layout } from '../components/Layout';
import { MapView } from '../components/MapView';
import { CitySidebar } from '../components/CitySidebar';
import { FilterChips } from '../components/FilterChips';
import { useVacancyData } from '../hooks/useVacancyData';
import { useVacancyStats } from '../hooks/useVacancyStats';
import { useStore } from '../store/useStore';
import { useFuseSearch } from '../hooks/useFuseSearch';
import { VacancyCard } from '../components/VacancyCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { Info } from 'lucide-react';

export default function HomePage() {
  useVacancyData();
  const { isLoading, dataError, searchQuery, filters, resetFilters } = useStore();
  const searchResults = useFuseSearch();
  const stats = useVacancyStats();

  const isSearching = searchQuery.trim().length > 0 || filters.category !== null || filters.institutionType !== null || filters.city !== null;

  return (
    <Layout>
      <div className="flex-1 flex relative w-full h-full">
        <h1 className="sr-only">EduMap Moldova: hartă interactivă a vacansiilor didactice</h1>
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative w-full h-full z-0">

          {/* Floating filter chips — single row scroll */}
          <div className="absolute top-0 left-0 right-0 px-3 py-2 md:px-5 md:py-3 pointer-events-none z-10">
            <div className="pointer-events-auto bg-background/85 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border max-w-full overflow-hidden">
              <FilterChips />
            </div>
          </div>

          <section
            aria-label="Rezumat hartă"
            className="absolute top-[58px] left-3 right-3 md:top-[72px] md:left-5 md:right-auto md:w-[360px] z-10 rounded-xl border border-border/70 bg-card/90 backdrop-blur-md shadow-md px-4 py-3"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Info size={15} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">Vacansii didactice pe hartă</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {stats.totalVacancies} posturi în {stats.citiesWithVacancies} localități. Date consultative, pot fi incomplete.
                </p>
              </div>
            </div>
          </section>

          {/* Map */}
          <div className="flex-1 w-full h-full relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 z-20">
                <div className="w-full max-w-sm rounded-2xl border border-border/70 bg-card/90 p-5 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/3 rounded-full bg-muted animate-pulse" />
                      <div className="h-3 w-1/2 rounded-full bg-muted animate-pulse" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-foreground">Se încarcă harta și datele</p>
                  <p className="mt-1 text-xs text-muted-foreground">Pregătim localitățile, filtrele și lista de vacante.</p>
                </div>
              </div>
            ) : dataError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 z-20 px-4">
                <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-5 shadow-lg">
                  <p className="text-sm font-bold text-destructive">Datele nu au putut fi încărcate</p>
                  <p className="mt-2 text-sm text-muted-foreground">{dataError}</p>
                  <button
                    className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    onClick={() => window.location.reload()}
                  >
                    Reîncarcă pagina
                  </button>
                </div>
              </div>
            ) : (
              <MapView />
            )}
          </div>

          {/* Search / filter results overlay */}
          {isSearching && (
            <div className="absolute inset-0 bg-background/97 backdrop-blur-sm z-30 flex flex-col overflow-hidden">
              <div className="w-full max-w-4xl mx-auto flex flex-col h-full px-4 md:px-6 pt-4 md:pt-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <div>
                    <h2 className="text-lg md:text-2xl font-bold leading-tight">
                      Rezultate
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {searchResults.length} vacante găsite
                    </p>
                  </div>
                  <button
                    onClick={() => resetFilters()}
                    className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    Înapoi la hartă
                  </button>
                </div>

                {/* Filter chips in search mode too */}
                <div className="mb-3 shrink-0">
                  <FilterChips />
                </div>

                {/* Results grid */}
                <ScrollArea className="flex-1">
                  {searchResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                      <Search className="w-10 h-10 mb-3 opacity-25" />
                      <p className="font-medium">Nicio specialitate vacantă găsită</p>
                      <p className="text-xs mt-1">Încearcă alt termen</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-16">
                      {searchResults.map((v) => (
                        <VacancyCard key={v.id} vacancy={v} />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <CitySidebar />
      </div>
    </Layout>
  );
}
