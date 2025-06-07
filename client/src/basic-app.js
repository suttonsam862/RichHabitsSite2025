// Basic vanilla React without JSX transform to bypass SWC issues
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

const h = createElement;

function App() {
  return h('div', { 
    className: 'min-h-screen bg-white flex items-center justify-center p-8' 
  }, [
    h('div', { 
      key: 'main',
      className: 'max-w-4xl mx-auto text-center' 
    }, [
      h('h1', { 
        key: 'title',
        className: 'text-4xl font-bold text-gray-900 mb-6' 
      }, 'Rich Habits Wrestling'),
      
      h('p', { 
        key: 'subtitle',
        className: 'text-xl text-gray-600 mb-12' 
      }, 'Elite Wrestling Event Management Platform'),
      
      h('div', { 
        key: 'cards',
        className: 'grid md:grid-cols-3 gap-8' 
      }, [
        h('div', { 
          key: 'events',
          className: 'bg-blue-50 p-6 rounded-lg border' 
        }, [
          h('h2', { 
            key: 'events-title',
            className: 'text-xl font-semibold text-blue-900 mb-2' 
          }, 'Wrestling Events'),
          h('p', { 
            key: 'events-desc',
            className: 'text-blue-700' 
          }, 'Manage tournaments and competitions')
        ]),
        
        h('div', { 
          key: 'shop',
          className: 'bg-green-50 p-6 rounded-lg border' 
        }, [
          h('h2', { 
            key: 'shop-title',
            className: 'text-xl font-semibold text-green-900 mb-2' 
          }, 'Wrestling Gear'),
          h('p', { 
            key: 'shop-desc',
            className: 'text-green-700' 
          }, 'Browse premium equipment and apparel')
        ]),
        
        h('div', { 
          key: 'admin',
          className: 'bg-purple-50 p-6 rounded-lg border' 
        }, [
          h('h2', { 
            key: 'admin-title',
            className: 'text-xl font-semibold text-purple-900 mb-2' 
          }, 'Administration'),
          h('p', { 
            key: 'admin-desc',
            className: 'text-purple-700' 
          }, 'Event management dashboard')
        ])
      ]),
      
      h('div', { 
        key: 'status',
        className: 'mt-12 p-4 bg-green-100 rounded-lg inline-block' 
      }, [
        h('span', { 
          key: 'status-text',
          className: 'text-green-800 font-medium' 
        }, '✓ Application Running Successfully')
      ])
    ])
  ]);
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(h(App));
}