import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { navigateToShopifyCheckout, openShopifyCheckoutInNewWindow } from '@/utils/shopifyUtils';

export default function ShopifyRedirect() {
  const [location, navigate] = useLocation();
  const [checkoutUrl, setCheckoutUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Direct redirect to Shopify checkout (memoized)
  const redirectToShopify = useCallback(() => {
    if (checkoutUrl) {
      console.log('Redirecting directly to Shopify:', checkoutUrl);
      navigateToShopifyCheckout(checkoutUrl);
    } else {
      setError('No checkout URL available for redirect.');
    }
  }, [checkoutUrl]);

  // Process URL from query parameters
  useEffect(() => {
    try {
      // Extract the URL from the query parameters
      const params = new URLSearchParams(window.location.search);
      const encodedUrl = params.get('url');
      
      if (!encodedUrl) {
        setError('No checkout URL provided. Please return to the registration page.');
        setLoading(false);
        return;
      }
      
      // Decode the URL
      const decodedUrl = decodeURIComponent(encodedUrl);
      console.log('Checkout URL decoded:', decodedUrl);
      
      // Ensure the URL is well-formed with https://
      let processedUrl = decodedUrl;
      if (!processedUrl.startsWith('http')) {
        processedUrl = 'https://' + processedUrl.replace(/^\/\//, '');
      } else if (processedUrl.startsWith('http://')) {
        processedUrl = 'https://' + processedUrl.substring(7);
      }
      
      console.log('Processed checkout URL:', processedUrl);
      setCheckoutUrl(processedUrl);
      setLoading(false);
    } catch (error) {
      console.error('Error processing redirect URL:', error);
      setError('Failed to process the checkout URL. Please try again.');
      setLoading(false);
    }
  }, []);
  
  // Add a fallback direct redirect timer
  useEffect(() => {
    if (!checkoutUrl || loading) return;
    
    const timer = setTimeout(() => {
      // After 10 seconds, if we're still on this page, automatically redirect
      console.log('Fallback redirect timer triggered');
      if (document.visibilityState === 'visible') {
        console.log('Automatically redirecting to Shopify...');
        redirectToShopify();
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [checkoutUrl, loading, redirectToShopify]);
  
  // Open checkout in a new window/tab
  const openInNewWindow = () => {
    if (checkoutUrl) {
      const success = openShopifyCheckoutInNewWindow(checkoutUrl);
      if (!success) {
        alert('Please allow popups for this site to open the checkout in a new window.');
      }
    } else {
      setError('No checkout URL available to open.');
    }
  };
  
  // Handle back to registration
  const handleBackToRegistration = () => {
    // Extract event ID from URL if available, otherwise default to events page
    try {
      const referrer = document.referrer;
      if (referrer && referrer.includes('/events/')) {
        const eventIdMatch = referrer.match(/\/events\/(\d+)\/register/);
        if (eventIdMatch && eventIdMatch[1]) {
          navigate(`/events/${eventIdMatch[1]}`);
          return;
        }
      }
    } catch (error) {
      console.error('Error extracting event ID:', error);
    }
    
    // Default fallback
    navigate('/events');
  };
  
  // Handle closing the checkout frame
  const handleCloseCheckout = () => {
    handleBackToRegistration();
  };
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <Helmet>
          <title>Checkout Error | Rich Habits</title>
        </Helmet>
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-4">Checkout Error</h1>
          <p className="mb-6 text-gray-600">{error}</p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleBackToRegistration}
              className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary/90"
            >
              Return to Registration
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <Helmet>
          <title>Preparing Checkout | Rich Habits</title>
        </Helmet>
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Preparing Your Checkout</h1>
          <p className="mb-6 text-gray-600">
            Please wait while we prepare your secure checkout page...
          </p>
        </div>
      </div>
    );
  }
  
  if (checkoutUrl) {
    // Instead of showing the iframe, auto-redirect after a short delay
    useEffect(() => {
      // Redirect to Shopify checkout after 1.5 seconds
      const redirectTimer = setTimeout(() => {
        console.log('Auto-redirecting to Shopify checkout...');
        redirectToShopify();
      }, 1500);
      
      return () => clearTimeout(redirectTimer);
    }, [checkoutUrl, redirectToShopify]);
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <Helmet>
          <title>Complete Your Registration | Rich Habits</title>
        </Helmet>
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Redirecting to Checkout</h1>
          <p className="mb-6 text-gray-600">
            You are being redirected to the secure checkout page...
          </p>
          
          <p className="text-gray-600 mb-6">
            If the checkout doesn't appear, please use one of these options:
          </p>
          <div className="flex flex-col space-y-3">
            <button
              type="button"
              onClick={() => redirectToShopify()}
              className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 text-center"
            >
              Go to Shopify Checkout
            </button>
            <button
              type="button"
              onClick={openInNewWindow}
              className="w-full py-2 px-4 bg-black text-white rounded hover:bg-black/90 text-center"
            >
              Open in New Window
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Fallback if somehow we get here without a URL or loading state
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <Helmet>
        <title>Checkout | Rich Habits</title>
      </Helmet>
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-2">Checkout Options</h1>
        <p className="mb-6 text-gray-600">
          Please select how you would like to proceed with your checkout:
        </p>
        <div className="flex flex-col space-y-3">
          <button
            type="button"
            onClick={() => {
              navigateToShopifyCheckout(checkoutUrl);
            }}
            className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 text-center"
          >
            Go to Shopify Checkout
          </button>
          <button
            type="button"
            onClick={() => {
              openShopifyCheckoutInNewWindow(checkoutUrl);
            }}
            className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary/90 text-center"
          >
            Open in New Window
          </button>
          <button
            type="button"
            onClick={handleBackToRegistration}
            className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Return to Registration
          </button>
        </div>
      </div>
    </div>
  );
}