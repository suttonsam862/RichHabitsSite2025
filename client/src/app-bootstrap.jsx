import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import App from './App';
import './index.css';

// Using .jsx extension and explicit React import to ensure proper detection
function AppBootstrap() {
  return React.createElement(
    React.StrictMode,
    null,
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(App, null)
    )
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(React.createElement(AppBootstrap, null));
  console.log('Rich Habits Wrestling app initialized');
} else {
  console.error('Root container not found');
}