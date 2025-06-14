import fs from 'fs';

// Comprehensive syntax repair for deployment blocking errors
const files = [
  'client/src/pages/events/EventDetail.tsx',
  'client/src/components/home/Collaborations.tsx', 
  'client/src/components/home/CustomApparelShowcase.tsx'
];

console.log('🔧 Comprehensive syntax repair for deployment...');

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    const originalLength = content.length;
    
    // Remove all corrupted onError patterns with nested braces
    content = content.replace(/onError=\{[^}]*\{[^}]*\{[^}]*\}/g, 
      `onError={(e) => {
        const img = e.target as HTMLImageElement;
        if (img.dataset.fallbackAttempted !== 'true') {
          img.dataset.fallbackAttempted = 'true';
          img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
        }
      }}`);
    
    // Fix malformed JSX closing patterns
    content = content.replace(/\}\}\s*\}\}/g, '}}');
    content = content.replace(/\s*\}\}>[\s\n]*/g, '\n');
    content = content.replace(/\}\s*\}\s*>/g, '}}>');
    
    // Remove stray corrupted fragments
    content = content.replace(/^\s*\}\}\s*$/gm, '');
    content = content.replace(/\s*e\.currentTarget\.style\.display.*?hidden.*?\n/g, '');
    
    // Clean up broken onError assignments
    content = content.replace(/onError=\{[^}]*= onError=\{[^}]*\}/g, 
      `onError={(e) => {
        const img = e.target as HTMLImageElement;
        if (img.dataset.fallbackAttempted !== 'true') {
          img.dataset.fallbackAttempted = 'true';
          img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
        }
      }}`);
    
    fs.writeFileSync(file, content);
    console.log(`✓ Repaired: ${file} (${originalLength - content.length} corrupted characters removed)`);
  }
});

console.log('🚀 Comprehensive syntax repair complete!');