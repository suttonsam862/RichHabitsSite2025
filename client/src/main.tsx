
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App-clean';
import './index.css';

window.addEventListener('error', e => console.error('[CLIENT ERROR]', e));
window.addEventListener('unhandledrejection', e => console.error('[UNHANDLED REJECTION]', e.reason));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </React.StrictMode>
);
