import { Switch, Route } from "wouter";
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
