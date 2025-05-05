import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useEffect, useRef } from "react";

export function SlamCampVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    // Enforce autoplay when component mounts
    const playVideo = () => {
      if (videoRef.current) {
        videoRef.current.play().catch(error => {
          console.log("Autoplay prevented:", error);
        });
      }
    };
    
    playVideo();
    
    // Add a click event listener to the document to play video on user interaction
    const handleUserInteraction = () => {
      playVideo();
      document.removeEventListener("click", handleUserInteraction);
    };
    
    document.addEventListener("click", handleUserInteraction);
    
    return () => {
      document.removeEventListener("click", handleUserInteraction);
    };
  }, []);
  return (
    <section className="py-20 bg-[hsl(var(--secondary))]">
      <Container>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-serif font-semibold mb-4">
              Birmingham Slam Camp
            </h2>
            <p className="text-lg">
              June 19-21, 2025 | Clay-Chalkville Middle School
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-3">Intensive Training</h3>
                <p className="text-gray-700">Three days of focused wrestling training with top-tier coaches and athletes from around the country.</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-3">Expert Instruction</h3>
                <p className="text-gray-700">Learn new techniques, improve your skills, and get personalized feedback from experienced coaches.</p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-3">Live Competition</h3>
                <p className="text-gray-700">Put your skills to the test with live matches and receive constructive feedback to enhance your performance.</p>
              </div>
              
              <Link href="/events/1" className="inline-block bg-primary text-white py-3 px-8 font-medium tracking-wide hover:bg-opacity-90 transition-colors">
                Register Now
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="relative h-[500px] bg-black rounded-lg overflow-hidden"
            >
              <iframe 
                src="https://www.youtube.com/embed/uyXLYfWJmno?autoplay=1&mute=1&loop=1&playlist=uyXLYfWJmno&controls=0&showinfo=0"
                className="w-full h-full object-cover"
                title="Birmingham Slam Camp Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white font-medium">
                  Limited to 200 wrestlers - Secure your spot today!
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}