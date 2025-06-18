import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useCart } from "../../contexts/CartContext";
import { ShoppingCart, Menu, X  } from "../../lib/icons";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { state } = useCart();

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

  const navigationItems = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/shop', label: 'Shop' },
    { path: '/custom-apparel', label: 'Custom Apparel' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <header 
      className={`fixed w-full top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-2 md:py-3' : 'bg-white/80 backdrop-blur-sm py-4 md:py-6'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center h-8 md:h-10 cursor-pointer">
            <img 
              src="/images/rich-habits-logo-black.webp" 
              alt="Rich Habits Wrestling" 
              className="h-full w-auto object-contain"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (img.dataset.fallbackAttempted !== 'true') {
                  img.dataset.fallbackAttempted = 'true';
                  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwIiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMTQwIDMyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjUiIHk9IjE0IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMxZjI5MzciPkhCSDwvdGV4dD48dGV4dCB4PSI1IiB5PSIyNiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMWYyOTM3Ij5XSEVTVFRBSU5HPC90ZXh0Pjwvc3ZnPg==';
                }
              }}
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6">
          <nav>
            <ul className="flex space-x-6 xl:space-x-8">
              {navigationItems.map(({ path, label }) => (
                <li key={path}>
                  <Link href={path}>
                    <motion.span
                      className={`cursor-pointer relative font-bold text-sm xl:text-base ${
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

          <Link href="/cart">
            <motion.div
              className="relative p-2 rounded-full transition-all duration-300 cursor-pointer text-gray-800 hover:bg-gray-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={20} />
              {state.itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  {state.itemCount > 99 ? '99+' : state.itemCount}
                </motion.span>
              )}
            </motion.div>
          </Link>
        </div>

        {/* Mobile Menu Button and Cart */}
        <div className="lg:hidden flex items-center space-x-3">
          <Link href="/cart">
            <motion.div
              className="relative p-2 rounded-full transition-all duration-300 cursor-pointer text-gray-800 hover:bg-gray-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={18} />
              {state.itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-xs"
                >
                  {state.itemCount > 9 ? '9+' : state.itemCount}
                </motion.span>
              )}
            </motion.div>
          </Link>

          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg transition-all duration-300 ${
              scrolled ? 'text-gray-800 hover:bg-gray-100' : 'text-gray-800 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden bg-white border-t border-gray-200 shadow-lg"
        >
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-4">
              {navigationItems.map(({ path, label }) => (
                <li key={path}>
                  <Link href={path}>
                    <motion.span
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                        location === path 
                          ? 'bg-blue-50 text-blue-600 font-bold' 
                          : 'text-gray-800 hover:bg-gray-50'
                      }`}
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {label}
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>
      )}

      {/* Subtle sky accent line */}
      <div className={`absolute bottom-0 left-0 w-full h-px bg-sky-200 opacity-30 ${scrolled ? 'opacity-100' : 'opacity-30'}`}></div>
    </header>
  );
}