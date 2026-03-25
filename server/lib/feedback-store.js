import { FieldValue } from 'firebase-admin/firestore';

import { firebaseAdminDb } from './firebase-admin.js';

const feedbackCollection = firebaseAdminDb.collection('feedback');

function normalizeFeedback(feedback) {
  return {
    id: feedback.id,
    name: String(feedback.name ?? '').trim(),
    email: String(feedback.email ?? '').trim(),
    message: String(feedback.message ?? '').trim(),
    source: feedback.source ?? 'website',
    createdAt: feedback.createdAt ?? new Date().toISOString(),
  };
}

export async function createFeedbackEntry(feedback) {
  const normalizedFeedback = normalizeFeedback(feedback);

  await feedbackCollection.doc(normalizedFeedback.id).set({
    ...normalizedFeedback,
    storedAt: FieldValue.serverTimestamp(),
  });

  return normalizedFeedback;
}

export async function readFeedbackEntries() {
  const snapshot = await feedbackCollection.orderBy('createdAt', 'desc').limit(100).get();
  return snapshot.docs.map((document) => normalizeFeedback(document.data()));
}
