import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchAdminOverview, moderateAdminListing } from './admin.service';
import type { AdminModerationAction } from '../../types/admin';

export function useAdminOverview(token: string | undefined) {
  return useQuery({
    queryKey: ['admin-overview', token],
    queryFn: () => fetchAdminOverview(token!),
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
      notes?: string;
    }) => moderateAdminListing(token!, listingId, action, notes),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-overview', token] });
      await queryClient.invalidateQueries({ queryKey: ['subscriber-listings'] });
      await queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
