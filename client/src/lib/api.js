// API Configuration - Handle both development and production environments
const API_BASE_URL = (() => {
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
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
})();

// Create a configured fetch function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
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
    const response = await fetch(url, config);
    
    // Handle network errors or server not responding
    if (!response) {
      throw new Error('Network error. Please check your connection and try again.');
    }

    let data;
    const rawText = await response.text();
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch (jsonError) {
      // Include body preview in error to help debug 500s
      const preview = rawText?.slice(0, 300) || '';
      const err = new Error(`Server response error. Status ${response.status}. Body: ${preview}`);
      err.status = response.status;
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
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
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
  }
};
