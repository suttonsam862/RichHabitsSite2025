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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FruitHuntersBanner } from "@/components/home/FruitHuntersBanner";
import { FruitHuntersCompact } from "@/components/home/FruitHuntersCompact";

// Import event images 
import event1Image from "../assets/events/event1.png";
import event2Image from "../assets/events/event2.png";
import event3Image from "../assets/events/event3.png";

// Type for events with static data (will be replaced with API data later)
const events = [
  {
    id: 1,
    title: "BIRMINGHAM SLAM CAMP",
    category: "Wrestling",
    categoryClass: "bg-[hsl(var(--accent)_/_0.1)] text-[hsl(var(--accent))]",
    date: "June 19th-21st",
    time: "9:00 AM - 3:00 PM",
    location: "Clay Chalkville Middle School",
    description: "Something different is happening June 19–21. A camp where lights hit harder, technique runs deeper, and the energy feels bigger than wrestling. Birmingham Slam Camp isn't just training — it's a statement.",
    fullDescription: "Something different is happening June 19–21. A camp where lights hit harder, technique runs deeper, and the energy feels bigger than wrestling. Birmingham Slam Camp isn't just training — it's a statement.\n\nAt Birmingham Slam Camp, athletes will experience high-intensity training sessions led by championship-caliber coaches who understand what it takes to compete at the elite level. Our program focuses on advanced technique development, strategic match planning, and mental toughness training.\n\nEach day features specialized training blocks that build on each other, creating a comprehensive wrestling development experience that will transform your approach to the sport. With a limited athlete-to-coach ratio, you'll receive the personalized attention needed to identify and correct technical issues that may be holding you back.",
    price: "$249",
    image: event1Image,
    gallery: [
      "https://images.unsplash.com/photo-1565992441121-4367c2967103?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1613731587979-67f4e59cc19d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1562771379-eafdca7a02f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
    ],
    coaches: [
      {
        name: "David Valencia",
        title: "Olympic Gold Medalist",
        image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
      },
      {
        name: "Michael Torres",
        title: "USA National Team Coach",
        image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
      }
    ],
    schedule: [
      { time: "8:30 AM - 9:00 AM", activity: "Check-in and warm-up" },
      { time: "9:00 AM - 10:30 AM", activity: "Advanced technique development" },
      { time: "10:30 AM - 12:00 PM", activity: "Strategic match planning and situational drilling" },
      { time: "12:00 PM - 12:45 PM", activity: "Lunch break (provided)" },
      { time: "12:45 PM - 2:00 PM", activity: "Mental preparation and competition tactics" },
      { time: "2:00 PM - 3:00 PM", activity: "Live wrestling and personalized coaching" }
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
    experience: "",
    package: "full",
    grade: "",
    waiver: false
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
      experience: "",
      package: "full",
      grade: "",
      waiver: false
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
      
      {/* New Banner at the top with lighting effects */}
      {event.id === 1 && (
        <div className="w-full overflow-hidden banner-container relative">
          <img 
            src="/src/assets/events/slam_camp_banner.png" 
            alt="Birmingham Wrestling Camp Banner"
            className="w-full object-contain relative z-10"
          />
          <div className="sun-glow"></div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white"></div>
        </div>
      )}
      
      <div className={`bg-white py-16 ${event.id === 1 ? 'flame-bg' : ''}`}>
        {event.id === 1 && (
          <>
            {/* Heat waves */}
            <div className="heat-wave heat-wave-1"></div>
            <div className="heat-wave heat-wave-2"></div>
            <div className="heat-wave heat-wave-3"></div>
            <div className="heat-wave heat-wave-1" style={{top: '25%', animationDelay: '1s'}}></div>
            <div className="heat-wave heat-wave-2" style={{top: '55%', animationDelay: '3s'}}></div>
            <div className="heat-wave heat-wave-3" style={{top: '80%', animationDelay: '2s'}}></div>
            
            {/* Neon flame licks */}
            <div className="neon-lick-1"></div>
            <div className="neon-lick-2"></div>
            <div className="neon-lick-3"></div>
            <div className="neon-lick-1" style={{left: '75%', animationDelay: '3s'}}></div>
            <div className="neon-lick-2" style={{left: '25%', animationDelay: '7s'}}></div>
          </>
        )}
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
              <div className="lg:col-span-2">
                <span className={`inline-block ${event.id === 1 ? "fire-gradient-btn text-white" : event.categoryClass} text-xs font-medium px-3 py-1 rounded-sm mb-4`}>
                  {event.category}
                </span>
                {event.id === 1 ? (
                  <>
                    <div className="bg-white p-4 rounded-md border-l-4 border-gray-500 mb-4 shadow-sm">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Limited to 200 participants - Register early to secure your spot</span>
                      </div>
                    </div>
                    
                    <div className="my-6 flex flex-col items-center">
                      <div className="relative w-[70%] mx-auto">
                        <img 
                          src="/src/assets/events/slam_camp_title.png" 
                          alt="Birmingham Slam Camp" 
                          className="w-full animate-[titleGlow_3s_ease-in-out_infinite]"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity duration-300 rounded-lg"></div>
                      </div>
                      <div className="golden-glass-bar h-1 w-[70%] mx-auto mt-1"></div>
                    </div>
                    
                    <div className="text-center mb-4">
                      <div className="text-lg font-medium mb-1">Clay-Chalkville Middle School</div>
                      <div className="text-sm text-gray-700">6700 Trussville Clay Rd, Trussville AL 35173</div>
                    </div>
                  </>
                ) : (
                  <h1 className="text-4xl font-serif font-bold mb-4 tracking-wide">{event.title}</h1>
                )}
                
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
                
                {event.id === 1 ? (
                  <button 
                    onClick={() => setShowRegistrationDialog(true)}
                    className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-6 font-medium tracking-wide inline-block rounded-sm w-full md:w-auto shadow-sm"
                  >
                    Register Now
                  </button>
                ) : (
                  <Button 
                    onClick={() => setShowRegistrationDialog(true)}
                    className="w-full md:w-auto"
                  >
                    Register Now
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Featured Coaches */}
          {event.id === 1 && (
            <div className="mb-12 relative">
              <div className="mb-8 border-b border-gray-200 pb-2">
                <h2 className="text-2xl font-bold">World-Class Coaching Staff</h2>
                <p className="text-gray-600">Learn from champions who have mastered the techniques at the highest level</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 transition-transform hover:shadow-lg">
                  <div className="h-56 overflow-hidden">
                    <img 
                      src="/src/assets/coaches/zahid_valencia.jpg" 
                      alt="Zahid Valencia" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">Zahid Valencia</h3>
                    <div className="text-gray-600 text-sm font-medium mb-2">2-Time NCAA Champion</div>
                    <p className="text-gray-600 text-sm">Two-time NCAA Champion and three-time Pac-12 Wrestler of the Year with international success.</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 transition-transform hover:shadow-lg">
                  <div className="h-56 overflow-hidden">
                    <img 
                      src="/src/assets/coaches/michael_mcgee.jpg" 
                      alt="Michael McGee" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">Michael McGee</h3>
                    <div className="text-gray-600 text-sm font-medium mb-2">Three-Time All-American</div>
                    <p className="text-gray-600 text-sm">Three-time NCAA All-American and two-time Pac-12 Champion known for explosive offense and leadership.</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 transition-transform hover:shadow-lg">
                  <div className="h-56 overflow-hidden">
                    <img 
                      src="/src/assets/coaches/brandon_courtney.webp" 
                      alt="Brandon Courtney" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">Brandon Courtney</h3>
                    <div className="text-gray-600 text-sm font-medium mb-2">Four-Time All-American</div>
                    <p className="text-gray-600 text-sm">Four-time NCAA All-American and three-time Pac-12 Champion with relentless pace and technical precision.</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 transition-transform hover:shadow-lg">
                  <div className="h-56 overflow-hidden">
                    <img 
                      src="/src/assets/coaches/josh_shields.webp" 
                      alt="Josh Shields" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">Josh Shields</h3>
                    <div className="text-gray-600 text-sm font-medium mb-2">Three-Time All-American</div>
                    <p className="text-gray-600 text-sm">Three-time NCAA All-American and Pac-12 Champion with over 100 career wins at Arizona State University.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Event Description */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            <div className="lg:col-span-2">
              {event.id === 1 ? (
                <>
                  <div className="mb-6 border-b border-gray-200 pb-2">
                    <h2 className="text-2xl font-bold">About Birmingham Wrestling Camp</h2>
                    <p className="text-gray-600">Premium training experience for wrestlers of all levels</p>
                  </div>
                  <div className="prose max-w-none text-gray-700">
                    <p className="mb-4">
                      The Birmingham Wrestling Camp returns to Clay-Chalkville Middle School from June 19–21, 2025, offering three comprehensive days of elite instruction. Wrestlers will train with 2-time NCAA champion Zahid Valencia and All-Americans including three-time NCAA All-American Michael McGee, who placed third in 2023, four-time NCAA All-American Brandon Courtney, who was named Pac-12 Wrestler of the Year in 2023, and Josh Shields - a three-time NCAA All-American and three-time Pac-12 Champion who surpassed 100 career victories at Arizona State University.
                    </p>
                    <p className="mb-4">
                      Our curriculum is designed for wrestlers from 2nd grade through graduating seniors. With enrollment capped at 200 participants, each athlete receives personalized coaching during our daily sessions from 9 AM to 4 PM, featuring technique development, competitive scenarios, and strategic training.
                    </p>
                    
                    <p className="mb-4">
                      Every camper receives a limited-edition camp t-shirt and access to our Coach Bonus program: bring 10+ wrestlers from your program and receive 10% off your next Rich Habits custom gear order.
                    </p>
                    <p className="mb-4">
                      Pricing is straightforward—$249 for the full three-day experience or $149 for a single-day pass. Cancellations can be addressed directly with our team for refund processing. All participants (or parents/guardians for minors) must sign a medical release waiver.
                    </p>
                    
                    <FruitHuntersCompact />
                  </div>
                  
                  <div className="mt-10">
                    <div className="mb-6 border-b border-gray-200 pb-2">
                      <h3 className="text-xl font-bold">Daily Schedule</h3>
                      <p className="text-gray-600">Structured training program designed for maximum development</p>
                    </div>
                    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Time</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/3">Activity</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">9:00 AM - 9:15 AM</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <div className="font-medium">Registration & Gear Pickup</div>
                              <div className="text-xs text-gray-500 mt-1">Check in, get your gear, put shoes on and get ready</div>
                            </td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">9:15 AM - 11:00 AM</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <div className="font-medium">Fun Warmup & Intro Technique</div>
                              <div className="text-xs text-gray-500 mt-1">Games and fundamental technique instruction</div>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">11:00 AM - 11:30 AM</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <div className="font-medium">Water Break & Recreation</div>
                              <div className="text-xs text-gray-500 mt-1">Hang out with friends, play PlayStation and other fun games</div>
                            </td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">11:30 AM - 12:30 PM</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <div className="font-medium">Live Session & Spotlight Matches</div>
                              <div className="text-xs text-gray-500 mt-1">Competitive wrestling and featured demonstration matches</div>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">12:30 PM - 1:30 PM</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <div className="font-medium">Lunch Break & Gear Shop</div>
                              <div className="text-xs text-gray-500 mt-1">Featuring Fruit Hunters nutrition stations and Rich Habits gear booth</div>
                            </td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">1:30 PM - 3:00 PM</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <div className="font-medium">Second Technique Session</div>
                              <div className="text-xs text-gray-500 mt-1">Advanced techniques and drilling</div>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">3:00 PM - 3:30 PM</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <div className="font-medium">Q&A & Closing Activities</div>
                              <div className="text-xs text-gray-500 mt-1">Q&A with the clinician of the day and end-of-day activities</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
            
            {/* Full-width Registration Section with Pricing Cards */}
            <div className="w-full bg-gray-50 border-t border-b border-gray-200 py-12 mt-10 mb-16">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-10">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Registration Plans</h3>
                  <p className="text-gray-600 max-w-2xl mx-auto">Choose the registration option that works best for you. All plans include expert coaching, a camp t-shirt, and Fruit Hunters nutrition packs.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {/* Full Camp Plan */}
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 transition-transform duration-300 hover:scale-105">
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xl font-bold text-gray-800">Full Camp</h4>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">Most Popular</span>
                      </div>
                      <div className="mt-4 flex items-end">
                        <span className="text-4xl font-bold text-gray-800">$249</span>
                        <span className="text-gray-500 ml-2 pb-1">/ 3 days</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 mt-0.5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Complete 3-day intensive training experience</span>
                        </li>
                        <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 mt-0.5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Learn from all featured coaches</span>
                        </li>
                        <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 mt-0.5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Exclusive Rich Habits camp t-shirt</span>
                        </li>
                        <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 mt-0.5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Daily Fruit Hunters nutrition packs</span>
                        </li>
                      </ul>
                      <div className="mt-8">
                        <button 
                          onClick={() => setShowRegistrationDialog(true)}
                          className="bg-gray-800 text-white py-3 px-6 font-medium tracking-wide inline-block rounded-lg w-full transition duration-200 hover:bg-gray-900"
                        >
                          Register for Full Camp
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Single Day Plan */}
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 transition-transform duration-300 hover:scale-105">
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xl font-bold text-gray-800">Single Day</h4>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">Flexible Option</span>
                      </div>
                      <div className="mt-4 flex items-end">
                        <span className="text-4xl font-bold text-gray-800">$149</span>
                        <span className="text-gray-500 ml-2 pb-1">/ day</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 mt-0.5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Attend any one day of your choice</span>
                        </li>
                        <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 mt-0.5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Train with featured coach of the day</span>
                        </li>
                        <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 mt-0.5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Rich Habits camp t-shirt</span>
                        </li>
                        <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 mt-0.5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Fruit Hunters nutrition pack</span>
                        </li>
                      </ul>
                      <div className="mt-8">
                        <button 
                          onClick={() => setShowRegistrationDialog(true)}
                          className="bg-white text-gray-800 border-2 border-gray-800 py-3 px-6 font-medium tracking-wide inline-block rounded-lg w-full transition duration-200 hover:bg-gray-50"
                        >
                          Register for Single Day
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 bg-white p-5 rounded-lg shadow-sm max-w-4xl mx-auto border border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <h4 className="font-bold text-gray-800 mb-1">Group Discount Available</h4>
                      <p className="text-gray-600 text-sm">Programs bringing 10+ wrestlers receive 10% off next Rich Habits custom gear order</p>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Age Groups</div>
                        <div className="font-medium">2nd Grade - Senior</div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Capacity</div>
                        <div className="font-medium">Limited to 200 wrestlers</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Container>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
            
            <div>
              {event.id === 1 ? (
                <>
                  <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8 border border-gray-200">
                    <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                      <h3 className="text-lg font-bold text-gray-800">Coach Spotlight: Zahid Valencia</h3>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-gray-300">
                          <img 
                            src="/src/assets/coaches/zahid_valencia.jpg" 
                            alt="Zahid Valencia" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">Zahid Valencia</div>
                          <div className="text-gray-600 text-sm font-medium">Two-Time NCAA Champion</div>
                          <div className="text-gray-600 text-xs">Arizona State University</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-4">
                        A two-time NCAA Division I National Champion at 174 lbs (2018, 2019) and three-time Pac-12 Wrestler of the Year, Zahid Valencia is one of the most decorated wrestlers in Arizona State University history. He has also achieved success on the international stage, including a gold medal at the 2025 Zagreb Open at 86 kg. Valencia brings elite technique, championship experience, and a passion for mentoring the next generation of wrestlers.
                      </p>
                      <div className="text-right">
                        <span className="text-gray-600 text-sm cursor-pointer">Read more</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8 border border-gray-200">
                    <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                      <h3 className="text-lg font-bold text-gray-800">Coach Spotlight: Michael McGee</h3>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-gray-300">
                          <img 
                            src="/src/assets/coaches/michael_mcgee.jpg" 
                            alt="Michael McGee" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">Michael McGee</div>
                          <div className="text-gray-600 text-sm font-medium">Three-Time All-American</div>
                          <div className="text-gray-600 text-xs">Arizona State University</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-4">
                        Michael McGee is a three-time NCAA All-American at 133 lbs, placing as high as third in 2023, and a two-time Pac-12 Champion. Renowned for his explosive offense and leadership on and off the mat, McGee is dedicated to helping young wrestlers develop their skills and confidence.
                      </p>
                      <div className="text-right">
                        <span className="text-gray-600 text-sm cursor-pointer">Read more</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8 border border-gray-200">
                    <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                      <h3 className="text-lg font-bold text-gray-800">Camp Highlights</h3>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="bg-gray-600 p-2 rounded-md mr-3 text-white flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800">World-Class Coaching</span>
                            <p className="text-sm text-gray-600">Learn from champion wrestlers with proven coaching records</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-gray-600 p-2 rounded-md mr-3 text-white flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800">Limited Enrollment</span>
                            <p className="text-sm text-gray-600">Capped at 200 wrestlers to ensure quality instruction</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-gray-600 p-2 rounded-md mr-3 text-white flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M6.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm6 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM13 10a3 3 0 11-6 0 3 3 0 016 0zm-9 3a3 3 0 100 6 3 3 0 000-6zm9 0a3 3 0 100 6 3 3 0 000-6z" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800">Fruit Hunters Partnership</span>
                            <p className="text-sm text-gray-600">Daily exotic fruit nutrition packs and athlete-specific recipes</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-gray-600 p-2 rounded-md mr-3 text-white flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17A3 3 0 015 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                              <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800">Exclusive Camp T-Shirt</span>
                            <p className="text-sm text-gray-600">High-quality commemorative shirt included</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  

                  
                  <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                    <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                      <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="bg-gray-100 p-2 rounded-md mr-3 text-gray-600 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-medium text-gray-800">Email</span>
                            <p className="text-gray-600">camp@richhabits.com</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-gray-100 p-2 rounded-md mr-3 text-gray-600 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-medium text-gray-800">Phone</span>
                            <p className="text-gray-600">(205) 555-0123</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
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
          
          {/* Important Information */}
          {event.id === 1 && (
            <div className="mb-12">
              <div className="mb-8 border-b border-gray-200 pb-2">
                <h2 className="text-2xl font-bold">Important Policies & Information</h2>
                <p className="text-gray-600">Everything you need to know about registration, safety, and camp policies</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                  <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                    <h3 className="text-lg font-bold text-gray-800">Registration & Refund Policy</h3>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="bg-gray-100 p-1.5 rounded-md mr-3 text-gray-600 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">Online Registration</span>
                          <p className="text-sm text-gray-600">Secure checkout via Shopify payment processing</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-gray-100 p-1.5 rounded-md mr-3 text-gray-600 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">Limited Enrollment</span>
                          <p className="text-sm text-gray-600">Registration capped at 200 wrestlers to ensure quality</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-gray-100 p-1.5 rounded-md mr-3 text-gray-600 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">Refund Policy</span>
                          <p className="text-sm text-gray-600">Full refunds available until June 5th, 2025</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-gray-100 p-1.5 rounded-md mr-3 text-gray-600 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">Group Discount</span>
                          <p className="text-sm text-gray-600">Programs with 10+ wrestlers receive 10% off next Rich Habits gear order</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                  <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                    <h3 className="text-lg font-bold text-gray-800">Medical & Safety Information</h3>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-800 mb-2">Medical Release Requirement</h4>
                      <p className="text-sm text-gray-600">
                        All participants (or their parents/guardians if under 18) must sign a medical-release waiver 
                        acknowledging that Rich Habits is not liable for injuries sustained during the camp.
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-800 mb-2">On-Site Medical Support</h4>
                      <p className="text-sm text-gray-600">
                        Certified athletic trainers will be present throughout camp hours to address any
                        injuries or medical concerns that may arise.
                      </p>
                    </div>
                    
                    <div className="flex items-center bg-white p-4 rounded-md shadow-sm border border-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <h4 className="font-medium text-gray-800">Safety Is Our Priority</h4>
                        <p className="text-sm text-gray-600">Structured training with proper supervision and safety protocols</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Registration CTA */}
          {event.id === 1 ? (
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 p-8 text-center">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Secure Your Spot at Birmingham Wrestling Camp</h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Registration is limited to 200 wrestlers and closes on June 5th, 2025. 
                  Don't miss this opportunity to train with elite coaches in a structured, 
                  high-quality environment with exclusive nutrition support from Fruit Hunters.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={() => setShowRegistrationDialog(true)}
                    className="bg-gray-800 text-white py-3 px-8 font-medium tracking-wide rounded-md transition duration-200 hover:bg-gray-900 shadow-md"
                  >
                    Register Now
                  </button>
                  <a 
                    href="#" 
                    className="border border-gray-300 text-gray-700 py-3 px-8 font-medium tracking-wide rounded-md transition duration-200 hover:bg-gray-50"
                  >
                    Download Information Packet
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[hsl(var(--accent)_/_0.05)] p-8 rounded-lg text-center">
              <h2 className="text-2xl font-medium mb-2">Ready to join us?</h2>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto font-medium">Secure your spot now for this exclusive event. Spaces are limited and registration closes one week before the event date.</p>
              <Button 
                onClick={() => setShowRegistrationDialog(true)}
                size="lg"
              >
                Register for {event.title}
              </Button>
            </div>
          )}
          
          {/* Fruit Hunters Banner - Positioned at the bottom of the page */}
          {event.id === 1 && (
            <div className="mt-16 mb-8">
              <FruitHuntersBanner />
            </div>
          )}
        </Container>
      </div>
      
      {/* Registration Dialog */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              {event.id === 1 ? "Birmingham Wrestling Camp Registration" : `Register for ${event.title}`}
            </DialogTitle>
            <DialogDescription>
              {event.id === 1 ? (
                <div className="mt-3">
                  <div className="bg-white p-4 rounded-md mb-4 border-l-4 border-gray-300 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-2">REGISTRATION OPTIONS</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <span className="font-medium">Full Camp (3 Days)</span>
                          <span className="text-gray-700 font-bold ml-2">$249</span>
                        </div>
                      </li>
                      <li className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <span className="font-medium">Single Day Pass</span>
                          <span className="text-gray-700 font-bold ml-2">$149</span>
                        </div>
                      </li>
                    </ul>
                    <p className="text-gray-700 text-sm mt-2">Open to wrestlers from 2nd grade through graduating seniors</p>
                  </div>
                  <p className="text-gray-600 mb-2">
                    Complete the form below to secure your spot. All fields are required.
                    Payment will be processed securely via Shopify.
                  </p>
                </div>
              ) : (
                "Complete the form below to register for the event. Payment will be processed through our secure checkout."
              )}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitRegistration} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={registrationForm.name}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={registrationForm.email}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={registrationForm.phone}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
              </div>
              
              {event.id === 1 ? (
                <>
                  <div className="pt-2">
                    <Label htmlFor="package" className="text-gray-700 mb-1 block">Registration Type</Label>
                    <Select 
                      name="package"
                      value={registrationForm.package || "full"}
                      onValueChange={(value) => setRegistrationForm({...registrationForm, package: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your package" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Camp (3 Days) - $249</SelectItem>
                        <SelectItem value="single">Single Day Pass - $149</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="grade" className="text-gray-700 mb-1 block">Grade Level</Label>
                    <Select 
                      name="grade"
                      value={registrationForm.grade || ""}
                      onValueChange={(value) => setRegistrationForm({...registrationForm, grade: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select grade level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elementary">Elementary (2nd-5th)</SelectItem>
                        <SelectItem value="middle">Middle School (6th-8th)</SelectItem>
                        <SelectItem value="high">High School (9th-12th)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mt-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="waiver" 
                        checked={registrationForm.waiver === true}
                        onCheckedChange={(checked) => 
                          setRegistrationForm({...registrationForm, waiver: checked === true})
                        }
                        required
                        className="mt-1"
                      />
                      <label
                        htmlFor="waiver"
                        className="text-sm leading-tight text-gray-700"
                      >
                        I acknowledge that Rich Habits is not liable for injuries sustained during the camp and agree that a medical-release waiver must be signed before participation.
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm mt-2">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-gray-700">
                        Camp includes daily nutrition packs from our partner Fruit Hunters, America's premier exotic fruits company.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="age" className="text-gray-700">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={registrationForm.age}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience" className="text-gray-700">Experience Level</Label>
                    <Input
                      id="experience"
                      name="experience"
                      placeholder="Beginner, Intermediate, Advanced"
                      value={registrationForm.experience}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter className="mt-6 pt-4 border-t border-gray-100">
              <Button 
                type="submit"
                className={event.id === 1 ? "bg-gray-800 hover:bg-gray-900" : ""}
              >
                {event.id === 1 ? "Proceed to Checkout" : "Proceed to Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}