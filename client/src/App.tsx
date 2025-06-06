import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { PageLoadingFallback } from "./components/ui/loading-fallback";
import NotFound from "./components/NotFound";
import AuthGate from "./components/AuthGate";

// Keep Home page loaded immediately for best UX (above the fold)
import Home from "./pages/Home";

// Lazy load all other pages for code splitting
const Shop = lazy(() => import("./pages/Shop"));
const Events = lazy(() => import("./pages/EventsSimple"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const EventRegistration = lazy(() => import("./pages/EventRegistration"));
const TeamRegistration = lazy(() => import("./pages/TeamRegistration"));
const StripeCheckout = lazy(() => import("./pages/StripeCheckout"));
const CustomApparel = lazy(() => import("./pages/CustomApparel"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminEditor = lazy(() => import("./pages/AdminEditor"));


function Router() {
  return (
    <Switch>
      {/* Home page loads immediately for best UX */}
      <Route path="/" component={Home} />
      
      {/* All other routes use lazy loading with Suspense */}
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

function App() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-white">
        <Router />
        <Toaster />
      </div>
    </TooltipProvider>
  );
}

export default App;
