import { Link } from 'wouter';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import AppStatus from '../components/AppStatus';
import { usePrefetch, prefetchPages } from '@/hooks/usePrefetch';

const Home = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Prefetch commonly visited pages after 2 seconds
  usePrefetch(prefetchPages.events, 2000);
  usePrefetch(prefetchPages.contact, 3000);
  usePrefetch(prefetchPages.customApparel, 4000);

  // Fetch events data
  const { data: events } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const response = await fetch('/api/events');
      return response.json();
    }
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle contact form submission
    console.log('Contact form submitted:', formData);
  };

  const featuredEvents = events?.slice(0, 3) || [];

  return (
    <Layout>
      {/* App Status for debugging */}
      <AppStatus />
      
      {/* Hero Section */}
      <section className="section-padding">
        <div className="container-fluid">
          <div className="grid-container">
            <div className="grid-6">
              <h1 className="font-title text-6xl lg:text-8xl text-black mb-8 animate-float">
                Elite Wrestling
                <br />
                <span className="font-script text-5xl lg:text-7xl text-gradient">
                  Training & Events
                </span>
              </h1>
              
              <p className="font-body text-xl lg:text-2xl text-black/80 mb-12 leading-relaxed">
                Championship-level coaching, intensive training camps, and premier recruiting events 
                for wrestlers who demand excellence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/events" className="btn-primary animate-glow">
                  View Upcoming Events
                </Link>
                <Link href="/custom-apparel" className="btn-ghost">
                  Custom Training Gear
                </Link>
              </div>
            </div>
            
            <div className="grid-6">
              <img 
                src="/src/assets/events/slam_camp_banner.png"
                alt="Elite Wrestling Training" 
                className="hero-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/src/assets/images/DSC09353.JPG';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="section-padding bg-white">
        <div className="container-fluid">
          <div className="text-center mb-16">
            <h2 className="font-title text-4xl lg:text-5xl text-black mb-4">
              Upcoming Events
            </h2>
            <p className="font-body text-lg text-black/70 max-w-2xl mx-auto">
              Join elite wrestlers and championship coaches at our intensive training events
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event: any) => (
              <div key={event.id} className="card card-chromatic p-6 group">
                <div className="mb-4">
                  <h3 className="font-title text-xl text-black mb-2 group-hover:text-gradient transition-all duration-300">
                    {event.name}
                  </h3>
                  <p className="font-body text-black/60 text-sm mb-3">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="font-body text-black/80 text-sm leading-relaxed">
                    {event.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-body font-semibold text-black">
                    ${event.price}
                  </span>
                  <Link 
                    href={`/events/${event.id}`}
                    className="btn-ghost text-sm"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/events" className="btn-primary">
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* Fruit Hunters Section */}
      <section className="section-padding bg-gray-50/30">
        <div className="container-fluid">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-title text-4xl lg:text-5xl text-black mb-6">
              Fruit Hunters
            </h2>
            <p className="font-body text-lg text-black/80 mb-8 leading-relaxed">
              Elite recruiting network connecting top wrestlers with championship programs. 
              Discover opportunities, showcase talent, and elevate your wrestling career.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-title text-lg text-black mb-2">Talent Discovery</h3>
                <p className="font-body text-black/70 text-sm">
                  Connect with college recruiters and showcase your wrestling achievements
                </p>
              </div>
              
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-title text-lg text-black mb-2">Elite Network</h3>
                <p className="font-body text-black/70 text-sm">
                  Access exclusive coaching clinics and training opportunities
                </p>
              </div>
              
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="font-title text-lg text-black mb-2">Championship Path</h3>
                <p className="font-body text-black/70 text-sm">
                  Proven development programs for elite wrestling success
                </p>
              </div>
            </div>
            
            <Link href="/contact" className="btn-primary">
              Join Fruit Hunters
            </Link>
          </div>
        </div>
      </section>

      {/* Custom Gear Section */}
      <section className="section-padding bg-white">
        <div className="container-fluid">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-title text-4xl lg:text-5xl text-black mb-6">
                Custom Training Gear
              </h2>
              <p className="font-body text-lg text-black/80 mb-8 leading-relaxed">
                Premium wrestling apparel designed for champions. Custom team gear, 
                competition singlets, and training equipment built to elite standards.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="font-body text-black/80">Custom team designs and logos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="font-body text-black/80">Premium performance fabrics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="font-body text-black/80">Fast turnaround times</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="font-body text-black/80">Championship-grade quality</span>
                </div>
              </div>
              
              <Link href="/custom-apparel" className="btn-primary">
                Design Custom Gear
              </Link>
            </div>
            
            <div className="relative">
              <div className="card p-8 text-center animate-float">
                <img 
                  src="/src/assets/custom-apparel/FullMockups.png"
                  alt="Custom Wrestling Apparel"
                  className="showcase-image mb-6"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/src/assets/custom-apparel/ClassicRashguardMockup.png';
                  }}
                />
                <h3 className="font-title text-xl text-black mb-3">
                  Elite Wrestling Apparel
                </h3>
                <p className="font-body text-black/70 mb-6">
                  Custom singlets, warm-ups, and training gear designed for peak performance
                </p>
                <div className="text-2xl font-title text-black">
                  From $45
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="section-padding bg-gray-50/30">
        <div className="container-fluid">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-title text-4xl lg:text-5xl text-black mb-4">
                Get In Touch
              </h2>
              <p className="font-body text-lg text-black/70">
                Ready to elevate your wrestling journey? Contact us about events, custom gear, or recruiting opportunities.
              </p>
            </div>
            
            <form onSubmit={handleContactSubmit} className="card p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="form-input"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="form-label">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  className="form-input resize-none"
                  placeholder="Tell us about your wrestling goals and how we can help..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                />
              </div>
              
              <div className="text-center">
                <button type="submit" className="btn-primary">
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="container-fluid">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="font-title text-2xl text-black mb-4">
                Rich Habits
              </div>
              <p className="font-body text-black/70 max-w-md">
                Elite wrestling training and custom apparel for champions. 
                Building excellence through proven coaching and premier events.
              </p>
            </div>
            
            <div>
              <h4 className="font-title text-lg text-black mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/events" className="block font-body text-black/70 hover:text-black transition-colors">
                  Events
                </Link>
                <Link href="/custom-apparel" className="block font-body text-black/70 hover:text-black transition-colors">
                  Custom Gear
                </Link>
                <Link href="/about" className="block font-body text-black/70 hover:text-black transition-colors">
                  About
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-title text-lg text-black mb-4">Connect</h4>
              <div className="space-y-2">
                <Link href="/contact" className="block font-body text-black/70 hover:text-black transition-colors">
                  Contact Us
                </Link>
                <a href="mailto:info@richhabits.com" className="block font-body text-black/70 hover:text-black transition-colors">
                  info@richhabits.com
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 mt-8 pt-8 text-center">
            <p className="font-body text-black/60 text-sm">
              © 2025 Rich Habits. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default Home;