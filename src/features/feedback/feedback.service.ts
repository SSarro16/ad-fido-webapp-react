import { env } from '../../services/env';

export type AdminFeedbackEntry = {
  id: string;
  name: string;
  email: string;
  message: string;
  source: string;
  createdAt: string;
};

type FeedbackResponse = {
  feedback: AdminFeedbackEntry[];
};

type ApiErrorBody = {
  message?: string;
};

async function requestFeedback<T>(path: string, token: string) {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new Error(body?.message ?? 'Richiesta feedback fallita.');
  }

  return (await response.json()) as T;
}

export async function fetchAdminFeedback(token: string) {
  const payload = await requestFeedback<FeedbackResponse>('/admin/feedback', token);
  return payload.feedback;
}
