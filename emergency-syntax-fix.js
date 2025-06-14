import fs from 'fs';

// Emergency syntax fix for deployment-blocking errors
const files = [
  'client/src/components/home/Collaborations.tsx',
  'client/src/components/home/CustomApparelShowcase.tsx',
  'client/src/pages/events/EventDetail.tsx'
];

console.log('🔧 Emergency syntax repair for deployment...');

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove all corrupted onError patterns and replace with clean handlers
    content = content.replace(
      /onError=\{[^}]*\{[^}]*\{[^}]*\}/g,
      `onError={(e) => {
        const img = e.target as HTMLImageElement;
        if (img.dataset.fallbackAttempted !== 'true') {
          img.dataset.fallbackAttempted = 'true';
          img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
        }
      }}`
    );
    
    // Fix malformed JSX patterns
    content = content.replace(/\}\}\s*\{/g, '}}');
    content = content.replace(/\s*\.\.\.[^}]*\}/g, '');
    content = content.replace(/Cannot find name 'e'/g, '');
    
    // Clean up any stray brackets
    content = content.replace(/\}\}\}+/g, '}}');
    content = content.replace(/\{\{\{+/g, '{{');
    
    fs.writeFileSync(file, content);
    console.log(`✓ Fixed: ${file}`);
  }
});

console.log('🚀 Emergency syntax repair complete!');