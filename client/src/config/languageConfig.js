// Language Configuration
// This file contains all translations and language settings
// TODO: Move translations to be fetched from backend or translation service

export const SUPPORTED_LANGUAGES = ['en', 'hi', 'gu'];

export const LANGUAGE_LABELS = {
    en: 'English',
    hi: 'हिन्दी',
    gu: 'ગુજરાતી'
};

export const TRANSLATIONS = {
    en: {
        // Common
        greeting_morning: "Good morning",
        greeting_afternoon: "Good afternoon",
        greeting_evening: "Good evening",
        welcome: "Welcome back!",
        save: "Save",
        cancel: "Cancel",
        edit: "Edit",
        delete: "Delete",
        loading: "Loading...",
        error: "Error",
        success: "Success",

        // Navigation
        dashboard: "Dashboard",
        footprint_log: "Footprint Log",
        marketplace: "Marketplace",
        projects: "Projects",
        community: "Community",
        settings: "Settings",

        // Dashboard
        emissions: "Your emissions by category this month",
        achievements: "Your eco-friendly milestones",
        monthly_footprint: "Monthly Footprint",
        weekly_streak: "Weekly Streak",
        eco_score: "Eco Score",
        recent_activities: "Recent Activities",

        // Preferences
        preferences: "Preferences",
        theme: "Theme",
        language: "Language",
        currency: "Currency",
        units: "Measurement Units",
        privacy: "Profile Visibility",
        save_preferences: "Save Preferences",
        profile_private: "Your profile is private and cannot be viewed by others.",

        // Footprint Log
        add_activity: "Add Activity",
        activity_type: "Activity Type",
        quantity: "Quantity",
        date: "Date",
        calculate_emissions: "Calculate Emissions",
        emissions_preview: "Emissions Preview",

        // Marketplace
        all_products: "All Products",
        search_products: "Search products...",
        featured_products: "Featured Products",
        sustainable_picks: "Sustainable Picks",
        add_to_cart: "Add to Cart",
        buy_now: "Buy Now",

        // Community
        challenges: "Challenges",
        leaderboard: "Leaderboard",
        your_impact: "Your Impact",
        join_challenge: "Join Challenge",

        // ChatBot
        chatbot_greeting: "Hi! I'm your eco-assistant. How can I help you today?",
        chatbot_help: "How can I help you?",
        type_message: "Type your message...",
        send_message: "Send",

        // Errors and Messages
        login_required: "Please log in to continue",
        something_went_wrong: "Something went wrong",
        try_again: "Please try again",
        no_data_available: "No data available",
    },

    hi: {
        // Common
        greeting_morning: "शुभ प्रभात",
        greeting_afternoon: "शुभ अपराह्न",
        greeting_evening: "शुभ संध्या",
        welcome: "वापसी पर स्वागत है!",
        save: "सहेजें",
        cancel: "रद्द करें",
        edit: "संपादित करें",
        delete: "हटाएं",
        loading: "लोड हो रहा है...",
        error: "त्रुटि",
        success: "सफलता",

        // Navigation
        dashboard: "डैशबोर्ड",
        footprint_log: "फुटप्रिंट लॉग",
        marketplace: "बाज़ार",
        projects: "परियोजनाएं",
        community: "समुदाय",
        settings: "सेटिंग्स",

        // Dashboard
        emissions: "इस महीने श्रेणी के अनुसार आपके उत्सर्जन",
        achievements: "आपकी पर्यावरण-अनुकूल उपलब्धियाँ",
        monthly_footprint: "मासिक फुटप्रिंट",
        weekly_streak: "साप्ताहिक स्ट्रीक",
        eco_score: "इको स्कोर",
        recent_activities: "हाल की गतिविधियां",

        // Preferences
        preferences: "वरीयताएँ",
        theme: "थीम",
        language: "भाषा",
        currency: "मुद्रा",
        units: "माप इकाइयाँ",
        privacy: "प्रोफ़ाइल दृश्यता",
        save_preferences: "वरीयताएँ सहेजें",
        profile_private: "आपकी प्रोफ़ाइल निजी है और अन्य द्वारा नहीं देखी जा सकती।",

        // Footprint Log
        add_activity: "गतिविधि जोड़ें",
        activity_type: "गतिविधि प्रकार",
        quantity: "मात्रा",
        date: "दिनांक",
        calculate_emissions: "उत्सर्जन गणना करें",
        emissions_preview: "उत्सर्जन पूर्वावलोकन",

        // Marketplace
        all_products: "सभी उत्पाद",
        search_products: "उत्पाद खोजें...",
        featured_products: "विशेष उत्पाद",
        sustainable_picks: "टिकाऊ चुनाव",
        add_to_cart: "कार्ट में जोड़ें",
        buy_now: "अभी खरीदें",

        // Community
        challenges: "चुनौतियां",
        leaderboard: "लीडरबोर्ड",
        your_impact: "आपका प्रभाव",
        join_challenge: "चुनौती में शामिल हों",

        // ChatBot
        chatbot_greeting: "नमस्ते! मैं आपका इको-सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
        chatbot_help: "मैं आपकी कैसे मदद कर सकता हूं?",
        type_message: "अपना संदेश टाइप करें...",
        send_message: "भेजें",

        // Errors and Messages
        login_required: "कृपया जारी रखने के लिए लॉग इन करें",
        something_went_wrong: "कुछ गलत हुआ",
        try_again: "कृपया फिर से कोशिश करें",
        no_data_available: "कोई डेटा उपलब्ध नहीं",
    },

    gu: {
        // Common
        greeting_morning: "સુપ્રભાત",
        greeting_afternoon: "શુભ બપોર",
        greeting_evening: "શુભ સાંજ",
        welcome: "પાછા આવવા માટે સ્વાગત છે!",
        save: "સાચવો",
        cancel: "રદ કરો",
        edit: "સંપાદિત કરો",
        delete: "કાઢી નાખો",
        loading: "લોડ થઈ રહ્યું છે...",
        error: "ભૂલ",
        success: "સફળતા",

        // Navigation
        dashboard: "ડેશબોર્ડ",
        footprint_log: "ફુટપ્રિન્ટ લોગ",
        marketplace: "બજાર",
        projects: "પ્રોજેક્ટ્સ",
        community: "સમુદાય",
        settings: "સેટિંગ્સ",

        // Dashboard
        emissions: "આ મહિને કેટેગરી પ્રમાણે તમારા ઉત્સર્જન",
        achievements: "તમારી પર્યાવરણ-મૈત્રીપૂર્ણ સિદ્ધિઓ",
        monthly_footprint: "માસિક ફુટપ્રિન્ટ",
        weekly_streak: "સાપ્તાહિક સ્ટ્રીક",
        eco_score: "ઇકો સ્કોર",
        recent_activities: "તાજેતરની પ્રવૃત્તિઓ",

        // Preferences
        preferences: "પસંદગીઓ",
        theme: "થીમ",
        language: "ભાષા",
        currency: "ચલણ",
        units: "માપ એકમો",
        privacy: "પ્રોફાઇલ દૃશ્યતા",
        save_preferences: "પસંદગીઓ સાચવો",
        profile_private: "તમારી પ્રોફાઇલ ખાનગી છે અને બીજાઓ દ્વારા જોઈ શકાતી નથી.",

        // Footprint Log
        add_activity: "પ્રવૃત્તિ ઉમેરો",
        activity_type: "પ્રવૃત્તિ પ્રકાર",
        quantity: "માત્રા",
        date: "તારીખ",
        calculate_emissions: "ઉત્સર્જન ગણતરી",
        emissions_preview: "ઉત્સર્જન પૂર્વાવલોકન",

        // Marketplace
        all_products: "બધા ઉત્પાદનો",
        search_products: "ઉત્પાદનો શોધો...",
        featured_products: "વિશેષ ઉત્પાદનો",
        sustainable_picks: "ટકાઉ પસંદગીઓ",
        add_to_cart: "કાર્ટમાં ઉમેરો",
        buy_now: "હવે ખરીદો",

        // Community
        challenges: "પડકારો",
        leaderboard: "લીડરબોર્ડ",
        your_impact: "તમારી અસર",
        join_challenge: "પડકારમાં જોડાઓ",

        // ChatBot
        chatbot_greeting: "નમસ્તે! હું તમારો ઇકો-સહાયક છું. આજે હું તમારી કેવી રીતે મદદ કરી શકું?",
        chatbot_help: "હું તમારી કેવી રીતે મદદ કરી શકું?",
        type_message: "તમારો સંદેશ ટાઇપ કરો...",
        send_message: "મોકલો",

        // Errors and Messages
        login_required: "કૃપા કરીને ચાલુ રાખવા માટે લોગ ઇન કરો",
        something_went_wrong: "કંઈક ખોટું થયું",
        try_again: "કૃપા કરીને ફરી પ્રયાસ કરો",
        no_data_available: "કોઈ ડેટા ઉપલબ્ધ નથી",
    }
};

// Helper function to get translation
export const getTranslation = (key, language = 'en') => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
};

// Helper function to get all translations for a language
export const getLanguageTranslations = (language = 'en') => {
    return TRANSLATIONS[language] || TRANSLATIONS.en;
};
