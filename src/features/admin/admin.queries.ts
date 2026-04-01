import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchAdminListings, fetchAdminOverview, moderateAdminListing } from './admin.service';
import type { AdminModerationAction } from './admin.types';

export function useAdminOverview(token: string | undefined) {
  return useQuery({
    queryKey: ['admin-overview', token],
    queryFn: () => fetchAdminOverview(token!),
    enabled: Boolean(token),
  });
}

export function useAdminListings(token: string | undefined) {
  return useQuery({
    queryKey: ['admin-listings', token],
    queryFn: () => fetchAdminListings(token!),
    enabled: Boolean(token),
  });
}

export function useModerateAdminListing(token: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      listingId,
      action,
      notes,
    }: {
      listingId: string;
      action: AdminModerationAction;
      notes: string;
    }) => moderateAdminListing(token!, listingId, action, notes),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      await queryClient.invalidateQueries({ queryKey: ['subscriber-listings'] });
      await queryClient.invalidateQueries({ queryKey: ['listing'] });
      await queryClient.invalidateQueries({ queryKey: ['listings'] });
      await queryClient.invalidateQueries({ queryKey: ['favorite-listings'] });
    },
  });
}
