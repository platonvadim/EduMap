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

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6', '#f43f5e'];

const TOOLTIP_STYLE = {
  borderRadius: '12px',
  fontSize: 12,
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  color: 'hsl(var(--foreground))',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
};

function KpiCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md hover:shadow-black/[0.05] transition-shadow">
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
      </div>
    </div>
  );
}

function ChartCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border/60 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md hover:shadow-black/[0.05] transition-shadow ${className}`}>
      <p className="text-sm font-bold text-foreground mb-5">{title}</p>
      {children}
    </div>
  );
}

export default function InsightsPage() {
  useVacancyData();
  const { isLoading } = useStore();
  const stats = useVacancyStats();

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
          <div className="relative overflow-hidden rounded-2xl mb-8 mt-6 px-6 md:px-8 py-7 md:py-8"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {/* Decorative blobs */}
            <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

            <div className="relative">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-white/90 text-xs font-semibold mb-3 backdrop-blur-sm">
                <TrendingUp size={12} />
                Deficit la nivel național
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight mb-1.5">
                Analytics EduMap
              </h1>
              <p className="text-white/75 text-sm max-w-lg">
                Imagine de ansamblu asupra deficitului de cadre didactice în Moldova.
              </p>
            </div>
          </div>

          {/* ── KPI cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
            <KpiCard
              label="Cel mai mare deficit"
              value={stats.mostVacanciesCity}
              sub={`${stats.cityCounts[stats.mostVacanciesCity] || 0} vacanțe libere`}
              icon={MapPin}
              color="#ef4444"
            />
            <KpiCard
              label="Disciplina lider"
              value={stats.mostInDemand}
              sub="La nivel național"
              icon={BookOpen}
              color="#6366f1"
            />
            <KpiCard
              label="Total Instituții"
              value={stats.totalInstitutions}
              sub="Raportează lipsă cadre"
              icon={Building2}
              color="#10b981"
            />
            <KpiCard
              label="Specialități Distincte"
              value={stats.totalSpecialties}
              sub="Necesare la nivel național"
              icon={GraduationCap}
              color="#f59e0b"
            />
          </div>

          {/* ── Charts grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

            {/* Top cities */}
            <ChartCard title="Top 15 Localități cu Deficit">
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.topCities}
                    layout="vertical"
                    margin={{ top: 0, right: 36, left: 44, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="2 4" horizontal={false} vertical={true}
                      stroke="hsl(var(--border))" />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <RechartsTooltip cursor={{ fill: 'hsl(var(--secondary))' }} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={16}
                      label={{ position: 'right', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Category donut */}
            <ChartCard title="Distribuția pe Categorii de Discipline">
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryData}
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
            <ChartCard title="Top 20 Discipline Căutate" className="lg:col-span-2">
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.topSpecialties}
                    margin={{ top: 10, right: 20, left: 10, bottom: 68 }}
                  >
                    <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      angle={-42}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <RechartsTooltip cursor={{ fill: 'hsl(var(--secondary))' }} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="value" fill="#6366f1" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Institution types */}
            <ChartCard title="Deficit pe Tip de Instituție">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.institutionData}
                    layout="vertical"
                    margin={{ top: 0, right: 36, left: 64, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="2 4" horizontal={false} vertical={true}
                      stroke="hsl(var(--border))" />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <RechartsTooltip cursor={{ fill: 'hsl(var(--secondary))' }} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} barSize={20}
                      label={{ position: 'right', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Rare specialties */}
            <ChartCard title="Discipline Rare (< 3 posturi)">
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
