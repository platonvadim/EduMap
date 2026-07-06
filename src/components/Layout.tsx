import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { SearchBar } from "./SearchBar";
import { Map, BarChart2, Sun, Moon, Search, X, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "../store/useStore";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isDark, setIsDark] = React.useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { setSearchQuery, setFilter, searchQuery } = useStore();
  const isMapPage = location === "/";

  const toggleDark = () => {
    const isDarkMode = document.documentElement.classList.toggle("dark");
    setIsDark(isDarkMode);
  };

  function handleMapClick() {
    setSearchQuery("");
    setFilter("category", null);
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
          {isMapPage ? (
          <div className="w-60 hidden md:block">
            <SearchBar />
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

          {isMapPage && (
            <Button
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
        {isMapPage && mobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="md:hidden overflow-hidden border-b border-border/60 bg-card/95 backdrop-blur-xl z-40 px-4 py-2.5"
          >
            <SearchBar autoFocus />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      <main className="flex-1 relative flex overflow-hidden pb-[72px] md:pb-6">
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t z-50 flex flex-col items-stretch">
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
          href="/insights"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
            location === "/insights" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <BarChart2 size={19} strokeWidth={location === "/insights" ? 2.2 : 1.8} />
          Analytics
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
    </div>
  );
}
