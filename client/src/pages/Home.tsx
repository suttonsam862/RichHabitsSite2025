import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronDown, Users, User } from "lucide-react";

export default function Home() {
  const scrollToSignup = () => {
    document.getElementById('signup-portal')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TOP-LEVEL TEAM DISCOUNT BANNER */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto text-center">
          <button 
            onClick={scrollToSignup}
            className="w-full hover:bg-black/10 transition-colors rounded p-2"
          >
            <span className="text-lg font-bold tracking-wide">
              👉 NEW: HUGE TEAM DISCOUNT NOW AVAILABLE – CLICK TO REGISTER AS A TEAM
            </span>
          </button>
        </div>
      </div>

      {/* COMPRESSED MOBILE-FOCUSED HERO */}
      <section className="w-full h-[70vh] md:h-[80vh] flex items-center justify-center relative overflow-hidden">
        {/* Hero background image */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="/images/hero-background.webp" 
            alt="Rich Habits premium athletic wear collection"
            className="w-full h-full object-cover object-right"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40"></div>
        </div>
        
        {/* Content Overlay with Split CTA */}
        <div className="container mx-auto px-4 z-10 text-white relative flex items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl mb-4 leading-tight tracking-tighter title-font">
              Train with NCAA Champions
            </h1>
            <p className="text-lg md:text-xl mb-8 tracking-wide text-gray-200 subtitle-font">
              Camps Nationwide This Summer
            </p>
            
            {/* SPLIT CTA SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <button
                onClick={scrollToSignup}
                className="bg-white text-gray-900 py-4 px-8 text-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 rounded-lg shadow-lg"
              >
                <User size={20} />
                <span>Register as Individual</span>
              </button>
              <button
                onClick={scrollToSignup}
                className="bg-orange-500 text-white py-4 px-8 text-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2 rounded-lg shadow-lg"
              >
                <Users size={20} />
                <span>Register as Team</span>
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* FLOATING SCROLL ARROW */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onClick={scrollToSignup}
            className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 animate-bounce"
          >
            <ChevronDown size={24} />
          </button>
        </div>
        
        {/* Subtle sky accent line */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-200 opacity-30"></div>
      </section>
      
      {/* MOBILE-SCROLLABLE CAMP SCHEDULE PREVIEW */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl mb-8 text-center title-font">
              Summer 2025 Camps
            </h2>
            
            {/* Mobile-scrollable horizontal slider */}
            <div className="overflow-x-auto pb-4">
              <div className="flex space-x-6 w-max md:grid md:grid-cols-3 md:gap-8 md:w-full">
                {/* Birmingham Slam Camp */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white shadow-md overflow-hidden w-80 md:w-auto flex-shrink-0 rounded-lg"
                >
                  <div className="h-32 overflow-hidden">
                    <img 
                      src="/images/birmingham-slam-camp.webp" 
                      alt="Birmingham Slam Camp"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2">Birmingham Slam Camp</h3>
                    <p className="text-sm text-gray-600 mb-1">June 19-21, 2025</p>
                    <p className="text-sm text-gray-600 mb-2">$249</p>
                    <button 
                      onClick={scrollToSignup}
                      className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition-colors"
                    >
                      Register Now
                    </button>
                  </div>
                </motion.div>
              
                {/* National Champ Camp */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white shadow-md overflow-hidden w-80 md:w-auto flex-shrink-0 rounded-lg"
                >
                  <div className="h-32 overflow-hidden">
                    <img 
                      src="/images/national-champ-camp.webp" 
                      alt="National Champ Camp"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2">National Champ Camp</h3>
                    <p className="text-sm text-gray-600 mb-1">June 5-7, 2025</p>
                    <p className="text-sm text-gray-600 mb-2">$349</p>
                    <button 
                      onClick={scrollToSignup}
                      className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition-colors"
                    >
                      Register Now
                    </button>
                  </div>
                </motion.div>
              
                {/* Texas Recruiting Clinic */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-white shadow-md overflow-hidden w-80 md:w-auto flex-shrink-0 rounded-lg"
                >
                  <div className="h-32 overflow-hidden">
                    <img 
                      src="/images/texas-recruiting-clinic.webp" 
                      alt="Texas Recruiting Clinic"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2">Texas Recruiting Clinic</h3>
                    <p className="text-sm text-gray-600 mb-1">June 12-13, 2025</p>
                    <p className="text-sm text-gray-600 mb-2">$249</p>
                    <button 
                      onClick={scrollToSignup}
                      className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition-colors"
                    >
                      Register Now
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* SIGNUP PORTAL ANCHOR SECTION */}
      <section id="signup-portal" className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl mb-8 title-font">Choose Your Registration</h2>
            <p className="text-xl mb-12 text-gray-600">Join thousands of wrestlers training with NCAA champions</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Individual Registration */}
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="flex items-center justify-center mb-6">
                  <User size={48} className="text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Individual Registration</h3>
                <p className="text-gray-600 mb-6">Perfect for individual athletes looking to train with the best</p>
                <Link 
                  href="/events" 
                  className="w-full bg-gray-900 text-white py-4 px-8 rounded-lg hover:bg-gray-800 transition-colors inline-block text-center"
                >
                  Browse Individual Camps
                </Link>
              </div>
              
              {/* Team Registration */}
              <div className="bg-orange-500 p-8 rounded-lg shadow-lg text-white relative">
                <div className="absolute top-4 right-4">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">HUGE DISCOUNT!</span>
                </div>
                <div className="flex items-center justify-center mb-6">
                  <Users size={48} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Team Registration</h3>
                <p className="mb-6">Bring your entire team and save big with our exclusive team discounts</p>
                <Link 
                  href="/events" 
                  className="w-full bg-white text-orange-500 py-4 px-8 rounded-lg hover:bg-gray-100 transition-colors inline-block text-center font-semibold"
                >
                  Get Team Discount
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Newsletter Section - Minimalist Approach */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto"
          >
            <h2 className="text-4xl mb-6 text-center title-font">
              Stay Connected
            </h2>
            <p className="text-gray-700 mb-10 text-center subtitle-font">
              Subscribe to receive updates on upcoming events, new apparel releases, and exclusive offers.
            </p>
            
            <div className="bg-gray-50 p-8 shadow-md">
              <form className="flex flex-col space-y-5">
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="px-5 py-4 border border-gray-300 focus:outline-none focus:border-gray-900 bg-transparent subtitle-font"
                />
                <button 
                  type="submit" 
                  className="bg-gray-900 text-white py-4 px-6 hover:bg-gray-800 transition-colors subtitle-font"
                >
                  Subscribe
                </button>
              </form>
            </div>
            
            <div className="mt-10 flex justify-center space-x-8">
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-instagram"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-twitter"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}