import { firebaseAdminAuth } from '../lib/firebase-admin.js';
import { getUserByEmail, upsertUser } from '../lib/user-store.js';

const demoAccounts = [
  {
    email: 'user@adfido.it',
    passwordEnvKey: 'DEMO_USER_PASSWORD',
    displayName: 'Utente Demo',
    role: 'user',
    phone: '+39 333 410 2201',
    organizationName: '',
  },
  {
    email: 'breeder.demo@adfido.it',
    passwordEnvKey: 'DEMO_BREEDER_PASSWORD',
    displayName: 'Allevatore Privato Demo',
    role: 'breeder',
    phone: '+39 333 410 2202',
    organizationName: 'Allevamento Colle Verde',
  },
  {
    email: 'shelter.demo@adfido.it',
    passwordEnvKey: 'DEMO_SHELTER_PASSWORD',
    displayName: 'Canile Sanitario di San Giorgio Jonico',
    role: 'shelter',
    phone: '+39 333 410 2204',
    organizationName: 'Canile Sanitario di San Giorgio Jonico',
  },
  {
    email: 'adfidoadministration@adfido.it',
    passwordEnvKey: 'DEMO_ADMIN_PASSWORD',
    displayName: 'CEO AdFido',
    role: 'admin',
    phone: '+39 333 410 2203',
    organizationName: undefined,
  },
];

function resolvePassword(account) {
  const password = process.env[account.passwordEnvKey];

  if (!password) {
    throw new Error(
      `Missing ${account.passwordEnvKey}. Demo passwords must be injected through environment variables.`
    );
  }

  return password;
}

async function ensureAuthUser(account) {
  const password = resolvePassword(account);

  try {
    const existingUser = await firebaseAdminAuth.getUserByEmail(account.email);
    const updatedUser = await firebaseAdminAuth.updateUser(existingUser.uid, {
      email: account.email,
      password,
      displayName: account.displayName,
      emailVerified: true,
      disabled: false,
    });

    return { user: updatedUser, created: false };
  } catch (error) {
    if (error?.code !== 'auth/user-not-found') {
      throw error;
    }

    const createdUser = await firebaseAdminAuth.createUser({
      email: account.email,
      password,
      displayName: account.displayName,
      emailVerified: true,
      disabled: false,
    });

    return { user: createdUser, created: true };
  }
}

async function syncFirestoreUser(account, authUser) {
  const existingProfile = await getUserByEmail(account.email);

  await upsertUser({
    id: existingProfile?.id ?? `firebase-${authUser.uid}`,
    firebaseUid: authUser.uid,
    name: account.displayName,
    email: account.email,
    phone: existingProfile?.phone ?? account.phone,
    role: existingProfile?.role ?? account.role,
    emailVerified: true,
    organizationName:
      account.role === 'admin'
        ? undefined
        : (existingProfile?.organizationName ?? account.organizationName ?? ''),
    createdAt: existingProfile?.createdAt ?? new Date().toISOString(),
  });
}

async function main() {
  for (const account of demoAccounts) {
    const { user, created } = await ensureAuthUser(account);
    await syncFirestoreUser(account, user);
    console.log(
      `[seed-demo-auth] ${created ? 'created' : 'updated'} ${account.role} -> ${account.email}`
    );
  }
}

await main();
