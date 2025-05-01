/**
 * This page creates a direct, reliable checkout experience with Shopify
 * using a simplified approach that avoids JavaScript complexity.
 */
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '../hooks/use-toast';
import { RegistrationProgress } from '../components/RegistrationProgress';
import { Container } from '../components/Container';
import { AlertCircle } from 'lucide-react';
import { attemptDirectCheckout, createDirectShopifyCartUrl } from '../lib/shopifyRedirectFix';
import { 
  trackCheckoutCompleted,
  handleRegistrationError,
  getLastRegistrationError,
  clearLastRegistrationError,
  createRegistrationError,
  RegistrationErrorType,
  RegistrationError
} from '../lib/registrationUtils';

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
      const eventName = params.get('eventName') || 'event';
      
      // Mark registration as complete in our tracking system
      if (eventId) {
        trackCheckoutCompleted(eventId);
      }
      
      toast({
        title: "Registration Complete",
        description: `Your payment has been processed successfully! You're now registered for ${decodeURIComponent(eventName)}.`,
      });
      
      // Redirect to events page after a short delay
      setTimeout(() => {
        navigate('/events');
      }, 3000);
      
      // No need to continue with checkout
      setIsLoading(false);
      return;
    }
  }, [toast]);
  
  useEffect(() => {
    let timeoutId: number;

    async function processCheckout() {
      try {
        // Set a timeout to show a retry option if the process takes too long
        timeoutId = window.setTimeout(() => {
          toast({
            title: "Checkout taking longer than expected",
            description: "You can try clicking the 'Proceed to Shopify' button below if you're not redirected soon.",
          });
          setIsLoading(false);
          setError("The checkout process appears to be taking longer than expected, but you can proceed manually.");
        }, 8000); // 8 seconds timeout
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
        
        // Get event name for success redirect
        // Note: eventId is already extracted from URL params above
        const currentEventId = params.get('eventId') || '';
        const eventName = params.get('eventName') || '';
        
        // Build checkout URL - make sure it's properly encoded
        const successParams = new URLSearchParams({
          success: 'true',
          eventId: currentEventId.toString(),
          eventName: eventName
        });
        
        // Create the full success URL with proper encoding
        const successRedirectUrl = encodeURIComponent(
          `${window.location.origin}/direct-checkout?${successParams.toString()}`
        );
        
        // Debug the success URL to ensure it's properly formatted
        console.log('Success redirect URL:', successRedirectUrl);
        
        // Get option type from URL params
        const optionType = params.get('option') || 'full';
        
        // First, show loading toast
        toast({
          title: "Preparing Checkout",
          description: "Getting product details from Shopify...",
        });
        
        // Get the correct variant ID from our API
        fetch(`/api/events/${currentEventId}/variant?option=${optionType === 'full' ? 'fullCamp' : 'singleDay'}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
          })
          .then(data => {
            if (!data.variantId) {
              throw new Error(`Variant ID not found for event ${currentEventId}`);
            }
            
            // Extract numeric ID from Shopify Global ID
            const numericId = data.variantId.replace('gid://shopify/ProductVariant/', '');
            
            // Use our direct checkout utility that handles domain redirection issues
            console.log('Using variant ID for direct checkout:', data.variantId);
            
            // Show toast before redirecting
            toast({
              title: "Redirecting to Checkout",
              description: "Taking you to the secure payment page...",
            });
            
            // Use our reliable checkout fix that creates multiple fallback options
            // This bypasses the rich-habits.com redirect issue
            setTimeout(() => {
              // Attempt direct checkout with proper success URL handling
              attemptDirectCheckout(data.variantId, 1);
            }, 800);
          })
          .catch(error => {
            console.error('Error getting variant ID:', error);
            setError(`Checkout error: ${error.message}`);
            setIsLoading(false);
            
            toast({
              title: "Checkout Error",
              description: `Could not get product details: ${error.message}`,
              variant: "destructive"
            });
          });

      } catch (error) {
        console.error('Checkout error:', error);
        
        // Extract event ID from URL if available
        const params = new URLSearchParams(window.location.search);
        const eventId = Number(params.get('eventId')) || 0;
        const eventName = params.get('eventName') || 'this event';
        
        // Create a properly structured registration error
        let registrationError: RegistrationError;
        
        if (error instanceof Error) {
          // Detect different error types
          let errorType = RegistrationErrorType.UNKNOWN;
          let recoverable = true;
          let suggestedAction: string | undefined;
          
          // Analyze error message to categorize it
          const errorMessage = error.message;
          
          if (errorMessage.includes('variant') || 
              errorMessage.includes('parse') || 
              errorMessage.includes('ID')) {
            // Product/variant identification issues
            errorType = RegistrationErrorType.SHOPIFY;
            suggestedAction = 'We had trouble identifying the event registration product. Please try the direct checkout button.';
          }
          else if (errorMessage.includes('timeout') || 
                  errorMessage.includes('longer than expected')) {
            // Timeout issues
            errorType = RegistrationErrorType.TIMEOUT;
            suggestedAction = 'The checkout process is taking too long. Try the alternative checkout option.';
          }
          else if (errorMessage.includes('network') || 
                  errorMessage.includes('connect')) {
            // Network issues
            errorType = RegistrationErrorType.NETWORK;
            suggestedAction = 'Please check your internet connection and try again.';
          }
          
          registrationError = createRegistrationError(
            errorMessage,
            errorType,
            recoverable,
            suggestedAction,
            `Error occurred during checkout for event ID: ${eventId}. Original error: ${errorMessage}`
          );
        } else {
          // Generic error handling for non-Error objects
          registrationError = createRegistrationError(
            'An unknown error occurred during checkout',
            RegistrationErrorType.UNKNOWN,
            true,
            'Please try the alternative checkout method or contact support.'
          );
        }
        
        // Add event ID and handle the error
        registrationError.eventId = eventId;
        handleRegistrationError(eventId, registrationError);
        
        // Set the error message for the UI (include event info)
        setError(`${registrationError.message}${eventId ? ` (Event: ${decodeURIComponent(eventName || '')})` : ''}`);
        
        // Show error toast with actionable suggestion
        toast({
          title: "Checkout Error",
          description: registrationError.suggestedAction || registrationError.message,
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
    
    // Cleanup function to clear the timeout if component unmounts
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
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
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
              <h1 className="text-2xl font-bold text-red-600">Checkout Error</h1>
            </div>
            <p className="text-gray-700 mb-4">{error}</p>
            
            {/* Display more helpful error details */}
            {getLastRegistrationError() && (
              <div className="p-4 bg-gray-50 rounded-md mb-6 text-sm">
                <h3 className="font-medium text-gray-800 mb-2">What happened?</h3>
                <p className="text-gray-600 mb-3">
                  {getLastRegistrationError()?.suggestedAction || 
                   'There was an issue connecting to our payment system.'}
                </p>
                <h3 className="font-medium text-gray-800 mb-2">What can you do?</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Try the alternative checkout option below</li>
                  <li>Check your internet connection</li>
                  <li>Return to the events page and try again</li>
                </ul>
              </div>
            )}
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
                      
                      // Get event details from URL
                      const eventId = params.get('eventId') || '';
                      const eventName = params.get('eventName') || '';
                      
                      // Create success redirect URL with proper URL encoding
                      const successParams = new URLSearchParams({
                        success: 'true',
                        eventId: eventId.toString(),
                        eventName: eventName
                      });
                      
                      // Create the full success URL with proper encoding
                      const successRedirectUrl = encodeURIComponent(
                        `${window.location.origin}/direct-checkout?${successParams.toString()}`
                      );
                      
                      // First, properly format the variant ID by extracting numeric part only
                      let formattedVid = variantId;
                      // Clean up the variant ID to ensure it's just the numeric portion
                      if (formattedVid.includes('gid://') || formattedVid.includes('ProductVariant/')) {
                        // Extract the numeric ID using regex if it's in the ProductVariant/ format
                        const idMatch = formattedVid.match(/ProductVariant\/([0-9]+)/);
                        if (idMatch && idMatch[1]) {
                          formattedVid = idMatch[1];
                        } else {
                          // Otherwise try to get the last part after the slash
                          formattedVid = formattedVid.split('/').pop() || formattedVid;
                        }
                      }
                      // Remove any non-numeric characters
                      formattedVid = formattedVid.replace(/\D/g, '');
                      
                      console.log('Retry using cleaned variant ID:', formattedVid);
                      
                      console.log('Manual checkout using clean variant ID:', formattedVid);
                      
                      // Use our special checkout fix utility that handles domain redirect issues
                      // This utility will try multiple methods to ensure successful checkout
                      setTimeout(() => {
                        attemptDirectCheckout(formattedVid, 1);
                      }, 500);
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
          <p className="text-gray-600 text-center mb-6">
            Please wait while we connect to Shopify for secure checkout...
          </p>
          
          {/* Manual checkout button that appears after 3 seconds */}
          <div className="text-center mt-6 transition-opacity duration-500 ease-in opacity-0 animate-fadeIn">
            <button
              onClick={() => {
                // Manually proceed to Shopify checkout
                const params = new URLSearchParams(window.location.search);
                const variantId = params.get('variantId');
                
                if (variantId) {
                  const shopifyDomain = 'rich-habits-2022.myshopify.com';
                  // Clean up variant ID for proper Shopify format
                  let formattedId = variantId;
                  
                  if (formattedId.includes('gid://') || formattedId.includes('ProductVariant/')) {
                    const idMatch = formattedId.match(/ProductVariant\/([0-9]+)/);
                    if (idMatch && idMatch[1]) {
                      formattedId = idMatch[1];
                    } else {
                      formattedId = formattedId.split('/').pop() || formattedId;
                    }
                  }
                  
                  // Remove any non-numeric characters
                  formattedId = formattedId.replace(/\D/g, '');
                  console.log('Manual checkout using clean variant ID:', formattedId);
                  
                  toast({
                    title: "Proceeding to Shopify",
                    description: "Redirecting you directly to the Shopify checkout...",
                  });
                  
                  // Use our reliable checkout utility that bypasses the domain redirect issue
                  attemptDirectCheckout(formattedId, 1);
                }
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-md text-center hover:bg-amber-700 transition-colors w-full"
            >
              Proceed to Shopify Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
