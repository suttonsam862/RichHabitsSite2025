import fs from 'fs';

// Final comprehensive syntax cleanup for deployment
const file = 'client/src/pages/events/EventsSimple.tsx';
let content = fs.readFileSync(file, 'utf8');

console.log('🔧 Final syntax cleanup for EventsSimple.tsx...');

// Remove all stray }}> patterns that are breaking JSX
content = content.replace(/\s*\}\}>[\s\n]*/g, '\n');

// Fix any remaining malformed closing patterns
content = content.replace(/\}\}\s*\/>/g, '}}\n    />');

// Clean up any double closing braces followed by JSX
content = content.replace(/\}\}\s*\n\s*\}\}/g, '}}');

// Remove any orphaned closing JSX fragments
content = content.replace(/^\s*\}\}>.*$/gm, '');

fs.writeFileSync(file, content);
console.log('✅ Final syntax cleanup complete');