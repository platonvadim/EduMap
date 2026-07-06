import { lazy, Suspense } from 'react';
import { Switch, Route, Router as WouterRouter } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const HomePage = lazy(() => import('@/pages/HomePage'));
const InsightsPage = lazy(() => import('@/pages/InsightsPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
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
        <Route path="/contact" component={ContactPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
