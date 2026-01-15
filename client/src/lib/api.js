import { apiFallbackManager } from './apiFallback.js';

// API Configuration - Handle both development and production environments
export const API_BASE_URL = (() => {
  return apiFallbackManager.getCurrentBaseUrl();
})();

// Create a configured fetch function with automatic fallback
const apiRequest = async (endpoint, options = {}) => {
  const url = `${apiFallbackManager.getCurrentBaseUrl()}${endpoint}`;
  
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include', // Include cookies for authentication
    ...options,
  };

  try {
    // Use fallback manager for automatic domain switching
    const response = await apiFallbackManager.makeRequestWithFallback(endpoint, config);
    
    // Handle network errors or server not responding
    if (!response) {
      throw new Error('Network error. Please check your connection and try again.');
    }

    let data;
    const rawText = await response.text();
    
    // Handle empty responses
    if (!rawText) {
      if (response.ok) {
        return { success: true, data: null };
      } else {
        throw new Error(`Server returned empty response with status ${response.status}`);
      }
    }
    
    try {
      data = JSON.parse(rawText);
    } catch (jsonError) {
      // Include body preview in error to help debug 500s
      const preview = rawText?.slice(0, 300) || '';
      console.error('JSON Parse Error:', jsonError);
      console.error('Raw Response:', preview);
      const err = new Error(`Invalid JSON response from server. Status: ${response.status}. Body preview: ${preview}`);
      err.status = response.status;
      err.isJsonError = true;
      throw err;
    }

    if (!response.ok) {
      // Prefer server-provided error
      const serverMsg = data.error || data.message;
      const details = data.details || data.errors;
      const errorCode = data.code; // Extract error code if available
      
      // Format error details
      const detailStr = details ? ` Details: ${JSON.stringify(details).slice(0,200)}` : '';
      
      // Create a friendly error message based on status code or server message
      const message = serverMsg || getFriendlyErrorMessage(response.status);
      
      // Special handling for conflict errors (409) to make them more user-friendly
      const formattedMessage = response.status === 409 && message.includes('already') 
        ? message // Just use the direct message for conflicts
        : `${message} (HTTP ${response.status}).${detailStr}`;
      
      const err = new Error(formattedMessage);
      err.status = response.status;
      err.code = errorCode; // Add error code to the error object
      err.originalData = data; // Store the original response data
      throw err;
    }

    return data;
  } catch (error) {
    // Handle fetch/network errors
    const msg = String(error?.message || '').toLowerCase();
    if ((error.name === 'TypeError' && error.message.includes('fetch')) || msg.includes('load failed') || msg.includes('failed to fetch')) {
      const netErr = new Error('Network error. Please check your connection and try again.');
      netErr.code = 'NETWORK_ERROR';
      throw netErr;
    }
    
    // Only log truly unexpected errors to console (not user-facing validation errors)
    if (!isExpectedError(error)) {
      console.error('Unexpected API error:', error);
    }
    
    // Re-throw the original error (it already has a user-friendly message)
    throw error;
  }
};

// Helper function to determine if an error is expected (user-facing)
function isExpectedError(error) {
  const expectedMessages = [
    'Invalid email',
    'Invalid credentials',
    'Invalid token',
    'Token expired',
    'Access denied',
    'Service not found',
    'Too many attempts',
    'Network error',
    'Server response error',
    'Email already in use',
    'Passwords do not match',
    'Invalid 2FA code',
    'Invalid 2FA token',
    'Invalid verification code',
    'Invalid or expired verification code',
    'Current password is incorrect',
    'Wrong password',
    'Wrong email',
    'User not found',
    'Account locked'
  ];
  
  return expectedMessages.some(msg => error.message.includes(msg));
}

function getFriendlyErrorMessage(status) {
  switch (status) {
    case 401:
      return 'Invalid email or password. Please check your credentials and try again.';
    case 403:
      return 'Access denied. You don\'t have permission to perform this action.';
    case 404:
      return 'Service not found. Please try again later.';
    case 423:
      return 'Account temporarily locked due to too many failed attempts. Please try again in 30 minutes.';
    case 429:
      return 'Too many attempts. Please wait a moment before trying again.';
    case 500:
      return 'Server error. We\'re working to fix this issue.';
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again in a few minutes.';
    default:
      return 'Something went wrong. Please try again later.';
  }
};

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData) => {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    return apiRequest('/api/auth/logout', {
      method: 'POST',
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/api/auth/me');
  },

  updatePassword: async (newPassword) => {
    return apiRequest('/api/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  },

  verifyEmailCode: async (email, code) => {
    return apiRequest('/api/auth/verify-email-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  resendVerificationCode: async (email) => {
    return apiRequest('/api/auth/resend-verification-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Password Reset API methods
  forgotPassword: async (email) => {
    return apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyResetCode: async (email, code) => {
    return apiRequest('/api/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  resetPassword: async (token, newPassword) => {
    return apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  updatePasswordWithCode: async (email, code, newPassword) => {
    return apiRequest('/api/auth/update-password-with-code', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    });
  },

  // Settings API methods
  getUserSettings: async () => {
    return apiRequest('/api/auth/settings');
  },

  updateProfile: async (profileData) => {
    return apiRequest('/api/auth/update-profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  updateNotificationPreferences: async (notifications) => {
    return apiRequest('/api/auth/update-notifications', {
      method: 'POST',
      body: JSON.stringify(notifications),
    });
  },

  updateAppPreferences: async (preferences) => {
    return apiRequest('/api/auth/update-preferences', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  },

  changePassword: async (passwordData) => {
    return apiRequest('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  },

  googleLogin: () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  },

  uploadAvatar: async (file) => {
    const url = `${API_BASE_URL}/api/avatar/upload`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Don't set Content-Type for FormData - let browser set it
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || 'Failed to upload image');
    }

    return await response.json();
  },

  deleteAvatar: async () => {
    return apiRequest('/api/avatar', {
      method: 'DELETE',
    });
  },

  // Two-Factor Authentication methods
  generate2FASecret: async () => {
    return apiRequest('/api/auth/2fa/generate', {
      method: 'POST',
    });
  },

  verify2FAToken: async (token) => {
    return apiRequest('/api/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  disable2FA: async () => {
    return apiRequest('/api/auth/2fa/disable', {
      method: 'POST',
    });
  },

  verify2FALogin: async (tempToken, token, options = {}) => {
    const body = {
      tempToken,
      token,
      ...options
    };
    
    return apiRequest('/api/auth/2fa/verify-login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  refresh2FAToken: async (tempToken) => {
    return apiRequest('/api/auth/2fa/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ tempToken }),
    });
  },

  // Trusted device management
  getTrustedDevices: async () => {
    return apiRequest('/api/auth/trusted-devices');
  },

  removeTrustedDevice: async (deviceId) => {
    return apiRequest(`/api/auth/trusted-devices/${deviceId}`, {
      method: 'DELETE',
    });
  },

  clearAllTrustedDevices: async () => {
    return apiRequest('/api/auth/trusted-devices', {
      method: 'DELETE',
    });
  },

  exportUserData: async (format = 'json') => {
    const fmt = (format === 'zip' ? 'zip' : 'json');
    const base = `${API_BASE_URL}/api/auth/export-data?format=${encodeURIComponent(fmt)}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const doFetch = async (method) => {
      return fetch(base, {
        method,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          Accept: fmt === 'zip' ? 'application/zip' : 'application/json',
        },
        credentials: 'include',
      });
    };

    // Try POST first, then fallback to GET if server expects GET
    let res = await doFetch('POST');
    if (!res.ok && (res.status === 404 || res.status === 405)) {
      res = await doFetch('GET');
    }

    // If still not ok, try to parse a message
    if (!res.ok) {
      let message = `Failed to export data (HTTP ${res.status})`;
      try {
        const text = await res.text();
        const json = JSON.parse(text);
        message = json.message || json.error || message;
      } catch {}
      const err = new Error(message);
      err.status = res.status;
      throw err;
    }

    const ct = (res.headers.get('content-type') || '').toLowerCase();

    // If server returns JSON with a URL to download
    if (ct.includes('application/json')) {
      try {
        const data = await res.json();
        const url = data.url || data.downloadUrl || data.href;
        if (url) {
          const win = window.open(url, '_blank');
          if (!win) {
            // Fallback to programmatic fetch+blob if popup blocked
            const dlRes = await fetch(url, { credentials: 'include' });
            const blob = await dlRes.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = (fmt === 'zip' ? 'my-data.zip' : 'my-data.json');
            document.body.appendChild(a);
            a.click();
            a.remove();
          }
          return { success: true };
        }
        // If JSON data is the export itself, download it as a file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'my-data.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        return { success: true };
      } catch {
        // If JSON parsing fails unexpectedly, fall through to blob handling
      }
    }

    // Otherwise treat as blob stream (zip or json)
    const disposition = res.headers.get('content-disposition') || '';
    let filename = fmt === 'zip' ? 'my-data.zip' : 'my-data.json';
    const match = disposition.match(/filename\*=UTF-8''([^;\s]+)/) || disposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) filename = decodeURIComponent(match[1]);
    else if (ct.includes('zip')) filename = 'my-data.zip';
    else if (ct.includes('json')) filename = 'my-data.json';

    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
    return { success: true };
  },

  deleteUserAccount: async () => {
    return apiRequest('/api/auth/delete-account', {
      method: 'DELETE',
    });
  },
};

// Export the base API request function for other uses
export { apiRequest };
export default authAPI;

// Challenges API (frontend integration with backend)
export const challengesAPI = {
  list: async () => {
    return apiRequest('/api/challenges');
  },
  complete: async (challengeId) => {
    // Check if the challenge is from mock data (using numeric id) or from the server (using ObjectId)
    if (typeof challengeId === 'number') {
      console.log("Warning: Using a mock challenge ID. In production, this would connect to an actual challenge.");
      return { success: true, message: "Challenge completed (mock)" };
    }
    
    try {
      return await apiRequest(`/api/challenges/complete/${challengeId}`, { method: 'POST' });
    } catch (error) {
      // Special handling for "already completed" errors
      if (error?.status === 409 && error.message?.includes('already completed')) {
        console.log(`Challenge ${challengeId} was already completed. Treating as success.`);
        // Return a success response instead of throwing an error
        return { 
          success: true, 
          alreadyCompleted: true, 
          message: "Challenge was already completed" 
        };
      }
      // Re-throw any other errors
      throw error;
    }
  },
  me: async () => {
    return apiRequest('/api/challenges/me');
  },
  leaderboard: async () => {
    return apiRequest('/api/challenges/leaderboard');
  },
  // New API calls for groups and events
  groups: async () => {
    return apiRequest('/api/community/groups');
  },
  joinGroup: async (groupId) => {
    // Check if the group is from mock data (using numeric id) or from the server (using ObjectId)
    if (typeof groupId === 'number') {
      console.log("Warning: Using a mock group ID. In production, this would connect to an actual group.");
      return { success: true, message: "Group joined (mock)" };
    }
    return apiRequest(`/api/community/groups/join/${groupId}`, { method: 'POST' });
  },
  leaveGroup: async (groupId) => {
    // Check if the group is from mock data (using numeric id) or from the server (using ObjectId)
    if (typeof groupId === 'number') {
      console.log("Warning: Using a mock group ID. In production, this would connect to an actual group.");
      return { success: true, message: "Group left (mock)" };
    }
    return apiRequest(`/api/community/groups/leave/${groupId}`, { method: 'POST' });
  },
  events: async () => {
    return apiRequest('/api/community/events');
  },
  joinEvent: async (eventId) => {
    // Check if the event is from mock data (using numeric id) or from the server (using ObjectId)
    if (typeof eventId === 'number') {
      console.log("Warning: Using a mock event ID. In production, this would connect to an actual event.");
      return { success: true, message: "Event joined (mock)" };
    }
    return apiRequest(`/api/community/events/join/${eventId}`, { method: 'POST' });
  },
  leaveEvent: async (eventId) => {
    // Check if the event is from mock data (using numeric id) or from the server (using ObjectId)
    if (typeof eventId === 'number') {
      console.log("Warning: Using a mock event ID. In production, this would connect to an actual event.");
      return { success: true, message: "Event left (mock)" };
    }
    return apiRequest(`/api/community/events/leave/${eventId}`, { method: 'POST' });
  },
  // Get extended leaderboard with streak and badges
  leaderboardExtended: async () => {
    return apiRequest('/api/challenges/leaderboard/extended');
  }
};

// Public stats API (no auth required)
export const publicAPI = {
  getGlobalStats: async () => {
    return apiRequest('/api/community/stats');
  }
};

// Site Configuration API (no auth required for public endpoints)
export const siteConfigAPI = {
  // Landing page config
  getLandingConfig: async () => {
    return apiRequest('/api/config/landing');
  },
  // Footer config
  getFooterConfig: async () => {
    return apiRequest('/api/config/footer');
  },
  // Social links
  getSocialConfig: async () => {
    return apiRequest('/api/config/social');
  },
  // Chatbot config
  getChatbotConfig: async () => {
    return apiRequest('/api/config/chatbot');
  },
  // General config
  getGeneralConfig: async () => {
    return apiRequest('/api/config/general');
  },
  // Newsletter
  subscribeNewsletter: async (email, name = '', source = 'landing') => {
    return apiRequest('/api/config/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email, name, source })
    });
  },
  unsubscribeNewsletter: async (email, reason = '') => {
    return apiRequest('/api/config/newsletter/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ email, reason })
    });
  },
  // Emission factors
  getEmissionFactors: async () => {
    return apiRequest('/api/config/emissions');
  },
  getEmissionFactorsByCategory: async (category) => {
    return apiRequest(`/api/config/emissions/category/${category}`);
  },
  calculateEmission: async (activityId, value) => {
    return apiRequest('/api/config/emissions/calculate', {
      method: 'POST',
      body: JSON.stringify({ activityId, value })
    });
  },
  // Currency rates
  getCurrencyRates: async () => {
    return apiRequest('/api/config/currency');
  },
  getCurrencyRate: async (currency) => {
    return apiRequest(`/api/config/currency/${currency}`);
  },
  convertCurrency: async (amount, from, to) => {
    return apiRequest(`/api/config/currency/convert?amount=${amount}&from=${from}&to=${to}`);
  }
};

// User Goals API
export const goalsAPI = {
  getGoals: async () => {
    return apiRequest('/api/auth/goals');
  },
  updateGoals: async (goals) => {
    return apiRequest('/api/auth/goals', {
      method: 'POST',
      body: JSON.stringify(goals)
    });
  },
  deleteCustomGoal: async (goalId) => {
    return apiRequest(`/api/auth/goals/${goalId}`, {
      method: 'DELETE'
    });
  },
  updateCustomGoalProgress: async (goalId, progress) => {
    return apiRequest(`/api/auth/goals/${goalId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(progress)
    });
  }
};

// Notifications API
export const notificationsAPI = {
  getAll: async () => {
    return apiRequest('/api/auth/notifications');
  },
  markAsRead: async (notificationId) => {
    return apiRequest(`/api/auth/notifications/${notificationId}/read`, { method: 'PUT' });
  },
  markAllAsRead: async () => {
    return apiRequest('/api/auth/notifications/read-all', { method: 'PUT' });
  }
};

// Admin Site Configuration API (requires admin auth)
export const adminConfigAPI = {
  // Get all configs
  getAllConfigs: async () => {
    return apiRequest('/api/config/admin/configs');
  },
  
  // Seed all defaults
  seedAllDefaults: async () => {
    return apiRequest('/api/config/admin/seed-all', { method: 'POST' });
  },
  
  // ===== FEATURES =====
  addFeature: async (feature) => {
    return apiRequest('/api/config/admin/features', {
      method: 'POST',
      body: JSON.stringify(feature)
    });
  },
  updateFeature: async (featureId, updates) => {
    return apiRequest(`/api/config/admin/features/${featureId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },
  deleteFeature: async (featureId) => {
    return apiRequest(`/api/config/admin/features/${featureId}`, {
      method: 'DELETE'
    });
  },
  
  // ===== TESTIMONIALS =====
  addTestimonial: async (testimonial) => {
    return apiRequest('/api/config/admin/testimonials', {
      method: 'POST',
      body: JSON.stringify(testimonial)
    });
  },
  updateTestimonial: async (testimonialId, updates) => {
    return apiRequest(`/api/config/admin/testimonials/${testimonialId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },
  deleteTestimonial: async (testimonialId) => {
    return apiRequest(`/api/config/admin/testimonials/${testimonialId}`, {
      method: 'DELETE'
    });
  },
  
  // ===== FOOTER LINKS =====
  addFooterLink: async (link) => {
    return apiRequest('/api/config/admin/footer-links', {
      method: 'POST',
      body: JSON.stringify(link)
    });
  },
  updateFooterLink: async (linkId, updates) => {
    return apiRequest(`/api/config/admin/footer-links/${linkId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },
  deleteFooterLink: async (linkId) => {
    return apiRequest(`/api/config/admin/footer-links/${linkId}`, {
      method: 'DELETE'
    });
  },
  
  // ===== SOCIAL LINKS =====
  addSocialLink: async (link) => {
    return apiRequest('/api/config/admin/social-links', {
      method: 'POST',
      body: JSON.stringify(link)
    });
  },
  updateSocialLink: async (linkId, updates) => {
    return apiRequest(`/api/config/admin/social-links/${linkId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },
  deleteSocialLink: async (linkId) => {
    return apiRequest(`/api/config/admin/social-links/${linkId}`, {
      method: 'DELETE'
    });
  },
  
  // ===== QUICK REPLIES =====
  addQuickReply: async (reply) => {
    return apiRequest('/api/config/admin/quick-replies', {
      method: 'POST',
      body: JSON.stringify(reply)
    });
  },
  updateQuickReply: async (replyId, updates) => {
    return apiRequest(`/api/config/admin/quick-replies/${replyId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },
  deleteQuickReply: async (replyId) => {
    return apiRequest(`/api/config/admin/quick-replies/${replyId}`, {
      method: 'DELETE'
    });
  },
  
  // ===== SECTION UPDATES =====
  updateLandingHero: async (data) => {
    return apiRequest('/api/config/admin/landing/hero', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  updateLandingStats: async (data) => {
    return apiRequest('/api/config/admin/landing/stats', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  updateFooterInfo: async (data) => {
    return apiRequest('/api/config/admin/footer/info', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  updateChatbotSettings: async (data) => {
    return apiRequest('/api/config/admin/chatbot/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  updateGeneralSettings: async (data) => {
    return apiRequest('/api/config/admin/general/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  // ===== NEWSLETTER =====
  getNewsletterSubscribers: async (status = '', page = 1, limit = 50) => {
    let url = `/api/config/admin/newsletter/subscribers?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return apiRequest(url);
  },
  
  // ===== EMISSION FACTORS =====
  seedEmissionFactors: async () => {
    return apiRequest('/api/config/admin/emissions/seed', { method: 'POST' });
  },
  updateEmissionFactor: async (activityId, updates) => {
    return apiRequest(`/api/config/admin/emissions/${activityId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },
  
  // ===== CURRENCY RATES =====
  seedCurrencyRates: async () => {
    return apiRequest('/api/config/admin/currency/seed', { method: 'POST' });
  },
  updateCurrencyRate: async (currency, rate, source = 'manual') => {
    return apiRequest(`/api/config/admin/currency/${currency}`, {
      method: 'PUT',
      body: JSON.stringify({ rate, source })
    });
  }
};
