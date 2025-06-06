import { createRoot } from 'react-dom/client';

function TestApp() {
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
        ✅ JSX File Working
      </h1>
      <p style={{ margin: '0', opacity: 0.9 }}>
        React via .jsx file extension
      </p>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<TestApp />);
}