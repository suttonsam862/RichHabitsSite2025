import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Rich Habits Wrestling
          </h1>
          <p className="text-xl text-gray-600">
            Elite Wrestling Event Management Platform
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">Wrestling Events</h2>
            <p className="text-blue-700 mb-4">Manage tournaments, competitions, and training sessions</p>
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              View Events
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-green-900 mb-2">Wrestling Gear</h2>
            <p className="text-green-700 mb-4">Browse premium wrestling equipment and apparel</p>
            <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Shop Now
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-purple-900 mb-2">Administration</h2>
            <p className="text-purple-700 mb-4">Event management and platform administration</p>
            <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Admin Panel
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Application Status: Active
          </div>
        </div>
      </div>
    </div>
  );
}