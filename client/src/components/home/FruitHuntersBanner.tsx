import React from 'react';
import { Play } from 'lucide-react';

interface VideoSectionProps {
  image: string;
  alt: string;
  title: string;
  description: string;
}

const VideoSection: React.FC<VideoSectionProps> = ({ image, alt, title, description }) => {
  return (
    <div className="fruit-video-section">
      <div className="relative overflow-hidden rounded-md h-full bg-gray-100">
        {/* Image placeholder with play icon - to be replaced with video later */}
        <div className="relative h-full">
          <div 
            className="w-full h-full bg-gray-200 flex items-center justify-center"
            style={{
              backgroundImage: image ? `url(${image})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="play-button">
                <Play className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <h3 className="text-white text-sm font-bold">{title}</h3>
          <p className="text-white/80 text-xs mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
};

export function FruitHuntersBanner() {
  // Placeholder fruit sections - will be replaced with actual video content
  const fruitSections = [
    {
      image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=2627&auto=format&fit=crop",
      alt: "Dragon fruit being sliced", 
      title: "Dragon Fruit",
      description: "Rich in antioxidants & vitamin C"
    },
    {
      image: "https://images.unsplash.com/photo-1620413808828-7d1908920395?q=80&w=2629&auto=format&fit=crop",
      alt: "Fresh mangosteen",
      title: "Mangosteen",
      description: "The 'queen of fruits' with immune benefits"
    },
    {
      image: "https://images.unsplash.com/photo-1604495772146-0fec7e9adbdc?q=80&w=2574&auto=format&fit=crop",
      alt: "Passion fruit on the vine",
      title: "Passion Fruit",
      description: "Perfect post-workout recovery fruit"
    },
    {
      image: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?q=80&w=2670&auto=format&fit=crop",
      alt: "Jackfruit being prepared",
      title: "Jackfruit",
      description: "Nutrient-dense for muscle recovery"
    },
    {
      image: "https://images.unsplash.com/photo-1553279756-bad5d12533dd?q=80&w=2574&auto=format&fit=crop",
      alt: "Star fruit slices arranged",
      title: "Star Fruit",
      description: "Hydrating and rich in potassium"
    },
    {
      image: "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?q=80&w=2574&auto=format&fit=crop",
      alt: "Rambutan fruit display",
      title: "Rambutan",
      description: "Energy-boosting tropical delight"
    }
  ];

  return (
    <div className="w-full py-16 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-gray-400 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-gray-300"></div>
        <div className="absolute bottom-10 left-20 w-48 h-48 rounded-full bg-gray-300"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-gray-400 translate-x-1/3 translate-y-1/3"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-3 px-3 py-1 bg-gray-100 rounded-md shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Exclusive Partnership</span>
          </div>
          <h2 className="text-4xl font-bold mb-3 relative inline-block">
            Fruit Hunters Collaboration
            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-300 rounded-full"></span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-6">
            Fueling athletes with nature's best exotic fruits. Discover the nutritional power behind our exclusive partnership with America's premier exotic fruit company.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[500px]">
          {fruitSections.map((section, index) => (
            <VideoSection
              key={index}
              image={section.image}
              alt={section.alt}
              title={section.title}
              description={section.description}
            />
          ))}
        </div>
        
        <div className="mt-12 text-center bg-gray-50 py-6 px-8 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Peak Performance Nutrition</h3>
              <p className="text-gray-600">
                Every athlete at our events receives daily fresh exotic fruit packs meticulously designed for optimal nutrition and recovery.
              </p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-md hover:from-gray-700 hover:to-gray-800 transition duration-300 whitespace-nowrap flex-shrink-0">
              Learn About Nutrition
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}