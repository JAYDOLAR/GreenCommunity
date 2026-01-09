// Utility to ensure models are registered across database connections
import { getConnection } from '../config/databases.js';

// Cache for imported schemas to avoid reimporting
const schemaCache = new Map();

/**
 * Ensures that a model is registered in the specified database connection
 * @param {string|Connection} connectionNameOrConnection - Database connection name (e.g., 'COMMUNITY_DB') or connection object
 * @param {string} modelName - Model name (e.g., 'User', 'Challenge')
 * @param {string} dbNameOrModelPath - Database name (e.g., 'AUTH_DB') or model path for backward compatibility
 */
export const ensureModelRegistered = async (connectionNameOrConnection, modelName, dbNameOrModelPath) => {
  let connection;
  let modelPath;
  
  // Handle both connection object and connection name
  if (typeof connectionNameOrConnection === 'string') {
    connection = await getConnection(connectionNameOrConnection);
    modelPath = dbNameOrModelPath; // Old usage with model path
  } else {
    connection = connectionNameOrConnection; // New usage with connection object
    // Map database names to model paths
    const dbToModelPath = {
      'AUTH_DB': '../models/User.model.js',
      'COMMUNITY_DB': '../models/Challenge.model.js',
      'MARKETPLACE_DB': '../models/Product.model.js'
    };
    modelPath = dbToModelPath[dbNameOrModelPath] || `../models/${modelName}.model.js`;
  }
  
  if (!connection.models[modelName]) {
    let schema;
    
    // Check cache first
    const cacheKey = `${modelName}-${modelPath}`;
    if (schemaCache.has(cacheKey)) {
      schema = schemaCache.get(cacheKey);
    } else {
      // Import and cache the schema
      const modelModule = await import(modelPath);
      schema = modelModule.default.schema;
      schemaCache.set(cacheKey, schema);
    }
    
    connection.model(modelName, schema);
    console.log(`✅ Model '${modelName}' registered in connection`);
  }
  
  return connection.models[modelName];
};

/**
 * Helper function to register commonly needed models in community database
 */
export const registerCommunityModels = async () => {
  const connection = await getConnection('COMMUNITY_DB');
  
  const modelsToRegister = [
    { name: 'User', path: '../models/User.model.js' },
    { name: 'Challenge', path: '../models/Challenge.model.js' }
  ];
  
  for (const model of modelsToRegister) {
    await ensureModelRegistered('COMMUNITY_DB', model.name, model.path);
  }
  
  return connection;
};

/**
 * Helper function to register commonly needed models in marketplace database
 */
export const registerMarketplaceModels = async () => {
  const connection = await getConnection('MARKETPLACE_DB');
  
  const modelsToRegister = [
    { name: 'User', path: '../models/User.model.js' },
    { name: 'Product', path: '../models/Product.model.js' },
    { name: 'Category', path: '../models/Category.model.js' },
    { name: 'Order', path: '../models/Order.model.js' }
  ];
  
  for (const model of modelsToRegister) {
    await ensureModelRegistered('MARKETPLACE_DB', model.name, model.path);
  }
  
  return connection;
};

export default {
  ensureModelRegistered,
  registerCommunityModels,
  registerMarketplaceModels
};
