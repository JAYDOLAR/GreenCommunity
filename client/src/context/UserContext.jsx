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
  const [tabId, setTabId] = useState(null);
  const [broadcastChannel, setBroadcastChannel] = useState(null);
  const [isMainTab, setIsMainTab] = useState(false);

  // Helper function to dispatch user data update event
  const dispatchUserDataUpdate = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('userDataUpdated'));
    }
  };

  // Tab coordination utilities
  const generateTabId = () => {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const broadcastToOtherTabs = (message) => {
    if (broadcastChannel) {
      broadcastChannel.postMessage({ ...message, fromTab: tabId });
    }
  };

  const acquireStorageLock = async (key, timeout = 5000) => {
    const lockKey = `${key}_lock`;
    const lockValue = `${tabId}_${Date.now()}`;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const existingLock = localStorage.getItem(lockKey);
      if (!existingLock || Date.now() - parseInt(existingLock.split('_')[1]) > 1000) {
        localStorage.setItem(lockKey, lockValue);
        // Double-check we got the lock
        if (localStorage.getItem(lockKey) === lockValue) {
          return true;
        }
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return false;
  };

  const releaseStorageLock = (key) => {
    localStorage.removeItem(`${key}_lock`);
  };

  const safeLocalStorageUpdate = async (updates) => {
    if (await acquireStorageLock('userSession')) {
      try {
        Object.entries(updates).forEach(([key, value]) => {
          if (value === null) {
            localStorage.removeItem(key);
          } else {
            localStorage.setItem(key, value);
          }
        });
        
        // Broadcast the change to other tabs
        broadcastToOtherTabs({
          type: 'STORAGE_UPDATED',
          updates
        });
      } finally {
        releaseStorageLock('userSession');
      }
    }
  };

  // Function to update user after login
  const updateUser = async (userData) => {
    if (userData && checkSessionConflict(userData)) {
      return; // Stop if there's a session conflict
    }

    setUser(userData);
    setIsLoading(false);

    // Persist user data safely across tabs
    if (typeof window !== 'undefined' && userData) {
      await initializeSession(userData);
      await safeLocalStorageUpdate({
        'userData': JSON.stringify(userData)
      });
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

    // Only check if trying to login with different account
    if (existingUserId && existingUserId !== currentUserId) {
      setSessionConflict({
        type: 'different_account',
        message: 'Another account is already logged in on this device. Please logout first to switch accounts.'
      });
      setShowSessionDialog(true);
      return true;
    }

    // Allow multiple tabs for same user - no conflict
    return false;
  };

  const initializeSession = async (userData) => {
    if (!userData || typeof window === 'undefined') return;

    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    
    // Safely store user session data
    await safeLocalStorageUpdate({
      'activeUserId': userData.id || userData._id,
      'sessionStart': Date.now().toString()
    });
  };

  const clearSession = async () => {
    if (typeof window !== 'undefined') {
      await safeLocalStorageUpdate({
        'activeUserId': null,
        'sessionStart': null
      });
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

      // Update localStorage with fresh data safely
      if (data.user) {
        await safeLocalStorageUpdate({
          'userData': JSON.stringify(data.user)
        });
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
  const clearUser = async () => {
    setUser(null);
    setIsLoading(false);
    await clearSession();
    
    if (typeof window !== 'undefined') {
      await safeLocalStorageUpdate({
        'token': null,
        'userData': null,
        'preferences': null
      });
      
      // Notify other tabs about logout
      broadcastToOtherTabs({ type: 'USER_LOGOUT' });
      
      // Dispatch event so PreferencesContext can reset to defaults
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
    }
  };

  // Handle client-side hydration and tab initialization
  useEffect(() => {
    setIsClient(true);
    
    // Initialize tab coordination
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const newTabId = generateTabId();
      setTabId(newTabId);
      
      const channel = new BroadcastChannel('greencommunity_tabs');
      setBroadcastChannel(channel);
      
      // Check if this is the main tab (oldest active tab)
      const existingTabs = JSON.parse(localStorage.getItem('activeTabs') || '[]');
      const updatedTabs = [...existingTabs, newTabId];
      localStorage.setItem('activeTabs', JSON.stringify(updatedTabs));
      
      // Set as main tab if it's the first/oldest
      setIsMainTab(existingTabs.length === 0);
      
      // Listen for messages from other tabs
      channel.onmessage = (event) => {
        const { type, updates, fromTab } = event.data;
        
        if (fromTab === newTabId) return; // Ignore own messages
        
        switch (type) {
          case 'STORAGE_UPDATED':
            // React to storage updates from other tabs
            Object.entries(updates).forEach(([key, value]) => {
              if (key === 'userData' && value) {
                try {
                  const userData = JSON.parse(value);
                  setUser(userData);
                } catch (e) {
                  console.warn('Failed to parse user data from other tab');
                }
              }
            });
            break;
          case 'USER_LOGOUT':
            setUser(null);
            break;
          case 'TAB_CLOSING':
            const remainingTabs = JSON.parse(localStorage.getItem('activeTabs') || '[]')
              .filter(id => id !== event.data.tabId);
            localStorage.setItem('activeTabs', JSON.stringify(remainingTabs));
            if (remainingTabs.length > 0 && remainingTabs[0] === newTabId) {
              setIsMainTab(true);
            }
            break;
        }
      };
      
      // Clean up tab on unload
      const handleUnload = () => {
        channel.postMessage({ type: 'TAB_CLOSING', tabId: newTabId });
        const activeTabs = JSON.parse(localStorage.getItem('activeTabs') || '[]');
        const updatedTabs = activeTabs.filter(id => id !== newTabId);
        localStorage.setItem('activeTabs', JSON.stringify(updatedTabs));
        channel.close();
      };
      
      window.addEventListener('beforeunload', handleUnload);
      
      return () => {
        handleUnload();
        window.removeEventListener('beforeunload', handleUnload);
      };
    }
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

  // Monitor for account changes (simplified - BroadcastChannel handles most coordination)
  useEffect(() => {
    if (!isClient || !user || !isMainTab) return;

    const handlePageVisibility = () => {
      if (!document.hidden && user) {
        // Only check for different account on main tab when page becomes visible
        const activeUserId = localStorage.getItem('activeUserId');
        const currentUserId = user.id || user._id;
        
        if (activeUserId && activeUserId !== currentUserId) {
          setSessionConflict({
            type: 'session_invalid',
            message: 'Another account is now active. Please login again.'
          });
          setShowSessionDialog(true);
          clearUser();
        }
      }
    };

    document.addEventListener('visibilitychange', handlePageVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handlePageVisibility);
    };
  }, [user, isClient, isMainTab]);

  // Initialize user session tracking
  useEffect(() => {
    if (isClient && user && !sessionId) {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
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