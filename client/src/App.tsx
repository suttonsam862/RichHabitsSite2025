import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import CustomApparel from "@/pages/CustomApparel";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import EventRegistration from "@/pages/EventRegistration";
import ShopifyRedirect from "@/pages/ShopifyRedirect";
import EmbeddedCart from "@/pages/EmbeddedCart";
import AddToCart from "@/pages/AddToCart";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Admin from "@/pages/Admin";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import ReturnPolicy from "@/pages/ReturnPolicy";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/custom-apparel" component={CustomApparel} />
      <Route path="/events" component={Events} />
      <Route path="/events/:id" component={EventDetail} />
      <Route path="/events/:id/register" component={EventRegistration} />
      <Route path="/redirect" component={ShopifyRedirect} />
      <Route path="/embedded-cart" component={EmbeddedCart} />
      <Route path="/add-to-cart" component={AddToCart} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin" component={Admin} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/return-policy" component={ReturnPolicy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Check if the current path is a special page that shouldn't show header/footer
  const pathname = window.location.pathname;
  const isSpecialPage = 
    pathname === '/redirect' || 
    pathname === '/embedded-cart' || 
    pathname === '/add-to-cart';
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        {!isSpecialPage && <Header />}
        <main className={`flex-grow ${!isSpecialPage ? 'pt-16' : ''}`}>
          <Router />
        </main>
        {!isSpecialPage && <Footer />}
      </div>
    </QueryClientProvider>
  );
}

export default App;
