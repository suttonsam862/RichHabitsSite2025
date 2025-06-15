/**
 * Complete Registration and Retail Flow Test
 * Tests all event registration routes and retail shop Shopify integration
 */

import http from 'http';
import https from 'https';
import querystring from 'querystring';

const BASE_URL = 'http://localhost:5000';

// Test data for event registrations
const testRegistrations = [
  {
    eventId: 1,
    eventName: 'Birmingham Slam Camp',
    data: {
      firstName: 'John',
      lastName: 'Wrestler',
      email: 'john.wrestler@example.com',
      phone: '555-123-4567',
      age: '16',
      weight: '155',
      experience: 'intermediate',
      emergencyContact: 'Jane Wrestler',
      emergencyPhone: '555-987-6543',
      registrationType: 'individual'
    }
  },
  {
    eventId: 2,
    eventName: 'National Champ Camp',
    data: {
      firstName: 'Mike',
      lastName: 'Champion',
      email: 'mike.champion@example.com',
      phone: '555-234-5678',
      age: '17',
      weight: '170',
      experience: 'advanced',
      emergencyContact: 'Sarah Champion',
      emergencyPhone: '555-876-5432',
      registrationType: 'individual'
    }
  },
  {
    eventId: 3,
    eventName: 'Texas Recruiting Clinic',
    data: {
      firstName: 'Alex',
      lastName: 'Recruit',
      email: 'alex.recruit@example.com',
      phone: '555-345-6789',
      age: '18',
      weight: '165',
      experience: 'advanced',
      emergencyContact: 'Tom Recruit',
      emergencyPhone: '555-765-4321',
      registrationType: 'individual',
      highSchool: 'Arlington High School',
      graduationYear: '2025'
    }
  },
  {
    eventId: 4,
    eventName: 'Panther Train Tour',
    data: {
      firstName: 'Sam',
      lastName: 'Community',
      email: 'sam.community@example.com',
      phone: '555-456-7890',
      age: '15',
      weight: '145',
      experience: 'beginner',
      emergencyContact: 'Lisa Community',
      emergencyPhone: '555-654-3210',
      registrationType: 'individual'
    }
  }
];

// Test retail products
const retailProducts = [
  { handle: 'rich-habits-heavyweight-tee', name: 'Rich Habits Heavyweight Tee' },
  { handle: 'rich-habits-cap', name: 'Rich Habits Cap' }
];

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const httpModule = isHttps ? https : http;
    
    const req = httpModule.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testServerHealth() {
  console.log('\n🏥 Testing Server Health...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    console.log(`✅ Server Health: ${response.status}`);
    console.log(`   Database: ${response.data.database?.status || 'unknown'}`);
    return response.status === 200;
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
    return false;
  }
}

async function testEventEndpoints() {
  console.log('\n📅 Testing Event Endpoints...');
  
  const eventSlugs = ['birmingham-slam-camp', 'national-champ-camp', 'texas-recruiting-clinic', 'panther-train-tour'];
  
  for (const slug of eventSlugs) {
    try {
      const response = await makeRequest(`${BASE_URL}/api/events/${slug}`);
      if (response.status === 200) {
        console.log(`✅ Event ${slug}: Available`);
      } else {
        console.log(`⚠️  Event ${slug}: ${response.status} - ${response.data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`❌ Event ${slug} failed:`, error.message);
    }
  }
}

async function testEventRegistration(registration) {
  console.log(`\n🎯 Testing Registration for ${registration.eventName}...`);
  
  try {
    // Test payment intent creation
    const paymentResponse = await makeRequest(`${BASE_URL}/api/events/${registration.eventId}/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...registration.data,
        amount: 24900 // $249.00 in cents
      })
    });
    
    if (paymentResponse.status === 200) {
      console.log(`✅ Payment Intent Created: ${paymentResponse.data.clientSecret ? 'Success' : 'Failed'}`);
      
      // Test registration submission
      const regResponse = await makeRequest(`${BASE_URL}/api/event-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...registration.data,
          eventId: registration.eventId,
          paymentIntentId: 'pi_test_' + Date.now()
        })
      });
      
      if (regResponse.status === 200) {
        console.log(`✅ Registration Submitted: Success`);
        console.log(`   Registration ID: ${regResponse.data.registrationId || 'Generated'}`);
      } else {
        console.log(`❌ Registration Failed: ${regResponse.status} - ${regResponse.data.error || 'Unknown error'}`);
      }
    } else {
      console.log(`❌ Payment Intent Failed: ${paymentResponse.status} - ${paymentResponse.data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`❌ Registration test failed for ${registration.eventName}:`, error.message);
  }
}

async function testRetailProducts() {
  console.log('\n🛍️ Testing Retail Products...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/retail/products`);
    if (response.status === 200) {
      console.log(`✅ Retail Products: ${response.data.length || 0} products loaded`);
      console.log(`   Products: ${response.data.map(p => p.title).join(', ')}`);
      return response.data;
    } else {
      console.log(`❌ Retail Products Failed: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error('❌ Retail products test failed:', error.message);
    return [];
  }
}

async function testProductDetails(productHandle) {
  console.log(`\n📦 Testing Product Details: ${productHandle}...`);
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/retail/products/${productHandle}`);
    if (response.status === 200) {
      console.log(`✅ Product Details: Available`);
      console.log(`   Price: $${response.data.price || 'Unknown'}`);
      console.log(`   Variants: ${response.data.variants?.length || 0}`);
      return response.data;
    } else {
      console.log(`❌ Product Details Failed: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Product details test failed for ${productHandle}:`, error.message);
    return null;
  }
}

async function testCartFunctionality(products) {
  console.log('\n🛒 Testing Cart Functionality...');
  
  if (!products || products.length === 0) {
    console.log('❌ No products available for cart testing');
    return;
  }
  
  try {
    // Add first product to cart
    const product1 = products[0];
    const addResponse1 = await makeRequest(`${BASE_URL}/api/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: product1.id,
        variantId: product1.variants?.[0]?.id || product1.id,
        quantity: 1
      })
    });
    
    if (addResponse1.status === 200) {
      console.log(`✅ Added ${product1.title} to cart`);
    } else {
      console.log(`❌ Failed to add ${product1.title}: ${addResponse1.status}`);
    }
    
    // Add second product if available
    if (products.length > 1) {
      const product2 = products[1];
      const addResponse2 = await makeRequest(`${BASE_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product2.id,
          variantId: product2.variants?.[0]?.id || product2.id,
          quantity: 1
        })
      });
      
      if (addResponse2.status === 200) {
        console.log(`✅ Added ${product2.title} to cart`);
      } else {
        console.log(`❌ Failed to add ${product2.title}: ${addResponse2.status}`);
      }
    }
    
    // Get cart contents
    const cartResponse = await makeRequest(`${BASE_URL}/api/cart`);
    if (cartResponse.status === 200) {
      console.log(`✅ Cart Retrieved: ${cartResponse.data.items?.length || 0} items`);
      console.log(`   Total: $${cartResponse.data.total || 'Unknown'}`);
      return cartResponse.data;
    } else {
      console.log(`❌ Cart Retrieval Failed: ${cartResponse.status}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Cart functionality test failed:', error.message);
    return null;
  }
}

async function testShopifyCheckout(cartData) {
  console.log('\n💳 Testing Shopify Checkout...');
  
  if (!cartData || !cartData.items || cartData.items.length === 0) {
    console.log('❌ No cart items for checkout testing');
    return;
  }
  
  try {
    const checkoutResponse = await makeRequest(`${BASE_URL}/api/cart/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: cartData.items,
        customerInfo: {
          email: 'test.customer@example.com',
          firstName: 'Test',
          lastName: 'Customer'
        }
      })
    });
    
    if (checkoutResponse.status === 200) {
      console.log(`✅ Shopify Checkout: Success`);
      console.log(`   Payment Intent: ${checkoutResponse.data.clientSecret ? 'Created' : 'Failed'}`);
      console.log(`   Amount: $${(checkoutResponse.data.amount / 100).toFixed(2)}`);
      return checkoutResponse.data;
    } else {
      console.log(`❌ Shopify Checkout Failed: ${checkoutResponse.status} - ${checkoutResponse.data.error || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Shopify checkout test failed:', error.message);
    return null;
  }
}

async function testWebhookSimulation(paymentIntentId) {
  console.log('\n🔗 Testing Webhook Simulation...');
  
  try {
    const webhookResponse = await makeRequest(`${BASE_URL}/api/stripe/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature'
      },
      body: JSON.stringify({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: paymentIntentId,
            status: 'succeeded',
            metadata: {
              type: 'retail_purchase',
              customerEmail: 'test.customer@example.com'
            }
          }
        }
      })
    });
    
    if (webhookResponse.status === 200) {
      console.log(`✅ Webhook Processing: Success`);
      console.log(`   Shopify Order: ${webhookResponse.data.shopifyOrderId ? 'Created' : 'Failed'}`);
    } else {
      console.log(`❌ Webhook Processing Failed: ${webhookResponse.status}`);
    }
  } catch (error) {
    console.error('❌ Webhook simulation failed:', error.message);
  }
}

async function runCompleteTest() {
  console.log('🚀 Starting Complete Registration and Retail Flow Test\n');
  console.log('=' .repeat(60));
  
  // Test server health
  const isHealthy = await testServerHealth();
  if (!isHealthy) {
    console.log('\n❌ Server not healthy, continuing with limited tests...');
  }
  
  // Test event endpoints
  await testEventEndpoints();
  
  // Test event registrations
  console.log('\n📋 Testing Event Registrations...');
  for (const registration of testRegistrations) {
    await testEventRegistration(registration);
  }
  
  // Test retail functionality
  console.log('\n🏪 Testing Retail Shop...');
  const products = await testRetailProducts();
  
  // Test individual product details
  for (const productInfo of retailProducts) {
    await testProductDetails(productInfo.handle);
  }
  
  // Test cart functionality
  const cartData = await testCartFunctionality(products);
  
  // Test Shopify checkout
  const checkoutData = await testShopifyCheckout(cartData);
  
  // Test webhook simulation
  if (checkoutData && checkoutData.paymentIntentId) {
    await testWebhookSimulation(checkoutData.paymentIntentId);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Complete Test Finished');
  console.log('\nNext Steps:');
  console.log('1. Check that all event pages display properly in browser');
  console.log('2. Test registration forms manually');
  console.log('3. Verify cart and checkout flow in browser');
  console.log('4. Confirm Shopify orders are created successfully');
}

// Run the complete test
runCompleteTest().catch(console.error);