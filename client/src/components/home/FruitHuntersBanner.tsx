import React from 'react';

interface VideoSectionProps {
  src: string;
  alt: string;
  title: string;
  description: string;
}

const VideoSection: React.FC<VideoSectionProps> = ({ src, alt, title, description }) => {
  return (
    <div className="fruit-video-section">
      <div className="relative overflow-hidden h-full bg-gray-100">
        {/* Video element for looping MP4 videos */}
        <video 
          className="w-full h-full object-cover"
          autoPlay 
          muted 
          loop 
          playsInline
          aria-label={alt}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <h3 className="text-white text-xs font-bold">{title}</h3>
          <p className="text-white/80 text-[10px] mt-0.5 line-clamp-1">{description}</p>
        </div>
      </div>
    </div>
  );
};

export function FruitHuntersBanner() {
  // Video paths for the MP4 files - replace these with actual MP4 files
  const fruitSections = [
    {
      src: "/videos/dragon-fruit.mp4", // Replace with actual MP4 file
      alt: "Dragon fruit being sliced", 
      title: "Dragon Fruit",
      description: "Rich in antioxidants & vitamin C"
    },
    {
      src: "/videos/mangosteen.mp4", // Replace with actual MP4 file
      alt: "Fresh mangosteen",
      title: "Mangosteen",
      description: "The 'queen of fruits' with immune benefits"
    },
    {
      src: "/videos/passion-fruit.mp4", // Replace with actual MP4 file
      alt: "Passion fruit on the vine",
      title: "Passion Fruit",
      description: "Perfect post-workout recovery fruit"
    },
    {
      src: "/videos/jackfruit.mp4", // Replace with actual MP4 file
      alt: "Jackfruit being prepared",
      title: "Jackfruit",
      description: "Nutrient-dense for muscle recovery"
    },
    {
      src: "/videos/star-fruit.mp4", // Replace with actual MP4 file
      alt: "Star fruit slices arranged",
      title: "Star Fruit",
      description: "Hydrating and rich in potassium"
    },
    {
      src: "/videos/rambutan.mp4", // Replace with actual MP4 file
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
        
        <div className="flex overflow-hidden h-[240px] gap-1 rounded-lg shadow-md">
          {fruitSections.map((section, index) => (
            <VideoSection
              key={index}
              src={section.src}
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