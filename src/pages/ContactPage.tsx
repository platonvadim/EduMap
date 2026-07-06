import { Layout } from '../components/Layout';
import { Send, Mail, ExternalLink } from 'lucide-react';

export default function ContactPage() {
  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-card border border-border/60 rounded-2xl shadow-xl shadow-black/[0.06] overflow-hidden">
            {/* Gradient header */}
            <div
              className="px-6 py-8 relative overflow-hidden"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-sm">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">Contact</h1>
                <p className="text-white/75 text-sm">Webmaster & suport tehnic</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-4">
              {/* Telegram */}
              <a
                href="https://t.me/mgmoldova"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-secondary/40 hover:bg-secondary/80 hover:border-primary/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#229ED9]/10 flex items-center justify-center shrink-0 group-hover:bg-[#229ED9]/20 transition-colors">
                  {/* Telegram icon */}
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#229ED9]">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Telegram</p>
                  <p className="text-sm font-bold text-foreground">@mgmoldova</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
              </a>

              {/* Info note */}
              <div className="flex gap-3 p-4 rounded-xl bg-accent/50 border border-primary/15">
                <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pentru întrebări legate de date, raportarea erorilor sau sugestii de îmbunătățire, contactați webmasterul prin Telegram.
                </p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-[11px] text-muted-foreground mt-5">
            EduMap Moldova · Proiect informativ generat cu IA
          </p>
        </div>
      </div>
    </Layout>
  );
}
