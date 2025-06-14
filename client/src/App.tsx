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
  
  try {
    return (
      <div style={{ 
        background: 'white', 
        minHeight: '100vh', 
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ 
          background: 'red', 
          color: 'white', 
          padding: '20px', 
          fontSize: '24px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          ✅ SUCCESS: React App is now working!
        </div>
        <div style={{ 
          background: '#f0f0f0', 
          padding: '20px', 
          borderRadius: '8px',
          fontSize: '18px'
        }}>
          <h1 style={{ margin: '0 0 20px 0', color: '#333' }}>Rich Habits Wrestling</h1>
          <p style={{ margin: '0 0 10px 0' }}>Current path: {window.location.pathname}</p>
          <p style={{ margin: '0' }}>React application is successfully mounting and rendering.</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in App component:", error);
    return (
      <div style={{ 
        background: 'red', 
        color: 'white', 
        padding: '20px', 
        fontSize: '18px' 
      }}>
        Error: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }
}

export default App;
