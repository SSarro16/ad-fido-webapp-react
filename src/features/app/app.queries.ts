import { useQuery } from '@tanstack/react-query';

import { fetchAppHealth } from './app.service';

export function useAppHealth() {
  return useQuery({
    queryKey: ['app-health'],
    queryFn: fetchAppHealth,
    retry: false,
  });
}
