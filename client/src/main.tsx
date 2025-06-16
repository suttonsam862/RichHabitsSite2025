import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";

console.log("main.tsx executing");

const rootElement = document.getElementById("root");
console.log("Root element found:", rootElement);

if (!rootElement) {
  console.error("Root element not found!");
  document.body.innerHTML = '<div style="padding: 20px; background: red; color: white;">Error: Root element not found</div>';
} else {
  try {
    console.log("Creating React root...");
    const root = createRoot(rootElement);
    
    console.log("Rendering React app...");
    
    // Add error boundary to catch React errors
    window.addEventListener('error', (event) => {
      console.error('JavaScript Error:', event.error);
      console.error('Error details:', event.message, event.filename, event.lineno);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
    });
    
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </React.StrictMode>
    );
    console.log("React app rendered successfully");
  } catch (error) {
    console.error("Error rendering React app:", error);
    document.body.innerHTML = `<div style="padding: 20px; background: red; color: white;">React Error: ${error}</div>`;
  }
}
