import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Rich Habits Wrestling
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Premium wrestling camps, custom apparel, and elite training programs
          </p>
          <div className="space-x-4">
            <a 
              href="/events" 
              className="inline-block bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-600 transition-colors"
            >
              View Events
            </a>
            <a 
              href="/shop" 
              className="inline-block bg-gray-500 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Shop Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}