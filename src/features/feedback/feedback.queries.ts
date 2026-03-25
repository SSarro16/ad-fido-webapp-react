import { useQuery } from '@tanstack/react-query';

import { fetchAdminFeedback } from './feedback.service';

export function useAdminFeedback(token: string | undefined) {
  return useQuery({
    queryKey: ['admin-feedback', token],
    queryFn: () => fetchAdminFeedback(token!),
    enabled: Boolean(token),
  });
}
