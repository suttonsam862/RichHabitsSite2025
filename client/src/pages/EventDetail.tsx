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
import FloatingSchoolLogos from '@/components/event/FloatingSchoolLogos';

// This function converts "/src/assets/..." paths to "/assets/..." paths that work in production
const fixAssetPath = (path: string): string => {
  if (path.startsWith('/src/assets/')) {
    return path.replace('/src/assets/', '/assets/');
  }
  return path;
};

// Import event banner images
import recruitingBanner from '@/assets/events/recruiting-banner.png';

// Import school logos
import pittLogo from '@/assets/schools/Pitt logo.png';
import ouLogo from '@/assets/schools/OU O.png';
import brownLogo from '@/assets/schools/brown b.png';
import gmuLogo from '@/assets/schools/george mason g.png';
import tarletonLogo from '@/assets/schools/tarleton t.png';

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
    day1: false, // for Cory Land Tour
    day2: false, // for Cory Land Tour
    day3: false, // for Cory Land Tour
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
              image: "/assets/VALENCIA_Zahid-headshot.jpg",
              bio: "Zahid Valencia is a 2x NCAA Champion, 3x Pac-12 Champion, and 3x All-American for Arizona State University. Known for his explosive offense and innovative techniques, Zahid brings world-class expertise to the mat."
            },
            {
              name: "Josh Shields",
              title: "NCAA All-American",
              image: "/assets/DSC08657--.JPG",
              bio: "Josh Shields is a 2x All-American from Arizona State University and current professional wrestler. His technical approach and strategic mind make him one of the most respected coaches on the circuit."
            },
            {
              name: "Brandon Courtney",
              title: "NCAA Finalist",
              image: "/assets/DSC08631.JPG",
              bio: "Brandon Courtney is an NCAA Finalist and 2x All-American from Arizona State University. A specialist in lightweight technique and speed development, Brandon brings unique insights into creating and exploiting advantages on the mat."
            },
            {
              name: "Michael McGee",
              title: "NCAA All-American",
              image: "/assets/Michael_McGee_JouQS.jpg",
              bio: "Michael McGee is an NCAA All-American from the University of North Carolina and Arizona State University. A technique specialist and mental performance coach, Michael focuses on combining physical skills with mental toughness."
            }
          ];
        } else if (data.id === 2) {
          data.coaches = [
            {
              name: "Jason Nolf",
              title: "3x NCAA Champion at 157 lbs (2017-19)",
              image: "/assets/DSC09273.JPG",
              bio: "Jason Nolf is a 3x NCAA Champion at 157 lbs (2017-19) and 4x finalist from Penn State University. Widely regarded as one of the most dominant collegiate wrestlers of all time, Jason brings unprecedented technical expertise and competitive insight to his coaching. His innovative approach to position and leverage has changed modern wrestling."
            },
            {
              name: "Mark Hall",
              title: "NCAA Champion at 174 lbs (2017)",
              image: "/src/assets/coaches/hall.webp",
              bio: "Mark Hall is a 2017 NCAA Champion at 174 lbs and three-time finalist from Penn State University. With his exceptional technique and competitive fire, Mark has established himself as one of the premier wrestlers and coaches in the country. His ability to teach complex techniques in an accessible way makes him a fan-favorite instructor."
            },
            {
              name: "Vincenzo Joseph",
              title: "2x NCAA Champion at 165 lbs (2017, 2018)",
              image: "/assets/DSC09283--.JPG",
              bio: "Vincenzo 'Cenzo' Joseph is a 2x NCAA Champion at 165 lbs (2017, 2018) from Penn State University. Known for his creativity and unorthodox style, Cenzo revolutionized the sport with his dynamic approach to wrestling. His championship mentality and innovative techniques have made him one of the most sought-after clinicians in the country."
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
          data.ageGroups = "Ages 10+ through high school";
          data.capacity = "Limited to 200 wrestlers";
          data.shortDescription = "An intensive 4-day wrestling camp featuring elite coaching from Penn State NCAA champions in Las Vegas.";
        } else if (data.id === 3) {
          data.coaches = [
            {
              name: "Micky Phillippi",
              title: "Assistant Coach, University of Pittsburgh",
              image: "/assets/crop (1).webp",
              school: "University of Pittsburgh",
              schoolLogo: pittLogo,
              bio: "Micky Phillippi serves as an assistant coach at the University of Pittsburgh. As a former standout wrestler, Phillippi brings technical expertise and a deep understanding of what college programs look for in recruits."
            },
            {
              name: "Mark Hall",
              title: "Recruiting Coordinator, University of Oklahoma",
              image: "/src/assets/coaches/hall.webp",
              school: "University of Oklahoma",
              schoolLogo: ouLogo,
              bio: "Mark Hall is the recruiting coordinator at the University of Oklahoma and a former NCAA Champion and three-time finalist from Penn State University. His expertise in talent identification and development makes him an invaluable resource for wrestlers looking to compete at the collegiate level."
            },
            {
              name: "Josh Shields",
              title: "RTC Coach and Recruiter, Brown University",
              image: "/src/assets/coaches/recruiting/shields.webp",
              school: "Brown University",
              schoolLogo: brownLogo,
              bio: "Josh Shields serves as an RTC coach and recruiter at Brown University. A former All-American from Arizona State University, Shields brings a wealth of knowledge about Ivy League recruitment and what it takes to succeed at elite academic institutions."
            },
            {
              name: "Grant Leeth",
              title: "Head Coach, Tarleton State University",
              image: "/src/assets/coaches/recruiting/leeth.webp",
              school: "Tarleton State University",
              schoolLogo: tarletonLogo,
              bio: "Grant Leeth is the head coach at Tarleton State University. With his experience leading a collegiate program, Leeth provides valuable insights into the recruitment process from a head coach's perspective."
            },
            {
              name: "Max Murin",
              title: "Assistant Coach and Recruiter, George Mason University",
              image: "/src/assets/coaches/recruiting/murin.webp",
              school: "George Mason University",
              schoolLogo: gmuLogo,
              bio: "Max Murin is an assistant coach and recruiter at George Mason University. A former standout wrestler himself, Murin understands what it takes to get noticed by college programs and how to transition successfully to collegiate wrestling."
            }
          ];
          
          data.schedule = [
            {
              time: "9:00 AM - 9:30 AM",
              activity: "Check-in and Welcome"
            },
            {
              time: "9:30 AM - 11:30 AM",
              activity: "Technical Session with College Coaches"
            },
            {
              time: "11:30 AM - 12:30 PM",
              activity: "Lunch Break and Networking"
            },
            {
              time: "12:30 PM - 2:30 PM",
              activity: "Live Wrestling and Evaluation"
            },
            {
              time: "2:30 PM - 3:30 PM",
              activity: "Recruiting Seminar and Q&A"
            },
            {
              time: "3:30 PM - 4:00 PM",
              activity: "One-on-One Feedback Sessions"
            }
          ];
          
          // Adding other required fields
          data.categoryClass = "bg-red-100 text-red-800";
          data.buttonLabel = "Secure Your Spot";
          data.ageGroups = "High school wrestlers";
          data.capacity = "Limited to 150 participants";
          data.shortDescription = "A specialized two-day clinic combining elite coaching with college recruiting opportunities at Arlington Martin High School.";
        } else if (data.id === 4) {
          data.coaches = [
            {
              name: "Cory Land",
              title: "Northern Iowa Wrestling Team",
              image: "/assets/coaches/cory-land-tour/cory-land.webp",
              bio: "Cory Land is a standout wrestler at the University of Northern Iowa. Known for his technical skill and competitive drive, Cory brings his expertise to this multi-day tour across Alabama."
            },
            {
              name: "Wyatt Voelker",
              title: "Northern Iowa Wrestling Team",
              image: "/assets/coaches/cory-land-tour/wyatt-voelker.webp",
              bio: "Wyatt Voelker is a powerful wrestler from the University of Northern Iowa. His strength-based approach and innovative techniques make him a favorite instructor among young wrestlers."
            },
            {
              name: "Trever Andersen",
              title: "Northern Iowa Wrestling Team",
              image: "/assets/coaches/cory-land-tour/trever-anderson.webp", 
              bio: "Trever Andersen brings his unique wrestling style from Northern Iowa to this special tour. Specializing in strategic positioning and counter techniques, Trever offers valuable insights to wrestlers of all levels."
            },
            {
              name: "Garrett Funk",
              title: "Northern Iowa Wrestling Team",
              image: "/assets/coaches/cory-land-tour/garrett-funk.webp",
              bio: "Garrett Funk rounds out the Northern Iowa contingent with his explosive style and technical expertise. His approach to wrestling combines traditional fundamentals with modern innovations."
            }
          ];
          
          data.schedule = [
            {
              time: "9:00 AM - 9:30 AM",
              activity: "Check-in and Welcome"
            },
            {
              time: "9:30 AM - 11:30 AM",
              activity: "Technical Session with Northern Iowa Wrestlers"
            },
            {
              time: "11:30 AM - 12:30 PM",
              activity: "Lunch Break"
            },
            {
              time: "12:30 PM - 2:30 PM",
              activity: "Live Wrestling and Application"
            },
            {
              time: "2:30 PM - 3:30 PM",
              activity: "Q&A and Special Technique Focuses"
            },
            {
              time: "3:30 PM - 4:00 PM",
              activity: "Cool Down and Closing"
            }
          ];
          
          // Adding other required fields
          data.categoryClass = "bg-purple-100 text-purple-800";
          data.buttonLabel = "Register Now";
          data.ageGroups = "Ages 8+ through high school";
          data.capacity = "Limited to 75 wrestlers per location";
          data.shortDescription = "A three-day wrestling tour across Alabama featuring elite instruction from Northern Iowa wrestlers.";
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
          <img 
            src="/assets/LongSitePhotovegas.png" 
            alt={event.title} 
            className="w-full h-auto object-cover" 
          />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white"></div>
        </div>
      )}
      
      {event.id === 3 && (
        <div className="w-full overflow-hidden banner-container relative">
          <img 
            src={recruitingBanner} 
            alt={event.title} 
            className="w-full h-auto object-cover" 
          />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white"></div>
        </div>
      )}
      
      {event.id === 4 && (
        <div className="w-full overflow-hidden banner-container relative">
          <img 
            src="/assets/DSC09354.JPG" 
            alt={event.title} 
            className="w-full h-auto object-cover" 
          />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white"></div>
        </div>
      )}
      
      <div className={`bg-white py-16 ${event.id === 1 ? 'flame-bg' : event.id === 2 ? 'psu-bg' : event.id === 3 ? 'recruiting-bg' : event.id === 4 ? 'cory-land-bg' : ''}`}>
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
            
            {/* Add animated flame particles */}
            <div className="flame-particle" style={{ left: '10%', bottom: '10%', animationDelay: '0s' }}></div>
            <div className="flame-particle" style={{ left: '25%', bottom: '15%', animationDelay: '2s' }}></div>
            <div className="flame-particle" style={{ left: '40%', bottom: '5%', animationDelay: '4s' }}></div>
            <div className="flame-particle" style={{ left: '60%', bottom: '20%', animationDelay: '1s' }}></div>
            <div className="flame-particle" style={{ left: '75%', bottom: '15%', animationDelay: '3s' }}></div>
            <div className="flame-particle" style={{ left: '90%', bottom: '10%', animationDelay: '5s' }}></div>
            
            {/* Add another layer of particles */}
            <div className="flame-particle" style={{ left: '5%', bottom: '30%', animationDelay: '3.5s' }}></div>
            <div className="flame-particle" style={{ left: '30%', bottom: '25%', animationDelay: '2.5s' }}></div>
            <div className="flame-particle" style={{ left: '50%', bottom: '35%', animationDelay: '0.5s' }}></div>
            <div className="flame-particle" style={{ left: '70%', bottom: '30%', animationDelay: '4.5s' }}></div>
            <div className="flame-particle" style={{ left: '85%', bottom: '25%', animationDelay: '1.5s' }}></div>
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
        
        {event.id === 3 && (
          <>
            {/* Texas Recruiting Clinic red, white, and blue waves */}
            <div className="recruiting-red-wave"></div>
            <div className="recruiting-white-wave"></div>
            <div className="recruiting-blue-wave"></div>
            
            {/* Add another set of waves with different timing */}
            <div className="recruiting-red-wave" style={{ top: '25%', animationDelay: '6s' }}></div>
            <div className="recruiting-white-wave" style={{ top: '55%', animationDelay: '10s' }}></div>
            <div className="recruiting-blue-wave" style={{ top: '85%', animationDelay: '14s' }}></div>
            
            {/* Texas Recruiting Clinic diamond pattern */}
            <div className="recruiting-diamond-pattern"></div>
            
            {/* Animated glossy stripe */}
            <div className="recruiting-stripe"></div>
          </>
        )}
        
        {event.id === 4 && (
          <>
            {/* Cory Land Tour purple and gold waves */}
            <div className="cory-land-purple-wave"></div>
            <div className="cory-land-gold-wave"></div>
            <div className="cory-land-white-wave"></div>
            
            {/* Add another set of waves with different timing */}
            <div className="cory-land-purple-wave" style={{ top: '40%', animationDelay: '5s' }}></div>
            <div className="cory-land-gold-wave" style={{ top: '70%', animationDelay: '9s' }}></div>
            <div className="cory-land-white-wave" style={{ top: '90%', animationDelay: '13s' }}></div>
            
            {/* Cory Land Tour pattern */}
            <div className="cory-land-pattern"></div>
            
            {/* Animated glossy stripe */}
            <div className="cory-land-stripe"></div>
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
                        <span className="font-medium">Limited to 200 participants - Register now</span>
                      </div>
                    </div>
                    
                    <div className="my-6 flex flex-col items-center">
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mt-6 text-center">
                        <span className="block mb-2">{event.date}</span>
                        <span className="block text-lg font-normal">{event.location}</span>
                      </h1>
                    </div>
                  </>
                ) : event.id === 2 ? (
                  <>
                    <div className="bg-white p-4 rounded-md border-l-4 border-[#041e42] mb-4 shadow-sm">
                      <div className="flex items-center">
                        <span className="font-medium">Limited to 200 participants - Register now</span>
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
              
              {event.id !== 1 && event.id !== 2 && (
                <div className="col-span-full">
                  <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                    <img src={event.image} alt={event.title} className="w-full h-auto max-h-[120px] object-cover object-center" />
                  </div>
                </div>
              )}
              
              <div className="col-span-full mt-6">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 w-full relative">
                  {event.id === 3 && (
                    <FloatingSchoolLogos 
                      logos={[
                        { src: pittLogo, alt: "University of Pittsburgh", logoClass: "logo-pitt" },
                        { src: ouLogo, alt: "University of Oklahoma", logoClass: "logo-ou" },
                        { src: brownLogo, alt: "Brown University", logoClass: "logo-brown" },
                        { src: gmuLogo, alt: "George Mason University", logoClass: "logo-gmu" },
                        { src: tarletonLogo, alt: "Tarleton State University", logoClass: "logo-tarleton" }
                      ]}
                    />
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 relative z-10">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1 relative z-10">Date & Time</h3>
                      <div className="flex items-center relative z-10">
                        <span className="text-gray-800">
                          {event.date} <span className="text-gray-500">•</span> {event.time}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1 relative z-10">Location</h3>
                      <div className="flex items-center relative z-10">
                        <span className="text-gray-800">{event.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 relative z-10">
                    <div className="flex items-center mb-2">
                      <span className="text-gray-800 font-medium">{event.price}</span>
                    </div>
                    
                    <button 
                      onClick={() => setShowRegistrationDialog(true)}
                      className={`w-full mt-4 font-medium py-3 px-4 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 relative z-10 ${
                        event.id === 2 
                          ? 'psu-gradient-btn text-white focus:ring-blue-500' 
                          : event.id === 1 
                            ? 'fire-gradient-btn text-white focus:ring-orange-500'
                            : event.id === 3 
                              ? 'usa-gradient-btn text-white focus:ring-red-500'
                              : 'bg-black hover:bg-gray-800 text-white focus:ring-gray-500'
                      }`}
                    >
                      {event.buttonLabel || 'Register Now'}
                    </button>
                    
                    <div className="mt-4 flex justify-between text-gray-500 text-sm">
                      <div className="flex items-center relative z-10">
                        {event.ageGroups}
                      </div>
                      <div className="flex items-center relative z-10">
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
                      
                      <div className="mt-10">
                        <div className="mb-6 border-b border-blue-100 pb-2">
                          <h3 className="text-xl font-bold psu-title">About National Champ Camp</h3>
                          <p className="text-gray-600">A premium wrestling experience in Las Vegas</p>
                        </div>
                        
                        <div className="prose max-w-none text-gray-700">
                          {event.description.split('\n\n').map((paragraph: string, index: number) => (
                            <p key={index} className="mb-4">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : event.id === 3 ? (
                <div>
                  <div className="mb-10">
                    <div className="mb-6 border-b border-red-100 pb-2">
                      <div className="flex items-center justify-between mb-3 w-full px-4 max-w-xl mx-auto">
                        <div className="w-16 h-16 flex items-center justify-center">
                          <img src={pittLogo} alt="University of Pittsburgh" className="w-14 h-14 object-contain school-logo-pulse" />
                        </div>
                        <div className="w-16 h-16 flex items-center justify-center">
                          <img src={ouLogo} alt="University of Oklahoma" className="w-14 h-14 object-contain school-logo-pulse" />
                        </div>
                        <div className="w-16 h-16 flex items-center justify-center">
                          <img src={brownLogo} alt="Brown University" className="w-14 h-14 object-contain school-logo-pulse" />
                        </div>
                        <div className="w-16 h-16 flex items-center justify-center">
                          <img src={gmuLogo} alt="George Mason University" className="w-14 h-14 object-contain school-logo-pulse" />
                        </div>
                        <div className="w-16 h-16 flex items-center justify-center">
                          <img src={tarletonLogo} alt="Tarleton State University" className="w-14 h-14 object-contain school-logo-pulse" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold" style={{ background: 'linear-gradient(to right, #bf0a30, #002868)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Elite NCAA Champion Coaches
                      </h3>
                      <p className="text-gray-600">Learn directly from collegiate champions with recruiting expertise</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {event.coaches && event.coaches.map((coach: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                          <div className="aspect-square overflow-hidden relative">
                            <img 
                              src={coach.image} 
                              alt={coach.name} 
                              className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                            />
                            {coach.schoolLogo && (
                              <div className="absolute top-3 right-3 w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg school-logo-pulse">
                                <img 
                                  src={coach.schoolLogo} 
                                  alt={coach.school || ""} 
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-gray-800">{coach.name}</h4>
                            <p className="text-[#bf0a30] text-sm mb-2">{coach.title}</p>
                            <p className="text-gray-700 text-sm">{coach.bio}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Event Schedule */}
                  {event.schedule && (
                    <div className="mt-10">
                      <div className="mb-6 border-b border-red-100 pb-2">
                        <div className="flex items-center justify-between mb-3 w-full px-4 max-w-xl mx-auto">
                          <div className="w-14 h-14 flex items-center justify-center">
                            <img src={pittLogo} alt="University of Pittsburgh" className="w-12 h-12 object-contain school-logo-pulse" />
                          </div>
                          <div className="w-14 h-14 flex items-center justify-center">
                            <img src={ouLogo} alt="University of Oklahoma" className="w-12 h-12 object-contain school-logo-pulse" />
                          </div>
                          <div className="w-14 h-14 flex items-center justify-center">
                            <img src={brownLogo} alt="Brown University" className="w-12 h-12 object-contain school-logo-pulse" />
                          </div>
                          <div className="w-14 h-14 flex items-center justify-center">
                            <img src={gmuLogo} alt="George Mason University" className="w-12 h-12 object-contain school-logo-pulse" />
                          </div>
                          <div className="w-14 h-14 flex items-center justify-center">
                            <img src={tarletonLogo} alt="Tarleton State University" className="w-12 h-12 object-contain school-logo-pulse" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold" style={{ background: 'linear-gradient(to right, #bf0a30, #002868)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          Daily Schedule
                        </h3>
                        <p className="text-gray-600">Combining elite coaching with college recruiting opportunities</p>
                      </div>
                      <div className="border-2 border-[#bf0a30]/20 rounded-md overflow-hidden shadow-lg relative">
                        {event.schedule.map((item: any, index: number) => (
                          <div 
                            key={index} 
                            className={`grid grid-cols-3 p-4 relative ${
                              index % 2 === 0 ? 'bg-red-50' : 'bg-white'
                            }`}
                          >
                            <div className="font-medium text-[#bf0a30]">{item.time}</div>
                            <div className="col-span-2 text-gray-800">{item.activity}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-12 p-6 bg-gradient-to-r from-[#bf0a30] to-[#002868] rounded-lg text-white shadow-lg">
                        <div className="inline-block px-3 py-1 bg-white text-red-600 text-sm font-bold rounded-full mb-4">
                          SPECIAL OFFER: $249 (Regular $300)
                        </div>
                        <h3 className="text-xl font-bold mb-4">Why Attend the Texas Recruiting Clinic?</h3>
                        <p className="mb-4">
                          This unique clinic combines elite technical training with direct access to college coaches and recruiters, creating invaluable opportunities for high school wrestlers looking to compete at the collegiate level.
                        </p>
                        <p>
                          Limited to 150 wrestlers to ensure quality instruction and maximum exposure to college coaches. Each wrestler receives personalized feedback and evaluation.
                        </p>
                      </div>
                      
                      <div className="mt-10">
                        <div className="mb-6 border-b border-red-100 pb-2">
                          <div className="flex items-center justify-between mb-3 w-full px-4 max-w-xl mx-auto">
                            <div className="w-14 h-14 flex items-center justify-center">
                              <img src={pittLogo} alt="University of Pittsburgh" className="w-12 h-12 object-contain school-logo-pulse" />
                            </div>
                            <div className="w-14 h-14 flex items-center justify-center">
                              <img src={ouLogo} alt="University of Oklahoma" className="w-12 h-12 object-contain school-logo-pulse" />
                            </div>
                            <div className="w-14 h-14 flex items-center justify-center">
                              <img src={brownLogo} alt="Brown University" className="w-12 h-12 object-contain school-logo-pulse" />
                            </div>
                            <div className="w-14 h-14 flex items-center justify-center">
                              <img src={gmuLogo} alt="George Mason University" className="w-12 h-12 object-contain school-logo-pulse" />
                            </div>
                            <div className="w-14 h-14 flex items-center justify-center">
                              <img src={tarletonLogo} alt="Tarleton State University" className="w-12 h-12 object-contain school-logo-pulse" />
                            </div>
                          </div>
                          <h3 className="text-xl font-bold" style={{ background: 'linear-gradient(to right, #bf0a30, #002868)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            About Texas Recruiting Clinic
                          </h3>
                          <p className="text-gray-600">A premium recruiting opportunity in Arlington</p>
                        </div>
                        
                        <div className="prose max-w-none text-gray-700">
                          {event.description.split('\n\n').map((paragraph: string, index: number) => (
                            <p key={index} className="mb-4">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : event.id === 4 ? (
                <div>
                  <div className="mb-10">
                    <div className="mb-6 border-b border-purple-200 pb-2">
                      <h3 className="text-xl font-bold" style={{ background: 'linear-gradient(to right, #4F2D7F, #9b7ede)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Elite Northern Iowa Coaching Staff</h3>
                      <p className="text-gray-600">Learn from the rising stars in collegiate wrestling</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {event.coaches && event.coaches.map((coach: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border border-purple-200 hover:shadow-md transition-shadow duration-300">
                          <div className="aspect-square overflow-hidden">
                            <img 
                              src={coach.image} 
                              alt={coach.name} 
                              className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-gray-800">{coach.name}</h4>
                            <p className="text-purple-600 text-sm mb-2">{coach.title}</p>
                            <p className="text-gray-700 text-sm">{coach.bio}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Event Schedule */}
                  {event.schedule && (
                    <div className="mt-10">
                      <div className="mb-6 border-b border-purple-200 pb-2">
                        <h3 className="text-xl font-bold" style={{ background: 'linear-gradient(to right, #4F2D7F, #9b7ede)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Daily Schedule</h3>
                        <p className="text-gray-600">Elite training program across multiple locations</p>
                      </div>
                      <div className="rounded-md overflow-hidden shadow-lg relative border border-purple-200">
                        <div className="cory-land-pattern absolute inset-0 opacity-10"></div>
                        {event.schedule.map((item: any, index: number) => (
                          <div 
                            key={index} 
                            className={`grid grid-cols-3 p-4 relative ${
                              index % 2 === 0 ? 'bg-purple-50' : 'bg-white'
                            }`}
                          >
                            <div className="font-medium text-purple-800">{item.time}</div>
                            <div className="col-span-2 text-gray-800">{item.activity}</div>
                          </div>
                        ))}
                        <div className="cory-land-stripe"></div>
                      </div>
                      
                      <div className="mt-12 p-6 bg-gradient-to-r from-[#4F2D7F] to-[#9b7ede] rounded-lg text-white shadow-lg">
                        <h3 className="text-xl font-bold mb-4">Why Join the Cory Land Tour?</h3>
                        <p className="mb-4">
                          This unique tour brings elite Northern Iowa wrestling talent across multiple locations in Alabama, making high-level instruction accessible to wrestlers throughout the state. Each day focuses on different techniques and positions.
                        </p>
                        <p>
                          Limited to 75 wrestlers per location to ensure quality instruction and individual attention. Choose to attend one day or all three for the complete experience.
                        </p>
                      </div>
                      
                      <div className="mt-10">
                        <div className="mb-6 border-b border-purple-200 pb-2">
                          <h3 className="text-xl font-bold" style={{ background: 'linear-gradient(to right, #4F2D7F, #9b7ede)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            About Cory Land Tour
                          </h3>
                          <p className="text-gray-600">A premium wrestling experience across Alabama</p>
                        </div>
                        
                        <div className="prose max-w-none text-gray-700">
                          {event.description.split('\n\n').map((paragraph: string, index: number) => (
                            <p key={index} className="mb-4">
                              {paragraph}
                            </p>
                          ))}
                        </div>
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
              {event.id === 1 && (
                <>
                  <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8 border border-[#ff6b00] relative">
                    <div className="fire-gradient-btn px-6 py-4 text-white">
                      <h3 className="text-lg font-bold">Event Highlights</h3>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-3">
                        <li className="flex">
                          <span>Limited to 200 wrestlers - small group training</span>
                        </li>
                        <li className="flex">
                          <span>All participants receive Birmingham Slam Camp t-shirt</span>
                        </li>
                        <li className="flex">
                          <span>Professional photo and video highlights provided</span>
                        </li>
                        <li className="flex">
                          <span>Groups of 10+ wrestlers get 10% credit on next Rich Habits gear order</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* First Video */}
                  <div className="relative rounded-lg overflow-hidden mb-8 shadow-lg">
                    <video 
                      className="w-full h-auto object-cover"
                      src="/src/assets/videos/0424.mov"
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{ maxHeight: "360px" }}
                      onPlay={(e) => { e.currentTarget.volume = 0; }}
                    ></video>
                  </div>
                  
                  {/* Featured Camp Video */}
                  <div className="mb-8 rounded-xl overflow-hidden shadow-lg border-2 border-[#ff6b00]">
                    <div className="relative">
                      <video 
                        className="w-full h-auto"
                        src="/src/assets/videos/0331.mov"
                        autoPlay
                        loop
                        muted
                        playsInline
                        onPlay={(e) => { e.currentTarget.volume = 0; }}
                      ></video>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#ff6b00]/80 to-transparent p-4">
                        <h4 className="text-white font-bold text-lg">Birmingham Slam Camp Highlights</h4>
                        <p className="text-white/80 text-sm">Experience elite training with champions in Birmingham</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Third Video - Links to National Champ Camp */}
                  <div className="mb-8 rounded-xl overflow-hidden shadow-lg cursor-pointer group relative">
                    <a href="/events/2" className="block">
                      <div className="relative">
                        <video 
                          className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
                          src="/src/assets/videos/0425.mov"
                          autoPlay
                          loop
                          muted
                          playsInline
                          onPlay={(e) => { e.currentTarget.volume = 0; }}
                        ></video>
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="bg-white/90 px-4 py-2 rounded-md shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            <span className="font-bold text-[#041e42]">Visit National Champ Camp →</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </>
              )}
              
              {event.id === 4 && (
                <>
                  <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8 border border-purple-400 relative">
                    <div className="px-6 py-4 text-white" style={{ background: 'linear-gradient(135deg, #4F2D7F, #9b7ede)' }}>
                      <h3 className="text-lg font-bold">Event Highlights</h3>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-3">
                        <li className="flex">
                          <span>Limited to 75 wrestlers per location</span>
                        </li>
                        <li className="flex">
                          <span>All participants receive Cory Land Tour t-shirt</span>
                        </li>
                        <li className="flex">
                          <span>Choose individual days or the full tour experience</span>
                        </li>
                        <li className="flex">
                          <span>Daily technical focus varies by location</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-b from-[#4F2D7F] to-[#35185c] shadow-md rounded-lg overflow-hidden mb-8 text-white">
                    <div className="border-b border-purple-300/30 px-6 py-4">
                      <h3 className="text-lg font-bold">Tour Details</h3>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="text-purple-300 mr-2 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12h14"></path>
                              <path d="M12 5v14"></path>
                            </svg>
                          </div>
                          <div>
                            <span className="font-medium text-white">Day 1: July 23, 2025</span>
                            <p className="text-purple-200 text-sm mt-1">Athens High School - Focus on neutral position techniques and setups</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="text-purple-300 mr-2 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12h14"></path>
                              <path d="M12 5v14"></path>
                            </svg>
                          </div>
                          <div>
                            <span className="font-medium text-white">Day 2: July 24, 2025</span>
                            <p className="text-purple-200 text-sm mt-1">Ironclad Wrestling Club - Focus on mat wrestling and top position control</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="text-purple-300 mr-2 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12h14"></path>
                              <path d="M12 5v14"></path>
                            </svg>
                          </div>
                          <div>
                            <span className="font-medium text-white">Day 3: July 25, 2025</span>
                            <p className="text-purple-200 text-sm mt-1">South AL Location (TBD) - Focus on bottom position escapes and advanced techniques</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Coach Spotlight */}
                  <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8 border border-purple-400 relative">
                    <div className="px-6 py-4 text-white" style={{ background: 'linear-gradient(135deg, #4F2D7F, #9b7ede)' }}>
                      <h3 className="text-lg font-bold">Coach Spotlight: Cory Land</h3>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-purple-400">
                          <img 
                            src="/assets/crop.webp" 
                            alt="Cory Land" 
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Cory Land</h4>
                          <p className="text-purple-600 text-sm">Northern Iowa Wrestling Team</p>
                        </div>
                      </div>
                      <blockquote className="text-gray-700 italic border-l-4 border-purple-500 pl-4 py-2 mb-4">
                        "Wrestling techniques evolve constantly. On this tour, we're bringing collegiate-level training directly to Alabama wrestlers, focusing on the details that create champions."
                      </blockquote>
                      <p className="text-sm text-gray-700 mb-4">
                        Cory Land is a standout wrestler at the University of Northern Iowa. His technical approach and competitive mindset have made him one of the rising stars to watch. This Alabama tour brings his expertise back to his home state.
                      </p>
                    </div>
                  </div>
                </>
              )}
              
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
                            src="/assets/DSC09283--.JPG" 
                            alt="Vincenzo Joseph" 
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Vincenzo Joseph</h4>
                          <p className="text-[#1e88e5] text-sm">2x NCAA Champion at 165 lbs (2017, 2018)</p>
                        </div>
                      </div>
                      <blockquote className="text-gray-700 italic border-l-4 border-[#041e42] pl-4 py-2 mb-4">
                        "Wrestling is about constant evolution. At National Champ Camp, we'll push beyond fundamentals to develop the technical details and championship mindset that separates NCAA champions from competitors."
                      </blockquote>
                      <p className="text-sm text-gray-700 mb-4">
                        Coach Joseph is a two-time NCAA champion at 165 lbs (2017, 2018) from Penn State University. Known for his creative wrestling style and championship mentality, his sessions will focus on elite setups, chain-wrestling sequences, and developing scoring opportunities from all positions.
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
                          <span>Train with Penn State NCAA champions and learn their systems</span>
                        </li>
                        <li className="flex">
                          <span>Receive custom National Champ Camp singlet with registration</span>
                        </li>
                        <li className="flex">
                          <span>Get pro-shot highlight footage of your training</span>
                        </li>
                        <li className="flex">
                          <span>Enter the Friday night Vegas Spotlight Match Showcase</span>
                        </li>
                        <li className="flex">
                          <span>Groups of 10+ wrestlers get 10% credit on next Rich Habits gear order</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* First Video */}
                  <div className="relative rounded-lg overflow-hidden mb-8 shadow-lg">
                    <video 
                      className="w-full h-auto object-cover"
                      src="/assets/04243.mov"
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{ maxHeight: "360px" }}
                      onPlay={(e) => { e.currentTarget.volume = 0; }}
                    ></video>
                  </div>
                  
                  {/* Featured Camp Video */}
                  <div className="mb-8 rounded-xl overflow-hidden shadow-lg border-2 border-[#041e42]">
                    <div className="relative">
                      <video 
                        className="w-full h-auto"
                        src="/assets/0405.mov"
                        autoPlay
                        loop
                        muted
                        playsInline
                        onPlay={(e) => { e.currentTarget.volume = 0; }}
                      ></video>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#041e42]/80 to-transparent p-4">
                        <h4 className="text-white font-bold text-lg">National Champ Camp Highlights</h4>
                        <p className="text-white/80 text-sm">Experience the intensity and focus of Penn State champion training</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Third Video - Links to Slam Camp */}
                  <div className="mb-8 rounded-xl overflow-hidden shadow-lg cursor-pointer group relative">
                    <a href="/events/1" className="block">
                      <div className="relative">
                        <video 
                          className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
                          src="/src/assets/videos/0425.mov"
                          autoPlay
                          loop
                          muted
                          playsInline
                          onPlay={(e) => { e.currentTarget.volume = 0; }}
                        ></video>
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="bg-white/90 px-4 py-2 rounded-md shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            <span className="font-bold text-[#ff6b00]">Visit Birmingham Slam Camp →</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </>
              )}
              
              {event.id === 3 && (
                <>
                  <div className="recruiting-border bg-white shadow-md rounded-lg overflow-hidden mb-8 relative">
                    <div className="recruiting-diamond-pattern absolute inset-0 opacity-10"></div>
                    <div className="px-6 py-4" style={{ background: 'linear-gradient(to right, #bf0a30, #002868)', color: 'white' }}>
                      <h3 className="text-lg font-bold">Texas Recruiting Clinic Highlights</h3>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-3">
                        <li className="flex">
                          <span>Limited to 150 wrestlers - maximum recruiting exposure</span>
                        </li>
                        <li className="flex">
                          <span>Direct access to college coaches from 5 different programs</span>
                        </li>
                        <li className="flex">
                          <span>Professional photo and video highlights provided</span>
                        </li>
                        <li className="flex">
                          <span>Personalized evaluation and feedback from coaches</span>
                        </li>
                        <li className="flex">
                          <span>Groups of 10+ wrestlers get 10% credit on next Rich Habits gear order</span>
                        </li>
                      </ul>
                    </div>
                    <div className="recruiting-stripe"></div>
                  </div>
                  
                  {/* First Video */}
                  <div className="relative recruiting-border rounded-lg overflow-hidden mb-8 shadow-lg">
                    <div className="recruiting-diamond-pattern absolute inset-0 opacity-10"></div>
                    <video 
                      className="w-full h-auto object-cover relative z-10"
                      src="/src/assets/videos/trcvid.mov"
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{ maxHeight: "360px" }}
                      onPlay={(e) => { e.currentTarget.volume = 0; }}
                    ></video>
                    <div className="recruiting-stripe"></div>
                  </div>
                  
                  {/* Featured Camp Video - YouTube Embed */}
                  <div className="mb-8 rounded-xl overflow-hidden shadow-lg recruiting-border">
                    <div className="recruiting-diamond-pattern absolute inset-0 opacity-10"></div>
                    <div className="relative" style={{ paddingTop: '56.25%' }}>
                      <iframe 
                        className="absolute top-0 left-0 w-full h-full z-10"
                        src="https://www.youtube.com/embed/luouX84juYU?autoplay=1&mute=1&loop=1&playlist=luouX84juYU&controls=0&showinfo=0"
                        title="Texas Recruiting Clinic Wrestling Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#bf0a30]/80 to-transparent p-4 z-20 pointer-events-none">
                        <h4 className="text-white font-bold text-lg">Texas Recruiting Clinic Experience</h4>
                        <p className="text-white/80 text-sm">Get noticed by college coaches at this premier recruiting event</p>
                      </div>
                    </div>
                    <div className="recruiting-stripe"></div>
                  </div>
                  
                  {/* Third Video - Links to Birmingham Slam Camp */}
                  <div className="mb-8 rounded-xl overflow-hidden shadow-lg cursor-pointer group relative recruiting-border">
                    <div className="recruiting-diamond-pattern absolute inset-0 opacity-10"></div>
                    <a href="/events/1" className="block">
                      <div className="relative">
                        <video 
                          className="w-full h-auto group-hover:scale-105 transition-transform duration-300 relative z-10"
                          src="/src/assets/videos/0425.mov"
                          autoPlay
                          loop
                          muted
                          playsInline
                          onPlay={(e) => { e.currentTarget.volume = 0; }}
                        ></video>
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-20">
                          <div className="bg-white/90 px-4 py-2 rounded-md shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            <span className="font-bold" style={{ color: '#ff6b00' }}>Visit Birmingham Slam Camp →</span>
                          </div>
                        </div>
                      </div>
                    </a>
                    <div className="recruiting-stripe"></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Container>
      </div>
      
      {/* Registration Dialog */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogTitle>Register for {event.title}</DialogTitle>
          <DialogDescription>
            Complete the form below to register for this event. All fields are required unless marked as optional.
          </DialogDescription>
          
          <form 
            className="space-y-6 mt-4" 
            onSubmit={async (e) => {
              e.preventDefault();
              
              // Validate the form data
              const requiredFields = [
                { field: 'firstName', label: 'First Name' },
                { field: 'lastName', label: 'Last Name' },
                { field: 'contactName', label: 'Parent/Guardian Name' },
                { field: 'email', label: 'Email' },
                { field: 'tShirtSize', label: 'T-Shirt Size' },
                { field: 'grade', label: 'Grade' },
                { field: 'schoolName', label: 'School Name' }
              ];
              
              const missingFields = requiredFields.filter(
                ({ field }) => !registrationForm[field as keyof typeof registrationForm]
              );
              
              if (missingFields.length > 0) {
                toast({
                  title: "Missing Information",
                  description: `Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`,
                  variant: "destructive"
                });
                return;
              }
              
              if (!registrationForm.medicalReleaseAccepted) {
                toast({
                  title: "Medical Release Required",
                  description: "You must accept the medical release waiver to register",
                  variant: "destructive"
                });
                return;
              }
              
              // Validate day selection for Cory Land Tour
              if (event.id === 4 && registrationForm.registrationType === 'single') {
                const daySelected = registrationForm.day1 || registrationForm.day2 || registrationForm.day3;
                if (!daySelected) {
                  toast({
                    title: "Day Selection Required",
                    description: "Please select at least one day for the Cory Land Tour",
                    variant: "destructive"
                  });
                  return;
                }
              }
              
              try {
                setIsSubmitting(true);
                
                // Notify user we're processing
                toast({
                  title: "Registration In Progress",
                  description: "Preparing your registration...",
                });
                
                // Submit to backend API
                const response = await fetch(`/api/events/${eventId}/register`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    ...registrationForm,
                    eventId: eventId,
                  }),
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                  throw new Error(data.message || 'Failed to register');
                }
                
                if (data.checkoutUrl) {
                  // Registration successful, redirect to checkout
                  toast({
                    title: "Registration Successful",
                    description: "Taking you to the secure payment page...",
                  });
                  
                  // Close dialog and redirect after a short delay
                  setTimeout(() => {
                    setShowRegistrationDialog(false);
                    window.location.href = data.checkoutUrl;
                  }, 1500);
                } else {
                  toast({
                    title: "Registration Received",
                    description: "Your registration has been submitted, but payment processing is currently unavailable.",
                  });
                  setShowRegistrationDialog(false);
                }
              } catch (error) {
                console.error('Registration error:', error);
                toast({
                  title: "Registration Failed",
                  description: error instanceof Error ? error.message : "An unknown error occurred",
                  variant: "destructive"
                });
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={registrationForm.firstName}
                  onChange={(e) => setRegistrationForm({...registrationForm, firstName: e.target.value})}
                  placeholder="First name" 
                  required
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Parent/Guardian Name</Label>
                <Input 
                  id="contactName" 
                  value={registrationForm.contactName}
                  onChange={(e) => setRegistrationForm({...registrationForm, contactName: e.target.value})}
                  placeholder="Parent/Guardian name" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email" 
                  value={registrationForm.email}
                  onChange={(e) => setRegistrationForm({...registrationForm, email: e.target.value})}
                  placeholder="Email address" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input 
                  id="phone" 
                  value={registrationForm.phone}
                  onChange={(e) => setRegistrationForm({...registrationForm, phone: e.target.value})}
                  placeholder="Phone number" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tShirtSize">T-Shirt Size</Label>
                <select 
                  id="tShirtSize"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={registrationForm.tShirtSize}
                  onChange={(e) => setRegistrationForm({...registrationForm, tShirtSize: e.target.value})}
                >
                  <option value="">Select a size</option>
                  <option value="YS">Youth Small</option>
                  <option value="YM">Youth Medium</option>
                  <option value="YL">Youth Large</option>
                  <option value="AS">Adult Small</option>
                  <option value="AM">Adult Medium</option>
                  <option value="AL">Adult Large</option>
                  <option value="AXL">Adult XL</option>
                  <option value="A2XL">Adult 2XL</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Input 
                  id="grade" 
                  value={registrationForm.grade}
                  onChange={(e) => setRegistrationForm({...registrationForm, grade: e.target.value})}
                  placeholder="Current grade" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input 
                  id="schoolName" 
                  value={registrationForm.schoolName}
                  onChange={(e) => setRegistrationForm({...registrationForm, schoolName: e.target.value})}
                  placeholder="School name" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clubName">Wrestling Club (Optional)</Label>
              <Input 
                id="clubName" 
                value={registrationForm.clubName}
                onChange={(e) => setRegistrationForm({...registrationForm, clubName: e.target.value})}
                placeholder="Club name (if applicable)" 
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="medicalRelease"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                checked={registrationForm.medicalReleaseAccepted}
                onChange={(e) => setRegistrationForm({...registrationForm, medicalReleaseAccepted: e.target.checked})}
              />
              <Label htmlFor="medicalRelease" className="text-sm">
                I accept the medical release waiver and understand that Rich Habits is not responsible for any injuries that may occur.
              </Label>
            </div>
            
            <div className="space-y-2">
              <Label>Registration Type</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="fullCamp"
                    value="full"
                    name="registrationType"
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary" 
                    checked={registrationForm.registrationType === 'full'}
                    onChange={() => setRegistrationForm({...registrationForm, registrationType: 'full'})}
                  />
                  <Label htmlFor="fullCamp" className="text-sm">
                    {event.id === 2 ? 'Full Camp ($349)' : 
                     event.id === 4 ? 'All 3 Days ($200)' : 
                     'Full Camp ($249)'}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="singleDay"
                    value="single"
                    name="registrationType"
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary" 
                    checked={registrationForm.registrationType === 'single'}
                    onChange={() => setRegistrationForm({...registrationForm, registrationType: 'single'})}
                  />
                  <Label htmlFor="singleDay" className="text-sm">
                    {event.id === 2 ? 'Single Day ($175)' : 
                     event.id === 4 ? 'Select Days ($99 per day)' : 
                     'Single Day ($149)'}
                  </Label>
                </div>
              </div>
            </div>
            
            {/* Day selection for Cory Land Tour */}
            {event.id === 4 && registrationForm.registrationType === 'single' && (
              <div className="space-y-3 border rounded-md p-4 bg-gray-50 mt-4">
                <Label className="font-semibold block">Select Day(s)</Label>
                <div className="text-sm text-gray-500 mb-2">
                  Please select at least one day for the Cory Land Tour ($99 per day)
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="day1"
                      className="h-4 w-4 mr-2"
                      checked={registrationForm.day1 || false}
                      onChange={(e) => setRegistrationForm({
                        ...registrationForm, 
                        day1: e.target.checked
                      })}
                    />
                    <Label htmlFor="day1" className="cursor-pointer">
                      Day 1 - Birmingham
                    </Label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="day2"
                      className="h-4 w-4 mr-2"
                      checked={registrationForm.day2 || false}
                      onChange={(e) => setRegistrationForm({
                        ...registrationForm, 
                        day2: e.target.checked
                      })}
                    />
                    <Label htmlFor="day2" className="cursor-pointer">
                      Day 2 - Huntsville
                    </Label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="day3"
                      className="h-4 w-4 mr-2"
                      checked={registrationForm.day3 || false}
                      onChange={(e) => setRegistrationForm({
                        ...registrationForm, 
                        day3: e.target.checked
                      })}
                    />
                    <Label htmlFor="day3" className="cursor-pointer">
                      Day 3 - Montgomery
                    </Label>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowRegistrationDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Complete Registration"}
              </Button>
              
              {/* Test button (only in development) */}
              {import.meta.env.DEV && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/events/${eventId}/test-register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          ...registrationForm,
                          registrationType: registrationForm.registrationType, 
                          firstName: "Test User",
                          email: "test@example.com"
                        })
                      });
                      
                      const data = await response.json();
                      console.log('Test checkout response:', data);
                      
                      if (data.checkoutUrl) {
                        console.log('Test checkout URL created:', data.checkoutUrl);
                        toast({
                          title: "Test Checkout Created",
                          description: "Redirecting to Shopify checkout...",
                          duration: 5000
                        });
                        
                        // Slight delay to ensure toast is visible before redirect
                        setTimeout(() => {
                          window.location.href = data.checkoutUrl;
                        }, 1500);
                      } else {
                        console.error('Test checkout failed - no URL returned:', data);
                        toast({
                          title: "Test Failed",
                          description: "No checkout URL returned. See console for details.",
                          variant: "destructive",
                          duration: 7000
                        });
                      }
                    } catch (error) {
                      console.error('Test error:', error);
                      toast({
                        title: "Test Failed",
                        description: "Error creating test checkout",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  Test Registration
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}