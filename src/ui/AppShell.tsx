import {
  BookOpenText,
  Heart,
  LayoutDashboard,
  LayoutGrid,
  LogIn,
  LogOut,
  PawPrint,
  Search,
  UserCircle2,
} from 'lucide-react';
import { NavLink, Outlet, useNavigate, useNavigation } from 'react-router-dom';

import { useAuthStore } from '../features/auth/auth.store';
import { useToast } from '../features/toasts/useToast';
import { DogLoadingScreen } from './DogLoadingScreen';

export function AppShell() {
  const navigate = useNavigate();
  const navigationState = useNavigation();
  const session = useAuthStore((state) => state.session);
  const authStatus = useAuthStore((state) => state.status);
  const initialized = useAuthStore((state) => state.initialized);
  const logout = useAuthStore((state) => state.logout);
  const { showToast } = useToast();
  const showGlobalLoader =
    navigationState.state !== 'idle' || !initialized || authStatus === 'loading';
  const canManageListings = session?.user.role === 'breeder' || session?.user.role === 'shelter';
  const navigation = [
    { to: '/', label: 'Home', icon: LayoutGrid },
    { to: '/listings', label: 'Annunci', icon: Search },
    { to: '/articles', label: 'Articoli', icon: BookOpenText },
    ...(session ? [{ to: '/favorites', label: 'Preferiti', icon: Heart }] : []),
  ];
  const dashboardHref = '/subscriber';
  const dashboardLabel = 'Dashboard professionale';
  const mobileNavigation = [
    { to: '/', label: 'Home', icon: LayoutGrid },
    { to: '/listings', label: 'Annunci', icon: Search },
    { to: '/articles', label: 'Articoli', icon: BookOpenText },
    ...(session ? [{ to: '/favorites', label: 'Preferiti', icon: Heart }] : []),
    ...(session ? [{ to: '/account', label: 'Profilo', icon: UserCircle2 }] : []),
  ];
  const navigationClassName = `nav${session ? ' nav--signed' : ' nav--public'}`;
  const handleLogout = () => {
    logout();
    showToast({
      title: 'Logout completato',
      description: 'La sessione e stata chiusa correttamente.',
      tone: 'info',
    });
    navigate('/login', {
      replace: true,
      state: { message: 'Logout completato. Puoi accedere di nuovo quando vuoi.' },
    });
  };

  return (
    <div className="app-shell">
      {showGlobalLoader ? (
        <div className="app-shell__loader">
          <DogLoadingScreen
            title={
              !initialized || authStatus === 'loading'
                ? 'Stiamo riallineando il tuo profilo'
                : 'Stiamo accompagnandoti alla prossima pagina'
            }
            description={
              !initialized || authStatus === 'loading'
                ? 'Controlliamo sessione, permessi e dati essenziali prima di mostrarti tutto.'
                : 'Un attimo e trovi la prossima tappa, con annunci e contenuti gia pronti.'
            }
            variant="overlay"
          />
        </div>
      ) : null}

      <header className="topbar">
        <div className="container topbar__inner">
          <NavLink to="/" className="brand">
            <span className="brand__mark" aria-hidden="true">
              <PawPrint size={18} strokeWidth={2.2} />
            </span>
            <span>
              <strong>AdFido v1.0.0</strong>
              <small>Trova il cane giusto, nel contesto giusto.</small>
            </span>
          </NavLink>

          <nav className={navigationClassName}>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`}
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {session ? (
            <div className="topbar__actions topbar__actions--signed">
              {canManageListings ? (
                <NavLink className="topbar__utility-link" to={dashboardHref}>
                  <LayoutDashboard size={16} />
                  <span>{dashboardLabel}</span>
                </NavLink>
              ) : null}
              <NavLink className="topbar__secondary-action" to="/account">
                <UserCircle2 size={16} />
                <span>Profilo</span>
              </NavLink>
              <button className="topbar__logout-link" type="button" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="topbar__actions">
              <NavLink className="topbar__secondary-action" to="/register">
                Registrati
              </NavLink>
              <NavLink className="topbar__primary-action" to="/login">
                <LogIn size={16} />
                <span>Accedi</span>
              </NavLink>
            </div>
          )}
        </div>
      </header>

      <div className="container app-shell__body">
        <main>
          <Outlet />
        </main>
      </div>

      <nav className="mobile-tabbar" aria-label="Navigazione mobile principale">
        <div className="mobile-tabbar__inner">
          {mobileNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `mobile-tabbar__link${isActive ? ' mobile-tabbar__link--active' : ''}`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
