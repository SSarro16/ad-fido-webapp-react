import type {
  HomePayload,
  Listing,
  ListingFeedItem,
  ListingFilters,
} from '../../types/marketplace';
import { env } from '../../services/env';
import { homePayload, listings } from './mockData';
import { buildListingFeed, filterListings } from './marketplace.utils';

function delay<T>(value: T, ms = 220) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

type ListingsResponse = {
  listings: Listing[];
};

type ListingResponse = {
  listing: Listing;
};

async function requestMarketplace<T>(path: string) {
  const response = await fetch(`${env.apiBaseUrl}${path}`);

  if (!response.ok) {
    throw new Error('Richiesta marketplace fallita.');
  }

  return (await response.json()) as T;
}

async function requestMarketplaceMutation(path: string, options: RequestInit) {
  const response = await fetch(`${env.apiBaseUrl}${path}`, options);

  if (!response.ok) {
    throw new Error('Richiesta marketplace fallita.');
  }
}

async function fetchBackendPublishedListings() {
  try {
    const payload = await requestMarketplace<ListingsResponse>('/marketplace/listings');
    return payload.listings;
  } catch {
    return [];
  }
}

async function fetchCombinedListings() {
  const backendListings = await fetchBackendPublishedListings();
  const deduplicatedMockListings = listings.filter(
    (mockListing) => !backendListings.some((backendListing) => backendListing.id === mockListing.id)
  );

  return [...backendListings, ...deduplicatedMockListings];
}

export async function fetchHomePayload(): Promise<HomePayload> {
  const combinedListings = await fetchCombinedListings();

  return delay({
    ...homePayload,
    featuredListings: combinedListings.slice(0, 4),
  });
}

export async function fetchListings(filters: ListingFilters): Promise<ListingFeedItem[]> {
  const combinedListings = await fetchCombinedListings();
  const filtered = filterListings(combinedListings, filters);
  return delay(buildListingFeed(filtered));
}

export async function fetchFavoriteListings(ids: string[]): Promise<Listing[]> {
  const combinedListings = await fetchCombinedListings();
  const favorites = combinedListings.filter((listing) => ids.includes(listing.id));
  return delay(favorites);
}

export async function fetchListingById(id: string): Promise<Listing | undefined> {
  try {
    const payload = await requestMarketplace<ListingResponse>(`/marketplace/listings/${id}`);
    return delay(payload.listing);
  } catch {
    return delay(listings.find((listing) => listing.id === id));
  }
}

export async function trackListingContactClick(id: string) {
  try {
    await requestMarketplaceMutation(`/marketplace/listings/${id}/contact-click`, {
      method: 'POST',
    });
  } catch {
    // Non blocchiamo l utente se il tracking non e disponibile.
  }
}
