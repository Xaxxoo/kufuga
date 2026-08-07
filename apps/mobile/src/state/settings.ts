import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState { birdType: 'broiler' | 'layer'; ageWeeks: 1 | 2 | 3 | 4 | 5 | 6; language: 'en' | 'sw' | 'tw'; colorMode: 'system' | 'light' | 'dark'; setBirdType: (birdType: SettingsState['birdType']) => void; setAgeWeeks: (ageWeeks: SettingsState['ageWeeks']) => void; setLanguage: (language: SettingsState['language']) => void; setColorMode: (colorMode: SettingsState['colorMode']) => void; }
export const useSettingsStore = create<SettingsState>()(persist((set) => ({ birdType: 'broiler', ageWeeks: 1, language: 'en', colorMode: 'system', setBirdType: (birdType) => set({ birdType }), setAgeWeeks: (ageWeeks) => set({ ageWeeks }), setLanguage: (language) => set({ language }), setColorMode: (colorMode) => set({ colorMode }) }), { name: 'kufuga-settings', storage: createJSONStorage(() => AsyncStorage) }));
