/**
 * Bulletproof Image Hardening Script
 * Systematically hardens all vulnerable img tags with foolproof error handling
 */

const fs = require('fs');

// Universal bulletproof fallback that always works
const universalFallback = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==`;

// Bulletproof error handler template
const bulletproofHandler = `onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        if (img.dataset.fallbackAttempted !== 'true') {
                          img.dataset.fallbackAttempted = 'true';
                          img.src = '${universalFallback}';
                        }
                      }}`;

// List of all vulnerable components that need hardening
const vulnerableComponents = [
  {
    file: 'client/src/components/home/CustomApparelShowcase.tsx',
    patterns: [
      { old: /onError=\{[^}]*e\.currentTarget\.onerror[^}]*\}/g, new: bulletproofHandler }
    ]
  },
  {
    file: 'client/src/components/home/ApparelShowcase.tsx',
    patterns: [
      { old: /onError=\{[^}]*\}/g, new: bulletproofHandler }
    ]
  },
  {
    file: 'client/src/components/home/CampSlideshow.tsx',
    patterns: [
      { old: /<img([^>]*src=[^>]*)>/g, new: '<img$1 ' + bulletproofHandler + '>' }
    ]
  }
];

console.log('🔒 Bulletproof Image Hardening');
console.log('='.repeat(40));

// Apply hardening to each component
vulnerableComponents.forEach(component => {
  if (fs.existsSync(component.file)) {
    let content = fs.readFileSync(component.file, 'utf8');
    let modified = false;
    
    component.patterns.forEach(pattern => {
      if (pattern.old.test(content)) {
        content = content.replace(pattern.old, pattern.new);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(component.file, content);
      console.log('✅ Hardened:', component.file.split('/').pop());
    } else {
      console.log('⚠️ No patterns found:', component.file.split('/').pop());
    }
  }
});

console.log('\n🔒 Bulletproof hardening complete');