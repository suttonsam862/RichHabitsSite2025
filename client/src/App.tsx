import { Switch, Route } from "wouter";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { CartProvider } from "./contexts/CartContext";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import MaintenanceBanner from "./components/layout/MaintenanceBanner";
import React from "react";

// Page imports - organized by business logic
import Home from "./pages/Home";
import CustomApparel from "./pages/CustomApparel";
import Contact from "./pages/Contact";
import NotFound from "./pages/not-found";

// Retail pages (Shopify integration)
import Shop from "./pages/retail/Shop";
import ProductDetail from "./pages/retail/ProductDetail";
import Cart from "./pages/retail/Cart";

// Event pages (Stripe + internal DB)
import Events from "./pages/events/EventsSimple";
import EventDetail from "./pages/events/EventDetail";
import EventRegistration from "./pages/events/EventRegistration";
import TeamRegistration from "./pages/events/TeamRegistration";
import StripeCheckout from "./pages/events/StripeCheckout";

function Layout({ children, minimal = false }: { children: React.ReactNode; minimal?: boolean }) {
  return (
    <div className="flex flex-col min-h-screen">
      {!minimal && <MaintenanceBanner />}
      {!minimal && <Header />}
      <main className={`flex-grow ${!minimal ? 'pt-16' : ''}`}>
        {children}
      </main>
      {!minimal && <Footer />}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Layout><Home /></Layout>} />
      <Route path="/shop" component={() => <Layout><Shop /></Layout>} />
      <Route path="/shop/:handle" component={() => <Layout><ProductDetail /></Layout>} />
      <Route path="/cart" component={() => <Layout><Cart /></Layout>} />
      <Route path="/events" component={() => <Layout><Events /></Layout>} />
      <Route path="/events/:id" component={() => <Layout><EventDetail /></Layout>} />
      <Route path="/register/:id" component={() => <Layout><EventRegistration /></Layout>} />
      <Route path="/team-register/:id" component={() => <Layout><TeamRegistration /></Layout>} />
      <Route path="/team-registration" component={() => <Layout><TeamRegistration /></Layout>} />
      <Route path="/stripe-checkout" component={() => <Layout minimal><StripeCheckout /></Layout>} />
      <Route path="/custom-apparel" component={() => <Layout><CustomApparel /></Layout>} />
      <Route path="/contact" component={() => <Layout><Contact /></Layout>} />
      <Route component={() => <Layout><NotFound /></Layout>} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <CartProvider>
        <Router />
        <Toaster />
      </CartProvider>
    </TooltipProvider>
  );
}

export default App;