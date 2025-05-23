/**
 * Utility functions for handling redirects in the application
 */

/**
 * Performs a robust redirect to an external URL using multiple methods
 * to ensure the redirect happens even if one method fails.
 * 
 * @param url The URL to redirect to
 * @param openInNewTab Whether to open the URL in a new tab (defaults to true for external URLs)
 */
export function robustRedirect(url: string, openInNewTab: boolean = true): void {
  if (!url) {
    console.error('Attempted to redirect to an empty URL');
    return;
  }

  console.log(`Initiating robust redirect to: ${url}`);
  
  try {
    // Method 1: Create and click a link element
    const link = document.createElement('a');
    link.href = url;
    
    if (openInNewTab) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Method 2: Fallback to window.location.replace
    if (!openInNewTab) {
      setTimeout(() => {
        console.log(`Fallback redirect using window.location.replace to: ${url}`);
        window.location.replace(url);
      }, 100);
    }
  } catch (error) {
    console.error('Error during redirection:', error);
    
    // Method 3: Last resort - use basic assignment
    if (openInNewTab) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  }
}

/**
 * Forces the browser to navigate to the provided URL, closing the current page
 * This is useful for checkout flows where you want to ensure the user is directed
 * to the payment page. Specifically designed for Shopify checkout redirects.
 * 
 * @param url The Shopify checkout URL to navigate to
 */
export function forceNavigate(url: string): void {
  if (!url) {
    console.error('Attempted to force navigate to an empty URL');
    return;
  }

  // Format the URL properly if needed
  let formattedUrl = url;
  if (!formattedUrl.startsWith('http')) {
    formattedUrl = 'https://' + formattedUrl;
  }

  console.log(`Force navigating to Shopify checkout: ${formattedUrl}`);
  
  try {
    // For Shopify redirect, we'll use a more aggressive approach
    
    // First, create an anchor and trigger it with window.open
    const shopifyRedirectLink = document.createElement('a');
    shopifyRedirectLink.href = formattedUrl;
    shopifyRedirectLink.target = '_self'; // Replace current window
    shopifyRedirectLink.setAttribute('data-checkout-redirect', 'true');
    document.body.appendChild(shopifyRedirectLink);
    
    // Click the link
    shopifyRedirectLink.click();
    
    // Remove the link
    document.body.removeChild(shopifyRedirectLink);
    
    // Secondary redirect methods
    setTimeout(() => {
      // Method 2: Try window.location.replace with a slight delay
      console.log('Applying secondary redirect method using window.location.replace');
      window.location.replace(formattedUrl);
      
      // Method 3: Final attempt with direct assignment and form submission
      setTimeout(() => {
        console.log('Applying tertiary redirect methods...');
        
        // Direct assignment
        window.location.href = formattedUrl;
        
        // Submit a form (good for bypassing some browser restrictions)
        const form = document.createElement('form');
        form.method = 'GET';
        form.action = formattedUrl;
        form.target = '_self';
        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
      }, 300);
    }, 200);
    
    // Display a redirect message to the user
    const redirectMessage = document.createElement('div');
    redirectMessage.style.position = 'fixed';
    redirectMessage.style.top = '50%';
    redirectMessage.style.left = '50%';
    redirectMessage.style.transform = 'translate(-50%, -50%)';
    redirectMessage.style.background = 'white';
    redirectMessage.style.padding = '20px';
    redirectMessage.style.borderRadius = '8px';
    redirectMessage.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    redirectMessage.style.zIndex = '9999';
    redirectMessage.style.textAlign = 'center';
    
    redirectMessage.innerHTML = `
      <h3 style="margin-top: 0; font-size: 18px;">Redirecting to Checkout</h3>
      <p>You are being redirected to the secure payment page...</p>
      <div style="margin: 15px 0;">
        <div style="width: 30px; height: 30px; border: 3px solid #f3f3f3; 
             border-top: 3px solid #2563eb; border-radius: 50%; 
             display: inline-block; animation: spin 1s linear infinite;"></div>
      </div>
      <a href="${formattedUrl}" style="color: #2563eb; display: block; margin-top: 10px;">
        Click here if you are not redirected automatically
      </a>
      <style>
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
      </style>
    `;
    
    document.body.appendChild(redirectMessage);
    
    // Remove the message after a while if for some reason we're still on the page
    setTimeout(() => {
      if (document.body.contains(redirectMessage)) {
        document.body.removeChild(redirectMessage);
      }
    }, 8000);
    
  } catch (error) {
    console.error('Error during force navigation:', error);
    
    // Last resort if all else fails
    window.open(formattedUrl, '_self');
  }
}