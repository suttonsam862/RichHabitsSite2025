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
              src="/images/coaches/DSC09374--.JPG" 
              alt="Rich Habits Wrestling Camp" 
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
              <h1 className="text-5xl font-serif font-bold mb-4">About Rich Habits</h1>
              <p className="text-xl">Creating premium athletic apparel and experiences for wrestlers and athletes who demand more.</p>
            </motion.div>
          </Container>
        </section>
        
        {/* Our Story Section */}
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
                    Our Story
                  </AnimatedUnderline>
                </h2>
                <p className="text-lg mb-6">
                  Our journey began in 2022 when Sam Sutton and Carter Vail, two friends with a shared vision, decided to start a clothing company. The idea was born in a cozy coffee shop in Uptown, located in downtown Birmingham. Over a few hours and countless cups of coffee, we discussed our aspirations and how we could achieve them.
                </p>
                <p className="text-lg mb-6">
                  In the following years, we immersed ourselves in the world of clothing, learning everything we could while selling shirts and other gear to various companies. Through hard work and dedication, we discovered our niche: providing gear packs to high school sports teams. Today, we are proud to have contracts with over ten teams and are continually expanding our reach, striving to support more athletes and teams every day.
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
        
        {/* Mission Section */}
        <section className="py-20 bg-[hsl(var(--secondary))]">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-serif font-semibold mb-8 group text-center">
                <AnimatedUnderline>
                  Our Mission
                </AnimatedUnderline>
              </h2>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white p-8 shadow-sm rounded-lg"
              >
                <p className="text-lg mb-6 text-center">
                  Our mission is bold and ambitious: to challenge and surpass every major sports clothing company, such as Nike and Adidas. We aim to provide affordable luxury clothing to athletes at every level, from professionals to youth.
                </p>
                <p className="text-lg text-center">
                  Our commitment is to ensure that every athlete in the world has access to high-quality, stylish gear without breaking the bank. We believe in democratizing luxury and making top-tier sports apparel accessible to all, fostering a sense of confidence and excellence in every athlete who wears our brand.
                </p>
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
              <p className="text-lg max-w-3xl mx-auto">Meet the founders behind Rich Habits.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 shadow-sm rounded-lg"
              >
                <div className="text-center mb-6">
                  <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-6">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                      alt="Sam Sutton - Co-Founder" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-medium mb-1">Sam Sutton</h3>
                  <p className="text-gray-600 mb-4">Co-Founder, Design & Financial Operations</p>
                </div>
                <p className="text-gray-700">
                  Sam Sutton, a high school state champion in wrestling and a star student, has always been driven by passion and dedication. His wrestling journey took him to Arizona State, where he competed for the prestigious Sunkist Kids, and now continues at Tarleton State in Texas. At our company, Sam heads up all financial operations and also handles all the design work. His love for art and graphic design, coupled with his relentless work ethic, ensures that every piece we create reflects the highest standards of quality and creativity. As a devoted Christian, Sam's values and faith are central to his approach in both life and business, guiding his commitment to integrity and excellence.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 shadow-sm rounded-lg"
              >
                <div className="text-center mb-6">
                  <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-6">
                    <img 
                      src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                      alt="Carter Vail - Co-Founder" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-medium mb-1">Carter Vail</h3>
                  <p className="text-gray-600 mb-4">Co-Founder, Communications & Operations</p>
                </div>
                <p className="text-gray-700">
                  Carter Vail, a dedicated and hard-working individual, was a four-year varsity basketball point guard at Homewood High School. Known for his tenacity and leadership on the court, Carter now attends the University of Alabama, where he spent a year as a manager for the basketball team. At our company, Carter handles all communication and daily operations, ensuring everything runs smoothly and efficiently. He is also responsible for big-picture event planning and goal setting. Carter values his close-knit circle, cherishing his family and friends above all.
                </p>
              </motion.div>
            </div>
          </Container>
        </section>
        
        {/* Our Services Section */}
        <section className="py-20 bg-[hsl(var(--secondary))]">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-serif font-semibold mb-8 group text-center">
                <AnimatedUnderline>
                  Our Services
                </AnimatedUnderline>
              </h2>
              
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 shadow-sm rounded-lg"
                >
                  <h3 className="text-xl font-medium mb-4">Custom Team Apparel</h3>
                  <p className="text-gray-700">We specialize in creating custom apparel packages for high school sports teams, offering unique designs tailored to each team's identity and needs. Our process ensures that every piece represents your team's spirit and helps build a cohesive team identity.</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 shadow-sm rounded-lg"
                >
                  <h3 className="text-xl font-medium mb-4">Wrestling Camps and Clinics</h3>
                  <p className="text-gray-700">Our signature wrestling camps bring together elite coaches and athletes to provide intensive training experiences. From Birmingham Slam Camp to National Champ Camp in Las Vegas, we create opportunities for wrestlers to learn, grow, and connect with the best in the sport.</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 shadow-sm rounded-lg"
                >
                  <h3 className="text-xl font-medium mb-4">Premium Athletic Apparel</h3>
                  <p className="text-gray-700">We design and produce high-quality athletic apparel that combines performance, style, and affordability. Our commitment to providing affordable luxury means that athletes at every level can access gear that enhances their performance without breaking the bank.</p>
                </motion.div>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
