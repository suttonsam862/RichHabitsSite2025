
import React from 'react'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// Create root element
const container = document.getElementById('root')
if (!container) {
  throw new Error('Root container not found')
}

const root = createRoot(container)

// Render with explicit JSX to help Vite plugin detect preamble
root.render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
)
