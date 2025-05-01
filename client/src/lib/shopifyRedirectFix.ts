/**
 * This utility provides a direct fix for the Shopify redirection issue
 * where Shopify redirects to rich-habits.com instead of the myshopify domain,
 * causing 404 errors.
 */

export const SHOPIFY_DOMAIN = 'rich-habits-2022.myshopify.com';
export const CUSTOM_DOMAIN = 'rich-habits.com';

/**
 * Directly creates a working Shopify cart URL that bypasses the domain redirection issue
 * by using a specific format that works consistently.
 * 
 * This approach creates a special direct link to the Shopify cart
 * that doesn't redirect to the custom domain.
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
  
  // Create a cart URL with a special format that works to bypass domain redirection
  // The key is to use /cart/{variant_id}:{quantity} format WITH the checkout_url parameter
  const directCartUrl = `https://${SHOPIFY_DOMAIN}/cart/${cleanVariantId}:${quantity}?checkout_url=https://${SHOPIFY_DOMAIN}/checkout`;
  
  return directCartUrl;
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
export function attemptDirectCheckout(variantId: string, quantity: number = 1): void {
  // Create both kinds of URLs
  const directCartUrl = createDirectShopifyCartUrl(variantId, quantity);
  const addToCartUrl = createAddToCartUrl(variantId, quantity);
  
  // Store the direct cart URL as a fallback in localStorage
  try {
    localStorage.setItem('shopify_fallback_url', directCartUrl);
    localStorage.setItem('shopify_add_to_cart_url', addToCartUrl);
  } catch (e) {
    console.error('Failed to store URLs in localStorage:', e);
  }
  
  // Try the direct cart URL first as it's more reliable
  console.log('Attempting direct checkout with URL:', directCartUrl);
  window.location.href = directCartUrl;
  
  // Set up a fallback in case the first method fails
  setTimeout(() => {
    if (document.visibilityState === 'visible') {
      console.log('First checkout attempt may have failed, trying alternative method...');
      const fallbackUrl = localStorage.getItem('shopify_add_to_cart_url') || addToCartUrl;
      window.location.href = fallbackUrl;
    }
  }, 2500);
}
