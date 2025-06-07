// Vanilla JavaScript entry point to bypass React preamble issues
import './index.css'

// Create basic app structure
function createApp() {
  const root = document.getElementById('root')
  
  root.innerHTML = `
    <div class="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-yellow-500 mb-4">
          Rich Habits Wrestling
        </h1>
        <p class="text-xl mb-8">
          Premier wrestling event management platform
        </p>
        <div class="space-y-4">
          <div class="bg-gray-800 p-6 rounded-lg">
            <h2 class="text-2xl font-semibold mb-2">Events</h2>
            <p>Manage wrestling events and registrations</p>
          </div>
          <div class="bg-gray-800 p-6 rounded-lg">
            <h2 class="text-2xl font-semibold mb-2">Training</h2>
            <p>Track performance and progress</p>
          </div>
          <div class="bg-gray-800 p-6 rounded-lg">
            <h2 class="text-2xl font-semibold mb-2">Shop</h2>
            <p>Browse wrestling gear and merchandise</p>
          </div>
        </div>
      </div>
    </div>
  `
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createApp)
} else {
  createApp()
}