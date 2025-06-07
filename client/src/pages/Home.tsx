
import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Rich Habits Wrestling
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Premium wrestling camps, custom apparel, and elite training programs. 
            Elevate your wrestling skills with championship-level coaching and gear.
          </p>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/events" 
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              View Wrestling Events
            </Link>
            <Link 
              to="/shop" 
              className="inline-block bg-gray-800 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-900 transition-colors"
            >
              Shop Custom Apparel
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤼</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Elite Training Camps</h3>
            <p className="text-gray-600">
              Train with NCAA champions and Olympic athletes in intensive wrestling camps.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👕</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Custom Apparel</h3>
            <p className="text-gray-600">
              Premium wrestling gear and custom team apparel designed for champions.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Championship Results</h3>
            <p className="text-gray-600">
              Proven coaching methods that have produced state and national champions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
