import { Layout } from '../components/Layout';
import { useVacancyData } from '../hooks/useVacancyData';
import { useVacancyStats } from '../hooks/useVacancyStats';
import { useStore } from '../store/useStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, BookOpen, Building2, GraduationCap, TrendingUp } from 'lucide-react';
import { truncateLabel } from '../utils/normalize';

const CHART_COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#be185d', '#475569', '#0891b2', '#b91c1c'];

const CATEGORY_LABELS: Record<string, string> = {
  matematica: 'Matematică și științe exacte',
  limbi: 'Limbi',
  pedagogie: 'Pedagogie',
  sport: 'Sport',
  arte: 'Arte',
  psihologie: 'Psihologie',
  stiinte: 'Științe',
  istorie: 'Istorie',
  altele: 'Altele',
};

const TOOLTIP_STYLE = {
  borderRadius: '12px',
  fontSize: 12,
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  color: 'hsl(var(--foreground))',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
};

function KpiCard({
  label, value, sub, hint, icon: Icon, color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  hint?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-card border border-border/60 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-foreground leading-none">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
        {hint && <p className="text-[11px] text-muted-foreground/80 mt-2 leading-relaxed">{hint}</p>}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
  className = '',
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-card border border-border/60 rounded-xl p-5 md:p-6 shadow-sm ${className}`}>
      <div className="mb-5">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function InsightsPage() {
  useVacancyData();
  const { isLoading } = useStore();
  const stats = useVacancyStats();
  const topCities = stats.topCities.map((item) => ({
    ...item,
    shortName: truncateLabel(item.name, 18),
  }));
  const topSpecialties = stats.topSpecialties.slice(0, 15).map((item) => ({
    ...item,
    shortName: truncateLabel(item.name, 34),
  }));
  const institutionData = stats.institutionData.slice(0, 12).map((item) => ({
    ...item,
    shortName: truncateLabel(item.name, 30),
  }));
  const categoryData = stats.categoryData.map((item) => ({
    name: CATEGORY_LABELS[item.name] ?? item.name,
    value: item.value,
  }));

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollArea className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">

          {/* ── Hero header ── */}
          <div className="relative overflow-hidden rounded-xl border border-border/70 bg-card mb-8 mt-6 px-6 md:px-8 py-7 md:py-8">
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-semibold mb-3">
                <TrendingUp size={12} />
                Deficit la nivel național
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-tight mb-1.5">
                Analytics EduMap
              </h1>
              <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
                Imagine de ansamblu asupra deficitului de cadre didactice în Moldova. Valorile sunt orientative și depind de calitatea datelor disponibile.
              </p>
            </div>
          </div>

          {/* ── KPI cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
            <KpiCard
              label="Cel mai mare deficit"
              value={stats.mostVacanciesCity}
              sub={`${stats.topCities[0]?.count || 0} vacanțe libere`}
              hint="Localitatea cu cele mai multe posturi raportate."
              icon={MapPin}
              color="#dc2626"
            />
            <KpiCard
              label="Disciplina lider"
              value={stats.mostInDemand}
              sub="La nivel național"
              hint="Specialitatea care apare cel mai des în setul curent."
              icon={BookOpen}
              color="#2563eb"
            />
            <KpiCard
              label="Total Instituții"
              value={stats.totalInstitutions}
              sub="Raportează lipsă cadre"
              hint="Instituții distincte cu cel puțin o vacanță."
              icon={Building2}
              color="#059669"
            />
            <KpiCard
              label="Specialități Distincte"
              value={stats.totalSpecialties}
              sub="Necesare la nivel național"
              hint="Denumiri distincte de discipline sau roluri."
              icon={GraduationCap}
              color="#d97706"
            />
          </div>

          {/* ── Charts grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

            {/* Top cities */}
            <ChartCard title="Top localități cu deficit" description="Cele mai multe vacanțe raportate, ordonate descrescător.">
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topCities}
                    layout="vertical"
                    margin={{ top: 0, right: 42, left: 64, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="2 4" horizontal={false} vertical={true}
                      stroke="hsl(var(--border))" />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => truncateLabel(String(value), 18)}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <RechartsTooltip cursor={{ fill: 'hsl(var(--secondary))' }} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} barSize={16}
                      label={{ position: 'right', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Category donut */}
            <ChartCard title="Distribuția pe categorii" description="Discipline grupate semantic pentru scanare rapidă.">
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="44%"
                      innerRadius={78}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {stats.categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend
                      verticalAlign="bottom"
                      height={40}
                      wrapperStyle={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Top specialties */}
            <ChartCard title="Top discipline căutate" description="Denumirile lungi sunt afișate vertical pentru a evita suprapunerea." className="lg:col-span-2">
              <div className="h-[480px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topSpecialties}
                    layout="vertical"
                    margin={{ top: 0, right: 44, left: 164, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="2 4" horizontal={false} vertical={true} stroke="hsl(var(--border))" />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={160}
                      tickFormatter={(value) => truncateLabel(String(value), 32)}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip cursor={{ fill: 'hsl(var(--secondary))' }} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]}
                      label={{ position: 'right', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Institution types */}
            <ChartCard title="Deficit pe tip de instituție" description="Tipuri normalizate doar pentru afișare, fără modificarea datelor sursă.">
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={institutionData}
                    layout="vertical"
                    margin={{ top: 0, right: 40, left: 132, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="2 4" horizontal={false} vertical={true}
                      stroke="hsl(var(--border))" />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={132}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => truncateLabel(String(value), 28)}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <RechartsTooltip cursor={{ fill: 'hsl(var(--secondary))' }} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="count" fill="#059669" radius={[0, 6, 6, 0]} barSize={18}
                      label={{ position: 'right', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Rare specialties */}
            <ChartCard title="Discipline rare" description="Specialități cu mai puțin de 3 posturi raportate.">
              <ScrollArea className="h-[280px]">
                <div className="space-y-2 pr-2">
                  {stats.rareSpecialties.map((item, i) => (
                    <div
                      key={item.name}
                      className="flex justify-between items-center px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/40 hover:bg-secondary/80 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[10px] font-mono text-muted-foreground/60 w-5 shrink-0">{i + 1}</span>
                        <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
                      </div>
                      <span className="shrink-0 ml-3 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-lg font-bold">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </ChartCard>
          </div>
        </div>
      </ScrollArea>
    </Layout>
  );
}
