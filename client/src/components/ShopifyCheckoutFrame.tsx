import { useState, useEffect, useRef } from 'react';
import { navigateToShopifyCheckout, openShopifyCheckoutInNewWindow } from '@/utils/shopifyUtils';

interface ShopifyCheckoutFrameProps {
  checkoutUrl: string;
  onClose: () => void;
}

export default function ShopifyCheckoutFrame({ checkoutUrl, onClose }: ShopifyCheckoutFrameProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [processedUrl, setProcessedUrl] = useState('');
  
  // Process the URL once on component mount
  useEffect(() => {
    // Check if we have a valid URL format
    if (!checkoutUrl) {
      setError('No checkout URL provided');
      return;
    }
    
    // Ensure the URL is absolute with HTTPS
    let url = checkoutUrl;
    if (!url.startsWith('http')) {
      url = 'https://' + url.replace(/^\/\//, '');
    } else if (url.startsWith('http://')) {
      url = 'https://' + url.substring(7);
    }
    
    // Log and store the processed URL
    console.log('Using processed checkout URL:', url);
    setProcessedUrl(url);
    
    // Add a fallback direct redirect if the iframe approach fails
    const timer = setTimeout(() => {
      // After 8 seconds, if we're still on this page and haven't loaded, show error
      if (!iframeLoaded && document.visibilityState === 'visible') {
        console.log('Fallback timer triggered - iframe did not load');
        handleIframeError();
      }
    }, 8000);
    
    // Set a timeout to ensure we show loading state for at least a brief moment
    const loadingTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(loadingTimer);
    };
  }, [checkoutUrl]);
  
  // Handle iframe load event
  const handleIframeLoad = () => {
    console.log('Iframe loaded event fired');
    setIframeLoaded(true);
    setLoading(false);
    
    // Check if the iframe has loaded a 404 page
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        // Most browsers block cross-origin access, so this might fail
        // But we can at least try to detect obvious page title changes
        const iframeTitle = iframe.contentWindow.document.title;
        if (iframeTitle.includes('404') || iframeTitle.includes('Not Found')) {
          handleIframeError();
        }
      }
    } catch (e) {
      // Accessing cross-origin iframe content will throw an error
      console.log('Could not access iframe content due to security restrictions');
    }
  };
  
  // Handle iframe errors
  const handleIframeError = () => {
    console.error('Checkout iframe failed to load properly');
    setError('The checkout page cannot be displayed in this embedded view. Please use the "Go to Shopify Checkout" button to complete your purchase securely.');
    setLoading(false);
  };
  
  // Direct redirect to Shopify checkout
  const redirectToShopify = () => {
    const url = processedUrl || checkoutUrl;
    console.log('Redirecting to Shopify checkout using utility:', url);
    
    // Use our robust utility function to handle the redirect
    navigateToShopifyCheckout(url);
  };
  
  // Open checkout in a new window/tab
  const openInNewWindow = () => {
    const url = processedUrl || checkoutUrl;
    console.log('Opening in new window using utility:', url);
    
    // Use our utility function to open in new window
    const success = openShopifyCheckoutInNewWindow(url);
    
    if (!success) {
      alert('Please allow popups for this site to open the checkout in a new window.');
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-medium">Complete Your Registration</h2>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={redirectToShopify}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Go to Shopify Checkout
            </button>
            <button
              type="button"
              onClick={openInNewWindow}
              className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
            >
              Open in New Window
            </button>
            <button
              type="button"
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
            <h3 className="text-lg font-medium mb-2">Checkout Cannot Be Embedded</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              <button 
                type="button"
                onClick={() => window.location.href = processedUrl || checkoutUrl}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-center"
              >
                Go to Shopify Checkout
              </button>
              <button 
                type="button"
                onClick={() => window.open(processedUrl || checkoutUrl, "_blank")}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 text-center"
              >
                Open in New Window
              </button>
              <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {/* Direct link message if iframe hasn't loaded yet */}
        {!loading && !error && !iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-6 text-center z-10">
            <p className="text-gray-600 mb-6">
              If the checkout doesn't appear, please use one of these options:
            </p>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              <button 
                type="button"
                onClick={() => window.location.href = processedUrl || checkoutUrl}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-center"
              >
                Go to Shopify Checkout
              </button>
              <button 
                type="button"
                onClick={() => window.open(processedUrl || checkoutUrl, "_blank")}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 text-center"
              >
                Open in New Window
              </button>
            </div>
          </div>
        )}
        
        {/* Iframe for Shopify checkout */}
        <iframe
          ref={iframeRef}
          src={processedUrl || checkoutUrl}
          className={`flex-grow w-full ${loading || error ? 'hidden' : 'block'}`}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title="Shopify Checkout"
          sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
          referrerPolicy="origin"
        />
      </div>
    </div>
  );
}