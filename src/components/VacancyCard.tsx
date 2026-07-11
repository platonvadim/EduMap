import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vacancy } from '../types';
import { categorizeSpecialty } from '../utils/normalize';
import {
  Calculator, Languages, Microscope, GraduationCap,
  Brain, Palette, Dumbbell, BookOpen, Briefcase,
  ChevronDown, MapPin, Hash, Building2, ExternalLink,
  Navigation, Share2, Check
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useLocation } from 'wouter';

const CATEGORY_META: Record<string, {
  icon: React.ElementType;
  label: string;
  bar: string;
  chip: string;
  iconClass: string;
}> = {
  matematica: {
    icon: Calculator,
    label: 'Matematică & IT',
    bar: 'bg-blue-500',
    chip: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    iconClass: 'text-blue-500 dark:text-blue-400',
  },
  limbi: {
    icon: Languages,
    label: 'Limbi',
    bar: 'bg-indigo-500',
    chip: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
    iconClass: 'text-indigo-500 dark:text-indigo-400',
  },
  stiinte: {
    icon: Microscope,
    label: 'Științe',
    bar: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    iconClass: 'text-emerald-500 dark:text-emerald-400',
  },
  pedagogie: {
    icon: GraduationCap,
    label: 'Pedagogie',
    bar: 'bg-amber-500',
    chip: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    iconClass: 'text-amber-500 dark:text-amber-400',
  },
  psihologie: {
    icon: Brain,
    label: 'Psihologie',
    bar: 'bg-purple-500',
    chip: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
    iconClass: 'text-purple-500 dark:text-purple-400',
  },
  arte: {
    icon: Palette,
    label: 'Arte',
    bar: 'bg-pink-500',
    chip: 'bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300',
    iconClass: 'text-pink-500 dark:text-pink-400',
  },
  sport: {
    icon: Dumbbell,
    label: 'Sport',
    bar: 'bg-orange-500',
    chip: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
    iconClass: 'text-orange-500 dark:text-orange-400',
  },
  istorie: {
    icon: BookOpen,
    label: 'Istorie & Civic',
    bar: 'bg-stone-500',
    chip: 'bg-stone-50 text-stone-700 dark:bg-stone-950/50 dark:text-stone-300',
    iconClass: 'text-stone-500 dark:text-stone-400',
  },
  altele: {
    icon: Briefcase,
    label: 'Altele',
    bar: 'bg-slate-400',
    chip: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    iconClass: 'text-slate-500 dark:text-slate-400',
  },
};

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex gap-2 items-start">
      <div className="mt-0.5 w-5 h-5 rounded-md bg-muted flex items-center justify-center shrink-0">
        <Icon className="w-3 h-3 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold leading-none mb-0.5">{label}</p>
        <p className="text-xs text-foreground font-medium leading-snug">{value}</p>
      </div>
    </div>
  );
}

export function VacancyCard({ vacancy }: { vacancy: Vacancy }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { resetFilters, setMapTargetInstitution } = useStore();
  const [, navigate] = useLocation();

  function toggleOpen() {
    setOpen((value) => !value);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleOpen();
    }
  }

  async function handleShare(event: React.MouseEvent) {
    event.stopPropagation();
    const shareText = `Post vacant: ${vacancy.specialty_name} la ${vacancy.institution}, ${vacancy.city}. Vezi pe EduMap Moldova: https://platon.md/edumap`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Post vacant didactic',
          text: shareText,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const category = categorizeSpecialty(vacancy.specialty_name);
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;

  return (
    <motion.div
      layout
      data-testid={`vacancy-card-${vacancy.id}`}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onClick={toggleOpen}
      onKeyDown={handleKeyDown}
      className={[
        'group relative rounded-xl border bg-card cursor-pointer overflow-hidden',
        'transition-all duration-200',
        open
          ? 'border-border shadow-md shadow-black/[0.06] dark:shadow-black/20'
          : 'border-border/60 hover:border-border hover:shadow-sm hover:shadow-black/[0.04]',
      ].join(' ')}
      whileHover={{ y: open ? 0 : -1 }}
    >
      {/* Left color bar — always visible, brighter when open */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl transition-opacity duration-200 ${meta.bar} ${open ? 'opacity-100' : 'opacity-30 group-hover:opacity-60'}`}
      />

      <div className="pl-4 pr-3.5 pt-3.5 pb-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className={`mt-0.5 shrink-0 ${meta.iconClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${meta.iconClass}`}>
                {meta.label}
              </p>
              <h3 className={`font-semibold text-sm leading-snug text-foreground ${open ? '' : 'line-clamp-2'}`}>
                {vacancy.institution}
              </h3>
            </div>
          </div>

          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 mt-0.5 p-0.5 rounded-md text-muted-foreground/60 group-hover:text-muted-foreground transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.div>
        </div>

        {/* Tags row */}
        <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
          <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md ${meta.chip}`}>
            {vacancy.specialty_name}
          </span>
          {vacancy.institution_type && vacancy.institution_type !== 'Nespecificat' && (
            <span className="text-[11px] text-muted-foreground px-1.5 py-0.5 rounded-md bg-muted/70 font-medium">
              {vacancy.institution_type}
            </span>
          )}
        </div>
      </div>

      {/* Expanded panel */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 border-t border-border/50 bg-muted/20">
              <div className="grid grid-cols-2 gap-3">
                <DetailRow icon={MapPin}       label="Localitate"      value={vacancy.city} />
                <DetailRow icon={Building2}    label="OLSDI"           value={vacancy.olsdi} />
                <DetailRow icon={Hash}         label="Cod specialitate" value={vacancy.specialty_code} />
                <DetailRow icon={ExternalLink} label="ID"              value={vacancy.id} />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMapTargetInstitution(vacancy.institution);
                    resetFilters();
                    navigate('/');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Arată pe hartă
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Share2 className="h-3.5 w-3.5" />}
                  {copied ? 'Copiat' : 'Distribuie'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
