
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// Explicit JSX component to help Vite React plugin detect preamble
function AppWrapper() {
  return (
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<AppWrapper />);
} else {
  console.error('Root container not found');
}
