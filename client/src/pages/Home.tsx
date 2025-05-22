import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Inspired by Kourtney Roy aesthetic */}
      <section className="w-full min-h-[95vh] bg-gray-100 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-gray-200 to-gray-100 opacity-60"></div>
        
        <div className="container mx-auto px-4 z-10 text-gray-900">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <h1 className="text-6xl md:text-8xl mb-6 leading-none tracking-tighter" 
                style={{ fontFamily: "'Playfair Display FC', serif" }}>
              Rich Habits
            </h1>
            <p className="text-xl md:text-2xl mb-10 font-light tracking-wide text-gray-700"
               style={{ fontFamily: "'Didact Gothic', sans-serif" }}>
              Premium athletic apparel for high-performing athletes who demand quality in every detail.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8">
              <Link href="/shop" className="bg-gray-900 text-white py-3 px-10 tracking-wide hover:bg-gray-800 transition-colors inline-block border border-transparent">
                <span style={{ fontFamily: "'Sanchez', serif" }}>View Collection</span>
              </Link>
              <Link href="/custom-apparel" className="border border-gray-900 text-gray-900 py-3 px-10 tracking-wide hover:bg-gray-900 hover:text-white transition-colors inline-block">
                <span style={{ fontFamily: "'Sanchez', serif" }}>Custom Team Gear</span>
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
            <h2 className="text-4xl mb-16 text-center" style={{ fontFamily: "'Bodoni FLF', serif" }}>
              Upcoming Events
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Birmingham Slam Camp */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 border border-gray-200"
              >
                <div className="mb-6 h-1 w-16 bg-gray-900"></div>
                <h3 className="text-2xl mb-4" style={{ fontFamily: "'Bodoni FLF', serif" }}>
                  Birmingham Slam Camp
                </h3>
                <div className="mb-6 space-y-1">
                  <p className="text-gray-600" style={{ fontFamily: "'Arial', sans-serif" }}>June 19-21, 2025</p>
                  <p className="text-gray-600" style={{ fontFamily: "'Arial', sans-serif" }}>Clay-Chalkville Middle School</p>
                  <p className="text-gray-600" style={{ fontFamily: "'Arial', sans-serif" }}>$249</p>
                </div>
                <p className="text-gray-700 mb-8" style={{ fontFamily: "'Didact Gothic', sans-serif" }}>
                  A high-energy wrestling camp featuring top coaches and intensive training.
                </p>
                <Link href="/events/1" className="text-gray-900 border-b border-gray-900 pb-1 hover:text-sky-800 hover:border-sky-800 transition-colors inline-block">
                  <span style={{ fontFamily: "'Sanchez', serif" }}>View Details</span>
                </Link>
              </motion.div>
              
              {/* National Champ Camp */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 border border-gray-200"
              >
                <div className="mb-6 h-1 w-16 bg-gray-900"></div>
                <h3 className="text-2xl mb-4" style={{ fontFamily: "'Bodoni FLF', serif" }}>
                  National Champ Camp
                </h3>
                <div className="mb-6 space-y-1">
                  <p className="text-gray-600" style={{ fontFamily: "'Arial', sans-serif" }}>June 5-7, 2025</p>
                  <p className="text-gray-600" style={{ fontFamily: "'Arial', sans-serif" }}>Roy Martin Middle School</p>
                  <p className="text-gray-600" style={{ fontFamily: "'Arial', sans-serif" }}>$349</p>
                </div>
                <p className="text-gray-700 mb-8" style={{ fontFamily: "'Didact Gothic', sans-serif" }}>
                  Train with NCAA champions and Olympic athletes in this intensive camp.
                </p>
                <Link href="/events/2" className="text-gray-900 border-b border-gray-900 pb-1 hover:text-sky-800 hover:border-sky-800 transition-colors inline-block">
                  <span style={{ fontFamily: "'Sanchez', serif" }}>View Details</span>
                </Link>
              </motion.div>
              
              {/* Texas Recruiting Clinic */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white p-8 border border-gray-200"
              >
                <div className="mb-6 h-1 w-16 bg-gray-900"></div>
                <h3 className="text-2xl mb-4" style={{ fontFamily: "'Bodoni FLF', serif" }}>
                  Texas Recruiting Clinic
                </h3>
                <div className="mb-6 space-y-1">
                  <p className="text-gray-600" style={{ fontFamily: "'Arial', sans-serif" }}>June 12-13, 2025</p>
                  <p className="text-gray-600" style={{ fontFamily: "'Arial', sans-serif" }}>Arlington Martin High School</p>
                  <p className="text-gray-600" style={{ fontFamily: "'Arial', sans-serif" }}>$249</p>
                </div>
                <p className="text-gray-700 mb-8" style={{ fontFamily: "'Didact Gothic', sans-serif" }}>
                  Designed specifically for high school wrestlers seeking collegiate opportunities.
                </p>
                <Link href="/events/3" className="text-gray-900 border-b border-gray-900 pb-1 hover:text-sky-800 hover:border-sky-800 transition-colors inline-block">
                  <span style={{ fontFamily: "'Sanchez', serif" }}>View Details</span>
                </Link>
              </motion.div>
            </div>
            
            <div className="mt-16 text-center">
              <Link href="/events" className="inline-block border border-gray-900 py-3 px-10 text-gray-900 tracking-wide hover:bg-gray-900 hover:text-white transition-colors">
                <span style={{ fontFamily: "'Sanchez', serif" }}>View All Events</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Fruit Hunters Partnership - Minimalist Approach */}
      <section className="py-24 bg-gray-100">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl mb-8" style={{ fontFamily: "'Bodoni FLF', serif" }}>
              Exclusive Partnership
            </h2>
            <h3 className="text-2xl mb-10 text-gray-600" style={{ fontFamily: "'Symphony', cursive" }}>
              Birmingham Slam Camp × Fruit Hunters
            </h3>
            <p className="text-xl mb-12 leading-relaxed max-w-3xl mx-auto text-gray-700"
               style={{ fontFamily: "'Didact Gothic', sans-serif" }}>
              Elevating athlete performance through premium nutrition. Fruit Hunters provides our athletes with exotic, nutrient-rich fruits for optimal recovery and results.
            </p>
            <Link href="/events/1" className="inline-block py-3 px-10 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors">
              <span style={{ fontFamily: "'Sanchez', serif" }}>Discover Partnership Details</span>
            </Link>
          </motion.div>
        </div>
        {/* Subtle sky accent line */}
        <div className="mt-24 h-px w-full bg-sky-200 opacity-30"></div>
      </section>
      
      {/* Newsletter Section - Minimalist Approach */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto"
          >
            <h2 className="text-4xl mb-6 text-center" style={{ fontFamily: "'Bodoni FLF', serif" }}>
              Stay Connected
            </h2>
            <p className="text-gray-700 mb-10 text-center"
               style={{ fontFamily: "'Didact Gothic', sans-serif" }}>
              Subscribe to receive updates on upcoming events, new apparel releases, and exclusive offers.
            </p>
            <form className="flex flex-col space-y-5">
              <input 
                type="email" 
                placeholder="your@email.com" 
                className="px-5 py-4 border border-gray-300 focus:outline-none focus:border-gray-900 bg-transparent"
                style={{ fontFamily: "'Arial', sans-serif" }}
              />
              <button 
                type="submit" 
                className="bg-gray-900 text-white py-4 px-6 hover:bg-gray-800 transition-colors"
                style={{ fontFamily: "'Sanchez', serif" }}
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}