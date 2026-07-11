import { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useStore } from "../store/useStore";

export function SearchBar({ autoFocus, placeholder = "Caută instituție, disciplină..." }: { autoFocus?: boolean; placeholder?: string }) {
  const { searchQuery, setSearchQuery } = useStore();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  return (
    <div className="relative w-full">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        size={15}
      />
      <Input
        id="site-search"
        ref={ref}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Caută instituție sau disciplină"
        type="search"
        className="pl-9 pr-8 bg-secondary border-none h-9 text-sm"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Șterge căutare"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
