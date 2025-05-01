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
      for (const [key, value] of queryParams.entries()) {
        if (key.startsWith('attributes[')) {
          cartAttributes[key] = value;
        }
      }
      
      // Log for debugging
      console.log('Redirecting to Shopify cart with variant ID:', variantId);
      
      // Use our new direct checkout utility that handles the redirection issues
      // directly with a special URL format that avoids rich-habits.com redirects
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

  // Simple loader or error display
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