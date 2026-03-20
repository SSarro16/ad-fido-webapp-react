import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../services/firebase', () => ({
  firebaseAuth: {},
}));

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  getIdToken: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}));

import {
  createUserWithEmailAndPassword,
  getIdToken,
  signInWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';

import { getCurrentSession, login, logoutFromFirebase, register, updateProfile } from './auth.service';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('auth.service', () => {
  it('logs in through Firebase and resolves the backend session', async () => {
    const firebaseUser = { uid: 'firebase-user-1' };
    vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce({ user: firebaseUser } as never);
    vi.mocked(getIdToken).mockResolvedValueOnce('token-123');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          token: 'token-123',
          user: {
            id: 'u1',
            name: 'Admin',
            email: 'admin@adfido.it',
            phone: '+39 333 000 0001',
            role: 'admin',
            emailVerified: true,
          },
        }),
      })
    );

    const session = await login({ email: 'admin@adfido.it', password: 'password' });
    expect(session.user.role).toBe('admin');
  });

  it('registers through Firebase and completes the backend profile', async () => {
    const firebaseUser = { uid: 'firebase-user-2' };
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce({ user: firebaseUser } as never);
    vi.mocked(updateFirebaseProfile).mockResolvedValueOnce(undefined);
    vi.mocked(getIdToken).mockResolvedValue('token-456');

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            token: 'token-456',
            user: {
              id: 'firebase-user-2',
              name: 'Test User',
              email: 'test@adfido.it',
              phone: '',
              role: 'user',
              emailVerified: false,
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            token: 'token-456',
            user: {
              id: 'firebase-user-2',
              name: 'Test User',
              email: 'test@adfido.it',
              phone: '+39 333 000 0002',
              role: 'user',
              emailVerified: false,
            },
          }),
        })
    );

    const session = await register({
      name: 'Test User',
      email: 'test@adfido.it',
      phone: '+39 333 000 0002',
      password: 'password',
      role: 'user',
    });

    expect(session.user.emailVerified).toBe(false);
    expect(session.user.role).toBe('user');
  });

  it('loads the current session from the backend token endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          token: 'token-789',
          user: {
            id: 'u3',
            name: 'Giulia',
            email: 'user@adfido.it',
            phone: '+39 333 000 0003',
            role: 'user',
            emailVerified: true,
          },
        }),
      })
    );

    const session = await getCurrentSession('token-789');
    expect(session.user.email).toBe('user@adfido.it');
  });

  it('updates the profile through the backend endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          token: 'token-111',
          user: {
            id: 'u4',
            name: 'Giulia Rossi',
            email: 'user@adfido.it',
            phone: '+39 333 999 8888',
            role: 'user',
            emailVerified: true,
            organizationName: '',
          },
        }),
      })
    );

    const session = await updateProfile('token-111', {
      name: 'Giulia Rossi',
      phone: '+39 333 999 8888',
      organizationName: '',
    });

    expect(session.user.phone).toBe('+39 333 999 8888');
  });

  it('logs out through Firebase', async () => {
    await expect(logoutFromFirebase()).resolves.toBeUndefined();
  });
});
