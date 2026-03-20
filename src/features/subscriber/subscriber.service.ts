import { env } from '../../services/env';
import type {
  ManagedListing,
  ManagedListingInput,
  ListingWorkflowStatus,
} from '../../types/subscriber';

type ListingsResponse = {
  listings: BackendManagedListing[];
};

type ListingResponse = {
  listing: BackendManagedListing;
};

type BackendManagedListing = Omit<ManagedListing, 'adminNotes'> & {
  moderationNotes?: string;
};

type ApiErrorBody = {
  message?: string;
  errors?: string[];
};

async function requestSubscriber<T>(path: string, token: string, options: RequestInit = {}) {
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
    const error = new Error(body?.message ?? 'Richiesta subscriber fallita.');
    Object.assign(error, { details: body?.errors ?? [] });
    throw error;
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

function mapManagedListing(listing: BackendManagedListing): ManagedListing {
  return {
    ...listing,
    adminNotes: listing.moderationNotes,
  };
}

export async function fetchManagedListings(token: string) {
  const payload = await requestSubscriber<ListingsResponse>('/subscriber/listings', token);
  return payload.listings.map(mapManagedListing);
}

export async function createManagedListing(token: string, input: ManagedListingInput) {
  const payload = await requestSubscriber<ListingResponse>('/subscriber/listings', token, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return mapManagedListing(payload.listing);
}

export async function updateManagedListing(
  token: string,
  listingId: string,
  input: ManagedListingInput
) {
  const payload = await requestSubscriber<ListingResponse>(
    `/subscriber/listings/${listingId}`,
    token,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    }
  );

  return mapManagedListing(payload.listing);
}

export async function updateManagedListingStatus(
  token: string,
  listingId: string,
  status: ListingWorkflowStatus,
  adminNotes?: string
) {
  const payload = await requestSubscriber<ListingResponse>(
    `/subscriber/listings/${listingId}/status`,
    token,
    {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes }),
    }
  );

  return mapManagedListing(payload.listing);
}

export async function deleteManagedListing(token: string, listingId: string) {
  await requestSubscriber<null>(`/subscriber/listings/${listingId}`, token, {
    method: 'DELETE',
  });
}
