// Rich Habits Wrestling Events - Production Server
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🏆 Starting Rich Habits Wrestling Events server...');

// Serve static assets (videos, logos, images) with proper headers for Rich Habits wrestling content
console.log('Setting up static file serving for Rich Habits wrestling content...');

// Primary static serving from public folder
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    console.log('Serving file:', filePath);
    // Set proper MIME types and cache headers for wrestling event media
    if (filePath.endsWith('.webm')) {
      res.setHeader('Content-Type', 'video/webm');
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
    if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
    if (filePath.endsWith('.jpg') || filePath.endsWith('.JPG')) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
    // CORS headers for Rich Habits media
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  }
}));

// Specific routing for videos folder
app.use('/videos', express.static(path.join(__dirname, 'public/videos')));

// Specific routing for images folder  
app.use('/images', express.static(path.join(__dirname, 'public/images')));

console.log('Rich Habits static file serving configured successfully!');

// Try to serve built client files
const clientDistPath = path.join(__dirname, 'dist', 'client');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  console.log(`✅ Serving built client from: ${clientDistPath}`);
} else {
  console.log('⚠️  Built client not found, serving from source...');
}

// API middleware
app.use('/api', express.json());

// Rich Habits Wrestling Events API data
const events = [
  {
    id: 1,
    title: "Slam Camp",
    signature: "Elite Wrestling Training Intensive",
    description: "Transform your wrestling with championship-level coaching",
    longDescription: "Join elite wrestlers and coaches for an intensive training experience designed to elevate your skills to championship level.",
    image: "/videos/events-hero.webm",
    videoUrl: "/videos/slamcamp.webm",
    date: "July 15-17, 2024",
    location: "Elite Training Center, Austin, TX",
    price: "$299",
    capacity: 50,
    ageGroup: "High School & College",
    coaches: [],
    benefits: ["3 days of intensive training", "Championship-level coaching", "Video analysis sessions", "Mental preparation workshops"],
    additionalImages: []
  },
  {
    id: 2,
    title: "National Champ Camp",
    signature: "Championship Training Excellence", 
    description: "Train with national champions and elite coaches",
    longDescription: "Experience championship-level training with proven winners.",
    image: "/videos/events-hero.webm",
    date: "August 5-7, 2024",
    location: "Championship Center, Dallas, TX",
    price: "$349",
    capacity: 40,
    ageGroup: "High School & College", 
    coaches: [],
    benefits: ["Train with national champions", "Advanced technique sessions", "Competition preparation", "Elite coaching staff"],
    additionalImages: []
  },
  {
    id: 3,
    title: "Texas Recruiting Clinic",
    signature: "High School Wrestling Recruiting Event",
    description: "Get recruited by top D1 programs", 
    longDescription: "Premier recruiting event featuring D1 coaches from top programs.",
    image: "/videos/events-hero.webm",
    date: "September 12-13, 2024",
    location: "University Center, Houston, TX",
    price: "$199",
    singleDayPrice: 125,
    capacity: 75,
    ageGroup: "High School",
    coaches: [],
    benefits: ["D1 coach evaluations", "Recruiting guidance", "University exposure", "Scholarship opportunities"],
    additionalImages: []
  },
  {
    id: 4,
    title: "Panther Train Tour",
    signature: "Elite Wrestling Tour Experience",
    description: "Join the exclusive wrestling tour",
    longDescription: "Experience elite wrestling training across multiple venues.",
    image: "/videos/events-hero.webm",
    videoUrl: "/videos/panther-train-tour.webm",
    date: "October 1-15, 2024",
    location: "Multi-City Tour", 
    price: "$599",
    capacity: 30,
    ageGroup: "High School & College",
    coaches: [],
    benefits: ["Multi-city training tour", "Elite venue access", "Exclusive coaching staff", "Championship preparation"],
    additionalImages: []
  }
];

// Events API endpoints
app.get('/api/events', (req, res) => {
  res.json(events);
});

app.get('/api/events/:id', (req, res) => {
  const event = events.find(e => e.id === parseInt(req.params.id));
  if (event) {
    res.json(event);
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Rich Habits Wrestling Events' });
});

// Handle React Router - serve index.html for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback HTML with Rich Habits branding
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rich Habits Wrestling Events</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 40px 20px; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          h1 { color: #dc2626; font-size: 2.5rem; margin-bottom: 10px; }
          .subtitle { color: #666; font-size: 1.2rem; margin-bottom: 30px; }
          .events { display: grid; gap: 20px; margin-top: 30px; }
          .event { padding: 20px; border: 1px solid #e5e5e5; border-radius: 6px; }
          .event h3 { color: #dc2626; margin: 0 0 10px 0; }
          .loading { text-align: center; color: #666; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Rich Habits</h1>
          <p class="subtitle">Elite Wrestling Events & Training</p>
          <div class="loading">Loading wrestling events...</div>
          <div class="events">
            <div class="event">
              <h3>Slam Camp</h3>
              <p>Elite Wrestling Training Intensive</p>
            </div>
            <div class="event">
              <h3>National Champ Camp</h3>
              <p>Championship Training Excellence</p>
            </div>
            <div class="event">
              <h3>Texas Recruiting Clinic</h3>
              <p>High School Wrestling Recruiting Event</p>
            </div>
            <div class="event">
              <h3>Panther Train Tour</h3>
              <p>Elite Wrestling Tour Experience</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏆 Rich Habits Wrestling Events server running on port ${PORT}`);
  console.log(`🌐 Serving elite wrestling events and training content`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
});