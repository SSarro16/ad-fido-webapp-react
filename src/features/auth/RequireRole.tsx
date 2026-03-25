import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from './auth.store';
import type { UserRole } from '../../types/auth';

type RequireRoleProps = {
  allowedRoles: Exclude<UserRole, 'guest'>[];
  children: ReactElement;
};

export function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const location = useLocation();
  const session = useAuthStore((state) => state.session);
  const initialized = useAuthStore((state) => state.initialized);

  if (!initialized) {
    return null;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(session.user.role)) {
    return <Navigate to="/account" replace />;
  }

  return children;
}
