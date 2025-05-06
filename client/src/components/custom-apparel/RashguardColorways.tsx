import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/container";

interface Colorway {
  name: string;
  primaryColor: string;
  accentColor: string;
  imgSrc: string;
}

export function RashguardColorways() {
  const [selectedColorway, setSelectedColorway] = useState(0);
  
  const colorways: Colorway[] = [
    {
      name: "Classic White",
      primaryColor: "#FFFFFF",
      accentColor: "#000000",
      imgSrc: "/attached_assets/ClassicRashguardMockup.png"
    },
    {
      name: "Purple Edition",
      primaryColor: "#5506A6",
      accentColor: "#FFFFFF",
      imgSrc: "/attached_assets/Purple Rashguard.png"
    },
    {
      name: "Brown Edition",
      primaryColor: "#6B4423",
      accentColor: "#FFFFFF",
      imgSrc: "/attached_assets/BrownRashguardMockup.png"
    },
    {
      name: "White Edition",
      primaryColor: "#FFFFFF",
      accentColor: "#000000",
      imgSrc: "/attached_assets/WhiteRashguardMockup.png"
    }
  ];
  
  return (
    <section className="py-20 bg-gradient-to-b from-[hsl(var(--muted))] to-white">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Custom Color Options</h2>
            <p className="text-lg max-w-3xl mx-auto">
              We offer unlimited color customization options for your team's apparel. 
              Choose from our standard colors or create your own custom palette.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left side - Color selection and info */}
            <div>
              <h3 className="text-2xl font-bold mb-4">10th Planet Birmingham Rashguards</h3>
              <p className="text-gray-600 mb-6">
                Our rashguards are designed for optimal performance during training. They feature moisture-wicking fabric, 
                flatlock seams for comfort, and customizable designs in any color combination.
              </p>
              
              <div className="mb-10">
                <h4 className="text-lg font-medium mb-3">Available Color Options:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {colorways.map((colorway, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColorway(index)}
                      className={`p-4 rounded-lg border transition-all ${index === selectedColorway ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <div 
                          className="w-6 h-6 rounded-full border" 
                          style={{ backgroundColor: colorway.primaryColor }}
                        />
                        <div 
                          className="w-6 h-6 rounded-full border" 
                          style={{ backgroundColor: colorway.accentColor }}
                        />
                      </div>
                      <p className="text-sm font-medium text-center">{colorway.name}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <a 
                href="/custom-apparel#contactForm" 
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded hover:bg-opacity-90 transition-colors font-medium"
              >
                Request Custom Colors
              </a>
            </div>
            
            {/* Right side - Selected rashguard display */}
            <div className="bg-[#f8f8f8] rounded-lg p-8 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedColorway}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <img 
                    src={colorways[selectedColorway].imgSrc} 
                    alt={`${colorways[selectedColorway].name} Rashguard`}
                    className="max-h-[450px] object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/product-placeholder.png";
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}