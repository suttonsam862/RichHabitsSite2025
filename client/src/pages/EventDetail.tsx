import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { Container } from '@/components/ui/container';
import { FruitHuntersBanner } from '@/components/home/FruitHuntersBanner';
import { FruitHuntersCompact } from '@/components/home/FruitHuntersCompact';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Sample events data, to be replaced with API data later
const eventsData = [
  {
    id: 1,
    title: "Birmingham Slam Camp",
    slug: "birmingham-slam-camp",
    date: "June 19-21, 2025",
    category: "Wrestling Camp",
    categoryClass: "bg-blue-100 text-blue-800",
    location: "Clay-Chalkville Middle School, Birmingham, AL",
    time: "9:00 AM - 4:00 PM",
    image: "/src/assets/SlamCampSiteBanner.png",
    shortDescription: "An intensive 3-day wrestling camp featuring elite coaching from NCAA champions and Olympic-level athletes.",
    fullDescription: "Join us for the inaugural Birmingham Slam Camp, featuring world-class instruction from some of wrestling's elite competitors.\n\nAttendees will learn advanced techniques, strategy, and mental preparation from NCAA champions and Olympic-level athletes. This camp is designed for wrestlers of all levels who want to take their skills to the next level.\n\nEach day focuses on different aspects of wrestling excellence, with personalized instruction, live drilling, and competitive scenarios. Don't miss this rare opportunity to train with the best in the sport!",
    isFeatured: true,
    coaches: [
      {
        name: "Zahid Valencia",
        title: "2x NCAA Champion",
        image: "/src/assets/coaches/VALENCIA_Zahid-headshot.jpg",
        bio: "Zahid Valencia is a 2x NCAA Champion, 3x Pac-12 Champion, and 3x All-American for Arizona State University. Known for his explosive offense and innovative techniques, Zahid brings world-class expertise to the mat. Currently training for international competition, he continues to compete at the highest levels while sharing his knowledge with the next generation."
      },
      {
        name: "Josh Shields",
        title: "NCAA All-American",
        image: "/src/assets/coaches/josh_shields.jpg",
        bio: "Josh Shields is a 2x All-American from Arizona State University and current professional wrestler. His technical approach and strategic mind make him one of the most respected coaches on the circuit. Josh specializes in neutral position attacks and defensive strategy, helping wrestlers develop complete skill sets."
      },
      {
        name: "Brandon Courtney",
        title: "NCAA Finalist",
        image: "/src/assets/coaches/brandon_courtney.webp",
        bio: "Brandon Courtney is an NCAA Finalist and 2x All-American from Arizona State University. A specialist in lightweight technique and speed development, Brandon brings unique insights into creating and exploiting advantages on the mat. His focus on detailed technical execution makes him an invaluable instructor for wrestlers looking to perfect their craft."
      },
      {
        name: "Michael McGee",
        title: "NCAA All-American",
        image: "/src/assets/coaches/Michael_McGee_JouQS.jpg",
        bio: "Michael McGee is an NCAA All-American from the University of North Carolina and Arizona State University. A technique specialist and mental performance coach, Michael focuses on combining physical skills with mental toughness. His comprehensive approach helps wrestlers develop the complete package needed for success at all levels."
      }
    ],
    schedule: [
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
    ],
    price: "$249 (full camp) / $149 (single day)",
    buttonLabel: "Register Now",
    ageGroups: "2nd Grade - Senior",
    capacity: "Limited to 200 wrestlers"
  },
  {
    id: 2,
    title: "Rich Habits Showcase Tournament",
    slug: "rich-habits-showcase",
    date: "August 5, 2025",
    category: "Competition",
    categoryClass: "bg-red-100 text-red-800",
    location: "Birmingham CrossPlex",
    time: "8:00 AM - 6:00 PM",
    image: "/src/assets/events/showcase_tournament.jpg",
    shortDescription: "A premier freestyle wrestling tournament featuring top talent from across the Southeast region.",
    fullDescription: "The Rich Habits Showcase Tournament brings together the Southeast's top wrestling talent for a day of high-level competition.\n\nThis freestyle event offers divisions for youth, high school, and open wrestlers, with medals awarded to top performers in each weight class. The tournament will be run on four mats with professional officials and electronic scoring.\n\nAll participants receive a Rich Habits tournament shirt, and winners in each division earn exclusive Rich Habits championship gear. This is a perfect opportunity to test your skills against elite competition!",
    isFeatured: true,
    schedule: [
      {
        time: "8:00 AM - 9:00 AM",
        activity: "Check-in and Weigh-ins"
      },
      {
        time: "9:30 AM",
        activity: "Youth Division Begins"
      },
      {
        time: "12:00 PM",
        activity: "High School Division Begins"
      },
      {
        time: "3:00 PM",
        activity: "Open Division Begins"
      },
      {
        time: "5:30 PM",
        activity: "Awards Ceremony"
      }
    ],
    price: "$45 (pre-registration) / $55 (day of event)",
    buttonLabel: "Register Now",
    ageGroups: "8U through Open Division",
    capacity: "Limited to 64 wrestlers per division"
  }
];

export default function EventDetail() {
  const [location] = useLocation();
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    email: '',
    phone: '',
    ageGroup: '',
    experience: '',
    option: 'full', // 'full' or 'single'
  });
  const { toast } = useToast();

  // Extract the event slug from the URL
  const slug = location.split('/').pop();
  
  // Find the event by slug
  const event = eventsData.find(event => event.slug === slug);
  
  // If event not found, return basic error message
  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h1>
        <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
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
      
      {/* New Banner at the top with lighting effects */}
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-800">
                          {event.date} <span className="text-gray-500">•</span> {event.time}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-800">{event.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-800 font-medium">{event.price}</span>
                    </div>
                    
                    <button 
                      onClick={() => setShowRegistrationDialog(true)}
                      className="w-full mt-4 bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      {event.buttonLabel}
                    </button>
                    
                    <div className="mt-4 flex justify-between text-gray-500 text-sm">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {event.ageGroups}
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">9:00 AM - 9:15 AM</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <div className="font-medium">Registration & Gear Distribution</div>
                              <div className="text-xs text-gray-500 mt-1">Check-in and receive your camp materials</div>
                            </td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">9:15 AM - 11:00 AM</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <div className="font-medium">Warm-up & Technical Session</div>
                              <div className="text-xs text-gray-500 mt-1">Fun warm-up games and first technical instruction session</div>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">11:00 AM - 11:30 AM</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <div className="font-medium">Break</div>
                              <div className="text-xs text-gray-500 mt-1">Recovery time with PlayStation stations available</div>
                            </td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">11:30 AM - 12:30 PM</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <div className="font-medium">Live Wrestling & Spotlight Matches</div>
                              <div className="text-xs text-gray-500 mt-1">Live situational drilling and featured demonstration matches</div>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">12:30 PM - 1:30 PM</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <div className="font-medium">Lunch Break & Gear Shop</div>
                              <div className="text-xs text-gray-500 mt-1">Refuel and browse the Rich Habits merchandise collection</div>
                            </td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1:30 PM - 3:00 PM</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <div className="font-medium">Second Technical Session</div>
                              <div className="text-xs text-gray-500 mt-1">Advanced technique instruction and implementation drills</div>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3:00 PM - 4:00 PM</td>
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
                            src="/src/assets/coaches/VALENCIA_Zahid-headshot.jpg" 
                            alt="Zahid Valencia" 
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Zahid Valencia</h4>
                          <p className="text-gray-500 text-sm">2x NCAA Champion</p>
                        </div>
                      </div>
                      <blockquote className="text-gray-700 italic border-l-4 border-gray-200 pl-4 py-2 mb-4">
                        "I'm excited to bring world-class training to Alabama wrestlers. This camp will focus on developing complete athletes with techniques that create champions."
                      </blockquote>
                      <p className="text-sm text-gray-700 mb-4">
                        Coach Valencia specializes in explosive offensive techniques and strategic match management. His sessions will emphasize scoring from neutral position and building unstoppable confidence.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-md rounded-lg overflow-hidden mb-8 text-white">
                    <div className="border-b border-gray-700 bg-gray-800 px-6 py-4">
                      <h3 className="text-lg font-bold">Why Attend Slam Camp?</h3>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-4">
                        <li className="flex">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Learn from NCAA Champions and All-Americans</span>
                        </li>
                        <li className="flex">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Master advanced techniques and strategies</span>
                        </li>
                        <li className="flex">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Develop mental toughness and competition mindset</span>
                        </li>
                        <li className="flex">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Receive nutrition guidance from Fruit Hunters</span>
                        </li>
                        <li className="flex">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Network with other dedicated wrestlers</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8 border border-gray-200">
                    <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                      <h3 className="text-lg font-bold text-gray-800">Fruit Hunters Partnership</h3>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-700 mb-4">
                        We're excited to partner with Fruit Hunters to provide natural, nutrient-rich fuel for our athletes. Each participant will receive daily nutrition packs featuring exotic fruits selected for optimal athletic performance.
                      </p>
                      <div className="rounded-md overflow-hidden mb-3">
                        <img src="/src/assets/fruits/fruit_hunters_logo.png" alt="Fruit Hunters" className="w-full h-auto" />
                      </div>
                      <a href="#" className="text-primary hover:text-primary-dark text-sm font-medium">Learn more about Fruit Hunters →</a>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8 border border-gray-200">
                    <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                      <h3 className="text-lg font-bold text-gray-800">Event Highlights</h3>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-4">
                        <li className="flex">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Professional officiating and scoring</span>
                        </li>
                        <li className="flex">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Medals for top performers in each division</span>
                        </li>
                        <li className="flex">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Rich Habits tournament t-shirt for all participants</span>
                        </li>
                        <li className="flex">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Live streaming of featured matches</span>
                        </li>
                        <li className="flex">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Exclusive Rich Habits gear for division champions</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </>
              )}
              
              <div className="sticky top-8">
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                  <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                    <h3 className="text-lg font-bold text-gray-800">Need Help?</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 mb-4">
                      Have questions about this event? Contact our team for assistance.
                    </p>
                    <div className="flex items-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700">events@richhabits.com</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-700">(205) 555-0123</span>
                    </div>
                    <a 
                      href="/contact" 
                      className="mt-6 block text-center bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 font-medium py-2 px-4 rounded-md transition-colors duration-300"
                    >
                      Contact Us
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
        
        {/* Full-width Registration Section with Pricing Cards */}
        {event.id === 1 && (
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
        )}
        
        <Container>
          <div className="mb-12">
            <FruitHuntersBanner />
          </div>
          
          {event.id === 1 && (
            <div className="mb-16">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-lg mb-2">What should I bring to camp?</h4>
                    <p className="text-gray-700 mb-4">Wrestlers should bring multiple changes of workout clothes, wrestling shoes, headgear (optional), water bottle, and a notebook for taking notes. Lunch is not provided, so please bring a lunch or money to purchase food.</p>
                    
                    <h4 className="font-bold text-lg mb-2">Is there a minimum age requirement?</h4>
                    <p className="text-gray-700 mb-4">The camp is open to wrestlers from 2nd grade through high school seniors. Wrestlers will be grouped by age and experience level for appropriate training.</p>
                    
                    <h4 className="font-bold text-lg mb-2">Are there refunds if I can't attend?</h4>
                    <p className="text-gray-700">Refunds are available up to 14 days before the event with a 15% processing fee. Within 14 days, you can transfer your registration to another wrestler or receive camp credit for a future event.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-lg mb-2">Will there be medical staff on site?</h4>
                    <p className="text-gray-700 mb-4">Yes, certified athletic trainers will be present throughout the camp to handle any injuries or medical concerns.</p>
                    
                    <h4 className="font-bold text-lg mb-2">Can parents stay and watch?</h4>
                    <p className="text-gray-700 mb-4">Parents are welcome to observe from designated viewing areas. We also offer a special coaches' observation section for school/club coaches.</p>
                    
                    <h4 className="font-bold text-lg mb-2">What's the coach-to-wrestler ratio?</h4>
                    <p className="text-gray-700">We maintain approximately a 1:15 coach-to-wrestler ratio to ensure quality instruction. In addition to our headline coaches, we'll have experienced assistant coaches helping with all sessions.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Container>
      </div>
      
      {/* Registration Dialog */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="pb-3 mb-4 border-b">
            <h3 className="text-lg font-bold">Register for {event.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{event.date} at {event.location}</p>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            // Simulate form submission
            toast({
              title: "Registration submitted",
              description: "We'll email you confirmation details shortly.",
            });
            setShowRegistrationDialog(false);
          }}>
            <div className="grid gap-4 mb-5">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={registrationForm.name} 
                  onChange={(e) => setRegistrationForm({...registrationForm, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={registrationForm.email} 
                  onChange={(e) => setRegistrationForm({...registrationForm, email: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={registrationForm.phone} 
                  onChange={(e) => setRegistrationForm({...registrationForm, phone: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="ageGroup">Age Group / Grade</Label>
                <Input 
                  id="ageGroup" 
                  value={registrationForm.ageGroup} 
                  onChange={(e) => setRegistrationForm({...registrationForm, ageGroup: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="experience">Wrestling Experience</Label>
                <Input 
                  id="experience" 
                  value={registrationForm.experience} 
                  onChange={(e) => setRegistrationForm({...registrationForm, experience: e.target.value})}
                  placeholder="Years of experience, achievements, etc."
                />
              </div>
              
              {event.id === 1 && (
                <div className="space-y-2">
                  <Label>Registration Option</Label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="option" 
                        value="full" 
                        checked={registrationForm.option === 'full'} 
                        onChange={() => setRegistrationForm({...registrationForm, option: 'full'})}
                        className="rounded-full"
                      />
                      <span>Full Camp ($249)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="option" 
                        value="single" 
                        checked={registrationForm.option === 'single'} 
                        onChange={() => setRegistrationForm({...registrationForm, option: 'single'})}
                        className="rounded-full"
                      />
                      <span>Single Day ($149)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowRegistrationDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Complete Registration</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}