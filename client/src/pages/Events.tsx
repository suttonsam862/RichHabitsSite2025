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
    image: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
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
    image: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
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
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
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
        {/* Hero Section */}
        <section className="relative h-[50vh] flex items-center">
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="https://images.unsplash.com/photo-1547941126-3d5322b218b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80" 
              alt="Sports clinic" 
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>
          
          <Container className="relative z-10 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl font-serif font-bold mb-4">Events & Clinics</h1>
              <p className="text-xl">Elite training opportunities for dedicated athletes.</p>
            </motion.div>
          </Container>
        </section>
        
        {/* Events Calendar Section */}
        <section className="py-16">
          <Container>
            <div className="mb-12">
              <h2 className="text-3xl font-serif font-semibold mb-6 group">
                <AnimatedUnderline>
                  Upcoming Events
                </AnimatedUnderline>
              </h2>
              <p className="text-lg">Register for our sports clinics and training events to take your skills to the next level.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="event-card bg-white border border-[hsl(var(--shadow))]"
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <span className={`inline-block ${event.categoryClass} text-xs font-medium px-3 py-1`}>
                        {event.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-medium mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">{event.date}</p>
                    <p className="text-sm text-gray-600 mb-1">{event.time}</p>
                    <p className="text-sm text-gray-600 mb-4">{event.location}</p>
                    <p className="text-gray-700 mb-4">{event.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-primary font-medium">{event.price}</span>
                      <button 
                        onClick={() => handleRegister(event)}
                        className="text-sm font-medium underline hover:text-[hsl(var(--accent))]"
                      >
                        Register Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
