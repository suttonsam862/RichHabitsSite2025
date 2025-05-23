import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { Button, ButtonProps } from '@/components/ui/button';

interface AuthModalProps {
  triggerButton?: React.ReactNode;
  triggerButtonProps?: ButtonProps;
  defaultTab?: 'login' | 'register';
  onSuccess?: () => void;
}

export function AuthModal({
  triggerButton,
  triggerButtonProps,
  defaultTab = 'login',
  onSuccess,
}: AuthModalProps) {
  const [open, setOpen] = useState(false);
  
  // Handle successful auth action
  const handleSuccess = () => {
    setOpen(false);
    
    if (onSuccess) {
      onSuccess();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="default" {...triggerButtonProps}>
            Sign In
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Account Access
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={defaultTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="pt-4">
            <LoginForm onSuccess={handleSuccess} />
          </TabsContent>
          
          <TabsContent value="register" className="pt-4">
            <RegisterForm onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}