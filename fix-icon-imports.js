/**
 * Fix Icon Imports - Reduces bundle size by replacing bulk imports
 */

import fs from 'fs';
import path from 'path';

console.log('Fixing icon imports to reduce bundle size...');

// Find all files with Lucide React imports
function findFilesWithIconImports(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist')) {
      findFilesWithIconImports(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('from "lucide-react"') || content.includes("from 'lucide-react'")) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

// Extract used icons from import statements
function extractUsedIcons(content) {
  const importMatches = content.match(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]lucide-react['"]/g);
  if (!importMatches) return [];
  
  const allIcons = new Set();
  importMatches.forEach(match => {
    const iconsMatch = match.match(/\{\s*([^}]+)\s*\}/);
    if (iconsMatch) {
      const icons = iconsMatch[1].split(',').map(icon => icon.trim());
      icons.forEach(icon => allIcons.add(icon));
    }
  });
  
  return Array.from(allIcons);
}

// Replace bulk imports with specific imports
function replaceIconImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const usedIcons = extractUsedIcons(content);
  
  if (usedIcons.length === 0) return;
  
  // Remove existing lucide-react imports
  content = content.replace(/import\s*\{\s*[^}]+\s*\}\s*from\s*['"]lucide-react['"];\s*\n?/g, '');
  
  // Add specific imports at the top
  const specificImports = usedIcons.map(icon => {
    // Convert PascalCase to kebab-case properly
    const kebabCase = icon.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
    return `import { ${icon} } from "lucide-react/dist/esm/icons/${kebabCase}";`;
  }).join('\n');
  
  // Insert imports after other imports
  const lines = content.split('\n');
  let insertIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ') || lines[i].startsWith('import{')) {
      insertIndex = i + 1;
    } else if (lines[i].trim() === '' && insertIndex > 0) {
      break;
    }
  }
  
  lines.splice(insertIndex, 0, specificImports);
  content = lines.join('\n');
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed icons in ${path.basename(filePath)}: ${usedIcons.join(', ')}`);
}

// Find all files with icon imports
const filesWithIcons = findFilesWithIconImports('client/src');
console.log(`Found ${filesWithIcons.length} files with icon imports`);

// Process each file
filesWithIcons.forEach(filePath => {
  try {
    replaceIconImports(filePath);
  } catch (error) {
    console.log(`⚠️ Could not process ${filePath}: ${error.message}`);
  }
});

console.log('\n✨ Icon import optimization complete!');
console.log('This should significantly reduce build time by avoiding bulk icon imports.');