import React from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-red-600 mb-4">404</h2>
        <p className="text-xl text-gray-600">Page Not Found</p>
      </div>
    </div>
  );
}