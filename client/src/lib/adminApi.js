// Admin API Configuration - Handle both development and production environments
export const getAdminApiUrl = () => {
    // In browser environment
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    } else {
      // Production: Use custom domain with Azure fallback
      const customDomain = 'https://www.green-community.app';
      const azureFallback = 'https://green-community.azurewebsites.net';
      
      return process.env.NEXT_PUBLIC_USE_AZURE_FALLBACK === 'true' ? azureFallback : customDomain;
    }
  }
  
  // Server-side: Use environment variable or default
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
};

export default getAdminApiUrl;
