// Admin API Configuration - Handle both development and production environments
export const getAdminApiUrl = () => {
    // In browser environment
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    } else {
      // Production: Stay on the current domain
      return window.location.origin;
    }
  }
  
  // Server-side: Use environment variable or default
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
};

export default getAdminApiUrl;
