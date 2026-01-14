// API Fallback Utility
// This utility provides automatic fallback from custom domain to Azure URL

export class APIFallbackManager {
  constructor() {
    this.customDomain = 'https://www.green-community.app';
    this.azureDomain = 'https://greencommunity-app.azurewebsites.net';
    // Default to Azure domain since custom domain is currently disabled (403)
    this.currentDomain = this.azureDomain;
    this.failedDomains = new Set();
    this.retryCount = 0;
    this.maxRetries = 1;
  }

  getCurrentBaseUrl() {
    // Check if we're in development
    if (typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:5000';
    }

    // Check environment flag for forced fallback
    if (process.env.NEXT_PUBLIC_USE_AZURE_FALLBACK === 'true') {
      return this.azureDomain;
    }

    // Check explicit environment variable
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }

    // Default to Azure domain for now (custom domain disabled)
    return this.azureDomain;
  }

  async makeRequestWithFallback(endpoint, options = {}) {
    const baseUrl = this.getCurrentBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        timeout: 10000, // 10 second timeout
      });

      if (!response.ok && response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Reset retry count on success
      this.retryCount = 0;
      return response;

    } catch (error) {
      console.warn(`Request failed to ${baseUrl}:`, error.message);

      // Only attempt fallback if we're using custom domain and haven't exceeded retries
      if (baseUrl === this.customDomain && 
          this.retryCount < this.maxRetries && 
          !this.failedDomains.has(this.customDomain)) {
        
        console.log('Attempting fallback to Azure domain...');
        this.failedDomains.add(this.customDomain);
        this.currentDomain = this.azureDomain;
        this.retryCount++;

        // Retry with Azure domain
        const fallbackUrl = `${this.azureDomain}${endpoint}`;
        try {
          const fallbackResponse = await fetch(fallbackUrl, {
            ...options,
            timeout: 10000,
          });

          if (fallbackResponse.ok) {
            console.log('Fallback to Azure domain successful');
            // Store fallback preference temporarily
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('api_fallback_active', 'true');
            }
            return fallbackResponse;
          }
        } catch (fallbackError) {
          console.error('Fallback request also failed:', fallbackError.message);
        }
      }

      // If all attempts fail, throw the original error
      throw error;
    }
  }

  // Method to check if fallback is currently active
  isFallbackActive() {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('api_fallback_active') === 'true';
    }
    return this.currentDomain === this.azureDomain;
  }

  // Method to reset fallback and try custom domain again
  resetFallback() {
    this.currentDomain = this.customDomain;
    this.failedDomains.clear();
    this.retryCount = 0;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('api_fallback_active');
    }
  }

  // Method to manually switch to Azure fallback
  forceAzureFallback() {
    this.currentDomain = this.azureDomain;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('api_fallback_active', 'true');
    }
  }
}

// Create a singleton instance
export const apiFallbackManager = new APIFallbackManager();

// Enhanced API request function with automatic fallback
export const apiRequestWithFallback = async (endpoint, options = {}) => {
  return apiFallbackManager.makeRequestWithFallback(endpoint, options);
};

// Helper function to get current API base URL with fallback logic
export const getApiBaseUrlWithFallback = () => {
  return apiFallbackManager.getCurrentBaseUrl();
};