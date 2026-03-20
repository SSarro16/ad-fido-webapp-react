import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FieldValue } from 'firebase-admin/firestore';

import { firebaseAdminDb } from './firebase-admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const legacyUsersFilePath = path.resolve(__dirname, '../data/users.json');
const usersCollection = firebaseAdminDb.collection('users');

const seededUsers = [
  {
    id: 'user-seed',
    firebaseUid: undefined,
    name: 'Utente Demo',
    email: 'user@adfido.it',
    phone: '+39 333 410 2201',
    role: 'user',
    emailVerified: true,
    organizationName: '',
    createdAt: '2026-03-10T08:00:00.000Z',
    passwordHash: '$2b$10$Ugiv7bwdy.i6v5xjLCg34erFaNpB98JcBNtrLKWJSTZTDNAsIqgd2',
  },
  {
    id: 'breeder-seed',
    firebaseUid: undefined,
    name: 'Allevatore Privato Demo',
    email: 'breeder.demo@adfido.it',
    phone: '+39 333 410 2202',
    role: 'breeder',
    emailVerified: true,
    organizationName: 'Allevamento Colle Verde',
    createdAt: '2026-03-11T09:30:00.000Z',
    passwordHash: '$2b$10$7W7fYNn52Eah1zvo2UWXHegTzQC/5p.TH0aPnmuL4tVkwgm68nRPC',
  },
  {
    id: 'shelter-seed',
    firebaseUid: undefined,
    name: 'Canile Sanitario di San Giorgio Jonico',
    email: 'shelter.demo@adfido.it',
    phone: '+39 333 410 2204',
    role: 'shelter',
    emailVerified: true,
    organizationName: 'Canile Sanitario di San Giorgio Jonico',
    createdAt: '2026-03-12T11:15:00.000Z',
    passwordHash: '$2b$10$nHxEsHkfXXouOQE5jq6N.uM3OSoNPzcRYEjLFGu4jG1xcyxt6mUXW',
  },
  {
    id: 'admin-seed',
    firebaseUid: undefined,
    name: 'CEO AdFido',
    email: 'adfidoadministration@adfido.it',
    phone: '+39 333 410 2203',
    role: 'admin',
    emailVerified: true,
    organizationName: undefined,
    createdAt: '2026-03-09T07:45:00.000Z',
    passwordHash: '$2b$10$6snLLeM9ScxJsF4tIO5xoek9GKvvoRXw6lxCiUlsrOnZ2rfdBulLy',
  },
];

function normalizeUser(user) {
  const canonicalSeed = seededUsers.find((seededUser) => seededUser.id === user.id);

  if (canonicalSeed) {
    return {
      ...canonicalSeed,
      ...user,
      firebaseUid: user.firebaseUid ?? canonicalSeed.firebaseUid,
      createdAt: user.createdAt ?? canonicalSeed.createdAt,
      phone: user.phone ?? canonicalSeed.phone,
      organizationName:
        canonicalSeed.role === 'admin'
          ? undefined
          : (user.organizationName ?? canonicalSeed.organizationName ?? ''),
      emailVerified: user.emailVerified ?? canonicalSeed.emailVerified,
    };
  }

  const normalizedRole =
    user.role === 'subscriber'
      ? user.accountType === 'shelter_refuge'
        ? 'shelter'
        : 'breeder'
      : user.role;

  return {
    ...user,
    firebaseUid: user.firebaseUid ?? undefined,
    role: normalizedRole,
    organizationName:
      normalizedRole === 'admin'
        ? undefined
        : (user.organizationName ??
          (normalizedRole === 'breeder'
            ? 'Allevamento Colle Verde'
            : normalizedRole === 'shelter'
              ? 'Canile Sanitario di San Giorgio Jonico'
              : '')),
    phone:
      user.phone ??
      (normalizedRole === 'breeder'
        ? '+39 333 410 2202'
        : normalizedRole === 'shelter'
          ? '+39 333 410 2204'
          : normalizedRole === 'admin'
            ? '+39 333 410 2203'
            : '+39 333 410 2201'),
    createdAt: user.createdAt ?? new Date().toISOString(),
  };
}

async function seedUsersIfNeeded() {
  const snapshot = await usersCollection.limit(1).get();

  if (!snapshot.empty) {
    return { seeded: false, count: snapshot.size };
  }

  let initialUsers = seededUsers;

  try {
    const legacyUsers = JSON.parse(await readFile(legacyUsersFilePath, 'utf8'));
    if (Array.isArray(legacyUsers) && legacyUsers.length > 0) {
      initialUsers = legacyUsers;
    }
  } catch {
    // Fall back to seeded users when there is no legacy JSON snapshot to migrate.
  }

  const batch = firebaseAdminDb.batch();

  for (const user of initialUsers.map(normalizeUser)) {
    batch.set(usersCollection.doc(user.id), {
      ...user,
      migratedAt: FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  return { seeded: true, count: initialUsers.length };
}

export async function ensureUsersSeeded() {
  return seedUsersIfNeeded();
}

export async function getUserById(userId) {
  await seedUsersIfNeeded();

  const document = await usersCollection.doc(userId).get();
  return document.exists ? normalizeUser(document.data()) : null;
}

export async function getUserByEmail(email) {
  await seedUsersIfNeeded();

  const snapshot = await usersCollection.where('email', '==', email).limit(1).get();
  return snapshot.empty ? null : normalizeUser(snapshot.docs[0].data());
}

export async function getUserByFirebaseUid(firebaseUid) {
  await seedUsersIfNeeded();

  const snapshot = await usersCollection.where('firebaseUid', '==', firebaseUid).limit(1).get();
  return snapshot.empty ? null : normalizeUser(snapshot.docs[0].data());
}

export async function upsertUser(user) {
  await seedUsersIfNeeded();

  const normalizedUser = normalizeUser(user);
  await usersCollection.doc(normalizedUser.id).set(normalizedUser);
  return normalizedUser;
}

export async function readUsers() {
  await seedUsersIfNeeded();

  const snapshot = await usersCollection.get();
  const normalizedUsers = snapshot.docs.map((document) => normalizeUser(document.data()));

  for (const seededUser of seededUsers) {
    if (
      !normalizedUsers.some((user) => user.id === seededUser.id || user.email === seededUser.email)
    ) {
      normalizedUsers.push(seededUser);
    }
  }

  return normalizedUsers;
}
