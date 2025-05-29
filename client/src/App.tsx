import React from "react";
import { Switch, Route } from "wouter";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import MaintenanceBanner from "./components/layout/MaintenanceBanner";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";

// Page imports
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Events from "./pages/EventsSimple";
import EventDetail from "./pages/EventDetail";
import EventRegistration from "./pages/EventRegistration";
import TeamRegistration from "./pages/TeamRegistration";
import StripeCheckout from "./pages/StripeCheckout";
import CustomApparel from "./pages/CustomApparel";
import Contact from "./pages/Contact";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/events" component={Events} />
      <Route path="/events/:id" component={EventDetail} />
      <Route path="/register/:id" component={EventRegistration} />
      <Route path="/team-register/:id" component={TeamRegistration} />
      <Route path="/team-registration" component={TeamRegistration} />
      <Route path="/stripe-checkout" component={StripeCheckout} />
      <Route path="/custom-apparel" component={CustomApparel} />
      <Route path="/contact" component={Contact} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Check if the current path is a special page that shouldn't show header/footer
  const pathname = window.location.pathname;
  const isSpecialPage = 
    pathname === '/redirect' || 
    pathname === '/embedded-cart';
  
  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen">
        {!isSpecialPage && <MaintenanceBanner />}
        {!isSpecialPage && <Header />}
        <main className={`flex-grow ${!isSpecialPage ? 'pt-16' : ''}`}>
          <Router />
        </main>
        {!isSpecialPage && <Footer />}
        <Toaster />
      </div>
    </TooltipProvider>
  );
}

export default App;
