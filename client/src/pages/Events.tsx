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

// Import event images and videos
// Use public path references for consistent loading
const event1Image = "/assets/events/SlamCampSiteBanner.png";
const event2Image = "/assets/events/LongSitePhotovegas.png";
const event3Image = "/assets/events/RecruitingWebsiteimage4.png";
const event4Image = "/assets/events/image_1745720198123.png"; // Placeholder until specific graphic is created
const birminghamVideo = "/assets/0424.mov";
const champCampVideo = "/assets/04243.mov";
const texasRecruitingVideo = "/assets/trcvid.mov";
const coryLandVideo = "/assets/slamcamp.mov"; // Placeholder until specific video is created

// Static events data
const events = [
  {
    id: 4,
    title: "CORY LAND TOUR",
    category: "Wrestling",
    categoryClass: "bg-[#4B0082]/10 text-[#4B0082]",
    date: "May 15th-17th, 2025",
    time: "9:00 AM - 3:00 PM",
    location: "Multiple locations in Alabama",
    description: "Join Northern Iowa standout Cory Land and his teammates Wyatt Voelker, Trever Anderson, and Garrett Funk for this unique 3-day clinic tour across Alabama. Each day features a new location with intensive technique training, live wrestling, and personalized coaching from these collegiate athletes.",
    price: "$199",
    originalPrice: "$249",
    image: event4Image
  },
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
    name: "",
    email: "",
    phone: "",
    age: "",
    experience: ""
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
    setSelectedEvent(event);
    setShowRegistrationDialog(true);
  };

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
      description: `You've registered for ${selectedEvent.title}. Check your email for confirmation.`,
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

            {/* Cory Land Tour - Event Row 0 */}
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
                    <video 
                      src={coryLandVideo}
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
                        src={events[0].image} 
                        alt={events[0].title} 
                        className="w-full h-full object-cover opacity-0 video-fallback"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 relative z-10">
                    <div className="mb-4">
                      <span className="inline-block text-xs font-medium px-3 py-1 rounded-sm cory-gradient-btn text-white">
                        {events[0].category}
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
                        {events[0].title}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      <p className="text-sm text-gray-600"><strong>Date:</strong> {events[0].date}</p>
                      <p className="text-sm text-gray-600"><strong>Time:</strong> {events[0].time}</p>
                      <p className="text-sm text-gray-600"><strong>Location:</strong> {events[0].location}</p>
                      <p className="text-sm text-gray-600"><strong>Price:</strong> {events[0].price} <span className="line-through text-red-500 ml-1">{events[0].originalPrice}</span> <span className="text-xs bg-purple-100 text-purple-600 px-1 rounded ml-1">EARLY BIRD</span></p>
                    </div>
                    <p className="text-gray-700 mb-6 font-medium text-base leading-relaxed">{events[0].description}</p>
                    <div className="flex space-x-4">
                      <a 
                        href={`/events/${events[0].id}`}
                        className="cory-gradient-btn text-white py-2 px-6 font-medium tracking-wide inline-block rounded-sm"
                      >
                        View Details
                      </a>
                      <button 
                        onClick={() => handleRegister(events[0])}
                        className="cory-outline-btn py-2 px-6 font-medium tracking-wide inline-block rounded-sm"
                      >
                        Register Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Event Row 1 */}
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
                    <video 
                      src={texasRecruitingVideo}
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
                        src={events[1].image} 
                        alt={events[1].title} 
                        className="w-full h-full object-cover opacity-0 video-fallback"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="mb-4">
                      <span className="inline-block text-xs font-medium px-3 py-1 rounded-sm" style={{
                        background: 'linear-gradient(90deg, #bf0a30, #002868)',
                        color: 'white'
                      }}>
                        {events[1].category}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold mb-3">
                      <span style={{ 
                        color: '#002868',
                        textShadow: '1px 1px 0 #bf0a30'
                      }}>
                        {events[1].title}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      <p className="text-sm text-gray-600"><strong>Date:</strong> {events[1].date}</p>
                      <p className="text-sm text-gray-600"><strong>Time:</strong> {events[1].time}</p>
                      <p className="text-sm text-gray-600"><strong>Location:</strong> {events[1].location}</p>
                      <p className="text-sm text-gray-600"><strong>Price:</strong> {events[1].price} <span className="line-through text-red-500 ml-1">{events[1].originalPrice}</span> <span className="text-xs bg-red-100 text-red-600 px-1 rounded ml-1">SALE</span></p>
                    </div>
                    <p className="text-gray-700 mb-6 font-medium text-base leading-relaxed">A unique clinic designed specifically for high school wrestlers seeking collegiate opportunities. Features skill development sessions with college coaches, recruiting workshops, professional video profiling, and low scale competition to enhance recruitment portfolios.</p>
                    <div className="flex space-x-4">
                      <a 
                        href={`/events/${events[1].id}`}
                        className="py-2 px-6 font-medium tracking-wide text-white inline-block rounded-sm"
                        style={{ background: '#002868' }}
                      >
                        View Details
                      </a>
                      <button 
                        onClick={() => handleRegister(events[1])}
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Register for {selectedEvent?.title}</DialogTitle>
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