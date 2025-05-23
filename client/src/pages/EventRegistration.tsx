import React, { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Event data (in production this would be fetched from API)
const events = [
  {
    id: 1,
    title: "Birmingham Slam Camp",
    date: "June 19-21, 2025",
    location: "Clay-Chalkville Middle School, Birmingham, AL",
    price: "$249",
    fullPrice: 249,
    singleDayPrice: 149,
    image: "/images/wrestlers/DSC09491.JPG",
    signature: "Exclusive partnership with Fruit Hunters"
  },
  {
    id: 2,
    title: "National Champ Camp",
    date: "June 5-7, 2025",
    location: "Roy Martin Middle School, Las Vegas, NV",
    price: "$349",
    fullPrice: 349,
    singleDayPrice: 175,
    image: "/images/wrestlers/DSC09374--.JPG",
    signature: "Focus on championship-level techniques"
  },
  {
    id: 3,
    title: "Texas Recruiting Clinic",
    date: "June 12-13, 2025",
    location: "Arlington Martin High School, Arlington, TX",
    price: "$249",
    fullPrice: 249,
    singleDayPrice: null,
    image: "/images/wrestlers/DSC00423.JPG",
    signature: "College coach evaluations included"
  },
  {
    id: 4,
    title: "Panther Train Tour",
    date: "July 23-25, 2025",
    location: "Various locations",
    price: "$99 per day",
    fullPrice: 200,
    singleDayPrice: 99,
    image: "/images/wrestlers/DSC08615.JPG",
    signature: "Travel across multiple training facilities"
  }
];

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

// CheckoutForm component (embedded directly to avoid import issues)
interface CheckoutFormProps {
  onSuccess: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess }) => {
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

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

export default function EventRegistration() {
  const [, params] = useRoute("/register/:id");
  const eventId = params?.id ? parseInt(params.id, 10) : 0;
  
  const [event, setEvent] = useState<any>(null);
  const [registrationType, setRegistrationType] = useState<string>("full");
  const [isLoading, setIsLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    grade: "",
    gender: "",
    schoolName: "",
    clubName: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    specialRequirements: "",
    agrees: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  useEffect(() => {
    // Simulate API call to get event details
    const fetchEvent = () => {
      setIsLoading(true);
      
      // Find event by ID
      const foundEvent = events.find(e => e.id === eventId);
      
      setTimeout(() => {
        if (foundEvent) {
          setEvent(foundEvent);
        }
        setIsLoading(false);
      }, 300);
    };
    
    fetchEvent();
  }, [eventId]);
  
  // Calculate price based on selection
  const calculatePrice = () => {
    if (!event) return 0;
    
    return registrationType === "full" 
      ? event.fullPrice 
      : (event.singleDayPrice || event.fullPrice);
  };
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    const requiredFields: (keyof typeof formData)[] = [
      'firstName', 'lastName', 'email', 'phone', 'grade', 'gender', 'schoolName',
      'emergencyContactName', 'emergencyContactPhone'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Grade validation
    if (formData.grade && formData.grade.trim().length === 0) {
      newErrors.grade = 'Please enter your current grade';
    }
    
    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    // Emergency phone validation
    if (formData.emergencyContactPhone && !/^\d{10}$/.test(formData.emergencyContactPhone.replace(/\D/g, ''))) {
      newErrors.emergencyContactPhone = 'Please enter a valid 10-digit phone number';
    }
    
    // Agreement required
    if (!formData.agrees) {
      newErrors.agrees = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle proceed to payment
  const handleProceedToPayment = () => {
    if (!validateForm()) return;
    
    // Store form data in sessionStorage temporarily - NO database writes until payment succeeds
    const registrationData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      grade: formData.grade,
      gender: formData.gender,
      schoolName: formData.schoolName,
      clubName: formData.clubName,
      emergencyContactName: formData.emergencyContactName,
      emergencyContactPhone: formData.emergencyContactPhone,
      specialRequirements: formData.specialRequirements,
      registrationType: registrationType
    };
    
    // Save to sessionStorage for the checkout process
    Object.entries(registrationData).forEach(([key, value]) => {
      sessionStorage.setItem(`registration_${key}`, value || '');
    });
    
    // Route directly to Stripe checkout page with event details
    const checkoutUrl = `/stripe-checkout?eventId=${event.id}&eventName=${encodeURIComponent(event.title)}&option=${registrationType}`;
    window.location.href = checkoutUrl;
  };
  
  const handleSubmitRegistration = () => {
    setFormSubmitted(true);
    // In a real app, this would be handled by the Stripe webhook
    // which would confirm the payment was successful before
    // finalizing the registration
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-16">
        <h1 
          className="text-3xl mb-4"
          style={{ fontFamily: "'Bodoni FLF', serif" }}
        >
          Event Not Found
        </h1>
        <p 
          className="text-gray-600 mb-8"
          style={{ fontFamily: "'Didact Gothic', sans-serif" }}
        >
          The event you are trying to register for does not exist.
        </p>
        <Link href="/events">
          <motion.span
            className="inline-block border border-gray-900 px-6 py-3 text-gray-900 cursor-pointer"
            whileHover={{ 
              backgroundColor: '#1f2937', 
              color: '#ffffff'
            }}
            transition={{ duration: 0.2 }}
            style={{ fontFamily: "'Sanchez', serif" }}
          >
            Back to Events
          </motion.span>
        </Link>
      </div>
    );
  }
  
  if (formSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="container mx-auto px-6">
          <motion.div 
            className="max-w-2xl mx-auto text-center p-12 bg-white border border-gray-200"
            variants={fadeIn}
            initial="initial"
            animate="animate"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 
              className="text-3xl mb-6"
              style={{ fontFamily: "'Bodoni FLF', serif" }}
            >
              Registration Complete
            </h1>
            
            <p 
              className="text-gray-700 mb-8"
              style={{ fontFamily: "'Didact Gothic', sans-serif" }}
            >
              Thank you for registering for {event.title}. We've sent a confirmation email to {formData.email} with all the details.
            </p>
            
            <Link href="/">
              <motion.span
                className="inline-block bg-gray-900 px-6 py-3 text-white cursor-pointer"
                whileHover={{ 
                  backgroundColor: '#111827',
                  x: 2
                }}
                transition={{ duration: 0.2 }}
                style={{ fontFamily: "'Sanchez', serif" }}
              >
                Return to Home
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            className="mb-12 text-center"
            variants={fadeIn}
            initial="initial"
            animate="animate"
          >
            <h1 
              className="text-3xl md:text-4xl mb-4"
              style={{ fontFamily: "'Bodoni FLF', serif" }}
            >
              Register for {event.title}
            </h1>
            <p 
              className="text-gray-600"
              style={{ fontFamily: "'Didact Gothic', sans-serif" }}
            >
              {event.date} • {event.location}
            </p>
          </motion.div>
          
          {/* Steps */}
          <div className="mb-12">
            <div className="flex justify-between items-center">
              <div className={`flex flex-col items-center ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 1 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  1
                </div>
                <span style={{ fontFamily: "'Sanchez', serif" }}>Registration</span>
              </div>
              
              <div className={`flex-1 h-px mx-4 ${step >= 2 ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
              
              <div className={`flex flex-col items-center ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 2 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  2
                </div>
                <span style={{ fontFamily: "'Sanchez', serif" }}>Payment</span>
              </div>
              
              <div className={`flex-1 h-px mx-4 ${step >= 3 ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
              
              <div className={`flex flex-col items-center ${step >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 3 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  3
                </div>
                <span style={{ fontFamily: "'Sanchez', serif" }}>Confirmation</span>
              </div>
            </div>
          </div>
          
          {/* Registration Form */}
          {step === 1 && (
            <motion.div
              variants={fadeIn}
              initial="initial"
              animate="animate"
            >
              <div className="bg-white border border-gray-200 p-8 mb-8">
                <h2 
                  className="text-2xl mb-6"
                  style={{ fontFamily: "'Bodoni FLF', serif" }}
                >
                  Registration Options
                </h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="full"
                      name="registrationType"
                      value="full"
                      checked={registrationType === "full"}
                      onChange={() => setRegistrationType("full")}
                      className="h-5 w-5 text-gray-900 focus:ring-gray-500"
                    />
                    <label 
                      htmlFor="full" 
                      className="text-gray-800"
                      style={{ fontFamily: "'Didact Gothic', sans-serif" }}
                    >
                      Full Event (${event.fullPrice})
                    </label>
                  </div>
                  
                  {event.singleDayPrice && (
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="singleDay"
                        name="registrationType"
                        value="singleDay"
                        checked={registrationType === "singleDay"}
                        onChange={() => setRegistrationType("singleDay")}
                        className="h-5 w-5 text-gray-900 focus:ring-gray-500"
                      />
                      <label 
                        htmlFor="singleDay" 
                        className="text-gray-800"
                        style={{ fontFamily: "'Didact Gothic', sans-serif" }}
                      >
                        Single Day (${event.singleDayPrice})
                      </label>
                    </div>
                  )}
                </div>
                
                <hr className="my-8" />
                
                <h2 
                  className="text-2xl mb-6"
                  style={{ fontFamily: "'Bodoni FLF', serif" }}
                >
                  Personal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label 
                      htmlFor="firstName" 
                      className="block mb-2 text-gray-800"
                      style={{ fontFamily: "'Sanchez', serif" }}
                    >
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full p-3 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-gray-900`}
                      style={{ fontFamily: "'Arial', sans-serif" }}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-red-500 text-sm">{errors.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="lastName" 
                      className="block mb-2 text-gray-800"
                      style={{ fontFamily: "'Sanchez', serif" }}
                    >
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full p-3 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-gray-900`}
                      style={{ fontFamily: "'Arial', sans-serif" }}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-red-500 text-sm">{errors.lastName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="email" 
                      className="block mb-2 text-gray-800"
                      style={{ fontFamily: "'Sanchez', serif" }}
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-gray-900`}
                      style={{ fontFamily: "'Arial', sans-serif" }}
                    />
                    {errors.email && (
                      <p className="mt-1 text-red-500 text-sm">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="phone" 
                      className="block mb-2 text-gray-800"
                      style={{ fontFamily: "'Sanchez', serif" }}
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full p-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-gray-900`}
                      style={{ fontFamily: "'Arial', sans-serif" }}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-red-500 text-sm">{errors.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="grade" 
                      className="block mb-2 text-gray-800"
                      style={{ fontFamily: "'Sanchez', serif" }}
                    >
                      Grade *
                    </label>
                    <input
                      type="text"
                      id="grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      placeholder="e.g., 8th, 11th, etc."
                      className={`w-full p-3 border ${errors.grade ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-gray-900`}
                      style={{ fontFamily: "'Arial', sans-serif" }}
                    />
                    {errors.grade && (
                      <p className="mt-1 text-red-500 text-sm">{errors.grade}</p>
                    )}
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="gender" 
                      className="block mb-2 text-gray-800"
                      style={{ fontFamily: "'Sanchez', serif" }}
                    >
                      Gender *
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`w-full p-3 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-gray-900`}
                      style={{ fontFamily: "'Arial', sans-serif" }}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-red-500 text-sm">{errors.gender}</p>
                    )}
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="schoolName" 
                      className="block mb-2 text-gray-800"
                      style={{ fontFamily: "'Sanchez', serif" }}
                    >
                      School Name *
                    </label>
                    <input
                      type="text"
                      id="schoolName"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      className={`w-full p-3 border ${errors.schoolName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-gray-900`}
                      style={{ fontFamily: "'Arial', sans-serif" }}
                    />
                    {errors.schoolName && (
                      <p className="mt-1 text-red-500 text-sm">{errors.schoolName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="clubName" 
                      className="block mb-2 text-gray-800"
                      style={{ fontFamily: "'Sanchez', serif" }}
                    >
                      Wrestling Club (Optional)
                    </label>
                    <input
                      type="text"
                      id="clubName"
                      name="clubName"
                      value={formData.clubName}
                      onChange={handleChange}
                      className={`w-full p-3 border ${errors.clubName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-gray-900`}
                      style={{ fontFamily: "'Arial', sans-serif" }}
                    />
                    {errors.clubName && (
                      <p className="mt-1 text-red-500 text-sm">{errors.clubName}</p>
                    )}
                  </div>
                </div>
                
                <hr className="my-8" />
                
                <h2 
                  className="text-2xl mb-6"
                  style={{ fontFamily: "'Bodoni FLF', serif" }}
                >
                  Emergency Contact
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label 
                      htmlFor="emergencyContactName" 
                      className="block mb-2 text-gray-800"
                      style={{ fontFamily: "'Sanchez', serif" }}
                    >
                      Emergency Contact Name *
                    </label>
                    <input
                      type="text"
                      id="emergencyContactName"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      className={`w-full p-3 border ${errors.emergencyContactName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-gray-900`}
                      style={{ fontFamily: "'Arial', sans-serif" }}
                    />
                    {errors.emergencyContactName && (
                      <p className="mt-1 text-red-500 text-sm">{errors.emergencyContactName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="emergencyContactPhone" 
                      className="block mb-2 text-gray-800"
                      style={{ fontFamily: "'Sanchez', serif" }}
                    >
                      Emergency Contact Phone *
                    </label>
                    <input
                      type="tel"
                      id="emergencyContactPhone"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      className={`w-full p-3 border ${errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-gray-900`}
                      style={{ fontFamily: "'Arial', sans-serif" }}
                    />
                    {errors.emergencyContactPhone && (
                      <p className="mt-1 text-red-500 text-sm">{errors.emergencyContactPhone}</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-8">
                  <label 
                    htmlFor="specialRequirements" 
                    className="block mb-2 text-gray-800"
                    style={{ fontFamily: "'Sanchez', serif" }}
                  >
                    Special Requirements/Medical Information
                  </label>
                  <textarea
                    id="specialRequirements"
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-3 border border-gray-300 focus:outline-none focus:border-gray-900"
                    style={{ fontFamily: "'Arial', sans-serif" }}
                    placeholder="Enter any allergies, medical conditions, or special needs"
                  ></textarea>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="agrees"
                      name="agrees"
                      checked={formData.agrees}
                      onChange={handleChange}
                      className={`mt-1 h-5 w-5 ${errors.agrees ? 'border-red-500' : 'border-gray-300'} text-gray-900 focus:ring-gray-500`}
                    />
                    <label 
                      htmlFor="agrees" 
                      className="text-gray-800"
                      style={{ fontFamily: "'Didact Gothic', sans-serif" }}
                    >
                      I agree to the terms and conditions, including the waiver of liability for this event. I understand that registration is not complete until payment is processed.
                    </label>
                  </div>
                  {errors.agrees && (
                    <p className="mt-1 text-red-500 text-sm">{errors.agrees}</p>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <Link href={`/events/${event.id}`}>
                    <motion.span
                      className="inline-block border border-gray-900 px-6 py-3 text-gray-900 cursor-pointer"
                      whileHover={{ 
                        backgroundColor: '#f3f4f6'
                      }}
                      transition={{ duration: 0.2 }}
                      style={{ fontFamily: "'Sanchez', serif" }}
                    >
                      Back to Event
                    </motion.span>
                  </Link>
                  
                  <motion.button
                    type="button"
                    onClick={handleProceedToPayment}
                    className="bg-gray-900 px-6 py-3 text-white"
                    whileHover={{ 
                      backgroundColor: '#111827',
                      x: 2
                    }}
                    transition={{ duration: 0.2 }}
                    style={{ fontFamily: "'Sanchez', serif" }}
                  >
                    Proceed to Payment
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Payment Section */}
          {step === 2 && (
            <motion.div
              variants={fadeIn}
              initial="initial"
              animate="animate"
              className="bg-white border border-gray-200 p-8 mb-8"
            >
              <h2 
                className="text-2xl mb-6"
                style={{ fontFamily: "'Bodoni FLF', serif" }}
              >
                Payment
              </h2>
              
              <div className="mb-8">
                <h3 
                  className="text-lg mb-4"
                  style={{ fontFamily: "'Sanchez', serif" }}
                >
                  Order Summary
                </h3>
                
                <div className="border border-gray-200 p-6 mb-6">
                  <div className="flex justify-between mb-4">
                    <span style={{ fontFamily: "'Didact Gothic', sans-serif" }}>
                      {event.title} - {registrationType === "full" ? "Full Event" : "Single Day"}
                    </span>
                    <span className="font-medium" style={{ fontFamily: "'Arial', sans-serif" }}>
                      ${calculatePrice()}
                    </span>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 flex justify-between font-medium">
                    <span style={{ fontFamily: "'Sanchez', serif" }}>Total</span>
                    <span style={{ fontFamily: "'Sanchez', serif" }}>${calculatePrice()}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 
                  className="text-lg mb-4"
                  style={{ fontFamily: "'Sanchez', serif" }}
                >
                  Payment Details
                </h3>
                
                {clientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm onSuccess={() => setStep(3)} />
                  </Elements>
                )}
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="border border-gray-900 px-6 py-3 text-gray-900"
                  style={{ fontFamily: "'Sanchez', serif" }}
                >
                  Back
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Confirmation Step */}
          {step === 3 && (
            <motion.div
              variants={fadeIn}
              initial="initial"
              animate="animate"
              className="bg-white border border-gray-200 p-8 mb-8 text-center"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 
                className="text-2xl mb-6"
                style={{ fontFamily: "'Bodoni FLF', serif" }}
              >
                Payment Successful
              </h2>
              
              <p 
                className="text-gray-700 mb-8"
                style={{ fontFamily: "'Didact Gothic', sans-serif" }}
              >
                Your payment has been processed successfully. Click the button below to complete your registration.
              </p>
              
              <button
                type="button"
                onClick={handleSubmitRegistration}
                className="bg-gray-900 px-6 py-3 text-white"
                style={{ fontFamily: "'Sanchez', serif" }}
              >
                Complete Registration
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}