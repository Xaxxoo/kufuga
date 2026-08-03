import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthResponse } from '../api/client';

interface SessionState { accessToken: string | null; user: AuthResponse['user'] | null; hydrated: boolean; setSession: (response: AuthResponse) => void; logout: () => void; setHydrated: () => void; }
export const useSessionStore = create<SessionState>()(persist((set) => ({ accessToken: null, user: null, hydrated: false, setSession: (response) => set({ accessToken: response.accessToken, user: response.user }), logout: () => set({ accessToken: null, user: null }), setHydrated: () => set({ hydrated: true }) }), { name: 'kufuga-session', storage: createJSONStorage(() => AsyncStorage), onRehydrateStorage: () => (state) => state?.setHydrated() }));
