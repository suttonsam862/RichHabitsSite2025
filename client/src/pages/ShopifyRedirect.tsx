import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export default function ShopifyRedirect() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Get the checkout URL from the URL parameters
    const params = new URLSearchParams(window.location.search);
    const encodedCheckoutUrl = params.get('url');
    
    if (!encodedCheckoutUrl) {
      setError('No checkout URL provided. Please try again or contact support.');
      return;
    }
    
    try {
      // Decode the URL
      const checkoutUrl = decodeURIComponent(encodedCheckoutUrl);
      console.log('Decoded checkout URL:', checkoutUrl);
      
      // Check if it's a valid URL
      if (!checkoutUrl.includes('checkout') && !checkoutUrl.includes('cart')) {
        setError('Invalid checkout URL. Please try again or contact support.');
        return;
      }
      
      // Start countdown
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            
            // Ensure URL has protocol
            let formattedUrl = checkoutUrl;
            if (!formattedUrl.startsWith('http')) {
              formattedUrl = 'https://' + formattedUrl;
            }
            
            // Redirect to Shopify
            console.log('Redirecting to:', formattedUrl);
            window.location.href = formattedUrl;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Provide immediate way to go back if needed
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          clearInterval(countdownInterval);
          setLocation('/events');
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      
      return () => {
        clearInterval(countdownInterval);
        window.removeEventListener('keydown', handleKeyDown);
      };
    } catch (err) {
      console.error('Error in redirect page:', err);
      setError('An error occurred during redirect. Please try again.');
    }
  }, [setLocation]);
  
  // If there's an error, show it
  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-4">Checkout Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => window.history.back()} 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Go Back
            </button>
            <button 
              onClick={() => setLocation('/events')}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Event List
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Show the redirect page
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="text-primary mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-4">Redirecting to Checkout</h2>
        <p className="text-gray-600 mb-4">
          You are being redirected to the secure payment page. 
          This will happen automatically in <span className="font-semibold">{countdown}</span> seconds.
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-linear" 
            style={{ width: `${(5 - countdown) * 20}%` }}
          ></div>
        </div>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => window.history.back()} 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              const encodedUrl = params.get('url');
              if (encodedUrl) {
                let checkoutUrl = decodeURIComponent(encodedUrl);
                if (!checkoutUrl.startsWith('http')) {
                  checkoutUrl = 'https://' + checkoutUrl;
                }
                window.location.href = checkoutUrl;
              }
            }}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Continue Now
          </button>
        </div>
      </div>
    </div>
  );
}