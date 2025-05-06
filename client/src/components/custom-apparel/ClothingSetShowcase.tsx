import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/container";

interface ClothingSet {
  name: string;
  description: string;
  teamColor: string;
  items: {
    name: string;
    imgSrc: string;
    description?: string;
  }[];
}

export function ClothingSetShowcase() {
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  
  // Define our clothing sets
  const clothingSets: ClothingSet[] = [
    {
      name: "10th Planet Birmingham",
      description: "Complete custom apparel package for the elite 10th Planet Jiu-Jitsu academy in Birmingham.",
      teamColor: "#000000",
      items: [
        {
          name: "Crewneck Sweatshirt",
          imgSrc: "/attached_assets/10th Planet Crewneck.png",
          description: "Premium cotton-blend crewneck with custom 10th Planet graphics."
        },
        {
          name: "Jogger Sweatpants",
          imgSrc: "/attached_assets/10th Planet Sweats.png",
          description: "Comfortable training joggers with elastic cuffs and custom branding."
        },
        {
          name: "T-Shirt",
          imgSrc: "/attached_assets/10th Planet Triblend.png",
          description: "Soft tri-blend t-shirt with the iconic 10th Planet logo."
        },
        {
          name: "Training Shorts",
          imgSrc: "/attached_assets/10thPlanet Shorts.png",
          description: "Quick-dry training shorts perfect for grappling and striking workouts."
        }
      ]
    },
    // Additional clothing sets will go here as more images are provided
  ];
  
  // Auto-rotate through the sets
  useEffect(() => {
    const interval = setInterval(() => {
      if (clothingSets.length > 1) {
        setCurrentSetIndex((prevIndex) => (prevIndex + 1) % clothingSets.length);
        setSelectedItemIndex(0); // Reset to first item when changing sets
      }
    }, 10000); // Change every 10 seconds
    
    return () => clearInterval(interval);
  }, [clothingSets.length]);
  
  const currentSet = clothingSets[currentSetIndex];
  
  return (
    <section className="py-24 bg-gradient-to-b from-white to-[hsl(var(--muted))]">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Custom Apparel Sets</h2>
            <p className="text-lg max-w-3xl mx-auto">
              We design and produce coordinated apparel packages for teams, gyms, and organizations.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Set info header */}
            <div 
              className="p-6 text-white"
              style={{ backgroundColor: currentSet.teamColor || "#000000" }}
            >
              <h3 className="text-2xl font-bold">{currentSet.name}</h3>
              <p>{currentSet.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              {/* Left side - Clothing item display */}
              <div className="bg-[#f5f5f5] rounded-lg p-6 flex items-center justify-center min-h-[500px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentSetIndex}-${selectedItemIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <img 
                      src={currentSet.items[selectedItemIndex].imgSrc} 
                      alt={currentSet.items[selectedItemIndex].name}
                      className="max-h-[400px] object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/product-placeholder.png";
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Right side - Item selection */}
              <div className="flex flex-col justify-between">
                <div>
                  <h4 className="text-xl font-semibold mb-2">{currentSet.items[selectedItemIndex].name}</h4>
                  <p className="text-gray-600 mb-6">{currentSet.items[selectedItemIndex].description || ""}</p>
                  
                  <div className="space-y-4 mb-8">
                    <h5 className="font-medium">Full Set Includes:</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {currentSet.items.map((item, index) => (
                        <div 
                          key={index}
                          onClick={() => setSelectedItemIndex(index)}
                          className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${index === selectedItemIndex ? 'border-primary' : 'border-transparent hover:border-gray-300'}`}
                        >
                          <div className="bg-gray-100 rounded p-2 h-24 flex items-center justify-center mb-2">
                            <img 
                              src={item.imgSrc} 
                              alt={item.name} 
                              className="max-h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/images/product-placeholder.png";
                              }}
                            />
                          </div>
                          <p className="text-xs text-center font-medium">{item.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <a 
                    href="/custom-apparel#contactForm" 
                    className="block text-center bg-primary text-white py-3 px-6 rounded hover:bg-opacity-90 transition-colors font-medium"
                  >
                    Request Similar Set
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Set selector dots (for when we have multiple sets) */}
          {clothingSets.length > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {clothingSets.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSetIndex(index);
                    setSelectedItemIndex(0);
                  }}
                  className={`h-3 w-3 rounded-full ${index === currentSetIndex ? 'bg-primary' : 'bg-gray-300'}`}
                  aria-label={`View clothing set ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}