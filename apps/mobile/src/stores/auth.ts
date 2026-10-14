import type { User } from '@baymax/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { configureApiClient } from '@/lib/api/client';
import { secureJsonStorage } from './storage';

interface AuthState {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  signIn: (token: string, user: User) => void;
  setUser: (user: User) => void;
  signOut: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,
      signIn: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      signOut: () => set({ token: null, user: null }),
    }),
    {
      name: 'baymax.session',
      storage: secureJsonStorage,
      partialize: ({ token, user }) => ({ token, user }),
      onRehydrateStorage: () => () => useAuth.setState({ hydrated: true }),
    },
  ),
);

configureApiClient({
  getToken: () => useAuth.getState().token,
  onUnauthorized: () => useAuth.getState().signOut(),
});
