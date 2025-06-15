import React from "react";
import { useState } from 'react';
import { 
  Button, 
  Checkbox, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { useToast } from "@/hooks/use-toast";

type Registration = {
  id: number;
  eventId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  stripePaymentIntentId?: string;
  shopifyOrderId?: string; 
  createdAt: string;
};

type RegistrationApprovalProps = {
  registrations: Registration[];
  onRefresh: () => void;
  events?: { id: number; name: string }[];
};

export default function RegistrationApproval({ 
  registrations, 
  onRefresh,
  events = [] 
}: RegistrationApprovalProps) {
  const [selectedRegistrations, setSelectedRegistrations] = useState<number[]>([]);
  const [isApproving, setIsApproving] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const { toast } = useToast();

  const handleSelectRegistration = (id: number) => {
    setSelectedRegistrations(prev => 
      prev.includes(id) 
        ? prev.filter(regId => regId !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRegistrations.length === filteredRegistrations.length) {
      setSelectedRegistrations([]);
    } else {
      setSelectedRegistrations(filteredRegistrations.map(reg => reg.id));
    }
  };

  const approveRegistrations = async (verifyPayment: boolean = true) => {
    if (selectedRegistrations.length === 0) {
      toast({
        title: "No registrations selected",
        description: "Please select at least one registration to approve",
        variant: "destructive"
      });
      return;
    }

    setIsApproving(true);
    
    try {
      const response = await fetch('/api/approve-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          registrationIds: selectedRegistrations,
          verifyPayment
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Registrations Approved',
          description: `Successfully approved ${result.approved} registrations. Failed: ${result.failed}`,
          variant: result.failed > 0 ? 'destructive' : 'default'
        });
        
        // Clear selections and refresh data
        setSelectedRegistrations([]);
        onRefresh();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to approve registrations',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error approving registrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve registrations. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsApproving(false);
    }
  };

  // Filter registrations by payment status and event
  const filteredRegistrations = registrations.filter(reg => {
    // First filter by payment status
    const hasPiPaymentId = reg.shopifyOrderId && reg.shopifyOrderId.startsWith('pi_');
    const isPaid = reg.stripePaymentIntentId || hasPiPaymentId;
    
    if (paymentFilter === 'paid' && !isPaid) {
      return false;
    }
    if (paymentFilter === 'pending' && isPaid) {
      return false;
    }
    
    // Then filter by event
    if (eventFilter !== 'all' && reg.eventId.toString() !== eventFilter) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Registration Approval</h3>
        
        <div className="flex flex-wrap gap-2">
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid Only</SelectItem>
              <SelectItem value="pending">Pending Payment</SelectItem>
            </SelectContent>
          </Select>
          
          {events.length > 0 && (
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events.map(event => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Button 
            onClick={() => approveRegistrations(true)} 
            disabled={isApproving || selectedRegistrations.length === 0}
          >
            {isApproving ? 'Approving...' : 'Approve Selected'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => approveRegistrations(false)} 
            disabled={isApproving || selectedRegistrations.length === 0}
          >
            Approve Without Verification
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedRegistrations.length === filteredRegistrations.length && filteredRegistrations.length > 0} 
                  onCheckedChange={handleSelectAll}
                  disabled={filteredRegistrations.length === 0}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegistrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No registrations found
                </TableCell>
              </TableRow>
            ) : (
              filteredRegistrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedRegistrations.includes(registration.id)} 
                      onCheckedChange={() => handleSelectRegistration(registration.id)}
                    />
                  </TableCell>
                  <TableCell>{registration.firstName} {registration.lastName}</TableCell>
                  <TableCell>{registration.email}</TableCell>
                  <TableCell>
                    {registration.stripePaymentIntentId ? (
                      <span className="text-green-600 font-medium">Paid</span>
                    ) : (
                      <span className="text-amber-600 font-medium">Pending</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(registration.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRegistrations([registration.id]);
                        approveRegistrations();
                      }}
                      disabled={isApproving}
                    >
                      Approve
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}