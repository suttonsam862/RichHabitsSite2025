/**
 * This page handles redirecting to Shopify for cart and checkout operations.
 */
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '../hooks/use-toast';
import { attemptDirectCheckout, createDirectShopifyCartUrl } from '../lib/shopifyRedirectFix';

export default function ShopifyRedirect() {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [checkoutStarted, setCheckoutStarted] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get query parameters from URL
    const queryParams = new URLSearchParams(window.location.search);
    const variantId = queryParams.get('variantId');
    
    // Get checkout URL from query parameters
    let checkoutUrl = queryParams.get('checkout_url');
    
    // No variant ID, can't proceed
    if (!variantId) {
      setError('No product variant ID provided');
      toast({
        title: 'Error',
        description: 'Missing product information for checkout',
        variant: 'destructive',
      });
      return;
    }

    // Process the variant ID and create a Shopify cart URL
    try {
      // Create Shopify cart URL
      let shopifyRedirectUrl = '';
      
      // Default to the myshopify domain if no checkout URL is provided
      if (!checkoutUrl) {
        checkoutUrl = 'https://rich-habits-2022.myshopify.com/checkout';
      }
      
      // Rebuild query parameters for cart attributes
      const cartAttributes: Record<string, string> = {};
      // Copy attributes from original URL
      // Use Array.from to avoid TypeScript iteration issues
      Array.from(queryParams.entries()).forEach(([key, value]) => {
        if (key.startsWith('attributes[')) {
          cartAttributes[key] = value;
        }
      });
      
      // Log for debugging

      // Create direct cart URL for storage/display
      const directUrl = createDirectShopifyCartUrl(variantId, 1);
      setCheckoutUrl(directUrl);
      
      // Show success message in current tab
      setCheckoutStarted(true);
      
      // Use our new direct checkout utility that handles the redirection issues
      // directly with a special URL format that avoids rich-habits.com redirects
      // This will open the checkout in a new tab instead of redirecting the current window
      attemptDirectCheckout(variantId, 1);
    } catch (err) {
      // Handle any errors during redirect
      console.error('Error redirecting to Shopify:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      toast({
        title: 'Checkout Error',
        description: 'Failed to create checkout URL',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Success state
  if (checkoutStarted && checkoutUrl) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-md">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Checkout Started</h1>
          <p className="text-gray-600 text-center mb-6">
            The secure checkout page has been opened in a new tab. Please complete your payment there.
          </p>
          <p className="text-gray-500 text-sm mb-8 text-center">
            If you don't see the checkout page, your browser may have blocked the popup. Please check for popup notifications at the top of your browser.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => {
                // Get stored checkout URL from localStorage (preferred) or use the one in state
                const storedUrl = localStorage.getItem('shopify_checkout_url') || checkoutUrl;
                
                // Open the checkout URL in a new tab again
                window.open(storedUrl, '_blank');
                
                toast({
                  title: "Opening Checkout Again",
                  description: "Opening the secure payment page in a new tab...",
                });
              }}
              className="w-full px-4 py-2 bg-primary text-white rounded-md text-center hover:bg-primary/90 transition-colors"
            >
              Open Checkout Again
            </button>
            
            <a 
              href="/events" 
              className="block px-4 py-2 bg-gray-700 text-white rounded-md text-center hover:bg-gray-800 transition-colors"
            >
              Return to Events
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  // Error or loading state
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-md">
        {error ? (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Checkout Error</h1>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={() => navigate('/events')}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Return to Events
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Preparing Checkout</h1>
            <div className="flex justify-center mb-6">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600">
              Please wait while we redirect you to the secure payment page...
            </p>
          </>
        )}
      </div>
    </div>
  );
}