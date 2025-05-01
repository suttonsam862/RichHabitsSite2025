/**
 * This page creates a direct, reliable checkout experience with Shopify
 * using a simplified approach that avoids JavaScript complexity.
 */
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { RegistrationProgress } from '@/components/RegistrationProgress';
import { Container } from '@/components/Container';
import { trackCheckoutCompleted, handleRegistrationError } from '@/lib/registrationUtils';

export default function DirectCheckout() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Track successful redirect back from Shopify (success page handler)
  useEffect(() => {
    // Check for success parameter
    const params = new URLSearchParams(window.location.search);
    const isSuccess = params.get('success') === 'true';
    
    if (isSuccess) {
      const eventId = Number(params.get('eventId')) || 0;
      
      // Mark registration as complete in our tracking system
      if (eventId) {
        trackCheckoutCompleted(eventId);
      }
      
      toast({
        title: "Registration Complete",
        description: "Your payment has been processed successfully!",
      });
      
      // No need to continue with checkout
      setIsLoading(false);
      return;
    }
  }, [toast]);
  
  useEffect(() => {
    async function processCheckout() {
      try {
        // Parse the URL query parameters and get data from localStorage if available
        const params = new URLSearchParams(window.location.search);
        let variantId = params.get('variantId');
        const storedFallbackUrl = localStorage.getItem('shopify_fallback_url');
        
        // Check if we have a valid variant ID
        if (!variantId) {
          // Try to extract a variant ID from the fallback URL if available
          if (storedFallbackUrl) {
            console.log('No variant ID in URL, checking stored fallback URL:', storedFallbackUrl);
            const cartMatch = storedFallbackUrl.match(/\/cart\/([0-9]+):/);
            if (cartMatch && cartMatch[1]) {
              variantId = cartMatch[1];
              console.log('Extracted variant ID from fallback URL:', variantId);
            }
          }
          
          // If we still don't have a variant ID, throw an error
          if (!variantId) {
            throw new Error('No variant ID provided in URL or in stored fallback');
          }
        }

        console.log('Processing direct checkout with variant ID:', variantId);

        // Show initial toast
        toast({
          title: "Preparing Checkout",
          description: "Connecting to Shopify...",
        });

        // Create a simplified direct cart URL for Shopify
        let checkoutUrl = '';
        
        // First try to get a clean variant ID number
        let formattedVariantId = variantId;
        
        // If it's a GraphQL ID (contains 'gid://' or has ProductVariant/ format), extract the numeric part
        if (formattedVariantId.includes('gid://') || formattedVariantId.includes('ProductVariant/')) {
          // Extract the numeric part from full GraphQL ID
          const idMatch = formattedVariantId.match(/ProductVariant\/([0-9]+)/);
          if (idMatch && idMatch[1]) {
            formattedVariantId = idMatch[1];
          } else {
            // If the pattern doesn't match exactly, try a more general approach
            // by taking the last segment after any slash
            formattedVariantId = formattedVariantId.split('/').pop() || formattedVariantId;
          }
        }
        
        // Remove any non-numeric characters to get a pure ID
        formattedVariantId = formattedVariantId.replace(/\D/g, '');
        
        if (!formattedVariantId) {
          throw new Error('Failed to parse variant ID');
        }

        console.log('Formatted variant ID for direct cart URL:', formattedVariantId);

        // Create a simple cart URL with the variant ID
        const shopifyDomain = 'rich-habits-2022.myshopify.com';
        checkoutUrl = `https://${shopifyDomain}/cart/${formattedVariantId}:1`;

        console.log('Generated direct checkout URL:', checkoutUrl);

        // Show a toast before redirecting
        toast({
          title: "Redirecting to Checkout",
          description: "Taking you to the secure payment page...",
        });

        // Redirect after a short delay to allow the toast to show
        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 1000);

      } catch (error) {
        console.error('Checkout error:', error);
        
        // Extract event ID from URL if available
        const params = new URLSearchParams(window.location.search);
        const eventId = Number(params.get('eventId')) || 0;
        
        // Use our centralized error handling if we have an event ID
        if (eventId) {
          handleRegistrationError(eventId, error instanceof Error ? error : new Error('Checkout failed'));
        }
        
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setError(errorMessage);
        
        // Show error toast
        toast({
          title: "Checkout Error",
          description: errorMessage,
          variant: "destructive"
        });
        
        // If we have a fallback URL in localStorage, offer it as a last resort
        const fallbackUrl = localStorage.getItem('shopify_fallback_url');
        if (fallbackUrl) {
          console.log('Providing fallback URL as last resort:', fallbackUrl);
          setTimeout(() => {
            toast({
              title: "Alternative Checkout Available",
              description: "We'll try an alternative method for checkout in a moment...",
            });
            
            // Redirect to the fallback URL after a short delay
            setTimeout(() => {
              window.location.href = fallbackUrl;
            }, 3000);
          }, 2000);
        }

        setIsLoading(false);
      }
    }

    processCheckout();
  }, [toast]);

  // If there's an error, show it with recovery options
  if (error) {
    // Check for fallback URL in localStorage
    const fallbackUrl = localStorage.getItem('shopify_fallback_url');

    return (
      <>
        <div className="bg-gray-50 py-4 border-b">
          <Container>
            <RegistrationProgress currentStep="checkout" />
          </Container>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Checkout Error</h1>
            <p className="text-gray-700 mb-6">{error}</p>
            <div className="space-y-5">
              {fallbackUrl && (
                <div className="p-4 border border-amber-200 bg-amber-50 rounded-md mb-4">
                  <h3 className="font-medium text-amber-800 mb-2">Alternative Checkout Available</h3>
                  <p className="text-amber-700 text-sm mb-3">We have an alternative checkout method that might work better.</p>
                  <button
                    onClick={() => {
                      toast({
                        title: "Trying Alternative Checkout",
                        description: "Redirecting to Shopify..."
                      });
                      setTimeout(() => { window.location.href = fallbackUrl; }, 500);
                    }}
                    className="w-full px-4 py-2 bg-amber-600 text-white rounded-md text-center hover:bg-amber-700 transition-colors"
                  >
                    Try Alternative Checkout
                  </button>
                </div>
              )}
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    // Try to recreate the checkout using the variant ID from the URL
                    const params = new URLSearchParams(window.location.search);
                    const variantId = params.get('variantId');
                    
                    if (variantId) {
                      toast({
                        title: "Retrying Checkout",
                        description: "Attempting to reconnect to Shopify..."
                      });
                      
                      // Clear the error and attempt to process again
                      setError(null);
                      setIsLoading(true);
                      
                      // Create a direct Shopify URL
                      const shopifyDomain = 'rich-habits-2022.myshopify.com';
                      const directUrl = `https://${shopifyDomain}/cart/${variantId.replace(/\D/g, '')}:1`;
                      
                      // Redirect after a short delay
                      setTimeout(() => { window.location.href = directUrl; }, 500);
                    } else {
                      toast({
                        title: "Retry Failed",
                        description: "Could not find product information to retry.",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-md text-center hover:bg-primary/90 transition-colors"
                >
                  Retry Checkout
                </button>
                <a 
                  href="/events" 
                  className="px-4 py-2 bg-gray-700 text-white rounded-md text-center hover:bg-gray-800 transition-colors"
                >
                  Return to Events
                </a>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-center hover:bg-gray-300 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Loading state
  return (
    <>
      <div className="bg-gray-50 py-4 border-b">
        <Container>
          <RegistrationProgress currentStep="checkout" />
        </Container>
      </div>
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Preparing Your Checkout</h1>
          <div className="flex justify-center mb-6">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600 text-center">
            Please wait while we connect to Shopify for secure checkout...
          </p>
        </div>
      </div>
    </>
  );
}
