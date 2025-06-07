
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link href="/" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded">
        Return to Home
      </Link>
    </div>
  );
}