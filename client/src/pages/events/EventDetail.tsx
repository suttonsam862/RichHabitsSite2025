import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';

export default function EventDetail() {
  const [location] = useLocation();
  const eventId = parseInt(location.split('/').pop() || "0", 10);
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        
        // Add authentic coach data for Birmingham Slam Camp
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
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 rounded-full border-t-primary"></div>
        <p className="mt-4 text-gray-600">Loading event details...</p>
      </div>
    );
  }
  
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
      
      {/* Event Banner */}
      <div className="w-full overflow-hidden relative">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-auto object-cover" 
          onError={(e) => {
            e.currentTarget.src = '/assets/SlamCampSiteBanner.png';
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white"></div>
      </div>
      
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <span className="inline-block bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-sm mb-4">
                  {event.category}
                </span>
                
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
              </div>
              
              <div className="lg:col-span-2">
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
                    
                    <a
                      href={`/register/${eventId}`}
                      className="block w-full mt-4 font-medium py-3 px-4 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-red-600 hover:bg-red-700 text-white text-center"
                    >
                      Secure Registration
                    </a>
                    
                    <div className="mt-4 flex justify-between text-gray-500 text-sm">
                      <div className="flex items-center">
                        Ages 10+ through high school
                      </div>
                      <div className="flex items-center">
                        Limited to 200 wrestlers
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
              {event.id === 1 && (
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
                              onError={(e) => {
                                e.currentTarget.src = '/assets/coaches/placeholder.jpg';
                              }}
                            />
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-gray-800">{coach.name}</h4>
                            <p className="text-red-600 text-sm mb-2">{coach.title}</p>
                            <p className="text-gray-700 text-sm">{coach.bio}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <h2 className="text-2xl font-bold mb-6">About {event.title}</h2>
                <p className="text-gray-700 mb-6">{event.description}</p>
                
                {event.details && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">What's Included</h3>
                    <ul className="space-y-2">
                      {event.details.map((detail: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-8">
              {/* Team Registration CTA */}
              <div className="bg-gray-900 text-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Team Registration</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Bringing multiple athletes? Register as a team for special pricing and coordination.
                </p>
                <a 
                  href={`/team-register/${eventId}`}
                  className="block w-full bg-white text-gray-900 text-center py-2 px-4 rounded-md font-medium hover:bg-gray-100 transition-colors"
                >
                  Team Registration
                </a>
              </div>
              
              {/* Event Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Event Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Age Group:</span>
                    <p>Ages 10+ through high school</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Capacity:</span>
                    <p>Limited to 200 wrestlers</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Special Features:</span>
                    <p>Elite coaching and authentic wrestling experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}