import fs from 'node:fs';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

function readServiceAccountFromEnv() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    return JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'));
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
  }

  return null;
}

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = readServiceAccountFromEnv();
  if (!serviceAccount) {
    throw new Error(
      'Firebase Admin credentials are missing. Set FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_PATH, or GOOGLE_APPLICATION_CREDENTIALS.'
    );
  }

  return initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID ?? serviceAccount.project_id,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? serviceAccount.storageBucket,
  });
}

export const firebaseAdminApp = getFirebaseAdminApp();
export const firebaseAdminAuth = getAuth(firebaseAdminApp);
export const firebaseAdminDb = getFirestore(firebaseAdminApp);
export const firebaseAdminStorage = getStorage(firebaseAdminApp);
