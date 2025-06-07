import React, { useState } from 'react';

const events = [
  {
    id: 1,
    title: "Birmingham Slam Camp",
    date: "June 19-21, 2025",
    location: "Clay-Chalkville Middle School, Birmingham, AL",
    price: "$249",
    description: "A high-energy wrestling camp featuring top coaches and intensive training."
  },
  {
    id: 2,
    title: "National Champ Camp",
    date: "June 5-7, 2025",
    location: "Roy Martin Middle School, Las Vegas, NV", 
    price: "$349",
    description: "Train with NCAA champions and Olympic athletes in this intensive camp."
  }
];

export default function Events() {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Wrestling Events</h1>
          <p className="text-lg text-gray-600">
            Premium wrestling camps and clinics designed to elevate your skills.
          </p>
        </header>

        <div className="grid gap-6">
          {events.map((event) => (
            <div 
              key={event.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">{event.title}</h2>
                <span className="text-xl font-bold text-blue-600">{event.price}</span>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 mb-2">📅 {event.date}</p>
                <p className="text-gray-600 mb-2">📍 {event.location}</p>
                <p className="text-gray-700">{event.description}</p>
              </div>

              <button 
                onClick={() => setSelectedEvent(event.id)}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                View Details
              </button>
            </div>
          ))}
        </div>

        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Event Selected</h3>
              <p className="mb-4">Event ID: {selectedEvent}</p>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}