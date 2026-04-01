import { env } from '../../services/env';
import type { AdminManagedListing, AdminModerationAction, AdminOverviewResponse, AdminOverviewViewModel } from './admin.types';

type ApiErrorBody = {
  message?: string;
  errors?: string[];
};

type OverviewEnvelope = {
  overview: AdminOverviewResponse;
};

type ListingsEnvelope = {
  listings: AdminManagedListing[];
};

type ListingEnvelope = {
  listing: AdminManagedListing;
};

async function requestAdmin<T>(path: string, token: string, options: RequestInit = {}) {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    const error = new Error(body?.message ?? 'Richiesta admin fallita.');
    Object.assign(error, { details: body?.errors ?? [] });
    throw error;
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

function normalizeManagedListing(listing: AdminManagedListing): AdminManagedListing {
  return {
    ...listing,
    waitingDays: listing.waitingDays ?? 0,
    completenessScore: listing.completenessScore ?? 0,
    mediaCount: listing.mediaCount ?? listing.images.length,
    moderationFlags: listing.moderationFlags ?? [],
    owner: listing.owner
      ? {
          ...listing.owner,
          accountLabel: listing.owner.accountLabel ?? 'Profilo',
        }
      : null,
  };
}

export function mapAdminOverview(payload: AdminOverviewResponse): AdminOverviewViewModel {
  return {
    ...payload,
    moderationQueue: payload.moderationQueue.map(normalizeManagedListing),
    topListings: payload.topListings.map(normalizeManagedListing),
  };
}

export async function fetchAdminOverview(token: string) {
  const payload = await requestAdmin<OverviewEnvelope>('/admin/overview', token);
  return mapAdminOverview(payload.overview);
}

export async function fetchAdminListings(token: string) {
  const payload = await requestAdmin<ListingsEnvelope>('/admin/listings', token);
  return payload.listings.map(normalizeManagedListing);
}

export async function moderateAdminListing(
  token: string,
  listingId: string,
  action: AdminModerationAction,
  notes: string
) {
  const payload = await requestAdmin<ListingEnvelope>(`/admin/listings/${listingId}/moderation`, token, {
    method: 'PATCH',
    body: JSON.stringify({ action, notes }),
  });

  return normalizeManagedListing(payload.listing);
}
