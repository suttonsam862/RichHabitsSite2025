import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema.js";

// Configure WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

// Check environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

// Create database pool
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create drizzle instance
export const db = drizzle({ client: pool, schema });

// Function to check if database is available
export const checkDatabaseConnection = async () => {
  try {
    // Test query
    const result = await pool.query('SELECT NOW()');
    
    // Log success
    console.log('Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};

// Connection health check for monitoring
export const getDatabaseHealthStatus = async () => {
  try {
    // Check direct database connection
    const dbConnected = await checkDatabaseConnection();
    
    return {
      status: dbConnected ? 'healthy' : 'unhealthy',
      dbConnection: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Health check error:', error);
    return {
      status: 'unhealthy',
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
};