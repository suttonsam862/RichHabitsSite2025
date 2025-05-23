import { X } from "lucide-react";
import { useState } from "react";

export default function MaintenanceBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 text-center">
          <p className="text-sm text-gray-700 subtitle-font">
            🔧 Please excuse any photo and video issues while we perform site maintenance. Thank you for your patience.
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Dismiss banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}