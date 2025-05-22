import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Inspired by Kourtney Roy aesthetic */}
      <section className="w-full min-h-[95vh] flex items-center justify-center relative overflow-hidden">
        {/* Hero background image with grayscale filter */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="/images/DSC09491.JPG" 
            alt="Rich Habits Hero" 
            className="w-full h-full object-cover"
            style={{ filter: 'grayscale(85%)' }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40"></div>
        </div>
        
        <div className="container mx-auto px-4 z-10 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <h1 className="text-6xl md:text-8xl mb-6 leading-none tracking-tighter title-font">
              Rich Habits
            </h1>
            <p className="text-xl md:text-2xl mb-10 tracking-wide text-gray-200 subtitle-font">
              Premium athletic apparel for high-performing athletes who demand quality in every detail.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8">
              <Link href="/shop" className="bg-white text-gray-900 py-3 px-10 tracking-wide hover:bg-gray-200 transition-colors inline-block border border-transparent">
                <span className="subtitle-font">View Collection</span>
              </Link>
              <Link href="/custom-apparel" className="border border-white text-white py-3 px-10 tracking-wide hover:bg-white hover:text-gray-900 transition-colors inline-block">
                <span className="subtitle-font">Custom Team Gear</span>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Subtle sky accent line */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-200 opacity-30"></div>
      </section>
      
      {/* Featured Events Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl mb-16 text-center title-font">
              Upcoming Events
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Birmingham Slam Camp */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white shadow-md overflow-hidden"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src="/images/DSC09354.JPG" 
                    alt="Birmingham Slam Camp" 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    style={{ filter: 'grayscale(60%)' }} 
                  />
                </div>
                <div className="p-6">
                  <div className="mb-4 h-1 w-16 bg-gray-900"></div>
                  <h3 className="text-2xl mb-4 title-font">
                    Birmingham Slam Camp
                  </h3>
                  <div className="mb-6 space-y-1">
                    <p className="text-gray-600 subtitle-font">June 19-21, 2025</p>
                    <p className="text-gray-600 subtitle-font">Clay-Chalkville Middle School</p>
                    <p className="text-gray-600 subtitle-font">$249</p>
                  </div>
                  <p className="text-gray-700 mb-8 subtitle-font">
                    A high-energy wrestling camp featuring top coaches and intensive training.
                  </p>
                  <Link href="/events/1" className="text-gray-900 border-b border-gray-900 pb-1 hover:text-sky-800 hover:border-sky-800 transition-colors inline-block">
                    <span className="subtitle-font">View Details</span>
                  </Link>
                </div>
              </motion.div>
              
              {/* National Champ Camp */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white shadow-md overflow-hidden"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src="/images/DSC09353.JPG" 
                    alt="National Champ Camp" 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    style={{ filter: 'grayscale(60%)' }} 
                  />
                </div>
                <div className="p-6">
                  <div className="mb-4 h-1 w-16 bg-gray-900"></div>
                  <h3 className="text-2xl mb-4 title-font">
                    National Champ Camp
                  </h3>
                  <div className="mb-6 space-y-1">
                    <p className="text-gray-600 subtitle-font">June 5-7, 2025</p>
                    <p className="text-gray-600 subtitle-font">Roy Martin Middle School</p>
                    <p className="text-gray-600 subtitle-font">$349</p>
                  </div>
                  <p className="text-gray-700 mb-8 subtitle-font">
                    Train with NCAA champions and Olympic athletes in this intensive camp.
                  </p>
                  <Link href="/events/2" className="text-gray-900 border-b border-gray-900 pb-1 hover:text-sky-800 hover:border-sky-800 transition-colors inline-block">
                    <span className="subtitle-font">View Details</span>
                  </Link>
                </div>
              </motion.div>
              
              {/* Texas Recruiting Clinic */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white shadow-md overflow-hidden"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src="/images/DSC08615.JPG" 
                    alt="Texas Recruiting Clinic" 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    style={{ filter: 'grayscale(60%)' }} 
                  />
                </div>
                <div className="p-6">
                  <div className="mb-4 h-1 w-16 bg-gray-900"></div>
                  <h3 className="text-2xl mb-4 title-font">
                    Texas Recruiting Clinic
                  </h3>
                  <div className="mb-6 space-y-1">
                    <p className="text-gray-600 subtitle-font">June 12-13, 2025</p>
                    <p className="text-gray-600 subtitle-font">Arlington Martin High School</p>
                    <p className="text-gray-600 subtitle-font">$249</p>
                  </div>
                  <p className="text-gray-700 mb-8 subtitle-font">
                    Designed specifically for high school wrestlers seeking collegiate opportunities.
                  </p>
                  <Link href="/events/3" className="text-gray-900 border-b border-gray-900 pb-1 hover:text-sky-800 hover:border-sky-800 transition-colors inline-block">
                    <span className="subtitle-font">View Details</span>
                  </Link>
                </div>
              </motion.div>
            </div>
            
            <div className="mt-16 text-center">
              <Link href="/events" className="inline-block border border-gray-900 py-3 px-10 text-gray-900 tracking-wide hover:bg-gray-900 hover:text-white transition-colors">
                <span className="subtitle-font">View All Events</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Fruit Hunters Partnership - Minimalist Approach */}
      <section className="py-24 bg-gray-100 relative">
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: 'url("/images/fruit-hunters-logo.png")', 
          backgroundPosition: 'center',
          backgroundSize: '40%',
          backgroundRepeat: 'no-repeat',
          filter: 'grayscale(40%)'
        }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl mb-8 title-font">
                Exclusive Partnership
              </h2>
              <h3 className="text-2xl mb-10 text-gray-600 subtitle-font italic">
                Birmingham Slam Camp × Fruit Hunters
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="flex justify-center">
                <img 
                  src="/images/fruit-hunters-logo.png" 
                  alt="Fruit Hunters Partnership" 
                  className="max-w-full h-auto shadow-lg"
                  style={{ maxHeight: '240px', filter: 'grayscale(20%)' }}
                />
              </div>
              <div>
                <p className="text-xl mb-8 leading-relaxed text-gray-700 subtitle-font">
                  Elevating athlete performance through premium nutrition. Fruit Hunters provides our athletes with exotic, nutrient-rich fruits for optimal recovery and results.
                </p>
                <div className="text-left">
                  <Link href="/events/1" className="inline-block py-3 px-10 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors">
                    <span className="subtitle-font">Discover Partnership Details</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Subtle sky accent line */}
        <div className="mt-24 h-px w-full bg-sky-200 opacity-30"></div>
      </section>
      
      {/* Newsletter Section - Minimalist Approach */}
      <section className="py-24 bg-white relative">
        <div className="absolute top-0 left-0 w-1 h-24 bg-sky-200 opacity-30"></div>
        <div className="absolute top-0 right-0 w-1 h-24 bg-sky-200 opacity-30"></div>
        
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