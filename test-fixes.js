/**
 * Test Both Fixes: Event Routing and Shop Filtering
 * Validates that events load properly and shop shows only 2 products
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testEventRouting() {
  console.log('Testing Event Routing Fixes...');
  
  const testCases = [
    { id: '1', name: 'Birmingham Slam Camp' },
    { id: '2', name: 'National Champ Camp' },
    { id: '3', name: 'Texas Recruiting Clinic' },
    { id: '4', name: 'Panther Train Tour' },
    { slug: 'birmingham-slam-camp', name: 'Birmingham Slam Camp' },
    { slug: 'national-champ-camp', name: 'National Champ Camp' }
  ];
  
  for (const testCase of testCases) {
    try {
      const identifier = testCase.id || testCase.slug;
      const response = await fetch(`${BASE_URL}/api/events/${identifier}`);
      
      if (response.ok) {
        const event = await response.json();
        console.log(`✅ Event ${identifier} (${testCase.name}): ${event.title}`);
      } else {
        console.log(`❌ Event ${identifier} (${testCase.name}): ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Event ${testCase.id || testCase.slug}: Connection failed`);
    }
  }
}

async function testShopFiltering() {
  console.log('\nTesting Shop Product Filtering...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/shop/products`);
    
    if (response.ok) {
      const products = await response.json();
      console.log(`✅ Shop Products: ${products.length} products returned`);
      
      if (products.length === 2) {
        console.log('✅ Correct number of products (2) returned');
        products.forEach(product => {
          console.log(`   - ${product.title}`);
        });
      } else {
        console.log(`❌ Expected 2 products, got ${products.length}`);
        if (products.length > 2) {
          console.log('   Problem: Showing all Shopify products instead of filtered 2');
        }
      }
    } else {
      console.log(`❌ Shop Products: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Shop Products: Connection failed');
  }
}

async function testEventPages() {
  console.log('\nTesting Event Page Access...');
  
  const eventPages = ['/events/1', '/events/2', '/events/3', '/events/4'];
  
  for (const page of eventPages) {
    try {
      const response = await fetch(`${BASE_URL}${page}`);
      const html = await response.text();
      
      if (html.includes('Rich Habits') && !html.includes('Event Not Found')) {
        console.log(`✅ Event Page ${page}: Loads correctly`);
      } else {
        console.log(`❌ Event Page ${page}: Shows "Event Not Found"`);
      }
    } catch (error) {
      console.log(`❌ Event Page ${page}: Connection failed`);
    }
  }
}

async function runFixValidation() {
  console.log('🔧 Validating Event Routing and Shop Filtering Fixes\n');
  console.log('=' .repeat(55));
  
  await testEventRouting();
  await testShopFiltering();
  await testEventPages();
  
  console.log('\n' + '=' .repeat(55));
  console.log('Fix Validation Summary:');
  console.log('1. Event routing should now work for all 4 events');
  console.log('2. Shop should display only Rich Habits Heavyweight Tee and Cap');
  console.log('3. Event pages should load without "event not found" errors');
}

runFixValidation().catch(console.error);