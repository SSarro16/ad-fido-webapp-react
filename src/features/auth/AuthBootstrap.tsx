import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import { useAuthStore } from './auth.store';

export function AuthBootstrap({ children }: PropsWithChildren) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const initialized = useAuthStore((state) => state.initialized);

  useEffect(() => {
    if (!initialized) {
      void initializeAuth();
    }
  }, [initializeAuth, initialized]);

  return <>{children}</>;
}
