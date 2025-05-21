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
import { Switch } from '@/components/ui/switch';
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
  
  // All registrations state
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationsError, setRegistrationsError] = useState<string | null>(null);
  const [filterEventId, setFilterEventId] = useState<string>('all');
  
  // Completed registrations state
  const [completedRegistrations, setCompletedRegistrations] = useState<any[]>([]);
  const [completedRegistrationsLoading, setCompletedRegistrationsLoading] = useState(false);
  const [completedRegistrationsError, setCompletedRegistrationsError] = useState<string | null>(null);
  const [filterCompletedEventId, setFilterCompletedEventId] = useState<string>('all');
  
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
  
  // Function to fetch all registrations
  const fetchRegistrations = async (selectedEventId?: string) => {
    setRegistrationsLoading(true);
    setRegistrationsError(null);
    
    try {
      let url = '/api/registrations';
      if (selectedEventId && selectedEventId !== 'all') {
        url += `?eventId=${selectedEventId}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setRegistrationsError(error instanceof Error ? error.message : 'Failed to fetch registrations');
      toast({
        title: "Error",
        description: "Failed to load registrations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRegistrationsLoading(false);
    }
  };
  
  // Function to fetch completed registrations
  const fetchCompletedRegistrations = async (selectedEventId?: string) => {
    setCompletedRegistrationsLoading(true);
    setCompletedRegistrationsError(null);
    
    try {
      let url = '/api/completed-registrations';
      if (selectedEventId && selectedEventId !== 'all') {
        url += `?eventId=${selectedEventId}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCompletedRegistrations(data);
    } catch (error) {
      console.error('Error fetching completed registrations:', error);
      setCompletedRegistrationsError(error instanceof Error ? error.message : 'Failed to fetch completed registrations');
      toast({
        title: "Error",
        description: "Failed to load completed registrations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCompletedRegistrationsLoading(false);
    }
  };
  
  // Fetch registrations when component mounts or filter changes
  useEffect(() => {
    fetchRegistrations(filterEventId);
  }, [filterEventId]);
  
  // Fetch completed registrations when component mounts or filter changes
  useEffect(() => {
    fetchCompletedRegistrations(filterCompletedEventId);
  }, [filterCompletedEventId]);

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
              <TabsTrigger value="registrations">All Registrations</TabsTrigger>
              <TabsTrigger value="completed-registrations">Completed Registrations</TabsTrigger>
              <TabsTrigger value="shopify-sync">Shopify Sync</TabsTrigger>
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
                  <CardTitle>All Event Registrations</CardTitle>
                  <CardDescription>
                    View all registration attempts (both pending and completed)
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Label htmlFor="filterEvent">Filter by Event:</Label>
                    <Select 
                      value={filterEventId} 
                      onValueChange={setFilterEventId}
                    >
                      <SelectTrigger id="filterEvent" className="w-[250px]">
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="1">Birmingham Slam Camp</SelectItem>
                        <SelectItem value="2">National Champ Camp</SelectItem>
                        <SelectItem value="3">Texas Recruiting Clinic</SelectItem>
                        <SelectItem value="4">Panther Train Tour</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button variant="outline" onClick={() => fetchRegistrations(filterEventId)} className="ml-auto">
                      Refresh Data
                    </Button>
                  </div>
                  
                  {registrationsError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{registrationsError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {registrationsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : registrations.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Registration Type</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {registrations.map(reg => (
                            <TableRow key={reg.id}>
                              <TableCell>{reg.id}</TableCell>
                              <TableCell>
                                {reg.eventId === 1 && "Birmingham Slam Camp"}
                                {reg.eventId === 2 && "National Champ Camp"}
                                {reg.eventId === 3 && "Texas Recruiting Clinic"}
                                {reg.eventId === 4 && "Panther Train Tour"}
                              </TableCell>
                              <TableCell>{reg.firstName} {reg.lastName}</TableCell>
                              <TableCell>{reg.email}</TableCell>
                              <TableCell>
                                {reg.registrationType === "full" 
                                  ? "Full Camp/Clinic" 
                                  : "Single Day"}
                              </TableCell>
                              <TableCell>
                                {reg.createdAt ? format(new Date(reg.createdAt), 'MMM d, yyyy') : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No registrations found.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="completed-registrations">
              <Card>
                <CardHeader>
                  <CardTitle>Completed Registrations</CardTitle>
                  <CardDescription>
                    View only successfully paid and completed registrations
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Label htmlFor="filterCompletedEvent">Filter by Event:</Label>
                    <Select 
                      value={filterCompletedEventId} 
                      onValueChange={setFilterCompletedEventId}
                    >
                      <SelectTrigger id="filterCompletedEvent" className="w-[250px]">
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="1">Birmingham Slam Camp</SelectItem>
                        <SelectItem value="2">National Champ Camp</SelectItem>
                        <SelectItem value="3">Texas Recruiting Clinic</SelectItem>
                        <SelectItem value="4">Panther Train Tour</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button variant="outline" onClick={() => fetchCompletedRegistrations(filterCompletedEventId)} className="ml-auto">
                      Refresh Data
                    </Button>
                  </div>
                  
                  {completedRegistrationsError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{completedRegistrationsError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {completedRegistrationsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : completedRegistrations.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Original Reg. ID</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Payment ID</TableHead>
                            <TableHead>Completed Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {completedRegistrations.map(reg => (
                            <TableRow key={reg.id}>
                              <TableCell>{reg.id}</TableCell>
                              <TableCell>{reg.original_registration_id}</TableCell>
                              <TableCell>
                                {reg.event_id === 1 && "Birmingham Slam Camp"}
                                {reg.event_id === 2 && "National Champ Camp"}
                                {reg.event_id === 3 && "Texas Recruiting Clinic"}
                                {reg.event_id === 4 && "Panther Train Tour"}
                              </TableCell>
                              <TableCell>{reg.first_name} {reg.last_name}</TableCell>
                              <TableCell>{reg.email}</TableCell>
                              <TableCell>
                                {reg.registration_type === "full" 
                                  ? "Full Camp/Clinic" 
                                  : "Single Day"}
                              </TableCell>
                              <TableCell>
                                <span className="text-xs font-mono">
                                  {reg.stripe_payment_intent_id 
                                    ? `${reg.stripe_payment_intent_id.slice(0, 8)}...` 
                                    : 'N/A'}
                                </span>
                              </TableCell>
                              <TableCell>
                                {reg.completed_date ? format(new Date(reg.completed_date), 'MMM d, yyyy') : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No completed registrations found.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="shopify-sync">
              <Card>
                <CardHeader>
                  <CardTitle>Shopify Order Synchronization</CardTitle>
                  <CardDescription>
                    Fix missing data in Shopify by re-creating orders for completed registrations
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <p className="text-yellow-700">
                      This tool will re-create Shopify orders for all completed registrations. Use this if you have orders in Shopify that are missing form field data.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Switch
                      id="force-update"
                      checked={testMode}
                      onCheckedChange={setTestMode}
                    />
                    <Label htmlFor="force-update">Force update of all orders (including existing ones)</Label>
                  </div>
                  
                  <Button 
                    onClick={async () => {
                      try {
                        setLoading(true);
                        toast({
                          title: "Syncing registrations with Shopify",
                          description: "This may take a moment...",
                        });
                        
                        const response = await fetch('/api/admin/sync-shopify-orders', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            force: testMode
                          })
                        });
                        
                        if (!response.ok) {
                          throw new Error(`Error ${response.status}: ${response.statusText}`);
                        }
                        
                        const result = await response.json();
                        
                        toast({
                          title: "Sync Completed",
                          description: `Processed ${result.total} registrations. 
                                        Success: ${result.successful}, 
                                        Failed: ${result.failed}`,
                          variant: "default"
                        });
                        
                        // Refresh registration data
                        await fetchCompletedRegistrations(filterCompletedEventId);
                      } catch (error) {
                        console.error('Error syncing with Shopify:', error);
                        toast({
                          title: "Error",
                          description: "Failed to sync registrations with Shopify. See console for details.",
                          variant: "destructive"
                        });
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="mt-4"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2">⟳</span>
                        Syncing...
                      </>
                    ) : (
                      "Sync Registrations with Shopify"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Container>
      </div>
    </>
  );
}