import { useState } from "react";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { Users, Plus, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: string;
  weight: string;
}

interface Event {
  id: number;
  name: string;
  regularPrice: number;
  teamPrice: number;
  description: string;
}

// Mock event data - this would come from your events API
const events: Record<string, Event> = {
  "1": { id: 1, name: "Birmingham Slam Camp", regularPrice: 249, teamPrice: 199, description: "June 19-21, 2025 at Clay-Chalkville Middle School" },
  "2": { id: 2, name: "National Champ Camp", regularPrice: 349, teamPrice: 199, description: "June 5-7, 2025 at Roy Martin Middle School" },
  "3": { id: 3, name: "Texas Recruiting Clinic", regularPrice: 249, teamPrice: 199, description: "June 12-13, 2025 at Arlington Martin High School" }
};

export default function TeamRegistration() {
  const [, params] = useRoute("/team-register/:id");
  const eventId = params?.id || "1";
  const event = events[eventId];
  const { toast } = useToast();

  const [coachInfo, setCoachInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    teamName: "",
    schoolName: ""
  });

  const [athletes, setAthletes] = useState<Athlete[]>([
    { id: "1", firstName: "", lastName: "", email: "", age: "", weight: "" },
    { id: "2", firstName: "", lastName: "", email: "", age: "", weight: "" }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);

  const addAthlete = () => {
    const newId = (athletes.length + 1).toString();
    setAthletes([...athletes, { 
      id: newId, 
      firstName: "", 
      lastName: "", 
      email: "", 
      age: "", 
      weight: "" 
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
    if (!coachInfo.firstName || !coachInfo.lastName || !coachInfo.email || !coachInfo.phone) {
      toast({
        title: "Coach Information Required",
        description: "Please fill in all coach information fields.",
        variant: "destructive"
      });
      return false;
    }

    const validAthletes = athletes.filter(athlete => 
      athlete.firstName && athlete.lastName && athlete.email
    );

    if (validAthletes.length < 5) {
      toast({
        title: "Minimum Team Size Required",
        description: "Team registration requires at least 5 athletes. Please add more athletes or register individually.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const processTeamRegistration = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Filter out incomplete athlete entries
      const validAthletes = athletes.filter(athlete => 
        athlete.firstName && athlete.lastName && athlete.email
      );

      const teamRegistrationData = {
        eventId: parseInt(eventId),
        coachInfo,
        athletes: validAthletes,
        pricePerAthlete: event.teamPrice,
        totalAmount: validAthletes.length * event.teamPrice
      };

      // Call the team registration API
      const response = await apiRequest("POST", "/api/team-registration", teamRegistrationData);
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Team Registration Successful!",
          description: `${validAthletes.length} athletes registered at $${event.teamPrice} each.`
        });
        
        // Redirect to payment
        window.location.href = `/stripe-checkout?session=${data.sessionId}`;
      } else {
        throw new Error(data.error || "Registration failed");
      }
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const validAthleteCount = athletes.filter(athlete => 
    athlete.firstName && athlete.lastName && athlete.email
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
                <div>
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    value={coachInfo.schoolName}
                    onChange={(e) => updateCoachInfo("schoolName", e.target.value)}
                    placeholder="School name"
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          value={athlete.email}
                          onChange={(e) => updateAthlete(athlete.id, "email", e.target.value)}
                          placeholder="athlete@email.com"
                        />
                      </div>
                      <div>
                        <Label>Age</Label>
                        <Input
                          value={athlete.age}
                          onChange={(e) => updateAthlete(athlete.id, "age", e.target.value)}
                          placeholder="Age"
                        />
                      </div>
                      <div>
                        <Label>Weight (lbs)</Label>
                        <Input
                          value={athlete.weight}
                          onChange={(e) => updateAthlete(athlete.id, "weight", e.target.value)}
                          placeholder="Weight"
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