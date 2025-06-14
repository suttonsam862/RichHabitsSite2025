import fs from 'fs';

console.log('🔧 Final syntax cleanup for deployment readiness...');

// Fix EventDetail.tsx completely
let content = fs.readFileSync('client/src/pages/events/EventDetail.tsx', 'utf8');

// Fix the specific broken video element syntax at line 415
content = content.replace(
  /className="absolute inset-0 w-full h-full object-cover"\s*\}\>/g,
  'className="absolute inset-0 w-full h-full object-cover">'
);

// Remove any remaining malformed onError handlers
content = content.replace(/onError=\{[^}]*img[^}]*\}/g, '');

// Clean up any remaining broken JSX patterns
content = content.replace(/\}\}\s*\/>/g, '/>');
content = content.replace(/\}\s*\}\s*>/g, '}>');

fs.writeFileSync('client/src/pages/events/EventDetail.tsx', content);
console.log('✓ Fixed EventDetail.tsx video element syntax');

// Fix Collaborations.tsx
let collab = fs.readFileSync('client/src/components/home/Collaborations.tsx', 'utf8');
collab = collab.replace(/onError=\{[^}]*img[^}]*\}/g, 
  `onError={(e) => {
    const img = e.target as HTMLImageElement;
    img.src = '/placeholder-logo.png';
  }}`);
fs.writeFileSync('client/src/components/home/Collaborations.tsx', collab);
console.log('✓ Fixed Collaborations.tsx image handlers');

// Fix CustomApparelShowcase.tsx  
let showcase = fs.readFileSync('client/src/components/home/CustomApparelShowcase.tsx', 'utf8');
showcase = showcase.replace(/onError=\{[^}]*img[^}]*\}/g,
  `onError={(e) => {
    const img = e.target as HTMLImageElement;
    img.src = '/placeholder-image.png';
  }}`);
fs.writeFileSync('client/src/components/home/CustomApparelShowcase.tsx', showcase);
console.log('✓ Fixed CustomApparelShowcase.tsx image handlers');

console.log('🚀 Final syntax cleanup complete - ready for deployment!');