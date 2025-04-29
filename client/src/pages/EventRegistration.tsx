import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { Container } from '@/components/ui/container';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import ShopifyCheckoutFrame from '@/components/ShopifyCheckoutFrame';

export default function EventRegistration() {
  const [location, navigate] = useLocation();
  const [registrationForm, setRegistrationForm] = useState({
    firstName: '',
    lastName: '',
    contactName: '',
    email: '',
    phone: '',
    tShirtSize: '',
    grade: '',
    schoolName: '',
    clubName: '',
    medicalReleaseAccepted: false,
    registrationType: 'full', // 'full' or 'single'
    day1: false, // for Cory Land Tour
    day2: false, // for Cory Land Tour
    day3: false, // for Cory Land Tour
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Extract the event ID from the URL
  const eventId = parseInt(location.split('/')[2] || "0", 10);
  
  // State for loading event data
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCheckoutFrame, setShowCheckoutFrame] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string>('');
  
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
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form data
    const requiredFields = [
      { field: 'firstName', label: 'First Name' },
      { field: 'lastName', label: 'Last Name' },
      { field: 'contactName', label: 'Parent/Guardian Name' },
      { field: 'email', label: 'Email' },
      { field: 'tShirtSize', label: 'T-Shirt Size' },
      { field: 'grade', label: 'Grade' },
      { field: 'schoolName', label: 'School Name' }
    ];
    
    const missingFields = requiredFields.filter(
      ({ field }) => !registrationForm[field as keyof typeof registrationForm]
    );
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`,
        variant: "destructive"
      });
      return;
    }
    
    if (!registrationForm.medicalReleaseAccepted) {
      toast({
        title: "Medical Release Required",
        description: "You must accept the medical release waiver to register",
        variant: "destructive"
      });
      return;
    }
    
    // Validate day selection for Cory Land Tour
    if (event.id === 4 && registrationForm.registrationType === 'single') {
      const daySelected = registrationForm.day1 || registrationForm.day2 || registrationForm.day3;
      if (!daySelected) {
        toast({
          title: "Day Selection Required",
          description: "Please select at least one day for the Cory Land Tour",
          variant: "destructive"
        });
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      
      // Notify user we're processing
      toast({
        title: "Registration In Progress",
        description: "Preparing your registration...",
      });
      
      // Map form fields to match server expected format
      const formData = {
        ...registrationForm,
        eventId: eventId,
        option: registrationForm.registrationType, // Map to the server-expected property name
      };
      
      console.log('Submitting registration data:', formData);
      
      // Submit to backend API
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      console.log('Registration response received:', data);
      
      if (!response.ok) {
        console.error('Registration request failed:', response.status, data);
        throw new Error(data.message || 'Failed to register');
      }
      
      if (data.checkoutUrl) {
        // Log the checkout URL for debugging
        console.log('Loading Shopify checkout in iframe:', data.checkoutUrl);
        
        // Registration successful, show embedded checkout
        toast({
          title: "Registration Successful",
          description: "Loading secure payment form...",
        });
        
        // Ensure the URL is properly formatted
        let formattedCheckoutUrl = data.checkoutUrl;
        if (!formattedCheckoutUrl.startsWith('http')) {
          formattedCheckoutUrl = 'https://' + formattedCheckoutUrl;
          console.log('Fixed checkout URL format:', formattedCheckoutUrl);
        }
        
        console.log('Showing checkout in iframe:', formattedCheckoutUrl);
        // Show the checkout in an iframe - directly set state without try/catch (setState can't throw)
        setCheckoutUrl(formattedCheckoutUrl);
        setShowCheckoutFrame(true);
      } else {
        toast({
          title: "Registration Received",
          description: "Your registration has been submitted, but payment processing is currently unavailable.",
        });
        // Redirect back to the event page
        navigate(`/events/${eventId}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Attempt to extract a more detailed error message
      let errorMessage = "An unknown error occurred";
      let errorDetails = {};
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorDetails = error;
      }
      
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
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 rounded-full border-t-primary"></div>
        <p className="mt-4 text-gray-600">Loading registration form...</p>
      </div>
    );
  }
  
  // Error state
  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h1>
        <p className="text-gray-600 mb-6">{error || "The event you're looking for doesn't exist or has been removed."}</p>
        <a href="/events" className="text-primary underline">Return to Events</a>
      </div>
    );
  }
  
  // Calculate price based on event and registration type
  const getPrice = () => {
    switch (event.id) {
      case 1: // Birmingham Slam Camp
        return registrationForm.registrationType === 'full' ? '$249' : '$149 per day';
      case 2: // National Champ Camp
        return registrationForm.registrationType === 'full' ? '$349' : '$175 per day';
      case 3: // Texas Recruiting Clinic
        return registrationForm.registrationType === 'full' ? '$249' : '$149 per day';
      case 4: // Cory Land Tour
        if (registrationForm.registrationType === 'full') {
          return '$200 for all days';
        } else {
          const selectedDays = [registrationForm.day1, registrationForm.day2, registrationForm.day3].filter(Boolean).length;
          return `$99 per day (${selectedDays} day${selectedDays !== 1 ? 's' : ''} selected: $${selectedDays * 99})`;
        }
      default:
        return 'Price unavailable';
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Register for {event.title} | Rich Habits</title>
        <meta name="description" content={`Register for ${event.title} - ${event.location} - ${event.dates}`} />
      </Helmet>
      
      {/* Embedded Shopify checkout iframe */}
      {showCheckoutFrame && checkoutUrl && (
        <ShopifyCheckoutFrame 
          checkoutUrl={checkoutUrl} 
          onClose={() => setShowCheckoutFrame(false)} 
        />
      )}
      
      <div className="bg-white">
        <Container className="py-8 md:py-12">
          <div className="max-w-3xl mx-auto">
            <a href={`/events/${eventId}`} className="text-primary hover:text-primary/80 flex items-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Event Details
            </a>
            
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Register for {event.title}</h1>
                <p className="mt-2 text-gray-600">
                  Complete the form below to register for this event taking place {event.dates} at {event.location}.
                </p>
                <div className="mt-3 inline-block bg-gray-100 px-3 py-1 rounded text-sm text-gray-700">
                  Price: {getPrice()}
                </div>
              </div>
              
              <Separator />
              
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Participant Information</h2>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Participant First Name</Label>
                      <Input 
                        id="firstName" 
                        value={registrationForm.firstName}
                        onChange={(e) => setRegistrationForm({...registrationForm, firstName: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Participant Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={registrationForm.lastName}
                        onChange={(e) => setRegistrationForm({...registrationForm, lastName: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="contactName">Parent/Guardian Name</Label>
                      <Input 
                        id="contactName" 
                        value={registrationForm.contactName}
                        onChange={(e) => setRegistrationForm({...registrationForm, contactName: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={registrationForm.email}
                        onChange={(e) => setRegistrationForm({...registrationForm, email: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input 
                        id="phone" 
                        type="tel"
                        value={registrationForm.phone}
                        onChange={(e) => setRegistrationForm({...registrationForm, phone: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tShirtSize">T-Shirt Size</Label>
                      <Select 
                        value={registrationForm.tShirtSize}
                        onValueChange={(value) => setRegistrationForm({...registrationForm, tShirtSize: value})}
                      >
                        <SelectTrigger id="tShirtSize">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Youth S">Youth S</SelectItem>
                          <SelectItem value="Youth M">Youth M</SelectItem>
                          <SelectItem value="Youth L">Youth L</SelectItem>
                          <SelectItem value="Youth XL">Youth XL</SelectItem>
                          <SelectItem value="Adult XS">Adult XS</SelectItem>
                          <SelectItem value="Adult S">Adult S</SelectItem>
                          <SelectItem value="Adult M">Adult M</SelectItem>
                          <SelectItem value="Adult L">Adult L</SelectItem>
                          <SelectItem value="Adult XL">Adult XL</SelectItem>
                          <SelectItem value="Adult 2XL">Adult 2XL</SelectItem>
                          <SelectItem value="Adult 3XL">Adult 3XL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="grade">Current Grade</Label>
                      <Input 
                        id="grade" 
                        value={registrationForm.grade}
                        onChange={(e) => setRegistrationForm({...registrationForm, grade: e.target.value})}
                        required
                        placeholder="e.g., 8th, 11th, etc."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">School Name</Label>
                      <Input 
                        id="schoolName" 
                        value={registrationForm.schoolName}
                        onChange={(e) => setRegistrationForm({...registrationForm, schoolName: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="clubName">Wrestling Club (Optional)</Label>
                      <Input 
                        id="clubName" 
                        value={registrationForm.clubName}
                        onChange={(e) => setRegistrationForm({...registrationForm, clubName: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Registration Options</h2>
                  
                  <div className="space-y-4">
                    <Label>Registration Type</Label>
                    <RadioGroup 
                      value={registrationForm.registrationType}
                      onValueChange={(value) => setRegistrationForm({...registrationForm, registrationType: value as 'full' | 'single'})}
                      className="space-y-3"
                    >
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="full" id="option-full" />
                        <div className="grid gap-1.5">
                          <Label htmlFor="option-full" className="font-medium">
                            {event.id === 4 ? 'Full Tour - All Days' : 'Full Camp/Clinic'}
                          </Label>
                          <p className="text-sm text-gray-500">
                            {event.id === 1 && 'All three days for $249'}
                            {event.id === 2 && 'All four days for $349'}
                            {event.id === 3 && 'Both days for $249'}
                            {event.id === 4 && 'All three locations for $200 (save $97)'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="single" id="option-single" />
                        <div className="grid gap-1.5">
                          <Label htmlFor="option-single" className="font-medium">
                            {event.id === 4 ? 'Individual Days' : 'Single Day'}
                          </Label>
                          <p className="text-sm text-gray-500">
                            {event.id === 1 && 'One day only for $149'}
                            {event.id === 2 && 'Individual days for $175 per day'}
                            {event.id === 3 && 'One day only for $149'}
                            {event.id === 4 && 'Select specific locations for $99 per day'}
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {/* Day selection for Cory Land Tour */}
                  {event.id === 4 && registrationForm.registrationType === 'single' && (
                    <div className="space-y-4 border rounded-md p-4 bg-gray-50">
                      <Label className="font-medium">Select Day(s)</Label>
                      <p className="text-sm text-gray-500 mb-2">Choose which locations you'll attend:</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="day1" 
                            checked={registrationForm.day1}
                            onCheckedChange={(checked) => setRegistrationForm({
                              ...registrationForm, 
                              day1: checked === true
                            })}
                          />
                          <Label htmlFor="day1" className="cursor-pointer">Day 1 - Athens High School (July 23)</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="day2" 
                            checked={registrationForm.day2}
                            onCheckedChange={(checked) => setRegistrationForm({
                              ...registrationForm, 
                              day2: checked === true
                            })}
                          />
                          <Label htmlFor="day2" className="cursor-pointer">Day 2 - Ironclad Wrestling Club (July 24)</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="day3" 
                            checked={registrationForm.day3}
                            onCheckedChange={(checked) => setRegistrationForm({
                              ...registrationForm, 
                              day3: checked === true
                            })}
                          />
                          <Label htmlFor="day3" className="cursor-pointer">Day 3 - South AL Location (July 25)</Label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-md">
                    <Checkbox 
                      id="medicalRelease" 
                      checked={registrationForm.medicalReleaseAccepted}
                      onCheckedChange={(checked) => setRegistrationForm({
                        ...registrationForm, 
                        medicalReleaseAccepted: checked === true
                      })}
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="medicalRelease" className="font-medium">Medical Release Waiver</Label>
                      <p className="text-sm text-gray-500 mt-1">
                        I hereby give permission for my child to participate in this event and authorize the camp staff to act in my 
                        absence in any emergency requiring medical attention. I acknowledge that participation involves risk of injury. 
                        I, for myself, my child, and our heirs, waive and release any and all rights and claims against Rich Habits, its 
                        coaches, staff, and facility for any injuries or illnesses incurred during the event.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate(`/events/${eventId}`)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Complete Registration"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}