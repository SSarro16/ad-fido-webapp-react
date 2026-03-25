import crypto from 'node:crypto';

import dotenv from 'dotenv';

import { firebaseAdminAuth } from '../lib/firebase-admin.js';
import { getUserByEmail, upsertUser } from '../lib/user-store.js';

dotenv.config();

const email = process.argv[2]?.trim();
const displayName = process.argv[3]?.trim() || 'Admin AdFido';
const password =
  process.argv[4]?.trim() ||
  `${crypto.randomBytes(6).toString('base64url')}A1!${crypto.randomBytes(4).toString('hex')}`;

if (!email) {
  throw new Error('Usage: node server/scripts/create-admin-account.js <email> [displayName] [password]');
}

async function main() {
  let authUser;

  try {
    const existingUser = await firebaseAdminAuth.getUserByEmail(email);
    authUser = await firebaseAdminAuth.updateUser(existingUser.uid, {
      email,
      password,
      displayName,
      emailVerified: true,
      disabled: false,
    });
  } catch (error) {
    if (error?.code !== 'auth/user-not-found') {
      throw error;
    }

    authUser = await firebaseAdminAuth.createUser({
      email,
      password,
      displayName,
      emailVerified: true,
      disabled: false,
    });
  }

  const existingProfile = await getUserByEmail(email);

  await upsertUser({
    id: existingProfile?.id ?? `firebase-${authUser.uid}`,
    firebaseUid: authUser.uid,
    name: displayName,
    email,
    phone: existingProfile?.phone ?? '',
    role: 'admin',
    emailVerified: true,
    createdAt: existingProfile?.createdAt ?? new Date().toISOString(),
  });

  console.log(JSON.stringify({ email, password, displayName, uid: authUser.uid }, null, 2));
}

await main();
