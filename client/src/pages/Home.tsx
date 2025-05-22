import React from "react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 bg-gray-100 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="bg-white bg-opacity-85 backdrop-blur-sm p-8 md:p-12 rounded-lg shadow-md max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Performance Gear for Elite Athletes</h2>
            <p className="text-xl text-gray-700 mb-8">
              A comprehensive athlete-centric e-commerce and event management platform providing 
              advanced, interactive experiences for sports enthusiasts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/events" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-md text-center transition-colors">
                Explore Events
              </Link>
              <Link href="/shop" className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-md text-center transition-colors">
                Shop Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Featured Wrestling Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Birmingham Slam Camp */}
            <div className="bg-gradient-to-br from-orange-500 to-red-700 text-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all">
              <div className="p-6">
                <h3 className="font-bold text-2xl mb-2">Birmingham Slam Camp</h3>
                <div className="font-semibold text-lg mb-3">Birmingham, AL</div>
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <span>June 19-21, 2025</span>
                  </div>
                  <div className="flex items-center">
                    <span>Clay-Chalkville Middle School</span>
                  </div>
                </div>
                <div className="mb-4 text-sm">
                  <p>Limited to 200 wrestlers</p>
                  <p className="font-semibold mt-1">$249 full camp / $149 single day</p>
                </div>
                <Link href="/events/birmingham-slam-camp" className="block text-center bg-white text-orange-600 font-bold py-2 px-4 rounded-full text-sm hover:bg-orange-100 transition-colors">
                  Register Now
                </Link>
              </div>
            </div>

            {/* National Champ Camp */}
            <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all">
              <div className="p-6">
                <h3 className="font-bold text-2xl mb-2">National Champ Camp</h3>
                <div className="font-semibold text-lg mb-3">Las Vegas, NV</div>
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <span>June 5-7, 2025</span>
                  </div>
                  <div className="flex items-center">
                    <span>Roy Martin Middle School</span>
                  </div>
                </div>
                <div className="mb-4 text-sm">
                  <p>Limited to 200 wrestlers</p>
                  <p className="font-semibold mt-1">$349 full camp / $175 per day</p>
                </div>
                <Link href="/events/national-champ-camp" className="block text-center bg-white text-blue-700 font-bold py-2 px-4 rounded-full text-sm hover:bg-blue-100 transition-colors">
                  Register Now
                </Link>
              </div>
            </div>

            {/* Texas Recruiting Clinic */}
            <div className="bg-gradient-to-br from-red-600 to-blue-700 text-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all">
              <div className="p-6">
                <h3 className="font-bold text-2xl mb-2">Texas Recruiting Clinic</h3>
                <div className="font-semibold text-lg mb-3">Arlington, TX</div>
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <span>June 12-13, 2025</span>
                  </div>
                  <div className="flex items-center">
                    <span>Arlington Martin High School</span>
                  </div>
                </div>
                <div className="mb-4 text-sm">
                  <p>Limited to 150 wrestlers</p>
                  <p className="font-semibold mt-1">$249 per wrestler</p>
                </div>
                <Link href="/events/texas-recruiting-clinic" className="block text-center bg-white text-red-600 font-bold py-2 px-4 rounded-full text-sm hover:bg-blue-100 transition-colors">
                  Register Now
                </Link>
              </div>
            </div>

            {/* Panther Train Tour */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-900 text-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all">
              <div className="p-6">
                <h3 className="font-bold text-2xl mb-2">Panther Train Tour</h3>
                <div className="font-semibold text-lg mb-3">Multiple Locations</div>
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <span>July 23-25, 2025</span>
                  </div>
                  <div className="flex items-center">
                    <span>Various Venues</span>
                  </div>
                </div>
                <div className="mb-4 text-sm">
                  <p>Multiple clinics across the South</p>
                  <p className="font-semibold mt-1">$99 per day / $200 all three days</p>
                </div>
                <Link href="/events/panther-train-tour" className="block text-center bg-white text-purple-700 font-bold py-2 px-4 rounded-full text-sm hover:bg-purple-100 transition-colors">
                  Register Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}