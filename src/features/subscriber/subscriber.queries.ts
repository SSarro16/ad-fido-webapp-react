import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createManagedListing,
  deleteManagedListing,
  fetchManagedListings,
  updateManagedListing,
  updateManagedListingStatus,
} from './subscriber.service';
import type { ManagedListingInput, ListingWorkflowStatus } from '../../types/subscriber';

export function useManagedListings(token: string | undefined) {
  return useQuery({
    queryKey: ['subscriber-listings', token],
    queryFn: () => fetchManagedListings(token!),
    enabled: Boolean(token),
  });
}

export function useCreateManagedListing(token: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ManagedListingInput) => createManagedListing(token!, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['subscriber-listings', token] });
      await queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
  });
}

export function useUpdateManagedListing(token: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listingId, input }: { listingId: string; input: ManagedListingInput }) =>
      updateManagedListing(token!, listingId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['subscriber-listings', token] });
      await queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
  });
}

export function useUpdateManagedListingStatus(token: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      listingId,
      status,
      adminNotes,
    }: {
      listingId: string;
      status: ListingWorkflowStatus;
      adminNotes?: string;
    }) => updateManagedListingStatus(token!, listingId, status, adminNotes),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['subscriber-listings', token] });
      await queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
  });
}

export function useDeleteManagedListing(token: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => deleteManagedListing(token!, listingId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['subscriber-listings', token] });
      await queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
  });
}
