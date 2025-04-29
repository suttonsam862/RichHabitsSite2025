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
 * to the payment page.
 * 
 * @param url The URL to navigate to
 */
export function forceNavigate(url: string): void {
  if (!url) {
    console.error('Attempted to force navigate to an empty URL');
    return;
  }

  console.log(`Force navigating to: ${url}`);
  
  try {
    // Try multiple methods to ensure navigation happens
    
    // Method 1: Use window.location.replace (most reliable)
    window.location.replace(url);
    
    // Method 2: Fallback to window.location.href
    setTimeout(() => {
      if (window.location.href !== url) {
        console.log('First redirect method failed, using window.location.href');
        window.location.href = url;
      }
    }, 200);
    
    // Method 3: Create a form and submit it
    setTimeout(() => {
      const form = document.createElement('form');
      form.method = 'GET';
      form.action = url;
      form.style.display = 'none';
      document.body.appendChild(form);
      form.submit();
    }, 400);
  } catch (error) {
    console.error('Error during force navigation:', error);
    
    // Last resort
    window.location.href = url;
  }
}