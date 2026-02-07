'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useOptimizedNavigation, useOAuthRedirect } from '@/lib/useOptimizedNavigation';
import SessionDialog from '@/components/SessionDialog';

const UserContext = createContext();

export function UserProvider({ children }) {
  const router = useRouter();
  const { navigate } = useOptimizedNavigation();
  const { handleOAuthSuccess } = useOAuthRedirect();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [backendStatus, setBackendStatus] = useState('unknown'); // 'unknown' | 'checking' | 'connected' | 'offline' | 'error'
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionConflict, setSessionConflict] = useState({ type: null, message: '' });
  const [showSessionDialog, setShowSessionDialog] = useState(false);

  // Helper function to dispatch user data update event
  const dispatchUserDataUpdate = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('userDataUpdated'));
    }
  };

  // Function to update user after login
  const updateUser = (userData) => {
    if (userData && checkSessionConflict(userData)) {
      return; // Stop if there's a session conflict
    }

    setUser(userData);
    setIsLoading(false);

    // Persist user data to localStorage for better session management
    if (typeof window !== 'undefined' && userData) {
      initializeSession(userData);
      localStorage.setItem('userData', JSON.stringify(userData));
      // Dispatch event to sync preferences
      dispatchUserDataUpdate();
    }
  };

  // Session management functions
  const generateSessionId = () => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const checkSessionConflict = (userData) => {
    if (!userData || typeof window === 'undefined') return false;

    const currentUserId = userData.id || userData._id;
    const existingUserId = localStorage.getItem('activeUserId');
    const existingSessionId = localStorage.getItem('sessionId');
    const currentSessionId = sessionId;

    // Check if trying to login with different account
    if (existingUserId && existingUserId !== currentUserId) {
      setSessionConflict({
        type: 'different_account',
        message: 'Another account is already logged in on this device. Please logout first to switch accounts.'
      });
      setShowSessionDialog(true);
      return true;
    }

    // Check if same account is already active in another tab/window
    if (existingUserId === currentUserId && existingSessionId && existingSessionId !== currentSessionId) {
      setSessionConflict({
        type: 'multiple_tabs',
        message: 'This account is already open in another tab or window. Please close other tabs to continue.'
      });
      setShowSessionDialog(true);
      return true;
    }

    return false;
  };

  const initializeSession = (userData) => {
    if (!userData || typeof window === 'undefined') return;

    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    
    localStorage.setItem('sessionId', newSessionId);
    localStorage.setItem('activeUserId', userData.id || userData._id);
    localStorage.setItem('sessionStart', Date.now().toString());
  };

  const clearSession = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionId');
      localStorage.removeItem('activeUserId');
      localStorage.removeItem('sessionStart');
    }
    setSessionId(null);
    setSessionConflict({ type: null, message: '' });
    setShowSessionDialog(false);
  };

  const handleSessionConflict = (action) => {
    if (action === 'force_login') {
      // Force logout from other sessions
      clearSession();
      setShowSessionDialog(false);
      // Allow the login to proceed
      return true;
    } else {
      // Cancel login attempt
      setShowSessionDialog(false);
      clearUser();
      return false;
    }
  };

  const loginAndSetUser = async (loginFunction) => {
    const response = await loginFunction();
    if (response.token) {
      localStorage.setItem('token', response.token);
      await refreshUser();
    }
    return response;
  };

  // Function to refresh user data
  const refreshUser = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    try {
      setIsLoading(true);
      setBackendStatus('checking');
      const data = await authAPI.getCurrentUser();
      setUser(data.user);
      setBackendStatus('connected');
      setIsLocked(false);

      // Update localStorage with fresh data
      if (data.user) {
        localStorage.setItem('userData', JSON.stringify(data.user));
        // Dispatch event to sync preferences
        dispatchUserDataUpdate();
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      const msg = String(error?.message || '').toLowerCase();
      if (error?.status === 423 || msg.includes('account is locked')) {
        setIsLocked(true);
        setBackendStatus('connected');
        return;
      }
      console.warn('Failed to refresh user data:', error);
      if (msg.includes('network error') || msg.includes('temporarily unavailable') || msg.includes('service not found')) {
        setBackendStatus('offline');
      } else if (msg.includes('unauthorized') || msg.includes('invalid token') || msg.includes('invalid credentials') || msg.includes('401') || msg.includes('403')) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('error');
      }
    }
  };

  // Function to clear user on logout
  const clearUser = () => {
    setUser(null);
    setIsLoading(false);
    clearSession();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      // Clear preferences from localStorage to reset to defaults
      localStorage.removeItem('preferences');
      // Dispatch event so PreferencesContext can reset to defaults
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
    }
  };

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Main initialization effect
  useEffect(() => {
    if (!isClient || hasInitialized) return;

    async function initializeUser() {
      setHasInitialized(true);

      // Check for URL token first (OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      const auth = urlParams.get('auth');

      let token = localStorage.getItem('token');

      // If we have a token from OAuth callback, use it
      if (auth === 'success' && urlToken) {
        token = urlToken;
        localStorage.setItem('token', token);

        // Clean URL
        router.replace(window.location.pathname, undefined, { shallow: true });

        // Handle OAuth intent using the optimized hook
        try {
          const intent = localStorage.getItem('oauthIntent');
          if (intent) {
            setTimeout(() => {
              handleOAuthSuccess(intent);
              localStorage.removeItem('oauthIntent');
            }, 100);
          }
        } catch (error) {
          console.warn('Error handling OAuth intent:', error);
        }
      }

      // Fast load from cache if available
      if (token) {
        const cachedUserData = localStorage.getItem('userData');
        if (cachedUserData) {
          try {
            const userData = JSON.parse(cachedUserData);
            setUser(userData);
            setIsLoading(false);
            // Dispatch event to sync preferences from cached data
            dispatchUserDataUpdate();
          } catch (e) {
            localStorage.removeItem('userData');
          }
        }
      }

      // If no token, set user to null and finish loading
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Validate token with backend
      try {
        setBackendStatus('checking');
        const data = await authAPI.getCurrentUser();
        setUser(data.user);
        setBackendStatus('connected');
        setIsLocked(false);

        // Update localStorage with fresh data
        if (data.user) {
          localStorage.setItem('userData', JSON.stringify(data.user));
          // Dispatch event to sync preferences
          dispatchUserDataUpdate();
        }

        setIsLoading(false);
      } catch (error) {
        // Handle different error types
        const msg = String(error?.message || '').toLowerCase();
        if (error?.code === 'NETWORK_ERROR' || msg.includes('network error') || msg.includes('load failed') || msg.includes('failed to fetch')) {
          // Do not clear local userCache immediately; mark backend offline and allow landing page to render
          setBackendStatus('offline');
          setIsLoading(false);
          return;
        }
        if (error?.status === 423 || msg.includes('account is locked')) {
          setIsLocked(true);
          setUser(null);
          setIsLoading(false);
          setBackendStatus('connected');
          return;
        }
        console.warn('User authentication failed:', error.message);
        if (msg.includes('invalid credentials') ||
          msg.includes('invalid token') ||
          msg.includes('token expired') ||
          msg.includes('unauthorized') ||
          msg.includes('401') ||
          msg.includes('403')) {
          // Clear invalid tokens
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          setBackendStatus('connected');
        } else if (msg.includes('network error') ||
          msg.includes('service temporarily unavailable') ||
          msg.includes('service not found')) {
          setBackendStatus('offline');
        } else {
          setBackendStatus('error');
        }

        setUser(null);
        setIsLoading(false);
      }
    }

    initializeUser();
  }, [isClient, hasInitialized]); // Removed router from dependencies

  // Handle OAuth redirect after user is established
  useEffect(() => {
    if (!isClient || !user || !hasInitialized) return;

    try {
      const intent = localStorage.getItem('oauthIntent');
      if (intent) {
        setTimeout(() => {
          handleOAuthSuccess(intent);
          localStorage.removeItem('oauthIntent');
        }, 100);
      }
    } catch (error) {
      console.warn('Error handling OAuth redirect:', error);
    }
  }, [user, isClient, hasInitialized, handleOAuthSuccess]); // Use the stable function from hook

  // Monitor session changes in other tabs
  useEffect(() => {
    if (!isClient || !user) return;

    const handleStorageChange = (e) => {
      if (e.key === 'sessionId' || e.key === 'activeUserId') {
        const currentUserId = user.id || user._id;
        const activeUserId = localStorage.getItem('activeUserId');
        const activeSessionId = localStorage.getItem('sessionId');
        
        // If session was cleared or changed to different user
        if (!activeUserId || (activeUserId !== currentUserId) || (activeSessionId !== sessionId)) {
          setSessionConflict({
            type: 'session_expired',
            message: 'Your session has been terminated. Please login again.'
          });
          setShowSessionDialog(true);
          clearUser();
        }
      }
    };

    const handlePageVisibility = () => {
      if (!document.hidden && user) {
        // Check session validity when page becomes visible
        const activeUserId = localStorage.getItem('activeUserId');
        const activeSessionId = localStorage.getItem('sessionId');
        const currentUserId = user.id || user._id;
        
        if (!activeUserId || activeUserId !== currentUserId || activeSessionId !== sessionId) {
          setSessionConflict({
            type: 'session_invalid',
            message: 'Session has been invalidated. Please login again.'
          });
          setShowSessionDialog(true);
          clearUser();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handlePageVisibility);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handlePageVisibility);
    };
  }, [user, isClient, sessionId]);

  // Initialize session ID on first load
  useEffect(() => {
    if (isClient && user && !sessionId) {
      const existingSessionId = localStorage.getItem('sessionId');
      if (existingSessionId) {
        setSessionId(existingSessionId);
      }
    }
  }, [isClient, user, sessionId]);

  return (
    <UserContext.Provider value={{ 
      user, 
      updateUser, 
      loginAndSetUser, 
      refreshUser, 
      clearUser, 
      isLoading, 
      backendStatus, 
      isLocked,
      sessionConflict,
      showSessionDialog,
      handleSessionConflict,
      setShowSessionDialog
    }}>
      {children}
      <SessionDialog />
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
} 