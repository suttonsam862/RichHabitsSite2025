import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-primary text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-serif mb-6">Rich Habits</h3>
            <p className="text-gray-400 mb-6">Premium athletic apparel for high-performing athletes who demand quality and style.</p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/richhabits/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <i className="icon ion-logo-instagram text-xl"></i>
              </a>
              <a href="https://twitter.com/samsu1tonrh" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <i className="icon ion-logo-twitter text-xl"></i>
              </a>
              <a href="https://www.facebook.com/richhabitsapparel/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <i className="icon ion-logo-facebook text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><Link href="/shop" className="text-gray-400 hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/shop" className="text-gray-400 hover:text-white transition-colors">Performance Collection</Link></li>
              <li><Link href="/shop" className="text-gray-400 hover:text-white transition-colors">Essentials Line</Link></li>
              <li><Link href="/shop" className="text-gray-400 hover:text-white transition-colors">Competition Series</Link></li>
              <li><Link href="/shop" className="text-gray-400 hover:text-white transition-colors">Gift Cards</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Services</h4>
            <ul className="space-y-2">
              <li><Link href="/custom-apparel" className="text-gray-400 hover:text-white transition-colors">Custom Team Apparel</Link></li>
              <li><Link href="/events" className="text-gray-400 hover:text-white transition-colors">Sports Clinics & Events</Link></li>
              <li><Link href="/custom-apparel#consultation" className="text-gray-400 hover:text-white transition-colors">Design Consultation</Link></li>
              <li><Link href="/custom-apparel#bulk-orders" className="text-gray-400 hover:text-white transition-colors">Bulk Orders</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Information</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/shipping-returns" className="text-gray-400 hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} Rich Habits. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-6 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-xs text-white">Visa</span>
            </div>
            <div className="w-10 h-6 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-xs text-white">MC</span>
            </div>
            <div className="w-10 h-6 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-xs text-white">Amex</span>
            </div>
            <div className="w-10 h-6 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-xs text-white">PayPal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
