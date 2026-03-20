import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(__dirname, '../data');
const usersFilePath = path.join(dataDir, 'users.json');

const seededUsers = [
  {
    id: 'user-seed',
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
      createdAt: user.createdAt ?? canonicalSeed.createdAt,
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

async function ensureUsersFile() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(usersFilePath, 'utf8');
  } catch {
    await writeFile(usersFilePath, JSON.stringify(seededUsers, null, 2));
  }
}

export async function readUsers() {
  await ensureUsersFile();
  const raw = await readFile(usersFilePath, 'utf8');
  const users = JSON.parse(raw);
  const normalizedUsers = users.map(normalizeUser);

  for (const seededUser of seededUsers) {
    if (
      !normalizedUsers.some((user) => user.id === seededUser.id || user.email === seededUser.email)
    ) {
      normalizedUsers.push(seededUser);
    }
  }

  if (JSON.stringify(users) !== JSON.stringify(normalizedUsers)) {
    await writeFile(usersFilePath, JSON.stringify(normalizedUsers, null, 2));
  }

  return normalizedUsers;
}

export async function writeUsers(users) {
  await ensureUsersFile();
  await writeFile(usersFilePath, JSON.stringify(users.map(normalizeUser), null, 2));
}
