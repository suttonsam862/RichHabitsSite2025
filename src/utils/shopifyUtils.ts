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
    
    // Most direct approach - immediately set location.href 
    // This is the most reliable for redirecting the entire page
    window.location.href = processedUrl;
    
    // Backup approach with small delay (for browsers where immediate redirect might be blocked)
    setTimeout(() => {
      console.log('Delayed redirect fallback');
      if (window.location.href !== processedUrl && document.visibilityState === 'visible') {
        // Try again if we're still on the same page
        window.location.replace(processedUrl);
      }
    }, 300);
    
    // Final fallback with form submit (works better in some old browsers)
    setTimeout(() => {
      console.log('Form submit fallback');
      if (window.location.href !== processedUrl && document.visibilityState === 'visible') {
        const form = document.createElement('form');
        form.method = 'GET';
        form.action = processedUrl;
        form.target = '_self';
        document.body.appendChild(form);
        form.submit();
        setTimeout(() => {
          if (document.body.contains(form)) {
            document.body.removeChild(form);
          }
        }, 100);
      }
    }, 800);
  } catch (e) {
    console.error('Failed to navigate to checkout:', e);
    
    // Final fallback: Just open in a new window
    console.log('All navigation methods failed, opening in new window');
    try {
      window.open(checkoutUrl, '_blank');
    } catch (err) {
      // Last resort - alert with URL if all methods fail
      alert('Unable to open checkout automatically. Please copy this URL and open it manually: ' + checkoutUrl);
    }
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
    
    // Try direct window.open first - most reliable in modern browsers
    const newWindow = window.open(processedUrl, '_blank');
    
    if (newWindow) {
      newWindow.focus();
      return true;
    }
    
    // Fallback: Try creating an anchor element with target="_blank" 
    // This may work in some browsers that block direct window.open calls
    const link = document.createElement('a');
    link.href = processedUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Make it visible briefly and look like a button for better popup chances
    link.style.position = 'fixed';
    link.style.bottom = '20px';
    link.style.right = '20px';
    link.style.padding = '10px';
    link.style.backgroundColor = '#000';
    link.style.color = '#fff';
    link.style.borderRadius = '4px';
    link.style.zIndex = '9999';
    link.innerHTML = 'Open Checkout';
    
    document.body.appendChild(link);
    
    // First click programmatically
    link.click();
    
    // If we're still here after 500ms, alert the user to click manually
    const timer = setTimeout(() => {
      if (document.body.contains(link)) {
        alert('Please click the "Open Checkout" button to complete your purchase. Your browser may be blocking popups.');
        link.style.animation = 'pulse 1s infinite';
        
        // Add a close button next to it
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Dismiss';
        closeBtn.style.position = 'fixed';
        closeBtn.style.bottom = '20px';
        closeBtn.style.right = '150px';
        closeBtn.style.padding = '10px';
        closeBtn.style.backgroundColor = '#444';
        closeBtn.style.color = '#fff';
        closeBtn.style.borderRadius = '4px';
        closeBtn.style.zIndex = '9999';
        
        closeBtn.onclick = () => {
          if (document.body.contains(link)) document.body.removeChild(link);
          if (document.body.contains(closeBtn)) document.body.removeChild(closeBtn);
        };
        
        document.body.appendChild(closeBtn);
      }
    }, 500);
    
    // Remove the link if user navigates away
    window.addEventListener('beforeunload', () => {
      clearTimeout(timer);
      if (document.body.contains(link)) document.body.removeChild(link);
    }, { once: true });
    
    return true;
  } catch (e) {
    console.error('Failed to open checkout in new window:', e);
    
    // Last resort fallback - show a message with the URL
    try {
      alert('Unable to open checkout in a new window. Please copy this URL and open it manually: ' + checkoutUrl);
    } catch (err) {
      console.error('Even alert fallback failed:', err);
    }
    
    return false;
  }
}