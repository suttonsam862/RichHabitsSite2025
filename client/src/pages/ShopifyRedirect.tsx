import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { navigateToShopifyCheckout } from '@/utils/shopifyUtils';

export default function ShopifyRedirect() {
  const [location, navigate] = useLocation();
  const [cartUrl, setCartUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

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
      console.log('Cart URL decoded:', decodedUrl);
      
      // Ensure the URL is well-formed
      let processedUrl = decodedUrl;
      if (!processedUrl.startsWith('http')) {
        processedUrl = 'https://' + processedUrl.replace(/^\/\//, '');
      } else if (processedUrl.startsWith('http://')) {
        processedUrl = 'https://' + processedUrl.substring(7);
      }
      
      // Ensure we're using the myshopify.com domain
      if (processedUrl.includes('rich-habits.com')) {
        processedUrl = processedUrl.replace('rich-habits.com', 'rich-habits-2022.myshopify.com');
      }
      
      console.log('Processed cart URL:', processedUrl);
      setCartUrl(processedUrl);
      setLoading(false);
      
      // Immediately attempt to redirect
      if (processedUrl) {
        console.log('Auto-redirecting to cart...');
        window.location.href = processedUrl;
        setRedirectAttempted(true);
      }
    } catch (error) {
      console.error('Error processing redirect URL:', error);
      setError('Failed to process the checkout URL. Please try again.');
      setLoading(false);
    }
  }, []);
  
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
  
  // Direct redirect to Shopify cart
  const redirectToCart = () => {
    if (cartUrl) {
      console.log('Manual redirect to cart page:', cartUrl);
      window.location.href = cartUrl;
      setRedirectAttempted(true);
    } else {
      setError('No cart URL available for redirect.');
    }
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
  
  // If we have a cart URL but the auto-redirect didn't work, show manual options
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <Helmet>
        <title>Complete Your Registration | Rich Habits</title>
      </Helmet>
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
        <div className="text-green-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Your Registration is Ready</h1>
        <p className="mb-6 text-gray-600">
          {redirectAttempted 
            ? "Your cart should be opening now. If it doesn't appear, please click the button below."
            : "Click the button below to continue to the Shopify cart to complete your registration."
          }
        </p>
        
        <div className="flex flex-col space-y-3">
          <button
            type="button"
            onClick={redirectToCart}
            className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 text-center"
          >
            Continue to Checkout
          </button>
          
          <button
            type="button"
            onClick={handleBackToRegistration}
            className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Return to Events
          </button>
          
          {cartUrl && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md text-left text-sm">
              <p className="font-medium mb-1">Having trouble?</p>
              <p>Copy and paste this link in your browser:</p>
              <div className="mt-1 p-2 bg-white rounded border border-gray-300 overflow-x-auto">
                <code className="text-xs break-all">{cartUrl}</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}