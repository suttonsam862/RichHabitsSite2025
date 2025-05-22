/**
 * Image Optimization Script for Rich Habits
 * 
 * This script uses sharp to optimize images for web use.
 * To use this script, run: node scripts/optimize-images.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const sourceDir = 'client/src/assets';
const outputDir = 'public/optimized';
const sizes = [
  { name: 'sm', width: 640 },
  { name: 'md', width: 1024 },
  { name: 'lg', width: 1920 }
];
const formats = ['webp', 'jpg'];
const quality = 80;

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to optimize a single image
async function optimizeImage(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  
  // Skip if not an image
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(filePath).toLowerCase())) {
    console.log(`Skipping non-image file: ${filePath}`);
    return;
  }
  
  try {
    // Get image metadata
    const metadata = await sharp(filePath).metadata();
    
    // Process each size
    for (const size of sizes) {
      // Skip sizes larger than the original image
      if (size.width >= metadata.width) {
        console.log(`Skipping size ${size.name} for ${fileName} - original is smaller`);
        continue;
      }
      
      // Create a directory for this size if it doesn't exist
      const sizeDir = path.join(outputDir, size.name);
      if (!fs.existsSync(sizeDir)) {
        fs.mkdirSync(sizeDir, { recursive: true });
      }
      
      // Process each format
      for (const format of formats) {
        const outputPath = path.join(sizeDir, `${fileName}.${format}`);
        
        await sharp(filePath)
          .resize(size.width)
          .toFormat(format, { quality })
          .toFile(outputPath);
        
        console.log(`Optimized: ${outputPath}`);
      }
    }
    
    // Also create a full size optimized version in webp
    const webpOutputPath = path.join(outputDir, `${fileName}.webp`);
    await sharp(filePath)
      .toFormat('webp', { quality })
      .toFile(webpOutputPath);
    
    console.log(`Optimized: ${webpOutputPath}`);
    
  } catch (error) {
    console.error(`Error optimizing ${filePath}:`, error);
  }
}

// Process all images in a directory and its subdirectories
async function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else {
      await optimizeImage(fullPath);
    }
  }
}

// Start processing images
console.log('Starting image optimization...');
processDirectory(sourceDir)
  .then(() => console.log('Image optimization complete!'))
  .catch(err => console.error('Error during optimization:', err));