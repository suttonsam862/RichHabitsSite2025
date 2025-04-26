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
import event1Image from "../assets/events/event1.png";
import event2Image from "../assets/events/cenzo.png";
import event3Image from "../assets/events/event3.png";
import birminghamVideo from "@assets/0424.mov";
import champCampVideo from "@assets/04243.mov";

// Static events data
const events = [
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
  },
  {
    id: 3,
    title: "RICH HABITS RECRUITING CLINIC",
    category: "Wrestling",
    categoryClass: "bg-[hsl(var(--accent3)_/_0.1)] text-[hsl(var(--accent3))]",
    date: "August 15th-16th, 2025",
    time: "10:00 AM - 5:00 PM",
    location: "Arlington, TX",
    description: "A unique clinic designed specifically for high school wrestlers seeking collegiate opportunities. Features skill development sessions with college coaches, recruiting workshops, and professional video profiling to enhance recruitment portfolios.",
    price: "$195",
    image: event3Image
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
                  <span className="fire-title">UPCOMING EVENTS</span>
                </AnimatedUnderline>
              </h2>
              <p className="text-lg text-center mb-10">Register for our sports clinics and training events to take your skills to the next level.</p>
            </div>
            
            {/* Event Row 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-24 relative"
            >
              {/* Animated Edge Top Left */}
              <motion.div 
                className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 border-[#ff4e00] z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                style={{ 
                  borderImage: 'var(--fire-border-gradient) 1',
                  borderImageSlice: 1
                }}
              />
              
              {/* Animated Edge Bottom Right */}
              <motion.div 
                className="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 border-[#ffc400] z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                style={{ 
                  borderImage: 'var(--fire-border-gradient) 1',
                  borderImageSlice: 1
                }}
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
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      style={{ position: "absolute", top: 0, left: 0 }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="mb-4">
                      <span className="inline-block text-xs font-medium px-3 py-1 rounded-sm fire-gradient-btn text-white">
                        {events[0].category}
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
                      <p className="text-sm text-gray-600"><strong>Date:</strong> {events[0].date}</p>
                      <p className="text-sm text-gray-600"><strong>Time:</strong> {events[0].time}</p>
                      <p className="text-sm text-gray-600"><strong>Location:</strong> {events[0].location}</p>
                      <p className="text-sm text-gray-600"><strong>Price:</strong> {events[0].price}</p>
                    </div>
                    <p className="text-gray-700 mb-6 font-medium text-base leading-relaxed">{events[0].description}</p>
                    <div className="flex space-x-4">
                      <a 
                        href={`/events/${events[0].id}`}
                        className="fire-gradient-btn text-white py-2 px-6 font-medium tracking-wide inline-block rounded-sm"
                      >
                        View Details
                      </a>
                      <button 
                        onClick={() => handleRegister(events[0])}
                        className="fire-outline-btn py-2 px-6 font-medium tracking-wide inline-block rounded-sm"
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
              
              <div className="relative overflow-hidden bg-white border-2 border-[#041e42] shadow-lg rounded-sm p-6" style={{ boxShadow: '0 0 20px rgba(30, 136, 229, 0.15)' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="h-64 overflow-hidden rounded-sm order-1 md:order-2 relative">
                    <video
                      src={champCampVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover absolute inset-0"
                      style={{ filter: 'brightness(1.1) contrast(1.1)' }}
                    >
                      <img 
                        src={events[1].image} 
                        alt={events[1].title} 
                        className="w-full h-full object-cover"
                      />
                    </video>
                  </div>
                  <div className="md:col-span-2 order-2 md:order-1">
                    <div className="mb-4">
                      <span className="inline-block bg-[#041e42]/10 text-[#041e42] text-xs font-medium px-3 py-1 rounded-sm">
                        {events[1].category}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold mb-3" style={{ background: 'linear-gradient(to right, #041e42, #1e88e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {events[1].title}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      <p className="text-sm text-gray-600"><strong>Date:</strong> {events[1].date}</p>
                      <p className="text-sm text-gray-600"><strong>Time:</strong> {events[1].time}</p>
                      <p className="text-sm text-gray-600"><strong>Location:</strong> {events[1].location}</p>
                      <p className="text-sm text-gray-600"><strong>Price:</strong> {events[1].price}</p>
                    </div>
                    <p className="text-gray-700 mb-6">{events[1].description}</p>
                    <div className="flex space-x-4">
                      <a 
                        href={`/events/${events[1].id}`}
                        className="bg-[#041e42] text-white py-2 px-6 font-medium tracking-wide hover:bg-[#0c2a5c] transition-colors inline-block rounded-sm"
                      >
                        View Details
                      </a>
                      <button 
                        onClick={() => handleRegister(events[1])}
                        className="border border-[#041e42] text-[#041e42] py-2 px-6 font-medium tracking-wide hover:bg-[#e6f2ff] transition-colors inline-block rounded-sm"
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
              {/* Animated Edge Top Left and Top Right */}
              <motion.div 
                className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 border-[hsl(var(--accent3))] z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              />
              
              <motion.div 
                className="absolute -top-3 -right-3 w-12 h-12 border-t-2 border-r-2 border-[hsl(var(--accent3))] z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
              />
              
              {/* Animated Edge Bottom Left and Bottom Right */}
              <motion.div 
                className="absolute -bottom-3 -left-3 w-12 h-12 border-b-2 border-l-2 border-[hsl(var(--accent3))] z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              />
              
              <motion.div 
                className="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 border-[hsl(var(--accent3))] z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                viewport={{ once: true }}
              />
              
              <div className="relative overflow-hidden bg-white shadow-lg rounded-sm p-6" style={{ 
                  border: '2px solid',
                  borderImageSlice: 1,
                  borderImageSource: 'linear-gradient(to right, #bf0a30, #ffffff, #002868)'
                }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="h-64 overflow-hidden rounded-sm">
                    <video 
                      src="/src/assets/videos/0424.mov"
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="mb-4">
                      <span className="inline-block text-xs font-medium px-3 py-1 rounded-sm" style={{
                        background: 'linear-gradient(90deg, #bf0a30, #002868)',
                        color: 'white'
                      }}>
                        {events[2].category}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold mb-3">
                      <span style={{ 
                        color: '#002868',
                        textShadow: '1px 1px 0 #bf0a30'
                      }}>
                        {events[2].title}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      <p className="text-sm text-gray-600"><strong>Date:</strong> June 12th-13th, 2025</p>
                      <p className="text-sm text-gray-600"><strong>Time:</strong> {events[2].time}</p>
                      <p className="text-sm text-gray-600"><strong>Location:</strong> Arlington Martin High School</p>
                      <p className="text-sm text-gray-600"><strong>Price:</strong> {events[2].price}</p>
                    </div>
                    <p className="text-gray-700 mb-6">{events[2].description}</p>
                    <div className="flex space-x-4">
                      <a 
                        href={`/events/${events[2].id}`}
                        className="text-white py-2 px-6 font-medium tracking-wide hover:bg-opacity-90 transition-colors inline-block rounded-sm"
                        style={{ background: '#002868' }}
                      >
                        View Details
                      </a>
                      <button 
                        onClick={() => handleRegister(events[2])}
                        className="border py-2 px-6 font-medium tracking-wide transition-colors inline-block rounded-sm"
                        style={{ borderColor: '#bf0a30', color: '#bf0a30', ':hover': { backgroundColor: 'rgba(191, 10, 48, 0.1)' } }}
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
        
        {/* Past Events Gallery Section */}
        <section className="py-16 bg-[hsl(var(--secondary))]">
          <Container>
            <div className="mb-12">
              <h2 className="text-3xl font-serif font-semibold mb-6 group">
                <AnimatedUnderline>
                  Past Events Gallery
                </AnimatedUnderline>
              </h2>
              <p className="text-lg">Take a look at our previous clinics and training events.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="aspect-square"
              >
                <img 
                  src="https://images.unsplash.com/photo-1526232761682-d26e03ac148e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Basketball clinic" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="aspect-square"
              >
                <img 
                  src="https://images.unsplash.com/photo-1560089000-7433a4ebbd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Soccer training" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="aspect-square"
              >
                <img 
                  src="https://images.unsplash.com/photo-1515523110800-9415d13b84a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Football camp" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="aspect-square"
              >
                <img 
                  src="https://images.unsplash.com/photo-1521412644187-c49fa049e84d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Track meet" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </Container>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16">
          <Container>
            <div className="mb-12">
              <h2 className="text-3xl font-serif font-semibold mb-6 group text-center">
                <AnimatedUnderline>
                  Testimonials
                </AnimatedUnderline>
              </h2>
              <p className="text-lg text-center">Hear what participants have to say about our events.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white p-6 shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[hsl(var(--secondary))] rounded-full flex items-center justify-center mr-4">
                    <span className="text-lg font-medium">JD</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Ryan Thompson</h4>
                    <p className="text-sm text-gray-600">High School Wrestler, 152lbs</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"The Birmingham Slam Camp transformed my wrestling. Coach Valencia's techniques completely changed my approach to the sport. I'm more confident and technically sound on the mat."</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 shadow-md"
                style={{ border: '1px solid #041e42', boxShadow: '0 2px 10px rgba(30, 136, 229, 0.15)' }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#041e42] text-white rounded-full flex items-center justify-center mr-4">
                    <span className="text-lg font-medium">MC</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Mike Chen</h4>
                    <p className="text-sm text-gray-600">College Wrestler, Arizona State</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"The National Champ Camp in Las Vegas was a game-changer. Training with Olympic-level coaches gave me insights I couldn't get anywhere else. My neutral position has improved tremendously."</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-6 shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[hsl(var(--secondary))] rounded-full flex items-center justify-center mr-4">
                    <span className="text-lg font-medium">TJ</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Jennifer Baker</h4>
                    <p className="text-sm text-gray-600">Parent of High School Wrestler</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"The Rich Habits Recruiting Clinic in Arlington was worth every penny. My son connected with three college coaches who are now actively recruiting him. The video profile they created was professional and impressive."</p>
              </motion.div>
            </div>
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