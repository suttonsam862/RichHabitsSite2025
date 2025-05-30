import { useState } from "react";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { Users, Plus, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  age: string;
  tShirtSize: string;
  contactName: string;
  contactPhone: string;
  email: string;
}

interface Event {
  id: number;
  name: string;
  regularPrice: number;
  teamPrice: number;
  description: string;
}

// Event data matching backend pricing
const events: Record<string, Event> = {
  "1": { id: 1, name: "Birmingham Slam Camp", regularPrice: 249, teamPrice: 199, description: "June 19-21, 2025 at Clay-Chalkville Middle School" },
  "2": { id: 2, name: "National Champ Camp", regularPrice: 299, teamPrice: 199, description: "June 5-7, 2025 at Roy Martin Middle School" },
  "3": { id: 3, name: "Texas Recruiting Clinic", regularPrice: 249, teamPrice: 199, description: "June 12-13, 2025 at Arlington Martin High School" },
  "4": { id: 4, name: "Panther Train Tour", regularPrice: 200, teamPrice: 199, description: "Multi-day wrestling tour experience" }
};

export default function TeamRegistration() {
  // Handle both URL patterns for team registration
  const [, paramsWithId] = useRoute("/team-register/:id");
  
  // Get event ID from URL params or query string
  const eventIdFromPath = paramsWithId?.id;
  const urlParams = new URLSearchParams(window.location.search);
  const eventIdFromQuery = urlParams.get('event');
  
  const eventId = eventIdFromPath || eventIdFromQuery || "1";
  const event = events[eventId];
  const { toast } = useToast();

  const [coachInfo, setCoachInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    teamName: ""
  });

  const [athletes, setAthletes] = useState<Athlete[]>([
    { id: "1", firstName: "", lastName: "", age: "", tShirtSize: "", contactName: "", contactPhone: "", email: "" },
    { id: "2", firstName: "", lastName: "", age: "", tShirtSize: "", contactName: "", contactPhone: "", email: "" }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);

  const addAthlete = () => {
    const newId = (athletes.length + 1).toString();
    setAthletes([...athletes, { 
      id: newId, 
      firstName: "", 
      lastName: "", 
      age: "", 
      tShirtSize: "", 
      contactName: "", 
      contactPhone: "", 
      email: "" 
    }]);
  };

  const removeAthlete = (id: string) => {
    if (athletes.length > 1) {
      setAthletes(athletes.filter(athlete => athlete.id !== id));
    }
  };

  const updateAthlete = (id: string, field: keyof Athlete, value: string) => {
    setAthletes(athletes.map(athlete => 
      athlete.id === id ? { ...athlete, [field]: value } : athlete
    ));
  };

  const updateCoachInfo = (field: keyof typeof coachInfo, value: string) => {
    setCoachInfo({ ...coachInfo, [field]: value });
  };

  const validateForm = () => {
    // Check coach information with detailed feedback
    const missingCoachFields = [];
    if (!coachInfo.firstName || !coachInfo.firstName.trim()) missingCoachFields.push("First Name");
    if (!coachInfo.lastName || !coachInfo.lastName.trim()) missingCoachFields.push("Last Name");
    if (!coachInfo.email || !coachInfo.email.trim()) missingCoachFields.push("Email");
    if (!coachInfo.phone || !coachInfo.phone.trim()) missingCoachFields.push("Phone");

    if (missingCoachFields.length > 0) {
      toast({
        title: "Coach Information Required",
        description: `Please fill in: ${missingCoachFields.join(", ")}`,
        variant: "destructive"
      });
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(coachInfo.email.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address for the coach.",
        variant: "destructive"
      });
      return false;
    }

    // Check athletes with detailed feedback
    const validAthletes = athletes.filter(athlete => 
      athlete.firstName && athlete.firstName.trim() &&
      athlete.lastName && athlete.lastName.trim() &&
      athlete.age && athlete.age.trim() &&
      athlete.tShirtSize && athlete.tShirtSize.trim() &&
      athlete.contactName && athlete.contactName.trim() &&
      athlete.contactPhone && athlete.contactPhone.trim() &&
      athlete.email && athlete.email.trim()
    );

    const incompleteAthletes = athletes.length - validAthletes.length;
    
    if (validAthletes.length < 5) {
      toast({
        title: "Minimum Team Size Required",
        description: `You have ${validAthletes.length} complete athletes. Need at least 5. ${incompleteAthletes > 0 ? `${incompleteAthletes} athletes have missing information.` : "Please add more athletes."}`,
        variant: "destructive"
      });
      return false;
    }

    // Validate athlete emails
    for (let i = 0; i < validAthletes.length; i++) {
      const athlete = validAthletes[i];
      if (!emailRegex.test(athlete.email.trim())) {
        toast({
          title: "Invalid Email",
          description: `Please enter a valid email address for ${athlete.firstName} ${athlete.lastName}.`,
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const processTeamRegistration = async () => {
    console.log('🔄 Team registration button clicked');
    console.log('Coach info:', coachInfo);
    console.log('Athletes:', athletes);
    
    // Prevent form submission if already processing
    if (isProcessing) {
      console.log('⏳ Already processing, ignoring duplicate submission');
      return;
    }
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('✅ Form validation passed, processing...');
    setIsProcessing(true);

    try {
      // Filter out incomplete athlete entries with detailed logging
      const validAthletes = athletes.filter(athlete => {
        const isValid = athlete.firstName && athlete.firstName.trim() &&
                       athlete.lastName && athlete.lastName.trim() &&
                       athlete.age && athlete.age.trim() &&
                       athlete.tShirtSize && athlete.tShirtSize.trim() &&
                       athlete.contactName && athlete.contactName.trim() &&
                       athlete.contactPhone && athlete.contactPhone.trim() &&
                       athlete.email && athlete.email.trim();
        
        if (!isValid) {
          console.log('Invalid athlete:', athlete);
        }
        return isValid;
      });

      console.log(`Valid athletes: ${validAthletes.length}/${athletes.length}`);

      if (validAthletes.length < 5) {
        toast({
          title: "Minimum Team Size Required",
          description: `Only ${validAthletes.length} athletes have complete information. Please ensure at least 5 athletes have all required fields filled.`,
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      // Map athlete data to match backend expectations
      const mappedAthletes = validAthletes.map(athlete => ({
        firstName: athlete.firstName.trim(),
        lastName: athlete.lastName.trim(),
        age: athlete.age.trim(),
        tShirtSize: athlete.tShirtSize.trim(),
        contactName: athlete.contactName.trim(),
        contactPhone: athlete.contactPhone.trim(),
        email: athlete.email.trim()
      }));

      // Check if there's a discount applied
      const discountData = sessionStorage.getItem('applied_discount');
      const appliedDiscount = discountData ? JSON.parse(discountData) : null;
      
      // Calculate final amount with discount
      const originalTotal = validAthletes.length * event.teamPrice;
      const finalTotal = appliedDiscount?.finalPrice || originalTotal;

      const teamRegistrationData = {
        eventId: parseInt(eventId),
        coachInfo: {
          ...coachInfo,
          firstName: coachInfo.firstName.trim(),
          lastName: coachInfo.lastName.trim(),
          email: coachInfo.email.trim(),
          phone: coachInfo.phone.trim()
        },
        athletes: mappedAthletes,
        pricePerAthlete: event.teamPrice,
        totalAmount: originalTotal,
        discountedAmount: finalTotal,
        discountCode: appliedDiscount?.code || null
      };

      // Call the team registration API - same format as individual registration
      console.log("🚀 Sending team registration for payment...");
      
      const response = await fetch("/api/team-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teamRegistrationData)
      });

      console.log("📡 Response received:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
        console.error("❌ Registration failed:", errorData);
        
        // Show specific error feedback without redirecting
        toast({
          title: "Registration Error",
          description: errorData.userFriendlyMessage || errorData.error || "Please check all fields and try again.",
          variant: "destructive"
        });
        
        // Log detailed error information for debugging
        console.error("Backend validation failed:", {
          status: response.status,
          errorData,
          coachInfo,
          athleteCount: validAthletes.length
        });
        
        setIsProcessing(false);
        return; // Don't throw error, just stop processing
      }

      const data = await response.json();
      console.log("✅ Team registration response:", data);
      console.log("💳 Client secret:", data.clientSecret ? "✓ Present" : "✗ Missing");

      if (data.clientSecret) {
        toast({
          title: "Team Registration Ready!",
          description: `${validAthletes.length} athletes ready for payment at $${event.teamPrice} each.`
        });
        
        // Store team data in sessionStorage for payment processing (same as individual)
        sessionStorage.setItem('team_registration_data', JSON.stringify({
          eventId: parseInt(eventId),
          coachInfo: teamRegistrationData.coachInfo,
          athletes: mappedAthletes,
          totalAmount: data.amount,
          athleteCount: validAthletes.length
        }));
        
        console.log("🚀 Redirecting to payment page...");
        // Redirect to same StripeCheckout page that works for individual registrations
        window.location.href = `/stripe-checkout?eventId=${eventId}&eventName=${encodeURIComponent(event.name)}&option=team&clientSecret=${data.clientSecret}&amount=${data.amount}`;
      } else {
        console.error("❌ No clientSecret in response:", data);
        toast({
          title: "Payment Setup Error",
          description: "Unable to set up payment. Please try again.",
          variant: "destructive"
        });
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error("❌ Unexpected error:", error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please check your information and try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const validAthleteCount = athletes.filter(athlete => 
    athlete.firstName && athlete.lastName && athlete.age && athlete.tShirtSize && 
    athlete.contactName && athlete.contactPhone && athlete.email
  ).length;

  const totalCost = validAthleteCount * event.teamPrice;
  const totalSavings = validAthleteCount * (event.regularPrice - event.teamPrice);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Users size={32} className="text-orange-500 mr-3" />
              <h1 className="text-3xl md:text-4xl font-bold">Team Registration</h1>
            </div>
            <h2 className="text-xl text-gray-600 mb-2">{event.name}</h2>
            <p className="text-gray-500">{event.description}</p>
            
            {/* Savings Banner */}
            <div className="bg-orange-500 text-white py-4 px-6 rounded-lg inline-block mt-4">
              <div className="text-center">
                <span className="text-lg font-bold block">
                  Team Price: ${event.teamPrice} per athlete (Save ${event.regularPrice - event.teamPrice} each!)
                </span>
                <span className="text-sm block mt-1">
                  Minimum 5 athletes required • Already heavily discounted!
                </span>
              </div>
            </div>
          </div>

          {/* Coach Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User size={20} className="mr-2" />
                Coach Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="coachFirstName">First Name *</Label>
                  <Input
                    id="coachFirstName"
                    value={coachInfo.firstName}
                    onChange={(e) => updateCoachInfo("firstName", e.target.value)}
                    placeholder="Coach's first name"
                  />
                </div>
                <div>
                  <Label htmlFor="coachLastName">Last Name *</Label>
                  <Input
                    id="coachLastName"
                    value={coachInfo.lastName}
                    onChange={(e) => updateCoachInfo("lastName", e.target.value)}
                    placeholder="Coach's last name"
                  />
                </div>
                <div>
                  <Label htmlFor="coachEmail">Email *</Label>
                  <Input
                    id="coachEmail"
                    type="email"
                    value={coachInfo.email}
                    onChange={(e) => updateCoachInfo("email", e.target.value)}
                    placeholder="coach@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="coachPhone">Phone *</Label>
                  <Input
                    id="coachPhone"
                    value={coachInfo.phone}
                    onChange={(e) => updateCoachInfo("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    value={coachInfo.teamName}
                    onChange={(e) => updateCoachInfo("teamName", e.target.value)}
                    placeholder="Team or club name"
                  />
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Athletes Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Users size={20} className="mr-2" />
                  Athletes ({validAthleteCount} registered)
                </span>
                <Button onClick={addAthlete} variant="outline" size="sm">
                  <Plus size={16} className="mr-1" />
                  Add Athlete
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {athletes.map((athlete, index) => (
                  <div key={athlete.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Athlete {index + 1}</h4>
                      {athletes.length > 1 && (
                        <Button
                          onClick={() => removeAthlete(athlete.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>First Name *</Label>
                        <Input
                          value={athlete.firstName}
                          onChange={(e) => updateAthlete(athlete.id, "firstName", e.target.value)}
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <Label>Last Name *</Label>
                        <Input
                          value={athlete.lastName}
                          onChange={(e) => updateAthlete(athlete.id, "lastName", e.target.value)}
                          placeholder="Last name"
                        />
                      </div>
                      <div>
                        <Label>Age *</Label>
                        <Input
                          value={athlete.age}
                          onChange={(e) => updateAthlete(athlete.id, "age", e.target.value)}
                          placeholder="Age"
                          type="number"
                        />
                      </div>
                      <div>
                        <Label>T-Shirt Size *</Label>
                        <select
                          value={athlete.tShirtSize}
                          onChange={(e) => updateAthlete(athlete.id, "tShirtSize", e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select Size</option>
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </select>
                      </div>
                      <div>
                        <Label>Contact Name *</Label>
                        <Input
                          value={athlete.contactName}
                          onChange={(e) => updateAthlete(athlete.id, "contactName", e.target.value)}
                          placeholder="Parent/Guardian Name"
                        />
                      </div>
                      <div>
                        <Label>Contact Phone *</Label>
                        <Input
                          value={athlete.contactPhone}
                          onChange={(e) => updateAthlete(athlete.id, "contactPhone", e.target.value)}
                          placeholder="(555) 123-4567"
                          type="tel"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          value={athlete.email}
                          onChange={(e) => updateAthlete(athlete.id, "email", e.target.value)}
                          placeholder="athlete@email.com"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary and Payment */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-bold mb-2">Registration Summary</h3>
                  <p className="text-gray-600">
                    {validAthleteCount} athletes × ${event.teamPrice} = ${totalCost}
                  </p>
                  {totalSavings > 0 && (
                    <p className="text-green-600 font-semibold">
                      Total Savings: ${totalSavings}
                    </p>
                  )}
                </div>
                <Button
                  onClick={processTeamRegistration}
                  disabled={isProcessing || validAthleteCount === 0}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
                >
                  {isProcessing ? "Processing..." : `Register Team - $${totalCost}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}