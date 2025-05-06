import { useState } from "react";
import { Container } from "@/components/ui/container";
import { motion, AnimatePresence } from "framer-motion";

export function SchoolPackages() {
  const [selectedSchool, setSelectedSchool] = useState(0);
  
  // School packages with gradients instead of images for reliability
  const schoolPackages = [
    {
      name: "Auburn Wrestling",
      gradient: "linear-gradient(135deg, #E35205, #DFBD58)",
      logo: "AU",
      description: "Complete gear package for Auburn's wrestling program with custom singlets, warmups, and practice gear."
    },
    {
      name: "Berry Middle School",
      gradient: "linear-gradient(135deg, #3A1B43, #8B5CF6)",
      logo: "BMS",
      description: "Youth-focused wrestling gear designed for Berry Middle School with durable, comfortable materials."
    },
    {
      name: "Coosa Christian",
      gradient: "linear-gradient(135deg, #9F1239, #E11D48)",
      logo: "CC",
      description: "Faith-based themed gear for Coosa Christian's wrestling program with high-quality materials."
    },
    {
      name: "Dora High School",
      gradient: "linear-gradient(135deg, #0E7490, #22D3EE)",
      logo: "DHS",
      description: "Custom team package for Dora High School featuring their traditional blue and gold colors."
    }
  ];

  return (
    <section className="py-24">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">School Apparel Packages</h2>
          <p className="text-lg max-w-3xl mx-auto">
            We've helped numerous schools and teams create cohesive, professional apparel packages. 
            Here are some examples of our recent work.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-10">
          {/* School Selection */}
          <div className="lg:w-1/3">
            <div className="bg-[hsl(var(--muted))] p-6 rounded-md">
              <h3 className="text-xl font-semibold mb-6">Featured Schools</h3>
              
              <div className="space-y-3">
                {schoolPackages.map((school, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSchool(index)}
                    className={`w-full text-left p-4 rounded-md transition-colors ${
                      selectedSchool === index
                        ? 'bg-[hsl(var(--primary))] text-white'
                        : 'bg-white hover:bg-[hsl(var(--primary)/0.1)]'
                    }`}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3"
                        style={{ background: school.gradient }}
                      >
                        {school.logo}
                      </div>
                      <span className="font-medium">{school.name}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-8 p-5 bg-white rounded-md">
                <h4 className="font-medium mb-3">Package Features:</h4>
                <ul className="space-y-2 text-[hsl(var(--foreground)/0.8)]">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Custom singlets/uniforms
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Team warmup gear
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Practice t-shirts &amp; shorts
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Headgear &amp; accessories
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Fan &amp; parent apparel
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* School Package Display */}
          <div className="lg:w-2/3">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSchool}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-[hsl(var(--muted))] p-6 rounded-md h-full"
              >
                <div className="h-[400px] mb-6 rounded-lg overflow-hidden">
                  <div 
                    className="w-full h-full flex items-center justify-center rounded-lg"
                    style={{ background: schoolPackages[selectedSchool].gradient }}
                  >
                    <div className="text-white text-center p-8">
                      <h3 className="text-3xl font-bold mb-4">{schoolPackages[selectedSchool].name}</h3>
                      <p className="text-xl mb-8">{schoolPackages[selectedSchool].description}</p>
                      <div className="inline-block border-4 border-white/30 rounded-full p-8">
                        <span className="text-4xl font-bold">{schoolPackages[selectedSchool].logo}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 bg-white p-5 rounded-md">
                    <h4 className="font-semibold mb-3">Custom Design Process</h4>
                    <p>Our team works closely with coaches and athletic directors to develop a unique identity that represents your school's spirit and traditions.</p>
                  </div>
                  
                  <div className="flex-1 bg-white p-5 rounded-md">
                    <h4 className="font-semibold mb-3">Team Discounts</h4>
                    <p>Volume discounts available for complete team packages. Contact us for custom pricing based on your team's specific needs.</p>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <a 
                    href="#contactForm" 
                    className="inline-block bg-primary text-white py-3 px-8 rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    Request School Package Info
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  );
}
