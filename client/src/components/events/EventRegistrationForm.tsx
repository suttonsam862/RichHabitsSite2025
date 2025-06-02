import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipProvider } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

// Define the registration form data structure for type safety
export interface RegistrationFormData {
  firstName: string;
  lastName: string;
  contactName: string;
  email: string;
  phone: string;
  tShirtSize: string;
  grade: string;
  gender: string;
  schoolName: string;
  clubName: string;
  medicalReleaseAccepted: boolean;
  option: 'full' | 'single' | '1day' | '2day';
  day1: boolean;
  day2: boolean;
  day3: boolean;
  // New fields for National Champ Camp flexible options
  numberOfDays?: number;
  selectedDates?: string[];
}

// Define the props for the component
interface EventRegistrationFormProps {
  event: any;
  onSubmit: (formData: RegistrationFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function EventRegistrationForm({ 
  event, 
  onSubmit,
  isSubmitting 
}: EventRegistrationFormProps) {
  const { toast } = useToast();
  
  // Initialize form state with default values
  const [registrationForm, setRegistrationForm] = useState<RegistrationFormData>({
    firstName: '',
    lastName: '',
    contactName: '',
    email: '',
    phone: '',
    tShirtSize: '',
    grade: '',
    gender: '',
    schoolName: '',
    clubName: '',
    medicalReleaseAccepted: false,
    option: 'full',
    day1: false,
    day2: false,
    day3: false,
    numberOfDays: 3,
    selectedDates: [],
  });

  // Attempt to recover from previously interrupted registration
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('registration_form_data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Check if the saved data is for the current event and not too old (within last 24 hours)
        const savedTimestamp = new Date(parsedData.timestamp).getTime();
        const now = new Date().getTime();
        const isRecent = (now - savedTimestamp) < (24 * 60 * 60 * 1000); // 24 hours
        
        if (parsedData.eventId === event.id && isRecent) {
          // Show recovery option
          toast({
            title: "Registration Data Found",
            description: "We found your previous registration information. Would you like to restore it?",
            action: (
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    // Remove eventId and timestamp from the saved data
                    const { eventId, timestamp, ...formData } = parsedData;
                    setRegistrationForm(prevState => ({ ...prevState, ...formData }));
                    toast({
                      title: "Data Restored",
                      description: "Your previous registration information has been restored."
                    });
                  }}
                  className="px-3 py-1 text-xs rounded-md bg-primary text-white hover:bg-primary/90"
                >
                  Restore
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem('registration_form_data');
                    toast({
                      title: "Data Cleared",
                      description: "Previous registration information has been cleared."
                    });
                  }}
                  className="px-3 py-1 text-xs rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Ignore
                </button>
              </div>
            ),
          });
        } else {
          // Clear outdated data
          localStorage.removeItem('registration_form_data');
        }
      }
    } catch (error) {
      console.warn('Could not recover registration data:', error);
      localStorage.removeItem('registration_form_data');
    }
  }, [event.id, toast]);

  // Form validation function
  const validateForm = (): { valid: boolean, errors: string[] } => {
    console.log('Starting form validation');
    
    const validationErrors: string[] = [];
    
    // Check required fields
    const requiredFields = [
      { field: 'firstName', label: 'First Name' },
      { field: 'lastName', label: 'Last Name' },
      { field: 'contactName', label: 'Parent/Guardian Name' },
      { field: 'email', label: 'Email' },
      { field: 'phone', label: 'Phone Number' },
      { field: 'tShirtSize', label: 'T-Shirt Size' },
      { field: 'grade', label: 'Grade' },
      { field: 'schoolName', label: 'School Name' }
    ];
    
    console.log('Checking required fields', registrationForm);
    
    const missingFields = requiredFields.filter(
      ({ field }) => {
        const value = registrationForm[field as keyof typeof registrationForm];
        return !value || (typeof value === 'string' && value.trim() === '');
      }
    );
    
    if (missingFields.length > 0) {
      missingFields.forEach(({ label }) => {
        validationErrors.push(`${label} is required`);
      });
      console.log('Missing required fields:', missingFields);
    }
    
    // Email validation
    if (registrationForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationForm.email)) {
      validationErrors.push('Please enter a valid email address');
    }
    
    // Phone validation
    if (!registrationForm.phone) {
      validationErrors.push('Phone number is required');
    } else if (!/^[0-9\-\+\(\)\s\.]{7,}$/.test(registrationForm.phone)) {
      validationErrors.push('Please enter a valid phone number');
    }
    
    // Day selection validation for Cory Land Tour (event ID 4)
    if (event.id === 4) {
      if (registrationForm.option === 'single' && 
          !registrationForm.day1 && !registrationForm.day2 && !registrationForm.day3) {
        validationErrors.push('Please select at least one day for the Cory Land Tour');
      }
    }
    
    // Date selection validation for National Champ Camp (event ID 2)
    if (event.id === 2) {
      if (registrationForm.option === '1day' || registrationForm.option === '2day') {
        const requiredDays = registrationForm.numberOfDays || 1;
        const selectedDays = registrationForm.selectedDates?.length || 0;
        
        if (selectedDays === 0) {
          validationErrors.push(`Please select ${requiredDays === 1 ? 'a day' : `${requiredDays} days`} for your registration`);
        } else if (selectedDays !== requiredDays) {
          validationErrors.push(`Please select exactly ${requiredDays} ${requiredDays === 1 ? 'day' : 'days'} for your ${registrationForm.option} option`);
        }
      }
    } 
    
    // Medical release validation
    if (!registrationForm.medicalReleaseAccepted) {
      validationErrors.push('You must accept the medical release waiver to register');
    }
    
    console.log('Validation completed with', validationErrors.length, 'errors');
    
    return {
      valid: validationErrors.length === 0,
      errors: validationErrors
    };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate the form
      const { valid, errors } = validateForm();
      
      if (!valid) {
        // Show toast with error summary
        toast({
          title: "Form Validation Error",
          description: errors.join('. '),
          variant: "destructive"
        });
        return;
      }
      
      // Save form data to sessionStorage for the checkout process
      // This is critical for the discount code and checkout process
      try {
        // Save to localStorage for recovery
        localStorage.setItem('registration_form_data', JSON.stringify({
          ...registrationForm,
          eventId: event.id,
          timestamp: new Date().toISOString()
        }));
        
        // Save all fields to sessionStorage for checkout
        Object.entries(registrationForm).forEach(([key, value]) => {
          sessionStorage.setItem(`registration_${key}`, value?.toString() || '');
        });
        
        // Also save email to sessionStorage for discount code validation
        if (registrationForm.email) {
          sessionStorage.setItem('registration_email', registrationForm.email);
          console.log('Saved email to sessionStorage for discount code validation:', registrationForm.email);
        }
      } catch (e) {
        console.warn('Unable to save registration data to storage:', e);
      }
      
      // Call the parent's onSubmit handler
      await onSubmit(registrationForm);
      
    } catch (error) {
      console.error('Error during form submission:', error);
      toast({
        title: "Submission Error",
        description: "There was a problem submitting your form. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <TooltipProvider>
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
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              type="tel"
              value={registrationForm.phone}
              onChange={(e) => setRegistrationForm({...registrationForm, phone: e.target.value})}
              required
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
            <Label htmlFor="gender">Gender</Label>
            <Select 
              value={registrationForm.gender}
              onValueChange={(value) => setRegistrationForm({...registrationForm, gender: value})}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
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
        
        {/* National Champ Camp Flexible Options Advertisement */}
        {event.id === 2 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-4 mb-6">
            <div className="text-center text-orange-800 font-medium">
              🔥 Now offering 1-Day and 2-Day Options – Flex your schedule, train like a champ! Only $119/day. Choose your days below.
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <Label>Registration Type</Label>
          <RadioGroup 
            value={registrationForm.option}
            onValueChange={(value) => {
              let updatedForm = {...registrationForm, option: value as 'full' | 'single' | '1day' | '2day'};
              
              // Handle National Champ Camp flexible options
              if (event.id === 2) {
                if (value === '1day') {
                  updatedForm.numberOfDays = 1;
                  updatedForm.selectedDates = [];
                } else if (value === '2day') {
                  updatedForm.numberOfDays = 2;
                  updatedForm.selectedDates = [];
                } else if (value === 'full') {
                  updatedForm.numberOfDays = 3;
                  updatedForm.selectedDates = ['June 5', 'June 6', 'June 7'];
                }
              }
              
              setRegistrationForm(updatedForm);
            }}
            className="space-y-3"
          >
            {/* National Champ Camp has different options */}
            {event.id === 2 ? (
              <>
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="1day" id="option-1day" />
                  <div className="grid gap-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="option-1day" className="font-medium">
                        1 Day Option
                      </Label>
                      <Tooltip content="Select any one day of the camp (June 5, 6, or 7). Perfect for trying out the camp or fitting around your schedule.">
                        <Info className="h-4 w-4 text-blue-500 cursor-help" />
                      </Tooltip>
                    </div>
                    <p className="text-sm text-gray-500">
                      Single day for $119
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="2day" id="option-2day" />
                  <div className="grid gap-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="option-2day" className="font-medium">
                        2 Day Option
                      </Label>
                      <Tooltip content="Select any two days to attend. Great value for wrestlers who want more training but can't commit to all three days.">
                        <Info className="h-4 w-4 text-blue-500 cursor-help" />
                      </Tooltip>
                    </div>
                    <p className="text-sm text-gray-500">
                      Choose any 2 days for $238
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="full" id="option-full" />
                  <div className="grid gap-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="option-full" className="font-medium">
                        Full 3-Day Camp
                      </Label>
                      <Tooltip content="Full camp access with all three days included. Best value and complete training experience - no date selection needed.">
                        <Info className="h-4 w-4 text-blue-500 cursor-help" />
                      </Tooltip>
                    </div>
                    <p className="text-sm text-gray-500">
                      All three days for $299
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="full" id="option-full" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="option-full" className="font-medium">
                      {event.id === 4 ? 'Full Tour - All Days' : 'Full Camp/Clinic'}
                    </Label>
                    <p className="text-sm text-gray-500">
                      {event.id === 1 && 'All three days for $249'}
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
                      {event.id === 3 && 'One day only for $149'}
                      {event.id === 4 && 'Select specific locations for $99 per day'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </RadioGroup>
        </div>
        
        {/* Date selection for National Champ Camp flexible options */}
        {event.id === 2 && (registrationForm.option === '1day' || registrationForm.option === '2day') && (
          <div className="space-y-4 border rounded-md p-4 bg-blue-50">
            <div className="flex items-center space-x-2">
              <Label className="font-medium">
                Select Your {registrationForm.option === '1day' ? 'Day' : 'Days'} 
                ({registrationForm.numberOfDays} {registrationForm.numberOfDays === 1 ? 'day' : 'days'})
              </Label>
              <Tooltip content="Choose the specific day(s) you'll attend. You must select the number of days that matches your package.">
                <Info className="h-4 w-4 text-blue-500 cursor-help" />
              </Tooltip>
            </div>
            <p className="text-sm text-blue-700 mb-2">
              Choose which {registrationForm.numberOfDays === 1 ? 'day you\'ll' : 'days you\'ll'} attend:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="june5" 
                  checked={registrationForm.selectedDates?.includes('June 5') || false}
                  onCheckedChange={(checked) => {
                    let newSelectedDates = registrationForm.selectedDates || [];
                    if (checked) {
                      if (newSelectedDates.length < (registrationForm.numberOfDays || 1)) {
                        newSelectedDates = [...newSelectedDates, 'June 5'];
                      }
                    } else {
                      newSelectedDates = newSelectedDates.filter(date => date !== 'June 5');
                    }
                    setRegistrationForm({
                      ...registrationForm, 
                      selectedDates: newSelectedDates
                    });
                  }}
                  disabled={
                    !registrationForm.selectedDates?.includes('June 5') && 
                    (registrationForm.selectedDates?.length || 0) >= (registrationForm.numberOfDays || 1)
                  }
                />
                <Label htmlFor="june5" className="cursor-pointer">June 5, 2025 - Day 1</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="june6" 
                  checked={registrationForm.selectedDates?.includes('June 6') || false}
                  onCheckedChange={(checked) => {
                    let newSelectedDates = registrationForm.selectedDates || [];
                    if (checked) {
                      if (newSelectedDates.length < (registrationForm.numberOfDays || 1)) {
                        newSelectedDates = [...newSelectedDates, 'June 6'];
                      }
                    } else {
                      newSelectedDates = newSelectedDates.filter(date => date !== 'June 6');
                    }
                    setRegistrationForm({
                      ...registrationForm, 
                      selectedDates: newSelectedDates
                    });
                  }}
                  disabled={
                    !registrationForm.selectedDates?.includes('June 6') && 
                    (registrationForm.selectedDates?.length || 0) >= (registrationForm.numberOfDays || 1)
                  }
                />
                <Label htmlFor="june6" className="cursor-pointer">June 6, 2025 - Day 2</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="june7" 
                  checked={registrationForm.selectedDates?.includes('June 7') || false}
                  onCheckedChange={(checked) => {
                    let newSelectedDates = registrationForm.selectedDates || [];
                    if (checked) {
                      if (newSelectedDates.length < (registrationForm.numberOfDays || 1)) {
                        newSelectedDates = [...newSelectedDates, 'June 7'];
                      }
                    } else {
                      newSelectedDates = newSelectedDates.filter(date => date !== 'June 7');
                    }
                    setRegistrationForm({
                      ...registrationForm, 
                      selectedDates: newSelectedDates
                    });
                  }}
                  disabled={
                    !registrationForm.selectedDates?.includes('June 7') && 
                    (registrationForm.selectedDates?.length || 0) >= (registrationForm.numberOfDays || 1)
                  }
                />
                <Label htmlFor="june7" className="cursor-pointer">June 7, 2025 - Day 3</Label>
              </div>
            </div>
            
            {registrationForm.selectedDates && registrationForm.selectedDates.length > 0 && (
              <div className="mt-3 p-3 bg-blue-100 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Selected:</strong> {registrationForm.selectedDates.join(', ')}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Total: ${registrationForm.numberOfDays === 1 ? '119' : '238'}
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Day selection for Cory Land Tour */}
        {event.id === 4 && registrationForm.option === 'single' && (
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
                <Label htmlFor="day1" className="cursor-pointer">Day 1 - East Hamilton High School (July 23)</Label>
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
                <Label htmlFor="day3" className="cursor-pointer">Day 3 - Southside High School (July 25)</Label>
              </div>
            </div>
          </div>
        )}
        
        {/* Single day for Birmingham Slam Camp can include day selection in the future */}
        {/* This commented section provides a template for adding day selection to more events */}
        {/*
        {event.id === 1 && registrationForm.option === 'single' && (
          <div className="space-y-4 border rounded-md p-4 bg-gray-50">
            <Label className="font-medium">Select Day</Label>
            <p className="text-sm text-gray-500 mb-2">Choose which day you'll attend:</p>
            
            <RadioGroup 
              // This would need state for the day selection
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="day1" id="day1" />
                <Label htmlFor="day1" className="cursor-pointer">Day 1 - June 19, 2025</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="day2" id="day2" />
                <Label htmlFor="day2" className="cursor-pointer">Day 2 - June 20, 2025</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="day3" id="day3" />
                <Label htmlFor="day3" className="cursor-pointer">Day 3 - June 21, 2025</Label>
              </div>
            </RadioGroup>
          </div>
        )}
        */}
        
        <div className="space-y-4 p-6 border rounded-md bg-gray-50">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="medicalRelease" 
              checked={registrationForm.medicalReleaseAccepted}
              onCheckedChange={(checked) => setRegistrationForm({
                ...registrationForm, 
                medicalReleaseAccepted: checked === true
              })}
              required
            />
            <div>
              <Label htmlFor="medicalRelease" className="font-medium">Medical Release Waiver</Label>
              <p className="text-sm text-gray-600 mt-1">
                I hereby give my permission for the participant to receive medical treatment in case of injury or 
                illness. I understand that Rich Habits and its staff are not responsible for any injury or illness 
                that may occur during the event. I also agree to follow all rules and regulations set by the event staff.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing
          </span>
        ) : (
          'Continue to Checkout'
        )}
      </Button>
      </form>
    </TooltipProvider>
  );
}