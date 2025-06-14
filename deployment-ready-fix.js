import fs from 'fs';

// Final deployment-ready fix for all syntax errors
console.log('🔧 Final deployment-ready syntax fix...');

// Fix EventDetail.tsx - most critical file
let eventDetail = fs.readFileSync('client/src/pages/events/EventDetail.tsx', 'utf8');

// Fix unterminated regex patterns that broke the file structure
eventDetail = eventDetail.replace(/\/\s*>/g, '/>');
eventDetail = eventDetail.replace(/\s*\}\}\s*\/>/g, '}}\n            />');

// Fix broken JSX structure around line 391
eventDetail = eventDetail.replace(
  /transition=\{\{\s*duration:\s*0\.2\s*\}\}/,
  'transition={{ duration: 0.2 }}'
);

// Remove all corrupted onError handlers and replace with clean ones
eventDetail = eventDetail.replace(
  /onError=\{[^}]*\{[^}]*\}[^}]*\}/g,
  `onError={(e) => {
        const img = e.target as HTMLImageElement;
        if (img.dataset.fallbackAttempted !== 'true') {
          img.dataset.fallbackAttempted = 'true';
          img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
        }
      }}`
);

fs.writeFileSync('client/src/pages/events/EventDetail.tsx', eventDetail);
console.log('✓ Fixed EventDetail.tsx');

// Fix Collaborations.tsx 
let collaborations = fs.readFileSync('client/src/components/home/Collaborations.tsx', 'utf8');
collaborations = collaborations.replace(/\/\s*>/g, '/>');
collaborations = collaborations.replace(
  /onError=\{[^}]*\{[^}]*\}[^}]*\}/g,
  `onError={(e) => {
    const img = e.target as HTMLImageElement;
    if (img.dataset.fallbackAttempted !== 'true') {
      img.dataset.fallbackAttempted = 'true';
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }
  }}`
);
fs.writeFileSync('client/src/components/home/Collaborations.tsx', collaborations);
console.log('✓ Fixed Collaborations.tsx');

// Fix CustomApparelShowcase.tsx
let showcase = fs.readFileSync('client/src/components/home/CustomApparelShowcase.tsx', 'utf8');
showcase = showcase.replace(/\/\s*>/g, '/>');
showcase = showcase.replace(
  /onError=\{[^}]*\{[^}]*\}[^}]*\}/g,
  `onError={(e) => {
    const img = e.target as HTMLImageElement;
    if (img.dataset.fallbackAttempted !== 'true') {
      img.dataset.fallbackAttempted = 'true';
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }
  }}`
);
fs.writeFileSync('client/src/components/home/CustomApparelShowcase.tsx', showcase);
console.log('✓ Fixed CustomApparelShowcase.tsx');

console.log('🚀 Deployment-ready syntax fix complete!');