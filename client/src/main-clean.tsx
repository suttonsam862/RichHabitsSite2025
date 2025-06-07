import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Simple React component to test basic functionality
function App() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Rich Habits Wrestling
        </h1>
        <p className="text-gray-600 mb-8">
          Elite Wrestling Event Management Platform
        </p>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900">Events</h2>
            <p className="text-blue-700">Manage wrestling events and registrations</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-green-900">Shop</h2>
            <p className="text-green-700">Browse wrestling gear and apparel</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-purple-900">Admin</h2>
            <p className="text-purple-700">Event management dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);
root.render(<App />);