import fs from 'fs';

// Fix corrupted onError handlers across multiple files
const filesToFix = [
  'client/src/components/home/Collaborations.tsx',
  'client/src/components/home/CustomApparelShowcase.tsx'
];

console.log('Fixing all corrupted onError handlers...');

const correctOnErrorHandler = `onError={(e) => {
  const img = e.target as HTMLImageElement;
  if (img.dataset.fallbackAttempted !== 'true') {
    img.dataset.fallbackAttempted = 'true';
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }
}}`;

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Pattern 1: Fix malformed onError with double assignment
    content = content.replace(
      /onError=\{\(e\) = onError=\{\(e\) => \{[\s\S]*?\}\}>/g,
      correctOnErrorHandler
    );
    
    // Pattern 2: Fix incomplete onError patterns
    content = content.replace(
      /onError=\{\(e\) = onError=\{\(e\) => \{[^}]*\}\}/g,
      correctOnErrorHandler
    );
    
    // Pattern 3: Fix any remaining malformed patterns
    content = content.replace(
      /onError=\{[^}]*= onError=\{[^}]*\}/g,
      correctOnErrorHandler
    );
    
    fs.writeFileSync(file, content);
    console.log(`Fixed: ${file}`);
  }
});

console.log('All syntax errors fixed!');