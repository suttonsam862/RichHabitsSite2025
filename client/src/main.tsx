import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Simple React component using JSX
function App() {
  return (
    <div style={{
      padding: '50px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontSize: '28px',
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ margin: '0 0 20px 0', fontSize: '48px', fontWeight: 'bold' }}>
        ⚛️ React Successfully Loaded
      </h1>
      <p style={{ margin: '0', opacity: 0.9 }}>
        React + JSX + Vite working properly
      </p>
      <button 
        onClick={() => window.location.reload()}
        style={{
          marginTop: '30px',
          padding: '15px 30px',
          background: 'rgba(255,255,255,0.2)',
          border: '2px solid white',
          color: 'white',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '18px'
        }}
      >
        Reload Page
      </button>
    </div>
  );
}

// Mount React app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
