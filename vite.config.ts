import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@assets": path.resolve(__dirname, "./attached_assets"),
    },
  },
  build: {
    outDir: "dist/public",
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-button"],
          icons: ["lucide-react"]
        }
      },
      external: (id) => {
        // Exclude heavy dependencies from server build
        return id.includes('node_modules') && (
          id.includes('framer-motion') ||
          id.includes('@tanstack/react-query')
        );
      }
    },
    target: "es2020"
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
  },
  optimizeDeps: {
    include: ["react", "react-dom", "wouter"],
    exclude: ["lucide-react"]
  }
});