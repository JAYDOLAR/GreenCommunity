"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useTranslation, Trans } from 'react-i18next';
import I18nProvider from '@/components/I18nProvider';

const defaultPreferences = {
  theme: "light",
  language: "en",
  currency: "usd",
  units: "metric",
  privacy: "public",
};

const PreferencesContext = createContext({
  preferences: defaultPreferences,
  setPreferences: () => { },
});

function PreferencesProviderInner({ children }) {
  const [preferences, setPreferences] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("preferences");
      return stored ? JSON.parse(stored) : defaultPreferences;
    }
    return defaultPreferences;
  });

  const { i18n } = useTranslation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("preferences", JSON.stringify(preferences));
    }
  }, [preferences]);

  // Language switching with i18next
  useEffect(() => {
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage(preferences.language);
    }
  }, [preferences.language, i18n]);

  // Theme switching
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("light", "dark");
      if (preferences.theme === "system") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.classList.add(isDark ? "dark" : "light");
      } else {
        document.documentElement.classList.add(preferences.theme);
      }
    }
  }, [preferences.theme]);

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences }}>
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