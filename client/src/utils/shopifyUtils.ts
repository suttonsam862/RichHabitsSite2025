/**
 * Utility functions for handling Shopify checkout redirects
 */

/**
 * Ensures a URL uses HTTPS protocol and has the correct Shopify domain
 * 
 * @param url The URL to process
 * @returns A properly formatted HTTPS URL
 */
export function ensureHttpsUrl(url: string): string {
  if (!url) return url;
  
  // Check if URL already has a protocol
  let processedUrl = url;
  
  // Remove any leading slashes (common in some server responses)
  processedUrl = processedUrl.replace(/^\/\//, '');
  
  // Ensure https protocol
  if (!processedUrl.startsWith('http')) {
    processedUrl = 'https://' + processedUrl; 
  } else if (processedUrl.startsWith('http://')) {
    processedUrl = 'https://' + processedUrl.substring(7);
  }
  
  // If the URL is for rich-habits.com, change it to rich-habits-2022.myshopify.com
  // This is because Shopify sometimes returns URLs for the main store domain instead of the checkout domain
  if (processedUrl.includes('rich-habits.com')) {
    processedUrl = processedUrl.replace('rich-habits.com', 'rich-habits-2022.myshopify.com');
  }
  
  return processedUrl;
}

/**
 * Safely navigate to a Shopify checkout URL using multiple methods to ensure success
 * 
 * @param checkoutUrl The Shopify checkout URL
 */
export function navigateToShopifyCheckout(checkoutUrl: string) {
  try {
    console.log('Navigating to Shopify checkout:', checkoutUrl);
    
    // Clean the URL and ensure proper formatting
    let processedUrl = ensureHttpsUrl(checkoutUrl);
    console.log('Using processed URL:', processedUrl);
    
    // Create a direct URL element - this is a more robust way to navigate
    // that can avoid some browser security restrictions on redirects
    const directLink = document.createElement('a');
    directLink.href = processedUrl;
    directLink.style.display = 'none';
    directLink.target = '_self';
    directLink.rel = 'noopener noreferrer';
    directLink.innerHTML = 'Checkout';
    
    // Add to DOM, click it, then clean up
    document.body.appendChild(directLink);
    directLink.click();
    
    // Fallback: If the click doesn't work, try form submission
    // This approach can sometimes bypass restrictions that affect direct navigation
    setTimeout(() => {
      console.log('Link click fallback: Using form submit');
      const form = document.createElement('form');
      form.method = 'GET';
      form.action = processedUrl;
      form.target = '_self';
      document.body.appendChild(form);
      form.submit();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(form);
      }, 100);
    }, 200);
    
    // Final fallback: Direct location change as last resort
    setTimeout(() => {
      console.log('Form submit fallback: Using location.href');
      window.location.href = processedUrl;
    }, 500);
    
    // Cleanup the link element
    setTimeout(() => {
      if (document.body.contains(directLink)) {
        document.body.removeChild(directLink);
      }
    }, 100);
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
    // Clean the URL first
    const processedUrl = ensureHttpsUrl(checkoutUrl);
    console.log('Opening in new window with processed URL:', processedUrl);
    
    // Try using an anchor tag first (can bypass some security restrictions)
    const link = document.createElement('a');
    link.href = processedUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Fallback to window.open
    setTimeout(() => {
      const newWindow = window.open(processedUrl, '_blank');
      if (newWindow) {
        newWindow.focus();
      }
      
      // Clean up the link element
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 100);
    
    return true;
  } catch (e) {
    console.error('Failed to open checkout in new window:', e);
    
    // Last resort fallback
    try {
      window.open(checkoutUrl, '_blank');
    } catch (err) {
      console.error('Even fallback window.open failed:', err);
    }
    
    return false;
  }
}