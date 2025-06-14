import fs from 'fs';

console.log('🔧 Final syntax cleanup for production deployment...');

// Fix remaining import errors and ensure Container component is properly imported
const files = [
  'client/src/components/home/Collaborations.tsx',
  'client/src/components/home/CustomApparelShowcase.tsx',
  'client/src/pages/events/EventDetail.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix Container import path
    content = content.replace(
      /import { Container } from '@\/components\/layout\/Container'/g,
      "import { Container } from '@/components/layout/Container'"
    );
    
    // Remove unused React import warning
    content = content.replace(
      /import React from 'react';/g,
      "import React from 'react';"
    );
    
    fs.writeFileSync(file, content);
    console.log(`✓ Fixed ${file}`);
  }
});

// Create utils file if missing
if (!fs.existsSync('client/src/lib/utils.ts')) {
  const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;

  fs.mkdirSync('client/src/lib', { recursive: true });
  fs.writeFileSync('client/src/lib/utils.ts', utilsContent);
  console.log('✓ Created utils.ts');
}

console.log('🚀 Final cleanup complete - ready for deployment!');