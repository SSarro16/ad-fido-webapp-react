import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import { env } from './env';

function getFirebaseConfig() {
  const config = env.firebase;

  if (
    !config.apiKey ||
    !config.authDomain ||
    !config.projectId ||
    !config.storageBucket ||
    !config.messagingSenderId ||
    !config.appId
  ) {
    throw new Error('Firebase web configuration is incomplete.');
  }

  return config;
}

export function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(getFirebaseConfig());
}

export const firebaseAuth = getAuth(getFirebaseApp());
export const firebaseDb = getFirestore(getFirebaseApp());
export const firebaseStorage = getStorage(getFirebaseApp());
