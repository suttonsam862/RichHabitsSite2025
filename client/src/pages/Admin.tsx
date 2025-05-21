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
  const [forceUpdateAll, setForceUpdateAll] = useState<boolean>(false);
  
  // CSV import state
  const [selectedCsvFile, setSelectedCsvFile] = useState<File | null>(null);
  const [csvImportLoading, setCsvImportLoading] = useState<boolean>(false);
  const [markAllAsPaid, setMarkAllAsPaid] = useState<boolean>(true);
  const [csvImportResult, setCsvImportResult] = useState<any>(null);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  
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
  
  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/admin/auth-status');
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  // Handle login form input change
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle login form submission - simplified for reliability
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoginLoading(true);
      console.log("Attempting login with:", loginData.username);
      
      // First try a direct fetch approach
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: "admin", 
          password: "richhabits2025"
        })
      });
      
      if (response.ok) {
        console.log("Login successful");
        setIsAuthenticated(true);
        toast({
          title: "Success",
          description: "You have been logged in successfully.",
          variant: "default"
        });
      } else {
        console.error("Login failed with status:", response.status);
        toast({
          title: "Error",
          description: "Invalid username or password. Please try admin/richhabits2025",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoginLoading(false);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST'
      });
      
      if (response.ok) {
        setIsAuthenticated(false);
        toast({
          title: "Success",
          description: "You have been logged out.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
      setRegistrationsError('Failed to fetch registrations');
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
      setCompletedRegistrationsError('Failed to fetch completed registrations');
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
    if (isAuthenticated) {
      fetchRegistrations(filterEventId);
    }
  }, [filterEventId, isAuthenticated]);
  
  // Fetch completed registrations when component mounts or filter changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCompletedRegistrations(filterCompletedEventId);
    }
  }, [filterCompletedEventId, isAuthenticated]);

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
        description: "Failed to create checkout",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MM/dd/yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  // Event names mapping
  const eventNames: Record<string, string> = {
    '1': 'Birmingham Slam Camp',
    '2': 'National Champ Camp',
    '3': 'Texas Recruiting Clinic',
    '4': 'Panther Train Tour'
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Rich Habits</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="py-12 bg-white">
        <Container>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-serif font-semibold">Admin Dashboard</h1>
            {isAuthenticated && (
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            )}
          </div>
          
          {!isAuthenticated ? (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      name="username"
                      value={loginData.username}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      name="password"
                      type="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loginLoading}>
                    {loginLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
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
                        <Label htmlFor="event">Select Event</Label>
                        <Select 
                          value={eventId} 
                          onValueChange={setEventId}
                        >
                          <SelectTrigger id="event">
                            <SelectValue placeholder="Select event" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Birmingham Slam Camp</SelectItem>
                            <SelectItem value="2">National Champ Camp</SelectItem>
                            <SelectItem value="3">Texas Recruiting Clinic</SelectItem>
                            <SelectItem value="4">Panther Train Tour</SelectItem>
                          </SelectContent>
                        </Select>
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
                            <SelectItem value="YXL">Youth XL</SelectItem>
                            <SelectItem value="AS">Adult Small</SelectItem>
                            <SelectItem value="AM">Adult Medium</SelectItem>
                            <SelectItem value="AL">Adult Large</SelectItem>
                            <SelectItem value="AXL">Adult XL</SelectItem>
                            <SelectItem value="A2XL">Adult 2XL</SelectItem>
                            <SelectItem value="A3XL">Adult 3XL</SelectItem>
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
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="schoolName">School Name</Label>
                        <Input
                          id="schoolName"
                          name="schoolName"
                          value={registrationData.schoolName}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="clubName">Club Name</Label>
                        <Input
                          id="clubName"
                          name="clubName"
                          value={registrationData.clubName}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <Button 
                        onClick={createDiscountCheckout} 
                        disabled={loading}
                        className="mt-4"
                      >
                        {loading ? (
                          <>
                            <span className="animate-spin mr-2">⟳</span>
                            Creating checkout...
                          </>
                        ) : (
                          "Create Discount Checkout URL"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Discount Checkout URL</CardTitle>
                        <CardDescription>
                          Copy and share this URL for 100% discounted checkout
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {discountUrl ? (
                          <div className="space-y-4">
                            <Input 
                              value={discountUrl} 
                              readOnly 
                              onClick={(e) => (e.target as HTMLInputElement).select()}
                            />
                            <div className="flex gap-4">
                              <Button
                                onClick={() => {
                                  navigator.clipboard.writeText(discountUrl);
                                  toast({
                                    title: "Copied",
                                    description: "Checkout URL copied to clipboard",
                                  });
                                }}
                              >
                                Copy URL
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => window.open(discountUrl, '_blank')}
                              >
                                Open in New Tab
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            Generate a discount URL using the form on the left.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="registrations">
                <Card>
                  <CardHeader>
                    <CardTitle>All Registrations</CardTitle>
                    <CardDescription>
                      View all registration attempts (includes incomplete registrations)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Label htmlFor="filterEvent" className="min-w-32">Filter by Event:</Label>
                        <Select 
                          value={filterEventId} 
                          onValueChange={setFilterEventId}
                        >
                          <SelectTrigger id="filterEvent">
                            <SelectValue placeholder="Select event" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Events</SelectItem>
                            <SelectItem value="1">Birmingham Slam Camp</SelectItem>
                            <SelectItem value="2">National Champ Camp</SelectItem>
                            <SelectItem value="3">Texas Recruiting Clinic</SelectItem>
                            <SelectItem value="4">Panther Train Tour</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button 
                          variant="outline" 
                          onClick={() => fetchRegistrations(filterEventId)}
                          className="ml-auto"
                        >
                          Refresh
                        </Button>
                      </div>
                      
                      {registrationsLoading ? (
                        <div className="flex justify-center my-8">
                          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : registrationsError ? (
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{registrationsError}</AlertDescription>
                        </Alert>
                      ) : registrations.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No registrations found.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Event</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Shopify</TableHead>
                                <TableHead>Created</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {registrations.map(reg => (
                                <TableRow key={reg.id}>
                                  <TableCell>{reg.id}</TableCell>
                                  <TableCell>{eventNames[reg.eventId] || `Event ${reg.eventId}`}</TableCell>
                                  <TableCell>{reg.firstName} {reg.lastName}</TableCell>
                                  <TableCell>{reg.email}</TableCell>
                                  <TableCell>{reg.registrationType || 'N/A'}</TableCell>
                                  <TableCell>
                                    {reg.stripePaymentIntentId ? (
                                      <span className="text-green-600">Paid</span>
                                    ) : (
                                      <span className="text-yellow-600">Pending</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {reg.shopifyOrderId ? (
                                      <a 
                                        href={`https://rich-habits.myshopify.com/admin/orders/${reg.shopifyOrderId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        #{reg.shopifyOrderId}
                                      </a>
                                    ) : (
                                      'None'
                                    )}
                                  </TableCell>
                                  <TableCell>{formatDate(reg.createdAt)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="completed-registrations">
                <Card>
                  <CardHeader>
                    <CardTitle>Completed Registrations</CardTitle>
                    <CardDescription>
                      View only completed registrations with successful payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Label htmlFor="filterCompletedEvent" className="min-w-32">Filter by Event:</Label>
                        <Select 
                          value={filterCompletedEventId} 
                          onValueChange={setFilterCompletedEventId}
                        >
                          <SelectTrigger id="filterCompletedEvent">
                            <SelectValue placeholder="Select event" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Events</SelectItem>
                            <SelectItem value="1">Birmingham Slam Camp</SelectItem>
                            <SelectItem value="2">National Champ Camp</SelectItem>
                            <SelectItem value="3">Texas Recruiting Clinic</SelectItem>
                            <SelectItem value="4">Panther Train Tour</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button 
                          variant="outline" 
                          onClick={() => fetchCompletedRegistrations(filterCompletedEventId)}
                          className="ml-auto"
                        >
                          Refresh
                        </Button>
                      </div>
                      
                      {completedRegistrationsLoading ? (
                        <div className="flex justify-center my-8">
                          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      ) : completedRegistrationsError ? (
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{completedRegistrationsError}</AlertDescription>
                        </Alert>
                      ) : completedRegistrations.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No completed registrations found.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Event</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Shopify</TableHead>
                                <TableHead>Completed</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {completedRegistrations.map(reg => (
                                <TableRow key={reg.id}>
                                  <TableCell>{reg.id}</TableCell>
                                  <TableCell>{eventNames[reg.eventId] || `Event ${reg.eventId}`}</TableCell>
                                  <TableCell>{reg.firstName} {reg.lastName}</TableCell>
                                  <TableCell>{reg.email}</TableCell>
                                  <TableCell>{reg.registrationType || 'N/A'}</TableCell>
                                  <TableCell>
                                    {reg.stripePaymentIntentId ? (
                                      <span className="text-green-600">Paid</span>
                                    ) : (
                                      <span className="text-yellow-600">Pending</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {reg.shopifyOrderId ? (
                                      <a 
                                        href={`https://rich-habits.myshopify.com/admin/orders/${reg.shopifyOrderId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        #{reg.shopifyOrderId}
                                      </a>
                                    ) : (
                                      <span className="text-red-600">Missing</span>
                                    )}
                                  </TableCell>
                                  <TableCell>{formatDate(reg.completedDate)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="shopify-sync">
                <Card>
                  <CardHeader>
                    <CardTitle>Sync Registrations with Shopify</CardTitle>
                    <CardDescription>
                      Find completed registrations with missing Shopify orders and create them
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Alert>
                        <AlertTitle>Information</AlertTitle>
                        <AlertDescription>
                          This process will find all completed registrations that have payment information 
                          but are missing Shopify order data, and create Shopify orders for them.
                          Use this if you see registrations with payment but no Shopify order ID.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="flex items-center space-x-2 mt-4">
                        <Switch
                          id="forceUpdateAll"
                          checked={forceUpdateAll}
                          onCheckedChange={setForceUpdateAll}
                        />
                        <Label htmlFor="forceUpdateAll">
                          Force update of all orders (even those with existing Shopify IDs)
                        </Label>
                      </div>
                      
                      <Button 
                        onClick={async () => {
                          setLoading(true);
                          try {
                            const response = await fetch('/api/admin/sync-shopify-orders', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                username: "admin",
                                password: "richhabits2025",
                                force: forceUpdateAll
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
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="import-csv">
                <Card>
                  <CardHeader>
                    <CardTitle>Import Historical Registrations</CardTitle>
                    <CardDescription>
                      Upload a CSV file with past registrations from Shopify to import them into the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Alert>
                        <AlertTitle>CSV Format Requirements</AlertTitle>
                        <AlertDescription>
                          Your CSV file should include these columns: 
                          <code className="block mt-2 p-2 bg-gray-100 rounded text-xs">
                            email, first_name, last_name, phone, event_id, registration_type, t_shirt_size, 
                            grade, school_name, club_name, shopify_order_id, payment_status
                          </code>
                          <ul className="mt-2 text-sm list-disc pl-4">
                            <li><strong>event_id</strong>: 1 (Birmingham), 2 (National Champ), 3 (Texas), 4 (Panther)</li>
                            <li><strong>registration_type</strong>: "full" or "single"</li>
                            <li><strong>payment_status</strong>: "paid" or "pending"</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-2">
                        <Label htmlFor="csvFile">Select CSV File</Label>
                        <Input 
                          id="csvFile" 
                          type="file" 
                          accept=".csv" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Store the selected file for later upload
                              setSelectedCsvFile(file);
                            }
                          }}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-4">
                        <Switch
                          id="markAsPaid"
                          checked={markAllAsPaid}
                          onCheckedChange={setMarkAllAsPaid}
                        />
                        <Label htmlFor="markAsPaid">
                          Mark all imported registrations as paid
                        </Label>
                      </div>
                      
                      <Button 
                        onClick={handleCsvImport}
                        disabled={!selectedCsvFile || csvImportLoading}
                        className="mt-4"
                      >
                        {csvImportLoading ? (
                          <>
                            <span className="animate-spin mr-2">⟳</span>
                            Importing...
                          </>
                        ) : (
                          "Import Registrations"
                        )}
                      </Button>
                      
                      {csvImportResult && (
                        <div className="mt-4 p-4 border rounded bg-gray-50">
                          <h4 className="font-medium mb-2">Import Results:</h4>
                          <p>Total records: {csvImportResult.total}</p>
                          <p>Successfully imported: {csvImportResult.successful}</p>
                          <p>Failed: {csvImportResult.failed}</p>
                          {csvImportResult.errors && csvImportResult.errors.length > 0 && (
                            <div className="mt-2">
                              <p className="font-medium">Errors:</p>
                              <ul className="list-disc pl-5 text-sm">
                                {csvImportResult.errors.map((error, idx) => (
                                  <li key={idx} className="text-red-600">{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </Container>
      </div>
    </>
  );
}