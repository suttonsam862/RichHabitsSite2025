/**
 * This utility provides a direct fix for the Shopify redirection issue
 * where Shopify redirects to rich-habits.com instead of the myshopify domain,
 * causing 404 errors.
 */

export const SHOPIFY_DOMAIN = 'rich-habits-2022.myshopify.com';
export const CUSTOM_DOMAIN = 'rich-habits.com';

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
  // Create both kinds of URLs
  const directCheckoutUrl = createDirectShopifyCartUrl(variantId, quantity);
  const addToCartUrl = createAddToCartUrl(variantId, quantity);
  
  // Append success return URL if provided
  let checkoutUrlWithSuccessReturn = directCheckoutUrl;
  if (successUrl) {
    checkoutUrlWithSuccessReturn = `${directCheckoutUrl}&return_to=${encodeURIComponent(successUrl)}`;
    console.log('Added success return URL:', successUrl);
  }
  
  // Store the direct checkout URL as a fallback in localStorage
  try {
    localStorage.setItem('shopify_fallback_url', checkoutUrlWithSuccessReturn);
    localStorage.setItem('shopify_add_to_cart_url', addToCartUrl);
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
    window.open(checkoutUrlWithSuccessReturn, '_blank');
  }
  
  // Set up a fallback method if needed
  // We'll store this URL in case the user needs to retry manually
  localStorage.setItem('shopify_fallback_url', addToCartUrl);
}
