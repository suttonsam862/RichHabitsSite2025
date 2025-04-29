import { useState } from "react";
import { Container } from "@/components/ui/container";
import { AnimatedUnderline } from "@/components/ui/animated-underline";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

// Import event images and videos
// Use public path references for consistent loading
const event1Image = "/assets/events/SlamCampSiteBanner.png";
const event2Image = "/assets/events/LongSitePhotovegas.png";
const event3Image = "/assets/events/RecruitingWebsiteimage4.png";
const event4Image = "/assets/events/image_1745720198123.png"; // Placeholder until specific graphic is created
const birminghamVideo = "/assets/0424.mov";
const champCampVideo = "/assets/04243.mov";
const texasRecruitingVideo = "/assets/trcvid.mov";
const coryLandVideo = "/assets/corylandloopvide.mov"; // Updated Cory Land Tour video

// Static events data
const events = [
  {
    id: 3,
    title: "TEXAS RECRUITING CLINIC",
    category: "Wrestling",
    categoryClass: "bg-[hsl(var(--accent3)_/_0.1)] text-[hsl(var(--accent3))]",
    date: "June 12th-13th, 2025",
    time: "9:00 AM - 4:00 PM",
    location: "Arlington Martin High School",
    description: "A unique clinic designed specifically for high school wrestlers seeking collegiate opportunities. Features skill development sessions with college coaches, recruiting workshops, professional video profiling, and low scale competition to enhance recruitment portfolios.",
    price: "$249",
    originalPrice: "$300",
    image: event3Image
  },
  {
    id: 4,
    title: "CORY LAND TOUR",
    category: "Wrestling",
    categoryClass: "bg-[#4B0082]/10 text-[#4B0082]",
    date: "May 15th-17th, 2025",
    time: "9:00 AM - 3:00 PM",
    location: "Multiple locations in Alabama",
    description: "Join Northern Iowa standout Cory Land and his teammates Wyatt Voelker, Trever Anderson, and Garrett Funk for this unique 3-day clinic tour across Alabama. Each day features a new location with intensive technique training, live wrestling, and personalized coaching from these collegiate athletes.",
    price: "$99/day",
    originalPrice: "$299",
    image: event4Image,
    locations: [
      { day: "Day 1 - May 15", location: "Birmingham, AL" },
      { day: "Day 2 - May 16", location: "Huntsville, AL" },
      { day: "Day 3 - May 17", location: "Montgomery, AL" }
    ]
  },
  {
    id: 1,
    title: "BIRMINGHAM SLAM CAMP",
    category: "Wrestling",
    categoryClass: "bg-[hsl(var(--accent)_/_0.1)] text-[hsl(var(--accent))]",
    date: "June 19th-21st, 2025",
    time: "9:00 AM - 3:00 PM",
    location: "Clay Chalkville Middle School",
    description: "Something different is happening June 19–21. A camp where lights hit harder, technique runs deeper, and the energy feels bigger than wrestling. Birmingham Slam Camp isn't just training — it's a statement.",
    price: "$249",
    image: event1Image
  },
  {
    id: 2,
    title: "NATIONAL CHAMP CAMP",
    category: "Wrestling",
    categoryClass: "bg-[hsl(var(--accent2)_/_0.1)] text-[hsl(var(--accent2))]",
    date: "July 8th-10th, 2025",
    time: "9:00 AM - 4:00 PM",
    location: "Las Vegas, NV",
    description: "Train with NCAA champions and Olympic athletes in this intensive three-day camp focused on advanced wrestling techniques. Designed for competitive wrestlers looking to elevate their skill set to championship level.",
    price: "$349",
    image: event2Image
  }
];

export default function Events() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    firstName: "",
    lastName: "",
    contactName: "",
    email: "",
    phone: "",
    tShirtSize: "Large",
    grade: "",
    schoolName: "",
    clubName: "",
    medicalReleaseAccepted: false,
    registrationType: "full",
    day1: false,
    day2: false,
    day3: false
  });
  
  // Add event handler for video errors
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoElement = e.currentTarget;
    videoElement.classList.add('error');
    // Find the parent container and add the error class to it
    const parentContainer = videoElement.parentElement;
    if (parentContainer) {
      parentContainer.classList.add('video-error');
    }
  };
  
  const { toast } = useToast();

  const handleRegister = (event: any) => {
    // Instead of showing the dialog, navigate to the dedicated registration page
    window.location.href = `/events/${event.id}/register`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegistrationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEvent) {
      toast({
        title: "Error",
        description: "No event selected.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Submit to the API for registration
      const response = await fetch(`/api/events/${selectedEvent.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationForm)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to register for event');
      }
      
      // If checkout URL exists, redirect the user
      if (data.checkoutUrl) {
        console.log('Redirecting to Shopify checkout:', data.checkoutUrl);
        // Use timeout to ensure toast is seen before redirect
        toast({
          title: "Registration successful!",
          description: "Redirecting to secure checkout...",
          duration: 3000
        });
        
        // Slight delay to ensure toast is visible before redirect
        setTimeout(() => {
          window.location.href = data.checkoutUrl;
        }, 1000);
      } else {
        // Otherwise show partial success message and info about the error
        console.warn('Registration saved but checkout failed:', data);
        
        // Check if we have specific Shopify error info
        const errorDetail = data.shopifyError 
          ? `Error: ${data.shopifyError}` 
          : 'The system could not generate a checkout link';
        
        toast({
          title: "Registration saved",
          description: `Your registration information was saved, but we couldn't create the checkout. ${errorDetail}. Please contact support.`,
          variant: "destructive",
          duration: 10000
        });
        
        setShowRegistrationDialog(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      // Reset form
      setRegistrationForm({
        firstName: "",
        lastName: "",
        contactName: "",
        email: "",
        phone: "",
        tShirtSize: "Large",
        grade: "",
        schoolName: "",
        clubName: "",
        medicalReleaseAccepted: false,
        registrationType: "full",
        day1: false,
        day2: false,
        day3: false
      });
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Events & Clinics | Rich Habits</title>
        <meta name="description" content="Sports clinics and training events for dedicated athletes. Improve your skills with expert coaching." />
      </Helmet>
      
      <div className="bg-white">
        {/* Events Section */}
        <section className="py-16">
          <Container>
            <div className="mb-12">
              <h2 className="text-5xl font-serif font-medium mb-6 group text-center tracking-wide">
                <AnimatedUnderline>
                  <span className="text-gray-300">UPCOMING EVENTS</span>
                </AnimatedUnderline>
              </h2>
              <p className="text-lg text-center mb-10">Register for our sports clinics and training events to take your skills to the next level.</p>
            </div>

            {/* Event Row 0: Texas Recruiting Clinic */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-24 relative"
            >
              {/* Animated Edge Top Left - Red */}
              <motion.div 
                className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                style={{ 
                  borderColor: '#bf0a30'
                }}
              />
              
              {/* Animated Edge Bottom Right - Blue */}
              <motion.div 
                className="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                style={{ 
                  borderColor: '#002868'
                }}
              />
              
              <div className="relative overflow-hidden bg-white shadow-lg rounded-sm p-6" style={{ 
                  border: '2px solid',
                  borderImageSlice: 1,
                  borderImageSource: 'linear-gradient(to right, #bf0a30, #ffffff, #002868)'
                }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="h-64 overflow-hidden rounded-sm relative">
                    {/* Using image as primary with optional video enhancement */}
                    <img 
                      src={events[0].image} 
                      alt={events[0].title} 
                      className="w-full h-full object-cover"
                    />
                    <video 
                      src={texasRecruitingVideo}
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      onError={handleVideoError}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 absolute top-0 left-0 opacity-0"
                      onCanPlay={(e) => {
                        // Only show video if it successfully loads
                        e.currentTarget.style.opacity = "1";
                      }}
                    ></video>
                  </div>
                  <div className="md:col-span-2">
                    <div className="mb-4">
                      <span className="inline-block text-xs font-medium px-3 py-1 rounded-sm" style={{
                        background: 'linear-gradient(90deg, #bf0a30, #002868)',
                        color: 'white'
                      }}>
                        {events[0].category}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold mb-3">
                      <span style={{ 
                        color: '#002868',
                        textShadow: '1px 1px 0 #bf0a30'
                      }}>
                        {events[0].title}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      <p className="text-sm text-gray-600"><strong>Date:</strong> {events[0].date}</p>
                      <p className="text-sm text-gray-600"><strong>Time:</strong> {events[0].time}</p>
                      <p className="text-sm text-gray-600"><strong>Location:</strong> {events[0].location}</p>
                      <p className="text-sm text-gray-600"><strong>Price:</strong> {events[0].price} <span className="line-through text-red-500 ml-1">{events[0].originalPrice}</span> <span className="text-xs bg-red-100 text-red-600 px-1 rounded ml-1">SALE</span></p>
                    </div>
                    <p className="text-gray-700 mb-6 font-medium text-base leading-relaxed">{events[0].description}</p>
                    <div className="flex space-x-4">
                      <a 
                        href={`/events/${events[0].id}`}
                        className="py-2 px-6 font-medium tracking-wide text-white inline-block rounded-sm"
                        style={{ background: '#002868' }}
                      >
                        View Details
                      </a>
                      <button 
                        onClick={() => handleRegister(events[0])}
                        className="border py-2 px-6 font-medium tracking-wide inline-block rounded-sm hover:bg-red-50 transition-colors"
                        style={{ borderColor: '#bf0a30', color: '#bf0a30' }}
                      >
                        Register Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Event Row 1: Cory Land Tour */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-24 relative"
            >
              {/* Animated Edge Top Left - Purple */}
              <motion.div 
                className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                style={{ 
                  borderColor: '#4B0082'
                }}
              />
              
              {/* Animated Edge Bottom Right - Gold */}
              <motion.div 
                className="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                style={{ 
                  borderColor: '#D4AF37'
                }}
              />
              
              <div className="relative overflow-hidden bg-white shadow-lg rounded-sm p-6 cory-border">
                {/* Add animated background elements */}
                <div className="cory-diamond-pattern"></div>
                <div className="cory-purple-wave"></div>
                <div className="cory-gold-wave"></div>
                <div className="cory-stripe"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="h-64 overflow-hidden rounded-sm relative">
                    {/* Using image as primary with optional video enhancement */}
                    <img 
                      src={events[1].image} 
                      alt={events[1].title} 
                      className="w-full h-full object-cover"
                    />
                    <video 
                      src={coryLandVideo}
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      onError={handleVideoError}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 absolute top-0 left-0 opacity-0"
                      onCanPlay={(e) => {
                        // Only show video if it successfully loads
                        e.currentTarget.style.opacity = "1";
                      }}
                    ></video>
                  </div>
                  <div className="md:col-span-2 relative z-10">
                    <div className="mb-4">
                      <span className="inline-block text-xs font-medium px-3 py-1 rounded-sm cory-gradient-btn text-white">
                        {events[1].category}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold mb-3 relative">
                      <span style={{ 
                        background: 'linear-gradient(to right, #4B0082, #8A2BE2)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textShadow: '0 0 1px rgba(212, 175, 55, 0.2)'
                      }}>
                        {events[1].title}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      <p className="text-sm text-gray-600"><strong>Date:</strong> {events[1].date}</p>
                      <p className="text-sm text-gray-600"><strong>Time:</strong> {events[1].time}</p>
                      <p className="text-sm text-gray-600"><strong>Price:</strong> {events[1].price} <span className="line-through text-red-500 ml-1">{events[1].originalPrice}</span> <span className="text-xs bg-purple-100 text-purple-600 px-1 rounded ml-1">ALL DAYS: $200</span></p>
                    </div>
                    <p className="text-gray-700 mb-6 font-medium text-base leading-relaxed">{events[1].description}</p>
                    
                    {/* Location details */}
                    <div className="mb-6 pl-2 border-l-2 border-purple-600">
                      {events[1].locations?.map((loc, idx) => (
                        <p key={idx} className="text-sm text-gray-700 mb-1"><strong>{loc.day}:</strong> {loc.location}</p>
                      ))}
                    </div>
                    
                    <div className="flex space-x-4">
                      <a 
                        href={`/events/${events[1].id}`}
                        className="cory-gradient-btn text-white py-2 px-6 font-medium tracking-wide inline-block rounded-sm"
                      >
                        View Details
                      </a>
                      <button 
                        onClick={() => handleRegister(events[1])}
                        className="cory-outline-btn py-2 px-6 font-medium tracking-wide inline-block rounded-sm"
                      >
                        Register Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Event Row 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-24 relative"
            >
              {/* Animated Edge Top Left - Red */}
              <motion.div 
                className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                style={{ 
                  borderColor: '#bf0a30'
                }}
              />
              
              {/* Animated Edge Bottom Right - Blue */}
              <motion.div 
                className="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                style={{ 
                  borderColor: '#002868'
                }}
              />
            </motion.div>
            
            {/* Event Row 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="mb-24 relative"
            >
              {/* Animated Edge Top Right */}
              <motion.div 
                className="absolute -top-3 -right-3 w-12 h-12 border-t-2 border-r-2 border-[#041e42] z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              />
              
              {/* Animated Edge Bottom Left */}
              <motion.div 
                className="absolute -bottom-3 -left-3 w-12 h-12 border-b-2 border-l-2 border-[#1e88e5] z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
              />
              
              <div className="relative overflow-hidden bg-white shadow-lg rounded-sm p-6 fire-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="h-64 overflow-hidden rounded-sm relative">
                    <video 
                      src={birminghamVideo}
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      onError={handleVideoError}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      style={{ position: "absolute", top: 0, left: 0 }}
                    ></video>
                    {/* Use overlay image as fallback */}
                    <div className="absolute inset-0 z-0">
                      <img 
                        src={events[2].image} 
                        alt={events[2].title} 
                        className="w-full h-full object-cover opacity-0 video-fallback"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="mb-4">
                      <span className="inline-block text-xs font-medium px-3 py-1 rounded-sm fire-gradient-btn text-white">
                        {events[2].category}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold mb-3 fire-title">
                      <span style={{ 
                        color: 'white', 
                        fontWeight: 800, 
                        letterSpacing: '0.08em',
                        textShadow: '0 0 5px rgba(255, 160, 100, 0.5)'
                      }}>BIRMINGHAM</span> SLAM CAMP
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      <p className="text-sm text-gray-600"><strong>Date:</strong> {events[2].date}</p>
                      <p className="text-sm text-gray-600"><strong>Time:</strong> {events[2].time}</p>
                      <p className="text-sm text-gray-600"><strong>Location:</strong> {events[2].location}</p>
                      <p className="text-sm text-gray-600"><strong>Price:</strong> {events[2].price}</p>
                    </div>
                    <p className="text-gray-700 mb-6 font-medium text-base leading-relaxed">{events[2].description}</p>
                    <div className="flex space-x-4">
                      <a 
                        href={`/events/${events[2].id}`}
                        className="fire-gradient-btn text-white py-2 px-6 font-medium tracking-wide inline-block rounded-sm"
                      >
                        View Details
                      </a>
                      <button 
                        onClick={() => handleRegister(events[2])}
                        className="fire-outline-btn py-2 px-6 font-medium tracking-wide inline-block rounded-sm"
                      >
                        Register Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Event Row 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="mb-16 relative"
            >
              {/* Animated Edge Top Left */}
              <motion.div 
                className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 border-[#041e42] z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              />
              
              {/* Animated Edge Top Right */}
              <motion.div 
                className="absolute -top-3 -right-3 w-12 h-12 border-t-2 border-r-2 border-[#041e42] z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
              />
              
              {/* Animated Edge Bottom Left */}
              <motion.div 
                className="absolute -bottom-3 -left-3 w-12 h-12 border-b-2 border-l-2 border-[#1e88e5] z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              />
              
              {/* Animated Edge Bottom Right */}
              <motion.div 
                className="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 border-[#1e88e5] z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                viewport={{ once: true }}
              />
              
              <div className="relative overflow-hidden bg-white border-2 border-[#041e42] shadow-lg rounded-sm p-6" style={{ boxShadow: '0 0 20px rgba(30, 136, 229, 0.15)' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="h-64 overflow-hidden rounded-sm relative">
                    <video
                      src={champCampVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      onError={handleVideoError}
                      className="w-full h-full object-cover absolute inset-0"
                      style={{ filter: 'brightness(1.1) contrast(1.1)' }}
                    ></video>
                    {/* Use overlay image as fallback */}
                    <div className="absolute inset-0 z-0">
                      <img 
                        src={events[3].image} 
                        alt={events[3].title} 
                        className="w-full h-full object-cover opacity-0 video-fallback"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="mb-4">
                      <span className="inline-block bg-[#041e42]/10 text-[#041e42] text-xs font-medium px-3 py-1 rounded-sm">
                        {events[3].category}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold mb-3" style={{ background: 'linear-gradient(to right, #041e42, #1e88e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {events[3].title}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      <p className="text-sm text-gray-600"><strong>Date:</strong> {events[3].date}</p>
                      <p className="text-sm text-gray-600"><strong>Time:</strong> {events[3].time}</p>
                      <p className="text-sm text-gray-600"><strong>Location:</strong> {events[3].location}</p>
                      <p className="text-sm text-gray-600"><strong>Price:</strong> {events[3].price}</p>
                    </div>
                    <p className="text-gray-700 mb-6">{events[3].description}</p>
                    <div className="flex space-x-4">
                      <a 
                        href={`/events/${events[3].id}`}
                        className="bg-[#041e42] text-white py-2 px-6 font-medium tracking-wide hover:bg-[#0c2a5c] transition-colors inline-block rounded-sm"
                      >
                        View Details
                      </a>
                      <button 
                        onClick={() => handleRegister(events[3])}
                        className="border border-[#041e42] text-[#041e42] py-2 px-6 font-medium tracking-wide hover:bg-[#e6f2ff] transition-colors inline-block rounded-sm"
                      >
                        Register Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Container>
        </section>
        

      </div>
      
      {/* Registration Dialog */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register for {selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              Fill out the form below to register for this event. Payment will be processed through our secure checkout.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitRegistration} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={registrationForm.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={registrationForm.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactName">Parent/Guardian Name</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  value={registrationForm.contactName}
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
                <Label htmlFor="tShirtSize">T-Shirt Size</Label>
                <Select 
                  name="tShirtSize" 
                  defaultValue={registrationForm.tShirtSize}
                  onValueChange={(value) => {
                    setRegistrationForm(prev => ({
                      ...prev,
                      tShirtSize: value
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a t-shirt size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Youth S">Youth Small</SelectItem>
                    <SelectItem value="Youth M">Youth Medium</SelectItem>
                    <SelectItem value="Youth L">Youth Large</SelectItem>
                    <SelectItem value="Adult XS">Adult XS</SelectItem>
                    <SelectItem value="Adult S">Adult Small</SelectItem>
                    <SelectItem value="Adult M">Adult Medium</SelectItem>
                    <SelectItem value="Adult L">Adult Large</SelectItem>
                    <SelectItem value="Adult XL">Adult XL</SelectItem>
                    <SelectItem value="Adult 2XL">Adult 2XL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="grade">Current Grade</Label>
                <Input
                  id="grade"
                  name="grade"
                  value={registrationForm.grade}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  name="schoolName"
                  value={registrationForm.schoolName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="clubName">Club Name (optional)</Label>
                <Input
                  id="clubName"
                  name="clubName"
                  value={registrationForm.clubName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="registrationType">Registration Type</Label>
                <Select 
                  name="registrationType" 
                  defaultValue={registrationForm.registrationType}
                  onValueChange={(value) => {
                    setRegistrationForm(prev => ({
                      ...prev,
                      registrationType: value
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select registration type" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedEvent?.id === 4 ? (
                      <>
                        <SelectItem value="full">All Days ($200)</SelectItem>
                        <SelectItem value="single">Individual Days ($99 each)</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="full">Full Camp ($249)</SelectItem>
                        <SelectItem value="single">Single Day ($149)</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Day selection for Cory Land Tour */}
              {selectedEvent?.id === 4 && (
                <div className="md:col-span-2 space-y-3 mt-2 p-3 bg-purple-50 rounded-md">
                  <Label>Select Camp Days (Cory Land Tour)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
                    {events[1]?.locations?.map((loc, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`day${idx+1}`} 
                          checked={registrationForm[`day${idx+1}` as keyof typeof registrationForm] as boolean}
                          onCheckedChange={(checked) => {
                            setRegistrationForm(prev => ({
                              ...prev,
                              [`day${idx+1}`]: checked
                            }));
                          }} 
                        />
                        <Label 
                          htmlFor={`day${idx+1}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {loc.day} ({loc.location})
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    {registrationForm.registrationType === 'full' ? 
                      'Full camp includes all days for $200 (save $97!)' : 
                      'Select one or more days ($99 each)'}
                  </p>
                </div>
              )}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="medicalReleaseAccepted"
                    checked={registrationForm.medicalReleaseAccepted}
                    onCheckedChange={(checked) => {
                      setRegistrationForm(prev => ({
                        ...prev,
                        medicalReleaseAccepted: checked === true
                      }));
                    }}
                    required
                  />
                  <Label 
                    htmlFor="medicalReleaseAccepted" 
                    className="text-sm leading-tight cursor-pointer"
                  >
                    I acknowledge that my child is in good health and able to participate in the activities. 
                    I accept all responsibility for my child's health and safety and waive any liability against Rich Habits.
                  </Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Processing</span>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </>
                ) : (
                  "Proceed to Payment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}