import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initImagePreloading } from "./services/imagePreloader";

// Initialize image preloading service
// This will start preloading critical images when the browser is idle
if (typeof window !== 'undefined') {
  // Delay initialization to prioritize initial render
  setTimeout(() => {
    initImagePreloading();
  }, 300);
}

// Add performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  const reportWebVitals = (metric: any) => {
    console.log(metric);
  };
  
  // @ts-ignore
  window.reportWebVitals = reportWebVitals;
}

createRoot(document.getElementById("root")!).render(
  <TooltipProvider>
    <App />
    <Toaster />
  </TooltipProvider>
);
