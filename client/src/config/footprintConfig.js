// Footprint Log Configuration
// This file contains all the activity types, categories, and emission factors
// TODO: Move this data to be fetched from backend APIs

import { Car, Plane, Home, Utensils, Trash2, RefreshCw } from 'lucide-react';

export const ACTIVITY_TYPES = [
    // Transportation
    {
        value: 'transport-car',
        label: 'Car Travel',
        icon: Car,
        unit: 'miles',
        factor: 0.4,
        category: 'Transportation',
        requiresFuelType: true,
        requiresPassengers: true
    },
    {
        value: 'transport-bus',
        label: 'Bus Travel',
        icon: Car,
        unit: 'miles',
        factor: 0.15,
        category: 'Transportation',
        requiresPassengers: true
    },
    {
        value: 'transport-train',
        label: 'Train Travel',
        icon: Car,
        unit: 'miles',
        factor: 0.12,
        category: 'Transportation',
        requiresPassengers: true
    },
    {
        value: 'transport-subway',
        label: 'Subway/Metro',
        icon: Car,
        unit: 'miles',
        factor: 0.08,
        category: 'Transportation'
    },
    {
        value: 'transport-taxi',
        label: 'Taxi/Rideshare',
        icon: Car,
        unit: 'miles',
        factor: 0.45,
        category: 'Transportation',
        requiresFuelType: true,
        requiresPassengers: true
    },
    {
        value: 'transport-motorcycle',
        label: 'Motorcycle',
        icon: Car,
        unit: 'miles',
        factor: 0.25,
        category: 'Transportation',
        requiresFuelType: true
    },
    {
        value: 'transport-flight',
        label: 'Flight',
        icon: Plane,
        unit: 'miles',
        factor: 0.2,
        category: 'Transportation',
        requiresFlightClass: true,
        requiresPassengers: true
    },
    {
        value: 'transport-ferry',
        label: 'Ferry',
        icon: Plane,
        unit: 'miles',
        factor: 0.35,
        category: 'Transportation',
        requiresPassengers: true
    },
    {
        value: 'transport-bicycle',
        label: 'Bicycle',
        icon: Car,
        unit: 'miles',
        factor: 0,
        category: 'Transportation'
    },
    {
        value: 'transport-walking',
        label: 'Walking',
        icon: Car,
        unit: 'miles',
        factor: 0,
        category: 'Transportation'
    },

    // Energy & Utilities
    {
        value: 'energy-electricity',
        label: 'Electricity Usage',
        icon: Home,
        unit: 'kWh',
        factor: 0.5,
        category: 'Energy',
        requiresEnergySource: true
    },
    {
        value: 'energy-gas',
        label: 'Natural Gas',
        icon: Home,
        unit: 'therms',
        factor: 5.3,
        category: 'Energy'
    },
    {
        value: 'energy-heating-oil',
        label: 'Heating Oil',
        icon: Home,
        unit: 'gallons',
        factor: 22.4,
        category: 'Energy'
    },
    {
        value: 'energy-propane',
        label: 'Propane',
        icon: Home,
        unit: 'gallons',
        factor: 12.7,
        category: 'Energy'
    },
    {
        value: 'energy-coal',
        label: 'Coal',
        icon: Home,
        unit: 'lbs',
        factor: 2.0,
        category: 'Energy'
    },
    {
        value: 'energy-wood',
        label: 'Wood Burning',
        icon: Home,
        unit: 'cords',
        factor: 4200,
        category: 'Energy'
    },

    // Food & Diet
    {
        value: 'food-beef',
        label: 'Beef',
        icon: Utensils,
        unit: 'lbs',
        factor: 27.0,
        category: 'Food',
        requiresFoodType: true
    },
    {
        value: 'food-pork',
        label: 'Pork',
        icon: Utensils,
        unit: 'lbs',
        factor: 12.1,
        category: 'Food',
        requiresFoodType: true
    },
    {
        value: 'food-chicken',
        label: 'Chicken',
        icon: Utensils,
        unit: 'lbs',
        factor: 6.9,
        category: 'Food',
        requiresFoodType: true
    },
    {
        value: 'food-fish',
        label: 'Fish & Seafood',
        icon: Utensils,
        unit: 'lbs',
        factor: 5.4,
        category: 'Food',
        requiresFoodType: true
    },
    {
        value: 'food-dairy',
        label: 'Dairy Products',
        icon: Utensils,
        unit: 'lbs',
        factor: 3.2,
        category: 'Food',
        requiresFoodType: true
    },
    {
        value: 'food-eggs',
        label: 'Eggs',
        icon: Utensils,
        unit: 'dozen',
        factor: 4.8,
        category: 'Food'
    },
    {
        value: 'food-rice',
        label: 'Rice',
        icon: Utensils,
        unit: 'lbs',
        factor: 2.7,
        category: 'Food'
    },
    {
        value: 'food-vegetables',
        label: 'Vegetables',
        icon: Utensils,
        unit: 'lbs',
        factor: 0.4,
        category: 'Food'
    },
    {
        value: 'food-fruits',
        label: 'Fruits',
        icon: Utensils,
        unit: 'lbs',
        factor: 0.3,
        category: 'Food'
    },

    // Waste & Recycling
    {
        value: 'waste-general',
        label: 'General Waste',
        icon: Trash2,
        unit: 'lbs',
        factor: 0.94,
        category: 'Waste',
        requiresWasteType: true
    },
    {
        value: 'waste-recycling',
        label: 'Recycling',
        icon: RefreshCw,
        unit: 'lbs',
        factor: -0.5,
        category: 'Waste',
        requiresWasteType: true
    },
    {
        value: 'waste-compost',
        label: 'Composting',
        icon: RefreshCw,
        unit: 'lbs',
        factor: -0.2,
        category: 'Waste'
    },

    // Water Usage
    {
        value: 'water-usage',
        label: 'Water Usage',
        icon: Home,
        unit: 'gallons',
        factor: 0.006,
        category: 'Water'
    },
    {
        value: 'water-shower',
        label: 'Shower',
        icon: Home,
        unit: 'minutes',
        factor: 0.125,
        category: 'Water'
    },
    {
        value: 'water-dishwasher',
        label: 'Dishwasher Use',
        icon: Home,
        unit: 'loads',
        factor: 1.8,
        category: 'Water'
    },
    {
        value: 'water-laundry',
        label: 'Laundry',
        icon: Home,
        unit: 'loads',
        factor: 2.3,
        category: 'Water',
        requiresWaterTemp: true
    },

    // Shopping & Consumer Goods
    {
        value: 'shopping-clothing',
        label: 'Clothing Purchase',
        icon: Home,
        unit: 'items',
        factor: 15.0,
        category: 'Shopping',
        requiresClothingType: true
    },
    {
        value: 'shopping-electronics',
        label: 'Electronics',
        icon: Home,
        unit: 'items',
        factor: 300.0,
        category: 'Shopping',
        requiresElectronicsType: true
    },
    {
        value: 'shopping-books',
        label: 'Books/Media',
        icon: Home,
        unit: 'items',
        factor: 2.5,
        category: 'Shopping'
    },
    {
        value: 'shopping-furniture',
        label: 'Furniture',
        icon: Home,
        unit: 'items',
        factor: 250.0,
        category: 'Shopping',
        requiresFurnitureType: true
    },
];

export const FUEL_TYPES = [
    { value: 'petrol', label: 'Petrol/Gasoline', factor: 1.0 },
    { value: 'diesel', label: 'Diesel', factor: 1.2 },
    { value: 'cng', label: 'CNG', factor: 0.7 },
    { value: 'electric', label: 'Electric', factor: 0.3 },
    { value: 'hybrid', label: 'Hybrid', factor: 0.6 },
];

export const FLIGHT_CLASSES = [
    { value: 'economy', label: 'Economy', factor: 1.0 },
    { value: 'business', label: 'Business', factor: 2.5 },
    { value: 'first', label: 'First Class', factor: 4.0 },
];

export const ENERGY_SOURCES = [
    { value: 'grid', label: 'Grid Electricity', factor: 1.0 },
    { value: 'solar', label: 'Solar Power', factor: 0.1 },
    { value: 'wind', label: 'Wind Power', factor: 0.1 },
    { value: 'hydro', label: 'Hydroelectric', factor: 0.2 },
];

export const FOOD_TYPES = [
    { value: 'beef', label: 'Beef', factor: 1.5 },
    { value: 'pork', label: 'Pork', factor: 1.0 },
    { value: 'chicken', label: 'Chicken', factor: 0.6 },
    { value: 'fish', label: 'Fish', factor: 0.5 },
    { value: 'milk', label: 'Milk', factor: 1.0 },
    { value: 'cheese', label: 'Cheese', factor: 1.2 },
    { value: 'yogurt', label: 'Yogurt', factor: 0.8 },
    { value: 'grass-fed', label: 'Grass-Fed Beef', factor: 1.2 },
    { value: 'organic', label: 'Organic', factor: 0.9 },
    { value: 'local', label: 'Local/Seasonal', factor: 0.7 },
];

export const WASTE_TYPES = [
    { value: 'general', label: 'General Waste', factor: 1.0 },
    { value: 'plastic', label: 'Plastic', factor: 1.2 },
    { value: 'paper', label: 'Paper', factor: 0.8 },
    { value: 'glass', label: 'Glass', factor: 0.6 },
    { value: 'metal', label: 'Metal', factor: 0.5 },
    { value: 'organic', label: 'Organic Waste', factor: 1.1 },
    { value: 'electronics', label: 'E-Waste', factor: 2.0 },
];

export const WATER_TEMPERATURES = [
    { value: 'cold', label: 'Cold Water', factor: 0.5 },
    { value: 'warm', label: 'Warm Water', factor: 1.0 },
    { value: 'hot', label: 'Hot Water', factor: 1.5 },
];

export const CLOTHING_TYPES = [
    { value: 't-shirt', label: 'T-Shirt', factor: 0.8 },
    { value: 'jeans', label: 'Jeans', factor: 2.0 },
    { value: 'dress', label: 'Dress', factor: 1.5 },
    { value: 'jacket', label: 'Jacket/Coat', factor: 3.0 },
    { value: 'shoes', label: 'Shoes', factor: 1.8 },
    { value: 'underwear', label: 'Underwear', factor: 0.3 },
    { value: 'synthetic', label: 'Synthetic Fabric', factor: 1.2 },
    { value: 'cotton', label: 'Cotton', factor: 1.0 },
    { value: 'wool', label: 'Wool', factor: 1.8 },
];

export const ELECTRONICS_TYPES = [
    { value: 'smartphone', label: 'Smartphone', factor: 0.8 },
    { value: 'laptop', label: 'Laptop', factor: 1.5 },
    { value: 'tablet', label: 'Tablet', factor: 0.6 },
    { value: 'tv', label: 'Television', factor: 2.0 },
    { value: 'appliance', label: 'Home Appliance', factor: 3.0 },
    { value: 'gaming', label: 'Gaming Console', factor: 1.2 },
    { value: 'camera', label: 'Camera', factor: 0.9 },
];

export const FURNITURE_TYPES = [
    { value: 'chair', label: 'Chair', factor: 0.8 },
    { value: 'table', label: 'Table', factor: 1.2 },
    { value: 'sofa', label: 'Sofa/Couch', factor: 2.0 },
    { value: 'bed', label: 'Bed', factor: 1.8 },
    { value: 'dresser', label: 'Dresser/Cabinet', factor: 1.5 },
    { value: 'bookshelf', label: 'Bookshelf', factor: 1.0 },
    { value: 'desk', label: 'Desk', factor: 1.1 },
];

// Helper function to get activity type by value
export const getActivityType = (value) => {
    return ACTIVITY_TYPES.find(type => type.value === value);
};

// Helper function to get activities by category
export const getActivitiesByCategory = (category) => {
    return ACTIVITY_TYPES.filter(type => type.category === category);
};

// Helper function to get all categories
export const getCategories = () => {
    return [...new Set(ACTIVITY_TYPES.map(type => type.category))];
};
