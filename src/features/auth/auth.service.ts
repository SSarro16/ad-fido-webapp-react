import { env } from '../../services/env';
import type { AuthSession, LoginInput, RegisterInput } from '../../types/auth';

type ApiErrorBody = {
  message?: string;
};

async function requestAuth<T>(path: string, options: RequestInit) {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new Error(body?.message ?? 'Richiesta auth fallita.');
  }

  return (await response.json()) as T;
}

export async function login(input: LoginInput): Promise<AuthSession> {
  return requestAuth<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function register(input: RegisterInput): Promise<AuthSession> {
  return requestAuth<AuthSession>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getCurrentSession(token: string): Promise<AuthSession> {
  return requestAuth<AuthSession>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export type UpdateProfileInput = {
  name: string;
  phone: string;
  organizationName?: string;
};

export async function updateProfile(
  token: string,
  input: UpdateProfileInput
): Promise<AuthSession> {
  return requestAuth<AuthSession>('/auth/profile', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
}
