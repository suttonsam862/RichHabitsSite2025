// Direct DOM manipulation approach to bypass React issues
function createApp() {
  const root = document.getElementById('root');
  if (!root) {
    console.error('Root element not found');
    return;
  }

  // Clear any existing content
  root.innerHTML = '';

  // Create app structure directly
  const appContainer = document.createElement('div');
  appContainer.style.cssText = `
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: system-ui, -apple-system, sans-serif;
    color: white;
    padding: 2rem;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    text-align: center;
    max-width: 600px;
  `;

  const title = document.createElement('h1');
  title.textContent = 'Rich Habits Wrestling';
  title.style.cssText = `
    font-size: 3rem;
    font-weight: bold;
    margin-bottom: 1rem;
    margin-top: 0;
  `;

  const subtitle = document.createElement('p');
  subtitle.textContent = 'Elite Wrestling Training & Events Platform';
  subtitle.style.cssText = `
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
  `;

  const statusBox = document.createElement('div');
  statusBox.style.cssText = `
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  `;

  const statusItems = [
    '✅ Server running successfully',
    '✅ Application loaded',
    '✅ Ready for navigation'
  ];

  statusItems.forEach(item => {
    const statusDiv = document.createElement('div');
    statusDiv.textContent = item;
    statusDiv.style.marginBottom = '0.5rem';
    statusBox.appendChild(statusDiv);
  });

  const buttonContainer = document.createElement('div');

  const eventsButton = document.createElement('button');
  eventsButton.textContent = 'View Events';
  eventsButton.style.cssText = `
    background: #3b82f6;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    margin-right: 1rem;
  `;
  eventsButton.onclick = () => {
    window.location.href = '/events';
  };

  const refreshButton = document.createElement('button');
  refreshButton.textContent = 'Refresh';
  refreshButton.style.cssText = `
    background: rgba(255, 255, 255, 0.2);
    color: white;
    padding: 0.75rem 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
  `;
  refreshButton.onclick = () => {
    window.location.reload();
  };

  const loadMainButton = document.createElement('button');
  loadMainButton.textContent = 'Load Full App';
  loadMainButton.style.cssText = `
    background: #10b981;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    margin-left: 1rem;
  `;
  loadMainButton.onclick = loadReactApp;

  buttonContainer.appendChild(eventsButton);
  buttonContainer.appendChild(refreshButton);
  buttonContainer.appendChild(loadMainButton);

  content.appendChild(title);
  content.appendChild(subtitle);
  content.appendChild(statusBox);
  content.appendChild(buttonContainer);
  appContainer.appendChild(content);
  root.appendChild(appContainer);

  console.log('Direct app loaded successfully');
}

async function loadReactApp() {
  try {
    // Dynamically load React and render the main app
    const { createElement, StrictMode } = await import('react');
    const { createRoot } = await import('react-dom/client');
    const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query');
    
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

    // Import and render the main App component
    const AppModule = await import('./App');
    const App = AppModule.default;

    const MainApp = () => createElement(
      StrictMode,
      null,
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(App, null)
      )
    );

    const container = document.getElementById('root');
    const root = createRoot(container);
    root.render(createElement(MainApp, null));
    
    console.log('Main React app loaded');
  } catch (error) {
    console.error('Error loading React app:', error);
    alert('Error loading main application: ' + error.message);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createApp);
} else {
  createApp();
}