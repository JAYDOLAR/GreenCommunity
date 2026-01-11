// Marketplace Configuration
// This file contains marketplace-related constants and configurations
// TODO: Move category mappings and data to be fetched from backend APIs

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

// Currency conversion rate (should be fetched from API)
export const USD_TO_INR = 83;

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

// Helper function to calculate CO2 savings
export const calculateCO2Savings = (carbonFootprint) => {
    if (carbonFootprint) {
        return Math.max(0, 5 - carbonFootprint);
    }
    // Fallback random value for demo - should be removed in production
    return Math.random() * 5;
};
