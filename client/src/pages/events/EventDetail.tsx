import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import Container from '../../components/layout/Container';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, ChevronLeft, Star, ArrowRight, Users, Trophy, Clock } from "../../lib/icons";
import { getEventMedia } from '../../lib/eventMediaMap';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  price: number;
  description: string;
  features: string[];
  images: string[];
  slug: string;
  longDescription?: string;
  coaches?: string[];
  schedule?: string[];
  whatToBring?: string[];
  accommodations?: string[];
  pricing?: {
    individual: number;
    team: number;
    oneDay?: number;
  };
}

export default function EventDetail() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);

  // Map ID to slug for API calls
  const idToSlugMap: Record<string, string> = {
    '1': 'birmingham-slam-camp',
    '2': 'national-champ-camp', 
    '3': 'texas-recruiting-clinic',
    '4': 'panther-train-tour'
  };

  const slug = id ? idToSlugMap[id] || id : undefined;

  const { data: event } = useQuery({
    queryKey: ['/api/events', slug],
    enabled: !!slug
  });

  // Define the complete events data with all original information
  const events: Event[] = [
    {
      id: 1,
      title: "Birmingham Slam Camp",
      date: "June 19-21, 2025",
      location: "Clay-Chalkville Middle School, Birmingham, AL",
      price: 249,
      description: "A high-energy wrestling camp featuring top coaches and intensive training sessions designed to elevate your wrestling skills and competitive edge.",
      longDescription: "The Birmingham Slam Camp is where Southern grit meets elite technique. Hosted at Clay-Chalkville Middle School, this multi-day clinic features NCAA stars, high-intensity sessions, and real talks on leadership and toughness. Athletes train in a professional environment with custom gear, branded check-in, and family-friendly access. The camp combines technical training with mental preparation, creating a comprehensive development experience for wrestlers serious about advancing their skills.",
      features: [
        "NCAA champion instructors and elite coaches",
        "Specialized technique sessions for all skill levels", 
        "Leadership and mental toughness workshops",
        "Custom Rich Habits camp gear included",
        "Professional training environment",
        "Limited to 200 participants for quality instruction"
      ],
      coaches: [
        "NCAA Division I Champions",
        "Olympic Training Center Coaches",
        "High School State Champions",
        "Professional Wrestling Mentors"
      ],
      schedule: [
        "Day 1: Check-in, Technique Fundamentals, Live Wrestling",
        "Day 2: Advanced Techniques, Mental Training, Competition Prep",
        "Day 3: Tournament Practice, Awards Ceremony"
      ],
      whatToBring: [
        "Wrestling shoes (required)",
        "Athletic shorts and shirts",
        "Water bottle",
        "Towel",
        "Notebook for technique notes"
      ],
      pricing: {
        individual: 249,
        team: 199,
        oneDay: 125
      },
      images: ["/assets/SlamCampSiteBanner.png", "/assets/DSC08460--.jpg"],
      slug: "birmingham-slam-camp"
    },
    {
      id: 2,
      title: "National Champ Camp",
      date: "June 5-7, 2025",
      location: "Roy Martin Middle School, Las Vegas, NV", 
      price: 299,
      description: "Train with NCAA champions and Olympic athletes in this intensive 3-day camp focused on championship-level techniques and mindset development.",
      longDescription: "The National Champ Camp represents the pinnacle of wrestling instruction. Set in Las Vegas, this camp brings together the nation's top coaches and athletes for an unparalleled training experience. Participants work directly with NCAA champions and Olympic-level athletes, learning the techniques and mindset that separate champions from competitors. The camp features advanced training methods, mental performance coaching, and exclusive access to elite-level instruction rarely available to amateur wrestlers.",
      features: [
        "Training with NCAA champions and Olympic athletes",
        "Championship-level technique instruction",
        "Mental performance coaching",
        "Competition preparation strategies",
        "Elite-level conditioning programs",
        "Networking with top-tier athletes"
      ],
      coaches: [
        "NCAA National Champions",
        "Olympic Team Members", 
        "World Championship Medalists",
        "Elite College Head Coaches"
      ],
      schedule: [
        "Day 1: Elite Technique Sessions, Mental Performance Workshop",
        "Day 2: Advanced Competition Strategies, Live Training",
        "Day 3: Championship Mindset, Final Tournaments"
      ],
      whatToBring: [
        "Wrestling shoes (required)",
        "Multiple practice uniforms",
        "Water bottle and sports drinks",
        "Recovery gear (foam roller, etc.)",
        "Notebook for advanced techniques"
      ],
      pricing: {
        individual: 299,
        team: 249,
        oneDay: 150
      },
      images: ["/assets/LongSitePhotovegas.png", "/assets/DSC00423.JPG"],
      slug: "national-champ-camp"
    },
    {
      id: 3,
      title: "Texas Recruiting Clinic", 
      date: "June 12-13, 2025",
      location: "Arlington Martin High School, Arlington, TX",
      price: 249,
      description: "Designed specifically for high school wrestlers seeking collegiate opportunities, featuring college coach evaluations and recruitment guidance.",
      longDescription: "The Texas Recruiting Clinic is a spotlight event where wrestlers showcase their talent in front of cameras and college coaches. This intensive clinic combines skill development with visibility opportunities that can change an athlete's trajectory. Participants receive professional feedback, get filmed during live sessions, and learn directly from college coaches about what they're looking for in recruits. The clinic creates a unique bridge between high school wrestling and collegiate opportunities.",
      features: [
        "College coaches in attendance for direct scouting",
        "Professional video recording of matches and drills",
        "Personalized feedback from NCAA athletes", 
        "Recruiting workshop with application tips",
        "Networking opportunities with coaches and scouts",
        "Limited to 150 participants for maximum exposure"
      ],
      coaches: [
        "Active College Recruiting Coordinators",
        "NCAA Division I Head Coaches",
        "Former College All-Americans",
        "Recruiting Specialists"
      ],
      schedule: [
        "Day 1: Skills Assessment, College Coach Presentations, Live Wrestling",
        "Day 2: Recruiting Workshop, Final Evaluations, Networking Session"
      ],
      whatToBring: [
        "Wrestling shoes and gear",
        "Academic transcripts",
        "Athletic resume",
        "Contact information for references",
        "Professional attitude"
      ],
      pricing: {
        individual: 249,
        team: 199
      },
      images: ["/assets/RecruitingWebsiteimage4.png", "/assets/DSC09353.JPG"],
      slug: "texas-recruiting-clinic"
    },
    {
      id: 4,
      title: "Panther Train Tour",
      date: "July 23-25, 2025",
      location: "Various locations",
      price: 99,
      description: "Mobile wrestling clinic touring multiple locations, bringing elite training directly to your community.",
      longDescription: "The Panther Train Tour brings elite wrestling instruction directly to communities across the country. This mobile clinic format makes high-level coaching accessible to wrestlers who might not otherwise have the opportunity to train with top-tier instructors. Each stop features intensive training sessions, technique workshops, and personal development discussions, all delivered by experienced coaches committed to developing the next generation of wrestlers.",
      features: [
        "Multi-location training tour",
        "Community-based instruction",
        "Accessible elite coaching",
        "Local venue partnerships",
        "Flexible scheduling options",
        "Regional athlete development focus"
      ],
      coaches: [
        "Traveling Elite Instructors",
        "Regional Wrestling Champions",
        "Youth Development Specialists",
        "Community Wrestling Leaders"
      ],
      schedule: [
        "Day 1: Fundamentals Workshop, Community Introduction",
        "Day 2: Advanced Techniques, Competition Preparation", 
        "Day 3: Tournament Style Practice, Graduation Ceremony"
      ],
      whatToBring: [
        "Basic wrestling gear",
        "Positive attitude",
        "Willingness to learn",
        "Water bottle",
        "Comfortable workout clothes"
      ],
      pricing: {
        individual: 99,
        team: 79
      },
      images: ["/assets/Cory_Site_Image.png", "/assets/DSC07337--.jpg"],
      slug: "panther-train-tour"
    }
  ];

  const currentEvent = event || events.find(e => e.id.toString() === id || e.slug === slug);

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Container className="py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
            <p className="text-gray-400 mb-6">The event you're looking for could not be found.</p>
            <Link href="/events">
              <Button className="bg-red-600 hover:bg-red-700">Back to Events</Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const eventMedia = getEventMedia(currentEvent.id);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with Video Background */}
      <div className="relative h-[70vh] overflow-hidden">
        {/* Video Background */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={eventMedia.mainVideo} type="video/mp4" />
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        
        {/* Navigation */}
        <div className="absolute top-6 left-6 z-20">
          <Link href="/events">
            <Button variant="outline" className="bg-black/50 border-white/20 text-white hover:bg-black/70">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
        
        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                {currentEvent.title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl">
                {currentEvent.description}
              </p>
              <div className="flex flex-wrap items-center gap-6 text-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-red-400" />
                  <span>{currentEvent.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-red-400" />
                  <span>{currentEvent.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-red-400" />
                  <span>Limited Spots</span>
                </div>
              </div>
            </motion.div>
          </Container>
        </div>
      </div>

      {/* Main Content */}
      <Container className="py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">About This Event</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                {currentEvent.longDescription}
              </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold mb-6">What's Included</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {currentEvent.features?.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-900 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-200">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Coaches Section */}
            {currentEvent.coaches && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold mb-6">Elite Coaching Staff</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {currentEvent.coaches.map((coach, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="text-gray-200">{coach}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Schedule Section */}
            {currentEvent.schedule && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h3 className="text-2xl font-bold mb-6">Event Schedule</h3>
                <div className="space-y-3">
                  {currentEvent.schedule.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-900 rounded-lg">
                      <Clock className="w-5 h-5 text-red-400 mt-1" />
                      <span className="text-gray-200">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* What to Bring */}
            {currentEvent.whatToBring && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h3 className="text-2xl font-bold mb-6">What to Bring</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {currentEvent.whatToBring.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-gray-300">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              {/* Pricing Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800"
              >
                <h3 className="text-xl font-bold mb-4">Registration</h3>
                
                {currentEvent.pricing ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-black rounded-lg">
                      <div className="text-sm text-gray-400">Individual</div>
                      <div className="text-2xl font-bold text-white">${currentEvent.pricing.individual}</div>
                    </div>
                    <div className="p-4 bg-black rounded-lg">
                      <div className="text-sm text-gray-400">Team Rate</div>
                      <div className="text-2xl font-bold text-green-400">${currentEvent.pricing.team}</div>
                      <div className="text-xs text-gray-500">Save ${currentEvent.pricing.individual - currentEvent.pricing.team} per person</div>
                    </div>
                    {currentEvent.pricing.oneDay && (
                      <div className="p-4 bg-black rounded-lg">
                        <div className="text-sm text-gray-400">Single Day</div>
                        <div className="text-2xl font-bold text-blue-400">${currentEvent.pricing.oneDay}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-white mb-4">${currentEvent.price}</div>
                )}

                <Link href={`/register/${currentEvent.id}`}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white mt-6">
                    Register Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <div className="mt-4 text-center">
                  <Link href={`/team-registration?eventId=${currentEvent.id}`}>
                    <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800">
                      Team Registration
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Quick Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800"
              >
                <h3 className="text-lg font-bold mb-4">Event Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="text-sm text-gray-400">Date</div>
                      <div className="text-white">{currentEvent.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="text-sm text-gray-400">Location</div>
                      <div className="text-white">{currentEvent.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="text-sm text-gray-400">Capacity</div>
                      <div className="text-white">Limited Spots Available</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </Container>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 py-16">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Elevate Your Wrestling?</h2>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Join hundreds of wrestlers who have transformed their skills and mindset through our elite training programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/register/${currentEvent.id}`}>
                <Button size="lg" className="bg-white text-red-900 hover:bg-gray-100">
                  Register Individual
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href={`/team-registration?eventId=${currentEvent.id}`}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-900">
                  Team Registration
                  <Users className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </div>
    </div>
  );
}