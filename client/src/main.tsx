import React from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
  return React.createElement('div', {
    style: {
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
    }
  }, React.createElement('h1', {
    style: { margin: '0 0 20px 0', fontSize: '48px', fontWeight: 'bold' }
  }, '⚛️ React Successfully Loaded'))
}

const container = document.getElementById('root')
if (container) {
  const root = ReactDOM.createRoot(container)
  root.render(React.createElement(App))
}
