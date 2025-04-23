import { Link } from "wouter";
import { AnimatedUnderline } from "@/components/ui/animated-underline";
import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";

export function CustomClothingService() {
  return (
    <section className="py-20 bg-[hsl(var(--secondary))]">
      <Container>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-serif font-semibold mb-4 group">
              <AnimatedUnderline>
                Custom Team Apparel
              </AnimatedUnderline>
            </h2>
            <p className="text-lg mb-12">AI-enhanced design process for teams and organizations.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-3">Smart Design Process</h3>
                <p className="text-gray-700">Our AI-powered design system helps create custom apparel that perfectly represents your team's identity while optimizing for performance.</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-3">Premium Materials</h3>
                <p className="text-gray-700">Fabric suggestions based on activity type, climate conditions, and performance needs with sustainable options.</p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-3">From Concept to Competition</h3>
                <p className="text-gray-700">Full-service approach from initial consultation to final delivery with comprehensive measurement guides.</p>
              </div>
              
              <Link href="/custom-apparel">
                <a className="inline-block bg-primary text-white py-3 px-8 font-medium tracking-wide hover:bg-opacity-90 transition-colors">
                  Request Custom Design
                </a>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="relative h-[500px] bg-white p-1"
            >
              {/* This would be where a 3D model could be embedded in the future */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Custom jersey design" 
                  className="object-cover w-full h-full"
                />
                {/* 3D model placeholder icon */}
                <div className="absolute right-4 bottom-4 bg-white p-2 rounded-full">
                  <i className="icon ion-md-cube text-xl"></i>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
