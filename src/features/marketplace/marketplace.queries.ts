import { useQuery } from '@tanstack/react-query';

import type { ListingFilters } from '../../types/marketplace';
import {
  fetchFavoriteListings,
  fetchHomePayload,
  fetchListingById,
  fetchListings,
} from './marketplace.service';

export function useHomePayload() {
  return useQuery({
    queryKey: ['home-payload'],
    queryFn: fetchHomePayload,
  });
}

export function useListings(filters: ListingFilters) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => fetchListings(filters),
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListingById(id),
  });
}

export function useFavoriteListings(ids: string[]) {
  return useQuery({
    queryKey: ['favorite-listings', ids],
    queryFn: () => fetchFavoriteListings(ids),
    enabled: ids.length > 0,
  });
}
