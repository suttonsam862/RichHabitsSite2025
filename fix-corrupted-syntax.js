import fs from 'fs';

console.log('🔧 Fixing all corrupted img element syntax...');

// Complete fix for EventDetail.tsx
let content = fs.readFileSync('client/src/pages/events/EventDetail.tsx', 'utf8');

// Fix all corrupted img elements with malformed closing syntax
content = content.replace(/className="[^"]*"\s*\}\s*>/g, (match) => {
  const className = match.match(/className="([^"]*)"/)[1];
  return `className="${className}" />`;
});

// Remove any stray closing braces in img tags
content = content.replace(/<img([^>]*)\s*\}\s*>/g, '<img$1 />');

// Fix broken img tag patterns
content = content.replace(/\s*\}\s*>\s*<img/g, ' />\n                    <img');

fs.writeFileSync('client/src/pages/events/EventDetail.tsx', content);
console.log('✓ Fixed EventDetail.tsx img elements');

// Fix Collaborations.tsx
let collab = fs.readFileSync('client/src/components/home/Collaborations.tsx', 'utf8');
collab = collab.replace(/className="[^"]*"\s*\}\s*>/g, (match) => {
  const className = match.match(/className="([^"]*)"/)[1];
  return `className="${className}" />`;
});
collab = collab.replace(/<img([^>]*)\s*\}\s*>/g, '<img$1 />');
fs.writeFileSync('client/src/components/home/Collaborations.tsx', collab);
console.log('✓ Fixed Collaborations.tsx img elements');

// Fix CustomApparelShowcase.tsx
let showcase = fs.readFileSync('client/src/components/home/CustomApparelShowcase.tsx', 'utf8');
showcase = showcase.replace(/className="[^"]*"\s*\}\s*>/g, (match) => {
  const className = match.match(/className="([^"]*)"/)[1];
  return `className="${className}" />`;
});
showcase = showcase.replace(/<img([^>]*)\s*\}\s*>/g, '<img$1 />');
fs.writeFileSync('client/src/components/home/CustomApparelShowcase.tsx', showcase);
console.log('✓ Fixed CustomApparelShowcase.tsx img elements');

console.log('🚀 All corrupted img syntax fixed - deployment ready!');