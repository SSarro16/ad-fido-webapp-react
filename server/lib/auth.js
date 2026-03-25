import { firebaseAdminAuth } from './firebase-admin.js';

export async function verifyAuthToken(token) {
  return firebaseAdminAuth.verifyIdToken(token);
}

export function sanitizeUser(user) {
  return {
    id: user.firebaseUid ?? user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    organizationName: user.organizationName ?? undefined,
    phone: user.phone ?? undefined,
  };
}

export function readBearerToken(authorizationHeader) {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.slice('Bearer '.length).trim();
}
