import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Debug: Log environment variable loading
console.log('🔍 Debug: MONGO_URI loaded?', !!process.env.MONGO_URI);
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in environment variables');
  console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('MONGO')));
} else {
  console.log('✅ MONGO_URI found in environment variables');
}

// Database configurations
const DB_CONFIG = {
  MAIN_DB: 'greencommunity-main',
  AUTH_DB: 'greencommunity-auth',
  USER_INFO_DB: 'greencommunity-user-info',
  MARKETPLACE_DB: 'greencommunity-marketplace',
  COMMUNITY_DB: 'greencommunity-community',
  ANALYTICS_DB: 'greencommunity-analytics',
  FOOTPRINT_DB: 'greencommunity-footprint',
  AI_DB: 'greencommunity-ai',
  PROJECTS_DB: 'greencommunity-projects'
};

// Store database connections
const connections = {};

/**
 * Get or create a connection to a specific database
 * @param {string} dbName - Database key (e.g., 'MAIN_DB') or full name (e.g., 'greencommunity-main')
 * @returns {mongoose.Connection} Database connection
 */
export const getConnection = async (dbName) => {
  // Check if dbName is a key in DB_CONFIG (like 'MAIN_DB')
  let dbFullName = DB_CONFIG[dbName];
  
  // If not found as a key, check if dbName itself is a valid database name (value in DB_CONFIG)
  if (!dbFullName) {
    const validDbNames = Object.values(DB_CONFIG);
    if (validDbNames.includes(dbName)) {
      dbFullName = dbName;
    } else {
      throw new Error(`Database configuration not found for: ${dbName}`);
    }
  }

  if (connections[dbFullName]) {
    return connections[dbFullName];
  }

  try {
    const connection = await mongoose.createConnection(process.env.MONGO_URI, {
      dbName: dbFullName,
      maxPoolSize: 5,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 — avoids DNS SRV resolution issues on macOS
      retryWrites: true,
      retryReads: true,
    });

    connections[dbFullName] = connection;
    console.log(`✅ MongoDB connected to ${dbFullName}`);

    // Handle connection events
    connection.on('error', (error) => {
      console.error(`❌ MongoDB error in ${dbFullName}:`, error);
    });

    connection.on('disconnected', () => {
      console.log(`🔌 MongoDB disconnected from ${dbFullName}`);
      delete connections[dbFullName];
    });

    connection.on('reconnected', () => {
      console.log(`🔄 MongoDB reconnected to ${dbFullName}`);
    });

    return connection;
  } catch (error) {
    console.error(`❌ MongoDB connection error for ${dbFullName}:`, error.message);
    throw error;
  }
};

/**
 * Connect to all required databases
 */
export const connectAllDatabases = async () => {
  try {
    // First, connect mongoose default connection to auth database
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: DB_CONFIG.AUTH_DB,
      maxPoolSize: 5,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 — avoids DNS SRV resolution issues on macOS
      retryWrites: true,
      retryReads: true,
    });
    console.log(`✅ Default connection established to ${DB_CONFIG.AUTH_DB}`);

    // Connect to main database (for site config, newsletter, etc.)
    await getConnection('MAIN_DB');

    // Connect to auth database
    await getConnection('AUTH_DB');

    // Connect to user info database
    await getConnection('USER_INFO_DB');

    // Connect to marketplace database
    await getConnection('MARKETPLACE_DB');

    // Connect to community database  
    await getConnection('COMMUNITY_DB');

    // Connect to footprint database
    await getConnection('FOOTPRINT_DB');

    // Connect to analytics database
    await getConnection('ANALYTICS_DB');

    // Connect to AI database
    await getConnection('AI_DB');

    console.log('🎉 All databases connected successfully');
  } catch (error) {
    console.error('❌ Failed to connect to databases:', error);
    process.exit(1);
  }
};

/**
 * Close all database connections
 */
export const closeAllConnections = async () => {
  try {
    const closePromises = Object.values(connections).map(conn => conn.close());
    await Promise.all(closePromises);
    console.log('🔒 All database connections closed');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
};

// Export database names for easy reference
export const DB_NAMES = DB_CONFIG;

export default {
  getConnection,
  connectAllDatabases,
  closeAllConnections,
  DB_NAMES
};
