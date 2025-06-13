import { Switch, Route } from "wouter";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import MaintenanceBanner from "./components/layout/MaintenanceBanner";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { CartProvider } from "./contexts/CartContext";

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
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/shop/:handle" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
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
      <CartProvider>
        <div className="flex flex-col min-h-screen">
          {!isSpecialPage && <MaintenanceBanner />}
          {!isSpecialPage && <Header />}
          <main className={`flex-grow ${!isSpecialPage ? 'pt-16' : ''}`}>
            <Router />
          </main>
          {!isSpecialPage && <Footer />}
          <Toaster />
        </div>
      </CartProvider>
    </TooltipProvider>
  );
}

export default App;
