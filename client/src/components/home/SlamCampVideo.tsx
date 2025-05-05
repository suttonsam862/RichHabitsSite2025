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
              style={{ 
                background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url("/assets/DSC09374--.JPG")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
               }}
            >
              {/* Play a video in background with fallback image */}
              <div className="absolute inset-0 z-0 bg-black">
                {/* Hidden video element that will be used if autoplay works */}
                <video
                  ref={videoRef}
                  src="/videos/slamcamp.mp4"
                  className="w-full h-full object-cover"
                  poster="/assets/DSC09374--.JPG"
                  muted
                  autoPlay
                  loop
                  playsInline
                  controls={false}
                  preload="auto"
                  onLoadedMetadata={(e) => {
                    if (videoRef.current) {
                      videoRef.current.play().catch(err => console.log('Autoplay failed:', err));
                    }
                  }}
                ></video>
                
                {/* Animated overlay elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div 
                    className="w-full h-full opacity-10"
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{ 
                      duration: 20,
                      ease: "linear",
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    style={{
                      backgroundImage: 'radial-gradient(circle, rgba(255,120,30,0.6) 0%, rgba(0,0,0,0) 70%)',
                      backgroundSize: '120% 120%',
                    }}
                  />
                </div>
              </div>
              
              {/* Overlay play button */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
                  initial={{ scale: 0.9, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 0.9 }}
                  transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.5 }}
                >
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </motion.div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 z-10">
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