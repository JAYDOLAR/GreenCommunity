// Admin API Configuration - Handle both development and production environments
export const getAdminApiUrl = () => {
  // In browser, use the current host's API or fallback
  if (typeof window !== 'undefined') {
    // Client-side: Use same origin for API calls in production, localhost in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    } else {
      // Production: Use same origin (Azure URL)
      return window.location.origin;
    }
  }
  
  // Server-side: Use environment variable or default
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
};

export default getAdminApiUrl;
