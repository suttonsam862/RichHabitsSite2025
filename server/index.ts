import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { setupRoutes } from "./routes/index.js";
import { setupVite } from "./vite";
import { checkDatabaseConnection } from "./db";

// Create Express application
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get current directory in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "rich-habits-dev-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    },
  }),
);

// Global error handling
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

async function startServer() {
  try {
    console.log("🧠 Starting Rich Habits server...");

    // Critical fix: Setup static file serving with highest priority
    const publicPath = path.resolve(process.cwd(), "public");
    const attachedAssetsPath = path.resolve(process.cwd(), "attached_assets");

    // Bulletproof static file routes with comprehensive error handling
    app.get("/Cursive-Logo.webp", (req, res) => {
      const filePath = path.join(publicPath, 'Cursive-Logo.webp');
      res.sendFile(filePath, (err) => {
        if (err) {
          console.log('Logo file not found, serving fallback');
          res.status(404).send('Logo not found');
        }
      });
    });

    app.get("/images/*", (req, res) => {
      const filePath = path.join(publicPath, req.path);
      res.sendFile(filePath, (err) => {
        if (err) {
          console.log(`Image not found: ${req.path}`);
          res.status(404).send('Image not found');
        }
      });
    });

    app.get("/assets/*", (req, res) => {
      const filePath = path.join(publicPath, req.path);
      res.sendFile(filePath, (err) => {
        if (err) {
          console.log(`Asset not found: ${req.path}`);
          res.status(404).send('Asset not found');
        }
      });
    });

    // Generic image file handler
    app.get(/.*\.(jpg|jpeg|png|gif|svg|webp|ico|mp4|mov|webm)$/i, (req, res) => {
      const filePath = path.join(publicPath, req.path);
      res.sendFile(filePath, (err) => {
        if (err) {
          res.status(404).send('Image not found');
        }
      });
    });

    // Directory-specific routes
    app.use('/images', express.static(path.join(publicPath, 'images')));
    app.use('/assets', express.static(path.join(publicPath, 'assets')));
    app.use('/videos', express.static(path.join(publicPath, 'videos')));
    app.use('/designs', express.static(path.join(publicPath, 'designs')));
    app.use('/coaches', express.static(path.join(publicPath, 'coaches')));
    app.use('/events', express.static(path.join(publicPath, 'events')));

    // General static serving as fallback
    app.use(express.static(publicPath));
    app.use('/assets', express.static(attachedAssetsPath));

    console.log(`Static files configured from: ${publicPath}`);
    console.log(`Assets configured from: ${attachedAssetsPath}`);

    console.log("📡 Testing database connection...");
    try {
      const dbConnected = await checkDatabaseConnection();
      console.log(
        dbConnected ? "✅ Database connected" : "❌ Database connection failed",
      );
    } catch (err) {
      console.error("❌ Database connection failed, continuing with server startup:", err.message);
    }

    // Register app routes
    setupRoutes(app);

    // Import on-demand modules
    const { setupDirectPaymentRoutes } = await import(
      "./payment-verification-direct.js"
    );
    setupDirectPaymentRoutes(app);

    const { setupLegacyBridge } = await import("./legacy-bridge.js");
    setupLegacyBridge(app);

    // Catch-all for client routes (after all APIs)
    if (process.env.NODE_ENV === "production") {
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api/")) return next();
        const indexPath = path.resolve(process.cwd(), "dist/public/index.html");
        res.sendFile(indexPath, (err) => {
          if (err) {
            console.error("❌ Failed to serve index.html:", err);
            res.status(500).send("Internal Server Error");
          }
        });
      });
    }



    const PORT = parseInt(process.env.PORT || "5000", 10);
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `✅ Rich Habits server running on http://0.0.0.0:${PORT} (${process.env.NODE_ENV || "development"})`,
      );
    });

    // Emergency Birmingham Slam Camp page for ALL environments to match deployment
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      if (req.path.startsWith('/@')) return next(); // Vite internal paths
      if (req.path.startsWith('/src/')) return next(); // Source files
      if (req.path.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|mp4|mov|webm|js|css|ts|tsx)$/i)) return next();

      // Serve emergency Birmingham Slam Camp page (consistent with deployment)
      res.status(200).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Birmingham Slam Camp - Rich Habits Wrestling</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <script src="https://js.stripe.com/v3/"></script>
              <style>
                  .flame-gradient { background: linear-gradient(135deg, #ff4444, #ff6666, #ffaa44); }
                  .construction-banner { background: linear-gradient(90deg, #1f2937, #374151, #1f2937); animation: pulse 2s infinite; }
                  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
                  .heat-wave { animation: heatWave 3s ease-in-out infinite; }
                  @keyframes heatWave { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
              </style>
          </head>
          <body class="bg-gray-100">
              <!-- Construction Banner -->
              <div class="construction-banner text-white py-4">
                  <div class="max-w-6xl mx-auto px-4 text-center">
                      <h1 class="text-2xl md:text-3xl font-bold mb-2">🚧 SITE TEMPORARILY UNDER CONSTRUCTION 🚧</h1>
                      <p class="text-lg">Only Birmingham Slam Camp registration is currently available</p>
                  </div>
              </div>

              <!-- Main Content -->
              <div class="max-w-6xl mx-auto px-4 py-8">
                  <!-- Event Header -->
                  <div class="flame-gradient rounded-lg p-8 mb-8 text-white text-center">
                      <div class="heat-wave">
                          <h1 class="text-4xl md:text-6xl font-bold mb-4">BIRMINGHAM SLAM CAMP</h1>
                          <p class="text-xl md:text-2xl mb-2">June 19-21, 2025</p>
                          <p class="text-lg">Clay-Chalkville Middle School, Birmingham, AL</p>
                          <p class="text-2xl font-bold mt-4">$249.00</p>
                      </div>
                  </div>

                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <!-- Main Content -->
                      <div class="lg:col-span-2">
                          <!-- Elite Coaching Staff -->
                          <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
                              <h2 class="text-2xl font-bold mb-6 text-center">Elite Coaching Staff</h2>
                              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <!-- Zahid Valencia -->
                                  <div class="bg-gray-50 rounded-lg p-4">
                                      <h3 class="font-bold text-lg">Zahid Valencia</h3>
                                      <p class="text-red-600 text-sm mb-2">2025 Final X Champion • 2x NCAA Champion</p>
                                      <p class="text-gray-700 text-sm">2025 Final X Champion, 2x NCAA Champion, 3x Pac-12 Champion, and 3x All-American for Arizona State University. Known for his explosive offense and innovative techniques.</p>
                                  </div>

                                  <!-- Josh Shields -->
                                  <div class="bg-gray-50 rounded-lg p-4">
                                      <h3 class="font-bold text-lg">Josh Shields</h3>
                                      <p class="text-red-600 text-sm mb-2">NCAA All-American</p>
                                      <p class="text-gray-700 text-sm">2x All-American from Arizona State University and current professional wrestler. Technical approach and strategic mind.</p>
                                  </div>

                                  <!-- Brandon Courtney -->
                                  <div class="bg-gray-50 rounded-lg p-4">
                                      <h3 class="font-bold text-lg">Brandon Courtney</h3>
                                      <p class="text-red-600 text-sm mb-2">NCAA Finalist</p>
                                      <p class="text-gray-700 text-sm">NCAA Finalist and 2x All-American from Arizona State University. Specialist in lightweight technique and speed development.</p>
                                  </div>

                                  <!-- Michael McGee -->
                                  <div class="bg-gray-50 rounded-lg p-4">
                                      <h3 class="font-bold text-lg">Michael McGee</h3>
                                      <p class="text-red-600 text-sm mb-2">NCAA All-American</p>
                                      <p class="text-gray-700 text-sm">NCAA All-American from University of North Carolina and Arizona State University. Technique specialist and mental performance coach.</p>
                                  </div>
                              </div>
                          </div>

                          <!-- Camp Details -->
                          <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
                              <h2 class="text-2xl font-bold mb-6">About Birmingham Slam Camp</h2>
                              <p class="text-gray-700 mb-6">A high-energy wrestling camp featuring top coaches and intensive training sessions designed to elevate your wrestling skills and competitive edge.</p>
                              
                              <h3 class="text-lg font-semibold mb-4">What's Included</h3>
                              <ul class="space-y-2 mb-6">
                                  <li class="flex items-start">
                                      <span class="text-green-500 mr-2">✓</span>
                                      <span>NCAA champion instructors</span>
                                  </li>
                                  <li class="flex items-start">
                                      <span class="text-green-500 mr-2">✓</span>
                                      <span>Specialized technique sessions</span>
                                  </li>
                                  <li class="flex items-start">
                                      <span class="text-green-500 mr-2">✓</span>
                                      <span>Leadership workshops</span>
                                  </li>
                                  <li class="flex items-start">
                                      <span class="text-green-500 mr-2">✓</span>
                                      <span>Custom gear included</span>
                                  </li>
                              </ul>

                              <div class="bg-gray-50 rounded-lg p-4">
                                  <h4 class="font-semibold mb-2">Camp Schedule</h4>
                                  <p class="text-sm text-gray-600 mb-1"><strong>Daily:</strong> 9:00 AM - 4:00 PM</p>
                                  <p class="text-sm text-gray-600 mb-1"><strong>Ages:</strong> 10+ through high school</p>
                                  <p class="text-sm text-gray-600"><strong>Capacity:</strong> Limited to 200 wrestlers</p>
                              </div>
                          </div>
                      </div>

                      <!-- Registration Sidebar -->
                      <div class="space-y-6">
                          <!-- Individual Registration -->
                          <div class="bg-white rounded-lg shadow-lg p-6">
                              <h3 class="text-xl font-bold mb-4">Individual Registration</h3>
                              <div class="mb-4">
                                  <p class="text-2xl font-bold text-red-600">$249.00</p>
                                  <p class="text-sm text-gray-600">Full 3-day camp experience</p>
                              </div>
                              
                              <form id="registrationForm" class="space-y-4">
                                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                          <label class="block text-sm font-medium text-gray-700 mb-1">Participant First Name</label>
                                          <input type="text" id="firstName" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                                      </div>
                                      <div>
                                          <label class="block text-sm font-medium text-gray-700 mb-1">Participant Last Name</label>
                                          <input type="text" id="lastName" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                                      </div>
                                  </div>
                                  <div>
                                      <label class="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                                      <input type="text" id="schoolName" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                                  </div>
                                  <div>
                                      <label class="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                      <input type="number" id="age" required min="10" max="18" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                                  </div>
                                  
                                  <div class="border-t border-gray-200 pt-4">
                                      <h4 class="font-semibold text-gray-800 mb-3">Contact Information</h4>
                                      <div class="space-y-4">
                                          <div>
                                              <label class="block text-sm font-medium text-gray-700 mb-1">Contact Name (Parent/Guardian)</label>
                                              <input type="text" id="contactName" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                                          </div>
                                          <div>
                                              <label class="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                                              <input type="email" id="email" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                                          </div>
                                          <div>
                                              <label class="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                                              <input type="tel" id="phone" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                                          </div>
                                      </div>
                                  </div>

                                  <!-- Medical Waiver Section -->
                                  <div class="border-t border-gray-200 pt-4">
                                      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                          <h4 class="font-semibold text-yellow-800 mb-2">Medical Waiver & Release</h4>
                                          <div class="text-sm text-yellow-700 max-h-32 overflow-y-auto space-y-2">
                                              <p><strong>ASSUMPTION OF RISK AND RELEASE OF LIABILITY:</strong></p>
                                              <p>I acknowledge that participation in wrestling activities involves inherent risks including but not limited to: physical injury, bruising, cuts, sprains, fractures, concussions, and other serious injuries that may result in permanent disability or death.</p>
                                              <p>I voluntarily assume all risks associated with participation in Birmingham Slam Camp wrestling activities.</p>
                                              <p><strong>RELEASE:</strong> I hereby release, waive, discharge and covenant not to sue Rich Habits Wrestling, its officers, agents, coaches, and employees from any and all liability, claims, demands, actions and causes of action whatsoever arising out of or related to any loss, damage, or injury that may be sustained by the participant.</p>
                                              <p><strong>MEDICAL CONSENT:</strong> I authorize Rich Habits Wrestling staff to secure emergency medical treatment for the participant if needed.</p>
                                              <p><strong>MEDIA RELEASE:</strong> I consent to the use of the participant's name, voice, and likeness in photographs, videos, and other media for promotional purposes.</p>
                                          </div>
                                      </div>
                                      
                                      <div class="flex items-start space-x-3">
                                          <input type="checkbox" id="waiverAccepted" required class="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded">
                                          <label for="waiverAccepted" class="text-sm text-gray-700">
                                              I have read, understood, and agree to the Medical Waiver & Release terms above. I acknowledge that I am the parent/legal guardian of the participant and have the authority to sign this waiver on their behalf.
                                          </label>
                                      </div>
                                  </div>
                                  
                                  <button type="submit" id="registerBtn" class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-md transition-colors">
                                      Register Now - $249.00
                                  </button>
                              </form>
                          </div>

                          <!-- Team Registration -->
                          <div class="bg-gray-900 text-white rounded-lg p-6">
                              <h3 class="text-lg font-semibold mb-4">Team Registration</h3>
                              <p class="text-sm text-gray-300 mb-4">
                                  Bringing multiple athletes? Contact us for team pricing and coordination.
                              </p>
                              <a href="mailto:admin@rich-habits.com" class="block w-full bg-white text-gray-900 text-center py-2 px-4 rounded-md font-medium hover:bg-gray-100 transition-colors">
                                  Contact for Team Pricing
                              </a>
                          </div>

                          <!-- Contact Info -->
                          <div class="bg-gray-50 rounded-lg p-6">
                              <h3 class="text-lg font-semibold mb-4">Questions?</h3>
                              <div class="space-y-2 text-sm">
                                  <p><strong>Email:</strong> admin@rich-habits.com</p>
                                  <p><strong>Location:</strong> Clay-Chalkville Middle School</p>
                                  <p><strong>Address:</strong> Birmingham, AL</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Footer -->
              <footer class="bg-gray-900 text-white py-8 mt-12">
                  <div class="max-w-6xl mx-auto px-4 text-center">
                      <h3 class="text-xl font-bold mb-2">Rich Habits Wrestling</h3>
                      <p class="text-gray-400">Elite Wrestling Training & Development</p>
                      <p class="text-sm text-gray-500 mt-4">Site temporarily under construction - Birmingham Slam Camp registration only</p>
                  </div>
              </footer>

              <script>
                  const stripe = Stripe('pk_live_51QBqL1P9RcnGBvKRqrLOWp4VlhPdNcNZGkHAEJIJWBJTBkmSL0h1aMzLKZYOevv1WL18TBFJv7ZK0rNvzTXPQrU800U7fzOF5g');
                  
                  document.getElementById('registrationForm').addEventListener('submit', async (e) => {
                      e.preventDefault();
                      
                      const registerBtn = document.getElementById('registerBtn');
                      registerBtn.disabled = true;
                      registerBtn.textContent = 'Processing...';
                      
                      const formData = {
                          eventId: 1,
                          firstName: document.getElementById('firstName').value,
                          lastName: document.getElementById('lastName').value,
                          schoolName: document.getElementById('schoolName').value,
                          age: document.getElementById('age').value,
                          contactName: document.getElementById('contactName').value,
                          email: document.getElementById('email').value,
                          phone: document.getElementById('phone').value,
                          waiverAccepted: document.getElementById('waiverAccepted').checked,
                          registrationType: 'individual'
                      };
                      
                      // Validate waiver acceptance
                      if (!formData.waiverAccepted) {
                          alert('Please accept the Medical Waiver & Release to continue.');
                          registerBtn.disabled = false;
                          registerBtn.textContent = 'Register Now - $249.00';
                          return;
                      }
                      
                      try {
                          // Create payment intent
                          const response = await fetch('/api/events/1/create-payment-intent', {
                              method: 'POST',
                              headers: {
                                  'Content-Type': 'application/json',
                              },
                              body: JSON.stringify(formData)
                          });
                          
                          if (!response.ok) {
                              const errorData = await response.json();
                              throw new Error(errorData.message || 'Registration failed');
                          }
                          
                          const { sessionId, checkoutUrl } = await response.json();
                          
                          // Redirect to Stripe Checkout
                          if (checkoutUrl) {
                              window.location.href = checkoutUrl;
                          } else {
                              // Fallback using Stripe.js redirectToCheckout
                              const { error } = await stripe.redirectToCheckout({
                                  sessionId: sessionId
                              });
                              
                              if (error) {
                                  console.error('Checkout redirect error:', error);
                                  alert('Payment redirect failed: ' + error.message);
                              }
                          }
                          
                      } catch (error) {
                          console.error('Registration error:', error);
                          alert('Registration failed: ' + error.message + '. Please contact us at admin@rich-habits.com');
                      } finally {
                          registerBtn.disabled = false;
                          registerBtn.textContent = 'Register Now - $249.00';
                      }
                  });
              </script>
          </body>
          </html>
        `);
      });

    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} already in use`);
      } else {
        console.error("❌ Server error:", err);
      }
    });
  } catch (err) {
    console.error("❌ Fatal error during startup:", err);
    process.exit(1);
  }
}

// Start it
startServer();