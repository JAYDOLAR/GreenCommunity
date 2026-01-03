// Footprint Log API Service
import { apiRequest } from './api.js';

export const footprintLogAPI = {
    // Create a new footprint log entry
    createLog: async (logData) => {
        return apiRequest('/api/footprintlog', {
            method: 'POST',
            body: JSON.stringify(logData),
        });
    },

    // Get all user's footprint logs with optional filtering
    getUserLogs: async (filters = {}) => {
        const queryParams = new URLSearchParams();

        // Add filters to query params
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    value.forEach(v => queryParams.append(key, v));
                } else {
                    queryParams.append(key, value);
                }
            }
        });

        const queryString = queryParams.toString();
        const endpoint = queryString ? `/api/footprintlog?${queryString}` : '/api/footprintlog';

        return apiRequest(endpoint);
    },

    // Get total emissions for the user
    getTotalEmissions: async (filters = {}) => {
        const queryParams = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });

        const queryString = queryParams.toString();
        const endpoint = queryString ? `/api/footprintlog/total?${queryString}` : '/api/footprintlog/total';

        return apiRequest(endpoint);
    },

    // Get a specific log by ID
    getLogById: async (logId) => {
        return apiRequest(`/api/footprintlog/${logId}`);
    },

    // Update a log entry
    updateLog: async (logId, updateData) => {
        return apiRequest(`/api/footprintlog/${logId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    },

    // Delete a log entry
    deleteLog: async (logId) => {
        return apiRequest(`/api/footprintlog/${logId}`, {
            method: 'DELETE',
        });
    },

    // Get emissions breakdown by activity type
    getEmissionsByActivityType: async () => {
        return apiRequest('/api/footprintlog/breakdown/activityType');
    },

    // Get emissions breakdown by category
    getEmissionsByCategory: async () => {
        return apiRequest('/api/footprintlog/breakdown/category');
    },

    // Get emissions for a specific time period
    getEmissionsForPeriod: async (startDate, endDate) => {
        const queryParams = new URLSearchParams();
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        
        return apiRequest(`/api/footprintlog/total?${queryParams.toString()}`);
    },

    // Get weekly emissions (last 7 days)
    getWeeklyEmissions: async () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        
        return footprintLogAPI.getEmissionsForPeriod(
            startDate.toISOString(),
            endDate.toISOString()
        );
    },

    // Get monthly emissions (current month)
    getMonthlyEmissions: async () => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        return footprintLogAPI.getEmissionsForPeriod(
            startDate.toISOString(),
            endDate.toISOString()
        );
    },

    // Get recent activities (last N logs)
    getRecentActivities: async (limit = 5) => {
        const logs = await footprintLogAPI.getUserLogs();
        return logs.slice(0, limit);
    },

    // Calculate emissions preview without saving (using backend calculation)
    calculateEmissionsPreview: async (activityData) => {
        // Format the data for backend calculation
        const formattedData = footprintLogAPI.formatLogData(activityData);

        // Create a temporary log entry for calculation only
        const tempData = {
            ...formattedData,
            preview: true // Flag to indicate this is just for calculation
        };

        return apiRequest('/api/footprintlog/preview', {
            method: 'POST',
            body: JSON.stringify(tempData),
        });
    },

    // Utility method to calculate emissions on frontend (for preview)
    calculateEmissions: (activityData) => {
        const { activityType, quantity, details } = activityData;

        // Basic emission factors (these should match server-side calculations)
        const emissionFactors = {
            'transport': {
                'car': { factor: 0.4, unit: 'miles' }, // kg CO2 per mile
                'flight': { factor: 0.2, unit: 'miles' },
                'bus': { factor: 0.1, unit: 'miles' },
                'train': { factor: 0.05, unit: 'miles' },
            },
            'energy': {
                'electricity': { factor: 0.5, unit: 'kWh' }, // kg CO2 per kWh
                'gas': { factor: 5.3, unit: 'therms' },
                'heating': { factor: 2.3, unit: 'kWh' },
            },
            'food': {
                'meat': { factor: 6.5, unit: 'lbs' }, // kg CO2 per lb
                'dairy': { factor: 1.0, unit: 'lbs' },
                'vegetables': { factor: 0.2, unit: 'lbs' },
            },
            'waste': {
                'general': { factor: 0.5, unit: 'lbs' },
                'recycling': { factor: 0.1, unit: 'lbs' },
            }
        };

        // Get base emission factor
        let baseEmission = 0;
        const activityCategory = activityType.split('-')[0]; // e.g., 'transport' from 'transport-car'
        const activitySubtype = activityType.split('-')[1]; // e.g., 'car' from 'transport-car'

        if (emissionFactors[activityCategory] && emissionFactors[activityCategory][activitySubtype]) {
            const factor = emissionFactors[activityCategory][activitySubtype].factor;
            baseEmission = parseFloat(quantity) * factor;
        }

        // Apply additional modifiers based on details
        if (details) {
            // Fuel type modifiers for transport
            if (details.fuelType) {
                const fuelModifiers = {
                    'gasoline': 1.0,
                    'diesel': 1.15,
                    'hybrid': 0.6,
                    'electric': 0.2,
                };
                baseEmission *= (fuelModifiers[details.fuelType] || 1.0);
            }

            // Flight class modifiers
            if (details.flightClass) {
                const classModifiers = {
                    'economy': 1.0,
                    'business': 1.5,
                    'first': 2.0,
                };
                baseEmission *= (classModifiers[details.flightClass] || 1.0);
            }

            // Energy source modifiers
            if (details.energySource) {
                const energyModifiers = {
                    'grid': 1.0,
                    'coal': 1.5,
                    'natural-gas': 0.8,
                    'renewable': 0.1,
                };
                baseEmission *= (energyModifiers[details.energySource] || 1.0);
            }

            // Food type modifiers
            if (details.foodType) {
                const foodModifiers = {
                    'beef': 1.2,
                    'pork': 1.0,
                    'chicken': 0.8,
                    'fish': 0.6,
                    'milk': 1.0,
                    'cheese': 1.2,
                    'yogurt': 0.8,
                };
                baseEmission *= (foodModifiers[details.foodType] || 1.0);
            }

            // Passenger sharing for transport
            if (details.passengers && parseInt(details.passengers) > 1) {
                baseEmission /= parseInt(details.passengers);
            }
        }

        return Math.round(baseEmission * 100) / 100; // Round to 2 decimal places
    },

    // Format log data for API submission
    formatLogData: (formData) => {
        const { activityType, quantity, selectedDate, details = {}, activity } = formData;

        // Map frontend activity types to backend expected format
        const activityMapping = {
            // Transport activities
            'transport-car': { activityType: 'transport', mode: 'car' },
            'transport-flight': { activityType: 'transport', mode: 'flight' },
            'transport-bus': { activityType: 'transport', mode: 'bus' },
            'transport-train': { activityType: 'transport', mode: 'train' },

            // Energy activities
            'energy-electricity': { activityType: 'energy', type: 'electricity' },
            'energy-gas': { activityType: 'energy', type: 'naturalGas' },

            // Food activities
            'food-meat': { activityType: 'food', foodType: 'beef' },
            'food-dairy': { activityType: 'food', foodType: 'chicken' }, // Default to chicken if not specified

            // Waste activities
            'waste-general': { activityType: 'waste', wasteType: 'landfill' },
            'waste-recycling': { activityType: 'waste', wasteType: 'recycling' },
        };

        const mapping = activityMapping[activityType];
        const backendActivityType = mapping ? mapping.activityType : 'other';

        // Create base details object
        let apiDetails = {
            quantity: parseFloat(quantity),
            unit: details.unit || 'units',
            ...details,
        };

        // Add specific fields based on activity type
        if (mapping) {
            if (mapping.mode) {
                // Transport activity
                apiDetails.mode = mapping.mode;
                apiDetails.distance = parseFloat(quantity); // For transport, quantity is distance
            } else if (mapping.type) {
                // Energy activity
                apiDetails.type = mapping.type;
                apiDetails.amount = parseFloat(quantity);
            } else if (mapping.foodType) {
                // Food activity - map frontend food types to IPCC categories
                const foodTypeMapping = {
                    'beef': 'beef',
                    'pork': 'beef', // Map to closest IPCC category
                    'chicken': 'chicken',
                    'fish': 'chicken', // Map to closest IPCC category
                    'milk': 'vegetables', // Dairy mapped to vegetables for lower emissions
                    'cheese': 'vegetables',
                    'yogurt': 'vegetables'
                };

                apiDetails.foodType = details.foodType ?
                    foodTypeMapping[details.foodType] || 'vegetables' :
                    mapping.foodType;
                apiDetails.weight = parseFloat(quantity);
            } else if (mapping.wasteType) {
                // Waste activity
                apiDetails.wasteType = mapping.wasteType;
                apiDetails.weight = parseFloat(quantity);
            }
        }

        // Create the log entry structure
        const logData = {
            activity: activity || `${activityType} activity`,
            activityType: backendActivityType,
            category: details.category || backendActivityType,
            details: apiDetails,
            tags: details.tags || [activityType],
            date: selectedDate ? new Date(selectedDate).toISOString() : new Date().toISOString(),
        };

        // Add location if available
        if (details.location) {
            logData.location = details.location;
        }

        return logData;
    }
};

export default footprintLogAPI;
