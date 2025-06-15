/**
 * Revert Icon Imports - Restore original imports and use simpler approach
 */

import fs from 'fs';
import path from 'path';

console.log('Reverting malformed icon imports...');

// Find all files with malformed icon imports
function findFilesWithMalformedImports(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist')) {
      findFilesWithMalformedImports(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('lucide-react/dist/esm/icons/')) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

// Extract icon names from malformed imports
function extractIconsFromMalformedImports(content) {
  const importMatches = content.match(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]lucide-react\/dist\/esm\/icons\/[^'"]+['"];?/g);
  if (!importMatches) return [];
  
  const icons = new Set();
  importMatches.forEach(match => {
    const iconMatch = match.match(/\{\s*([^}]+)\s*\}/);
    if (iconMatch) {
      const iconNames = iconMatch[1].split(',').map(icon => icon.trim());
      iconNames.forEach(icon => icons.add(icon));
    }
  });
  
  return Array.from(icons);
}

// Restore original lucide-react imports
function restoreOriginalImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const usedIcons = extractIconsFromMalformedImports(content);
  
  if (usedIcons.length === 0) return;
  
  // Remove malformed imports
  content = content.replace(/import\s*\{\s*[^}]+\s*\}\s*from\s*['"]lucide-react\/dist\/esm\/icons\/[^'"]+['"];?\s*\n?/g, '');
  
  // Add single lucide-react import
  const originalImport = `import { ${usedIcons.join(', ')} } from "lucide-react";`;
  
  // Find where to insert the import
  const lines = content.split('\n');
  let insertIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      insertIndex = i + 1;
    } else if (lines[i].trim() === '' && insertIndex > 0) {
      break;
    }
  }
  
  lines.splice(insertIndex, 0, originalImport);
  content = lines.join('\n');
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Restored ${path.basename(filePath)}: ${usedIcons.join(', ')}`);
}

// Process all files with malformed imports
const filesWithMalformedImports = findFilesWithMalformedImports('client/src');
console.log(`Found ${filesWithMalformedImports.length} files with malformed imports`);

filesWithMalformedImports.forEach(filePath => {
  try {
    restoreOriginalImports(filePath);
  } catch (error) {
    console.log(`⚠️ Could not process ${filePath}: ${error.message}`);
  }
});

console.log('\n✨ Icon imports restored to original format!');