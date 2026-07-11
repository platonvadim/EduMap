import {
  Calculator, Languages, GraduationCap, Dumbbell, Palette,
  Brain, Microscope, BookOpen, LayoutGrid,
} from "lucide-react";
import { useStore } from "../store/useStore";

const CATEGORIES = [
  { id: null,         label: "Toate",     icon: LayoutGrid },
  { id: "matematica", label: "Matematică", icon: Calculator },
  { id: "limbi",      label: "Limbi",      icon: Languages },
  { id: "pedagogie",  label: "Pedagogie",  icon: GraduationCap },
  { id: "sport",      label: "Sport",      icon: Dumbbell },
  { id: "arte",       label: "Arte",       icon: Palette },
  { id: "psihologie", label: "Psihologie", icon: Brain },
  { id: "stiinte",    label: "Științe",    icon: Microscope },
  { id: "istorie",    label: "Istorie",    icon: BookOpen },
] as const;

export function FilterChips() {
  const { filters, setFilter } = useStore();

  return (
    <div className="flex flex-wrap gap-1.5">
      {CATEGORIES.map((cat) => {
        const isActive = filters.category === cat.id;
        const Icon = cat.icon;

        return (
          <button
            key={String(cat.id)}
            onClick={() => setFilter("category", cat.id as string | null)}
            aria-pressed={isActive}
            aria-label={cat.id ? `Filtrează după ${cat.label}` : "Afișează toate disciplinele"}
            className={[
              "inline-flex items-center gap-1.5 px-3 h-9 md:h-8 rounded-full text-[12px] font-semibold",
              "shrink-0 transition-all duration-150 cursor-pointer",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/85 text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
            ].join(" ")}
          >
            <Icon size={12} strokeWidth={2} />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
