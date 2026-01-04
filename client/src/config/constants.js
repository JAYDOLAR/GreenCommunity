// Application Constants
// This file contains app-wide constants and configuration values

// App Information
export const APP_NAME = 'GreenCommunity';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Your carbon footprint tracking and eco-friendly marketplace';

// Currency Configuration
export const CURRENCY_SYMBOLS = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$'
};

export const DEFAULT_CURRENCY = 'USD';

// Unit Configuration
export const UNIT_LABELS = {
    metric: {
        distance: 'km',
        weight: 'kg',
        temperature: '°C',
        volume: 'L'
    },
    imperial: {
        distance: 'miles',
        weight: 'lbs',
        temperature: '°F',
        volume: 'gal'
    }
};

export const DEFAULT_UNITS = 'metric';

// Date and Time Configuration
export const DATE_FORMATS = {
    SHORT: 'MM/dd/yyyy',
    LONG: 'MMMM dd, yyyy',
    ISO: 'yyyy-MM-dd'
};

export const TIME_FORMATS = {
    TWELVE_HOUR: 'h:mm a',
    TWENTY_FOUR_HOUR: 'HH:mm'
};

// Pagination Configuration
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    AVAILABLE_PAGE_SIZES: [5, 10, 20, 50, 100]
};

// File Upload Configuration
export const FILE_UPLOAD = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain', 'application/msword']
};

// Theme Configuration
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
};

export const DEFAULT_THEME = THEMES.SYSTEM;

// Notification Configuration
export const NOTIFICATION_DURATION = {
    SUCCESS: 3000,
    ERROR: 5000,
    WARNING: 4000,
    INFO: 3000
};

// Social Media Links
export const SOCIAL_LINKS = {
    GITHUB: process.env.NEXT_PUBLIC_GITHUB_URL || '#',
    TWITTER: process.env.NEXT_PUBLIC_TWITTER_URL || '#',
    LINKEDIN: process.env.NEXT_PUBLIC_LINKEDIN_URL || '#',
    FACEBOOK: process.env.NEXT_PUBLIC_FACEBOOK_URL || '#'
};

// Support Configuration
export const SUPPORT = {
    EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@greencommunity.com',
    PHONE: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+1-555-0123',
    HOURS: '9:00 AM - 6:00 PM PST, Monday - Friday'
};

// Analytics Configuration
export const ANALYTICS = {
    GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GA_ID,
    MIXPANEL_TOKEN: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
    ENABLE_ANALYTICS: process.env.NODE_ENV === 'production'
};

// Feature Flags
export const FEATURES = {
    ENABLE_CHAT: process.env.NEXT_PUBLIC_ENABLE_CHAT !== 'false',
    ENABLE_MARKETPLACE: process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE !== 'false',
    ENABLE_CHALLENGES: process.env.NEXT_PUBLIC_ENABLE_CHALLENGES !== 'false',
    ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false',
    ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false'
};

// Local Storage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'token',
    USER_PREFERENCES: 'userPreferences',
    THEME: 'theme',
    LANGUAGE: 'language',
    SELECTED_LOCATION: 'selectedLocation',
    CART_ITEMS: 'cartItems',
    RECENT_SEARCHES: 'recentSearches'
};

// API Configuration
export const API_CONFIG = {
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 second
};

// Validation Rules
export const VALIDATION = {
    PASSWORD_MIN_LENGTH: 8,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 20,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/
};

// Error Messages
export const ERROR_MESSAGES = {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_FAILED: 'Please check your input and try again.',
    FILE_TOO_LARGE: `File size must be less than ${FILE_UPLOAD.MAX_FILE_SIZE / (1024 * 1024)}MB`,
    INVALID_FILE_TYPE: 'Invalid file type. Please select a supported file.'
};
