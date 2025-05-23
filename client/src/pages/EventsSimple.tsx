import { Link } from "wouter";

// Simplified event data
const events = [
  {
    id: 1,
    title: "Birmingham Slam Camp",
    date: "June 19-21, 2025",
    location: "Clay-Chalkville Middle School, Birmingham, AL",
    price: "$249"
  },
  {
    id: 2,
    title: "National Champ Camp",
    date: "June 5-7, 2025",
    location: "Roy Martin Middle School, Las Vegas, NV",
    price: "$349"
  },
  {
    id: 3,
    title: "Texas Recruiting Clinic",
    date: "June 12-13, 2025",
    location: "Arlington Martin High School, Arlington, TX",
    price: "$249"
  },
  {
    id: 4,
    title: "Panther Train Tour",
    date: "July 23-25, 2025",
    location: "Various locations",
    price: "$99 per day"
  }
];

// Simple Events component without animations or heavy image loading
export default function EventsSimple() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Video background */}
      <div className="relative h-[67vh] mb-8 bg-red-600 overflow-hidden">
        {/* Video Background */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/events-hero.webm" type="video/webm" />
          <source src="/videos/events-hero.mp4" type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-6 h-full flex items-end pb-16 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl text-white mb-8 title-font tracking-wider">
              Events
            </h1>
            <p className="text-xl text-gray-200 mb-10 subtitle-font">
              Premium wrestling camps and clinics designed to elevate your skills, technique, and competitive edge.
            </p>
          </div>
        </div>
        
        {/* Subtle sky accent line */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-200 opacity-30"></div>
      </div>
      
      {/* Events Grid */}
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {events.map((event) => (
            <div 
              key={event.id}
              className="group bg-white shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <Link href={`/events/${event.id}`}>
                {/* Video preview for event */}
                <div className="h-40 w-full relative overflow-hidden bg-red-600">
                  <video 
                    autoPlay
                    muted 
                    loop 
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    {event.id === 1 ? (
                      <>
                        <source src="/videos/slamcamp.webm" type="video/webm" />
                        <source src="/videos/slamcamp.mp4" type="video/mp4" />
                      </>
                    ) : event.id === 2 ? (
                      <>
                        <source src="/videos/national-champ-camp.webm" type="video/webm" />
                        <source src="/videos/national-champ-camp.mp4" type="video/mp4" />
                      </>
                    ) : event.id === 3 ? (
                      <>
                        <source src="/videos/texas-recruiting-clinic.webm" type="video/webm" />
                        <source src="/videos/texas-recruiting-clinic.mp4" type="video/mp4" />
                      </>
                    ) : (
                      // Default fallback for other events
                      <>
                        <source src="/videos/slamcamp.webm" type="video/webm" />
                        <source src="/videos/slamcamp.mp4" type="video/mp4" />
                      </>
                    )}
                  </video>
                </div>
                
                {/* Content Section */}
                <div className="p-6">
                  <h2 className="text-2xl mb-3 title-font tracking-wide">{event.title}</h2>
                  <div className="mb-1">
                    <span className="text-sm text-gray-500 subtitle-font">{event.date}</span>
                  </div>
                  <div className="mb-3">
                    <span className="text-sm text-gray-600 subtitle-font">{event.location}</span>
                  </div>
                  <div className="text-md font-medium text-gray-800 subtitle-font">
                    {event.price}
                  </div>
                  <div className="mt-5">
                    <span className="text-sm font-medium text-gray-900 border-b border-gray-900 pb-1 hover:text-sky-800 hover:border-sky-800 transition-colors inline-block subtitle-font">
                      View Details
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}