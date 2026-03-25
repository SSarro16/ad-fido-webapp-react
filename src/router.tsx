import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { RequireRole } from './features/auth/RequireRole';
import { ListingDetailPage } from './routes/ListingDetailPage';
import { AppShell } from './ui/AppShell';
import { RouteErrorBoundary } from './ui/RouteErrorBoundary';
import { RouteFallback } from './ui/RouteFallback';

const HomePage = lazy(() =>
  import('./routes/HomePage').then((module) => ({ default: module.HomePage }))
);
const ListingsPage = lazy(() =>
  import('./routes/ListingsPage').then((module) => ({ default: module.ListingsPage }))
);
const ArticlesPage = lazy(() =>
  import('./routes/ArticlesPage').then((module) => ({ default: module.ArticlesPage }))
);
const AccessPage = lazy(() =>
  import('./routes/AccessPage').then((module) => ({ default: module.AccessPage }))
);
const RegisterPage = lazy(() =>
  import('./routes/RegisterPage').then((module) => ({ default: module.RegisterPage }))
);
const FavoritesPage = lazy(() =>
  import('./routes/FavoritesPage').then((module) => ({ default: module.FavoritesPage }))
);
const ProfilePage = lazy(() =>
  import('./routes/ProfilePage').then((module) => ({ default: module.ProfilePage }))
);
const ProfessionalDashboardPage = lazy(() =>
  import('./routes/ProfessionalDashboardPage').then((module) => ({
    default: module.ProfessionalDashboardPage,
  }))
);

function withFallback(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: withFallback(<HomePage />) },
      { path: 'listings', element: withFallback(<ListingsPage />) },
      { path: 'listings/:listingId', element: <ListingDetailPage /> },
      { path: 'articles', element: withFallback(<ArticlesPage />) },
      { path: 'login', element: withFallback(<AccessPage />) },
      { path: 'register', element: withFallback(<RegisterPage />) },
      {
        path: 'favorites',
        element: withFallback(
          <RequireRole allowedRoles={['user', 'subscriber', 'breeder', 'shelter', 'admin']}>
            <FavoritesPage />
          </RequireRole>
        ),
      },
      {
        path: 'account',
        element: withFallback(
          <RequireRole allowedRoles={['user', 'subscriber', 'breeder', 'shelter', 'admin']}>
            <ProfilePage />
          </RequireRole>
        ),
      },
      {
        path: 'subscriber',
        element: withFallback(
          <RequireRole allowedRoles={['subscriber', 'breeder', 'shelter']}>
            <ProfessionalDashboardPage />
          </RequireRole>
        ),
      },
    ],
  },
]);
