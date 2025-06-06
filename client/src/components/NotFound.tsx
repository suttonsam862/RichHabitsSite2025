import { motion } from 'framer-motion';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-8xl font-bold text-gray-300 mb-4"
          >
            404
          </motion.div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors font-medium"
          >
            Back to Home
          </Link>
          
          <div className="text-sm text-gray-500">
            <Link href="/events" className="text-primary hover:underline">
              View Events
            </Link>
            {' · '}
            <Link href="/contact" className="text-primary hover:underline">
              Contact Us
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}