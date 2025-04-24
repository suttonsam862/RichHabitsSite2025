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
            
            {/* Hot spots */}
            <div className="hot-spot"></div>
            <div className="hot-spot"></div>
            <div className="hot-spot"></div>
            <div className="hot-spot"></div>
            <div className="hot-spot"></div>
            <div className="hot-spot"></div>
            <div className="hot-spot"></div>
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
              <div>
                <span className={`inline-block ${event.id === 1 ? "fire-gradient-btn text-white" : event.categoryClass} text-xs font-medium px-3 py-1 rounded-sm mb-4`}>
                  {event.category}
                </span>
                {event.id === 1 ? (
                  <>
                    <div className="overflow-hidden rounded-lg mb-6 relative banner-container">
                      <div className="absolute top-0 left-0 w-full h-full z-10 flex items-center justify-center">
                        <h1 className="text-5xl font-serif font-bold tracking-wide fire-title px-6 py-3 bg-black bg-opacity-40 rounded-lg">
                          <span className="birmingham-title">BIRMINGHAM</span> SLAM CAMP
                          <div className="text-base font-normal mt-2 text-white">Returning for its second year!</div>
                        </h1>
                      </div>
                      <img 
                        src="https://images.unsplash.com/photo-1565108010726-a955cca8d67e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                        alt="Birmingham Slam Camp Banner"
                        className="w-full h-48 object-cover banner-image"
                      />
                      <div className="mountain-clip-left"></div>
                      <div className="mountain-clip-right"></div>
                    </div>
                    <div className="spark-container mb-3">
                      <div className="spark spark-1"></div>
                      <div className="spark spark-2"></div>
                      <div className="spark spark-3"></div>
                      <div className="text-lg font-medium text-center mb-2">June 19-21, 2025 • Clay-Chalkville Middle School</div>
                      <div className="text-sm text-center text-gray-700">6700 Trussville Clay Rd, Trussville AL 35173</div>
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
                    className="fire-gradient-btn text-white py-2 px-6 font-medium tracking-wide inline-block rounded-sm w-full md:w-auto"
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
              
              <div className="h-[400px] rounded-md overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Featured Coaches */}
          {event.id === 1 && (
            <div className="mb-12 relative">
              <div className="fire-title-container mb-8">
                <h2 className="text-3xl font-serif font-semibold">Elite Coaching Staff</h2>
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-1 w-40 mt-2"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="coach-highlight h-64">
                  <img 
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                    alt="Zahid Valencia" 
                    className="w-full h-full object-cover"
                  />
                  <div className="coach-accolade">2-Time NCAA Champion</div>
                  <div className="coach-name">Zahid Valencia</div>
                </div>
                <div className="coach-highlight h-64">
                  <img 
                    src="https://images.unsplash.com/photo-1555597673-b21d5c935865?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                    alt="Michael McGee" 
                    className="w-full h-full object-cover"
                  />
                  <div className="coach-accolade">All-American</div>
                  <div className="coach-name">Michael McGee</div>
                </div>
                <div className="coach-highlight h-64">
                  <img 
                    src="https://images.unsplash.com/photo-1576678927484-cc907957088c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                    alt="Brandon Courtney" 
                    className="w-full h-full object-cover"
                  />
                  <div className="coach-accolade">All-American</div>
                  <div className="coach-name">Brandon Courtney</div>
                </div>
                <div className="coach-highlight h-64">
                  <img 
                    src="https://images.unsplash.com/photo-1614632537197-38a17061c2bd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                    alt="Josh Shields" 
                    className="w-full h-full object-cover"
                  />
                  <div className="coach-accolade">All-American</div>
                  <div className="coach-name">Josh Shields</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Event Description */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            <div className="lg:col-span-2">
              {event.id === 1 ? (
                <>
                  <div className="fire-title-container mb-6">
                    <h2 className="text-3xl font-serif font-semibold">About Birmingham Slam Camp</h2>
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-1 w-40 mt-2"></div>
                  </div>
                  <div className="prose max-w-none">
                    <p className="mb-4">
                      Returning for its second year, Birmingham Slam Camp storms back to Clay-Chalkville Middle School from June 19 – 21, 2025, delivering three electrifying days of elite coaching from 2-time NCAA champion Zahid Valencia alongside All-Americans Michael McGee, Brandon Courtney, and Josh Shields.
                    </p>
                    <p className="mb-4">
                      Open to wrestlers from 2nd grade through graduating seniors, the camp caps enrollment at 200 athletes and loads each day—9 AM – 4 PM—with high-intensity technique sessions, live goes, and Q&A.
                    </p>
                    <p className="mb-4">
                      Every camper scores a limited-edition Slam Camp tee, pro-shot highlight footage for college recruiting, and access to our Coach Bonus: bring 10+ wrestlers and your program gets 10% off its next Rich Habits custom-gear order.
                    </p>
                    <p className="mb-4">
                      Pricing is simple—$249 for the full three-day experience or $149 for a one-day pass—and anyone needing to cancel can just contact us directly for refunds. All participants (or their parents) must sign a medical-release waiver acknowledging that Rich Habits is not liable for injuries.
                    </p>
                    <p className="mb-4">
                      Registration flows through our site via a Shopify checkout that will automatically load the correct product—just one click to lock in your spot and train with some of the nation's best at Alabama's premier summer wrestling clinic.
                    </p>
                  </div>
                  
                  <div className="mt-10">
                    <div className="fire-title-container mb-6">
                      <h3 className="text-2xl font-serif font-semibold">Daily Schedule</h3>
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-1 w-32 mt-2"></div>
                    </div>
                    <div className="border border-[hsl(var(--shadow))] rounded-md overflow-hidden">
                      <div className="grid grid-cols-3 p-4 bg-[hsl(var(--secondary)_/_0.05)]">
                        <div className="font-medium">9:00 AM - 11:30 AM</div>
                        <div className="col-span-2">Morning Technique Sessions</div>
                      </div>
                      <div className="grid grid-cols-3 p-4 bg-white">
                        <div className="font-medium">11:30 AM - 12:30 PM</div>
                        <div className="col-span-2">Lunch Break</div>
                      </div>
                      <div className="grid grid-cols-3 p-4 bg-[hsl(var(--secondary)_/_0.05)]">
                        <div className="font-medium">12:30 PM - 2:30 PM</div>
                        <div className="col-span-2">Afternoon Training & Live Goes</div>
                      </div>
                      <div className="grid grid-cols-3 p-4 bg-white">
                        <div className="font-medium">2:30 PM - 3:30 PM</div>
                        <div className="col-span-2">Q&A with Coaches</div>
                      </div>
                      <div className="grid grid-cols-3 p-4 bg-[hsl(var(--secondary)_/_0.05)]">
                        <div className="font-medium">3:30 PM - 4:00 PM</div>
                        <div className="col-span-2">Cool Down & Wrap-up</div>
                      </div>
                    </div>
                  </div>
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
                  <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8 border border-[hsl(var(--shadow))]">
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-4 fire-title">Camp Highlights</h3>
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="bg-gradient-to-br from-amber-500 to-red-500 p-2 rounded-full mr-3 text-white flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-medium">Elite Coaching Staff</span>
                            <p className="text-sm text-gray-600">Train with NCAA champions and All-Americans</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-gradient-to-br from-amber-500 to-red-500 p-2 rounded-full mr-3 text-white flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-medium">Limited-Edition Tee</span>
                            <p className="text-sm text-gray-600">Every camper receives an exclusive Slam Camp shirt</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-gradient-to-br from-amber-500 to-red-500 p-2 rounded-full mr-3 text-white flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-medium">Pro-Shot Highlights</span>
                            <p className="text-sm text-gray-600">Recruitment footage for your college portfolio</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-gradient-to-br from-amber-500 to-red-500 p-2 rounded-full mr-3 text-white flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17A3 3 0 015 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                              <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-medium">Group Discount</span>
                            <p className="text-sm text-gray-600">Bring 10+ wrestlers for 10% off custom gear</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8 border border-[hsl(var(--shadow))]">
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-4">Registration Details</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="font-medium">Full Camp (3 Days)</span>
                          <span className="text-xl font-bold">$249</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Single Day Pass</span>
                          <span className="text-xl font-bold">$149</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Age Groups</span>
                          <span>2nd Grade - Senior</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Capacity</span>
                          <span>Limited to 200 wrestlers</span>
                        </div>
                        <div className="pt-4">
                          <button 
                            onClick={() => setShowRegistrationDialog(true)}
                            className="fire-gradient-btn text-white py-3 px-6 font-medium tracking-wide inline-block rounded-sm w-full"
                          >
                            Register Now
                          </button>
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
              <div className="fire-title-container mb-8">
                <h2 className="text-3xl font-serif font-semibold">Important Information</h2>
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-1 w-40 mt-2"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[hsl(var(--shadow))]">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Registration Policy</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Registration through our website via Shopify checkout</span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Limited to 200 wrestlers</span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Cancellations: Contact us directly for refunds</span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Group Discount: Bring 10+ wrestlers for 10% off custom gear orders</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[hsl(var(--shadow))]">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Medical & Liability</h3>
                    <p className="mb-4 text-sm">All participants (or their parents/guardians if under 18) must sign a medical-release waiver acknowledging that Rich Habits is not liable for injuries sustained during the camp.</p>
                    <div className="flex items-center mt-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <h4 className="font-medium">Safety First</h4>
                        <p className="text-sm text-gray-600">Proper medical staff will be on-site throughout the camp</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Registration CTA */}
          <div className={`${event.id === 1 ? 'bg-gradient-to-r from-[rgba(255,60,0,0.05)] via-[rgba(255,150,0,0.07)] to-[rgba(255,190,0,0.05)]' : 'bg-[hsl(var(--accent)_/_0.05)]'} p-8 rounded-lg text-center`}>
            <h2 className={`text-2xl font-serif font-semibold mb-2 ${event.id === 1 ? 'fire-title' : ''}`}>Ready to join us?</h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto font-medium">Secure your spot now for this exclusive event. Spaces are limited and registration closes one week before the event date.</p>
            {event.id === 1 ? (
              <button 
                onClick={() => setShowRegistrationDialog(true)}
                className="fire-gradient-btn text-white py-3 px-8 font-medium tracking-wide inline-block rounded-sm"
              >
                Register for {event.title}
              </button>
            ) : (
              <Button 
                onClick={() => setShowRegistrationDialog(true)}
                size="lg"
              >
                Register for {event.title}
              </Button>
            )}
          </div>
        </Container>
      </div>
      
      {/* Registration Dialog */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Register for {event.title}</DialogTitle>
            <DialogDescription>
              {event.id === 1 ? (
                <div className="mt-2">
                  <p>Fill out this form to register for Birmingham Slam Camp. Choose from:</p>
                  <ul className="mt-2 mb-2">
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Full Camp (3 Days): $249</span>
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Single Day Pass: $149</span>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-600">Open to wrestlers from 2nd grade through graduating seniors</p>
                </div>
              ) : (
                "Complete the form below to register for the event. Payment will be processed through our secure checkout."
              )}
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
              
              {event.id === 1 ? (
                <>
                  <div>
                    <Label htmlFor="package">Registration Type</Label>
                    <Select 
                      name="package"
                      value={registrationForm.package || "full"}
                      onValueChange={(value) => setRegistrationForm({...registrationForm, package: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your package" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Camp (3 Days) - $249</SelectItem>
                        <SelectItem value="single">Single Day Pass - $149</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="grade">Grade Level</Label>
                    <Select 
                      name="grade"
                      value={registrationForm.grade || ""}
                      onValueChange={(value) => setRegistrationForm({...registrationForm, grade: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elementary">Elementary (2nd-5th)</SelectItem>
                        <SelectItem value="middle">Middle School (6th-8th)</SelectItem>
                        <SelectItem value="high">High School (9th-12th)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="waiver" 
                        checked={registrationForm.waiver === true}
                        onCheckedChange={(checked) => 
                          setRegistrationForm({...registrationForm, waiver: checked === true})
                        }
                        required
                      />
                      <label
                        htmlFor="waiver"
                        className="text-sm leading-none"
                      >
                        I acknowledge that Rich Habits is not liable for injuries and that a medical-release waiver must be signed
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={registrationForm.age}
                      onChange={handleInputChange}
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
                    />
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter>
              <Button type="submit">
                {event.id === 1 ? "Proceed to Checkout" : "Proceed to Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}