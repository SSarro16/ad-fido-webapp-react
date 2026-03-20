import { env } from '../../services/env';

export type AppHealth = {
  ok: boolean;
  mapsConfigured: boolean;
};

export async function fetchAppHealth(): Promise<AppHealth> {
  const response = await fetch(`${env.apiBaseUrl}/health`);

  if (!response.ok) {
    throw new Error('Health check non disponibile.');
  }

  return (await response.json()) as AppHealth;
}
