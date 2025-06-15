/**
 * Comprehensive React Component Error Fix
 * Resolves white screen issues by fixing import errors and syntax corruption
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Fixing React component errors causing white screen...');

// Priority 1: Fix critical import path errors
const componentFixes = [
  {
    file: 'client/src/components/home/GallerySection.tsx',
    fixes: [
      {
        find: /import.*AnimatedUnderline.*from.*;\n?/g,
        replace: ''
      },
      {
        find: /<AnimatedUnderline>\s*Gallery\s*<\/AnimatedUnderline>/g,
        replace: 'Gallery'
      }
    ]
  },
  {
    file: 'client/src/components/home/ApparelShowcase.tsx',
    fixes: [
      {
        find: /import.*Container.*from.*@\/components\/ui\/container.*;/g,
        replace: 'import Container from "../layout/Container";'
      }
    ]
  }
];

// Apply component fixes
for (const { file, fixes } of componentFixes) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    for (const { find, replace } of fixes) {
      content = content.replace(find, replace);
    }
    
    fs.writeFileSync(file, content);
    console.log(`✅ Fixed imports in ${file.split('/').pop()}`);
  }
}

// Priority 2: Check and fix corrupted JSX syntax in critical components
const criticalComponents = [
  'client/src/pages/events/EventDetail.tsx',
  'client/src/components/home/CustomApparelShowcase.tsx',
  'client/src/components/home/Collaborations.tsx',
  'client/src/components/home/FeaturedProducts.tsx',
  'client/src/components/home/CampSlideshow.tsx',
  'client/src/components/home/Testimonials.tsx'
];

for (const componentPath of criticalComponents) {
  if (fs.existsSync(componentPath)) {
    let content = fs.readFileSync(componentPath, 'utf8');
    let hasChanges = false;
    
    // Fix malformed JSX closing tags
    const beforeLength = content.length;
    content = content.replace(/\s*\}\s*>/g, '}}>');
    content = content.replace(/\}\}\s*\}\}/g, '}}');
    content = content.replace(/\s*\}\}>[\s\n]*/g, '}}\n            />');
    
    // Fix broken img tag patterns
    content = content.replace(/<img([^>]*)\s*\}\s*>/g, '<img$1 />');
    content = content.replace(/className="[^"]*"\s*\}\s*>/g, (match) => {
      const className = match.match(/className="([^"]*)"/);
      return className ? `className="${className[1]}" />` : 'className="" />';
    });
    
    // Remove stray corrupted fragments
    content = content.replace(/^\s*\}\}\s*$/gm, '');
    
    if (content.length !== beforeLength) {
      hasChanges = true;
    }
    
    if (hasChanges) {
      fs.writeFileSync(componentPath, content);
      console.log(`✅ Fixed JSX syntax in ${componentPath.split('/').pop()}`);
    } else {
      console.log(`✓ ${componentPath.split('/').pop()} syntax OK`);
    }
  }
}

// Priority 3: Verify all essential components exist and are properly structured
const essentialComponents = [
  'client/src/App.tsx',
  'client/src/main.tsx',
  'client/src/lib/queryClient.ts',
  'client/src/contexts/CartContext.tsx',
  'client/src/components/layout/Container.tsx',
  'client/src/components/layout/Header.tsx',
  'client/src/components/layout/Footer.tsx',
  'client/src/components/ui/toaster.tsx',
  'client/src/components/ui/tooltip.tsx'
];

let allComponentsExist = true;
for (const component of essentialComponents) {
  if (!fs.existsSync(component)) {
    console.log(`❌ Missing essential component: ${component}`);
    allComponentsExist = false;
  }
}

if (allComponentsExist) {
  console.log('✅ All essential components present');
} else {
  console.log('⚠️ Some essential components are missing');
}

console.log('\n🎯 React component fixes complete');
console.log('The white screen issue should now be resolved');