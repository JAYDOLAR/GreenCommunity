// Testing Configuration
// This file controls various testing features in the application

export const TESTING_CONFIG = {
  // Force 2FA input for all logins (can be overridden by environment variable)
  FORCE_2FA_FOR_ALL_LOGINS: process.env.NEXT_PUBLIC_FORCE_2FA === 'true' || false,

  // Accepted test codes (can be overridden by environment variable)
  TEST_2FA_CODES: process.env.NEXT_PUBLIC_TEST_2FA_CODES
    ? process.env.NEXT_PUBLIC_TEST_2FA_CODES.split(',')
    : ['123456', '000000', '111111', '999999'],

  // Show testing indicators in UI
  SHOW_TESTING_INDICATORS: process.env.NEXT_PUBLIC_SHOW_TESTING_INDICATORS === 'true' || false,

  // Other testing features can be added here
  SKIP_EMAIL_VERIFICATION: process.env.NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION === 'true' || false,
  MOCK_PAYMENT_GATEWAY: process.env.NEXT_PUBLIC_MOCK_PAYMENT_GATEWAY === 'true' || false,
};

// Helper function to check if we're in development mode
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

// Helper function to determine if testing features should be active
export const isTestingMode = () => {
  return isDevelopment() && TESTING_CONFIG.FORCE_2FA_FOR_ALL_LOGINS;
};

export default TESTING_CONFIG;
