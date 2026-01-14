// Dashboard Configuration
// This file contains dashboard-related constants and fallback data
// TODO: Remove fallback data once backend provides comprehensive data

import { Car, Home, Utensils, Target, Award, Leaf } from 'lucide-react';

// Icon mapping for different categories
export const CATEGORY_ICON_MAP = {
    'Transportation': Car,
    'Energy': Home,
    'Food': Utensils,
    'Water': Home,
    'Waste': Target,
    'Shopping': Target
};

// Color mapping for different categories
export const CATEGORY_COLOR_MAP = {
    'Transportation': 'text-blue-500',
    'Energy': 'text-yellow-500',
    'Food': 'text-green-500',
    'Water': 'text-cyan-500',
    'Waste': 'text-purple-500',
    'Shopping': 'text-pink-500'
};

// Fallback emissions breakdown (should be replaced with real data)
export const FALLBACK_EMISSIONS_BREAKDOWN = [
    { category: 'Transportation', amount: 0, percentage: 0, icon: Car, color: 'text-blue-500' },
    { category: 'Energy', amount: 0, percentage: 0, icon: Home, color: 'text-yellow-500' },
    { category: 'Food', amount: 0, percentage: 0, icon: Utensils, color: 'text-green-500' },
];

// Fallback recent activities (should be replaced with real data)
export const FALLBACK_RECENT_ACTIVITIES = [
    { type: 'Transportation', description: 'Start logging your activities!', co2: 0, date: 'Today' },
];

// Achievement types and descriptions
// NOTE: These achievements should be dynamically calculated based on user's actual activity data
// For now, using static definitions - the 'earned' status should come from backend
export const ACHIEVEMENT_TYPES = [
    { title: 'Week Streak', description: '7 days of logging', icon: Award, earned: false, requiredStreak: 7 },
    { title: 'Green Commuter', description: 'Used public transport 5x', icon: Car, earned: false, requiredActions: 5 },
    { title: 'Plant-Based', description: 'Ate vegetarian for 3 days', icon: Leaf, earned: false, requiredDays: 3 },
];

// Helper function to calculate achievements based on user data
export const calculateAchievements = (streakData, logs) => {
    return ACHIEVEMENT_TYPES.map(achievement => {
        let earned = false;
        
        if (achievement.title === 'Week Streak' && streakData?.currentStreak >= 7) {
            earned = true;
        }
        // Other achievements would need backend support to track specific activities
        
        return { ...achievement, earned };
    });
};

// Helper function to generate streak days for a month
export const generateStreakDays = (year, month, days = 13) => {
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
};

// Helper function to format emissions breakdown data
export const formatEmissionsBreakdown = (data, totalEmissions) => {
    if (!data || data.length === 0) {
        return FALLBACK_EMISSIONS_BREAKDOWN;
    }

    return data.map(item => {
        const percentage = totalEmissions > 0 ? Math.round((item.total / totalEmissions) * 100) : 0;
        return {
            category: item._id,
            amount: item.total,
            percentage,
            icon: CATEGORY_ICON_MAP[item._id] || Target,
            color: CATEGORY_COLOR_MAP[item._id] || 'text-gray-500'
        };
    });
};

// Helper function to format recent activities
export const formatRecentActivities = (activities, logs) => {
    const sourceData = activities.length > 0 ? activities : logs.slice(0, 3);

    if (sourceData.length === 0) {
        return FALLBACK_RECENT_ACTIVITIES;
    }

    return sourceData.map(log => ({
        type: log.category || log.activityType,
        description: log.activity || `${log.activityType} activity`,
        co2: log.emission || 0,
        date: log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'Today'
    }));
};
