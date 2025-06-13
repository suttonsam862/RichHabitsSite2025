import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  // Track scroll position to change header style when scrolled
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <header 
      className={`fixed w-full top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/">
          <motion.img 
            src="/Cursive-Logo.webp"
            alt="Rich Habits"
            className="h-8 w-auto cursor-pointer"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          />
        </Link>

        <div className="flex items-center space-x-6">
          <nav>
            <ul className="flex space-x-8">
              {[
                { path: '/', label: 'Home' },
                { path: '/events', label: 'Events' },
                { path: '/shop', label: 'Shop' },
                { path: '/custom-apparel', label: 'Custom Apparel' },
                { path: '/contact', label: 'Contact' }
              ].map(({ path, label }) => (
                <li key={path}>
                  <Link href={path}>
                    <motion.span
                      className={`cursor-pointer relative font-bold ${
                        scrolled ? 'text-gray-800' : 'text-gray-800'
                      } ${location === path ? 'font-bold' : ''}`}
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                      whileHover={{ color: '#0369a1' }}
                      transition={{ duration: 0.2 }}
                    >
                      {label}
                      {location === path && (
                        <motion.span 
                          className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-200 opacity-70"
                          layoutId="underline"
                        />
                      )}
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <motion.button
            className={`p-2 rounded-full transition-all duration-300 ${
              scrolled ? 'text-gray-800 hover:bg-gray-100' : 'text-gray-800 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            aria-label="Shopping Cart"
          >
            <ShoppingCart size={20} />
          </motion.button>
        </div>
      </div>
      {/* Subtle sky accent line */}
      <div className={`absolute bottom-0 left-0 w-full h-px bg-sky-200 opacity-30 ${scrolled ? 'opacity-100' : 'opacity-30'}`}></div>
    </header>
  );
}