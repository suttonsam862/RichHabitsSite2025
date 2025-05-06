import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/container";

interface SchoolPackage {
  name: string;
  description: string;
  color: string;
  imgSrc: string;
  features: string[];
}

export function SchoolPackages() {
  const [selectedPackage, setSelectedPackage] = useState(0);
  
  const schoolPackages: SchoolPackage[] = [
    {
      name: "Auburn High School",
      description: "Complete wrestling gear package for Auburn High School featuring branded apparel in school colors.",
      color: "#0039A6", // Auburn blue
      imgSrc: "/attached_assets/AuburnMen's Final.png",
      features: [
        "Custom singlets with school logo and colors",
        "Branded team hoodies and shorts",
        "Multiple t-shirt options for practice and casual wear",
        "Matching gear for men's and women's teams"
      ]
    },
    {
      name: "Berry Middle School",
      description: "Comprehensive apparel collection for Berry Middle School Jaguars wrestling team.",
      color: "#4CB4FD", // Berry blue
      imgSrc: "/attached_assets/Berry Middle Gear Pack.png",
      features: [
        "Lightweight performance shirts in school colors",
        "Team gear with Jaguar logo and branding",
        "Custom designed hoodies and sweatpants",
        "Multiple options for training and competition"
      ]
    },
    {
      name: "Coosa Christian",
      description: "Training and competition apparel package for Coosa Christian School wrestling program.",
      color: "#000000", // Black base
      imgSrc: "/attached_assets/Coosa Christian Tech.png",
      features: [
        "Premium sweat-wicking training gear",
        "School branded hoodies and sweatpants",
        "Custom designed competition singlets",
        "Coordinated team appearance for all events"
      ]
    }
  ];
  
  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">School Team Packages</h2>
            <p className="text-lg max-w-3xl mx-auto">
              We specialize in creating complete apparel packages for school wrestling programs. 
              From singlets to training gear, we've got your team covered.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {schoolPackages.map((pkg, index) => (
              <button
                key={index}
                onClick={() => setSelectedPackage(index)}
                className={`px-5 py-3 rounded-lg transition-all ${index === selectedPackage 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
              >
                {pkg.name}
              </button>
            ))}
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPackage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
            >
              {/* Left side - Image */}
              <div 
                className="bg-gray-50 rounded-lg p-8 flex items-center justify-center min-h-[500px]"
                style={{ 
                  background: `linear-gradient(135deg, ${schoolPackages[selectedPackage].color}15, ${schoolPackages[selectedPackage].color}05)` 
                }}
              >
                <img 
                  src={schoolPackages[selectedPackage].imgSrc} 
                  alt={schoolPackages[selectedPackage].name}
                  className="max-h-[450px] object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/product-placeholder.png";
                  }}
                />
              </div>
              
              {/* Right side - Package details */}
              <div>
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: schoolPackages[selectedPackage].color }}
                >
                  {schoolPackages[selectedPackage].name}
                </h3>
                <p className="text-gray-600 mb-6">
                  {schoolPackages[selectedPackage].description}
                </p>
                
                <h4 className="text-lg font-medium mb-3">Package Features:</h4>
                <ul className="space-y-2 mb-8">
                  {schoolPackages[selectedPackage].features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-primary mt-1 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <a 
                  href="/custom-apparel#contactForm" 
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded hover:bg-opacity-90 transition-colors font-medium"
                >
                  Request School Package
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}