import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CollegeCoachRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  fullName: string;
  title: string;
  collegeName: string;
  email: string;
  cellPhone: string;
  schoolPhone: string;
  schoolWebsite: string;
  divisionLevel: string;
  conference: string;
  numberOfAthletes: number | '';
  areasOfInterest: string[];
  daysAttending: string[];
  notes: string;
  schoolLogoFile: File | null;
}

const initialFormData: FormData = {
  fullName: '',
  title: '',
  collegeName: '',
  email: '',
  cellPhone: '',
  schoolPhone: '',
  schoolWebsite: '',
  divisionLevel: '',
  conference: '',
  numberOfAthletes: '',
  areasOfInterest: [],
  daysAttending: [],
  notes: '',
  schoolLogoFile: null
};

const divisionOptions = [
  { value: 'D1', label: 'Division I (D1)' },
  { value: 'D2', label: 'Division II (D2)' },
  { value: 'D3', label: 'Division III (D3)' },
  { value: 'NAIA', label: 'NAIA' },
  { value: 'JUCO', label: 'Junior College (JUCO)' },
  { value: 'Other', label: 'Other' }
];

const weightClassOptions = [
  'Lightweight (125-141 lbs)',
  'Middleweight (149-165 lbs)', 
  'Heavyweight (174+ lbs)',
  'Open to All Weight Classes'
];

const campDays = [
  { value: 'June 5', label: 'June 5, 2025 - Day 1' },
  { value: 'June 6', label: 'June 6, 2025 - Day 2' },
  { value: 'June 7', label: 'June 7, 2025 - Day 3' }
];

export function CollegeCoachRegistrationForm({ isOpen, onClose }: CollegeCoachRegistrationFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayChange = (field: 'areasOfInterest' | 'daysAttending', value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (file: File | null) => {
    setFormData(prev => ({ ...prev, schoolLogoFile: file }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.title.trim()) newErrors.title = 'Title/Position is required';
    if (!formData.collegeName.trim()) newErrors.collegeName = 'College/University name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.cellPhone.trim()) newErrors.cellPhone = 'Cell phone is required';
    if (!formData.divisionLevel) newErrors.divisionLevel = 'Division level is required';
    if (!formData.conference.trim()) newErrors.conference = 'Conference is required';
    if (formData.daysAttending.length === 0) newErrors.daysAttending = 'At least one day must be selected';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Form Validation Error",
        description: "Please correct the highlighted fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data for submission
      const submitData = {
        ...formData,
        numberOfAthletes: formData.numberOfAthletes || null,
        eventId: 2 // National Champ Camp
      };

      const response = await fetch('/api/clinician-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit registration');
      }

      const result = await response.json();

      toast({
        title: "Registration Submitted Successfully",
        description: "Thank you for your interest! We'll review your application and get back to you soon.",
        variant: "default"
      });

      // Reset form and close modal
      setFormData(initialFormData);
      onClose();

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly if the problem persists.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-t-lg">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">College Coach Registration</CardTitle>
                <CardDescription className="text-blue-100">
                  Register to scout talented wrestlers at our National Champ Camp Recruiting Clinic
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Coach Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Coach Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={errors.fullName ? 'border-red-500' : ''}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="title">Title/Position *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={errors.title ? 'border-red-500' : ''}
                      placeholder="e.g., Head Coach, Assistant Coach"
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <Label htmlFor="collegeName">College/University Name *</Label>
                    <Input
                      id="collegeName"
                      value={formData.collegeName}
                      onChange={(e) => handleInputChange('collegeName', e.target.value)}
                      className={errors.collegeName ? 'border-red-500' : ''}
                      placeholder="Enter your school name"
                    />
                    {errors.collegeName && <p className="text-red-500 text-sm mt-1">{errors.collegeName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                      placeholder="coach@university.edu"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="cellPhone">Cell Phone *</Label>
                    <Input
                      id="cellPhone"
                      value={formData.cellPhone}
                      onChange={(e) => handleInputChange('cellPhone', e.target.value)}
                      className={errors.cellPhone ? 'border-red-500' : ''}
                      placeholder="(555) 123-4567"
                    />
                    {errors.cellPhone && <p className="text-red-500 text-sm mt-1">{errors.cellPhone}</p>}
                  </div>

                  <div>
                    <Label htmlFor="schoolPhone">School Phone (Optional)</Label>
                    <Input
                      id="schoolPhone"
                      value={formData.schoolPhone}
                      onChange={(e) => handleInputChange('schoolPhone', e.target.value)}
                      placeholder="(555) 987-6543"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="schoolWebsite">School Website (Optional)</Label>
                    <Input
                      id="schoolWebsite"
                      value={formData.schoolWebsite}
                      onChange={(e) => handleInputChange('schoolWebsite', e.target.value)}
                      placeholder="https://athletics.university.edu"
                    />
                  </div>
                </div>
              </div>

              {/* Program Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Program Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="divisionLevel">Division Level *</Label>
                    <Select value={formData.divisionLevel} onValueChange={(value) => handleInputChange('divisionLevel', value)}>
                      <SelectTrigger className={errors.divisionLevel ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select division level" />
                      </SelectTrigger>
                      <SelectContent>
                        {divisionOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.divisionLevel && <p className="text-red-500 text-sm mt-1">{errors.divisionLevel}</p>}
                  </div>

                  <div>
                    <Label htmlFor="conference">Conference *</Label>
                    <Input
                      id="conference"
                      value={formData.conference}
                      onChange={(e) => handleInputChange('conference', e.target.value)}
                      className={errors.conference ? 'border-red-500' : ''}
                      placeholder="e.g., Big Ten, ACC, SEC"
                    />
                    {errors.conference && <p className="text-red-500 text-sm mt-1">{errors.conference}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="numberOfAthletes">Number of Athletes Looking to Scout (Optional)</Label>
                    <Input
                      id="numberOfAthletes"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.numberOfAthletes}
                      onChange={(e) => handleInputChange('numberOfAthletes', parseInt(e.target.value) || '')}
                      placeholder="Enter number of athletes"
                    />
                  </div>
                </div>

                {/* Areas of Interest */}
                <div>
                  <Label>Areas of Interest (Optional)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {weightClassOptions.map(option => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={option}
                          checked={formData.areasOfInterest.includes(option)}
                          onCheckedChange={(checked) => 
                            handleArrayChange('areasOfInterest', option, checked as boolean)
                          }
                        />
                        <Label htmlFor={option} className="text-sm cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Event Attendance */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Event Attendance</h3>
                
                <div>
                  <Label>Days Attending *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                    {campDays.map(day => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={day.value}
                          checked={formData.daysAttending.includes(day.value)}
                          onCheckedChange={(checked) => 
                            handleArrayChange('daysAttending', day.value, checked as boolean)
                          }
                        />
                        <Label htmlFor={day.value} className="text-sm cursor-pointer">
                          {day.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.daysAttending && <p className="text-red-500 text-sm mt-1">{errors.daysAttending}</p>}
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
                
                <div>
                  <Label htmlFor="notes">Notes or Comments (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional information, specific requirements, or questions..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="schoolLogo">School Logo (Optional)</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <input
                      type="file"
                      id="schoolLogo"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('schoolLogo')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Logo
                    </Button>
                    {formData.schoolLogoFile && (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        {formData.schoolLogoFile.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted formats: JPG, PNG, GIF. Max size: 5MB
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-900 hover:bg-blue-800"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}