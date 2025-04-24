import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Import event images 
import event1Image from "../assets/events/event1.png";
import event2Image from "../assets/events/event2.png";
import event3Image from "../assets/events/event3.png";

// Type for events with static data (will be replaced with API data later)
const events = [
  {
    id: 1,
    title: "Elite Point Guard Clinic",
    category: "Basketball",
    categoryClass: "bg-[hsl(var(--accent)_/_0.1)] text-[hsl(var(--accent))]",
    date: "August 15, 2023",
    time: "9:00 AM - 2:00 PM",
    location: "Riverfront Sports Complex",
    description: "Intensive training for high school point guards focusing on ball handling, vision, and leadership. Led by former professional players and collegiate coaches.",
    fullDescription: "This intensive one-day clinic focuses exclusively on developing elite point guard skills for serious high school basketball players. Our coaching staff includes former professional players and current collegiate coaches who specialize in guard development.\n\nParticipants will work through a series of drills and scenarios designed to improve ball handling under pressure, court vision, leadership communication, pick and roll decision making, and defensive techniques specific to the point guard position.\n\nThe clinic maintains a 6:1 player-to-coach ratio to ensure personalized feedback. Players will receive video analysis of their form and a personalized development plan to continue their improvement after the clinic.",
    price: "$89.00",
    image: event1Image,
    gallery: [
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1577471489310-7031584568dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
    ],
    coaches: [
      {
        name: "Marcus Johnson",
        title: "Former NBA Point Guard",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
      },
      {
        name: "Sarah Williams",
        title: "Division I Assistant Coach",
        image: "https://images.unsplash.com/photo-1545912452-8aea7e25a3d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
      }
    ],
    schedule: [
      { time: "8:30 AM - 9:00 AM", activity: "Check-in and warm-up" },
      { time: "9:00 AM - 10:30 AM", activity: "Ball handling and dribbling drills" },
      { time: "10:30 AM - 12:00 PM", activity: "Passing and court vision development" },
      { time: "12:00 PM - 12:45 PM", activity: "Lunch break (provided)" },
      { time: "12:45 PM - 2:00 PM", activity: "Game situations and decision making" }
    ]
  },
  {
    id: 2,
    title: "Speed & Agility Camp",
    category: "Football",
    categoryClass: "bg-[hsl(var(--accent2)_/_0.1)] text-[hsl(var(--accent2))]",
    date: "September 3, 2023",
    time: "10:00 AM - 3:00 PM",
    location: "Metro Athletic Fields",
    description: "Professional training methods to improve acceleration, lateral movement, and game speed. This camp is designed for football players looking to enhance their athletic performance.",
    fullDescription: "Our Speed & Agility Camp brings professional-level training methods to serious football players looking to gain a competitive edge. Using science-based approaches derived from Olympic and professional sports training, participants will learn techniques to dramatically improve their first-step explosiveness, directional changes, and overall game speed.\n\nThe camp covers acceleration mechanics, deceleration control, footwork precision, and sport-specific movement patterns. Athletes will undergo video analysis to identify their movement inefficiencies, followed by customized drills to address their specific development needs.\n\nThis camp is led by certified strength and conditioning specialists with experience training collegiate and professional football players. The techniques taught are applicable to all positions and will translate directly to improved on-field performance.",
    price: "$125.00",
    image: event2Image,
    gallery: [
      "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1575361204480-adf54f0ea15c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
    ],
    coaches: [
      {
        name: "Chris Rodriguez",
        title: "Certified Strength & Conditioning Specialist",
        image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
      },
      {
        name: "Dwayne Morgan",
        title: "Former D1 Running Back",
        image: "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
      }
    ],
    schedule: [
      { time: "9:30 AM - 10:00 AM", activity: "Check-in and dynamic warm-up" },
      { time: "10:00 AM - 11:30 AM", activity: "Acceleration techniques and drills" },
      { time: "11:30 AM - 1:00 PM", activity: "Lateral movement and agility stations" },
      { time: "1:00 PM - 1:45 PM", activity: "Lunch break (provided)" },
      { time: "1:45 PM - 3:00 PM", activity: "Position-specific application" }
    ]
  },
  {
    id: 3,
    title: "College Recruiting Workshop",
    category: "Multi-Sport",
    categoryClass: "bg-[hsl(var(--accent3)_/_0.1)] text-[hsl(var(--accent3))]",
    date: "October 12, 2023",
    time: "6:00 PM - 8:30 PM",
    location: "Community Center Auditorium",
    description: "Essential guidance for athletes and parents navigating the college recruitment process. Learn about eligibility requirements, communication strategies, and scholarship opportunities.",
    fullDescription: "The college recruiting process can be overwhelming for athletes and parents alike. Our comprehensive workshop cuts through the confusion and provides a clear roadmap for student-athletes looking to compete at the collegiate level.\n\nLed by former college coaches and current recruiting consultants, this workshop covers all aspects of the recruitment journey: understanding NCAA, NAIA, and NJCAA eligibility requirements; creating effective highlight videos and athletic resumes; initiating and maintaining communication with coaches; navigating scholarship offers and financial aid; and preparing for campus visits and interviews.\n\nAttendees will receive a detailed workbook with timelines, templates, and checklists to guide them through each step of the process. Parents and athletes will leave with actionable strategies to increase visibility to college programs and maximize opportunities for athletic scholarships.",
    price: "$45.00",
    image: event3Image,
    gallery: [
      "https://images.unsplash.com/photo-1523289333742-be1143f6b766?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1579389083078-4e7018379f7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
    ],
    coaches: [
      {
        name: "Jennifer Davis",
        title: "Former D1 Recruiting Coordinator",
        image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
      },
      {
        name: "Michael Thompson",
        title: "Athletic Scholarship Consultant",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
      }
    ],
    schedule: [
      { time: "5:30 PM - 6:00 PM", activity: "Check-in and materials distribution" },
      { time: "6:00 PM - 6:45 PM", activity: "Understanding eligibility and recruitment timelines" },
      { time: "6:45 PM - 7:30 PM", activity: "Creating effective profiles and communication strategies" },
      { time: "7:30 PM - 8:15 PM", activity: "Financial aid, scholarships, and negotiation" },
      { time: "8:15 PM - 8:30 PM", activity: "Q&A session" }
    ]
  }
];

export default function EventDetail() {
  const [, params] = useRoute<{ id: string }>('/event/:id');
  const [event, setEvent] = useState<any>(null);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    experience: ""
  });
  
  const { toast } = useToast();
  
  useEffect(() => {
    if (params?.id) {
      const eventId = parseInt(params.id);
      const foundEvent = events.find(e => e.id === eventId);
      if (foundEvent) {
        setEvent(foundEvent);
      }
    }
  }, [params]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegistrationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would submit to an API
    // For now, just show a success message
    toast({
      title: "Registration submitted!",
      description: `You've registered for ${event?.title}. Check your email for confirmation.`,
    });
    
    setShowRegistrationDialog(false);
    setRegistrationForm({
      name: "",
      email: "",
      phone: "",
      age: "",
      experience: ""
    });
  };
  
  if (!event) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or has been removed.</p>
          <a href="/events" className="text-primary underline">Return to Events</a>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{event.title} | Rich Habits</title>
        <meta name="description" content={event.description} />
      </Helmet>
      
      <div className="bg-white py-16">
        <Container>
          {/* Event Header */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <a href="/events" className="text-gray-500 hover:text-primary mr-2">
                Events
              </a>
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-gray-800">{event.title}</span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div>
                <span className={`inline-block ${event.categoryClass} text-xs font-medium px-3 py-1 rounded-sm mb-4`}>
                  {event.category}
                </span>
                <h1 className="text-4xl font-serif font-semibold mb-4">{event.title}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <div className="bg-[hsl(var(--secondary)_/_0.1)] p-3 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{event.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-[hsl(var(--secondary)_/_0.1)] p-3 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{event.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-[hsl(var(--secondary)_/_0.1)] p-3 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-[hsl(var(--secondary)_/_0.1)] p-3 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-medium">{event.price}</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setShowRegistrationDialog(true)}
                  className="w-full md:w-auto"
                >
                  Register Now
                </Button>
              </div>
              
              <div className="h-[400px] rounded-md overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Event Description */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-medium mb-6">About This Event</h2>
              <div className="prose max-w-none">
                {event.fullDescription.split('\n\n').map((paragraph: string, index: number) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              {/* Event Schedule */}
              {event.schedule && (
                <div className="mt-10">
                  <h3 className="text-xl font-medium mb-4">Event Schedule</h3>
                  <div className="border border-[hsl(var(--shadow))] rounded-md overflow-hidden">
                    {event.schedule.map((item: any, index: number) => (
                      <div 
                        key={index} 
                        className={`grid grid-cols-3 p-4 ${
                          index % 2 === 0 ? 'bg-[hsl(var(--secondary)_/_0.05)]' : 'bg-white'
                        }`}
                      >
                        <div className="font-medium">{item.time}</div>
                        <div className="col-span-2">{item.activity}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              {/* Coaches / Instructors */}
              {event.coaches && (
                <div className="mb-8">
                  <h3 className="text-xl font-medium mb-4">Instructors</h3>
                  <div className="space-y-4">
                    {event.coaches.map((coach: any, index: number) => (
                      <div key={index} className="flex items-center p-4 border border-[hsl(var(--shadow))] rounded-md">
                        <div className="w-14 h-14 rounded-full overflow-hidden mr-4">
                          <img 
                            src={coach.image} 
                            alt={coach.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">{coach.name}</h4>
                          <p className="text-sm text-gray-600">{coach.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* What to Bring */}
              <div className="mb-8 p-6 bg-[hsl(var(--secondary)_/_0.1)] rounded-md">
                <h3 className="text-xl font-medium mb-4">What to Bring</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Appropriate athletic attire</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Water bottle</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Sport-specific equipment (if applicable)</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Notebook and pen</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Image Gallery */}
          {event.gallery && (
            <div className="mb-16">
              <h2 className="text-2xl font-medium mb-6">Event Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {event.gallery.map((image: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-64 rounded-md overflow-hidden"
                  >
                    <img 
                      src={image} 
                      alt={`${event.title} gallery image ${index + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Registration CTA */}
          <div className="bg-[hsl(var(--accent)_/_0.05)] p-8 rounded-lg text-center">
            <h2 className="text-2xl font-serif font-semibold mb-2">Ready to join us?</h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">Secure your spot now for this exclusive event. Spaces are limited and registration closes one week before the event date.</p>
            <Button 
              onClick={() => setShowRegistrationDialog(true)}
              size="lg"
            >
              Register for {event.title}
            </Button>
          </div>
        </Container>
      </div>
      
      {/* Registration Dialog */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Register for {event.title}</DialogTitle>
            <DialogDescription>
              Fill out the form below to register for this event. Payment will be processed through our secure checkout.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitRegistration} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={registrationForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={registrationForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={registrationForm.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={registrationForm.age}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <Input
                  id="experience"
                  name="experience"
                  placeholder="Beginner, Intermediate, Advanced"
                  value={registrationForm.experience}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit">Proceed to Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}