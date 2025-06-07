// Bootstrap React application with explicit JSX patterns for Vite plugin detection
import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';
import { PageLoadingFallback } from './components/ui/loading-fallback';
import './index.css';

// Immediate imports for critical components
import Home from './pages/Home';
import NotFound from './components/NotFound';
import AuthGate from './components/AuthGate';

// Lazy load secondary pages
const Shop = lazy(() => import('./pages/Shop'));
const Events = lazy(() => import('./pages/EventsSimple'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const EventRegistration = lazy(() => import('./pages/EventRegistration'));
const TeamRegistration = lazy(() => import('./pages/TeamRegistration'));
const StripeCheckout = lazy(() => import('./pages/StripeCheckout'));
const CustomApparel = lazy(() => import('./pages/CustomApparel'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminEditor = lazy(() => import('./pages/AdminEditor'));

// Error boundary with explicit JSX
function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}

// Router component with explicit JSX
function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      <Route path="/shop">
        <Suspense fallback={<PageLoadingFallback />}>
          <Shop />
        </Suspense>
      </Route>
      
      <Route path="/events">
        <Suspense fallback={<PageLoadingFallback />}>
          <Events />
        </Suspense>
      </Route>
      
      <Route path="/events/:id">
        <Suspense fallback={<PageLoadingFallback />}>
          <EventDetail />
        </Suspense>
      </Route>
      
      <Route path="/register/:id">
        <Suspense fallback={<PageLoadingFallback />}>
          <EventRegistration />
        </Suspense>
      </Route>
      
      <Route path="/team-register/:id">
        <Suspense fallback={<PageLoadingFallback />}>
          <TeamRegistration />
        </Suspense>
      </Route>
      
      <Route path="/team-registration">
        <Suspense fallback={<PageLoadingFallback />}>
          <TeamRegistration />
        </Suspense>
      </Route>
      
      <Route path="/stripe-checkout">
        <Suspense fallback={<PageLoadingFallback />}>
          <StripeCheckout />
        </Suspense>
      </Route>
      
      <Route path="/custom-apparel">
        <Suspense fallback={<PageLoadingFallback />}>
          <CustomApparel />
        </Suspense>
      </Route>
      
      <Route path="/contact">
        <Suspense fallback={<PageLoadingFallback />}>
          <Contact />
        </Suspense>
      </Route>
      
      <Route path="/login">
        <Suspense fallback={<PageLoadingFallback />}>
          <Login />
        </Suspense>
      </Route>
      
      <Route path="/admin">
        <Suspense fallback={<PageLoadingFallback />}>
          <AuthGate requireAdmin={true}>
            <Admin />
          </AuthGate>
        </Suspense>
      </Route>
      
      <Route path="/admin/editor">
        <Suspense fallback={<PageLoadingFallback />}>
          <AuthGate requireAdmin={true}>
            <AdminEditor />
          </AuthGate>
        </Suspense>
      </Route>
      
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

// Main app component with explicit JSX
function RichHabitsApp() {
  return (
    <StrictMode>
      <AppErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <div className="min-h-screen bg-white">
              <AppRouter />
              <Toaster />
            </div>
          </TooltipProvider>
        </QueryClientProvider>
      </AppErrorBoundary>
    </StrictMode>
  );
}

// Bootstrap the application
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<RichHabitsApp />);
  console.log('Rich Habits Wrestling app loaded successfully');
} else {
  console.error('Root container element not found');
}