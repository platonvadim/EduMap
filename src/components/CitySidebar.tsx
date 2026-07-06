import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, MapPin, Building2, BookOpen, TrendingUp, BarChart3, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { VacancyCard } from './VacancyCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { categorizeSpecialty } from '../utils/normalize';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
} from 'recharts';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#64748b','#0ea5e9'];

const TYPE_SHORT: Record<string, string> = {
  'Liceu': 'Liceu',
  'Gimnaziu': 'Gimnaziu',
  'Instituție de educație timpurie': 'Grădiniță',
  'Școală primară': 'Primar',
  'Nespecificat': '—',
};

function shorten(s: string, n = 22) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function StatBento({
  label, value, sub, color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl bg-secondary/60 border border-border/40 min-w-0">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-none">{label}</span>
      <span className="text-xl font-bold leading-none" style={{ color }}>{value}</span>
      {sub && <span className="text-[10px] text-muted-foreground leading-none truncate">{sub}</span>}
    </div>
  );
}

export function CitySidebar() {
  const { selectedCity, setSelectedCity, vacancies } = useStore();
  const [localSearch, setLocalSearch] = useState('');
  const [tab, setTab] = useState('vacancies');

  const cityVacancies = useMemo(() => {
    if (!selectedCity) return [];
    return vacancies.filter(v => v.city === selectedCity);
  }, [vacancies, selectedCity]);

  const filteredVacancies = useMemo(() => {
    if (!localSearch.trim()) return cityVacancies;
    const lower = localSearch.toLowerCase();
    return cityVacancies.filter(v =>
      v.institution.toLowerCase().includes(lower) ||
      v.specialty_name.toLowerCase().includes(lower) ||
      (v.institution_type && v.institution_type.toLowerCase().includes(lower))
    );
  }, [cityVacancies, localSearch]);

  const stats = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    const specialtyCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const institutionSet = new Set<string>();

    cityVacancies.forEach(v => {
      const type = v.institution_type || 'Nespecificat';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      specialtyCounts[v.specialty_name] = (specialtyCounts[v.specialty_name] || 0) + 1;
      const cat = categorizeSpecialty(v.specialty_name);
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      institutionSet.add(v.institution);
    });

    const institutionData = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name: TYPE_SHORT[name] || shorten(name, 18), value }));

    const topSpecialties = Object.entries(specialtyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name: shorten(name, 26), value }));

    const topSpecialty = Object.entries(specialtyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

    const groupedSpecialties = Object.entries(specialtyCounts).reduce((acc, [name, count]) => {
      const cat = categorizeSpecialty(name);
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push({ name, count });
      return acc;
    }, {} as Record<string, { name: string; count: number }[]>);

    Object.keys(groupedSpecialties).forEach(k => {
      groupedSpecialties[k].sort((a, b) => b.count - a.count);
    });

    const maxSpecialtyCount = Math.max(...Object.values(specialtyCounts), 1);

    return {
      institutionData,
      topSpecialties,
      topSpecialty,
      groupedSpecialties,
      uniqueInstitutions: institutionSet.size,
      uniqueSpecialties: Object.keys(specialtyCounts).length,
      topTypeLabel: institutionData[0]?.name ?? '—',
      topTypeCount: institutionData[0]?.value ?? 0,
      maxSpecialtyCount,
    };
  }, [cityVacancies]);

  return (
    <AnimatePresence>
      {selectedCity && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCity(null)}
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-40 md:hidden"
          />

          {/* Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            style={{ willChange: 'transform' }}
            className="absolute bottom-0 left-0 right-0 h-[88%] md:h-full md:top-0 md:bottom-auto md:left-auto md:right-0 md:w-[420px] bg-background md:border-l border-t md:border-t-0 rounded-t-2xl md:rounded-none shadow-2xl z-50 flex flex-col"
          >
            {/* Drag handle (mobile only) */}
            <div className="md:hidden flex justify-center pt-2.5 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* ── Header ── */}
            <div className="shrink-0 px-5 pt-4 md:pt-5 pb-4 border-b border-border/60">
              {/* Title row */}
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground truncate">{selectedCity}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground pl-8">
                    <span className="font-bold text-primary">{cityVacancies.length}</span>
                    {' '}vacanțe active
                    {cityVacancies[0]?.olsdi && (
                      <span className="ml-1.5 text-[11px] text-muted-foreground/70">· {cityVacancies[0].olsdi}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCity(null)}
                  className="p-1.5 rounded-xl hover:bg-secondary text-muted-foreground transition-colors shrink-0"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Stat bento grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <StatBento label="Vacanțe"    value={cityVacancies.length}       color="#6366f1" />
                <StatBento label="Instituții" value={stats.uniqueInstitutions}   color="#10b981" />
                <StatBento label="Discipline" value={stats.uniqueSpecialties}    color="#8b5cf6" />
                <StatBento label={stats.topTypeLabel} value={stats.topTypeCount} color="#f59e0b" />
              </div>

              {/* Top specialty highlight */}
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-accent/60 border border-primary/15">
                <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Disciplina lider</p>
                  <p className="text-xs font-semibold text-foreground truncate">{stats.topSpecialty}</p>
                </div>
              </div>
            </div>

            {/* ── Tabs ── */}
            <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col overflow-hidden">
              <div className="px-5 py-2.5 border-b border-border/60 shrink-0">
                <TabsList className="w-full grid grid-cols-3 h-9 bg-secondary/50 p-0.5 rounded-xl">
                  <TabsTrigger value="vacancies" className="text-xs gap-1.5 rounded-[10px] data-[state=active]:bg-card data-[state=active]:shadow-sm">
                    <BookOpen className="w-3.5 h-3.5" />
                    Lista
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="text-xs gap-1.5 rounded-[10px] data-[state=active]:bg-card data-[state=active]:shadow-sm">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="specialties" className="text-xs gap-1.5 rounded-[10px] data-[state=active]:bg-card data-[state=active]:shadow-sm">
                    <Building2 className="w-3.5 h-3.5" />
                    Discipline
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* ── VACANCIES TAB ── */}
              <TabsContent value="vacancies" className="flex-1 flex flex-col overflow-hidden m-0 data-[state=active]:flex">
                <div className="px-4 py-2.5 border-b border-border/40 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                    <Input
                      placeholder="Caută instituție sau disciplină..."
                      className="pl-9 h-8 text-sm bg-secondary/50 border-transparent focus:border-border rounded-lg"
                      value={localSearch}
                      onChange={e => setLocalSearch(e.target.value)}
                    />
                  </div>
                  {localSearch && (
                    <p className="text-[11px] text-muted-foreground mt-1.5 pl-1">
                      {filteredVacancies.length} din {cityVacancies.length} rezultate
                    </p>
                  )}
                </div>

                <ScrollArea className="flex-1">
                  <div className="flex flex-col gap-2 p-3.5 pb-8">
                    <AnimatePresence initial={false}>
                      {filteredVacancies.map((v, i) => (
                        <motion.div
                          key={v.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ delay: Math.min(i * 0.025, 0.15) }}
                        >
                          <VacancyCard vacancy={v} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {filteredVacancies.length === 0 && (
                      <div className="text-center py-14 text-muted-foreground">
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-25" />
                        <p className="text-sm font-medium">Nu au fost găsite rezultate</p>
                        <p className="text-xs mt-1 text-muted-foreground/70">Încearcă alt termen</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* ── ANALYTICS TAB ── */}
              <TabsContent value="analytics" className="flex-1 overflow-y-auto m-0 p-4 data-[state=active]:block">
                <div className="space-y-7 pb-8">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                      Distribuție Tip Instituție
                    </p>
                    <div className="h-[190px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.institutionData}
                            cx="38%"
                            cy="50%"
                            innerRadius={52}
                            outerRadius={76}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {stats.institutionData.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{
                              borderRadius: '12px', fontSize: 12,
                              background: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              color: 'hsl(var(--foreground))',
                              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1">
                      {stats.institutionData.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-[11px] text-muted-foreground">{d.name} <strong className="text-foreground">{d.value}</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                      Top 8 Discipline
                    </p>
                    <div className="h-[230px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.topSpecialties}
                          layout="vertical"
                          margin={{ left: 4, right: 28, top: 0, bottom: 0 }}
                        >
                          <XAxis type="number" hide />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={128}
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <RechartsTooltip
                            cursor={{ fill: 'hsl(var(--secondary))' }}
                            contentStyle={{
                              borderRadius: '12px', fontSize: 12,
                              background: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              color: 'hsl(var(--foreground))',
                              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                            }}
                          />
                          <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]}
                            label={{ position: 'right', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ── SPECIALTIES TAB ── */}
              <TabsContent value="specialties" className="flex-1 overflow-y-auto m-0 p-4 data-[state=active]:block">
                <div className="space-y-5 pb-8">
                  {Object.entries(stats.groupedSpecialties).map(([cat, items]) => {
                    const maxCount = items[0]?.count ?? 1;
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground capitalize">
                            {cat}
                          </h3>
                          <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
                            {items.length}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {items.map(item => (
                            <div key={item.name} className="flex items-center gap-2.5 group">
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                  <span className="text-xs text-foreground font-medium leading-snug truncate">{item.name}</span>
                                  <span className="text-[10px] shrink-0 ml-2 text-primary font-bold">{item.count}</span>
                                </div>
                                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-primary/60 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(item.count / maxCount) * 100}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
