#!/usr/bin/env node

/**
 * Test script to verify Shopify product integration
 * Tests pricing, routing, and API responses
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testCollectionProducts() {
  console.log('1. Testing collection products API...');
  try {
    const response = await fetch(`${BASE_URL}/api/shop/collections/limited-time-clothing/products`);
    const products = await response.json();
    
    if (!products || products.length === 0) {
      console.log('❌ No products found in collection');
      return false;
    }
    
    const firstProduct = products[0];
    console.log(`✅ Found ${products.length} products`);
    console.log(`   Product: ${firstProduct.title}`);
    console.log(`   Handle: ${firstProduct.handle}`);
    console.log(`   Has variants: ${!!firstProduct.variants}`);
    
    if (firstProduct.variants && firstProduct.variants.length > 0) {
      const price = firstProduct.variants[0].price;
      console.log(`   First variant price: ${price}`);
      return { success: true, price, handle: firstProduct.handle };
    } else {
      console.log('❌ Product missing variants with pricing');
      return false;
    }
  } catch (error) {
    console.log(`❌ Collection products API failed: ${error.message}`);
    return false;
  }
}

async function testProductByHandle(handle) {
  console.log('\n2. Testing product by handle API...');
  try {
    const response = await fetch(`${BASE_URL}/api/shop/products/handle/${handle}`);
    const product = await response.json();
    
    if (product.error) {
      console.log(`❌ Product not found: ${product.error}`);
      return false;
    }
    
    console.log(`✅ Product found by handle: ${product.title}`);
    console.log(`   Has variants: ${!!product.variants}`);
    
    if (product.variants && product.variants.length > 0) {
      const price = product.variants[0].price;
      console.log(`   First variant price: ${price}`);
      return true;
    } else {
      console.log('❌ Product missing variants with pricing');
      return false;
    }
  } catch (error) {
    console.log(`❌ Product by handle API failed: ${error.message}`);
    return false;
  }
}

async function testShopifyIntegration() {
  console.log('=== Shopify Product Integration Test ===\n');
  
  const collectionTest = await testCollectionProducts();
  if (!collectionTest) {
    console.log('\n❌ Collection test failed - cannot proceed with handle test');
    return;
  }
  
  const handleTest = await testProductByHandle(collectionTest.handle);
  
  console.log('\n=== Test Results ===');
  console.log(`Collection Products API: ${collectionTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Product by Handle API: ${handleTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (collectionTest && handleTest) {
    console.log('\n🎉 All tests passed! Shopify integration is working correctly.');
    console.log('\nNext steps:');
    console.log('1. Visit /shop to see products with proper pricing');
    console.log(`2. Click "View Details" to test product routing`);
    console.log(`3. Example product URL: /product/${collectionTest.handle}`);
  } else {
    console.log('\n❌ Some tests failed. Check the API responses above.');
  }
}

// Run the test
testShopifyIntegration().catch(console.error);