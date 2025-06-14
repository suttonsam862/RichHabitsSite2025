import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";
import { Link } from "wouter";

export function SlamCampVideo() {
  return (
    <section className="py-20 bg-[hsl(var(--secondary))]">
      <Container>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-semibold mb-4">
              Birmingham Slam Camp
            </h2>
            <p className="text-lg">
              June 19-21, 2025 | Clay-Chalkville Middle School
            </p>
          </div>
          
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
                background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5))',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
               }}
            >
              {/* Static image background instead of problematic video */}
              <div className="absolute inset-0 z-0 bg-black">
                <img 
                  src="/assets/DSC09374--.JPG" onError={(e) => { const t = e.target as HTMLImageElement; t.onerror = null; t.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CaXJtaW5naGFtIFNsYW0gQ2FtcDwvdGV4dD48L3N2Zz4="; }} 
                  className="w-full h-full object-cover"
                  alt="Birmingham Slam Camp"
                  loading="lazy"
                />
                
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