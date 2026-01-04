// ChatBot Configuration
// This file contains chatbot-related constants and configurations
// TODO: Make messages and quick replies configurable via admin panel

export const INITIAL_CHATBOT_MESSAGE = {
    role: 'assistant',
    content: 'Hi! I\'m your eco-assistant. How can I help you today?'
};

export const QUICK_REPLIES = [
    'How do I calculate my footprint?',
    'Show reduction tips',
    'What is CSRD?',
    'Contact support'
];

// ChatBot tabs configuration
export const CHATBOT_TABS = {
    HOME: 'home',
    MESSAGES: 'messages',
    HELP: 'help'
};

// Help categories and common questions
export const HELP_CATEGORIES = [
    {
        title: 'Carbon Footprint',
        questions: [
            'How do I calculate my carbon footprint?',
            'What activities should I track?',
            'How accurate are the calculations?'
        ]
    },
    {
        title: 'Marketplace',
        questions: [
            'How do I buy eco-friendly products?',
            'What makes a product sustainable?',
            'How do I become a seller?'
        ]
    },
    {
        title: 'Community',
        questions: [
            'How do I join challenges?',
            'How do I connect with others?',
            'How do points work?'
        ]
    }
];

// Common responses (should be moved to AI service)
export const COMMON_RESPONSES = {
    'footprint_calculation': 'To calculate your carbon footprint, go to the Footprint Log page and start adding your daily activities like transportation, energy use, and consumption.',
    'reduction_tips': 'Here are some quick tips to reduce your carbon footprint: Use public transport, switch to renewable energy, eat more plant-based meals, and reduce waste.',
    'csrd_info': 'CSRD (Corporate Sustainability Reporting Directive) is an EU regulation requiring companies to report on sustainability matters.',
    'contact_support': 'You can contact our support team through the help section or email support@greencommunity.com'
};

// Helper function to get response for common queries
export const getCommonResponse = (query) => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('footprint') || lowerQuery.includes('calculate')) {
        return COMMON_RESPONSES.footprint_calculation;
    }
    if (lowerQuery.includes('tips') || lowerQuery.includes('reduce')) {
        return COMMON_RESPONSES.reduction_tips;
    }
    if (lowerQuery.includes('csrd')) {
        return COMMON_RESPONSES.csrd_info;
    }
    if (lowerQuery.includes('support') || lowerQuery.includes('contact')) {
        return COMMON_RESPONSES.contact_support;
    }

    return null;
};
