import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { getCurrentSession, login, register, updateProfile } from './auth.service';
import type { AuthSession, LoginInput, RegisterInput } from '../../types/auth';

type AuthStatus = 'idle' | 'loading' | 'authenticated';

type AuthState = {
  session: AuthSession | null;
  status: AuthStatus;
  initialized: boolean;
  loginWithPassword: (input: LoginInput) => Promise<void>;
  registerAccount: (input: RegisterInput) => Promise<void>;
  saveProfile: (input: { name: string; phone: string; organizationName?: string }) => Promise<void>;
  initializeAuth: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      status: 'idle',
      initialized: false,
      loginWithPassword: async (input) => {
        set({ status: 'loading' });

        try {
          const session = await login(input);
          set({ session, status: 'authenticated', initialized: true });
        } catch (error) {
          set({ status: 'idle', initialized: true });
          throw error;
        }
      },
      registerAccount: async (input) => {
        set({ status: 'loading' });

        try {
          const session = await register(input);
          set({ session, status: 'authenticated', initialized: true });
        } catch (error) {
          set({ status: 'idle', initialized: true });
          throw error;
        }
      },
      saveProfile: async (input) => {
        const currentSession = get().session;

        if (!currentSession?.token) {
          throw new Error('Sessione non disponibile.');
        }

        set({ status: 'loading' });

        try {
          const session = await updateProfile(currentSession.token, input);
          set({ session, status: 'authenticated', initialized: true });
        } catch (error) {
          set({ status: currentSession ? 'authenticated' : 'idle', initialized: true });
          throw error;
        }
      },
      initializeAuth: async () => {
        const currentSession = get().session;

        if (!currentSession?.token) {
          set({ initialized: true, status: 'idle', session: null });
          return;
        }

        set({ status: 'loading' });

        try {
          const session = await getCurrentSession(currentSession.token);
          set({ session, status: 'authenticated', initialized: true });
        } catch {
          set({ session: null, status: 'idle', initialized: true });
        }
      },
      logout: () => set({ session: null, status: 'idle', initialized: true }),
    }),
    {
      name: 'adfido-auth',
      partialize: (state) => ({
        session: state.session,
      }),
    }
  )
);
