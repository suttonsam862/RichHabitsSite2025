import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '../hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Container } from '../components/ui/container';
import { RegistrationProgress } from '@/components/events/RegistrationProgress';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Spinner } from '../components/ui/spinner';

// Mobile crash prevention utilities
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
};

// Error boundary for mobile crashes
const withMobileErrorBoundary = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    try {
      return <Component {...props} />;
    } catch (error) {
      console.error('Mobile component error:', error);
      return <div className="p-4 text-center">Loading...</div>;
    }
  };
};

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Free registration form for 100% discount codes
const FreeRegistrationForm = ({ eventId, eventName, onSuccess, amount, onDiscountApplied }: {
  eventId: string;
  eventName: string;
  onSuccess: () => void;
  amount: number;
  onDiscountApplied: (newAmount: number) => void;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFreeRegistration = async () => {
    setIsProcessing(true);
    
    try {
      // Get stored registration data from previous form
      const storedData = sessionStorage.getItem('registrationFormData');
      const registrationData = storedData ? JSON.parse(storedData) : {};
      
      // Process free registration directly
      const response = await fetch('/api/process-free-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: parseInt(eventId),
          option: sessionStorage.getItem('registration_option') || 'full',
          ...registrationData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process free registration');
      }

      const result = await response.json();
      
      toast({
        title: "Registration Complete!",
        description: "Your free registration has been processed successfully.",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Free registration error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "There was an error processing your free registration.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <DiscountCodeInput 
        onDiscountApplied={onDiscountApplied}
        originalAmount={249} // Birmingham Slam Camp price
        eventId={eventId}
      />
      
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-green-800">Free Registration</h3>
            <p className="text-sm text-green-700 mt-1">
              Your discount code has been applied! Registration is completely free.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleFreeRegistration}
        disabled={isProcessing}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Processing Free Registration...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Complete Free Registration
          </span>
        )}
      </button>
    </div>
  );
};

interface CheckoutFormProps {
  clientSecret: string;
  eventId: string;
  eventName: string;
  onSuccess: () => void;
  amount: number;
  onDiscountApplied?: (newAmount: number) => void;
}

const CheckoutForm = ({ clientSecret, eventId, eventName, onSuccess, amount, onDiscountApplied }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  
  // Get the registration option from URL params or sessionStorage
  const params = new URLSearchParams(window.location.search);
  const option = params.get('option') || sessionStorage.getItem('registration_option') || 'full';
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discount, setDiscount] = useState<{ valid: boolean; amount: number; code: string } | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/stripe-checkout?success=true&eventId=${eventId}&eventName=${encodeURIComponent(eventName)}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setError(error.message || 'An unknown error occurred');
        toast({
          title: 'Payment Failed',
          description: `Payment could not be processed: ${error.message || 'Please check your payment information and try again.'}`,
          variant: 'destructive',
        });
        
        // Critical: Ensure no success states are triggered on payment failure
        console.error('Stripe payment failed:', error);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded - gather all registration data and call our API
        const registrationData = {
          firstName: sessionStorage.getItem('registration_firstName') || '',
          lastName: sessionStorage.getItem('registration_lastName') || '',
          contactName: sessionStorage.getItem('registration_contactName') || '',
          email: sessionStorage.getItem('registration_email') || '',
          phone: sessionStorage.getItem('registration_phone') || '',
          tShirtSize: sessionStorage.getItem('registration_tShirtSize') || '',
          grade: sessionStorage.getItem('registration_grade') || '',
          gender: sessionStorage.getItem('registration_gender') || '',
          schoolName: sessionStorage.getItem('registration_schoolName') || '',
          clubName: sessionStorage.getItem('registration_clubName') || '',
          registrationType: option || 'full',
          day1: sessionStorage.getItem('registration_day1') === 'true',
          day2: sessionStorage.getItem('registration_day2') === 'true',
          day3: sessionStorage.getItem('registration_day3') === 'true',
        };

        console.log('Sending complete registration data to backend:', registrationData);

        const registrationResponse = await fetch(`/api/events/${eventId}/stripe-payment-success`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            eventId: eventId,
            amount: paymentIntent.amount,
            ...registrationData
          }),
        });

        if (registrationResponse.ok) {
          // Clear all session storage data
          const fields = [
            'firstName', 'lastName', 'contactName', 'email', 
            'phone', 'tShirtSize', 'grade', 'schoolName', 
            'clubName', 'registrationType', 'option',
            'day1', 'day2', 'day3'
          ];
          fields.forEach(field => {
            sessionStorage.removeItem(`registration_${field}`);
          });
          
          // Redirect to registration page with success confirmation
          window.location.href = `/event-registration/${eventId}?paymentSuccess=true`;
        } else {
          // Payment succeeded but registration recording failed
          toast({
            title: 'Payment Successful - Action Required',
            description: 'Your payment was successful, but we had trouble recording your registration. Please contact support immediately with your payment confirmation.',
            variant: 'destructive',
          });
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Payment Error',
        description: `Payment failed: ${errorMessage}. Please check your card details and try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for applying discount code
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast({
        title: "Missing Discount Code",
        description: "Please enter a discount code",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsApplyingDiscount(true);
      setError(null);
      
      const response = await fetch(`/api/validate-discount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discountCode: discountCode,
          originalPrice: amount
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.valid === false) {
          // This is a normal validation failure, not a server error
          // Don't throw, just show the invalid code message
          toast({
            title: "Invalid Discount",
            description: errorData.message || 'This discount code is not valid',
            variant: "destructive"
          });
          setIsApplyingDiscount(false);
          return;
        }
        throw new Error(errorData.error || errorData.message || 'Failed to validate discount code');
      }
      
      const data = await response.json();
      
      if (data.success && data.valid && data.discount) {
        setDiscount({
          valid: true,
          amount: data.discount.discountAmount,
          code: discountCode
        });
        
        // Update the amount directly without updating payment intent
        onDiscountApplied(data.discount.finalPrice);
        
        // Make sure all registration data is also in sessionStorage
        // We need this to ensure full information is saved in discount code case
        const params = new URLSearchParams(window.location.search);
        sessionStorage.setItem('registration_option', params.get('option') || 'full');
        
        // If this is a 100% discount, automatically complete the registration process
        if (data.discount.finalPrice === 0) {
          toast({
            title: "100% Discount Applied",
            description: "Your registration is free! Processing your registration...",
          });
          
          // Automatically process the free registration
          try {
            // Get registration data from sessionStorage
            const registrationData: Record<string, string> = {};
            
            // Common registration fields that might be in session storage
            const fields = [
              'firstName', 'lastName', 'contactName', 'email', 
              'phone', 'tShirtSize', 'grade', 'schoolName', 
              'clubName', 'registrationType', 'option',
              'day1', 'day2', 'day3'
            ];
            
            // Gather all available registration data from session storage
            fields.forEach(field => {
              const value = sessionStorage.getItem(`registration_${field}`);
              if (value) {
                registrationData[field] = value;
              }
            });
            
            // Ensure we at least have an email
            if (!registrationData.email) {
              registrationData.email = sessionStorage.getItem('registration_email') || '';
            }
            
            // For debugging
            console.log('Registration data gathered from sessionStorage:', registrationData);
            console.log('Using admin email for registration:', registrationData.email);
            
            // Call our API to record the registration without payment
            const registrationResponse = await fetch(`/api/events/${eventId}/stripe-payment-success`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                freeRegistration: true,
                discountCode: discountCode,
                eventId: eventId,
                amount: 0,
                ...registrationData
              }),
            });
        
            if (registrationResponse.ok) {
              toast({
                title: "Registration Complete",
                description: `Your registration has been processed successfully! You're now registered for ${eventName}.`,
              });
              onSuccess();
            } else {
              toast({
                title: "Registration Error",
                description: "We encountered an issue completing your registration. Please contact support.",
                variant: "destructive",
              });
            }
          } catch (err) {
            console.error('Free registration error:', err);
            toast({
              title: "Registration Error",
              description: "An unexpected error occurred. Please try contacting support directly.",
              variant: "destructive",
            });
          }
        } else {
          // Regular partial discount
          toast({
            title: "Discount Applied",
            description: `Discount of $${data.discount.discountAmount.toFixed(2)} applied! New total: $${data.discount.finalPrice.toFixed(2)}`,
          });
        }
      } else {
        toast({
          title: "Invalid Discount",
          description: data.error || 'This discount code is not valid',
          variant: "destructive"
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply discount code');
      toast({
        title: "Discount Error",
        description: err instanceof Error ? err.message : 'Failed to apply discount code',
        variant: "destructive"
      });
    } finally {
      setIsApplyingDiscount(false);
    }
  };
  
  // Calculate the final amount based on any applied discount
  const finalAmount = discount?.valid ? 
    Math.max(0, amount - discount.amount) : 
    amount;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Discount Code Section */}
      <div className="mb-6 p-4 border rounded-md bg-gray-50">
        <div className="font-medium text-gray-700 mb-2">Have a discount code?</div>
        <div className="flex space-x-2">
          <input 
            type="text" 
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="Enter code"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={isApplyingDiscount || discount?.valid}
          />
          <button
            type="button"
            onClick={handleApplyDiscount}
            disabled={isApplyingDiscount || discount?.valid || !discountCode.trim()}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplyingDiscount ? (
              <span className="animate-pulse">Applying...</span>
            ) : discount?.valid ? (
              "Applied"
            ) : (
              "Apply"
            )}
          </button>
        </div>
        {discount?.valid && (
          <div className="mt-2 text-sm text-green-600 flex items-center">
            <span className="mr-1">✓</span> 
            {discount.amount === amount 
              ? "100% discount applied. Your registration is free!" 
              : `$${discount.amount.toFixed(2)} discount applied!`
            }
          </div>
        )}
      </div>
      
      <PaymentElement />
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          <div className="flex items-center mb-1">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="font-medium">Payment Error</span>
          </div>
          <p>{error}</p>
        </div>
      )}
      
      {/* Clear, obvious payment button that always shows */}
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full px-6 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-4"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
            Processing Payment...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            🔒 Complete Payment - ${discount?.valid ? (amount - discount.amount).toFixed(2) : amount.toFixed(2)}
          </span>
        )}
      </button>
    </form>
  );
};

export default function StripeCheckout() {
  const [, navigate] = useLocation();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [stripeProductDetails, setStripeProductDetails] = useState<any>(null);
  const { toast } = useToast();

  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get('eventId') || '';
  const eventName = params.get('eventName') || 'the event';
  const option = params.get('option') || 'full';
  const isSuccess = params.get('success') === 'true';

  useEffect(() => {
    // Handle returning from a successful payment
    if (isSuccess) {
      setSuccess(true);
      setLoading(false);
      return;
    }
    
    // Store current path parameters in session storage to ensure 
    // we always have the option field available for free registrations
    sessionStorage.setItem('registration_option', option);
    sessionStorage.setItem('registration_eventId', eventId);

    // First fetch the Stripe product details, then create a payment intent
    const fetchPaymentIntent = async () => {
      try {
        setLoading(true);
        
        // Step 1: Get the Stripe product details for this event and option
        const productResponse = await fetch(`/api/events/${eventId}/stripe-product?option=${option}`);
        
        if (!productResponse.ok) {
          throw new Error(`Error fetching Stripe product: ${productResponse.status} ${productResponse.statusText}`);
        }
        
        const productData = await productResponse.json();
        setStripeProductDetails(productData);
        console.log('Stripe product details:', productData);
        
        // Step 2: Create a payment intent with the product details
        const response = await fetch(`/api/events/${eventId}/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            option: option,
            priceId: productData.priceId  // Use the price ID from the product details
          }),
        });

        if (!response.ok) {
          throw new Error(`Error creating payment intent: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Handle free registrations (100% discount codes)
        if (data.isFree && data.clientSecret === 'free_registration') {
          setClientSecret('free_registration');
          setAmount(0);
          // Free registration is ready to process without Stripe
        } else if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          // Set the amount for display on the button
          if (data.amount) {
            setAmount(data.amount);
          }
        } else {
          throw new Error('No client secret returned');
        }
      } catch (err) {
        console.error('Failed to set up payment:', err);
        setError(err instanceof Error ? err.message : 'Failed to set up payment');
        toast({
          title: 'Payment Setup Failed',
          description: err instanceof Error ? err.message : 'We had trouble setting up your payment. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchPaymentIntent();
    } else {
      setError('No event ID provided');
      setLoading(false);
    }
  }, [eventId, option, toast, isSuccess]);

  const handlePaymentSuccess = () => {
    setSuccess(true);
  };

  const handleDiscountApplied = (newAmount: number) => {
    setAmount(newAmount);
  };

  // Success view after payment is completed
  if (success) {
    return (
      <>
        <div className="bg-gray-50 py-4 border-b">
          <Container>
            <RegistrationProgress currentStep="complete" />
          </Container>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Registration Complete!</h1>
            <p className="text-gray-600 text-center mb-6">
              Thank you for registering for {decodeURIComponent(eventName)}. Your payment has been processed successfully.
            </p>
            <p className="text-gray-500 text-sm mb-8 text-center">
              You'll receive a confirmation email shortly with all the event details.
            </p>
            
            <div className="space-y-4">
              <a
                href="/events"
                className="block w-full px-4 py-2 bg-primary text-white rounded-md text-center hover:bg-primary/90 transition-colors"
              >
                Return to Events
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error view
  if (error) {
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
              <h1 className="text-2xl font-bold text-red-600">Payment Setup Error</h1>
            </div>
            <p className="text-gray-700 mb-6">{error}</p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-md text-center hover:bg-primary/90 transition-colors w-full"
              >
                Try Again
              </button>
              <a
                href="/events"
                className="block px-4 py-2 bg-gray-700 text-white rounded-md text-center hover:bg-gray-800 transition-colors"
              >
                Return to Events
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Loading or payment view
  return (
    <>
      <div className="bg-gray-50 py-4 border-b">
        <Container>
          <RegistrationProgress currentStep="checkout" />
        </Container>
      </div>
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          {loading ? (
            <>
              <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Setting Up Payment</h1>
              <div className="flex justify-center mb-6">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
              <p className="text-gray-600 text-center mb-6">
                Please wait while we prepare your secure payment...
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Complete Your Registration</h1>
              <p className="text-gray-600 mb-6">
                You're registering for <span className="font-medium">{decodeURIComponent(eventName)}</span> with the {option === 'full' ? 'Full Camp' : 'Single Day'} option.
              </p>
              {stripeProductDetails && (
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <div className="font-medium text-gray-800">Registration Details</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <div>Event: {stripeProductDetails.eventName}</div>
                    <div>Option: {stripeProductDetails.option === 'full' ? 'Full Camp' : 'Single Day'}</div>
                    <div className="font-medium mt-1">Amount: ${amount.toFixed(2)}</div>
                  </div>
                </div>
              )}
              {clientSecret && clientSecret === 'free_registration' ? (
                // Handle free registrations (100% discount codes)
                <FreeRegistrationForm 
                  eventId={eventId} 
                  eventName={decodeURIComponent(eventName)}
                  onSuccess={handlePaymentSuccess}
                  amount={amount}
                  onDiscountApplied={handleDiscountApplied}
                />
              ) : clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm 
                    clientSecret={clientSecret} 
                    eventId={eventId} 
                    eventName={decodeURIComponent(eventName)}
                    onSuccess={handlePaymentSuccess}
                    amount={amount}
                    onDiscountApplied={handleDiscountApplied}
                  />
                </Elements>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
