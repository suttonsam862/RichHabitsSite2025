import { useState } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, CheckCircle, Star, ChevronLeft, ChevronRight, Play, Pause, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  price: number;
  description: string;
  longDescription: string;
  features: string[];
  coaches: string[];
  schedule: { day: string; activities: string[] }[];
  whatToBring: string[];
  images: string[];
  slug: string;
}

const getEventMedia = (eventId: number) => {
  const mediaMap: Record<number, { video?: string; images: string[] }> = {
    1: { // Birmingham Slam Camp
      video: "/videos/birmingham-slam-preview.mp4",
      images: [
        "/assets/SlamCampSiteBanner.png",
        "/assets/DSC08460--.jpg",
        "/images/events/birmingham-camp-3.jpg"
      ]
    },
    2: { // National Champ Camp
      video: "/videos/national-champ-preview.mp4", 
      images: [
        "/images/events/national-champ-1.jpg",
        "/images/events/national-champ-2.jpg",
        "/images/events/national-champ-3.jpg"
      ]
    },
    3: { // Texas Recruiting Clinic
      video: "/videos/texas-recruiting-preview.mp4",
      images: [
        "/images/events/texas-recruiting-1.jpg",
        "/images/events/texas-recruiting-2.jpg", 
        "/images/events/texas-recruiting-3.jpg"
      ]
    },
    4: { // Panther Train Tour
      video: "/videos/panther-train-preview.mp4",
      images: [
        "/images/events/panther-train-1.jpg",
        "/images/events/panther-train-2.jpg",
        "/images/events/panther-train-3.jpg"
      ]
    }
  };

  const media = mediaMap[eventId];
  if (!media) {
    console.warn(`No media defined for event ID ${eventId}, using fallback media`);
    return {
      video: "/videos/default-preview.mp4",
      images: ["/assets/SlamCampSiteBanner.png", "/assets/DSC08460--.jpg"]
    };
  }
  
  return media;
};

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  
  // Parse the ID from URL params - handle both numeric IDs and slugs
  const id = params?.id;
  const slug = isNaN(Number(id)) ? id : null;

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
        {
          day: "Day 1 (Thursday)",
          activities: [
            "8:30 AM - Check-in & Registration",
            "9:00 AM - Opening Ceremony & Welcome", 
            "9:30 AM - Technique Session: Basic Takedowns",
            "10:45 AM - Break",
            "11:00 AM - Live Wrestling & Drilling",
            "12:00 PM - Lunch Break",
            "1:00 PM - Mental Performance Workshop",
            "2:00 PM - Advanced Technique: Mat Wrestling",
            "3:15 PM - Conditioning & Fitness",
            "4:00 PM - Day 1 Wrap-up & Q&A"
          ]
        },
        {
          day: "Day 2 (Friday)",
          activities: [
            "9:00 AM - Dynamic Warm-up",
            "9:30 AM - Technique Session: Escapes & Reversals",
            "10:45 AM - Break",
            "11:00 AM - Positional Wrestling", 
            "12:00 PM - Lunch Break",
            "1:00 PM - Competition Strategy",
            "2:00 PM - Advanced Technique: Top Position",
            "3:15 PM - Strength & Conditioning",
            "4:00 PM - Day 2 Recap"
          ]
        },
        {
          day: "Day 3 (Saturday)",
          activities: [
            "9:00 AM - Final Warm-up",
            "9:30 AM - Technique Review & Q&A",
            "10:30 AM - Practice Matches",
            "11:30 AM - Awards & Recognition",
            "12:00 PM - Closing Ceremony",
            "12:30 PM - Photos & Farewells"
          ]
        }
      ],
      whatToBring: [
        "Wrestling shoes (required)",
        "Athletic shorts (no pockets or zippers)",
        "Moisture-wicking t-shirts",
        "Water bottle",
        "Towel",
        "Notebook and pen for notes",
        "Positive attitude and willingness to learn"
      ],
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
      longDescription: "The National Champ Camp delivers three days of instruction from NCAA champions in a high-level environment with media coverage, mental coaching, and signature Rich Habits style. This premier event brings together the nation's top wrestlers and coaches for an immersive experience that goes beyond technique. Participants train in state-of-the-art facilities, receive personalized coaching, and build connections that last long after the camp ends.",
      features: [
        "Training sessions led by NCAA champions",
        "Advanced technique development for competitive edge",
        "Mental performance coaching from sports psychologists", 
        "Film review and strategy sessions",
        "Nutrition and recovery workshops",
        "Limited to 200 participants with selective application process"
      ],
      coaches: [
        "NCAA Division I National Champions",
        "Olympic Training Partners",
        "World Championship Medalists",
        "Elite College Coaches"
      ],
      schedule: [
        {
          day: "Day 1 (Thursday)",
          activities: [
            "8:00 AM - Elite Check-in Process",
            "8:30 AM - Championship Mindset Session",
            "9:30 AM - Advanced Takedown Techniques",
            "11:00 AM - Break & Hydration",
            "11:15 AM - Mental Performance Workshop",
            "12:30 PM - Catered Lunch",
            "1:30 PM - Film Study & Analysis",
            "2:30 PM - Live Wrestling with Champions",
            "3:45 PM - Recovery & Flexibility",
            "4:30 PM - Day 1 Debrief"
          ]
        },
        {
          day: "Day 2 (Friday)", 
          activities: [
            "8:30 AM - Dynamic Championship Warm-up",
            "9:00 AM - Advanced Mat Wrestling",
            "10:30 AM - Break",
            "10:45 AM - Competition Psychology",
            "12:00 PM - Lunch & Nutrition Seminar",
            "1:00 PM - Championship Drilling",
            "2:30 PM - Situational Wrestling",
            "3:45 PM - Strength & Conditioning",
            "4:30 PM - Champion Q&A Session"
          ]
        },
        {
          day: "Day 3 (Saturday)",
          activities: [
            "8:30 AM - Final Preparation",
            "9:00 AM - Championship Challenge Matches",
            "10:30 AM - Awards & Recognition Ceremony",
            "11:30 AM - Photo Sessions with Champions",
            "12:00 PM - Closing Ceremony",
            "12:30 PM - Networking & Farewell"
          ]
        }
      ],
      whatToBring: [
        "Wrestling shoes (required)",
        "Competition-quality wrestling singlet",
        "Athletic wear for training",
        "Multiple water bottles",
        "Towel and personal hygiene items",
        "Notebook for technique notes",
        "Camera for memories with champions"
      ],
      images: ["/images/events/national-champ-1.jpg", "/images/events/national-champ-2.jpg", "/images/events/national-champ-3.jpg"],
      slug: "national-champ-camp"
    },
    {
      id: 3,
      title: "Texas Recruiting Clinic",
      date: "June 12-13, 2025", 
      location: "Arlington Martin High School, Arlington, TX",
      price: 249,
      description: "Designed specifically for high school wrestlers seeking collegiate opportunities, featuring college coach evaluations and recruitment guidance.",
      longDescription: "The Texas Recruiting Clinic is a spotlight event where wrestlers showcase their talent in front of cameras and college coaches. This intensive combines skill development with visibility opportunities that can change an athlete's trajectory. Participants receive professional feedback, get filmed during live sessions, and learn directly from college coaches about what they're looking for in recruits.",
      features: [
        "College coaches in attendance for direct scouting",
        "Professional video recording of matches and drills",
        "Personalized feedback from NCAA athletes",
        "Recruiting workshop with tips for college applications",
        "Networking opportunities with coaches and scouts",
        "Limited to 150 participants for maximum exposure"
      ],
      coaches: [
        "Active NCAA Division I Coaches",
        "College Recruiting Coordinators",
        "Former College All-Americans",
        "Sports Psychology Professionals"
      ],
      schedule: [
        {
          day: "Day 1 (Thursday)",
          activities: [
            "8:00 AM - Athlete Check-in & Profile Setup",
            "9:00 AM - Recruiting Process Overview",
            "10:00 AM - Skills Assessment & Filming",
            "11:30 AM - Break",
            "12:00 PM - College Coach Panel Discussion",
            "1:00 PM - Lunch & Networking",
            "2:00 PM - Live Wrestling Evaluations",
            "3:30 PM - Individual Coach Meetings",
            "4:30 PM - Day 1 Wrap-up"
          ]
        },
        {
          day: "Day 2 (Friday)",
          activities: [
            "9:00 AM - Technique Refinement Session",
            "10:30 AM - Competition Simulation",
            "12:00 PM - Final Evaluations & Filming",
            "1:00 PM - Lunch & Results Discussion",
            "2:00 PM - Scholarship Information Session",
            "3:00 PM - Individual Action Plans",
            "4:00 PM - Closing Ceremony & Next Steps"
          ]
        }
      ],
      whatToBring: [
        "Wrestling shoes (required)",
        "Competition singlet",
        "Athletic shorts and shirts",
        "Academic transcripts (unofficial copies)",
        "Athletic resume or highlight reel",
        "Water bottle and snacks",
        "Professional attitude and goals"
      ],
      images: ["/images/events/texas-recruiting-1.jpg", "/images/events/texas-recruiting-2.jpg", "/images/events/texas-recruiting-3.jpg"],
      slug: "texas-recruiting-clinic"
    },
    {
      id: 4,
      title: "Panther Train Tour",
      date: "June 15-17, 2025",
      location: "Multiple locations nationwide",
      price: 99,
      description: "Mobile wrestling clinic touring multiple locations, bringing elite training directly to your community.",
      longDescription: "The Panther Train Tour brings elite wrestling instruction directly to communities across the nation. This mobile clinic format makes high-quality coaching accessible to wrestlers who might not otherwise have the opportunity to train with top-level instructors. Each stop features intensive technique sessions, mental preparation, and the signature Rich Habits approach to wrestling excellence.",
      features: [
        "Multi-location tour bringing coaching to you",
        "Community-focused instruction and outreach",
        "Accessible pricing for all athletes",
        "Regional development and talent identification",
        "Local partnerships with wrestling programs",
        "Flexible scheduling to accommodate communities"
      ],
      coaches: [
        "Touring Professional Coaches",
        "Regional Wrestling Ambassadors",
        "Community Outreach Specialists",
        "Local Wrestling Legends"
      ],
      schedule: [
        {
          day: "Tour Stop Schedule",
          activities: [
            "Location-specific timing (typically 6:00 PM - 9:00 PM)",
            "Community welcome and introductions",
            "Fundamental technique instruction",
            "Local athlete showcases",
            "Q&A with touring coaches",
            "Community building activities",
            "Next location preview"
          ]
        }
      ],
      whatToBring: [
        "Wrestling shoes (required)",
        "Comfortable athletic wear",
        "Water bottle",
        "Towel",
        "Enthusiasm for learning",
        "Community spirit"
      ],
      images: ["/images/events/panther-train-1.jpg", "/images/events/panther-train-2.jpg", "/images/events/panther-train-3.jpg"],
      slug: "panther-train-tour"
    }
  ];

  // Find the event by ID or slug
  const event = events.find(e => e.id.toString() === id || e.slug === slug);
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % eventMedia.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + eventMedia.images.length) % eventMedia.images.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section with Video Background */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {showVideo && eventMedia.video ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={eventMedia.video} type="video/mp4" />
          </video>
        ) : (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${eventMedia.images[currentImageIndex]})` 
            }}
          />
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        
        <Container className="relative z-10 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              {currentEvent.title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              {currentEvent.description}
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-red-400" />
                <span className="text-lg">{currentEvent.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-red-400" />
                <span className="text-lg">{currentEvent.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400" />
                <span className="text-lg font-bold">${currentEvent.price}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/register/${currentEvent.id}`}>
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg">
                  Register Now
                </Button>
              </Link>
              <Link href={`/team-register/${currentEvent.id}`}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg">
                  Team Registration
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>

        {/* Media Controls */}
        <div className="absolute bottom-8 left-8 flex gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowVideo(!showVideo)}
            className="text-white border-white hover:bg-white hover:text-black"
          >
            {showVideo ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {showVideo ? 'Show Images' : 'Play Video'}
          </Button>
          
          {!showVideo && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevImage}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextImage}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Back to Events Link */}
        <div className="absolute top-8 left-8">
          <Link href="/events">
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>

      {/* Event Details Content */}
      <div className="bg-white">
        <Container className="py-16">
          {/* Description Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">About This Event</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {currentEvent.longDescription}
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-16"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">What's Included</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentEvent.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-800">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Coaches Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-16"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Meet Your Coaches</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentEvent.coaches.map((coach, index) => (
                <div key={index} className="text-center p-6 bg-gradient-to-br from-red-50 to-gray-50 rounded-lg">
                  <Trophy className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900">{coach}</h4>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Schedule Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mb-16"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Event Schedule</h3>
            <div className="space-y-8">
              {currentEvent.schedule.map((daySchedule, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-600" />
                    {daySchedule.day}
                  </h4>
                  <div className="grid gap-2">
                    {daySchedule.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-center gap-3 py-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700">{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* What to Bring Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="mb-16"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">What to Bring</h3>
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {currentEvent.whatToBring.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-800">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-center bg-gradient-to-r from-red-600 to-red-700 text-white p-12 rounded-2xl"
          >
            <h3 className="text-3xl font-bold mb-4">Ready to Join Us?</h3>
            <p className="text-xl mb-8 opacity-90">
              Secure your spot at {currentEvent.title} and take your wrestling to the next level.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/register/${currentEvent.id}`}>
                <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 text-lg">
                  Individual Registration
                </Button>
              </Link>
              <Link href={`/team-register/${currentEvent.id}`}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-600 px-8 py-4 text-lg">
                  Team Registration
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </div>
    </div>
  );
}