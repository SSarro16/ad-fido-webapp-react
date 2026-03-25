import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as authService from './auth.service';

vi.mock('./auth.service', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getCurrentSession: vi.fn(),
  updateProfile: vi.fn(),
  logoutFromFirebase: vi.fn(),
}));

const mockedLogin = vi.mocked(authService.login);
const mockedRegister = vi.mocked(authService.register);
const mockedUpdateProfile = vi.mocked(authService.updateProfile);

type AuthStoreModule = typeof import('./auth.store');
let useAuthStore: AuthStoreModule['useAuthStore'];

beforeEach(async () => {
  vi.resetModules();

  const storage = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      clear: () => {
        storage.clear();
      },
    },
  });

  ({ useAuthStore } = await import('./auth.store'));

  useAuthStore.setState({
    session: null,
    status: 'idle',
    initialized: false,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('auth.store', () => {
  it('restores idle status after login failure', async () => {
    mockedLogin.mockRejectedValueOnce(new Error('Credenziali non valide.'));

    await expect(
      useAuthStore.getState().loginWithPassword({
        email: 'user@adfido.it',
        password: 'wrong-pass',
      })
    ).rejects.toThrow('Credenziali non valide.');

    expect(useAuthStore.getState().status).toBe('idle');
    expect(useAuthStore.getState().session).toBeNull();
  });

  it('restores idle status after register failure', async () => {
    mockedRegister.mockRejectedValueOnce(new Error('Email gia presente.'));

    await expect(
      useAuthStore.getState().registerAccount({
        name: 'Test User',
        email: 'test@adfido.it',
        phone: '+39 333 111 2222',
        password: 'secret123',
        role: 'user',
      })
    ).rejects.toThrow('Email gia presente.');

    expect(useAuthStore.getState().status).toBe('idle');
  });

  it('keeps authenticated status after profile save failure', async () => {
    useAuthStore.setState({
      session: {
        token: 'token-123',
        user: {
          id: 'u1',
          name: 'Giulia',
          email: 'user@adfido.it',
          phone: '+39 333 000 0000',
          role: 'user',
          emailVerified: true,
        },
      },
      status: 'authenticated',
      initialized: true,
    });
    mockedUpdateProfile.mockRejectedValueOnce(new Error('Server down.'));

    await expect(
      useAuthStore.getState().saveProfile({
        name: 'Giulia',
        phone: '+39 333 000 0000',
      })
    ).rejects.toThrow('Server down.');

    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(useAuthStore.getState().session?.token).toBe('token-123');
  });
});
