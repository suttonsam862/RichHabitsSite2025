
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const wrestlingEvents = [
  {
    id: 1,
    title: "Birmingham Slam Camp",
    date: "June 19-21, 2025",
    location: "Clay-Chalkville Middle School, Birmingham, AL",
    price: "$249",
    description: "High-energy wrestling camp featuring top coaches and intensive skill development sessions.",
    features: ["3 days of training", "Elite coaching staff", "Technique workshops", "Live wrestling"]
  },
  {
    id: 2,
    title: "National Champ Camp",
    date: "June 5-7, 2025",
    location: "Roy Martin Middle School, Las Vegas, NV", 
    price: "$349",
    description: "Train with NCAA champions and Olympic athletes in this premium intensive camp.",
    features: ["Olympic-level training", "NCAA champion coaches", "Advanced techniques", "Competition prep"]
  },
  {
    id: 3,
    title: "Texas Recruiting Clinic",
    date: "July 12-14, 2025",
    location: "Austin Wrestling Academy, Austin, TX",
    price: "$199",
    description: "Perfect for high school wrestlers looking to get recruited by college programs.",
    features: ["College recruitment", "Scholarship guidance", "Film sessions", "Coach networking"]
  }
];

export default function Events() {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  const selectedEventData = selectedEvent 
    ? wrestlingEvents.find(event => event.id === selectedEvent)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Wrestling Events & Camps
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our premium wrestling camps and clinics designed to elevate your skills 
            and take your wrestling to the next level.
          </p>
        </header>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {wrestlingEvents.map((event) => (
            <div 
              key={event.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex-1">
                    {event.title}
                  </h2>
                  <span className="text-xl font-bold text-blue-600 ml-4">
                    {event.price}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-gray-600 flex items-center">
                    <span className="mr-2">📅</span>
                    {event.date}
                  </p>
                  <p className="text-gray-600 flex items-center">
                    <span className="mr-2">📍</span>
                    {event.location}
                  </p>
                </div>

                <p className="text-gray-700 mb-4 text-sm">
                  {event.description}
                </p>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedEvent(event.id)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                  <Link
                    to={`/events/${event.id}/register`}
                    className="flex-1 bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-900 transition-colors text-sm font-medium text-center"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-blue-600 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Take Your Wrestling to the Next Level?</h2>
          <p className="text-lg mb-6">Join hundreds of wrestlers who have improved their skills at Rich Habits camps.</p>
          <Link
            to="/contact"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>

      {/* Modal */}
      {selectedEvent && selectedEventData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{selectedEventData.title}</h3>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-900">Date & Location</p>
                <p className="text-gray-600">{selectedEventData.date}</p>
                <p className="text-gray-600">{selectedEventData.location}</p>
              </div>

              <div>
                <p className="font-medium text-gray-900">Price</p>
                <p className="text-2xl font-bold text-blue-600">{selectedEventData.price}</p>
              </div>

              <div>
                <p className="font-medium text-gray-900 mb-2">What's Included</p>
                <ul className="space-y-1">
                  {selectedEventData.features.map((feature, index) => (
                    <li key={index} className="text-gray-600 flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 space-y-2">
                <Link
                  to={`/events/${selectedEventData.id}/register`}
                  className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition-colors font-medium"
                >
                  Register Now
                </Link>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="block w-full bg-gray-200 text-gray-700 text-center py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
