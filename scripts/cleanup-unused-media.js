
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Define media directories to scan
const mediaDirs = [
  path.join(rootDir, 'public'),
  path.join(rootDir, 'public/assets'),
  path.join(rootDir, 'public/images'),
  path.join(rootDir, 'public/videos'),
  path.join(rootDir, 'public/designs'),
  path.join(rootDir, 'client/src/assets'),
];

// Define source directories to scan for references
const sourceDirs = [
  path.join(rootDir, 'client/src'),
  path.join(rootDir, 'server'),
];

// Media file extensions
const mediaExtensions = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp',
  '.mp4', '.webm', '.mov', '.avi', '.mkv'
];

// Get all media files
function getAllMediaFiles(dirs) {
  const mediaFiles = new Set();
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    
    function scanDirectory(dirPath) {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          scanDirectory(itemPath);
        } else {
          const ext = path.extname(item).toLowerCase();
          if (mediaExtensions.includes(ext)) {
            // Store relative path from public directory
            const relativePath = path.relative(path.join(rootDir, 'public'), itemPath);
            mediaFiles.add(relativePath);
          }
        }
      });
    }
    
    scanDirectory(dir);
  });
  
  return mediaFiles;
}

// Get all file references from source code
function getAllReferences(dirs) {
  const references = new Set();
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    
    function scanSourceFiles(dirPath) {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          scanSourceFiles(itemPath);
        } else {
          const ext = path.extname(item).toLowerCase();
          if (['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'].includes(ext)) {
            const content = fs.readFileSync(itemPath, 'utf8');
            
            // Find all media references
            const patterns = [
              /['"`]([^'"`]*\.(?:jpg|jpeg|png|gif|webp|svg|bmp|mp4|webm|mov|avi|mkv))['"`]/gi,
              /url\(['"`]?([^'"`\)]*\.(?:jpg|jpeg|png|gif|webp|svg|bmp|mp4|webm|mov|avi|mkv))['"`]?\)/gi,
              /src=['"`]([^'"`]*\.(?:jpg|jpeg|png|gif|webp|svg|bmp|mp4|webm|mov|avi|mkv))['"`]/gi,
              /href=['"`]([^'"`]*\.(?:jpg|jpeg|png|gif|webp|svg|bmp|mp4|webm|mov|avi|mkv))['"`]/gi,
              /\/([^\/\s'"`]*\.(?:jpg|jpeg|png|gif|webp|svg|bmp|mp4|webm|mov|avi|mkv))/gi
            ];
            
            patterns.forEach(pattern => {
              let match;
              while ((match = pattern.exec(content)) !== null) {
                let filePath = match[1];
                
                // Clean up the path
                if (filePath.startsWith('/')) {
                  filePath = filePath.substring(1);
                }
                if (filePath.startsWith('./')) {
                  filePath = filePath.substring(2);
                }
                if (filePath.startsWith('assets/')) {
                  filePath = filePath;
                } else if (filePath.startsWith('public/')) {
                  filePath = filePath.substring(7);
                }
                
                references.add(filePath);
              }
            });
          }
        }
      });
    }
    
    scanSourceFiles(dir);
  });
  
  return references;
}

// Files that should always be kept (core assets)
const alwaysKeep = new Set([
  'favicon.ico',
  'favicon.webp',
  'rich-habits-logo.png',
  'logo.png',
  'images/rich-habits-logo.png',
  'images/logo.png'
]);

console.log('🔍 Scanning for media files...');
const allMediaFiles = getAllMediaFiles(mediaDirs);
console.log(`Found ${allMediaFiles.size} media files`);

console.log('🔍 Scanning for references in source code...');
const allReferences = getAllReferences(sourceDirs);
console.log(`Found ${allReferences.size} media references`);

// Find unused files
const unusedFiles = new Set();
const usedFiles = new Set();

allMediaFiles.forEach(file => {
  const filename = path.basename(file);
  const isReferenced = Array.from(allReferences).some(ref => {
    return ref.includes(filename) || ref.includes(file) || file.includes(ref);
  });
  
  if (isReferenced || alwaysKeep.has(file) || alwaysKeep.has(filename)) {
    usedFiles.add(file);
  } else {
    unusedFiles.add(file);
  }
});

console.log('\n📊 Results:');
console.log(`✅ Used files: ${usedFiles.size}`);
console.log(`❌ Unused files: ${unusedFiles.size}`);

if (unusedFiles.size > 0) {
  console.log('\n🗑️  Unused files to be removed:');
  const sortedUnused = Array.from(unusedFiles).sort();
  sortedUnused.forEach(file => {
    console.log(`  - ${file}`);
  });
  
  // Ask for confirmation
  console.log('\n⚠️  WARNING: This will permanently delete the files listed above.');
  console.log('Make sure you have a backup before proceeding.');
  console.log('\nTo proceed with deletion, run: node scripts/cleanup-unused-media.js --delete');
  
  // Check if --delete flag is provided
  if (process.argv.includes('--delete')) {
    console.log('\n🗑️  Deleting unused files...');
    let deletedCount = 0;
    
    sortedUnused.forEach(file => {
      const fullPath = path.join(rootDir, 'public', file);
      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`  ✅ Deleted: ${file}`);
          deletedCount++;
        }
      } catch (error) {
        console.log(`  ❌ Failed to delete: ${file} - ${error.message}`);
      }
    });
    
    console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} unused files.`);
    
    // Clean up empty directories
    console.log('\n🧹 Cleaning up empty directories...');
    function removeEmptyDirs(dir) {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      if (items.length === 0) {
        try {
          fs.rmdirSync(dir);
          console.log(`  ✅ Removed empty directory: ${path.relative(rootDir, dir)}`);
        } catch (error) {
          console.log(`  ❌ Failed to remove directory: ${dir}`);
        }
      } else {
        items.forEach(item => {
          const itemPath = path.join(dir, item);
          if (fs.statSync(itemPath).isDirectory()) {
            removeEmptyDirs(itemPath);
          }
        });
        
        // Check again if directory is now empty
        if (fs.readdirSync(dir).length === 0) {
          try {
            fs.rmdirSync(dir);
            console.log(`  ✅ Removed empty directory: ${path.relative(rootDir, dir)}`);
          } catch (error) {
            // Silent fail for directories that can't be removed
          }
        }
      }
    }
    
    mediaDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        removeEmptyDirs(dir);
      }
    });
  }
} else {
  console.log('\n✅ No unused files found! Your media directory is clean.');
}

console.log('\n📝 Used files:');
const sortedUsed = Array.from(usedFiles).sort();
sortedUsed.slice(0, 20).forEach(file => {
  console.log(`  ✅ ${file}`);
});
if (sortedUsed.length > 20) {
  console.log(`  ... and ${sortedUsed.length - 20} more`);
}
