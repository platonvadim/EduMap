import { Link } from "wouter";
import { AlertCircle, BarChart2, Map } from "lucide-react";
import { Layout } from "@/components/Layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center bg-background px-4">
        <section className="w-full max-w-lg rounded-xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Pagina nu a fost găsită</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Linkul poate fi greșit sau pagina a fost mutată. Poți reveni la hartă sau la analiza datelor.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Map className="h-4 w-4" strokeWidth={2} />
              Înapoi la hartă
            </Link>
            <Link
              href="/insights"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary/70 px-4 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <BarChart2 className="h-4 w-4" strokeWidth={2} />
              Vezi Analytics
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
