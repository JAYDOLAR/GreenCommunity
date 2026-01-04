// API Configuration
// This file contains API endpoints and configuration
// TODO: Make this configurable via environment variables

// Base API URL - should be set via environment variable
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// API Endpoints
export const API_ENDPOINTS = {
    // Authentication
    AUTH_LOGIN: '/api/auth/login',
    AUTH_REGISTER: '/api/auth/register',
    AUTH_LOGOUT: '/api/auth/logout',
    AUTH_ME: '/api/auth/me',
    AUTH_FORGOT_PASSWORD: '/api/auth/forgot-password',
    AUTH_RESET_PASSWORD: '/api/auth/reset-password',
    AUTH_VERIFY_EMAIL: '/api/auth/verify-email',

    // Footprint Log
    FOOTPRINT_LOG: '/api/footprintlog',
    FOOTPRINT_LOG_CALCULATE: '/api/footprintlog/calculate',
    FOOTPRINT_LOG_BREAKDOWN: '/api/footprintlog/breakdown',
    FOOTPRINT_LOG_RECENT: '/api/footprintlog/recent',

    // Marketplace
    MARKETPLACE_PRODUCTS: '/marketplace/products',
    MARKETPLACE_PRODUCT_BY_ID: (id) => `/marketplace/products/${id}`,
    MARKETPLACE_FEATURED: '/marketplace/featured',
    MARKETPLACE_CATEGORIES: '/marketplace/categories',
    MARKETPLACE_SEARCH: '/marketplace/search',
    MARKETPLACE_SUSTAINABLE: '/marketplace/sustainable',

    // Challenges
    CHALLENGES: '/api/challenges',
    CHALLENGES_JOIN: '/api/challenges/join',
    CHALLENGES_ME: '/api/challenges/me',

    // Chat/AI
    CHAT_SEND: '/api/chat/send',

    // User Profile
    USER_PROFILE: '/api/user/profile',
    USER_PREFERENCES: '/api/user/preferences',
    USER_AVATAR: '/api/user/avatar',

    // Admin
    ADMIN_USERS: '/api/admin/users',
    ADMIN_ANALYTICS: '/api/admin/analytics',
    ADMIN_REPORTS: '/api/admin/reports',
};

// HTTP Methods
export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE'
};

// Request timeout (in milliseconds)
export const REQUEST_TIMEOUT = 10000;

// Default headers
export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
    if (endpoint.startsWith('http')) {
        return endpoint;
    }
    return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
    if (typeof window === 'undefined') return {};

    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to build request config
export const buildRequestConfig = (method = 'GET', data = null, additionalHeaders = {}) => {
    const config = {
        method,
        headers: {
            ...DEFAULT_HEADERS,
            ...getAuthHeaders(),
            ...additionalHeaders
        },
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        config.body = JSON.stringify(data);
    }

    return config;
};
