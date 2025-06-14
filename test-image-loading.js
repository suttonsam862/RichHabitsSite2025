/**
 * Comprehensive Image Loading Diagnostic Script
 * Tests all image loading scenarios to identify root causes
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const SERVER_URL = 'http://localhost:3000';

async function checkServerHealth() {
  try {
    const response = await fetch(`${SERVER_URL}/health`);
    if (response.ok) {
      console.log('✅ Server is running');
      return true;
    } else {
      console.log('❌ Server health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Server not accessible:', error.message);
    return false;
  }
}

async function testStaticFileServing() {
  console.log('\n=== Static File Serving Test ===');
  
  // Test files from public directory
  const testFiles = [
    '/Cursive-Logo.webp',
    '/assets/designs/athens.png',
    '/images/DSC08612.JPG',
    '/favicon.ico'
  ];

  for (const file of testFiles) {
    try {
      const response = await fetch(`${SERVER_URL}${file}`);
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        console.log(`✅ ${file} - ${response.status} (${contentType})`);
      } else {
        console.log(`❌ ${file} - ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${file} - Error: ${error.message}`);
    }
  }
}

async function testShopifyProductImages() {
  console.log('\n=== Shopify Product Images Test ===');
  
  try {
    const response = await fetch(`${SERVER_URL}/api/products`);
    if (!response.ok) {
      console.log(`❌ Products API failed: ${response.status} ${response.statusText}`);
      return;
    }
    
    const products = await response.json();
    console.log(`Found ${products.length} products`);
    
    for (const product of products.slice(0, 3)) {
      console.log(`\n📦 Product: ${product.title}`);
      console.log(`   Images array length: ${product.images?.length || 0}`);
      
      if (product.images && product.images.length > 0) {
        for (let i = 0; i < Math.min(2, product.images.length); i++) {
          const image = product.images[i];
          console.log(`   Image ${i + 1}:`);
          console.log(`     src: ${image.src || 'undefined'}`);
          console.log(`     url: ${image.url || 'undefined'}`);
          console.log(`     originalSrc: ${image.originalSrc || 'undefined'}`);
          
          // Test if the image URL is accessible
          const imageUrl = image.src || image.url || image.originalSrc;
          if (imageUrl) {
            try {
              const imgResponse = await fetch(imageUrl, { method: 'HEAD' });
              if (imgResponse.ok) {
                console.log(`     ✅ Image accessible - ${imgResponse.status}`);
              } else {
                console.log(`     ❌ Image not accessible - ${imgResponse.status}`);
              }
            } catch (error) {
              console.log(`     ❌ Image fetch error: ${error.message}`);
            }
          } else {
            console.log(`     ❌ No valid image URL found`);
          }
        }
      } else {
        console.log('   ❌ No images found for this product');
      }
    }
  } catch (error) {
    console.log(`❌ Shopify products test failed: ${error.message}`);
  }
}

async function testPublicDirectoryStructure() {
  console.log('\n=== Public Directory Structure Test ===');
  
  const publicDir = './public';
  
  function scanDirectory(dir, prefix = '') {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items.slice(0, 10)) { // Limit output
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          console.log(`📁 ${prefix}${item}/`);
          if (prefix.length < 4) { // Limit depth
            scanDirectory(fullPath, prefix + '  ');
          }
        } else if (stat.isFile() && /\.(png|jpg|jpeg|webp|svg|gif)$/i.test(item)) {
          console.log(`🖼️  ${prefix}${item} (${(stat.size / 1024).toFixed(1)}KB)`);
        }
      }
    } catch (error) {
      console.log(`❌ Error scanning ${dir}: ${error.message}`);
    }
  }
  
  scanDirectory(publicDir);
}

async function testAssetAliases() {
  console.log('\n=== Asset Alias Test ===');
  
  // Test if assets from client/src/assets are accessible
  const assetPaths = [
    '/client/src/assets/coaches/Michael_McGee_JouQS.jpg',
    '/src/assets/coaches/Michael_McGee_JouQS.jpg',
    '/assets/coaches/Michael_McGee_JouQS.jpg'
  ];
  
  for (const assetPath of assetPaths) {
    try {
      const response = await fetch(`${SERVER_URL}${assetPath}`);
      if (response.ok) {
        console.log(`✅ ${assetPath} - accessible`);
      } else {
        console.log(`❌ ${assetPath} - ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${assetPath} - Error: ${error.message}`);
    }
  }
}

async function runCompleteImageAudit() {
  console.log('🔍 Starting Comprehensive Image Loading Audit...');
  
  const serverRunning = await checkServerHealth();
  if (!serverRunning) {
    console.log('\n❌ Cannot proceed - server is not running');
    console.log('💡 Start the server first: npm run dev');
    return;
  }
  
  await testPublicDirectoryStructure();
  await testStaticFileServing();
  await testAssetAliases();
  await testShopifyProductImages();
  
  console.log('\n📊 Image Loading Audit Complete');
  console.log('\n🎯 Next Steps:');
  console.log('1. Fix any failed static file serving');
  console.log('2. Verify Shopify image property access');
  console.log('3. Test robust image component in browser');
}

// Run the audit
runCompleteImageAudit().catch(console.error);