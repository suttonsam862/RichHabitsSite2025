// @ts-nocheck
/* eslint-disable */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import App from './App';
import './index.css';

// Force React import to be used for JSX transform detection
const ReactElement = React.createElement;

function Root() {
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
  root.render(React.createElement(Root, null));
} else {
  console.error('Root element not found');
}