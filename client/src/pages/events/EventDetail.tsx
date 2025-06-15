import React, { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Shield, ChevronLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { getEventMedia } from '@/lib/eventMediaMap';
import CoachList from '@/components/events/CoachList';

// Authentic event data from the existing codebase
const authenticEventData = [
  {
    id: 1,
    title: "Birmingham Slam Camp",
    shortDescription: "Southern grit meets elite technique",
    location: "Clay-Chalkville Middle School",
    date: "June 19-21, 2025",
    primaryColor: "#FF6B00",
    secondaryColor: "#FFA500",
    longDescription: "The Birmingham Slam Camp is where Southern grit meets elite technique. Hosted at Clay-Chalkville Middle School, this multi-day clinic features NCAA stars, high-intensity sessions, and real talks on leadership and toughness. Athletes train in a professional environment with custom gear, branded check-in, and family-friendly access. The camp combines technical training with mental preparation, creating a comprehensive development experience for wrestlers serious about advancing their skills.",
    details: [
      "NCAA champion instructors and elite coaches",
      "Specialized technique sessions for all skill levels",
      "Leadership and mental toughness workshops",
      "Custom Rich Habits camp gear included",
      "Professional training environment",
      "Limited to 200 participants to ensure quality instruction"
    ],
    clinicians: [
      {
        name: "Bo Nickal",
        credentials: "3x NCAA Champion, UFC Fighter",
        specialty: "Takedowns & Transitions",
        image: "/assets/bo-nickal.jpg"
      },
      {
        name: "David Taylor",
        credentials: "2x NCAA Champion, Olympic Gold Medalist",
        specialty: "Championship Mindset & Technique",
        image: "/assets/david-taylor.jpg"
      },
      {
        name: "Carter Starocci",
        credentials: "4x NCAA Champion",
        specialty: "Mental Performance & Competition",
        image: "/assets/carter-starocci.jpg"
      }
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
    slug: "birmingham-slam-camp"
  },
  {
    id: 2,
    title: "National Champ Camp",
    shortDescription: "Three days of elite instruction from NCAA champions",
    location: "Roy Martin Middle School",
    date: "June 5-7, 2025",
    primaryColor: "#041e42",
    secondaryColor: "#1e88e5",
    longDescription: "The National Champ Camp at Roy Martin Middle School delivers three days of instruction from NCAA champions in a high-level environment with media coverage, mental coaching, and signature Rich Habits style. This premier event brings together the nation's top wrestlers and coaches for an immersive experience that goes beyond technique. Participants train in state-of-the-art facilities, receive personalized coaching, and build connections that last long after the camp ends. The camp's championship mindset philosophy helps athletes break through mental barriers and reach new levels.",
    details: [
      "Training sessions led by NCAA champions",
      "Advanced technique development for competitive edge",
      "Mental performance coaching from sports psychologists",
      "Film review and strategy sessions",
      "Nutrition and recovery workshops",
      "Limited to 200 participants with selective application process"
    ],
    clinicians: [
      {
        name: "Roman Bravo-Young",
        credentials: "NCAA Champion, World Team Member",
        specialty: "Speed & Agility Techniques",
        image: "/assets/roman-bravo-young.jpg"
      },
      {
        name: "Aaron Brooks",
        credentials: "2x NCAA Champion",
        specialty: "Scoring & Offensive Wrestling",
        image: "/assets/aaron-brooks.jpg"
      },
      {
        name: "Nick Lee",
        credentials: "NCAA Champion, World Bronze Medalist",
        specialty: "Defensive Wrestling & Counters",
        image: "/assets/nick-lee.jpg"
      },
      {
        name: "Spencer Lee",
        credentials: "3x NCAA Champion",
        specialty: "Mental Toughness & Competition",
        image: "/assets/spencer-lee.jpg"
      }
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
    slug: "national-champ-camp"
  },
  {
    id: 3,
    title: "Texas Recruiting Clinic",
    shortDescription: "Showcase your talent in front of cameras and coaches",
    location: "Arlington Martin High School",
    date: "June 12-13, 2025",
    primaryColor: "#B22234",
    secondaryColor: "#3C3B6E",
    longDescription: "The Texas Recruiting Clinic at Arlington Martin High School is a spotlight event where wrestlers showcase their talent in front of cameras and college coaches. This one-day intensive combines skill development with visibility opportunities that can change an athlete's trajectory. Participants receive professional feedback, get filmed during live sessions, and learn directly from college coaches about what they're looking for in recruits. The clinic creates a unique bridge between high school wrestling and collegiate opportunities.",
    details: [
      "College coaches in attendance for direct scouting",
      "Professional video recording of matches and drills",
      "Personalized feedback from NCAA athletes",
      "Recruiting workshop with tips for college applications",
      "Networking opportunities with coaches and scouts",
      "Limited to 150 participants for maximum exposure"
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
    slug: "texas-recruiting-clinic"
  },
  {
    id: 4,
    title: "Panther Train Tour",
    shortDescription: "Elite training brought directly to regions across the country",
    location: "Multiple locations nationwide",
    date: "June 15-17, 2025",
    primaryColor: "#6a0dad",
    secondaryColor: "#ffd700",
    longDescription: "The nationwide Panther Train Tour (formerly the Cory Land Tour) brings elite training directly to regions across the country, mimicking mini camps with live sessions, merchandise drops, and stories from athletes who've made it. This innovative approach makes high-level instruction accessible to wrestlers in diverse communities. Each stop features intensive training, motivation from successful athletes, and the signature Rich Habits approach to development. The tour creates a nationwide community of wrestlers connected through shared experiences and training philosophy.",
    details: [
      "Regional stops throughout the country",
      "Training with collegiate and Olympic athletes",
      "Technique sessions tailored to regional wrestling styles",
      "Success stories and Q&A with accomplished wrestlers",
      "Exclusive Rich Habits merchandise available at each stop",
      "Affordable single-day registration options"
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
    slug: "panther-train-tour"
  }
];

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  const id = params?.id;
  
  // Find event by ID or slug
  const currentEvent = authenticEventData.find(e => 
    e.id.toString() === id || e.slug === id
  );

  // Get media for this event
  const eventMedia = currentEvent ? getEventMedia(currentEvent.id) : null;

  useEffect(() => {
    if (eventMedia?.galleryImages && eventMedia.galleryImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => 
          prev === eventMedia.galleryImages.length - 1 ? 0 : prev + 1
        );
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [eventMedia]);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Video/Image Background */}
      <div className="relative h-screen overflow-hidden">
        {/* Background Media */}
        <div className="absolute inset-0">
          {eventMedia?.mainVideo && !eventMedia.preferImageOnly ? (
            <video
              autoPlay={!eventMedia.disableAutoplay}
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              poster={eventMedia.mainVideoPoster}
            >
              <source src={eventMedia.mainVideo} type="video/mp4" />
            </video>
          ) : (
            <img
              src={eventMedia?.banner || "/assets/SlamCampSiteBanner.png"}
              alt={currentEvent.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        
        <Container className="relative z-10 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl text-white"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              {currentEvent.title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl leading-relaxed">
              {currentEvent.shortDescription}
            </p>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-red-400" />
                <span className="text-lg">{currentEvent.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-red-400" />
                <span className="text-lg">{currentEvent.location}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/register/${currentEvent.id}`}>
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg">
                  Register Now
                  <ArrowRight className="ml-2 h-4 w-4" />
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

      {/* Event Content */}
      <div className="bg-white">
        <Container className="py-16">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">About This Event</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
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
              {currentEvent.details.map((detail, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-800">{detail}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Schedule Section */}
          {currentEvent.schedule && currentEvent.schedule.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mb-16"
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Event Schedule</h3>
              <div className="grid gap-6">
                {currentEvent.schedule.map((day, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">{day.day}</h4>
                    <div className="space-y-2">
                      {day.activities.map((activity, actIndex) => (
                        <div key={actIndex} className="flex items-center gap-3 text-gray-700">
                          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* What to Bring Section */}
          {currentEvent.whatToBring && currentEvent.whatToBring.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mb-16"
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">What to Bring</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentEvent.whatToBring.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-800">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Coaching Staff Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="mb-16"
          >
            <CoachList eventId={currentEvent.id} />
          </motion.div>

          {/* Video Gallery Section */}
          {eventMedia && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mb-16"
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Event Highlights</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Main Video */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    poster={eventMedia.mainVideoPoster}
                  >
                    <source src={eventMedia.mainVideo} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <div className="text-white text-center">
                      <h4 className="text-lg font-bold mb-2">Main Event</h4>
                    </div>
                  </div>
                </div>

                {/* Highlight Video */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    poster={eventMedia.highlightVideoPoster}
                  >
                    <source src={eventMedia.highlightVideo} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <div className="text-white text-center">
                      <h4 className="text-lg font-bold mb-2">Highlights</h4>
                    </div>
                  </div>
                </div>

                {/* Feature Video */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    poster={eventMedia.featureVideoPoster}
                  >
                    <source src={eventMedia.featureVideo} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <div className="text-white text-center">
                      <h4 className="text-lg font-bold mb-2">Features</h4>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Photo Gallery */}
          {eventMedia?.galleryImages && eventMedia.galleryImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="mb-16"
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Photo Gallery</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {eventMedia.galleryImages.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={image}
                      alt={`${currentEvent.title} Photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/SlamCampSiteBanner.png';
                      }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Registration Options Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="mb-16"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Registration Options</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Individual Registration */}
              <div className="bg-white rounded-lg border-2 border-gray-200 p-8 hover:border-red-500 transition-colors">
                <div className="text-center mb-6">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Individual Registration</h4>
                  <p className="text-gray-600">Perfect for individual athletes</p>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span>Secure online registration</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Full event access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Custom gear included</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Certificate of completion</span>
                  </div>
                </div>
                <Link href={`/register/${currentEvent.id}`}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-3">
                    <Shield className="mr-2 h-4 w-4" />
                    Secure Individual Registration
                  </Button>
                </Link>
              </div>

              {/* Team Registration */}
              <div className="bg-white rounded-lg border-2 border-gray-200 p-8 hover:border-blue-500 transition-colors">
                <div className="text-center mb-6">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Team Registration</h4>
                  <p className="text-gray-600">Best value for teams and clubs</p>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span>Secure team management</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Group discounts available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Coach coordination tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Team photo opportunities</span>
                  </div>
                </div>
                <Link href={`/team-register/${currentEvent.id}`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                    <Users className="mr-2 h-4 w-4" />
                    Secure Team Registration
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="text-center rounded-2xl p-12"
            style={{
              background: `linear-gradient(135deg, ${currentEvent.primaryColor}, ${currentEvent.secondaryColor})`
            }}
          >
            <h3 className="text-3xl font-bold mb-4 text-white">Ready to Join Us?</h3>
            <p className="text-xl mb-8 text-white opacity-90">
              Secure your spot at {currentEvent.title} and take your wrestling to the next level.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/register/${currentEvent.id}`}>
                <Button size="lg" className="bg-white hover:bg-gray-100 px-8 py-4 text-lg" style={{ color: currentEvent.primaryColor }}>
                  <Shield className="mr-2 h-4 w-4" />
                  Secure Registration
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/team-register/${currentEvent.id}`}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg">
                  <Users className="mr-2 h-4 w-4" />
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