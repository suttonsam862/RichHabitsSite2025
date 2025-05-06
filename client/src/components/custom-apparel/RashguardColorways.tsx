import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/container";

interface Colorway {
  color: string;
  name: string;
  imgSrc: string;
  description: string;
}

export function RashguardColorways() {
  const [selectedColorway, setSelectedColorway] = useState(0);
  
  const colorways: Colorway[] = [
    {
      color: "#684A46", // Brown
      name: "Brown Rashguard",
      imgSrc: "/attached_assets/BrownRashguardMockup.png",
      description: "Premium brown rashguard with Rich Habits logo and reinforced stitching for durability during intense training sessions."
    },
    {
      color: "#000000", // Black
      name: "Black Rashguard",
      imgSrc: "/attached_assets/BlackRashgaurdMockup.png",
      description: "Classic black rashguard featuring contrasting stitching and sleek Rich Habits branding. Perfect for competition and training."
    },
    {
      color: "#1E90FF", // Blue
      name: "Blue Rashguard",
      imgSrc: "/attached_assets/BlueRashguardMockup.png",
      description: "Vibrant blue rashguard with moisture-wicking fabric and comfortable fit for optimal performance during training."
    },
    {
      color: "#4B0082", // Purple
      name: "Purple Rashguard",
      imgSrc: "/attached_assets/Purple Rashguard.png",
      description: "Rich purple rashguard with bold styling and Rich Habits branding. Engineered for high-performance and comfort during training."
    },
    {
      color: "#EFEFEF", // White/Classic
      name: "White Rashguard",
      imgSrc: "/attached_assets/WhiteRashguardMockup.png",
      description: "Timeless white rashguard design with premium construction and strategic ventilation zones for comfort during intense sessions."
    }
  ];
  
  return (
    <section className="py-24 bg-[hsl(var(--background))]">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Rashguard Colorways</h2>
          <p className="text-lg max-w-3xl mx-auto">
            Our signature rashguards are available in multiple colors to match your team's identity.
            Each features premium construction with moisture-wicking fabric and reinforced seams.
          </p>
        </div>
        
        {/* Color selector */}
        <div className="flex justify-center mb-12 space-x-4">
          {colorways.map((colorway, index) => (
            <button
              key={index}
              onClick={() => setSelectedColorway(index)}
              className={`w-12 h-12 rounded-full border-2 ${index === selectedColorway ? 'ring-2 ring-offset-2 ring-primary' : 'hover:scale-110'} transition-all`}
              style={{ 
                backgroundColor: colorway.color,
                borderColor: colorway.color === "#EFEFEF" ? "#CCCCCC" : colorway.color
              }}
              aria-label={`Select ${colorway.name}`}
            />
          ))}
        </div>
        
        {/* Display selected colorway */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedColorway}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div className="bg-white p-8 rounded-lg shadow-md flex items-center justify-center min-h-[400px]">
              <img 
                src={colorways[selectedColorway].imgSrc} 
                alt={colorways[selectedColorway].name}
                className="max-w-full max-h-[350px] object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  console.warn(`Failed to load rashguard image: ${target.src}`);
                  target.onerror = null; // Prevent infinite error loop
                  
                  // Try loading direct from assets folder without /attached_assets prefix
                  const imageName = target.src.split('/').pop() || '';
                  const alternativePath = `/assets/${imageName}`;
                  target.src = alternativePath;
                  
                  // Add second error handler for fallback
                  target.onerror = () => {
                    console.warn(`Fallback also failed for rashguard: ${alternativePath}`);
                    target.src = "/images/product-placeholder.png";
                  };
                }}
              />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: colorways[selectedColorway].color }}>
                {colorways[selectedColorway].name}
              </h3>
              
              <p className="text-gray-700 mb-6">
                {colorways[selectedColorway].description}
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Moisture-wicking performance fabric</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Anti-microbial treatment</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Reinforced flatlock stitching</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Available in sizes XS to 3XL</span>
                </div>
              </div>
              
              <div className="flex flex-wrap space-x-4">
                <a 
                  href="/custom-apparel#contactForm" 
                  className="px-6 py-3 bg-primary text-white rounded hover:bg-opacity-90 transition-colors font-medium"
                >
                  Request Team Quote
                </a>
                <button 
                  className="px-6 py-3 border border-primary text-primary rounded hover:bg-primary hover:bg-opacity-10 transition-colors font-medium"
                >
                  View Size Chart
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </Container>
    </section>
  );
}