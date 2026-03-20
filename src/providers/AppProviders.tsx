import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

import { AuthBootstrap } from '../features/auth/AuthBootstrap';
import { queryClient } from '../services/queryClient';
import { ToastViewport } from '../ui/ToastViewport';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>
        {children}
        <ToastViewport />
      </AuthBootstrap>
    </QueryClientProvider>
  );
}
