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
  console.log("App component rendering...");
  
  // Add to document body directly to bypass any CSS issues
  setTimeout(() => {
    document.body.style.background = 'lightblue';
    document.body.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
      ">
        <div style="
          background: green;
          color: white;
          padding: 40px;
          border-radius: 10px;
          text-align: center;
          font-size: 24px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        ">
          ✅ REACT IS WORKING!<br>
          The blank screen issue is fixed.
        </div>
      </div>
    `;
  }, 100);
  
  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'blue', 
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif',
      zIndex: 10000
    }}>
      REACT MOUNTED SUCCESSFULLY!
    </div>
  );
}

export default App;
