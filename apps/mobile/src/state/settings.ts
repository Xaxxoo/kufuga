import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState { birdType: 'broiler' | 'layer'; ageWeeks: 1 | 2 | 3 | 4 | 5 | 6; language: 'en' | 'sw' | 'tw'; setBirdType: (birdType: SettingsState['birdType']) => void; setAgeWeeks: (ageWeeks: SettingsState['ageWeeks']) => void; setLanguage: (language: SettingsState['language']) => void; }
export const useSettingsStore = create<SettingsState>()(persist((set) => ({ birdType: 'broiler', ageWeeks: 1, language: 'en', setBirdType: (birdType) => set({ birdType }), setAgeWeeks: (ageWeeks) => set({ ageWeeks }), setLanguage: (language) => set({ language }) }), { name: 'kufuga-settings', storage: createJSONStorage(() => AsyncStorage) }));
