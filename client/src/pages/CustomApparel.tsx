import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";

// Import custom apparel components
import { ClothingSetShowcase } from "../components/custom-apparel/ClothingSetShowcase";
import { DesignShowcase } from "../components/custom-apparel/DesignShowcase";
import { FeaturedTeams } from "../components/custom-apparel/FeaturedTeams";
import { RashguardColorways } from "../components/custom-apparel/RashguardColorways";
import { SchoolPackages } from "../components/custom-apparel/SchoolPackages";
import { TeamGallery } from "../components/custom-apparel/TeamGallery";
import { Testimonials } from "../components/custom-apparel/Testimonials";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function CustomApparel() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      {/* Hero Section */}
      <motion.div 
        className="relative h-[70vh] mb-20 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <div className="absolute inset-0 bg-black">
          <div 
            className="absolute inset-0 opacity-50"
            style={{ 
              backgroundImage: `url(/images/custom-apparel/FullMockups.png)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'grayscale(80%)'
            }}
          ></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-6 h-full flex items-center relative z-10">
          <div className="max-w-3xl">
            <motion.h1 
              className="text-5xl md:text-7xl text-white mb-8"
              style={{ fontFamily: "'Playfair Display FC', serif" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Custom Team Apparel
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-200 mb-10"
              style={{ fontFamily: "'Didact Gothic', sans-serif" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Elevate your team's identity with premium custom apparel designed for athletes who demand quality in every detail.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <a href="#contact-form" className="inline-block bg-gray-50 px-6 py-3 text-gray-900">
                <span style={{ fontFamily: "'Sanchez', serif" }}>Request Custom Quote</span>
              </a>
            </motion.div>
          </div>
        </div>
        
        {/* Subtle sky accent line */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-200 opacity-30"></div>
      </motion.div>
      
      {/* Content Sections */}
      <div className="container mx-auto px-6">
        {/* Introduction */}
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-20"
          variants={fadeIn}
          initial="initial"
          animate="animate"
        >
          <h2 
            className="text-3xl md:text-4xl mb-6"
            style={{ fontFamily: "'Bodoni FLF', serif" }}
          >
            Creating Elite Team Identity
          </h2>
          <p 
            className="text-gray-700 text-lg mb-8"
            style={{ fontFamily: "'Didact Gothic', sans-serif" }}
          >
            Rich Habits specializes in crafting premium custom apparel for wrestling teams, schools, and clubs. Our designs combine performance-focused construction with distinctive aesthetics that set your team apart.
          </p>
        </motion.div>
        
        {/* Featured Designs */}
        <motion.div
          className="mb-24"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <h2 
            className="text-3xl text-center mb-12"
            style={{ fontFamily: "'Bodoni FLF', serif" }}
          >
            Featured Designs
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div
              variants={fadeIn}
              className="bg-white p-8 border border-gray-200"
            >
              <div className="mb-6">
                <img 
                  src="/images/custom-apparel/ClassicRashguardMockup.png" 
                  alt="Competition Gear" 
                  className="w-full h-auto"
                  style={{ filter: 'grayscale(30%)' }}
                />
              </div>
              <h3 
                className="text-2xl mb-4"
                style={{ fontFamily: "'Bodoni FLF', serif" }}
              >
                Competition Gear
              </h3>
              <p 
                className="text-gray-700 mb-6"
                style={{ fontFamily: "'Didact Gothic', sans-serif" }}
              >
                Performance-focused singlets, rashguards, and warmups designed for competitive excellence.
              </p>
            </motion.div>
            
            <motion.div
              variants={fadeIn}
              className="bg-white p-8 border border-gray-200"
            >
              <div className="mb-6">
                <img 
                  src="/images/custom-apparel/BrooksMockupFinal.png" 
                  alt="Team Packages" 
                  className="w-full h-auto"
                  style={{ filter: 'grayscale(30%)' }}
                />
              </div>
              <h3 
                className="text-2xl mb-4"
                style={{ fontFamily: "'Bodoni FLF', serif" }}
              >
                Team Packages
              </h3>
              <p 
                className="text-gray-700 mb-6"
                style={{ fontFamily: "'Didact Gothic', sans-serif" }}
              >
                Comprehensive collections including competition gear, training attire, and team casual wear.
              </p>
            </motion.div>
            
            <motion.div
              variants={fadeIn}
              className="bg-white p-8 border border-gray-200"
            >
              <div className="mb-6">
                <img 
                  src="/images/custom-apparel/10pDeathSquad Mockup.png" 
                  alt="Special Editions" 
                  className="w-full h-auto"
                  style={{ filter: 'grayscale(30%)' }}
                />
              </div>
              <h3 
                className="text-2xl mb-4"
                style={{ fontFamily: "'Bodoni FLF', serif" }}
              >
                Special Editions
              </h3>
              <p 
                className="text-gray-700 mb-6"
                style={{ fontFamily: "'Didact Gothic', sans-serif" }}
              >
                Limited release designs with distinctive aesthetics for teams that want to stand out.
              </p>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Our Process */}
        <motion.div
          className="mb-24"
          variants={fadeIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <h2 
            className="text-3xl text-center mb-12"
            style={{ fontFamily: "'Bodoni FLF', serif" }}
          >
            Our Design Process
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span style={{ fontFamily: "'Sanchez', serif" }}>01</span>
              </div>
              <h3 
                className="text-xl mb-3"
                style={{ fontFamily: "'Bodoni FLF', serif" }}
              >
                Consultation
              </h3>
              <p 
                className="text-gray-600"
                style={{ fontFamily: "'Didact Gothic', sans-serif" }}
              >
                Initial meeting to understand your team's needs, aesthetic preferences, and performance requirements.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span style={{ fontFamily: "'Sanchez', serif" }}>02</span>
              </div>
              <h3 
                className="text-xl mb-3"
                style={{ fontFamily: "'Bodoni FLF', serif" }}
              >
                Design
              </h3>
              <p 
                className="text-gray-600"
                style={{ fontFamily: "'Didact Gothic', sans-serif" }}
              >
                Our designers create custom mockups based on your team's identity and vision.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span style={{ fontFamily: "'Sanchez', serif" }}>03</span>
              </div>
              <h3 
                className="text-xl mb-3"
                style={{ fontFamily: "'Bodoni FLF', serif" }}
              >
                Refinement
              </h3>
              <p 
                className="text-gray-600"
                style={{ fontFamily: "'Didact Gothic', sans-serif" }}
              >
                Collaborative revision process to perfect every detail of your team's apparel.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span style={{ fontFamily: "'Sanchez', serif" }}>04</span>
              </div>
              <h3 
                className="text-xl mb-3"
                style={{ fontFamily: "'Bodoni FLF', serif" }}
              >
                Production
              </h3>
              <p 
                className="text-gray-600"
                style={{ fontFamily: "'Didact Gothic', sans-serif" }}
              >
                Meticulous manufacturing with premium materials and quality control at every step.
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Team Gallery Section */}
        <TeamGallery />
        
        {/* Request Form */}
        <motion.div
          id="contact-form"
          className="max-w-2xl mx-auto my-24 p-12 bg-white border border-gray-200"
          variants={fadeIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <h2 
            className="text-3xl mb-8 text-center"
            style={{ fontFamily: "'Bodoni FLF', serif" }}
          >
            Request a Custom Quote
          </h2>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label 
                  className="block text-gray-700 mb-2"
                  style={{ fontFamily: "'Sanchez', serif" }}
                >
                  Team/Organization Name
                </label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-300 focus:outline-none focus:border-gray-900"
                  style={{ fontFamily: "'Arial', sans-serif" }}
                />
              </div>
              
              <div>
                <label 
                  className="block text-gray-700 mb-2"
                  style={{ fontFamily: "'Sanchez', serif" }}
                >
                  Contact Name
                </label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-300 focus:outline-none focus:border-gray-900"
                  style={{ fontFamily: "'Arial', sans-serif" }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label 
                  className="block text-gray-700 mb-2"
                  style={{ fontFamily: "'Sanchez', serif" }}
                >
                  Email
                </label>
                <input 
                  type="email" 
                  className="w-full p-3 border border-gray-300 focus:outline-none focus:border-gray-900"
                  style={{ fontFamily: "'Arial', sans-serif" }}
                />
              </div>
              
              <div>
                <label 
                  className="block text-gray-700 mb-2"
                  style={{ fontFamily: "'Sanchez', serif" }}
                >
                  Phone
                </label>
                <input 
                  type="tel" 
                  className="w-full p-3 border border-gray-300 focus:outline-none focus:border-gray-900"
                  style={{ fontFamily: "'Arial', sans-serif" }}
                />
              </div>
            </div>
            
            <div>
              <label 
                className="block text-gray-700 mb-2"
                style={{ fontFamily: "'Sanchez', serif" }}
              >
                Apparel Needs (Select all that apply)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="form-checkbox h-4 w-4" />
                  <span style={{ fontFamily: "'Didact Gothic', sans-serif" }}>Competition Singlets</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="form-checkbox h-4 w-4" />
                  <span style={{ fontFamily: "'Didact Gothic', sans-serif" }}>Rashguards</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="form-checkbox h-4 w-4" />
                  <span style={{ fontFamily: "'Didact Gothic', sans-serif" }}>Team Warmups</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="form-checkbox h-4 w-4" />
                  <span style={{ fontFamily: "'Didact Gothic', sans-serif" }}>Casual Team Apparel</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="form-checkbox h-4 w-4" />
                  <span style={{ fontFamily: "'Didact Gothic', sans-serif" }}>Complete Team Package</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="form-checkbox h-4 w-4" />
                  <span style={{ fontFamily: "'Didact Gothic', sans-serif" }}>Other</span>
                </label>
              </div>
            </div>
            
            <div>
              <label 
                className="block text-gray-700 mb-2"
                style={{ fontFamily: "'Sanchez', serif" }}
              >
                Estimated Quantity
              </label>
              <select 
                className="w-full p-3 border border-gray-300 focus:outline-none focus:border-gray-900"
                style={{ fontFamily: "'Arial', sans-serif" }}
              >
                <option value="">Select a range</option>
                <option value="1-10">1-10 items</option>
                <option value="11-25">11-25 items</option>
                <option value="26-50">26-50 items</option>
                <option value="51-100">51-100 items</option>
                <option value="100+">100+ items</option>
              </select>
            </div>
            
            <div>
              <label 
                className="block text-gray-700 mb-2"
                style={{ fontFamily: "'Sanchez', serif" }}
              >
                Additional Details
              </label>
              <textarea 
                rows={5}
                className="w-full p-3 border border-gray-300 focus:outline-none focus:border-gray-900"
                style={{ fontFamily: "'Arial', sans-serif" }}
                placeholder="Tell us about your team's colors, design preferences, timeline, etc."
              ></textarea>
            </div>
            
            <button 
              type="submit"
              className="w-full bg-gray-900 text-white py-4 px-6 hover:bg-gray-800 transition-colors"
              style={{ fontFamily: "'Sanchez', serif" }}
            >
              Submit Request
            </button>
          </form>
        </motion.div>
        
        {/* Testimonials Section */}
        <Testimonials />
        
        {/* Subtle sky accent line */}
        <div className="mt-24 h-px w-full bg-sky-200 opacity-30"></div>
      </div>
    </div>
  );
}