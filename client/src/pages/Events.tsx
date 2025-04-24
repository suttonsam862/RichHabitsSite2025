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

// Import event images
import event1Image from "../assets/events/event1.jpg";
import event2Image from "../assets/events/event2.jpg";
import event3Image from "../assets/events/event3.jpg";

// Static events data
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
    price: "$89.00",
    image: event1Image
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
    price: "$125.00",
    image: event2Image
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
    price: "$45.00",
    image: event3Image
  },
  {
    id: 4,
    title: "Volleyball Skills Clinic",
    category: "Volleyball",
    categoryClass: "bg-[hsl(var(--accent)_/_0.1)] text-[hsl(var(--accent))]",
    date: "November 5, 2023",
    time: "9:00 AM - 4:00 PM",
    location: "Central High School Gymnasium",
    description: "Comprehensive skills development for intermediate to advanced volleyball players. Focus on serving, passing, setting, hitting, and defensive techniques.",
    price: "$95.00",
    image: "https://images.unsplash.com/photo-1576171482655-5134264394b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 5,
    title: "Winter Basketball League",
    category: "Basketball",
    categoryClass: "bg-[hsl(var(--accent)_/_0.1)] text-[hsl(var(--accent))]",
    date: "December 10, 2023 - February 25, 2024",
    time: "Games on Saturdays",
    location: "Regional Sports Center",
    description: "Competitive basketball league for high school players looking to stay sharp during the off-season. Teams will play 10 regular season games plus playoffs.",
    price: "$250 per team",
    image: "https://images.unsplash.com/photo-1518650868927-5d1f17c7de7f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 6,
    title: "Track & Field Fundamentals",
    category: "Track",
    categoryClass: "bg-[hsl(var(--accent3)_/_0.1)] text-[hsl(var(--accent3))]",
    date: "January 15, 2024",
    time: "10:00 AM - 3:00 PM",
    location: "University Indoor Track Facility",
    description: "Introduction to track and field events with specialized coaching for sprints, jumps, and throws. Perfect for beginners looking to explore the sport.",
    price: "$75.00",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
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
              <h2 className="text-4xl font-serif font-semibold mb-6 group text-center">
                <AnimatedUnderline>
                  Upcoming Events
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
                className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 border-[hsl(var(--accent))] z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              />
              
              {/* Animated Edge Bottom Right */}
              <motion.div 
                className="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 border-[hsl(var(--accent))] z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              />
              
              <div className="relative overflow-hidden bg-white border border-[hsl(var(--shadow))] shadow-lg rounded-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="h-64 overflow-hidden rounded-sm">
                    <img 
                      src={events[0].image} 
                      alt={events[0].title} 
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="mb-4">
                      <span className={`inline-block ${events[0].categoryClass} text-xs font-medium px-3 py-1 rounded-sm`}>
                        {events[0].category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-medium mb-3">{events[0].title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      <p className="text-sm text-gray-600"><strong>Date:</strong> {events[0].date}</p>
                      <p className="text-sm text-gray-600"><strong>Time:</strong> {events[0].time}</p>
                      <p className="text-sm text-gray-600"><strong>Location:</strong> {events[0].location}</p>
                      <p className="text-sm text-gray-600"><strong>Price:</strong> {events[0].price}</p>
                    </div>
                    <p className="text-gray-700 mb-6">{events[0].description}</p>
                    <div className="flex space-x-4">
                      <a 
                        href={`/event/${events[0].id}`}
                        className="bg-[hsl(var(--accent))] text-white py-2 px-6 font-medium tracking-wide hover:bg-opacity-90 transition-colors inline-block rounded-sm"
                      >
                        View Details
                      </a>
                      <button 
                        onClick={() => handleRegister(events[0])}
                        className="border border-[hsl(var(--accent))] text-[hsl(var(--accent))] py-2 px-6 font-medium tracking-wide hover:bg-[hsl(var(--accent)_/_0.1)] transition-colors inline-block rounded-sm"
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
                className="absolute -top-3 -right-3 w-12 h-12 border-t-2 border-r-2 border-[hsl(var(--accent2))] z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              />
              
              {/* Animated Edge Bottom Left */}
              <motion.div 
                className="absolute -bottom-3 -left-3 w-12 h-12 border-b-2 border-l-2 border-[hsl(var(--accent2))] z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
              />
              
              <div className="relative overflow-hidden bg-white border border-[hsl(var(--shadow))] shadow-lg rounded-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="h-64 overflow-hidden rounded-sm order-1 md:order-2">
                    <img 
                      src={events[1].image} 
                      alt={events[1].title} 
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="md:col-span-2 order-2 md:order-1">
                    <div className="mb-4">
                      <span className={`inline-block ${events[1].categoryClass} text-xs font-medium px-3 py-1 rounded-sm`}>
                        {events[1].category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-medium mb-3">{events[1].title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      <p className="text-sm text-gray-600"><strong>Date:</strong> {events[1].date}</p>
                      <p className="text-sm text-gray-600"><strong>Time:</strong> {events[1].time}</p>
                      <p className="text-sm text-gray-600"><strong>Location:</strong> {events[1].location}</p>
                      <p className="text-sm text-gray-600"><strong>Price:</strong> {events[1].price}</p>
                    </div>
                    <p className="text-gray-700 mb-6">{events[1].description}</p>
                    <div className="flex space-x-4">
                      <a 
                        href={`/event/${events[1].id}`}
                        className="bg-[hsl(var(--accent2))] text-white py-2 px-6 font-medium tracking-wide hover:bg-opacity-90 transition-colors inline-block rounded-sm"
                      >
                        View Details
                      </a>
                      <button 
                        onClick={() => handleRegister(events[1])}
                        className="border border-[hsl(var(--accent2))] text-[hsl(var(--accent2))] py-2 px-6 font-medium tracking-wide hover:bg-[hsl(var(--accent2)_/_0.1)] transition-colors inline-block rounded-sm"
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
              
              <div className="relative overflow-hidden bg-white border border-[hsl(var(--shadow))] shadow-lg rounded-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="h-64 overflow-hidden rounded-sm">
                    <img 
                      src={events[2].image} 
                      alt={events[2].title} 
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="mb-4">
                      <span className={`inline-block ${events[2].categoryClass} text-xs font-medium px-3 py-1 rounded-sm`}>
                        {events[2].category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-medium mb-3">{events[2].title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      <p className="text-sm text-gray-600"><strong>Date:</strong> {events[2].date}</p>
                      <p className="text-sm text-gray-600"><strong>Time:</strong> {events[2].time}</p>
                      <p className="text-sm text-gray-600"><strong>Location:</strong> {events[2].location}</p>
                      <p className="text-sm text-gray-600"><strong>Price:</strong> {events[2].price}</p>
                    </div>
                    <p className="text-gray-700 mb-6">{events[2].description}</p>
                    <div className="flex space-x-4">
                      <a 
                        href={`/event/${events[2].id}`}
                        className="bg-[hsl(var(--accent3))] text-white py-2 px-6 font-medium tracking-wide hover:bg-opacity-90 transition-colors inline-block rounded-sm"
                      >
                        View Details
                      </a>
                      <button 
                        onClick={() => handleRegister(events[2])}
                        className="border border-[hsl(var(--accent3))] text-[hsl(var(--accent3))] py-2 px-6 font-medium tracking-wide hover:bg-[hsl(var(--accent3)_/_0.1)] transition-colors inline-block rounded-sm"
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
                    <h4 className="font-medium">Jason Davis</h4>
                    <p className="text-sm text-gray-600">High School Point Guard</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"The Elite Point Guard Clinic was exactly what I needed to elevate my game. The coaches provided personalized feedback that I've been able to apply immediately."</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[hsl(var(--secondary))] rounded-full flex items-center justify-center mr-4">
                    <span className="text-lg font-medium">SM</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Sarah Martinez</h4>
                    <p className="text-sm text-gray-600">College Soccer Player</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"The Speed & Agility Camp helped me improve my first-step quickness significantly. I'm much more explosive on the field now and my coaches have noticed."</p>
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
                    <h4 className="font-medium">Tom Johnson</h4>
                    <p className="text-sm text-gray-600">Parent of High School Athlete</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"The College Recruiting Workshop provided invaluable information about the recruitment process. My son now has a clear roadmap for pursuing collegiate athletics."</p>
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