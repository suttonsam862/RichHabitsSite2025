// Bootstrap file to handle React initialization with error recovery
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Function to safely initialize React
function initializeApp() {
  try {
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Root element not found');
    }

    const root = createRoot(container);
    
    root.render(
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ErrorBoundary>
    );

    console.log('✅ React application initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize React application:', error);
    
    // Fallback to basic HTML
    const container = document.getElementById('root');
    if (container) {
      container.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f9fafb; font-family: system-ui, -apple-system, sans-serif;">
          <div style="max-width: 400px; text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #1f2937; margin-bottom: 1rem;">Rich Habits Wrestling</h1>
            <p style="color: #6b7280; margin-bottom: 1.5rem;">Application is loading...</p>
            <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer;">
              Refresh Page
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

export default initializeApp;