import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '../hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Container } from '../components/ui/container';
import { RegistrationProgress } from '@/components/events/RegistrationProgress';
import { AlertCircle, CheckCircle } from 'lucide-react';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  clientSecret: string;
  eventId: string;
  eventName: string;
  onSuccess: () => void;
}

const CheckoutForm = ({ clientSecret, eventId, eventName, onSuccess }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
          description: error.message || 'An unknown error occurred',
          variant: 'destructive',
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded - call our API to record the payment and create the registration
        const registrationResponse = await fetch(`/api/events/${eventId}/stripe-payment-success`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            eventId: eventId,
            amount: paymentIntent.amount,
          }),
        });

        if (registrationResponse.ok) {
          toast({
            title: 'Registration Complete',
            description: `Your payment has been processed successfully! You're now registered for ${eventName}.`,
          });
          onSuccess();
        } else {
          // Payment succeeded but registration recording failed
          toast({
            title: 'Payment Successful',
            description: 'Your payment was successful, but we had trouble recording your registration. Please contact support with your payment confirmation.',
            variant: 'destructive',
          });
          onSuccess();
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An unexpected error occurred. Please try again.');
      toast({
        title: 'Payment Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full px-4 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <span className="mr-2">Processing</span>
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          </span>
        ) : (
          `Pay $${Math.round(Number(clientSecret?.split('_secret_')[0]) / 100)}`
        )}
      </button>
    </form>
  );
};

export default function StripeCheckout() {
  const [, navigate] = useLocation();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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

    // Create a payment intent on component mount
    const fetchPaymentIntent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            option: option,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('No client secret returned');
        }
      } catch (err) {
        console.error('Failed to create payment intent:', err);
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
              {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm 
                    clientSecret={clientSecret} 
                    eventId={eventId} 
                    eventName={decodeURIComponent(eventName)}
                    onSuccess={handlePaymentSuccess}
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
