"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useTranslation, Trans } from 'react-i18next';
import I18nProvider from '@/components/I18nProvider';

const defaultPreferences = {
  theme: "light",
  language: "en",
  currency: "usd",
  carbonUnits: "kg", // preferred carbon emission display unit
  privacy: "public",
  dataSharing: false,
};

const PreferencesContext = createContext({
  preferences: defaultPreferences,
  setPreferences: () => { },
  syncPreferencesFromServer: () => { },
  isLoaded: false,
});

function PreferencesProviderInner({ children }) {
  const [preferences, setPreferencesState] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("preferences");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Merge with defaults to ensure all fields exist
          return { ...defaultPreferences, ...parsed };
        } catch (e) {
          return defaultPreferences;
        }
      }
    }
    return defaultPreferences;
  });
  
  const [isLoaded, setIsLoaded] = useState(false);
  const hasSyncedFromServer = useRef(false);
  const { i18n } = useTranslation();

  // Wrapper for setPreferences that also saves to localStorage
  const setPreferences = useCallback((newPrefs) => {
    setPreferencesState(prev => {
      const updated = typeof newPrefs === 'function' ? newPrefs(prev) : newPrefs;
      // Merge with defaults to ensure all fields exist
      const merged = { ...defaultPreferences, ...updated };
      if (typeof window !== "undefined") {
        localStorage.setItem("preferences", JSON.stringify(merged));
      }
      return merged;
    });
  }, []);

  // Function to sync preferences from server (called when user data is available)
  const syncPreferencesFromServer = useCallback((serverPreferences) => {
    if (serverPreferences && typeof serverPreferences === 'object') {
      const merged = { ...defaultPreferences, ...serverPreferences };
      setPreferencesState(merged);
      if (typeof window !== "undefined") {
        localStorage.setItem("preferences", JSON.stringify(merged));
      }
      hasSyncedFromServer.current = true;
      setIsLoaded(true);
    }
  }, []);

  // On mount, try to sync from server user data if available
  useEffect(() => {
    if (typeof window !== "undefined" && !hasSyncedFromServer.current) {
      // Check if we have cached user data with preferences
      const cachedUserData = localStorage.getItem('userData');
      if (cachedUserData) {
        try {
          const userData = JSON.parse(cachedUserData);
          const serverPrefs = userData?.userInfo?.preferences;
          if (serverPrefs && Object.keys(serverPrefs).length > 0) {
            syncPreferencesFromServer(serverPrefs);
          } else {
            setIsLoaded(true);
          }
        } catch (e) {
          setIsLoaded(true);
        }
      } else {
        setIsLoaded(true);
      }
    }
  }, [syncPreferencesFromServer]);

  // Listen for user data updates (when user logs in or data refreshes)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleUserDataUpdate = () => {
      const cachedUserData = localStorage.getItem('userData');
      if (cachedUserData) {
        try {
          const userData = JSON.parse(cachedUserData);
          const serverPrefs = userData?.userInfo?.preferences;
          if (serverPrefs && Object.keys(serverPrefs).length > 0) {
            syncPreferencesFromServer(serverPrefs);
          }
        } catch (e) {
          console.warn('Error syncing preferences from user data update:', e);
        }
      }
    };

    // Listen for custom event when user data is updated
    window.addEventListener('userDataUpdated', handleUserDataUpdate);
    // Also listen for storage changes (cross-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key === 'userData') {
        handleUserDataUpdate();
      }
    });

    // Listen for logout to reset preferences to defaults
    const handleUserLogout = () => {
      setPreferencesState(defaultPreferences);
      hasSyncedFromServer.current = false;
    };
    window.addEventListener('userLoggedOut', handleUserLogout);

    return () => {
      window.removeEventListener('userDataUpdated', handleUserDataUpdate);
      window.removeEventListener('storage', handleUserDataUpdate);
      window.removeEventListener('userLoggedOut', handleUserLogout);
    };
  }, [syncPreferencesFromServer]);

  // Language switching with i18next
  useEffect(() => {
    if (i18n && i18n.changeLanguage && preferences.language) {
      i18n.changeLanguage(preferences.language);
    }
  }, [preferences.language, i18n]);

  // Theme switching - apply immediately
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("light", "dark");
      if (preferences.theme === "system") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.classList.add(isDark ? "dark" : "light");
      } else {
        document.documentElement.classList.add(preferences.theme || "light");
      }
    }
  }, [preferences.theme]);

  // Listen for system theme changes when using "system" theme
  useEffect(() => {
    if (typeof window === "undefined" || preferences.theme !== "system") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(e.matches ? "dark" : "light");
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [preferences.theme]);

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences, syncPreferencesFromServer, isLoaded }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function PreferencesProvider({ children }) {
  return (
    <I18nProvider>
      <PreferencesProviderInner>
        {children}
      </PreferencesProviderInner>
    </I18nProvider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}

// Re-export react-i18next hooks for easy access
export { useTranslation, Trans } from 'react-i18next'; 