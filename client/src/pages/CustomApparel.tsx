import { Container } from "@/components/ui/container";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { useState, useEffect } from "react";
import { TeamGallery } from "@/components/custom-apparel/TeamGallery";
import { FeaturedTeams } from "@/components/custom-apparel/FeaturedTeams";
import { ClothingSetShowcase } from "@/components/custom-apparel/ClothingSetShowcase";
import { RashguardColorways } from "@/components/custom-apparel/RashguardColorways";
import { SchoolPackages } from "@/components/custom-apparel/SchoolPackages";
import { DesignShowcase } from "@/components/custom-apparel/DesignShowcase";
// Testimonials component removed as requested

export default function CustomApparel() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  
  const wrestlerImages = [
    "/assets/DSC09491.JPG",
    "/assets/DSC07386.JPG",
    "/assets/DSC00423.JPG",
    "/assets/DSC09374--.JPG"
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === wrestlerImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change every 5 seconds
    
    return () => clearInterval(interval);
  }, [wrestlerImages.length]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Set loading state
    setIsSubmitting(true);
    
    // Get form data using type assertions
    const form = e.currentTarget;
    const nameInput = form.elements.namedItem('name') as HTMLInputElement;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    const phoneInput = form.elements.namedItem('phone') as HTMLInputElement;
    const organizationInput = form.elements.namedItem('organization') as HTMLInputElement;
    const sportInput = form.elements.namedItem('sport') as HTMLInputElement;
    const detailsInput = form.elements.namedItem('details') as HTMLTextAreaElement;
    
    // Safety check
    if (!nameInput || !emailInput || !organizationInput || !sportInput || !detailsInput) {
      alert('Please fill out all required fields');
      setIsSubmitting(false);
      return;
    }
    
    // Prepare data object
    const data = {
      name: nameInput.value,
      email: emailInput.value,
      phone: phoneInput ? phoneInput.value : '',
      organizationName: organizationInput.value,
      sport: sportInput.value,
      details: detailsInput.value
    };
    
    try {
      // Import and use the submission function
      const { submitCustomApparelInquiry } = await import('@/lib/shopify');
      await submitCustomApparelInquiry(data);
      
      // Set success state
      setSubmissionComplete(true);
    } catch (err) {
      console.error('Error submitting form:', err);
      setIsSubmitting(false);
      alert('There was an error submitting your inquiry. Please try again or contact us directly.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Custom Team Apparel - Rich Habits</title>
        <meta name="description" content="Create custom apparel for your wrestling team. Rich Habits offers personalized designs, high-quality fabrics, and unique branding options." />
      </Helmet>
      
      <div className="min-h-screen bg-white">
        {/* Hero Section with Wrestler Image Carousel */}
        <section className="relative flex flex-col md:flex-row h-[90vh] items-center bg-black overflow-hidden">
          {/* Background Image Carousel */}
          <div className="absolute inset-0 z-0">
            <AnimatePresence mode="wait">
              {wrestlerImages.map((src, index) => (
                index === currentImageIndex && (
                  <motion.div
                    key={src}
                    className="absolute inset-0 h-full w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                  >
                    <div 
                      className="h-full w-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${src})`,
                        backgroundBlendMode: 'overlay',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)'
                      }}
                    />
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
          
          {/* Hero Content */}
          <Container className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left py-12 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="max-w-4xl"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Custom Team <span className="text-primary">Apparel</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl">
                Elevate your team's identity with high-quality custom wrestling gear crafted for performance and unique style.
              </p>
              <a href="#contactForm" className="bg-primary hover:bg-opacity-90 text-white py-3 px-8 text-lg font-semibold inline-block transition-all">
                Request a Quote
              </a>
            </motion.div>
          </Container>
        </section>
        
        {/* School Packages Showcase */}
        <SchoolPackages />
        
        {/* Design Showcase Section */}
        <DesignShowcase />
        
        {/* Services Section */}
        <section className="py-24 bg-white">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Custom Apparel Services</h2>
              <p className="text-lg max-w-3xl mx-auto">
                From concept to delivery, we handle every step of the process for your team's custom gear.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="text-center p-6">
                <div className="flex justify-center items-center h-20 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Custom Design</h3>
                <p>Our design team works with you to create unique apparel that represents your team's identity and stands out from the competition.</p>
              </div>
              
              <div className="text-center p-6">
                <div className="flex justify-center items-center h-20 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Premium Materials</h3>
                <p>We use only high-quality, performance-tested fabrics designed to endure intense training and competition while maintaining comfort.</p>
              </div>
              
              <div className="text-center p-6">
                <div className="flex justify-center items-center h-20 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Full-Service Production</h3>
                <p>From design approval to manufacturing and timely delivery, we manage the entire process to ensure exceptional quality and customer satisfaction.</p>
              </div>
            </div>
          </Container>
        </section>
        
        {/* Complete Clothing Sets Showcase */}
        <ClothingSetShowcase />
        
        {/* Rashguard Colorways Showcase */}
        <RashguardColorways />
        
        {/* Featured Teams Section */}
        <FeaturedTeams />
        
        <TeamGallery />
        
        {/* Testimonials Section removed as requested */}
        
        {/* Contact Form Section */}
        <section id="contactForm" className="py-20 bg-[hsl(var(--secondary))]">
          <Container>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-serif font-semibold mb-6 text-center">Request a Consultation</h2>
              <p className="text-lg mb-8 text-center">Fill out the form below to discuss your team's custom apparel needs.</p>
              
              {submissionComplete ? (
                <div className="bg-white p-8 shadow-sm text-center">
                  <div className="flex items-center justify-center mb-4">
                    <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium mb-2">Submission Received!</h3>
                  <p className="text-gray-700 mb-6">Thank you for your inquiry. We'll get back to you as soon as possible.</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-gray-200 text-gray-800 py-2 px-4 font-medium hover:bg-gray-300 transition-colors"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form 
                  className="space-y-6 bg-white p-8 shadow-sm"
                  onSubmit={handleFormSubmit}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="name">Your Name</label>
                      <input 
                        type="text" 
                        id="name"
                        name="name"
                        className="w-full p-3 border border-[hsl(var(--shadow))] focus:border-primary focus:outline-none"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="email">Email Address</label>
                      <input 
                        type="email" 
                        id="email"
                        name="email"
                        className="w-full p-3 border border-[hsl(var(--shadow))] focus:border-primary focus:outline-none"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="organization">Organization/Team Name</label>
                      <input 
                        type="text" 
                        id="organization"
                        name="organization"
                        className="w-full p-3 border border-[hsl(var(--shadow))] focus:border-primary focus:outline-none"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="sport">Sport/Activity</label>
                      <input 
                        type="text" 
                        id="sport"
                        name="sport"
                        className="w-full p-3 border border-[hsl(var(--shadow))] focus:border-primary focus:outline-none"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="phone">Phone Number (Optional)</label>
                    <input 
                      type="tel" 
                      id="phone"
                      name="phone"
                      className="w-full p-3 border border-[hsl(var(--shadow))] focus:border-primary focus:outline-none"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="details">Project Details</label>
                    <textarea 
                      id="details"
                      name="details"
                      className="w-full p-3 border border-[hsl(var(--shadow))] focus:border-primary focus:outline-none min-h-[150px]"
                      placeholder="Tell us about your team, your design ideas, timeline, and any specific requirements."
                      required
                      disabled={isSubmitting}
                    ></textarea>
                  </div>
                  
                  <div className="text-center">
                    <button 
                      type="submit" 
                      className={`${isSubmitting ? 'bg-gray-500' : 'bg-primary'} text-white py-3 px-8 font-medium hover:bg-opacity-90 transition-colors`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
