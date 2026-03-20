import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const authJwtSecret = process.env.AUTH_JWT_SECRET ?? 'adfido-dev-secret-change-me';
const authJwtExpiresIn = '7d';

export function signAuthToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    authJwtSecret,
    { expiresIn: authJwtExpiresIn }
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, authJwtSecret);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function sanitizeUser(user) {
  return {
    id: user.id,
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
