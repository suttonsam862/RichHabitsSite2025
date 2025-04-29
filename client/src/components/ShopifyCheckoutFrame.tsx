import { useState, useEffect } from 'react';

interface ShopifyCheckoutFrameProps {
  checkoutUrl: string;
  onClose: () => void;
}

export default function ShopifyCheckoutFrame({ checkoutUrl, onClose }: ShopifyCheckoutFrameProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Format the URL if needed
    if (!checkoutUrl) {
      setError('No checkout URL provided');
      return;
    }
    
    // Set a timeout to ensure we show loading state for at least a brief moment
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [checkoutUrl]);
  
  // Handle iframe errors
  const handleIframeError = () => {
    setError('Failed to load the checkout page. Please try again or click "Open in New Window".');
    setLoading(false);
  };
  
  // Open checkout in a new window/tab
  const openInNewWindow = () => {
    window.open(checkoutUrl, '_blank');
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-medium">Complete Your Registration</h2>
          <div className="flex space-x-2">
            <button
              onClick={openInNewWindow}
              className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
            >
              Open in New Window
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Loading state */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading secure checkout...</p>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Checkout Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex space-x-4">
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Go Back
              </button>
              <button 
                onClick={openInNewWindow}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Open in New Window
              </button>
            </div>
          </div>
        )}
        
        {/* Iframe for Shopify checkout */}
        <iframe
          src={checkoutUrl}
          className={`flex-grow w-full ${loading || error ? 'hidden' : 'block'}`}
          onError={handleIframeError}
          title="Shopify Checkout"
          sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups"
        />
      </div>
    </div>
  );
}