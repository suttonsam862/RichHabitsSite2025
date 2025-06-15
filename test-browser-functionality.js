/**
 * Browser-based Functionality Test
 * Tests event pages, registration forms, and retail shop through frontend
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testEventPagesDisplay() {
  console.log('\nTesting Event Pages Display...');
  
  const eventIds = ['1', '2', '3', '4'];
  const eventNames = ['Birmingham Slam Camp', 'National Champ Camp', 'Texas Recruiting Clinic', 'Panther Train Tour'];
  
  for (let i = 0; i < eventIds.length; i++) {
    try {
      const response = await fetch(`${BASE_URL}/events/${eventIds[i]}`);
      const html = await response.text();
      
      if (html.includes(eventNames[i]) || html.includes('Rich Habits')) {
        console.log(`✅ Event ${eventIds[i]} (${eventNames[i]}): Page loads`);
      } else {
        console.log(`❌ Event ${eventIds[i]} (${eventNames[i]}): Page not loading properly`);
      }
    } catch (error) {
      console.log(`❌ Event ${eventIds[i]} (${eventNames[i]}): Failed to load - ${error.message}`);
    }
  }
}

async function testRetailShopDisplay() {
  console.log('\nTesting Retail Shop Display...');
  
  try {
    const response = await fetch(`${BASE_URL}/shop`);
    const html = await response.text();
    
    if (html.includes('Rich Habits') && (html.includes('shop') || html.includes('products'))) {
      console.log('✅ Retail Shop: Page loads');
      
      // Check for specific products
      if (html.includes('Heavyweight Tee') || html.includes('Cap')) {
        console.log('✅ Retail Products: Products visible on page');
      } else {
        console.log('⚠️  Retail Products: Products may not be loading');
      }
    } else {
      console.log('❌ Retail Shop: Page not loading properly');
    }
  } catch (error) {
    console.log(`❌ Retail Shop: Failed to load - ${error.message}`);
  }
}

async function testCartPage() {
  console.log('\nTesting Cart Page...');
  
  try {
    const response = await fetch(`${BASE_URL}/cart`);
    const html = await response.text();
    
    if (html.includes('Rich Habits') && html.includes('cart')) {
      console.log('✅ Cart Page: Page loads');
    } else {
      console.log('❌ Cart Page: Page not loading properly');
    }
  } catch (error) {
    console.log(`❌ Cart Page: Failed to load - ${error.message}`);
  }
}

async function testRegistrationPages() {
  console.log('\nTesting Registration Pages...');
  
  const eventIds = ['1', '2', '3', '4'];
  
  for (const eventId of eventIds) {
    try {
      const response = await fetch(`${BASE_URL}/register/${eventId}`);
      const html = await response.text();
      
      if (html.includes('Rich Habits') && (html.includes('register') || html.includes('registration'))) {
        console.log(`✅ Registration Event ${eventId}: Page loads`);
      } else {
        console.log(`❌ Registration Event ${eventId}: Page not loading properly`);
      }
    } catch (error) {
      console.log(`❌ Registration Event ${eventId}: Failed to load - ${error.message}`);
    }
  }
}

async function testTeamRegistrationPage() {
  console.log('\nTesting Team Registration Page...');
  
  try {
    const response = await fetch(`${BASE_URL}/team-registration`);
    const html = await response.text();
    
    if (html.includes('Rich Habits') && html.includes('team')) {
      console.log('✅ Team Registration: Page loads');
    } else {
      console.log('❌ Team Registration: Page not loading properly');
    }
  } catch (error) {
    console.log(`❌ Team Registration: Failed to load - ${error.message}`);
  }
}

async function testHomePage() {
  console.log('\nTesting Home Page...');
  
  try {
    const response = await fetch(BASE_URL);
    const html = await response.text();
    
    if (html.includes('Rich Habits') && html.includes('Wrestling')) {
      console.log('✅ Home Page: Loads with Rich Habits content');
      
      // Check for key sections
      if (html.includes('Events') || html.includes('camps')) {
        console.log('✅ Home Page: Events section present');
      }
      if (html.includes('Shop') || html.includes('retail')) {
        console.log('✅ Home Page: Shop section present');
      }
    } else {
      console.log('❌ Home Page: Not loading properly');
    }
  } catch (error) {
    console.log(`❌ Home Page: Failed to load - ${error.message}`);
  }
}

async function runBrowserTests() {
  console.log('🚀 Starting Browser Functionality Tests');
  console.log('=' .repeat(50));
  
  await testHomePage();
  await testEventPagesDisplay();
  await testRegistrationPages();
  await testTeamRegistrationPage();
  await testRetailShopDisplay();
  await testCartPage();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Browser Tests Completed');
  console.log('\nManual Testing Instructions:');
  console.log('1. Visit each event page and verify content displays');
  console.log('2. Click "Register Now" buttons to test registration forms');
  console.log('3. Go to Shop page and add items to cart');
  console.log('4. Test checkout flow with Stripe payment');
  console.log('5. Verify Shopify orders are created successfully');
}

runBrowserTests().catch(console.error);