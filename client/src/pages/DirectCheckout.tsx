import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';

/**
 * This page creates a direct, reliable checkout experience with Shopify
 * using a simplified approach that avoids JavaScript complexity.
 */
export default function DirectCheckout() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [directCheckoutUrl, setDirectCheckoutUrl] = useState<string | null>(null);
  const [hasAttemptedRedirect, setHasAttemptedRedirect] = useState(false);

  useEffect(() => {
    // Extract the variant ID from URL parameters
    try {
      const params = new URLSearchParams(window.location.search);
      const rawVariantId = params.get('variantId');
      
      if (!rawVariantId) {
        setError('No product information provided. Please try again.');
        setLoading(false);
        return;
      }
      
      // Process variant ID to make sure we have just the numeric part
      let processedId = rawVariantId;
      
      // Handle gid://shopify format
      if (processedId.includes('/')) {
        const matches = processedId.match(/ProductVariant\/([0-9]+)/);
        if (matches && matches[1]) {
          processedId = matches[1];
        } else {
          // Simpler fallback extraction
          processedId = processedId.split('/').pop() || processedId;
        }
      }
      
      // Remove any non-numeric characters
      processedId = processedId.replace(/\D/g, '');
      
      if (!processedId || processedId.length < 3) {
        setError('Invalid product information. Please try again.');
        setLoading(false);
        return;
      }
      
      setVariantId(processedId);
      
      // Build direct Shopify checkout URL
      const shopifyDomain = 'rich-habits-2022.myshopify.com';
      const url = `https://${shopifyDomain}/cart/${processedId}:1`;
      setDirectCheckoutUrl(url);
      
      // Auto-redirect to Shopify
      window.location.href = url;
      setHasAttemptedRedirect(true);
      setLoading(false);
    } catch (err) {
      console.error('Error preparing checkout:', err);
      setError('An error occurred while preparing your checkout. Please try again.');
      setLoading(false);
    }
  }, []);
  
  const handleManualRedirect = () => {
    if (directCheckoutUrl) {
      window.location.href = directCheckoutUrl;
    }
  };
  
  const handleBackToEvents = () => {
    navigate('/events');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Helmet>
          <title>Preparing Checkout | Rich Habits</title>
        </Helmet>
        <div className="text-center p-8 max-w-md w-full bg-white rounded-lg shadow-md">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <h1 className="text-2xl font-bold mt-6 mb-2">Preparing Your Checkout</h1>
          <p className="text-gray-600">Just a moment while we connect to Shopify...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Helmet>
          <title>Checkout Error | Rich Habits</title>
        </Helmet>
        <div className="text-center p-8 max-w-md w-full bg-white rounded-lg shadow-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Checkout Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBackToEvents}
            className="bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Return to Events
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Helmet>
        <title>Continue to Checkout | Rich Habits</title>
      </Helmet>
      <div className="text-center p-8 max-w-md w-full bg-white rounded-lg shadow-md">
        <div className="text-green-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Continue to Checkout</h1>
        <p className="text-gray-600 mb-6">
          {hasAttemptedRedirect 
            ? "We're redirecting you to Shopify's secure checkout. If you're not automatically redirected, please click the button below."
            : "Click the button below to continue to Shopify's secure checkout."}
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleManualRedirect}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors"
          >
            Continue to Checkout
          </button>
          
          <button
            onClick={handleBackToEvents}
            className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-md font-medium hover:bg-gray-300 transition-colors"
          >
            Return to Events
          </button>
          
          {directCheckoutUrl && (
            <div className="mt-8 p-4 bg-gray-50 rounded-md text-left">
              <p className="font-medium text-sm mb-2">Having trouble with the buttons?</p>
              <p className="text-sm mb-2">Copy and paste this link in your browser:</p>
              <div className="p-2 bg-white border border-gray-200 rounded overflow-x-auto">
                <code className="text-xs break-all">{directCheckoutUrl}</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
