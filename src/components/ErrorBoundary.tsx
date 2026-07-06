import React from 'react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Eroare necunoscută',
    };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('Application error', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-md rounded-2xl border border-destructive/30 bg-card p-6 shadow-lg">
          <p className="text-sm font-bold text-destructive">Aplicația a întâmpinat o eroare</p>
          <p className="mt-2 text-sm text-muted-foreground">{this.state.message}</p>
          <button
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Reîncarcă pagina
          </button>
        </div>
      </div>
    );
  }
}
