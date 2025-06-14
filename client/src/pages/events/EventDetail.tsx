import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { Calendar, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import Container from '../../components/layout/Container';
import { useQuery } from '@tanstack/react-query';

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
}

const mockEvents: Event[] = [
  {
    id: 1,
    title: "Summer Wrestling Camp",
    date: "July 15-19, 2024",
    location: "Athletic Training Center",
    price: 299,
    description: "Intensive 5-day wrestling camp for all skill levels...",
    features: ["Professional Coaching", "Competition Training", "Technique Development"],
    images: ["/hero-bg.jpg", "/training-session.jpg"],
    slug: "summer-camp"
  }
];

export default function EventDetail() {
  const { slug } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: event } = useQuery({
    queryKey: ['/api/events', slug],
    enabled: !!slug
  });

  const currentEvent = event || mockEvents.find(e => e.slug === slug);

  if (!currentEvent) {
    return (
      <Container className="py-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
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
              {currentEvent.images.map((image, index) => (
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
                {currentEvent.features.map((feature, index) => (
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