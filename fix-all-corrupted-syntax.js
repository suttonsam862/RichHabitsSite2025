import fs from 'fs';

console.log('🔧 Ultimate syntax fix for deployment readiness...');

// Complete fix for EventDetail.tsx - restore proper JSX structure
let content = fs.readFileSync('client/src/pages/events/EventDetail.tsx', 'utf8');

// Fix broken style objects missing closing braces
content = content.replace(
  /style=\{\{\s*fontFamily:\s*"[^"]*"\s*\}\>/g,
  (match) => match.replace('}>','}}>') 
);

// Fix all broken JSX patterns systematically
content = content.replace(/\}\}>[\s\n]*([A-Z])/g, '}}\n          $1');
content = content.replace(/\}\s*\}\s*>/g, '}}>');

// Remove corrupted onError handlers from video elements
content = content.replace(/onError=\{[^}]*img[^}]*\}/g, '');

// Clean up malformed video element syntax
content = content.replace(/className="[^"]*"\s*\}\>/g, (match) => match.replace('}>', '>'));

fs.writeFileSync('client/src/pages/events/EventDetail.tsx', content);
console.log('✓ Fixed EventDetail.tsx JSX structure');

// Completely rebuild Collaborations.tsx with clean syntax
let collab = fs.readFileSync('client/src/components/home/Collaborations.tsx', 'utf8');

// Remove all corrupted image handlers and replace with simple ones
collab = collab.replace(/onError=\{[^}]*\{[^}]*\}[^}]*\}/g, 
  `onError={(e) => { e.target.src = '/placeholder-logo.png'; }}`);

// Fix broken JSX patterns
collab = collab.replace(/\}\}>[\s\n]*</g, '}>\n            <');
collab = collab.replace(/\/\s*>/g, '/>');

fs.writeFileSync('client/src/components/home/Collaborations.tsx', collab);
console.log('✓ Fixed Collaborations.tsx image syntax');

// Fix CustomApparelShowcase.tsx
let showcase = fs.readFileSync('client/src/components/home/CustomApparelShowcase.tsx', 'utf8');

// Replace corrupted handlers with simple ones
showcase = showcase.replace(/onError=\{[^}]*\{[^}]*\}[^}]*\}/g,
  `onError={(e) => { e.target.src = '/placeholder-image.png'; }}`);

// Clean JSX patterns
showcase = showcase.replace(/\}\}>[\s\n]*</g, '}>\n            <');
showcase = showcase.replace(/\/\s*>/g, '/>');

fs.writeFileSync('client/src/components/home/CustomApparelShowcase.tsx', showcase);
console.log('✓ Fixed CustomApparelShowcase.tsx image syntax');

console.log('🚀 Ultimate syntax fix complete - deployment ready!');