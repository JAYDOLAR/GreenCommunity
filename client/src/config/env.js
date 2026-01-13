// Environment Configuration
// This file handles environment variables and provides fallbacks

// API Configuration with fallback support
const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Check for fallback flag
  if (process.env.NEXT_PUBLIC_USE_AZURE_FALLBACK === 'true') {
    return 'https://green-community.azurewebsites.net';
  }
  
  // Default to custom domain
  return 'https://www.green-community.app';
};

const getClientUrl = () => {
  if (process.env.NEXT_PUBLIC_CLIENT_URL) {
    return process.env.NEXT_PUBLIC_CLIENT_URL;
  }
  
  // Check for fallback flag
  if (process.env.NEXT_PUBLIC_USE_AZURE_FALLBACK === 'true') {
    return 'https://green-community.azurewebsites.net';
  }
  
  // Default to custom domain
  return 'https://www.green-community.app';
};

export const API_URL = getApiUrl();
export const CLIENT_URL = getClientUrl();

// Database Configuration (for reference, actual DB config should be on backend)
export const DB_NAME = process.env.DB_NAME || 'greencommunity';

// Authentication Configuration
export const JWT_SECRET = process.env.JWT_SECRET; // This should only be used on backend
export const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT) || 24 * 60 * 60 * 1000; // 24 hours

// Third-party Services
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Email Service Configuration
export const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;

// Analytics Configuration
export const GOOGLE_ANALYTICS_ID = process.env.NEXT_PUBLIC_GA_ID;
export const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

// Feature Flags from Environment
export const FEATURE_FLAGS = {
    ENABLE_2FA: process.env.NEXT_PUBLIC_ENABLE_2FA === 'true',
    ENABLE_EMAIL_VERIFICATION: process.env.NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION !== 'false',
    ENABLE_SOCIAL_LOGIN: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN === 'true',
    ENABLE_CHAT: process.env.NEXT_PUBLIC_ENABLE_CHAT !== 'false',
    ENABLE_MARKETPLACE: process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE !== 'false',
    ENABLE_PWA: process.env.NEXT_PUBLIC_ENABLE_PWA === 'true',
    ENABLE_OFFLINE_MODE: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === 'true'
};

// Development/Testing Configuration
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_TEST = NODE_ENV === 'test';

// Logging Configuration
export const LOG_LEVEL = process.env.LOG_LEVEL || (IS_DEVELOPMENT ? 'debug' : 'error');
export const ENABLE_CONSOLE_LOGS = process.env.ENABLE_CONSOLE_LOGS !== 'false' && IS_DEVELOPMENT;

// Rate Limiting Configuration
export const RATE_LIMIT = {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
};

// CORS Configuration
export const CORS_ORIGIN = process.env.CORS_ORIGIN || CLIENT_URL;

// Security Configuration
export const SECURITY = {
    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
    COOKIE_SECRET: process.env.COOKIE_SECRET || 'fallback-cookie-secret',
    CSRF_SECRET: process.env.CSRF_SECRET || 'fallback-csrf-secret'
};

// File Storage Configuration
export const STORAGE = {
    UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || ['jpg', 'jpeg', 'png', 'gif', 'pdf']
};

// External APIs Configuration
export const EXTERNAL_APIS = {
    EMISSION_CALCULATOR_API: process.env.EMISSION_CALCULATOR_API_URL,
    WEATHER_API_KEY: process.env.WEATHER_API_KEY,
    MAPS_API_KEY: process.env.NEXT_PUBLIC_MAPS_API_KEY,
    STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY
};

// Monitoring and Error Tracking
export const MONITORING = {
    SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    ENABLE_ERROR_TRACKING: process.env.ENABLE_ERROR_TRACKING === 'true'
};

// Helper functions
export const getEnvVar = (key, fallback = null) => {
    const value = process.env[key];
    if (value === undefined || value === null || value === '') {
        return fallback;
    }
    return value;
};

export const getEnvVarAsNumber = (key, fallback = 0) => {
    const value = getEnvVar(key);
    const number = parseInt(value, 10);
    return isNaN(number) ? fallback : number;
};

export const getEnvVarAsBoolean = (key, fallback = false) => {
    const value = getEnvVar(key);
    if (value === 'true') return true;
    if (value === 'false') return false;
    return fallback;
};

export const validateRequiredEnvVars = () => {
    const required = [];

    if (IS_PRODUCTION) {
        // Add required environment variables for production
        const productionRequired = [
            'NEXT_PUBLIC_API_URL',
            'JWT_SECRET',
            'EMAIL_USER',
            'EMAIL_PASS'
        ];
        required.push(...productionRequired);
    }

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('Missing required environment variables:', missing);
        if (IS_PRODUCTION) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
    }
};

// Validate environment variables on import
if (typeof window === 'undefined') {
    // Only validate on server side
    validateRequiredEnvVars();
}
