
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-gray-900 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-4">
          <Link 
            to="/" 
            className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go Home
          </Link>
          
          <div className="flex gap-4 justify-center">
            <Link 
              to="/events" 
              className="text-blue-600 hover:text-blue-700 underline"
            >
              View Events
            </Link>
            <Link 
              to="/shop" 
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Shop
            </Link>
            <Link 
              to="/contact" 
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
