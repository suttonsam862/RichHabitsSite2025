/**
 * Utility functions for handling Shopify checkout redirects
 */

/**
 * Safely navigate to a Shopify checkout URL using multiple methods to ensure success
 * 
 * @param checkoutUrl The Shopify checkout URL
 */
export function navigateToShopifyCheckout(checkoutUrl: string) {
  try {
    console.log('Navigating to Shopify checkout:', checkoutUrl);
    
    // First attempt: Create a temporary form and submit it
    // This approach can sometimes bypass restrictions that affect direct navigation
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = checkoutUrl;
    form.target = '_self';
    document.body.appendChild(form);
    form.submit();
    
    // Fallback: If form submission doesn't work, try direct location change
    setTimeout(() => {
      console.log('Form submit fallback: Using direct location change');
      window.location.href = checkoutUrl;
    }, 500);
    
    // Second fallback: If the above methods don't work, try assign
    setTimeout(() => {
      console.log('Direct location fallback: Using location.assign');
      window.location.assign(checkoutUrl);
    }, 1000);
  } catch (e) {
    console.error('Failed to navigate to checkout:', e);
    
    // Final fallback: Just open in a new window
    console.log('All navigation methods failed, opening in new window');
    window.open(checkoutUrl, '_blank');
  }
}

/**
 * Open Shopify checkout in a new window
 * 
 * @param checkoutUrl The Shopify checkout URL
 * @returns True if the window was successfully opened
 */
export function openShopifyCheckoutInNewWindow(checkoutUrl: string): boolean {
  try {
    const newWindow = window.open(checkoutUrl, '_blank');
    if (newWindow) {
      newWindow.focus();
      return true;
    }
    return false;
  } catch (e) {
    console.error('Failed to open checkout in new window:', e);
    return false;
  }
}