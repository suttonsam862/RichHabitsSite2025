import { motion } from "framer-motion";

export function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full mx-auto mb-4"
        />
        <p className="text-gray-600 text-sm">Loading...</p>
      </motion.div>
    </div>
  );
}

export function PageLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full mx-auto mb-3"
        />
        <p className="text-gray-600 text-sm">Loading page...</p>
      </motion.div>
    </div>
  );
}

export function ComponentLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full"
      />
    </div>
  );
}