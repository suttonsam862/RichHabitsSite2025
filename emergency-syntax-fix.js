import fs from 'fs';

console.log('🔧 Emergency syntax fix for deployment...');

// Complete fix for EventDetail.tsx - most critical
let content = fs.readFileSync('client/src/pages/events/EventDetail.tsx', 'utf8');

// Remove all corrupted onError handlers that were added to video elements
content = content.replace(/onError=\{[^}]*\{[^}]*img[^}]*\}[^}]*\}/g, '');

// Fix broken JSX structures
content = content.replace(/\}\}>[\s\n]*<source/g, '>\n            <source');
content = content.replace(/\}\}>[\s\n]*<\/video>/g, '>\n          </video>');

// Clean up malformed closing tags
content = content.replace(/\}\}\s*\/>/g, '/>');
content = content.replace(/\/\s*>/g, '/>');

// Fix specific broken patterns
content = content.replace(/\}\}\}>[\s\n]*</g, '}>\n            <');

fs.writeFileSync('client/src/pages/events/EventDetail.tsx', content);
console.log('✓ Fixed EventDetail.tsx structure');

// Fix Collaborations.tsx
let collab = fs.readFileSync('client/src/components/home/Collaborations.tsx', 'utf8');
collab = collab.replace(/onError=\{[^}]*\{[^}]*img[^}]*\}[^}]*\}/g, 
  `onError={(e) => {
    const img = e.target as HTMLImageElement;
    if (img.dataset.fallbackAttempted !== 'true') {
      img.dataset.fallbackAttempted = 'true';
      img.src = '/placeholder-logo.png';
    }
  }}`);
collab = collab.replace(/\/\s*>/g, '/>');
fs.writeFileSync('client/src/components/home/Collaborations.tsx', collab);
console.log('✓ Fixed Collaborations.tsx');

// Fix CustomApparelShowcase.tsx
let showcase = fs.readFileSync('client/src/components/home/CustomApparelShowcase.tsx', 'utf8');
showcase = showcase.replace(/onError=\{[^}]*\{[^}]*img[^}]*\}[^}]*\}/g,
  `onError={(e) => {
    const img = e.target as HTMLImageElement;
    if (img.dataset.fallbackAttempted !== 'true') {
      img.dataset.fallbackAttempted = 'true';
      img.src = '/placeholder-image.png';
    }
  }}`);
showcase = showcase.replace(/\/\s*>/g, '/>');
fs.writeFileSync('client/src/components/home/CustomApparelShowcase.tsx', showcase);
console.log('✓ Fixed CustomApparelShowcase.tsx');

console.log('🚀 Emergency syntax fix complete!');