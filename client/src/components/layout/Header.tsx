import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 100);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const isActive = (path: string) => {
    return location === path ? "after:w-full" : "";
  };

  return (
    <header className={`fixed top-0 w-full bg-white z-50 border-b border-shadow transition-shadow ${hasScrolled ? 'shadow-md' : ''}`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-3xl font-serif font-semibold tracking-tight">Rich Habits</Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/shop" className={`nav-link text-sm font-medium ${isActive("/shop")}`}>Shop</Link>
          <Link href="/custom-apparel" className={`nav-link text-sm font-medium whitespace-nowrap ${isActive("/custom-apparel")}`}>Custom Apparel</Link>
          <Link href="/events" className={`nav-link text-sm font-medium ${isActive("/events")}`}>Events</Link>
          <Link href="/gallery" className={`nav-link text-sm font-medium ${isActive("/gallery")}`}>Gallery</Link>
          <Link href="/about" className={`nav-link text-sm font-medium ${isActive("/about")}`}>About</Link>
          <Link href="/contact" className={`nav-link text-sm font-medium ${isActive("/contact")}`}>Contact</Link>
          <Link href="#" className="ml-4">
            <i className="icon ion-md-search text-lg"></i>
          </Link>
          <Link href="#" className="ml-2">
            <i className="icon ion-md-person text-lg"></i>
          </Link>
          <Link href="#" className="ml-2 relative">
            <i className="icon ion-md-cart text-lg"></i>
            <span className="absolute -top-2 -right-2 bg-[hsl(var(--accent2))] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">0</span>
          </Link>
        </nav>
        
        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-600 focus:outline-none" onClick={toggleMenu}>
          <i className={`icon ion-md-${isMenuOpen ? 'close' : 'menu'} text-2xl`}></i>
        </button>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden bg-white w-full border-t border-shadow ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="container mx-auto px-4 py-3">
          <nav className="flex flex-col space-y-4 py-3">
            <Link href="/shop" className="text-sm font-medium py-2">Shop</Link>
            <Link href="/custom-apparel" className="text-sm font-medium py-2">Custom Apparel</Link>
            <Link href="/events" className="text-sm font-medium py-2">Events</Link>
            <Link href="/gallery" className="text-sm font-medium py-2">Gallery</Link>
            <Link href="/about" className="text-sm font-medium py-2">About</Link>
            <Link href="/contact" className="text-sm font-medium py-2">Contact</Link>
            <div className="flex space-x-6 py-2">
              <Link href="#"><i className="icon ion-md-search text-lg"></i></Link>
              <Link href="#"><i className="icon ion-md-person text-lg"></i></Link>
              <Link href="#" className="relative">
                <i className="icon ion-md-cart text-lg"></i>
                <span className="absolute -top-2 -right-2 bg-[hsl(var(--accent2))] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">0</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
