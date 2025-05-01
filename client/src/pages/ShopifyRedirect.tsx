import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import shopifyClient, { addToCart } from '@/lib/shopifyClient';

export default function ShopifyRedirect() {
  const [location, navigate] = useLocation();
  const [cartUrl, setCartUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const maxRedirectAttempts = 3;

  // Process URL from query parameters
  useEffect(() => {
    try {
      // Extract the URL and variant ID from the query parameters
      const params = new URLSearchParams(window.location.search);
      const encodedUrl = params.get('url');
      const variantId = params.get('variantId');
      
      // Check localStorage for a fallback URL (might have been stored in the registration process)
      const fallbackUrl = localStorage.getItem('shopify_fallback_url');
      
      if (!encodedUrl && !variantId) {
        if (fallbackUrl) {
          // We have a fallback URL stored, use it to try direct checkout
          console.log('Using stored fallback URL:', fallbackUrl);
          setCartUrl(fallbackUrl);
          setLoading(false);
          
          // Automatically try to redirect after a short delay
          setTimeout(() => {
            window.location.href = fallbackUrl;
            setRedirectAttempted(true);
          }, 300);
          return;
        }
        
        setError('No checkout information provided. Please return to the registration page.');
        setLoading(false);
        return;
      }
      
      // If we have a variant ID, we'll add it to our embedded cart
      if (variantId) {
        console.log('Adding variant to embedded cart:', variantId);
        
        // Try getting a fallback URL from localStorage first
        const storedFallbackUrl = localStorage.getItem('shopify_fallback_url');
        
        // If we have a fallback URL and the variant ID looks problematic, use the fallback directly
        if (storedFallbackUrl && (variantId.includes('undefined') || variantId.length < 3)) {
          console.log('Using stored fallback URL instead of potentially problematic variant ID:', variantId);
          setCartUrl(storedFallbackUrl);
          setLoading(false);
          
          // Automatically try to redirect after a short delay
          setTimeout(() => {
            window.location.href = storedFallbackUrl;
            setRedirectAttempted(true);
          }, 300);
          return;
        }
        
        // If no problems with the variant ID, create a cart or add to existing one
        const handleCart = async () => {
          try {
            let cartId = localStorage.getItem('shopify_cart_id');
            let updatedCart;
            
            if (!cartId) {
              const newCart = await shopifyClient.checkout.create();
              if (newCart && newCart.id) {
                localStorage.setItem('shopify_cart_id', newCart.id);
                cartId = newCart.id;
              } else {
                throw new Error('Failed to create cart');
              }
            }
            
            // Format the variant ID properly for Shopify Buy SDK
            // It needs to be in the format "gid://shopify/ProductVariant/12345"
            const formattedVariantId = variantId.includes('/') 
              ? variantId 
              : `gid://shopify/ProductVariant/${variantId}`;
              
            console.log('Formatted variant ID for Shopify Buy SDK:', formattedVariantId);
              
            // Add the item to the cart
            updatedCart = await addToCart(cartId, formattedVariantId, 1);
            
            // Navigate to our embedded cart
            navigate('/embedded-cart', { replace: true });
          } catch (error) {
            console.error('Error handling cart:', error);
            
            // Display a more helpful error message based on the error type
            let errorMessage = 'Failed to add item to cart. Please try again.';
            
            if (error instanceof Error) {
              console.error('Error details:', {
                message: error.message,
                stack: error.stack
              });
              
              // Set a more specific error message
              errorMessage = `Checkout error: ${error.message}`;
              
              // Handle specific known errors
              if (error.message.includes('variant')) {
                errorMessage = 'Unable to find this product in our store. Please contact customer support.';
              } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = 'Network error. Please check your connection and try again.';
              }
            }
            
            setError(errorMessage);
            setLoading(false);
            
            // Attempt to create a direct checkout URL as fallback
            try {
              const shopifyDomain = 'rich-habits-2022.myshopify.com';
              
              // Make sure URLs with variant IDs use the format Shopify expects
              // For direct cart URLs: https://store-domain.myshopify.com/cart/{variantId}:{quantity}
              
              // Extract just the numerical ID without any prefixes
              let rawVariantId = variantId;
              if (rawVariantId.includes('/')) {
                // Handle GraphQL global ID format: gid://shopify/ProductVariant/12345
                const matches = rawVariantId.match(/ProductVariant\/([0-9]+)/);
                if (matches && matches[1]) {
                  rawVariantId = matches[1];
                } else {
                  // Try simpler extraction
                  rawVariantId = rawVariantId.split('/').pop() || rawVariantId;
                }
              }
              
              // Ensure it's just a number
              rawVariantId = rawVariantId.replace(/\D/g, '');
              
              // Force checkout on myshopify domain to prevent 404s from domain redirection
              const processedFallbackUrl = `https://${shopifyDomain}/cart/${rawVariantId}:1?checkout_url=https://${shopifyDomain}/checkout`;
              console.log('Created clean fallback URL with raw variant ID:', rawVariantId);
              
              // Store the fallback URL in localStorage for potential future use
              try {
                localStorage.setItem('shopify_fallback_url', processedFallbackUrl);
              } catch (e) {
                console.warn('Could not save fallback URL to localStorage:', e);
              }
              
              console.log('Setting fallback cart URL:', processedFallbackUrl);
              setCartUrl(processedFallbackUrl);
              
              // Automatically redirect to the fallback URL after a short delay
              setTimeout(() => {
                console.log('Redirecting to fallback cart URL:', processedFallbackUrl);
                window.location.href = processedFallbackUrl;
              }, 500);
              
              // Set a second fallback for browsers that might block the redirect
              setTimeout(() => {
                if (document.visibilityState === 'visible') {
                  console.log('Second attempt at redirecting to fallback cart URL');
                  
                  // Try different redirect methods
                  try {
                    // Method 1: window.location.replace
                    window.location.replace(processedFallbackUrl);
                    
                    // Method 2: Create and click a link
                    setTimeout(() => {
                      const link = document.createElement('a');
                      link.href = processedFallbackUrl;
                      link.target = '_self';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      
                      // Method 3: Form submission
                      setTimeout(() => {
                        const form = document.createElement('form');
                        form.method = 'GET';
                        form.action = processedFallbackUrl;
                        form.target = '_self';
                        document.body.appendChild(form);
                        form.submit();
                      }, 300);
                    }, 300);
                  } catch (e) {
                    console.error('Multiple redirect attempts failed:', e);
                  }
                }
              }, 2000);
            } catch (fallbackError) {
              console.error('Error creating fallback URL:', fallbackError);
            }
          }
        };
        
        handleCart();
        return;
      }
      
      // If we have a URL, handle the legacy checkout URL approach
      if (encodedUrl) {
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
        
        // Also ensure the checkout_url parameter is present to force checkout on myshopify domain
        if (!processedUrl.includes('checkout_url=')) {
          const urlObj = new URL(processedUrl);
          urlObj.searchParams.append('checkout_url', 'https://rich-habits-2022.myshopify.com/checkout');
          processedUrl = urlObj.toString();
          console.log('Added checkout_url parameter to processed URL:', processedUrl);
        }
        
        // Extract variant ID from Shopify cart URL if available
        const urlObj = new URL(processedUrl);
        const urlParams = new URLSearchParams(urlObj.search);
        const urlVariantId = urlParams.get('id');
        
        if (urlVariantId) {
          // Use our embedded cart approach
          const handleLegacyCart = async () => {
            try {
              let cartId = localStorage.getItem('shopify_cart_id');
              
              if (!cartId) {
                const newCart = await shopifyClient.checkout.create();
                if (newCart && newCart.id) {
                  localStorage.setItem('shopify_cart_id', newCart.id);
                  cartId = newCart.id;
                } else {
                  throw new Error('Failed to create cart');
                }
              }
              
              // Extract any custom attributes from the URL
              const customAttributes: { key: string; value: string }[] = [];
              urlParams.forEach((value, key) => {
                if (key.startsWith('attributes[') && key.endsWith(']')) {
                  const attrKey = key.slice(11, -1); // Extract key from attributes[key]
                  customAttributes.push({ key: attrKey, value });
                }
              });
              
              // Format the variant ID properly for Shopify Buy SDK
              const formattedUrlVariantId = urlVariantId.includes('/') 
                ? urlVariantId 
                : `gid://shopify/ProductVariant/${urlVariantId}`;
                
              console.log('Formatted legacy variant ID for SDK:', formattedUrlVariantId);
                
              // Add the item to the cart
              await addToCart(cartId, formattedUrlVariantId, 1, customAttributes);
              
              // Navigate to our embedded cart
              navigate('/embedded-cart', { replace: true });
            } catch (error) {
              console.error('Error handling legacy cart:', error);
              
              // Fallback to direct URL approach
              console.log('Processed cart URL:', processedUrl);
              setCartUrl(processedUrl);
              setLoading(false);
              
              // Immediately attempt to redirect
              if (processedUrl) {
                console.log('Auto-redirecting to cart...');
                window.location.href = processedUrl;
                setRedirectAttempted(true);
              }
            }
          };
          
          handleLegacyCart();
          return;
        }
        
        // If we can't extract a variant ID, fall back to the original approach
        console.log('Processed cart URL:', processedUrl);
        setCartUrl(processedUrl);
        setLoading(false);
        
        // Immediately attempt to redirect
        if (processedUrl) {
          console.log('Auto-redirecting to cart...');
          window.location.href = processedUrl;
          setRedirectAttempted(true);
        }
      }
    } catch (error) {
      console.error('Error processing redirect URL:', error);
      setError('Failed to process the checkout URL. Please try again.');
      setLoading(false);
    }
  }, [navigate]);
  
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
  
  // Direct redirect to Shopify cart with multiple fallback methods
  const redirectToCart = () => {
    if (cartUrl) {
      setRedirectAttempts(prev => prev + 1);
      console.log(`Manual redirect to cart page (attempt ${redirectAttempts + 1}):`, cartUrl);
      
      // Use different redirect techniques based on the attempt number
      if (redirectAttempts === 0) {
        // Simple redirect for first attempt
        window.location.href = cartUrl;
      } else if (redirectAttempts === 1) {
        // Try location.replace for second attempt
        window.location.replace(cartUrl);
      } else {
        // Use all available methods for third attempt
        try {
          // Method 1: Create and click a link element
          const link = document.createElement('a');
          link.href = cartUrl;
          link.target = '_self';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Method 2: Use form submission after a short delay
          setTimeout(() => {
            const form = document.createElement('form');
            form.method = 'GET';
            form.action = cartUrl;
            form.target = '_self';
            document.body.appendChild(form);
            form.submit();
          }, 200);
        } catch (e) {
          console.error('Multiple redirect attempts failed:', e);
          setError(`Unable to redirect to checkout. Please copy the link below and paste it in your browser's address bar.`);
        }
      }
      
      setRedirectAttempted(true);
    } else {
      setError('No cart URL available for redirect.');
    }
  };
  
  if (error) {
    // Clear any previous error styling if we're injecting HTML directly
    if (document.getElementById('error-container')) {
      document.getElementById('error-container')!.remove();
    }

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
          <p className="mb-6 text-sm text-gray-500">We're having trouble connecting to our checkout service. Let's try a direct approach to Shopify instead.</p>
          <div className="flex flex-col space-y-3">
            {cartUrl && (
              <button
                onClick={redirectToCart}
                className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Try Direct Checkout
              </button>
            )}
            <button
              onClick={handleBackToRegistration}
              className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary/90"
            >
              Return to Registration
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