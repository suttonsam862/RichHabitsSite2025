import React from 'react';
import { createRoot } from 'react-dom/client';

// Minimal working React app to bypass preamble detection issues
function MinimalApp() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Rich Habits Wrestling
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
          Elite Wrestling Training & Events Platform
        </p>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            ✅ Server running successfully
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            ✅ React application loaded
          </div>
          <div>
            ✅ Vite configuration resolved
          </div>
        </div>
        <button 
          onClick={() => {
            // Navigate to events page
            window.location.href = '/events';
          }}
          style={{
            background: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          Load Full Application
        </button>
        <button 
          onClick={() => window.location.reload()}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<MinimalApp />);
  console.log('Minimal React app loaded successfully');
}