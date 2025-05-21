import express from "express";
import session from "express-session";
import path from "path";
import connectPg from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { pool } from "./db";
// Create Express application
const app = express();

// Configure session middleware
const pgSession = connectPg(session);
const sessionStore = new pgSession({
  pool,
  tableName: 'sessions', // Use the sessions table created by Drizzle
});

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "richhabits2025secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// Configure Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// The registration approval system is handled in routes.ts

// Start the server
async function startServer() {
  try {
    // Register all the routes
    const server = await registerRoutes(app);

    // Start listening on port
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();