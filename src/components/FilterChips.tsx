import {
  Calculator, Languages, GraduationCap, Dumbbell, Palette,
  Brain, Microscope, BookOpen, LayoutGrid,
} from "lucide-react";
import { useStore } from "../store/useStore";

const CATEGORIES = [
  { id: null,         label: "Toate",     icon: LayoutGrid,    color: "default" },
  { id: "matematica", label: "Matematică", icon: Calculator,   color: "blue" },
  { id: "limbi",      label: "Limbi",      icon: Languages,    color: "indigo" },
  { id: "pedagogie",  label: "Pedagogie",  icon: GraduationCap,color: "amber" },
  { id: "sport",      label: "Sport",      icon: Dumbbell,     color: "orange" },
  { id: "arte",       label: "Arte",       icon: Palette,      color: "pink" },
  { id: "psihologie", label: "Psihologie", icon: Brain,        color: "purple" },
  { id: "stiinte",    label: "Științe",    icon: Microscope,   color: "emerald" },
  { id: "istorie",    label: "Istorie",    icon: BookOpen,     color: "stone" },
] as const;

const COLOR_MAP: Record<string, { active: string; inactive: string }> = {
  default:  { active: "gradient-bg text-white shadow-md shadow-primary/25",    inactive: "bg-secondary/80 text-secondary-foreground hover:bg-secondary" },
  blue:     { active: "bg-blue-500 text-white shadow-md shadow-blue-500/25",    inactive: "bg-secondary/80 text-secondary-foreground hover:bg-blue-50 dark:hover:bg-blue-950/40" },
  indigo:   { active: "bg-indigo-500 text-white shadow-md shadow-indigo-500/25",inactive: "bg-secondary/80 text-secondary-foreground hover:bg-indigo-50 dark:hover:bg-indigo-950/40" },
  amber:    { active: "bg-amber-500 text-white shadow-md shadow-amber-500/25",  inactive: "bg-secondary/80 text-secondary-foreground hover:bg-amber-50 dark:hover:bg-amber-950/40" },
  orange:   { active: "bg-orange-500 text-white shadow-md shadow-orange-500/25",inactive: "bg-secondary/80 text-secondary-foreground hover:bg-orange-50 dark:hover:bg-orange-950/40" },
  pink:     { active: "bg-pink-500 text-white shadow-md shadow-pink-500/25",    inactive: "bg-secondary/80 text-secondary-foreground hover:bg-pink-50 dark:hover:bg-pink-950/40" },
  purple:   { active: "bg-purple-500 text-white shadow-md shadow-purple-500/25",inactive: "bg-secondary/80 text-secondary-foreground hover:bg-purple-50 dark:hover:bg-purple-950/40" },
  emerald:  { active: "bg-emerald-500 text-white shadow-md shadow-emerald-500/25",inactive: "bg-secondary/80 text-secondary-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/40" },
  stone:    { active: "bg-stone-500 text-white shadow-md shadow-stone-500/25",  inactive: "bg-secondary/80 text-secondary-foreground hover:bg-stone-50 dark:hover:bg-stone-950/40" },
};

export function FilterChips() {
  const { filters, setFilter } = useStore();

  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
      {CATEGORIES.map((cat) => {
        const isActive = filters.category === cat.id;
        const colors = COLOR_MAP[cat.color];
        const Icon = cat.icon;

        return (
          <button
            key={String(cat.id)}
            onClick={() => setFilter("category", cat.id as string | null)}
            className={[
              "inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-semibold",
              "shrink-0 transition-all duration-150 cursor-pointer",
              isActive ? colors.active : colors.inactive,
            ].join(" ")}
          >
            <Icon size={12} strokeWidth={2.2} />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
