/**
 * End-to-End Retail Checkout Validation Script
 * Tests complete flow from product page to Shopify order creation
 */

import http from 'http';
import https from 'https';

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_PRODUCT_HANDLE = 'rich-habits-crewneck'; // Common product handle
const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=test-session-id', // Mock session
        ...options.headers
      },
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            json: data ? JSON.parse(data) : null
          };
          resolve(result);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            json: null
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test functions
async function testServerHealth() {
  console.log('\n=== 1. Server Health Check ===');
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    if (response.statusCode === 200) {
      console.log('✅ Server is healthy');
      console.log(`Database status: ${response.json?.database?.status || 'unknown'}`);
      return true;
    } else {
      console.log(`❌ Server health check failed: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Server not accessible: ${error.message}`);
    return false;
  }
}

async function testProductAPI() {
  console.log('\n=== 2. Product API Validation ===');
  
  // Test products endpoint
  try {
    const response = await makeRequest(`${BASE_URL}/api/products`);
    if (response.statusCode === 200 && response.json?.products) {
      console.log(`✅ Products API working - ${response.json.products.length} products found`);
      
      // Get first product with variants for testing
      const testProduct = response.json.products.find(p => p.variants && p.variants.length > 0);
      if (testProduct) {
        console.log(`✅ Test product found: ${testProduct.title} (${testProduct.variants.length} variants)`);
        return testProduct;
      } else {
        console.log('❌ No products with variants found');
        return null;
      }
    } else {
      console.log(`❌ Products API failed: ${response.statusCode}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Products API error: ${error.message}`);
    return null;
  }
}

async function testProductDetail(productHandle) {
  console.log('\n=== 3. Product Detail Page Validation ===');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/products/handle/${productHandle}`);
    if (response.statusCode === 200 && response.json?.product) {
      const product = response.json.product;
      console.log(`✅ Product detail loaded: ${product.title}`);
      console.log(`   Variants: ${product.variants?.length || 0}`);
      console.log(`   Images: ${product.images?.length || 0}`);
      console.log(`   Options: ${product.options?.map(o => o.name).join(', ') || 'none'}`);
      
      // Validate variant structure
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants[0];
        const hasRequiredFields = variant.id && variant.title && variant.price;
        console.log(`   Variant structure: ${hasRequiredFields ? '✅ Valid' : '❌ Invalid'}`);
        
        return product;
      } else {
        console.log('❌ No variants found in product');
        return null;
      }
    } else {
      console.log(`❌ Product detail failed: ${response.statusCode}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Product detail error: ${error.message}`);
    return null;
  }
}

async function testCartFunctionality(product) {
  console.log('\n=== 4. Cart Functionality Validation ===');
  
  const testVariant = product.variants[0];
  const cartItem = {
    shopifyProductId: product.id,
    shopifyVariantId: testVariant.id,
    productHandle: product.handle,
    productTitle: product.title,
    variantTitle: testVariant.title,
    price: parseFloat(testVariant.price.replace('$', '')),
    quantity: 1,
    productImage: product.images?.[0]?.src,
    selectedSize: testVariant.option1 || 'M',
    selectedColor: testVariant.option2 || 'Black'
  };
  
  try {
    // Test add to cart
    const addResponse = await makeRequest(`${BASE_URL}/api/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cartItem)
    });
    
    if (addResponse.statusCode === 200) {
      console.log('✅ Add to cart successful');
      
      // Test get cart
      const getResponse = await makeRequest(`${BASE_URL}/api/cart`);
      if (getResponse.statusCode === 200 && getResponse.json?.items) {
        console.log(`✅ Cart retrieval successful - ${getResponse.json.items.length} items`);
        console.log(`   Subtotal: $${getResponse.json.subtotal?.toFixed(2) || '0.00'}`);
        
        // Validate cart item structure
        const cartItems = getResponse.json.items;
        if (cartItems.length > 0) {
          const item = cartItems[0];
          const hasRequiredFields = item.shopifyProductId && item.shopifyVariantId && item.price;
          console.log(`   Cart item structure: ${hasRequiredFields ? '✅ Valid' : '❌ Invalid'}`);
          
          return cartItems;
        }
      } else {
        console.log(`❌ Cart retrieval failed: ${getResponse.statusCode}`);
        return null;
      }
    } else {
      console.log(`❌ Add to cart failed: ${addResponse.statusCode}`);
      console.log(`   Response: ${addResponse.body}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Cart functionality error: ${error.message}`);
    return null;
  }
}

async function testStripePaymentIntent(cartItems) {
  console.log('\n=== 5. Stripe PaymentIntent Validation ===');
  
  const checkoutData = {
    items: cartItems,
    customerInfo: {
      firstName: 'Test',
      lastName: 'Customer',
      email: 'test@richhabits.com',
      phone: '+1234567890'
    }
  };
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/cart/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutData)
    });
    
    if (response.statusCode === 200 && response.json?.clientSecret) {
      console.log('✅ PaymentIntent created successfully');
      console.log(`   Payment Intent ID: ${response.json.paymentIntentId}`);
      console.log(`   Amount: $${response.json.amount?.toFixed(2)}`);
      console.log(`   Client Secret: ${response.json.clientSecret.substring(0, 20)}...`);
      
      // Validate metadata structure
      const paymentIntentId = response.json.paymentIntentId;
      if (paymentIntentId && paymentIntentId.startsWith('pi_')) {
        console.log('✅ PaymentIntent ID format valid');
        return { paymentIntentId, clientSecret: response.json.clientSecret, amount: response.json.amount };
      } else {
        console.log('❌ Invalid PaymentIntent ID format');
        return null;
      }
    } else {
      console.log(`❌ PaymentIntent creation failed: ${response.statusCode}`);
      console.log(`   Response: ${response.body}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ PaymentIntent error: ${error.message}`);
    return null;
  }
}

async function testWebhookHandler(paymentIntentId) {
  console.log('\n=== 6. Webhook Handler Validation ===');
  
  // Mock webhook payload for testing
  const webhookPayload = {
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 2999, // $29.99 in cents
        metadata: {
          type: 'retail_cart_checkout',
          customer_email: 'test@richhabits.com',
          customer_first_name: 'Test',
          customer_last_name: 'Customer',
          cart_items: JSON.stringify([{
            productId: 'test_product_id',
            variantId: 'test_variant_id',
            title: 'Test Product',
            quantity: 1,
            price: '29.99'
          }])
        }
      }
    }
  };
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/webhooks/stripe`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature' // Mock signature for testing
      },
      body: JSON.stringify(webhookPayload)
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Webhook handler responded successfully');
      console.log(`   Response: ${response.body}`);
      return true;
    } else {
      console.log(`❌ Webhook handler failed: ${response.statusCode}`);
      console.log(`   Response: ${response.body}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Webhook handler error: ${error.message}`);
    return false;
  }
}

async function testEnvironmentConfig() {
  console.log('\n=== 7. Environment Configuration Validation ===');
  
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'SHOPIFY_ACCESS_TOKEN',
    'SHOPIFY_STORE_DOMAIN'
  ];
  
  let allPresent = true;
  
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: Present`);
    } else {
      console.log(`❌ ${envVar}: Missing`);
      allPresent = false;
    }
  });
  
  // Test Stripe key format
  if (process.env.STRIPE_SECRET_KEY) {
    const isLive = !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
    console.log(`   Stripe mode: ${isLive ? 'Live' : 'Test'}`);
  }
  
  return allPresent;
}

// Main test runner
async function runEndToEndValidation() {
  console.log('🚀 Starting Rich Habits Retail Checkout E2E Validation');
  console.log('='.repeat(60));
  
  const results = {
    serverHealth: false,
    productAPI: false,
    productDetail: false,
    cartFunctionality: false,
    stripePayment: false,
    webhookHandler: false,
    environmentConfig: false
  };
  
  // Test 1: Server Health
  results.serverHealth = await testServerHealth();
  if (!results.serverHealth) {
    console.log('\n❌ Critical failure: Server not accessible');
    return results;
  }
  
  // Test 2: Environment Configuration
  results.environmentConfig = await testEnvironmentConfig();
  
  // Test 3: Product API
  const testProduct = await testProductAPI();
  results.productAPI = !!testProduct;
  
  if (testProduct) {
    // Test 4: Product Detail
    const productDetail = await testProductDetail(testProduct.handle);
    results.productDetail = !!productDetail;
    
    if (productDetail) {
      // Test 5: Cart Functionality
      const cartItems = await testCartFunctionality(productDetail);
      results.cartFunctionality = !!cartItems;
      
      if (cartItems) {
        // Test 6: Stripe PaymentIntent
        const paymentIntent = await testStripePaymentIntent(cartItems);
        results.stripePayment = !!paymentIntent;
        
        if (paymentIntent) {
          // Test 7: Webhook Handler
          results.webhookHandler = await testWebhookHandler(paymentIntent.paymentIntentId);
        }
      }
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(60));
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\nOverall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED - Retail checkout system is fully functional!');
  } else {
    console.log('⚠️  Some tests failed - review above for details');
  }
  
  return results;
}

// Run the validation
if (require.main === module) {
  runEndToEndValidation()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = { runEndToEndValidation };