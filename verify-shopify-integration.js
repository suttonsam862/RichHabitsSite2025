/**
 * Shopify Integration Verification
 * Tests actual Shopify API connectivity and order creation
 */

import fetch from 'node-fetch';

async function testShopifyConnection() {
  console.log('Testing Shopify API Connection...');
  
  const shopifyUrl = process.env.SHOPIFY_STORE_URL;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  
  if (!shopifyUrl || !accessToken) {
    console.log('❌ Missing Shopify credentials');
    return false;
  }
  
  try {
    const response = await fetch(`${shopifyUrl}/admin/api/2024-01/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Shopify Connected: ${data.shop?.name || 'Shop'}`);
      return true;
    } else {
      console.log(`❌ Shopify API Error: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Shopify Connection Failed: ${error.message}`);
    return false;
  }
}

async function testShopifyProducts() {
  console.log('\nTesting Shopify Products...');
  
  const shopifyUrl = process.env.SHOPIFY_STORE_URL;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  
  try {
    const response = await fetch(`${shopifyUrl}/admin/api/2024-01/products.json?limit=5`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Products Retrieved: ${data.products?.length || 0} products`);
      
      // Check for specific Rich Habits products
      const products = data.products || [];
      const teeProduct = products.find(p => p.title?.includes('Heavyweight Tee'));
      const capProduct = products.find(p => p.title?.includes('Cap'));
      
      if (teeProduct) console.log(`✅ Found: ${teeProduct.title}`);
      if (capProduct) console.log(`✅ Found: ${capProduct.title}`);
      
      return products;
    } else {
      console.log(`❌ Products API Error: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.log(`❌ Products Test Failed: ${error.message}`);
    return [];
  }
}

async function testOrderCreation() {
  console.log('\nTesting Shopify Order Creation...');
  
  const shopifyUrl = process.env.SHOPIFY_STORE_URL;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  
  const testOrder = {
    order: {
      email: 'test@richhabits.com',
      fulfillment_status: null,
      financial_status: 'paid',
      line_items: [
        {
          title: 'Rich Habits Test Order',
          quantity: 1,
          price: '25.00'
        }
      ],
      customer: {
        first_name: 'Test',
        last_name: 'Customer',
        email: 'test@richhabits.com'
      },
      billing_address: {
        first_name: 'Test',
        last_name: 'Customer',
        address1: '123 Test St',
        city: 'Test City',
        province: 'TS',
        country: 'US',
        zip: '12345'
      },
      tags: 'test-order,api-created'
    }
  };
  
  try {
    const response = await fetch(`${shopifyUrl}/admin/api/2024-01/orders.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testOrder)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Test Order Created: #${data.order?.order_number || data.order?.id}`);
      return data.order;
    } else {
      const errorData = await response.text();
      console.log(`❌ Order Creation Failed: ${response.status} - ${errorData}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Order Creation Test Failed: ${error.message}`);
    return null;
  }
}

async function testStripePaymentIntent() {
  console.log('\nTesting Stripe Payment Intent Creation...');
  
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeKey) {
    console.log('❌ Missing Stripe secret key');
    return null;
  }
  
  try {
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'amount=2500&currency=usd&metadata[type]=test-registration&metadata[event]=birmingham-slam-camp'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Payment Intent Created: ${data.id}`);
      return data;
    } else {
      const errorData = await response.text();
      console.log(`❌ Payment Intent Failed: ${response.status} - ${errorData}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Stripe Test Failed: ${error.message}`);
    return null;
  }
}

async function runShopifyVerification() {
  console.log('🚀 Starting Shopify Integration Verification\n');
  console.log('=' .repeat(50));
  
  const isConnected = await testShopifyConnection();
  
  if (isConnected) {
    const products = await testShopifyProducts();
    const testOrder = await testOrderCreation();
    const paymentIntent = await testStripePaymentIntent();
    
    console.log('\n' + '=' .repeat(50));
    console.log('📊 Integration Status Summary:');
    console.log(`Shopify API: ${isConnected ? '✅ Connected' : '❌ Failed'}`);
    console.log(`Products API: ${products.length > 0 ? '✅ Working' : '❌ Failed'}`);
    console.log(`Order Creation: ${testOrder ? '✅ Working' : '❌ Failed'}`);
    console.log(`Stripe Integration: ${paymentIntent ? '✅ Working' : '❌ Failed'}`);
    
    console.log('\n🎯 Manual Testing Steps:');
    console.log('1. Visit event pages and verify all content displays');
    console.log('2. Click "Register Now" and complete registration form');
    console.log('3. Test payment processing with Stripe test cards');
    console.log('4. Go to shop page and add products to cart');
    console.log('5. Complete checkout and verify Shopify order creation');
    
    if (testOrder) {
      console.log(`\n⚠️  Clean up: Delete test order #${testOrder.order_number || testOrder.id} from Shopify admin`);
    }
  } else {
    console.log('\n❌ Cannot test order creation without Shopify connection');
    console.log('Please verify Shopify credentials are properly configured');
  }
}

runShopifyVerification().catch(console.error);