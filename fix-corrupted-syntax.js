import fs from 'fs';

// Fix all corrupted onError handlers in EventDetail.tsx
const file = 'client/src/pages/events/EventDetail.tsx';
let content = fs.readFileSync(file, 'utf8');

console.log('Fixing corrupted onError handlers...');

// Replace all malformed onError patterns
content = content.replace(
  /onError=\{\(e\) = onError=\{\(e\) => \{[^}]*\}\}/g,
  `onError={(e) => {
    const img = e.target as HTMLImageElement;
    if (img.dataset.fallbackAttempted !== 'true') {
      img.dataset.fallbackAttempted = 'true';
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }
  }}`
);

// Fix any remaining syntax issues with corrupted handlers
content = content.replace(
  /onError=\{\(e\) = onError=\{\(e\) => \{[\s\S]*?\}\}>/g,
  `onError={(e) => {
    const img = e.target as HTMLImageElement;
    if (img.dataset.fallbackAttempted !== 'true') {
      img.dataset.fallbackAttempted = 'true';
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }
  }}`
);

fs.writeFileSync(file, content);
console.log('Fixed corrupted syntax in EventDetail.tsx');