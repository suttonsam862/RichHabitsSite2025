import Client from 'shopify-buy';

// Initialize a new Shopify client
// We need to hardcode the token since it's a public token intended for client-side use
const shopifyClient = Client.buildClient({
  domain: 'rich-habits-2022.myshopify.com',
  // Using the Shopify Storefront token directly here as it's meant to be public
  // and used on the client-side (unlike the admin API token which must remain private)
  storefrontAccessToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || 'b0ba3ad2da5c1c5ade553d1bc8d198db',
});

export default shopifyClient;

// Function to create a checkout URL from a variant ID
export async function createCheckoutWithVariant(variantId: string, customAttributes: any[] = []) {
  try {
    // Create a checkout
    const checkout = await shopifyClient.checkout.create();
    
    // Format the variant ID correctly for Shopify Buy SDK
    let formattedVariantId = variantId;
    
    // Handle various variant ID formats
    if (formattedVariantId.includes('ProductVariant/')) {
      // Extract just the ID part from GraphQL format
      const idMatch = formattedVariantId.match(/ProductVariant\/([0-9]+)/);
      if (idMatch && idMatch[1]) {
        formattedVariantId = `gid://shopify/ProductVariant/${idMatch[1]}`;
        console.log('Extracted and reformatted variant ID for checkout:', formattedVariantId);
      }
    } else if (!formattedVariantId.startsWith('gid://')) {
      // Simple numeric ID, add proper prefix
      formattedVariantId = `gid://shopify/ProductVariant/${variantId}`;
      console.log('Added prefix to variant ID for checkout:', formattedVariantId);
    }
    
    // Add the line item to the checkout
    const lineItems = [
      {
        variantId: formattedVariantId,
        quantity: 1,
        customAttributes
      }
    ];
    
    // Update the checkout with the line items
    const updatedCheckout = await shopifyClient.checkout.addLineItems(checkout.id, lineItems);
    
    // Log success for debugging
    console.log('Created checkout successfully:', {
      id: updatedCheckout.id,
      webUrl: updatedCheckout.webUrl,
      subtotalPrice: updatedCheckout.subtotalPrice
    });
    
    // Return the checkout URL
    return {
      id: updatedCheckout.id,
      webUrl: updatedCheckout.webUrl,
      subtotalPrice: updatedCheckout.subtotalPrice,
      totalPrice: updatedCheckout.totalPrice
    };
  } catch (error) {
    console.error('Error creating checkout:', error);
    
    // Provide more detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Create a fallback direct cart URL
    const fallbackUrl = `https://rich-habits-2022.myshopify.com/cart/${
      variantId.replace('gid://shopify/ProductVariant/', '')
    }:1`;
    console.log('Created fallback direct cart URL:', fallbackUrl);
    
    // Re-throw the original error with the fallback URL included
    throw Object.assign(new Error(`Checkout creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`), {
      fallbackUrl
    });
  }
}

// Function to fetch a cart
export async function getCart(cartId: string) {
  try {
    // Fetch the cart
    const cart = await shopifyClient.checkout.fetch(cartId);
    
    return cart;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
}

// Function to add a product to an existing cart
export async function addToCart(cartId: string, variantId: string, quantity: number = 1, customAttributes: any[] = []) {
  try {
    console.log('Adding to cart:', { cartId, variantId, quantity, customAttributes });
    
    // Ensure the variant ID is in the correct format for Shopify Storefront API
    // It should look like "gid://shopify/ProductVariant/12345"
    let formattedVariantId = variantId;
    
    // For direct add to cart fallback, remove any Shopify API prefix
    // This handles multiple variant ID formats:
    // - Raw ID (12345)
    // - gid://shopify/ProductVariant/12345 (GraphQL ID)
    // - ProductVariant/12345 (relative path)
    if (formattedVariantId.includes('ProductVariant/')) {
      // Extract just the ID part from GraphQL format
      const idMatch = formattedVariantId.match(/ProductVariant\/([0-9]+)/);
      if (idMatch && idMatch[1]) {
        formattedVariantId = `gid://shopify/ProductVariant/${idMatch[1]}`;
        console.log('Extracted and reformatted variant ID:', formattedVariantId);
      }
    } else if (!formattedVariantId.startsWith('gid://')) {
      // Simple numeric ID, add proper prefix
      formattedVariantId = `gid://shopify/ProductVariant/${variantId}`;
      console.log('Added prefix to variant ID:', formattedVariantId);
    }
    
    // Add the line item to the cart
    const lineItems = [
      {
        variantId: formattedVariantId,
        quantity,
        customAttributes
      }
    ];
    
    console.log('Sending line items to Shopify:', lineItems);
    
    const updatedCart = await shopifyClient.checkout.addLineItems(cartId, lineItems);
    console.log('Cart updated successfully:', updatedCart);
    
    return updatedCart;
  } catch (error) {
    console.error('Error adding to cart:', error);
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error type:', typeof error);
    }
    
    // Rethrow with a more helpful message
    throw new Error(`Failed to add item to cart: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}