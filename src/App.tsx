import { lazy, Suspense } from 'react';
import { Switch, Route, Router as WouterRouter } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { HelmetProvider } from 'react-helmet-async';

const HomePage = lazy(() => import('@/pages/HomePage'));
const InsightsPage = lazy(() => import('@/pages/InsightsPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const CatalogPage = lazy(() => import('@/pages/CatalogPage'));
const SourcesPage = lazy(() => import('@/pages/SourcesPage'));
const NotFound = lazy(() => import('@/pages/not-found'));

function RouteFallback() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        Se încarcă...
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/insights" component={InsightsPage} />
        <Route path="/catalog" component={CatalogPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/surse" component={SourcesPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function getRouterBase() {
  const base = import.meta.env.BASE_URL;
  if (!base || base === '/' || base === './') return '';
  return base.replace(/\/$/, '');
}

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <TooltipProvider>
          <WouterRouter base={getRouterBase()}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
