import React from "react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          <div className="mb-8 md:mb-0">
            <h3 className="text-2xl font-bold mb-4">Rich Habits</h3>
            <p className="text-gray-400 max-w-sm">
              High-performance athletic gear and events for athletes who demand excellence.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link href="/events" className="text-gray-400 hover:text-white">Events</Link></li>
                <li><Link href="/shop" className="text-gray-400 hover:text-white">Shop</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/return-policy" className="text-gray-400 hover:text-white">Return Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-700 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Rich Habits. All rights reserved.</p>
          <div className="mt-2">
            <p>Contact: admin@rich-habits.com | +1 (480) 810-4477</p>
          </div>
        </div>
      </div>
    </footer>
  );
}