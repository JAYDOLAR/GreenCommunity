'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useOptimizedNavigation, useOAuthRedirect } from '@/lib/useOptimizedNavigation';

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

  // Function to update user after login
  const updateUser = (userData) => {
    setUser(userData);
    setIsLoading(false);

    // Persist user data to localStorage for better session management
    if (typeof window !== 'undefined' && userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      // Clear any other user-related data from localStorage if needed
      // localStorage.removeItem('userPreferences');
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

  return (
    <UserContext.Provider value={{ user, updateUser, loginAndSetUser, refreshUser, clearUser, isLoading, backendStatus, isLocked }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
} 