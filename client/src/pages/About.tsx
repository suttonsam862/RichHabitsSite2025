import { Container } from "@/components/ui/container";
import { AnimatedUnderline } from "@/components/ui/animated-underline";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";

export default function About() {
  return (
    <>
      <Helmet>
        <title>About | Rich Habits</title>
        <meta name="description" content="Learn about Rich Habits, our mission, values, and the team behind our premium athletic apparel." />
      </Helmet>
      
      <div className="bg-white">
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center">
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80" 
              alt="Athletes in training" 
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>
          
          <Container className="relative z-10 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <h1 className="text-5xl font-serif font-bold mb-4">Our Story</h1>
              <p className="text-xl">Creating premium athletic apparel for those who demand more.</p>
            </motion.div>
          </Container>
        </section>
        
        {/* Mission Section */}
        <section className="py-20">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-serif font-semibold mb-6 group">
                  <AnimatedUnderline>
                    Our Mission
                  </AnimatedUnderline>
                </h2>
                <p className="text-lg mb-6">
                  Rich Habits was founded on a simple belief: athletic apparel should enhance performance without sacrificing style or sustainability.
                </p>
                <p className="text-lg mb-6">
                  We design premium gear for athletes who push boundaries, combining innovative materials with minimal, refined aesthetics that stand apart from the loud, over-branded options that dominate the market.
                </p>
                <p className="text-lg">
                  Every piece we create is designed to help athletes perform better, recover faster, and look exceptional—whether they're competing, training, or representing their team off the field.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative h-[500px]"
              >
                <img 
                  src="https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                  alt="Athlete in training" 
                  className="object-cover w-full h-full"
                />
              </motion.div>
            </div>
          </Container>
        </section>
        
        {/* Values Section */}
        <section className="py-20 bg-[hsl(var(--secondary))]">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-semibold mb-4 group">
                <AnimatedUnderline>
                  Our Values
                </AnimatedUnderline>
              </h2>
              <p className="text-lg max-w-3xl mx-auto">The principles that guide everything we do.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="icon ion-md-star text-2xl"></i>
                </div>
                <h3 className="text-xl font-medium mb-3">Excellence</h3>
                <p className="text-gray-700">We are committed to excellence in every aspect of our business, from material selection to customer service.</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="icon ion-md-infinite text-2xl"></i>
                </div>
                <h3 className="text-xl font-medium mb-3">Innovation</h3>
                <p className="text-gray-700">We continuously explore new technologies and design approaches to create gear that helps athletes perform at their best.</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="icon ion-md-leaf text-2xl"></i>
                </div>
                <h3 className="text-xl font-medium mb-3">Sustainability</h3>
                <p className="text-gray-700">We are committed to environmentally responsible practices throughout our design and production processes.</p>
              </motion.div>
            </div>
          </Container>
        </section>
        
        {/* Team Section */}
        <section className="py-20">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-semibold mb-4 group">
                <AnimatedUnderline>
                  Our Team
                </AnimatedUnderline>
              </h2>
              <p className="text-lg max-w-3xl mx-auto">Meet the people behind Rich Habits.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                    alt="Alex Thompson - Founder & CEO" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-medium mb-1">Alex Thompson</h3>
                <p className="text-gray-600 mb-4">Founder & CEO</p>
                <p className="text-gray-700">Former collegiate athlete with a passion for design and technology. Alex founded Rich Habits in 2015 after seeing a gap in the market for premium, minimal athletic apparel.</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                    alt="Maya Rodriguez - Design Director" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-medium mb-1">Maya Rodriguez</h3>
                <p className="text-gray-600 mb-4">Design Director</p>
                <p className="text-gray-700">With a background in high-fashion and sportswear, Maya leads our design team, bringing her expertise in creating performance gear that doesn't sacrifice aesthetics.</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                    alt="Jamal Wilson - Technology Lead" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-medium mb-1">Jamal Wilson</h3>
                <p className="text-gray-600 mb-4">Technology Lead</p>
                <p className="text-gray-700">Jamal oversees our AI-assisted design process, combining his expertise in machine learning with a deep understanding of athletic performance needs.</p>
              </motion.div>
            </div>
          </Container>
        </section>
        
        {/* What Sets Us Apart Section */}
        <section className="py-20 bg-[hsl(var(--secondary))]">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-serif font-semibold mb-8 group text-center">
                <AnimatedUnderline>
                  What Sets Us Apart
                </AnimatedUnderline>
              </h2>
              
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 shadow-sm"
                >
                  <h3 className="text-xl font-medium mb-4">AI-Enhanced Design Process</h3>
                  <p className="text-gray-700">Our proprietary AI system analyzes performance data, material properties, and design elements to create apparel that optimizes both function and form. This technology allows us to iterate quickly and provide customized solutions for teams and individuals.</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 shadow-sm"
                >
                  <h3 className="text-xl font-medium mb-4">Focus on Minimalism</h3>
                  <p className="text-gray-700">In an industry dominated by loud designs and excessive branding, we take a different approach. Our clean, refined aesthetic lets the quality and performance of our products speak for themselves, while providing a sophisticated look that transitions seamlessly from training to everyday life.</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 shadow-sm"
                >
                  <h3 className="text-xl font-medium mb-4">Community Engagement</h3>
                  <p className="text-gray-700">We're more than just a clothing brand. Through our events, clinics, and partnerships with schools and teams, we're actively involved in supporting athletes at all levels and fostering a community focused on excellence and continuous improvement.</p>
                </motion.div>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
