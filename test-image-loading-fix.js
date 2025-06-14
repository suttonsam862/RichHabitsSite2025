/**
 * Critical Image Loading Fix Test
 * Tests that all images load properly after server configuration fix
 */

import { execSync } from 'child_process';

const testImagePaths = [
  '/Cursive-Logo.webp',
  '/DSC09374--.JPG',
  '/assets/DSC09374--.JPG',
  '/images/placeholder.svg'
];

console.log('🔧 Testing Image Loading Fix');
console.log('='.repeat(50));

// Test server response for each image
for (const imagePath of testImagePaths) {
  try {
    console.log(`Testing ${imagePath}...`);
    const result = execSync(`curl -I http://localhost:5000${imagePath} 2>/dev/null | head -1`, { encoding: 'utf8' });
    
    if (result.includes('200 OK')) {
      console.log(`✅ ${imagePath} - OK`);
    } else if (result.includes('404')) {
      console.log(`❌ ${imagePath} - Not Found`);
    } else {
      console.log(`⚠️ ${imagePath} - ${result.trim()}`);
    }
  } catch (error) {
    console.log(`❌ ${imagePath} - Server not running or error`);
  }
}

console.log('\n📊 Image Loading Test Complete');