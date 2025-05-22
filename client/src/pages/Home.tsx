import React from "react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="w-full min-h-[80vh] bg-gradient-to-b from-gray-900 to-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-black opacity-70"></div>
        
        <div className="container mx-auto px-4 z-10 text-white text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">Rich Habits</h1>
          <p className="text-xl md:text-2xl mb-8 font-light">Premium athletic apparel for high-performing athletes.</p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/shop" className="bg-orange-600 text-white py-3 px-8 font-medium tracking-wide hover:bg-orange-700 transition-colors inline-block rounded">
              Shop Collection
            </Link>
            <Link href="/custom-apparel" className="border border-white text-white py-3 px-8 font-medium tracking-wide hover:bg-white hover:bg-opacity-10 transition-colors inline-block rounded">
              Custom Team Gear
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured Events Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Upcoming Events</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Birmingham Slam Camp */}
            <div className="bg-white shadow-lg rounded-sm p-6 border-t-4 border-orange-600">
              <h3 className="text-2xl font-bold mb-2 text-orange-600">
                BIRMINGHAM SLAM CAMP
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600"><strong>Date:</strong> June 19-21, 2025</p>
                <p className="text-sm text-gray-600"><strong>Location:</strong> Clay-Chalkville Middle School</p>
                <p className="text-sm text-gray-600"><strong>Price:</strong> $249</p>
              </div>
              <p className="text-gray-700 mb-4">
                A high-energy wrestling camp featuring top coaches and intensive training.
              </p>
              <Link href="/events/1" className="bg-orange-600 inline-block py-2 px-6 text-white rounded-md font-medium">
                Learn More
              </Link>
            </div>
            
            {/* National Champ Camp */}
            <div className="bg-white shadow-lg rounded-sm p-6 border-t-4 border-blue-800">
              <h3 className="text-2xl font-bold mb-2 text-blue-800">
                NATIONAL CHAMP CAMP
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600"><strong>Date:</strong> June 5-7, 2025</p>
                <p className="text-sm text-gray-600"><strong>Location:</strong> Roy Martin Middle School</p>
                <p className="text-sm text-gray-600"><strong>Price:</strong> $349</p>
              </div>
              <p className="text-gray-700 mb-4">
                Train with NCAA champions and Olympic athletes in this intensive camp.
              </p>
              <Link href="/events/2" className="bg-blue-800 inline-block py-2 px-6 text-white rounded-md font-medium">
                Learn More
              </Link>
            </div>
            
            {/* Texas Recruiting Clinic */}
            <div className="bg-white shadow-lg rounded-sm p-6 border-t-4 border-red-600">
              <h3 className="text-2xl font-bold mb-2 text-red-600">
                TEXAS RECRUITING CLINIC
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600"><strong>Date:</strong> June 12-13, 2025</p>
                <p className="text-sm text-gray-600"><strong>Location:</strong> Arlington Martin High School</p>
                <p className="text-sm text-gray-600"><strong>Price:</strong> $249</p>
              </div>
              <p className="text-gray-700 mb-4">
                Designed specifically for high school wrestlers seeking collegiate opportunities.
              </p>
              <Link href="/events/3" className="bg-red-600 inline-block py-2 px-6 text-white rounded-md font-medium">
                Learn More
              </Link>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/events" className="inline-block border border-gray-800 py-3 px-8 font-medium tracking-wide hover:bg-gray-800 hover:text-white transition-colors rounded">
              View All Events
            </Link>
          </div>
        </div>
      </section>
      
      {/* Fruit Hunters Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">BIRMINGHAM SLAM CAMP × FRUIT HUNTERS</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Exclusive partnership with Fruit Hunters, providing athletes with premium exotic fruits for optimal performance and recovery.
          </p>
          <Link href="/events/1" className="bg-white text-orange-600 py-3 px-8 font-medium inline-block rounded hover:bg-gray-100 transition-colors">
            Learn About Our Partnership
          </Link>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Stay Updated</h2>
            <p className="text-gray-600 mb-8">
              Subscribe to our newsletter for updates on upcoming events, new apparel releases, and exclusive offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button 
                type="submit" 
                className="bg-orange-600 text-white py-3 px-6 font-medium hover:bg-orange-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}