import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import ShopifyCheckoutFrame from '@/components/ShopifyCheckoutFrame';

export default function ShopifyRedirect() {
  const [location, navigate] = useLocation();
  const [checkoutUrl, setCheckoutUrl] = useState<string>('');
  const [countdown, setCountdown] = useState(5);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Extract the URL from the query parameters
      const params = new URLSearchParams(window.location.search);
      const encodedUrl = params.get('url');
      
      if (!encodedUrl) {
        setError('No checkout URL provided. Please return to the registration page.');
        return;
      }
      
      // Decode the URL
      const decodedUrl = decodeURIComponent(encodedUrl);
      setCheckoutUrl(decodedUrl);
      
      // Start countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setRedirecting(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    } catch (error) {
      console.error('Error processing redirect URL:', error);
      setError('Failed to process the checkout URL. Please try again.');
    }
  }, []);
  
  // Redirect after countdown
  useEffect(() => {
    if (redirecting && checkoutUrl) {
      // We'll handle this with our embedded checkout instead of redirecting
    }
  }, [redirecting, checkoutUrl]);
  
  // Handle manual redirect
  const handleManualRedirect = () => {
    if (checkoutUrl) {
      window.open(checkoutUrl, '_self');
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
          <button
            onClick={handleBackToRegistration}
            className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary/90"
          >
            Return to Registration
          </button>
        </div>
      </div>
    );
  }
  
  if (checkoutUrl) {
    return (
      <ShopifyCheckoutFrame 
        checkoutUrl={checkoutUrl} 
        onClose={handleCloseCheckout} 
      />
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <Helmet>
        <title>Redirecting to Checkout | Rich Habits</title>
      </Helmet>
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Preparing Your Checkout</h1>
        <p className="mb-6 text-gray-600">
          You will be redirected to the secure payment page in {countdown} {countdown === 1 ? 'second' : 'seconds'}...
        </p>
        <div className="flex space-x-4">
          <button
            onClick={handleBackToRegistration}
            className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleManualRedirect}
            className="flex-1 py-2 px-4 bg-primary text-white rounded hover:bg-primary/90"
          >
            Continue Now
          </button>
        </div>
      </div>
    </div>
  );
}