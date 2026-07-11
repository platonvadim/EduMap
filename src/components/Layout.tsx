import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { SearchBar } from "./SearchBar";
import { Map, BarChart2, Sun, Moon, Search, X, Mail, ArrowLeft, LibraryBig, HelpCircle, ChevronLeft, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "../store/useStore";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [isDark, setIsDark] = React.useState(() => {
    const saved = window.localStorage.getItem("edumap-theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      return true;
    }
    if (saved === "light") {
      document.documentElement.classList.remove("dark");
      return false;
    }
    return document.documentElement.classList.contains("dark");
  });
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(() => window.localStorage.getItem("edumap-tour-completed") !== "true");
  const [tourStep, setTourStep] = useState(0);
  const [tourTarget, setTourTarget] = useState<DOMRect | null>(null);
  const { resetFilters, setSearchQuery, setFilter, searchQuery } = useStore();
  const isMapPage = location === "/";
  const hasContextSearch = isMapPage || location === "/catalog";

  const toggleDark = () => {
    const isDarkMode = document.documentElement.classList.toggle("dark");
    window.localStorage.setItem("edumap-theme", isDarkMode ? "dark" : "light");
    setIsDark(isDarkMode);
  };

  function handleMapClick() {
    resetFilters();
    setMobileSearchOpen(false);
  }

  function handleSearchToggle() {
    if (mobileSearchOpen && searchQuery) {
      setSearchQuery("");
      setFilter("category", null);
    }
    setMobileSearchOpen((v) => !v);
  }

  const navBase =
    "relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200";
  const navActive =
    "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary shadow-sm";
  const navInactive =
    "text-muted-foreground hover:text-foreground hover:bg-secondary/70";

  const tourSteps = [
    {
      title: "Deschide filtrele",
      text: "Apasă butonul de filtre (evidențiat pe fundal) pentru a deschide opțiunile. Apoi apasă «Următorul».",
      selector: "[data-tour='map-filter-button'], [data-tour='discipline-button']",
      action: "Apasă pe butonul evidențiat",
    },
    {
      title: "Alege o zonă",
      text: "Poți selecta un oraș sau un raion pentru a filtra instantaneu harta și statisticile.",
      selector: "[data-tour='city-filter']",
      action: "Deschide lista și alege un oraș",
    },
    {
      title: "Toate școlile",
      text: "Acest buton îți permite să vizualizezi pe hartă și instituțiile care momentan nu au locuri vacante.",
      selector: "[data-tour='all-schools']",
      action: "Apasă pe 'Toate școlile'",
    },
    {
      title: "Caută rapid",
      text: "Aici poți căuta direct o instituție sau o disciplină specifică.",
      selector: "[data-tour='mobile-search-button'], #site-search",
      action: "Apasă câmpul de căutare",
    },
    {
      title: "Ești gata!",
      text: "Ai descoperit funcțiile de bază. Poți reporni acest ghid oricând de la butonul cu semnul întrebării din meniu.",
      selector: null,
      action: null,
    },
  ];

  React.useEffect(() => {
    if (!tourOpen) return;
    const step = tourSteps[tourStep];
    if (!step.selector) {
      setTourTarget(null);
      return;
    }

    const updateTarget = () => {
      const element = [...document.querySelectorAll(step.selector!)].find((candidate) => {
        const rect = candidate.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      setTourTarget(element?.getBoundingClientRect() ?? null);
    };
    
    // We update target immediately
    updateTarget();
    
    // And also wait a tick for React state to flush (e.g. mobile drawer opens)
    const timer = setTimeout(updateTarget, 100);

    const advance = () => setTourStep((current) => Math.min(current + 1, tourSteps.length - 1));
    
    window.addEventListener('resize', updateTarget);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTarget);
    };
  }, [tourOpen, tourStep]);

  const closeTour = () => {
    window.localStorage.setItem("edumap-tour-completed", "true");
    setTourOpen(false);
    setTourStep(0);
  };

  const openTour = () => {
    if (location !== "/") {
      window.localStorage.removeItem("edumap-tour-completed");
      navigate("/");
      return;
    }
    setTourStep(0);
    setTourOpen(true);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] h-[100dvh] overflow-hidden bg-background text-foreground">
      {/* ── Header ── */}
      <header className="flex-shrink-0 h-12 md:h-14 border-b border-border/60 flex items-center justify-between px-4 md:px-5 bg-card/80 backdrop-blur-xl z-50 shadow-sm shadow-black/[0.04]">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-3 md:gap-5">
          <Link
            href="/"
            onClick={handleMapClick}
            className="flex items-center gap-2.5 font-bold text-base md:text-lg tracking-tight"
          >
            {/* Gradient logo mark */}
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl gradient-bg text-white flex items-center justify-center shadow-md shadow-primary/30 shrink-0">
              <Map size={15} strokeWidth={2} />
            </div>
            <span className="hidden sm:flex items-center gap-1">
              <span className="gradient-text font-extrabold">EduMap</span>
              <span className="text-foreground font-semibold">Moldova</span>
            </span>
          </Link>

          {/* Desktop nav pills */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              onClick={handleMapClick}
              className={`${navBase} ${location === "/" ? navActive : navInactive}`}
            >
              Hartă
              {location === "/" && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/15 -z-10"
                />
              )}
            </Link>
            <Link
              href="/catalog"
              onClick={() => setSearchQuery("")}
              className={`${navBase} ${location === "/catalog" ? navActive : navInactive} flex items-center gap-1.5`}
            >
              <LibraryBig size={14} strokeWidth={2} />
              Catalog
            </Link>
            <Link
              href="/insights"
              className={`${navBase} ${location === "/insights" ? navActive : navInactive} flex items-center gap-1.5`}
            >
              <BarChart2 size={14} strokeWidth={2} />
              Analytics
              {location === "/insights" && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/15 -z-10"
                />
              )}
            </Link>
            <Link
              href="/surse"
              className={`${navBase} ${location === "/surse" ? navActive : navInactive} flex items-center gap-1.5`}
            >
              <Database size={14} strokeWidth={2} />
              Surse
              {location === "/surse" && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/15 -z-10"
                />
              )}
            </Link>
            <Link
              href="/contact"
              className={`${navBase} ${location === "/contact" ? navActive : navInactive} flex items-center gap-1.5`}
            >
              <Mail size={14} strokeWidth={2} />
              Contact
              {location === "/contact" && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/15 -z-10"
                />
              )}
            </Link>
          </nav>
        </div>

        {/* Right: search + theme */}
        <div className="flex items-center gap-2">
          {hasContextSearch ? (
          <div className="w-60 hidden md:block">
            <SearchBar placeholder={isMapPage ? "Caută pe hartă..." : "Caută în catalog..."} />
          </div>
          ) : (
            <Link
              href="/"
              onClick={handleMapClick}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1.5 text-sm font-semibold text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ArrowLeft size={14} strokeWidth={2} />
              Caută pe hartă
            </Link>
          )}

          {hasContextSearch && (
            <Button
            data-tour="mobile-search-button"
            variant="ghost"
            size="icon"
            onClick={handleSearchToggle}
            aria-label={mobileSearchOpen ? "Închide căutarea" : "Deschide căutarea"}
            className="md:hidden w-8 h-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            {mobileSearchOpen ? <X size={17} strokeWidth={2} /> : <Search size={17} strokeWidth={2} />}
          </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={openTour}
            aria-label="Deschide ghidul aplicației"
            className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            <HelpCircle size={17} strokeWidth={2} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDark}
            aria-label={isDark ? "Activează tema luminoasă" : "Activează tema întunecată"}
            className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
          </Button>
        </div>
      </header>

      {/* Mobile slide-down search */}
      <AnimatePresence>
        {hasContextSearch && mobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="md:hidden overflow-hidden border-b border-border/60 bg-card/95 backdrop-blur-xl z-40 px-4 py-2.5"
          >
            <SearchBar autoFocus placeholder={isMapPage ? "Caută pe hartă..." : "Caută în catalog..."} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      <main className="flex-1 min-h-0 relative flex overflow-hidden">
        {children}
      </main>

      {/* ── Disclaimer bar ── */}
      <div className="hidden md:flex items-center justify-center gap-2 px-4 h-6 bg-muted/60 border-t border-border/40 text-[10px] text-muted-foreground shrink-0">
        <span className="inline-flex items-center gap-1">
          <span className="text-primary font-semibold">ⓘ</span>
          Acest site a fost generat cu ajutorul inteligenței artificiale și are scop exclusiv consultativ. Datele pot fi incomplete sau inexacte.
        </span>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 glass border-t z-50 flex flex-col items-stretch">
        {/* Disclaimer (mobile) */}
        <div className="flex items-center justify-center px-3 py-1 border-b border-border/30">
          <p className="text-[9px] text-muted-foreground text-center leading-tight">
            <span className="text-primary font-semibold">ⓘ</span>
            {' '}Generat cu IA · scop consultativ · datele pot fi incomplete
          </p>
        </div>
        <div className="flex h-12 items-stretch">
        <Link
          href="/"
          onClick={handleMapClick}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
            location === "/" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Map size={19} strokeWidth={location === "/" ? 2.2 : 1.8} />
          Hartă
        </Link>
        <Link
          href="/catalog"
          onClick={() => setSearchQuery("")}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
            location === "/catalog" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <LibraryBig size={19} strokeWidth={location === "/catalog" ? 2.2 : 1.8} />
          Catalog
        </Link>
        <Link
          href="/insights"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
            location === "/insights" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <BarChart2 size={19} strokeWidth={location === "/insights" ? 2.2 : 1.8} />
          Analytics
        </Link>
        <Link
          href="/surse"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
            location === "/surse" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Database size={19} strokeWidth={location === "/surse" ? 2.2 : 1.8} />
          Surse
        </Link>
        <Link
          href="/contact"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
            location === "/contact" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Mail size={19} strokeWidth={location === "/contact" ? 2.2 : 1.8} />
          Contact
        </Link>
        </div>
      </nav>

      <AnimatePresence>
        {tourOpen && (
          <div className="pointer-events-none fixed inset-0 z-[2000]">
            {tourTarget && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed rounded-xl ring-4 ring-primary ring-offset-2 ring-offset-background"
                style={{
                  left: Math.max(4, tourTarget.left - 5),
                  top: Math.max(4, tourTarget.top - 5),
                  width: tourTarget.width + 10,
                  height: tourTarget.height + 10,
                  boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.62)',
                }}
              />
            )}
            <motion.section
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`absolute z-[2000] w-[340px] rounded-2xl bg-card p-5 shadow-2xl ring-1 ring-border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                tourTarget ? "" : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              }`}
              style={tourTarget ? {
                left: Math.min(Math.max(12, tourTarget.left), Math.max(12, window.innerWidth - 364)),
                top: tourTarget.bottom + 250 < window.innerHeight ? tourTarget.bottom + 16 : Math.max(12, tourTarget.top - 245),
              } : {}}
              role="dialog"
              aria-modal="false"
              aria-labelledby="tour-title"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold tabular-nums text-primary">Pasul {tourStep + 1} din {tourSteps.length}</span>
                <button type="button" onClick={closeTour} className="rounded-lg px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground">Omite ghidul</button>
              </div>

              <div className="py-5">
                <h2 id="tour-title" className="text-lg font-extrabold tracking-tight text-foreground">{tourSteps[tourStep].title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tourSteps[tourStep].text}</p>
                {tourSteps[tourStep].action && (
                  <p className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary">{tourSteps[tourStep].action}</p>
                )}
              </div>

              <div className="mb-4 flex gap-1.5" aria-label="Progresul ghidului">
                {tourSteps.map((step, index) => (
                  <span
                    key={step.title}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${index <= tourStep ? "bg-primary" : "bg-secondary"}`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTourStep((step) => Math.max(0, step - 1))}
                  disabled={tourStep === 0}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-secondary disabled:opacity-40"
                >
                  <ChevronLeft size={16} /> Înapoi
                </button>
                {tourStep < tourSteps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setTourStep((step) => Math.min(step + 1, tourSteps.length - 1))}
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90"
                  >
                    Următorul
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={closeTour}
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90"
                  >
                    Încheie
                  </button>
                )}
              </div>
            </motion.section>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
