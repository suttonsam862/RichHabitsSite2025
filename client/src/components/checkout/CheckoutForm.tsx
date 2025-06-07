import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { motion } from "framer-motion";

interface CheckoutFormProps {
  onSuccess: () => void;
}

const CheckoutForm = ({ onSuccess }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsProcessing(true);
    setPaymentError("");
    
    try {
      // In a real application, this would call the Stripe API
      // to confirm the payment
      
      // For demonstration purposes, we'll simulate a successful payment
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess();
      }, 2000);
      
      // The real implementation would look something like this:
      /*
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/payment-complete",
        },
        redirect: "if_required",
      });
      
      if (error) {
        setPaymentError(error.message || "An error occurred with your payment");
        setIsProcessing(false);
      } else {
        // Payment succeeded
        onSuccess();
      }
      */
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError("An unexpected error occurred");
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8">
        <PaymentElement
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
          }}
        />
      </div>
      
      {paymentError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200">
          {paymentError}
        </div>
      )}
      
      <motion.button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full bg-gray-900 px-6 py-4 text-white ${(isProcessing || !stripe) ? 'opacity-70 cursor-not-allowed' : ''}`}
        whileHover={!isProcessing && stripe ? { 
          backgroundColor: '#111827',
          y: -2
        } : {}}
        transition={{ duration: 0.2 }}
        style={{ fontFamily: "'Sanchez', serif" }}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : "Pay Now"}
      </motion.button>
    </form>
  );
};

export default CheckoutForm;