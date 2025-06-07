import React from 'react';

export default function Events() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center pt-10 mb-8">Upcoming Wrestling Events</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Youth Championship</h3>
            <p className="text-gray-600 mb-4">Ages 12-16 wrestling tournament</p>
            <div className="text-sm text-gray-500 mb-4">
              <p>Date: March 15, 2024</p>
              <p>Location: Central High School</p>
              <p>Registration Fee: $45</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Register Now
            </button>
          </div>
          
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Adult Open Tournament</h3>
            <p className="text-gray-600 mb-4">Open weight class competition</p>
            <div className="text-sm text-gray-500 mb-4">
              <p>Date: March 22, 2024</p>
              <p>Location: Wrestling Center</p>
              <p>Registration Fee: $60</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Register Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}