import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export default function AdminPage() {
  const { toast } = useToast();
  const [eventId, setEventId] = useState<string>('1'); // Default to Birmingham Slam Camp
  const [testMode, setTestMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [registrationType, setRegistrationType] = useState<'full' | 'single'>('full');
  const [discountUrl, setDiscountUrl] = useState<string>('');
  const [registrationData, setRegistrationData] = useState({
    firstName: '',
    lastName: '',
    contactName: '',
    email: '',
    phone: '',
    tShirtSize: 'AM',
    grade: '',
    schoolName: '',
    clubName: '',
    medicalReleaseAccepted: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setRegistrationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createDiscountCheckout = async () => {
    setLoading(true);
    try {
      // Use either test endpoint or real registration endpoint
      const endpoint = testMode 
        ? '/api/test-shopify-checkout?applyDiscount=true' 
        : `/api/events/${eventId}/register`;
      
      // Prepare data for API request
      const payload = {
        ...registrationData,
        registrationType,
        option: registrationType,
        applyDiscount: true // Always apply discount from admin page
      };
      
      // Make API request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract checkout URL
      const checkoutUrl = testMode 
        ? data.checkout?.webUrl 
        : data.checkoutUrl;
      
      if (checkoutUrl) {
        setDiscountUrl(checkoutUrl);
        toast({
          title: "Success",
          description: "Discount checkout URL generated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "No checkout URL was returned from the server",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating discount checkout:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create checkout",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Rich Habits</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="py-12 bg-white">
        <Container>
          <h1 className="text-4xl font-serif font-semibold mb-8">Admin Dashboard</h1>
          
          <Tabs defaultValue="discount">
            <TabsList className="mb-8">
              <TabsTrigger value="discount">Discount Management</TabsTrigger>
              <TabsTrigger value="registrations">Registrations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="discount">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Universal Discount Checkout</CardTitle>
                    <CardDescription>
                      Create a checkout URL with the universal 100% discount code applied
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="testMode" 
                        checked={testMode} 
                        onCheckedChange={(checked) => setTestMode(checked as boolean)} 
                      />
                      <Label htmlFor="testMode">Test Mode (No database record created)</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="registrationType">Registration Type</Label>
                      <Select 
                        value={registrationType} 
                        onValueChange={(value) => setRegistrationType(value as 'full' | 'single')}
                      >
                        <SelectTrigger id="registrationType">
                          <SelectValue placeholder="Select registration type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Camp ($249)</SelectItem>
                          <SelectItem value="single">Single Day ($149)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Camper First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={registrationData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Camper Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={registrationData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name</Label>
                      <Input
                        id="contactName"
                        name="contactName"
                        value={registrationData.contactName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={registrationData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={registrationData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tShirtSize">T-Shirt Size</Label>
                      <Select 
                        value={registrationData.tShirtSize} 
                        onValueChange={(value) => handleSelectChange('tShirtSize', value)}
                      >
                        <SelectTrigger id="tShirtSize">
                          <SelectValue placeholder="Select t-shirt size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YS">Youth Small</SelectItem>
                          <SelectItem value="YM">Youth Medium</SelectItem>
                          <SelectItem value="YL">Youth Large</SelectItem>
                          <SelectItem value="AS">Adult Small</SelectItem>
                          <SelectItem value="AM">Adult Medium</SelectItem>
                          <SelectItem value="AL">Adult Large</SelectItem>
                          <SelectItem value="AXL">Adult XL</SelectItem>
                          <SelectItem value="A2XL">Adult 2XL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade</Label>
                      <Input
                        id="grade"
                        name="grade"
                        value={registrationData.grade}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">School Name</Label>
                      <Input
                        id="schoolName"
                        name="schoolName"
                        value={registrationData.schoolName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="clubName">Club Name (Optional)</Label>
                      <Input
                        id="clubName"
                        name="clubName"
                        value={registrationData.clubName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      onClick={createDiscountCheckout} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Creating...' : 'Create Discount Checkout'}
                    </Button>
                  </CardFooter>
                </Card>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Generated Discount URL</CardTitle>
                      <CardDescription>
                        Use this URL to provide free access to the Birmingham Slam Camp
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      {discountUrl ? (
                        <div className="space-y-4">
                          <div className="p-3 bg-gray-100 rounded-md break-all">
                            <code className="text-sm">{discountUrl}</code>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => {
                                navigator.clipboard.writeText(discountUrl);
                                toast({
                                  title: "Copied",
                                  description: "Discount URL copied to clipboard",
                                });
                              }}
                              variant="outline"
                            >
                              Copy to Clipboard
                            </Button>
                            <Button
                              onClick={() => window.open(discountUrl, '_blank')}
                              variant="secondary"
                            >
                              Test URL
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 italic">
                          No discount URL generated yet. Fill out the form and click "Create Discount Checkout".
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Alert>
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      The universal discount code provides 100% off. Be careful who you share this URL with.
                      For security, each URL is unique and can only be used once.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="registrations">
              <Card>
                <CardHeader>
                  <CardTitle>Event Registrations</CardTitle>
                  <CardDescription>
                    View and manage Birmingham Slam Camp registrations
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-500 italic">
                    Registration management functionality coming soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Container>
      </div>
    </>
  );
}