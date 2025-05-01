/**
 * This utility provides a direct fix for the Shopify redirection issue
 * where Shopify redirects to rich-habits.com instead of the myshopify domain,
 * causing 404 errors.
 */

// Domain settings
export const SHOPIFY_DOMAIN = 'rich-habits-2022.myshopify.com';
export const CUSTOM_DOMAIN = 'rich-habits.com';

// Development/testing mode - will force direct domain instead of relying on shopify
export const FORCE_MYSHOPIFY_DOMAIN = true;

/**
 * Directly creates a working Shopify checkout URL that bypasses the domain redirection issue
 * by going directly to the checkout rather than through the cart.
 * 
 * This approach creates a direct link to the Shopify checkout
 * that skips the cart step entirely and avoids redirection issues.
 */
export function createDirectShopifyCartUrl(variantId: string, quantity: number = 1): string {
  // Clean up variant ID to ensure it's just the numeric portion
  let cleanVariantId = variantId;
  
  if (cleanVariantId.includes('/')) {
    // Extract the numeric ID using regex if it's in the ProductVariant/ format
    const idMatch = cleanVariantId.match(/ProductVariant\/([0-9]+)/);
    if (idMatch && idMatch[1]) {
      cleanVariantId = idMatch[1];
    } else {
      // Otherwise try to get the last part after the slash
      cleanVariantId = cleanVariantId.split('/').pop() || cleanVariantId;
    }
  }
  
  // Remove any non-numeric characters
  cleanVariantId = cleanVariantId.replace(/\D/g, '');
  
  // Create a DIRECT CHECKOUT URL (not cart) that completely bypasses the redirect issue
  // This directly creates a checkout with the item already added
  const directCheckoutUrl = `https://${SHOPIFY_DOMAIN}/checkout/direct?line_items[variant_id]=${cleanVariantId}&line_items[quantity]=${quantity}`;
  
  return directCheckoutUrl;
}

/**
 * Create a direct product variant URL that will add the item to cart
 * This uses the /cart/add endpoint which sometimes redirects to the custom domain
 */
export function createAddToCartUrl(variantId: string, quantity: number = 1, returnUrl?: string): string {
  // Clean up variant ID to ensure it's just the numeric portion
  let cleanVariantId = variantId;
  
  if (cleanVariantId.includes('/')) {
    // Extract the numeric ID using regex if it's in the ProductVariant/ format
    const idMatch = cleanVariantId.match(/ProductVariant\/([0-9]+)/);
    if (idMatch && idMatch[1]) {
      cleanVariantId = idMatch[1];
    } else {
      // Otherwise try to get the last part after the slash
      cleanVariantId = cleanVariantId.split('/').pop() || cleanVariantId;
    }
  }
  
  // Remove any non-numeric characters
  cleanVariantId = cleanVariantId.replace(/\D/g, '');
  
  // Start with the base URL
  let addToCartUrl = `https://${SHOPIFY_DOMAIN}/cart/add?id=${cleanVariantId}&quantity=${quantity}&checkout_url=https://${SHOPIFY_DOMAIN}/checkout`;
  
  // Add return URL if provided
  if (returnUrl) {
    addToCartUrl += `&return_to=${encodeURIComponent(returnUrl)}`;
  }
  
  return addToCartUrl;
}

/**
 * Attempt direct checkout with a variant ID
 * This function tries multiple methods to ensure successful checkout
 */
export function attemptDirectCheckout(variantId: string, quantity: number = 1, successUrl?: string): void {
  // Clean up variant ID to ensure it's just the numeric portion
  let cleanVariantId = variantId;
  
  if (cleanVariantId.includes('/')) {
    // Extract the numeric ID using regex if it's in the ProductVariant/ format
    const idMatch = cleanVariantId.match(/ProductVariant\/([0-9]+)/);
    if (idMatch && idMatch[1]) {
      cleanVariantId = idMatch[1];
    } else {
      // Otherwise try to get the last part after the slash
      cleanVariantId = cleanVariantId.split('/').pop() || cleanVariantId;
    }
  }
  
  // Remove any non-numeric characters
  cleanVariantId = cleanVariantId.replace(/\D/g, '');
  
  // Force the use of myshopify domain for the return URL instead of relying on window.location
  // This prevents the redirect to rich-habits.com which causes 404 errors
  let checkoutSuccessUrl = successUrl;
  if (successUrl && FORCE_MYSHOPIFY_DOMAIN) {
    // Check if the success URL contains the Replit domain or localhost
    if (successUrl.includes('replit.dev') || successUrl.includes('localhost')) {
      console.log('Using original success URL (dev environment):', successUrl);
    } else {
      // Replace any rich-habits.com URLs with myshopify domain
      checkoutSuccessUrl = successUrl.replace(CUSTOM_DOMAIN, SHOPIFY_DOMAIN);
      console.log('Forcing myshopify domain for success URL:', checkoutSuccessUrl);
    }
  }
  
  // Create special bypass checkout URL that goes directly to checkout with the item
  // This completely bypasses any cart or domain redirection issues
  let checkoutUrlWithSuccessReturn = `https://${SHOPIFY_DOMAIN}/checkout/direct?line_items[variant_id]=${cleanVariantId}&line_items[quantity]=${quantity}`;
  
  // Add success return URL if provided (with proper domain)
  if (checkoutSuccessUrl) {
    checkoutUrlWithSuccessReturn += `&return_to=${encodeURIComponent(checkoutSuccessUrl)}`;
    console.log('Added success return URL:', checkoutSuccessUrl);
  }
  
  // Create a fallback direct-to-cart URL as a last resort
  const directCartUrl = `https://${SHOPIFY_DOMAIN}/cart/${cleanVariantId}:${quantity}`;
  
  // Store URLs as fallbacks in localStorage
  try {
    localStorage.setItem('shopify_checkout_url', checkoutUrlWithSuccessReturn);
    localStorage.setItem('shopify_cart_url', directCartUrl);
  } catch (e) {
    console.error('Failed to store URLs in localStorage:', e);
  }
  
  // Open Shopify checkout in a NEW TAB instead of current window
  console.log('Opening direct checkout in new tab:', checkoutUrlWithSuccessReturn);
  
  // Open in new tab and keep reference to the window
  const checkoutWindow = window.open(checkoutUrlWithSuccessReturn, '_blank');
  
  // If popup was blocked or failed to open
  if (!checkoutWindow || checkoutWindow.closed || typeof checkoutWindow.closed === 'undefined') {
    console.warn('Popup may have been blocked. Trying alternative approach...');
    // Fallback to a more direct approach if popup was blocked
    setTimeout(() => {
      window.open(checkoutUrlWithSuccessReturn, '_blank');
    }, 500);
  }
  
  // Set up a fallback method if needed
  // We'll store this URL in case the user needs to retry manually
  localStorage.setItem('shopify_fallback_url', directCartUrl);
}
