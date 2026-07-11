import { Layout } from '../components/Layout';
import { Database, Link as LinkIcon, Info, ExternalLink } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function SourcesPage() {
  return (
    <Layout>
      <Helmet>
        <title>Surse de Date | EduMap Moldova</title>
        <meta name="description" content="Informații despre sursele de date utilizate pe EduMap Moldova pentru posturile vacante din educație și catalogul școlilor." />
      </Helmet>
      <div className="flex-1 overflow-y-auto bg-background px-4 py-6 md:py-10">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" /> Surse de date
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Proiectul EduMap Moldova prelucrează date din surse publice pentru a oferi o imagine centralizată asupra
              instituțiilor de învățământ și a deficitului de cadre didactice.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Vacancies Source */}
            <section className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Info className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Locuri vacante</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Datele privind locurile vacante din instituțiile de învățământ general sunt extrase de pe site-ul Ministerului Educației și Cercetării (MEC).
              </p>
              <a
                href="https://mec.gov.md/ro/content/anunt-401"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mb-4"
              >
                MEC - Funcții vacante <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <div className="rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
                <strong>Notă:</strong> Listele sunt periodice și pot fi incomplete. Date actualizate la: <strong>11/07/2026</strong>.
              </div>
            </section>

            {/* Institutions Source */}
            <section className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Database className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Instituții de învățământ</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Lista de școli, locația geografică a acestora, datele de contact și alte metadate sunt extrase din registrul public CTICE. Setul nostru cuprinde peste 1,140 de instituții de la nivel național.
              </p>
              <a
                href="https://ctice.md/harta/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                CTICE - Harta Școlilor <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </section>
          </div>
          
          <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
            <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" /> Modul de procesare
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Deoarece sursa de locuri vacante și sursa instituțiilor sunt distincte și folosesc denumiri uneori diferite
              pentru aceeași școală, platforma folosește algoritmi euristici pentru a potrivi automat posturile vacante
              cu locația pe hartă a școlii aferente. Astfel, unele poziții ar putea avea marcaje "aproximative" (pe centrul localității)
              dacă potrivirea exactă nu a fost posibilă.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
