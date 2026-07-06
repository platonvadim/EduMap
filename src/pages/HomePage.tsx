import { Layout } from '../components/Layout';
import { MapView } from '../components/MapView';
import { CitySidebar } from '../components/CitySidebar';
import { FilterChips } from '../components/FilterChips';
import { useVacancyData } from '../hooks/useVacancyData';
import { useStore } from '../store/useStore';
import { useFuseSearch } from '../hooks/useFuseSearch';
import { VacancyCard } from '../components/VacancyCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';

export default function HomePage() {
  useVacancyData();
  const { isLoading, searchQuery, filters, setSearchQuery, setFilter } = useStore();
  const searchResults = useFuseSearch();

  const isSearching = searchQuery.trim().length > 0 || filters.category !== null;

  return (
    <Layout>
      <div className="flex-1 flex relative w-full h-full">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative w-full h-full z-0">

          {/* Floating filter chips — single row scroll */}
          <div className="absolute top-0 left-0 right-0 px-3 py-2 md:px-5 md:py-3 pointer-events-none z-10">
            <div className="pointer-events-auto bg-background/85 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border max-w-full overflow-hidden">
              <FilterChips />
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 w-full h-full relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 z-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-9 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-muted-foreground text-sm font-medium animate-pulse">
                    Încărcare date...
                  </p>
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
                      {searchResults.length} vacanțe găsite
                    </p>
                  </div>
                  <button
                    onClick={() => { setSearchQuery(""); setFilter("category", null); }}
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
                      <p className="font-medium">Nicio vacanță găsită</p>
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
