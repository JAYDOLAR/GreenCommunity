// API Configuration - Handle both development and production environments
export const API_BASE_URL = (() => {
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
  }
};
