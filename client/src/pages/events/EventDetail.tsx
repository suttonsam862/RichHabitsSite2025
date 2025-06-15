import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import Container from '../../components/layout/Container';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, ChevronLeft, Star, ArrowRight, Users, Trophy, Clock, DollarSign } from "../../lib/icons";
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

  // Define the actual events data
  const events: Event[] = [
    {
      id: 1,
      title: "Birmingham Slam Camp",
      date: "June 19-21, 2025",
      location: "Clay-Chalkville Middle School, Birmingham, AL",
      price: 249,
      description: "A high-energy wrestling camp featuring top coaches and intensive training sessions designed to elevate your wrestling skills and competitive edge.",
      features: [
        "NCAA champion instructors and elite coaches",
        "Specialized technique sessions for all skill levels", 
        "Leadership and mental toughness workshops",
        "Custom Rich Habits camp gear included",
        "Professional training environment",
        "Limited to 200 participants for quality instruction"
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
      features: [
        "Training with NCAA champions and Olympic athletes",
        "Championship-level technique instruction",
        "Mental performance coaching",
        "Competition preparation strategies",
        "Elite-level conditioning programs",
        "Networking with top-tier athletes"
      ],
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
      features: [
        "College coaches in attendance for direct scouting",
        "Professional video recording of matches and drills",
        "Personalized feedback from NCAA athletes", 
        "Recruiting workshop with application tips",
        "Networking opportunities with coaches and scouts",
        "Limited to 150 participants for maximum exposure"
      ],
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
      features: [
        "Multi-location training tour",
        "Community-based instruction",
        "Accessible elite coaching",
        "Local venue partnerships",
        "Flexible scheduling options",
        "Regional athlete development focus"
      ],
      images: ["/assets/Cory_Site_Image.png", "/assets/DSC07337--.jpg"],
      slug: "panther-train-tour"
    }
  ];

  const currentEvent = event || events.find(e => e.id.toString() === id || e.slug === slug);

  if (!currentEvent) {
    return (
      <Container className="py-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-6">The event you're looking for could not be found.</p>
          <Link href="/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Container className="py-8">
        <Link href="/events" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
              <img
                src={currentEvent.images[selectedImage] || "/hero-bg.jpg"}
                alt={currentEvent.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {currentEvent.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-video overflow-hidden rounded border-2 ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${currentEvent.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-4">{currentEvent.title}</h1>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-2" />
                {currentEvent.date}
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2" />
                {currentEvent.location}
              </div>
            </div>

            <div className="mb-8">
              <span className="text-3xl font-bold text-blue-600">${currentEvent.price}</span>
              <span className="text-gray-600 ml-2">per participant</span>
            </div>

            <p className="text-gray-700 mb-8 leading-relaxed">
              {currentEvent.description}
            </p>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">What's Included</h3>
              <ul className="space-y-2">
                {currentEvent.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Register Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}