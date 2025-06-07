import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Enhanced error boundary with console logging
class DiagnosticErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    console.error('ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        style: {
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f3f4f6',
          fontFamily: 'system-ui'
        }
      }, 
        React.createElement('div', {
          style: { textAlign: 'center', padding: '2rem' }
        },
          React.createElement('h1', { style: { color: '#dc2626', marginBottom: '1rem' } }, 'Application Error'),
          React.createElement('p', { style: { color: '#374151' } }, this.state.error?.message || 'An error occurred'),
          React.createElement('button', {
            onClick: () => window.location.reload(),
            style: {
              background: '#3b82f6',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem'
            }
          }, 'Reload Page')
        )
      );
    }

    return this.props.children;
  }
}

// Simple test component
function TestApp() {
  console.log('TestApp rendering...');
  
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui',
      color: 'white',
      padding: '2rem'
    }
  },
    React.createElement('div', { style: { textAlign: 'center' } },
      React.createElement('h1', { style: { fontSize: '3rem', marginBottom: '1rem' } }, '⚛️ React Working'),
      React.createElement('p', { style: { fontSize: '1.25rem', marginBottom: '2rem' } }, 'Rich Habits Wrestling'),
      React.createElement('button', {
        onClick: () => {
          console.log('Loading full app...');
          loadFullApp();
        },
        style: {
          background: '#10b981',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          cursor: 'pointer'
        }
      }, 'Load Full App')
    )
  );
}

async function loadFullApp() {
  try {
    console.log('Importing full app components...');
    
    const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query');
    const AppModule = await import('./App');
    
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

    const FullApp = () => React.createElement(
      StrictMode,
      null,
      React.createElement(
        DiagnosticErrorBoundary,
        null,
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(AppModule.default, null)
        )
      )
    );

    const container = document.getElementById('root');
    const root = createRoot(container);
    root.render(React.createElement(FullApp, null));
    
    console.log('Full app loaded successfully');
  } catch (error) {
    console.error('Error loading full app:', error);
    alert('Error loading full application: ' + error.message);
  }
}

// Initialize with test app
console.log('Initializing diagnostic app...');

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    React.createElement(
      DiagnosticErrorBoundary,
      null,
      React.createElement(TestApp, null)
    )
  );
  console.log('Diagnostic app initialized');
} else {
  console.error('Root container not found');
}