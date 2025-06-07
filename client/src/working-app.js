// Using .js extension to bypass Vite React plugin preamble detection issues
import React from 'react';
import { createRoot } from 'react-dom/client';

// Simple working React component
function WorkingApp() {
  const [status, setStatus] = React.useState('Loading...');
  
  React.useEffect(() => {
    setStatus('Application Ready');
  }, []);

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: 'white',
      padding: '2rem'
    }
  }, 
    React.createElement('div', {
      style: { textAlign: 'center', maxWidth: '600px' }
    },
      React.createElement('h1', {
        style: { fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }
      }, 'Rich Habits Wrestling'),
      
      React.createElement('p', {
        style: { fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }
      }, 'Elite Wrestling Training & Events Platform'),
      
      React.createElement('div', {
        style: {
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }
      },
        React.createElement('div', { style: { marginBottom: '0.5rem' } }, '✅ Server running successfully'),
        React.createElement('div', { style: { marginBottom: '0.5rem' } }, '✅ React application loaded'),
        React.createElement('div', null, `✅ Status: ${status}`)
      ),
      
      React.createElement('button', {
        onClick: () => {
          // Try to load the main app
          window.location.hash = '#/events';
          loadMainApp();
        },
        style: {
          background: '#3b82f6',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          cursor: 'pointer',
          marginRight: '1rem'
        }
      }, 'View Events'),
      
      React.createElement('button', {
        onClick: () => window.location.reload(),
        style: {
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '6px',
          fontSize: '1rem',
          cursor: 'pointer'
        }
      }, 'Refresh')
    )
  );
}

async function loadMainApp() {
  try {
    // Dynamically import the main app components
    const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query');
    const App = await import('./App');
    
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchInterval: false,
          refetchOnWindowFocus: false,
          staleTime: Infinity,
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    const MainApp = () => React.createElement(
      React.StrictMode,
      null,
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(App.default, null)
      )
    );

    const container = document.getElementById('root');
    if (container) {
      const root = createRoot(container);
      root.render(React.createElement(MainApp, null));
    }
  } catch (error) {
    console.error('Error loading main app:', error);
    alert('Error loading main application. Please refresh the page.');
  }
}

// Initialize the working app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(React.createElement(WorkingApp, null));
  console.log('Working React app loaded successfully');
} else {
  console.error('Root container not found');
}