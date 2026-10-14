import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from './storage';

export type ThemePreference = 'system' | 'light' | 'dark';

interface PreferencesState {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'baymax.preferences', storage: jsonStorage },
  ),
);
