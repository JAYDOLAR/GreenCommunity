// Marketplace Configuration
// This file contains marketplace-related constants and configurations

import { siteConfigAPI } from '@/lib/api';

// Category mapping from backend to client format
export const CATEGORY_MAPPING = {
    'solar': 'tech',
    'reusable': 'personal-care',
    'zero_waste': 'home-garden',
    'local': 'food-drink',
    'organic': 'food-drink',
    'eco_fashion': 'clothing',
    'green_tech': 'tech'
};

// Reverse mapping for filtering
export const CLIENT_TO_BACKEND_CATEGORIES = {
    'personal-care': ['reusable'],
    'home-garden': ['zero_waste'],
    'clothing': ['eco_fashion'],
    'food-drink': ['local', 'organic'],
    'tech': ['solar', 'green_tech'],
    'travel': [] // This category doesn't exist in backend yet
};

// Marketplace categories for UI
export const MARKETPLACE_CATEGORIES = [
    { value: 'all', label: 'All Products' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'technology', label: 'Technology' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'books', label: 'Books & Media' },
];

// Default currency conversion rate (fallback if API fails)
export const USD_TO_INR = 83;

// Currency rates cache
let currencyRatesCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get dynamic currency rate
export const getCurrencyRate = async (currency = 'INR') => {
    const now = Date.now();
    
    // Return cached data if still valid
    if (currencyRatesCache && (now - lastFetchTime) < CACHE_DURATION) {
        const rate = currencyRatesCache.find(r => r.currency === currency.toUpperCase());
        return rate?.rate || USD_TO_INR;
    }
    
    try {
        const result = await siteConfigAPI.getCurrencyRates();
        if (result.success && result.data) {
            currencyRatesCache = result.data;
            lastFetchTime = now;
            const rate = result.data.find(r => r.currency === currency.toUpperCase());
            return rate?.rate || USD_TO_INR;
        }
    } catch (error) {
        console.error('Failed to fetch currency rates:', error);
    }
    
    return USD_TO_INR; // Fallback
};

// Convert currency
export const convertCurrency = async (amount, from = 'USD', to = 'INR') => {
    try {
        const result = await siteConfigAPI.convertCurrency(amount, from, to);
        if (result.success && result.data) {
            return result.data.converted.amount;
        }
    } catch (error) {
        console.error('Failed to convert currency:', error);
    }
    
    // Fallback calculation
    if (to === 'INR') {
        return amount * USD_TO_INR;
    }
    return amount;
};

// Default product image
export const DEFAULT_PRODUCT_IMAGE = '/tree1.jpg';

// Vendor types
export const VENDOR_TYPES = {
    LOCAL: 'Local',
    CERTIFIED: 'Certified',
    NONPROFIT: 'Nonprofit'
};

// Helper function to determine vendor type based on certifications
export const getVendorType = (certifications = []) => {
    if (certifications.length > 2) {
        return VENDOR_TYPES.CERTIFIED;
    } else if (certifications.includes('B Corp')) {
        return VENDOR_TYPES.NONPROFIT;
    }
    return VENDOR_TYPES.LOCAL;
};

// Helper function to calculate CO2 savings based on product attributes
// Uses a formula based on product's carbon footprint and eco-score
export const calculateCO2Savings = (product) => {
    // If product has explicit carbonFootprint value
    if (product && typeof product === 'object') {
        const carbonFootprint = product.carbonFootprint || product.carbon_footprint;
        const ecoScore = product.ecoScore || product.eco_score || 50;
        
        if (carbonFootprint !== undefined) {
            // CO2 savings = baseline (5kg) minus actual footprint
            return Math.max(0, 5 - carbonFootprint);
        }
        
        // Calculate based on eco-score (0-100 scale)
        // Higher eco-score = more savings
        return (ecoScore / 100) * 5; // Max 5kg savings
    }
    
    // If just a number is passed (legacy carbon footprint value)
    if (typeof product === 'number') {
        return Math.max(0, 5 - product);
    }
    
    // Default: return 0 for unknown products
    return 0;
};
