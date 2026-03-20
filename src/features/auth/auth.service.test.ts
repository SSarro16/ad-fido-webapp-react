import { afterEach, describe, expect, it, vi } from 'vitest';

import { getCurrentSession, login, register, updateProfile } from './auth.service';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('auth.service', () => {
  it('logs in through the backend endpoint', async () => {
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

  it('registers a new user through the backend endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          token: 'token-456',
          user: {
            id: 'u2',
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
});
