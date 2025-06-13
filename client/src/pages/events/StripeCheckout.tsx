import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '../../hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Container } from '../../components/ui/container';
import { RegistrationProgress } from '../../components/events/RegistrationProgress';
import { AlertCircle, CheckCircle } from 'lucide-react';

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
      // Get comprehensive registration data from sessionStorage
      const registrationData = {
        firstName: sessionStorage.getItem('registration_firstName') || '',
        lastName: sessionStorage.getItem('registration_lastName') || '',
        email: sessionStorage.getItem('registration_email') || '',
        phone: sessionStorage.getItem('registration_phone') || '',
        contactName: sessionStorage.getItem('registration_contactName') || '',
        tShirtSize: sessionStorage.getItem('registration_tShirtSize') || '',
        grade: sessionStorage.getItem('registration_grade') || '',
        gender: sessionStorage.getItem('registration_gender') || '',
        schoolName: sessionStorage.getItem('registration_schoolName') || '',
        clubName: sessionStorage.getItem('registration_clubName') || '',
        day1: sessionStorage.getItem('registration_day1') === 'true',
        day2: sessionStorage.getItem('registration_day2') === 'true',
        day3: sessionStorage.getItem('registration_day3') === 'true',
      };

      const appliedDiscountCode = sessionStorage.getItem('applied_discount_code');
      const option = sessionStorage.getItem('registration_option') || 'full';
      
      // Process free registration using the stripe payment success endpoint
      const response = await fetch(`/api/events/${eventId}/stripe-payment-success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          freeRegistration: true,
          discountCode: appliedDiscountCode,
          eventId: eventId,
          amount: 0,
          paymentIntentId: `free_reg_${Date.now()}`,
          ...registrationData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process free registration');
      }

      // Clear session data after successful registration
      const fields = [
        'firstName', 'lastName', 'contactName', 'email', 
        'phone', 'tShirtSize', 'grade', 'schoolName', 
        'clubName', 'registrationType', 'option',
        'day1', 'day2', 'day3'
      ];
      fields.forEach(field => {
        sessionStorage.removeItem(`registration_${field}`);
      });
      sessionStorage.removeItem('applied_discount_code');
      
      toast({
        title: "Registration Complete!",
        description: `Your free registration has been processed successfully! You're now registered for ${eventName}.`,
      });
      
      // Redirect to success page
      window.location.href = `/stripe-checkout?success=true&eventId=${eventId}&eventName=${encodeURIComponent(eventName)}&freeRegistration=true`;
      
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
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-700">
          Your discount code has been applied! This registration is completely free.
        </p>
      </div>
      
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
  onClientSecretUpdate?: (newClientSecret: string) => void;
  onAmountUpdate?: (newAmount: number) => void;
}

const CheckoutForm = ({ clientSecret, eventId, eventName, onSuccess, amount, onDiscountApplied, onClientSecretUpdate, onAmountUpdate }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  
  // Get the registration option from URL params or sessionStorage
  const params = new URLSearchParams(window.location.search);
  const option = params.get('option') || sessionStorage.getItem('registration_option') || 'full';
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);
  const [paymentAttempted, setPaymentAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discount, setDiscount] = useState<{ valid: boolean; amount: number; finalPrice?: number; code: string } | null>(null);
  const { toast } = useToast();

  // Check for already completed payment on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSucceeded = urlParams.get('payment_intent_status') === 'succeeded';
    const paymentIntentId = urlParams.get('payment_intent');
    
    if (paymentSucceeded && paymentIntentId) {
      setIsPaymentCompleted(true);
      toast({
        title: "Payment Already Completed",
        description: "Your payment has already been processed. Redirecting to confirmation...",
      });
      setTimeout(() => {
        window.location.href = `/event-registration/${eventId}?paymentSuccess=true&paymentIntentId=${paymentIntentId}`;
      }, 2000);
    }
  }, [eventId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isProcessing || isPaymentCompleted || paymentAttempted) {
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentAttempted(true);
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
          setIsPaymentCompleted(true);
          
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
          
          toast({
            title: "Registration Complete!",
            description: "Your payment was successful and registration is confirmed. Redirecting...",
          });
          
          // Redirect to registration page with success confirmation
          setTimeout(() => {
            window.location.href = `/event-registration/${eventId}?paymentSuccess=true&paymentIntentId=${paymentIntent.id}`;
          }, 2000);
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

  // Recreate payment intent with discounted amount
  const recreatePaymentIntentWithDiscount = async (discountedAmount: number, discountCode: string) => {
    if (discountedAmount === 0) {
      // For free registrations, no need to recreate payment intent
      return;
    }
    
    try {
      const params = new URLSearchParams(window.location.search);
      const eventId = params.get('eventId') || '';
      const option = params.get('option') || 'full';
      
      // Get registration data from sessionStorage
      const registrationData = {
        firstName: sessionStorage.getItem('registration_firstName') || '',
        lastName: sessionStorage.getItem('registration_lastName') || '',
        email: sessionStorage.getItem('registration_email') || '',
        phone: sessionStorage.getItem('registration_phone') || '',
        contactName: sessionStorage.getItem('registration_contactName') || '',
        tShirtSize: sessionStorage.getItem('registration_tShirtSize') || '',
        grade: sessionStorage.getItem('registration_grade') || '',
        gender: sessionStorage.getItem('registration_gender') || '',
        schoolName: sessionStorage.getItem('registration_schoolName') || '',
        clubName: sessionStorage.getItem('registration_clubName') || '',
        day1: sessionStorage.getItem('registration_day1') === 'true',
        day2: sessionStorage.getItem('registration_day2') === 'true',
        day3: sessionStorage.getItem('registration_day3') === 'true',
      };
      
      // Create new payment intent with discounted amount
      const response = await fetch(`/api/events/${eventId}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          option,
          registrationData,
          discountedAmount,
          discountCode
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create new payment intent with discount');
      }
      
      const data = await response.json();
      console.log('Payment intent recreated with discount:', data);
      
      if (data.clientSecret) {
        // Store the new payment details for page reload
        sessionStorage.setItem('payment_client_secret', data.clientSecret);
        sessionStorage.setItem('payment_amount', discountedAmount.toString());
        sessionStorage.setItem('discount_applied', 'true');
        
        // Force page reload to reinitialize Stripe Elements with new payment intent
        window.location.reload();
      } else {
        throw new Error('No client secret returned from discount payment intent creation');
      }
    } catch (error) {
      console.error('Error recreating payment intent with discount:', error);
    }
  };

  // Handler for applying discount code with race condition prevention
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast({
        title: "Missing Discount Code",
        description: "Please enter a discount code",
        variant: "destructive"
      });
      return;
    }
    
    // Prevent multiple simultaneous discount applications
    if (isApplyingDiscount) {
      console.log('Discount application already in progress, ignoring duplicate request');
      return;
    }
    
    try {
      setIsApplyingDiscount(true);
      setError(null);
      
      // Clear any existing discount state to prevent conflicts
      setDiscount(null);
      sessionStorage.removeItem('applied_discount_code');
      sessionStorage.removeItem('discounted_amount');
      
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
        // Set discount state to update UI immediately
        setDiscount({
          valid: true,
          amount: data.discount.discountAmount,
          finalPrice: data.discount.finalPrice,
          code: discountCode
        });
        
        // Store discount information for persistence
        sessionStorage.setItem('applied_discount_code', discountCode);
        sessionStorage.setItem('discounted_amount', data.discount.finalPrice.toString());
        sessionStorage.setItem('discount_amount', data.discount.discountAmount.toString());
        
        // Create new payment intent with discount applied
        try {
          const recreateResponse = await fetch(`/api/events/${eventId}/create-payment-intent`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              option,
              registrationData: {
                firstName: sessionStorage.getItem('registration_firstName') || '',
                lastName: sessionStorage.getItem('registration_lastName') || '',
                email: sessionStorage.getItem('registration_email') || '',
                phone: sessionStorage.getItem('registration_phone') || '',
                contactName: sessionStorage.getItem('registration_contactName') || '',
                tShirtSize: sessionStorage.getItem('registration_tShirtSize') || '',
                grade: sessionStorage.getItem('registration_grade') || '',
                gender: sessionStorage.getItem('registration_gender') || '',
                schoolName: sessionStorage.getItem('registration_schoolName') || '',
                clubName: sessionStorage.getItem('registration_clubName') || '',
                day1: sessionStorage.getItem('registration_day1') === 'true',
                day2: sessionStorage.getItem('registration_day2') === 'true',
                day3: sessionStorage.getItem('registration_day3') === 'true',
                medicalReleaseAccepted: sessionStorage.getItem('registration_medicalReleaseAccepted') === 'true',
                eventId: parseInt(eventId),
                registrationType: option
              },
              discountedAmount: data.discount.finalPrice,
              discountCode: discountCode,
              forceNewIntent: true
            }),
          });
          
          if (recreateResponse.ok) {
            const recreateData = await recreateResponse.json();
            console.log('New payment intent created with discount:', recreateData);
            
            // Update payment state via callbacks
            onClientSecretUpdate && onClientSecretUpdate(recreateData.clientSecret);
            onAmountUpdate && onAmountUpdate(data.discount.finalPrice);
            
            // Show success message
            if (data.discount.finalPrice === 0) {
              toast({
                title: "100% Discount Applied",
                description: "Your registration is free! Complete your registration below.",
              });
            } else {
              toast({
                title: "Discount Applied",
                description: `New total: $${data.discount.finalPrice.toFixed(2)} (saved $${data.discount.discountAmount.toFixed(2)})`,
              });
            }
          } else {
            throw new Error('Failed to recreate payment intent with discount');
          }
        } catch (recreateError) {
          console.error('Error recreating payment intent:', recreateError);
          toast({
            title: "Discount Applied",
            description: "Discount applied successfully. Please refresh the page to continue.",
            variant: "default"
          });
        }
      } else {
        toast({
          title: "Invalid Discount",
          description: data.message || data.error || 'This discount code is not valid',
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
    (discount.finalPrice !== undefined ? discount.finalPrice : Math.max(0, amount - discount.amount)) : 
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
            {discount.finalPrice === 0 
              ? "100% discount applied. Your registration is free!" 
              : discount.finalPrice !== undefined
                ? `Price set to $${discount.finalPrice.toFixed(2)}!`
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
            {(() => {
              const finalAmount = discount?.valid ? 
                (discount.finalPrice !== undefined ? discount.finalPrice : (amount - discount.amount)) : 
                amount;
              
              if (finalAmount === 0) {
                return "🎉 Complete FREE Registration";
              } else {
                return `🔒 Complete Payment - $${finalAmount.toFixed(2)}`;
              }
            })()}
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
  const [isSetupInProgress, setIsSetupInProgress] = useState(false);
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

    // Handle team registrations differently - use existing payment intent
    if (option === 'team') {
      const handleTeamPayment = async () => {
        try {
          setLoading(true);
          
          // Get client secret and amount from URL parameters (passed from team registration)
          const urlClientSecret = params.get('clientSecret');
          const urlAmount = params.get('amount');
          
          if (urlClientSecret && urlAmount) {
            console.log('Using team registration payment intent:', {
              clientSecret: urlClientSecret ? 'present' : 'missing',
              amount: urlAmount
            });
            
            setClientSecret(urlClientSecret);
            setAmount(parseFloat(urlAmount));
            setLoading(false);
            return;
          }
          
          // Fallback: check sessionStorage for team data
          const teamData = sessionStorage.getItem('team_registration_data');
          if (teamData) {
            try {
              const parsedTeamData = JSON.parse(teamData);
              console.log('Found team registration data in session:', parsedTeamData);
              setAmount(parsedTeamData.totalAmount || 0);
            } catch (parseError) {
              console.error('Failed to parse team registration data from sessionStorage:', parseError);
              setError('Invalid team registration data. Please restart the registration process.');
              setLoading(false);
              return;
            }
          }
          
          setError('Team registration data not found. Please restart the registration process.');
          setLoading(false);
        } catch (error) {
          console.error('Error handling team payment:', error);
          setError('Failed to load team payment information.');
          setLoading(false);
        }
      };
      
      handleTeamPayment();
      return;
    }

    // Optimized payment setup for individual registrations - single API call to reduce mobile loading time
    const fetchPaymentIntent = async () => {
      // Prevent duplicate calls
      if (isSetupInProgress) {
        console.log('Payment setup already in progress, skipping duplicate call');
        return;
      }
      
      try {
        setIsSetupInProgress(true);
        setLoading(true);
        
        // Comprehensive registration data collection from sessionStorage
        const registrationData = {
          firstName: sessionStorage.getItem('registration_firstName') || '',
          lastName: sessionStorage.getItem('registration_lastName') || '',
          email: sessionStorage.getItem('registration_email') || '',
          phone: sessionStorage.getItem('registration_phone') || '',
          contactName: sessionStorage.getItem('registration_contactName') || sessionStorage.getItem('registration_emergencyContactName') || '',
          tShirtSize: sessionStorage.getItem('registration_tShirtSize') || '',
          grade: sessionStorage.getItem('registration_grade') || '',
          gender: sessionStorage.getItem('registration_gender') || '',
          schoolName: sessionStorage.getItem('registration_schoolName') || '',
          clubName: sessionStorage.getItem('registration_clubName') || '',
          medicalReleaseAccepted: sessionStorage.getItem('registration_agrees') === 'true',
          day1: sessionStorage.getItem('registration_day1') === 'true',
          day2: sessionStorage.getItem('registration_day2') === 'true',
          day3: sessionStorage.getItem('registration_day3') === 'true',
        };
        
        console.log('Collected registration data:', registrationData);
        
        // Enhanced validation - check for essential fields
        const missingFields = [];
        if (!registrationData.firstName) missingFields.push('First Name');
        if (!registrationData.lastName) missingFields.push('Last Name');
        if (!registrationData.email) missingFields.push('Email');
        
        if (missingFields.length > 0) {
          const errorMessage = `Please complete all required fields: ${missingFields.join(', ')}`;
          console.error('Validation failed:', errorMessage);
          throw new Error(errorMessage);
        }
        
        // Check if there's a discount applied
        const appliedDiscountCode = sessionStorage.getItem('applied_discount_code');
        const discountData = sessionStorage.getItem('applied_discount');
        const appliedDiscount = discountData ? JSON.parse(discountData) : null;
        
        console.log('Debug discount retrieval:', {
          appliedDiscountCode,
          discountData,
          appliedDiscount
        });

        // Single optimized API call for payment intent creation
        const response = await fetch(`/api/events/${eventId}/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            option: option,
            registrationData: {
              ...registrationData,
              eventId: parseInt(eventId),
              registrationType: option
            },
            discountedAmount: appliedDiscount?.finalPrice || null,
            discountCode: appliedDiscountCode || appliedDiscount?.code || null,
            formSessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }),
        });

        // Enhanced error handling for discount code JSON parsing issues
        if (!response.ok) {
          let errorData;
          try {
            const responseText = await response.text();
            if (responseText.trim().startsWith('{')) {
              errorData = JSON.parse(responseText);
            } else {
              // Handle HTML error responses (common cause of JSON parsing errors)
              console.error('Non-JSON response received:', responseText);
              throw new Error('Server returned invalid response format. Please try again or contact support.');
            }
          } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            throw new Error('Unable to process server response. Please try again or contact support with discount code: ' + (appliedDiscountCode || 'none'));
          }
          
          const errorMessage = errorData.userFriendlyMessage || errorData.error || `Payment setup failed (${response.status})`;
          
          // Show user-friendly error message
          toast({
            title: 'Payment Setup Error',
            description: errorMessage,
            variant: 'destructive',
          });
          
          throw new Error(errorMessage);
        }

        let data;
        try {
          const responseText = await response.text();
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parsing error on success response:', parseError);
          throw new Error('Unable to process payment response. Please contact support with discount code: ' + (appliedDiscountCode || 'none'));
        }
        
        console.log('Payment intent response data:', data);
        
        // Handle free registrations (100% discount codes) - don't auto-process, show button
        if (data.isFreeRegistration || (data.success && data.registrationId)) {
          console.log('Free registration ready - setting up completion button');
          
          // Set special clientSecret to trigger free registration UI
          setClientSecret('free_registration');
          setAmount(0);
          return;
        } else if (data.clientSecret) {
          try {
            setClientSecret(data.clientSecret);
            // Set the amount for display on the button - use amount from response or calculate from event
            const responseAmount = data.amount || 249; // Default to $249 for full event
            setAmount(responseAmount);
            console.log('Payment setup successful:', { clientSecret: data.clientSecret, amount: responseAmount });
            
            // Clear any existing errors since payment setup was successful
            setError(null);
          } catch (setupError) {
            console.error('Error during payment setup state updates:', setupError);
            throw setupError;
          }
        } else {
          throw new Error('No client secret returned from payment setup');
        }
      } catch (err) {
        // Only show error if we don't have a valid client secret
        if (!clientSecret) {
          console.error('Failed to set up payment:', err);
          setError(err instanceof Error ? err.message : 'Failed to set up payment');
          toast({
            title: 'Payment Setup Failed',
            description: err instanceof Error ? err.message : 'We had trouble setting up your payment. Please try again.',
            variant: 'destructive',
          });
        } else {
          // We have a valid client secret, so ignore this error
          console.log('Ignoring error since payment setup was successful:', err);
          setError(null);
        }
      } finally {
        setLoading(false);
        setIsSetupInProgress(false);
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
                    onClientSecretUpdate={setClientSecret}
                    onAmountUpdate={setAmount}
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
