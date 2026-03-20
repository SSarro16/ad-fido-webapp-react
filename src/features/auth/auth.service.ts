import { env } from '../../services/env';
import { firebaseAuth } from '../../services/firebase';
import type { AuthSession, LoginInput, RegisterInput } from '../../types/auth';
import {
  createUserWithEmailAndPassword,
  getIdToken,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';

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

function mapFirebaseAuthError(error: unknown) {
  const code =
    typeof error === 'object' && error && 'code' in error ? String(error.code) : undefined;

  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    return 'Credenziali non valide.';
  }

  if (code === 'auth/user-not-found') {
    return 'Account non trovato.';
  }

  if (code === 'auth/email-already-in-use') {
    return 'Esiste gia un account con questa email.';
  }

  if (code === 'auth/weak-password') {
    return 'La password deve avere almeno 6 caratteri.';
  }

  if (code === 'auth/invalid-email') {
    return 'Email non valida.';
  }

  return error instanceof Error ? error.message : 'Richiesta auth fallita.';
}

async function waitForFirebaseUser() {
  if (firebaseAuth.currentUser) {
    return firebaseAuth.currentUser;
  }

  return new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

async function getBackendSessionFromFirebaseToken(token: string) {
  return requestAuth<AuthSession>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function login(input: LoginInput): Promise<AuthSession> {
  try {
    const credential = await signInWithEmailAndPassword(firebaseAuth, input.email, input.password);
    const token = await getIdToken(credential.user, true);
    return getBackendSessionFromFirebaseToken(token);
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

export async function register(input: RegisterInput): Promise<AuthSession> {
  try {
    const credential = await createUserWithEmailAndPassword(
      firebaseAuth,
      input.email,
      input.password
    );

    await updateFirebaseProfile(credential.user, {
      displayName: input.name,
    });

    const token = await getIdToken(credential.user, true);
    await getBackendSessionFromFirebaseToken(token);

    return requestAuth<AuthSession>('/auth/profile', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: input.name,
        phone: input.phone,
        organizationName: '',
      }),
    });
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

export async function getCurrentSession(token?: string): Promise<AuthSession> {
  const currentToken =
    token ??
    (await (async () => {
      const user = await waitForFirebaseUser();

      if (!user) {
        throw new Error('Sessione non disponibile.');
      }

      return getIdToken(user, true);
    })());

  return getBackendSessionFromFirebaseToken(currentToken);
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

export async function logoutFromFirebase() {
  await signOut(firebaseAuth);
}
