import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define available themes
export type ThemeType = 'github-dark' | 'github-light' | 'vs-dark' | 'vs-light' | 'monokai';

// Define editor settings interface
interface SettingsState {
  // Theme settings
  theme: ThemeType;
  
  // Editor settings
  fontSize: number;
  wordWrap: boolean;
  autoSave: boolean;
  
  // Methods
  setTheme: (theme: ThemeType) => void;
  setFontSize: (size: number) => void;
  toggleWordWrap: () => void;
  toggleAutoSave: () => void;
}

// Create settings store with persistence
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Default settings
      theme: 'github-dark',
      fontSize: 14,
      wordWrap: true,
      autoSave: true,
      
      // Methods to update settings
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      toggleWordWrap: () => set((state) => ({ wordWrap: !state.wordWrap })),
      toggleAutoSave: () => set((state) => ({ autoSave: !state.autoSave })),
    }),
    {
      name: 'xen-settings', // Storage key
    }
  )
);