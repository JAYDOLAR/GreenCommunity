"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { TRANSLATIONS, getTranslation } from '@/config/languageConfig';

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

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("preferences");
      return stored ? JSON.parse(stored) : defaultPreferences;
    }
    return defaultPreferences;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("preferences", JSON.stringify(preferences));
    }
  }, [preferences]);

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

export function usePreferences() {
  return useContext(PreferencesContext);
}

// Use the translations from configuration
export const translations = TRANSLATIONS;

export function useTranslation() {
  const { preferences } = usePreferences();
  const lang = preferences.language || 'en';
  const t = (key) => getTranslation(key, lang);
  return { t };
} 