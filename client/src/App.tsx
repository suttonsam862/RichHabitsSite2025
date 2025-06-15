import { Switch, Route } from "wouter";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { CartProvider } from "./contexts/CartContext";
import { Layout, EventLayout, RetailLayout, MinimalLayout } from "./components/layout/LayoutComposer";

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

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Layout><Home /></Layout>} />
      <Route path="/shop" component={() => <RetailLayout><Shop /></RetailLayout>} />
      <Route path="/shop/:handle" component={() => <RetailLayout><ProductDetail /></RetailLayout>} />
      <Route path="/cart" component={() => <RetailLayout><Cart /></RetailLayout>} />
      <Route path="/events" component={() => <EventLayout><Events /></EventLayout>} />
      <Route path="/events/:id" component={() => <EventLayout><EventDetail /></EventLayout>} />
      <Route path="/register/:id" component={() => <EventLayout><EventRegistration /></EventLayout>} />
      <Route path="/team-register/:id" component={() => <EventLayout><TeamRegistration /></EventLayout>} />
      <Route path="/team-registration" component={() => <EventLayout><TeamRegistration /></EventLayout>} />
      <Route path="/stripe-checkout" component={() => <MinimalLayout><StripeCheckout /></MinimalLayout>} />
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