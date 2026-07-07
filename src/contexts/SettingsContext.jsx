/**
 * Settings Context — persists app-level settings to localStorage.
 */
import { createContext, useContext, useState } from 'react';

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  hospitalName: 'City Medical Center',
  fridgeName: 'Vaccine Refrigerator Unit-01',
  darkMode: true,
  notificationsEnabled: true,
  soundEnabled: true,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('coldchain_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  function updateSettings(updates) {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem('coldchain_settings', JSON.stringify(newSettings));
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
