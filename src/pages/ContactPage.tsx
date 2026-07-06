import { Layout } from '../components/Layout';
import { Send, Mail, ExternalLink, AlertCircle, ClipboardList } from 'lucide-react';

export default function ContactPage() {
  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-background px-4 py-6 md:py-10">
        <div className="mx-auto w-full max-w-4xl">
          <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Send className="h-6 w-6" strokeWidth={2} />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Contact</h1>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    EduMap Moldova este un proiect informativ. Pentru corectarea datelor, întrebări tehnice sau sugestii de îmbunătățire, contactează webmasterul.
                  </p>
                </div>
              </div>

              <a
                href="https://t.me/mgmoldova"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-xl border border-border/60 bg-secondary/40 p-4 transition-colors hover:border-primary/40 hover:bg-accent group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Send className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Telegram</p>
                  <p className="text-sm font-bold text-foreground">@mgmoldova</p>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary" strokeWidth={2} />
              </a>

              <div className="mt-5 rounded-xl border border-primary/15 bg-accent/45 p-4">
                <div className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Nu trimite date personale sensibile. Pentru o eroare, este suficientă localitatea, instituția, disciplina și o scurtă descriere.
                  </p>
                </div>
              </div>
            </section>

            <aside className="space-y-5">
              <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" strokeWidth={2} />
                  <h2 className="text-sm font-bold text-foreground">Ce să incluzi</h2>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Localitatea și instituția vizată.</li>
                  <li>Disciplina sau postul unde apare problema.</li>
                  <li>Captură de ecran sau link, dacă este disponibil.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" strokeWidth={2} />
                  <h2 className="text-sm font-bold text-foreground">Despre date</h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Datele sunt afișate în scop consultativ și pot conține întârzieri, dubluri sau denumiri neuniforme. Verifică informația cu instituția responsabilă înainte de orice decizie.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
}
