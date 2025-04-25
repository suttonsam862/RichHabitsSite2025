import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { Container } from '@/components/ui/container';
import { FruitHuntersCompact } from '@/components/home/FruitHuntersCompact';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Event data comes from the API

export default function EventDetail() {
  const [location] = useLocation();
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    firstName: '',
    lastName: '',
    contactName: '',
    email: '',
    phone: '',
    tShirtSize: '',
    grade: '',
    schoolName: '',
    clubName: '',
    medicalReleaseAccepted: false,
    registrationType: 'full', // 'full' or 'single'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Extract the event ID from the URL
  const eventId = parseInt(location.split('/').pop() || "0", 10);
  
  // State for loading event data
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch event data from API
  useEffect(() => {
    async function fetchEvent() {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Event not found');
          } else {
            throw new Error('Failed to fetch event data');
          }
          return;
        }
        
        const data = await response.json();
        
        // For the demo, add in coach data which would normally come from the API
        if (data.id === 1) {
          data.coaches = [
            {
              name: "Zahid Valencia",
              title: "2x NCAA Champion",
              image: "/src/assets/coaches/VALENCIA_Zahid-headshot.jpg",
              bio: "Zahid Valencia is a 2x NCAA Champion, 3x Pac-12 Champion, and 3x All-American for Arizona State University. Known for his explosive offense and innovative techniques, Zahid brings world-class expertise to the mat."
            },
            {
              name: "Josh Shields",
              title: "NCAA All-American",
              image: "/src/assets/coaches/josh_shields.jpg",
              bio: "Josh Shields is a 2x All-American from Arizona State University and current professional wrestler. His technical approach and strategic mind make him one of the most respected coaches on the circuit."
            },
            {
              name: "Brandon Courtney",
              title: "NCAA Finalist",
              image: "/src/assets/coaches/brandon_courtney.webp",
              bio: "Brandon Courtney is an NCAA Finalist and 2x All-American from Arizona State University. A specialist in lightweight technique and speed development, Brandon brings unique insights into creating and exploiting advantages on the mat."
            },
            {
              name: "Michael McGee",
              title: "NCAA All-American",
              image: "/src/assets/coaches/Michael_McGee_JouQS.jpg",
              bio: "Michael McGee is an NCAA All-American from the University of North Carolina and Arizona State University. A technique specialist and mental performance coach, Michael focuses on combining physical skills with mental toughness."
            }
          ];
        } else if (data.id === 2) {
          data.coaches = [
            {
              name: "Vincenzo Joseph",
              title: "2x NCAA Champion",
              image: "/src/assets/coaches/cenzo.png",
              bio: "Vincenzo 'Cenzo' Joseph is a 2x NCAA Champion from Penn State University. Known for his creativity and unorthodox style, Cenzo revolutionized the sport with his dynamic approach to wrestling."
            },
            {
              name: "Nick Lee",
              title: "NCAA Champion",
              image: "https://intermatwrestle.com/Images/Persons/20190313142121_NIck%20Lee%20PSU%20vs%20OSU%203-31-18%202233%20Tony%20Rotundo.jpg",
              bio: "Nick Lee is an NCAA Champion and 4x All-American from Penn State University. His disciplined approach to wrestling and meticulous attention to detail have made him one of the most consistent performers in NCAA history."
            },
            {
              name: "Jason Nolf",
              title: "3x NCAA Champion",
              image: "https://intermatwrestle.com/Images/Persons/20190313130509_Jason%20Nolf%20PSU%20vs%20Michigan%201-18-19%203731%20Tony%20Rotundo.jpg",
              bio: "Jason Nolf is a 3x NCAA Champion and 4x finalist from Penn State University. Widely regarded as one of the most dominant collegiate wrestlers of all time, Jason brings unprecedented technical expertise and competitive insight to his coaching."
            },
            {
              name: "Bo Nickal",
              title: "3x NCAA Champion",
              image: "https://d1qoiwmkp273n4.cloudfront.net/images/default-source/athletics-images/roster/wrestling/2018-19/bo-nickal-4x5.jpg",
              bio: "Bo Nickal is a 3x NCAA Champion and Hodge Trophy winner from Penn State University. Currently pursuing MMA, Bo brings a unique perspective on wrestling for combat sports."
            }
          ];
          
          data.schedule = [
            {
              time: "9:00 AM - 9:15 AM",
              activity: "Registration and Gear Distribution"
            },
            {
              time: "9:15 AM - 11:00 AM",
              activity: "Fun Warmup, Games, and Technical Session"
            },
            {
              time: "11:00 AM - 11:30 AM",
              activity: "Break (PlayStation Station Available)"
            },
            {
              time: "11:30 AM - 12:30 PM",
              activity: "Live Wrestling Sessions and Spotlight Matches"
            },
            {
              time: "12:30 PM - 1:30 PM",
              activity: "Lunch Break and Rich Habits Gear Shop"
            },
            {
              time: "1:30 PM - 3:00 PM",
              activity: "Second Technical Session"
            },
            {
              time: "3:00 PM - 4:00 PM",
              activity: "Q&A with Clinician and Closing Activities"
            }
          ];
          
          // Adding other required fields
          data.categoryClass = "bg-blue-100 text-blue-800";
          data.buttonLabel = "Register Now";
          data.ageGroups = "2nd Grade - Senior";
          data.capacity = "Limited to 200 wrestlers";
          data.shortDescription = "An intensive 3-day wrestling camp featuring elite coaching from NCAA champions and Olympic-level athletes.";
        }
        
        setEvent(data);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Could not load event data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvent();
  }, [eventId]);
  
  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 rounded-full border-t-primary"></div>
        <p className="mt-4 text-gray-600">Loading event details...</p>
      </div>
    );
  }
  
  // Error state
  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h1>
        <p className="text-gray-600 mb-6">{error || "The event you're looking for doesn't exist or has been removed."}</p>
        <a href="/events" className="text-primary underline">Return to Events</a>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{event.title} | Rich Habits</title>
        <meta name="description" content={event.shortDescription} />
      </Helmet>
      
      {/* Banner at the top with lighting effects based on event */}
      {event.id === 1 && (
        <div className="w-full overflow-hidden banner-container relative">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-auto object-cover" 
          />
          <div className="sun-glow"></div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white"></div>
        </div>
      )}
      
      {event.id === 2 && (
        <div className="w-full overflow-hidden banner-container relative">
          <video 
            src="/assets/04243.mov" 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-[50vh] object-cover"
            style={{ filter: 'brightness(1.1) contrast(1.1)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white"></div>
        </div>
      )}
      
      <div className={`bg-white py-16 ${event.id === 1 ? 'flame-bg' : event.id === 2 ? 'psu-bg' : ''}`}>
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
        
        {event.id === 2 && (
          <>
            {/* Penn State themed waves */}
            <div className="wave-blue" style={{ top: '10%', left: '50%' }}></div>
            <div className="wave-navy" style={{ top: '30%', left: '50%' }}></div>
            <div className="wave-blue" style={{ top: '60%', left: '50%' }}></div>
            <div className="wave-navy" style={{ top: '80%', left: '50%' }}></div>
            
            {/* Penn State diamond pattern */}
            <div className="psu-diamond-pattern"></div>
            
            {/* Animated glossy stripe */}
            <div className="psu-stripe"></div>
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
                        <span className="font-medium">Limited to 200 participants - Register early to secure your spot</span>
                      </div>
                    </div>
                    
                    <div className="my-6 flex flex-col items-center">
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mt-6 text-center">
                        <span className="block mb-2">{event.date}</span>
                        <span className="block text-lg font-normal">{event.location}</span>
                      </h1>
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{event.title}</h1>
                    <p className="text-gray-600 mb-6">{event.shortDescription}</p>
                  </>
                )}
              </div>
              
              {event.id !== 1 && (
                <div>
                  <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                    <img src={event.image} alt={event.title} className="w-full h-auto aspect-[16/9] object-cover" />
                  </div>
                </div>
              )}
              
              <div className={`${event.id !== 1 ? '' : 'lg:col-span-2'}`}>
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h3>
                      <div className="flex items-center">
                        <span className="text-gray-800">
                          {event.date} <span className="text-gray-500">•</span> {event.time}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                      <div className="flex items-center">
                        <span className="text-gray-800">{event.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center mb-2">
                      <span className="text-gray-800 font-medium">{event.price}</span>
                    </div>
                    
                    <button 
                      onClick={() => setShowRegistrationDialog(true)}
                      className={`w-full mt-4 font-medium py-3 px-4 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        event.id === 2 
                          ? 'psu-gradient-btn text-white focus:ring-blue-500' 
                          : event.id === 1
                            ? 'fire-gradient-btn text-white focus:ring-orange-500'
                            : 'bg-black hover:bg-gray-800 text-white focus:ring-gray-500'
                      }`}
                    >
                      {event.buttonLabel || 'Register Now'}
                    </button>
                    
                    <div className="mt-4 flex justify-between text-gray-500 text-sm">
                      <div className="flex items-center">
                        {event.ageGroups}
                      </div>
                      <div className="flex items-center">
                        {event.capacity}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Event Description */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            <div className="lg:col-span-2">
              {event.id === 1 ? (
                <div>
                  <div className="mb-10">
                    <div className="mb-6 border-b border-gray-200 pb-2">
                      <h3 className="text-xl font-bold">Elite Coaching Staff</h3>
                      <p className="text-gray-600">Learn from the best in the sport</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {event.coaches && event.coaches.map((coach: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                          <div className="aspect-square overflow-hidden">
                            <img 
                              src={coach.image} 
                              alt={coach.name} 
                              className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-gray-800">{coach.name}</h4>
                            <p className="text-gray-500 text-sm mb-2">{coach.title}</p>
                            <p className="text-gray-700 text-sm">{coach.bio}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : event.id === 2 ? (
                <div>
                  <div className="mb-10">
                    <div className="mb-6 border-b border-blue-100 pb-2">
                      <h3 className="text-xl font-bold psu-title">Elite Penn State Coaching Staff</h3>
                      <p className="text-gray-600">Learn from NCAA champions who have dominated collegiate wrestling</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {event.coaches && event.coaches.map((coach: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border border-[#041e42]/20 hover:shadow-md transition-shadow duration-300">
                          <div className="aspect-square overflow-hidden">
                            <img 
                              src={coach.image} 
                              alt={coach.name} 
                              className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-gray-800">{coach.name}</h4>
                            <p className="text-[#1e88e5] text-sm mb-2">{coach.title}</p>
                            <p className="text-gray-700 text-sm">{coach.bio}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Event Schedule */}
                  {event.schedule && (
                    <div className="mt-10">
                      <div className="mb-6 border-b border-blue-100 pb-2">
                        <h3 className="text-xl font-bold psu-title">Daily Schedule</h3>
                        <p className="text-gray-600">Elite training program with Penn State champions</p>
                      </div>
                      <div className="psu-border rounded-md overflow-hidden shadow-lg relative">
                        <div className="psu-diamond-pattern absolute inset-0 opacity-10"></div>
                        {event.schedule.map((item: any, index: number) => (
                          <div 
                            key={index} 
                            className={`grid grid-cols-3 p-4 relative ${
                              index % 2 === 0 ? 'bg-[#041e42]/5' : 'bg-white'
                            }`}
                          >
                            <div className="font-medium text-[#041e42]">{item.time}</div>
                            <div className="col-span-2 text-gray-800">{item.activity}</div>
                          </div>
                        ))}
                        <div className="psu-stripe"></div>
                      </div>
                      
                      <div className="mt-12 p-6 bg-gradient-to-r from-[#041e42] to-[#1e88e5] rounded-lg text-white shadow-lg">
                        <h3 className="text-xl font-bold mb-4">Why Train with Penn State Champions?</h3>
                        <p className="mb-4">
                          Penn State University has dominated NCAA wrestling, winning 9 of the last 12 national championships. Our National Champ Camp brings you direct access to the training methods that have created this dynasty.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-medium mb-6">About This Event</h2>
                  <div className="prose max-w-none">
                    {event.description.split('\n\n').map((paragraph: string, index: number) => (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <div>
              {event.id === 2 && (
                <>
                  <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8 border border-[#041e42] relative">
                    <div className="psu-gradient-btn px-6 py-4 text-white">
                      <h3 className="text-lg font-bold">Coach Spotlight: Vincenzo Joseph</h3>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-[#1e88e5]">
                          <img 
                            src="/src/assets/coaches/cenzo.png" 
                            alt="Vincenzo Joseph" 
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Vincenzo Joseph</h4>
                          <p className="text-[#1e88e5] text-sm">2x NCAA Champion</p>
                        </div>
                      </div>
                      <blockquote className="text-gray-700 italic border-l-4 border-[#041e42] pl-4 py-2 mb-4">
                        "Wrestling is about constant evolution. At National Champ Camp, we'll push beyond fundamentals to develop the technical details and mindset that separate champions from competitors."
                      </blockquote>
                      <p className="text-sm text-gray-700 mb-4">
                        Coach Joseph is renowned for his creative wrestling style and championship mentality. His sessions will focus on developing scoring opportunities from all positions and building resilience under pressure.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-b from-[#041e42] to-[#082a5e] shadow-md rounded-lg overflow-hidden mb-8 text-white">
                    <div className="border-b border-[#1e88e5]/30 px-6 py-4">
                      <h3 className="text-lg font-bold">Why Choose National Champ Camp</h3>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-4">
                        <li className="flex">
                          <span>Train with Penn State's championship coaching network</span>
                        </li>
                        <li className="flex">
                          <span>Intensive training in Las Vegas's premier facilities</span>
                        </li>
                        <li className="flex">
                          <span>Personalized technique feedback and development</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Container>
      </div>
      
      {/* Registration Dialog */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Register for {event.title}</DialogTitle>
          <DialogDescription>
            Complete the form below to register for this event. All fields are required unless marked as optional.
          </DialogDescription>
          
          <form className="space-y-6 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={registrationForm.firstName}
                  onChange={(e) => setRegistrationForm({...registrationForm, firstName: e.target.value})}
                  placeholder="First name" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={registrationForm.lastName}
                  onChange={(e) => setRegistrationForm({...registrationForm, lastName: e.target.value})}
                  placeholder="Last name" 
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowRegistrationDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                disabled={isSubmitting}
                onClick={() => {
                  // Implementation would handle form submission and checkout process
                  toast({
                    title: "Registration In Progress",
                    description: "Taking you to the secure payment page...",
                  });
                }}
              >
                Complete Registration
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}