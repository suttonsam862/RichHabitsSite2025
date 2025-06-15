import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, MapPin, CheckCircle, ChevronLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

// Authentic event data from existing EventDetails component
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
    banner: "/assets/SlamCampSiteBanner.png",
    details: [
      "NCAA champion instructors and elite coaches",
      "Specialized technique sessions for all skill levels",
      "Leadership and mental toughness workshops",
      "Custom Rich Habits camp gear included",
      "Professional training environment",
      "Limited to 200 participants to ensure quality instruction"
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
    banner: "/assets/LongSitePhotovegas.png",
    details: [
      "Training sessions led by NCAA champions",
      "Advanced technique development for competitive edge",
      "Mental performance coaching from sports psychologists",
      "Film review and strategy sessions",
      "Nutrition and recovery workshops",
      "Limited to 200 participants with selective application process"
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
    banner: "/assets/RecruitingWebsiteimage4.png",
    details: [
      "College coaches in attendance for direct scouting",
      "Professional video recording of matches and drills",
      "Personalized feedback from NCAA athletes",
      "Recruiting workshop with tips for college applications",
      "Networking opportunities with coaches and scouts",
      "Limited to 150 participants for maximum exposure"
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
    banner: "/assets/Cory_Site_Image.png",
    details: [
      "Regional stops throughout the country",
      "Training with collegiate and Olympic athletes",
      "Technique sessions tailored to regional wrestling styles",
      "Success stories and Q&A with accomplished wrestlers",
      "Exclusive Rich Habits merchandise available at each stop",
      "Affordable single-day registration options"
    ],
    slug: "panther-train-tour"
  }
];

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const id = params?.id;
  
  // Find event by ID or slug
  const currentEvent = authenticEventData.find(e => 
    e.id.toString() === id || e.slug === id
  );

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
      {/* Hero Section */}
      <div 
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${currentEvent.banner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
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
              {currentEvent.shortDescription}
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
              {currentEvent.details.map((detail, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-800">{detail}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
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
                  Individual Registration
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
      </div>
    </div>
  );
}