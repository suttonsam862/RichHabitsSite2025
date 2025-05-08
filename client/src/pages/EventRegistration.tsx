import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { Container } from '@/components/Container';
import { useToast } from '@/hooks/use-toast';
import { RegistrationProgress, type RegistrationStep } from '@/components/RegistrationProgress';
import { 
  updateRegistrationStatus, 
  handleRegistrationError,
  getCompletedRegistrations 
} from '@/lib/registrationUtils';
import { 
  EventRegistrationForm, 
  type RegistrationFormData 
} from '@/components/events/EventRegistrationForm';

export default function EventRegistration() {
  const [location, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Extract the event ID from the URL
  const eventId = parseInt(location.split('/')[2] || "0", 10);
  
  // State for loading event data
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('form');

  // Fetch event data from API
  useEffect(() => {
    async function fetchEvent() {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Event not found');
          } else {
            throw new Error('Failed to fetch event data');
          }
          return;
        }
        
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Could not load event data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvent();
  }, [eventId]);
  
  // Handle standardized form submission process
  const handleFormSubmit = async (formData: RegistrationFormData) => {
    try {
      setIsSubmitting(true);
      setCurrentStep('processing');
      
      // Update registration status in our centralized system
      updateRegistrationStatus(eventId, 'processing');
      
      // Notify user we're processing
      toast({
        title: "Registration In Progress",
        description: "Preparing your registration...",
      });
      
      // Prepare form data with consistent naming for the API
      const apiFormData = {
        ...formData,
        eventId: eventId,
        // Explicitly map 'option' to 'registrationType' to ensure consistency with the API schema
        registrationType: formData.option,
      };
      
      console.log('Submitting registration data:', apiFormData);
      
      // Submit to backend API
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiFormData),
      });
      
      const data = await response.json();
      console.log('Registration response received:', data);
      
      if (!response.ok) {
        console.error('Registration request failed:', response.status, data);
        throw new Error(data.message || 'Failed to register');
      }
      
      // Registration successful, show toast message
      toast({
        title: "Registration Successful",
        description: "Preparing your checkout...",
      });
      
      setCurrentStep('checkout');
      updateRegistrationStatus(eventId, 'checkout');
      
      // Always use Stripe checkout instead of Shopify direct checkout
      const stripeCheckoutUrl = `/stripe-checkout?eventId=${eventId}&eventName=${encodeURIComponent(event.title)}&option=${encodeURIComponent(formData.option)}`;
      
      console.log('Using Stripe checkout:', stripeCheckoutUrl);
      
      toast({
        title: "Registration Successful",
        description: "Redirecting to secure payment...",
      });
      
      // Short timeout to allow the success toast to be seen
      setTimeout(() => {
        navigate(stripeCheckoutUrl);
      }, 1000);
      
    } catch (error) {
      // Use our centralized error handling
      const errorObj = error instanceof Error ? error : new Error('Unknown registration error');
      handleRegistrationError(eventId, errorObj);
      
      // Extract message for the toast
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      // Display the error to the user
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="mt-4 text-gray-600">Loading event information...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <div className="text-red-600 text-4xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{error}</h1>
        <p className="text-gray-600 mb-6">We couldn't find the event you're looking for.</p>
        <button 
          onClick={() => navigate('/events')}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Browse All Events
        </button>
      </div>
    );
  }
  
  // Event found, show registration form
  return (
    <>
      <Helmet>
        <title>{event.title} Registration | Rich Habits</title>
        <meta name="description" content={`Register for ${event.title}, ${event.date} at ${event.location}.`} />
      </Helmet>
      
      <div className="bg-gray-50 py-4 border-b">
        <Container>
          <RegistrationProgress currentStep="form" />
        </Container>
      </div>
      
      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              {event.imageUrl && (
                <div className="w-full md:w-1/3 lg:w-1/4">
                  <img 
                    src={event.imageUrl}
                    alt={event.title} 
                    className="w-full h-auto rounded-md object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                <div className="flex flex-col space-y-2 text-gray-700">
                  <div>📅 <span className="font-medium">Date:</span> {event.date}</div>
                  <div>📍 <span className="font-medium">Location:</span> {event.location}</div>
                  <div>👥 <span className="font-medium">Capacity:</span> {event.capacity || 'Limited spots available'}</div>
                  
                  {event.id === 4 ? (
                    <div className="mt-4">
                      <div className="font-medium text-gray-800 mb-1">Pricing:</div>
                      <div className="text-sm">
                        <div>• Full Tour (all locations): $200 (save $97)</div>
                        <div>• Individual locations: $99 per day</div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <div className="font-medium text-gray-800 mb-1">Pricing:</div>
                      <div className="text-sm">
                        <div>• Full Camp: ${event.id === 2 ? '349' : '249'}</div>
                        <div>• Single Day: ${event.id === 2 ? '175' : '149'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="prose max-w-none mb-6">
              <h2>About This Event</h2>
              <p>{event.description}</p>
              
              {event.id === 1 && (
                <div className="not-prose p-4 bg-amber-50 border border-amber-200 rounded-md mb-4">
                  <div className="font-medium text-amber-800">Special Feature: Fruit Hunters Collaboration</div>
                  <p className="text-amber-700 text-sm mt-1">
                    This camp features an exclusive partnership with Fruit Hunters, an American exotic fruits company. 
                    Participants will receive special tropical fruit treats during the camp.
                  </p>
                </div>
              )}
              
              <h2>What to Bring</h2>
              <ul>
                <li>Wrestling shoes</li>
                <li>Workout clothes</li>
                <li>Water bottle</li>
                <li>Snacks</li>
                <li>Small towel</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Registration Form</h2>
            <EventRegistrationForm 
              event={event}
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </Container>
    </>
  );
}