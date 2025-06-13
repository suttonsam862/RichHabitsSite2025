/**
 * Test Cart Functionality with Session Persistence
 * Uses a single session to test complete cart flow
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Cookie jar to maintain session
let sessionCookie = null;

async function makeRequest(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (sessionCookie) {
    headers['Cookie'] = sessionCookie;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // Extract and store session cookie
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    sessionCookie = setCookie.split(';')[0];
  }
  
  return response;
}

async function testCartWithSession() {
  console.log('🛒 Testing Cart Functionality with Session Persistence\n');

  try {
    // 1. Get products
    console.log('1. Fetching products...');
    const productsResponse = await makeRequest(`${BASE_URL}/api/products`);
    const products = await productsResponse.json();
    
    if (!Array.isArray(products) || products.length === 0) {
      console.log('❌ No products available for testing');
      return;
    }
    
    console.log(`✅ Found ${products.length} products`);
    const testProduct = products[0];
    console.log(`   Testing with: ${testProduct.title}`);

    // 2. Check initial cart state
    console.log('\n2. Checking initial cart state...');
    const initialCartResponse = await makeRequest(`${BASE_URL}/api/cart`);
    const initialCart = await initialCartResponse.json();
    console.log(`   Initial cart items: ${initialCart.cartItems?.length || 0}`);
    console.log(`   Session cookie: ${sessionCookie ? 'Present' : 'None'}`);

    // 3. Add item to cart
    console.log('\n3. Adding item to cart...');
    const defaultVariant = testProduct.variants?.[0];
    const addToCartPayload = {
      shopifyProductId: testProduct.id,
      shopifyVariantId: defaultVariant.id,
      productHandle: testProduct.handle,
      productTitle: testProduct.title,
      variantTitle: defaultVariant.title || 'Default',
      price: parseFloat(defaultVariant.price?.replace('$', '') || '0'),
      quantity: 1,
      productImage: testProduct.images?.[0]?.src || '',
      productType: 'Product',
      vendor: 'Rich Habits'
    };

    const addResponse = await makeRequest(`${BASE_URL}/api/cart/add`, {
      method: 'POST',
      body: JSON.stringify(addToCartPayload)
    });

    const addResult = await addResponse.json();
    if (addResult.success) {
      console.log('✅ Item added to cart successfully');
      console.log(`   Cart item ID: ${addResult.cartItem.id}`);
    } else {
      console.log('❌ Failed to add item to cart:', addResult.error);
      return;
    }

    // 4. Verify cart now contains the item (same session)
    console.log('\n4. Verifying cart contains the item...');
    const updatedCartResponse = await makeRequest(`${BASE_URL}/api/cart`);
    const updatedCart = await updatedCartResponse.json();
    
    console.log('   Updated cart response:', JSON.stringify(updatedCart, null, 2));
    
    if (updatedCart.success && updatedCart.cartItems?.length > 0) {
      console.log('✅ Cart persistence working correctly');
      console.log(`   Items in cart: ${updatedCart.cartItems.length}`);
      console.log(`   Total quantity: ${updatedCart.itemCount}`);
      console.log(`   Subtotal: $${updatedCart.subtotal}`);
      
      // 5. Add another item to test quantity updates
      console.log('\n5. Adding same item again to test quantity update...');
      const secondAddResponse = await makeRequest(`${BASE_URL}/api/cart/add`, {
        method: 'POST',
        body: JSON.stringify(addToCartPayload)
      });
      
      const secondAddResult = await secondAddResponse.json();
      if (secondAddResult.success) {
        console.log('✅ Second item added successfully');
        
        // Check if quantity increased
        const finalCartResponse = await makeRequest(`${BASE_URL}/api/cart`);
        const finalCart = await finalCartResponse.json();
        
        if (finalCart.cartItems.length === 1 && finalCart.cartItems[0].quantity === 2) {
          console.log('✅ Quantity update working correctly');
          console.log(`   Final quantity: ${finalCart.cartItems[0].quantity}`);
        } else {
          console.log('❌ Quantity update not working as expected');
        }
      }
      
    } else {
      console.log('❌ Cart still empty - session not persisting');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCartWithSession();