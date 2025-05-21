import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'wouter';

export default function AdminLogin() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  
  // Handle login form input change
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoginLoading(true);
      
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "You have been logged in successfully.",
          variant: "default"
        });
        // Redirect to admin page after successful login
        navigate('/admin');
      } else {
        toast({
          title: "Error",
          description: "Invalid username or password.",
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

  return (
    <>
      <Helmet>
        <title>Admin Login | Rich Habits</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="py-12 bg-white">
        <Container>
          <h1 className="text-4xl font-serif font-semibold mb-8 text-center">Admin Login</h1>
          
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
        </Container>
      </div>
    </>
  );
}