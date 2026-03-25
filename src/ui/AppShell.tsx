import {
  BookOpenText,
  CircleUserRound,
  FolderSearch2,
  Heart,
  LayoutDashboard,
  LayoutGrid,
  LogIn,
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
  const canManageListings =
    session?.user.role === 'breeder' ||
    session?.user.role === 'shelter' ||
    session?.user.role === 'admin';
  const professionalLabel =
    session?.user.role === 'admin'
      ? 'CEO / Admin'
      : session?.user.role === 'shelter' || session?.user.accountType === 'shelter_refuge'
        ? 'Canile / Rifugio'
        : session?.user.role === 'breeder' || session?.user.accountType === 'private_breeder'
          ? 'Allevatore privato'
          : 'Area professionale';
  const navigation = [
    { to: '/', label: 'Home', icon: LayoutGrid },
    { to: '/listings', label: 'Annunci', icon: Search },
    { to: '/articles', label: 'Articoli', icon: BookOpenText },
    ...(session ? [{ to: '/favorites', label: 'Preferiti', icon: Heart }] : []),
  ];
  const dashboardHref = session?.user.role === 'admin' ? '/admin' : '/subscriber';
  const adminInventoryHref = session?.user.role === 'admin' ? '/admin/inventory' : null;

  const dashboardLabel = session?.user.role === 'admin' ? 'Dashboard admin' : 'Dashboard';

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
              <strong>AdFido</strong>
              <small>Trova il cane giusto, nel contesto giusto.</small>
            </span>
          </NavLink>

          <nav className="nav">
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
            <div className="topbar__user topbar__user--card">
              <span className="topbar__avatar">
                <CircleUserRound size={18} />
              </span>
              <div>
                <strong>{session.user.name}</strong>
                <small>
                  {session.user.role === 'admin'
                    ? 'Pannello CEO AdFido'
                    : session.user.role === 'user'
                      ? 'Account personale'
                      : professionalLabel}
                </small>
              </div>
            </div>
          ) : (
            <div className="topbar__actions">
              <NavLink className="button button--ghost" to="/register">
                Crea account
              </NavLink>
              <NavLink className="topbar__cta" to="/login">
                <LogIn size={18} />
                Accedi
              </NavLink>
            </div>
          )}
        </div>
      </header>

      <div className="container app-shell__body">
        <main>
          <Outlet />
        </main>

        {session ? (
          <aside className="account-aside">
            <div className="account-aside__card">
              <div className="account-aside__profile">
                <span className="account-aside__avatar">
                  <CircleUserRound size={20} />
                </span>
              </div>

              <div className="account-aside__links">
                {canManageListings ? (
                  <NavLink
                    className={({ isActive }) =>
                      `account-aside__link${isActive ? ' account-aside__link--active' : ''}`
                    }
                    to={dashboardHref}
                    title={dashboardLabel}
                  >
                    <LayoutDashboard size={18} />
                    <span>{dashboardLabel}</span>
                  </NavLink>
                ) : null}

                {adminInventoryHref ? (
                  <NavLink
                    className={({ isActive }) =>
                      `account-aside__link${isActive ? ' account-aside__link--active' : ''}`
                    }
                    to={adminInventoryHref}
                    title="Moderazione annunci"
                  >
                    <FolderSearch2 size={18} />
                    <span>Moderazione annunci</span>
                  </NavLink>
                ) : null}

                <NavLink
                  className={({ isActive }) =>
                    `account-aside__link${isActive ? ' account-aside__link--active' : ''}`
                  }
                  to="/account"
                  title="Profilo"
                >
                  <UserCircle2 size={18} />
                  <span>Profilo</span>
                </NavLink>
              </div>

              <button
                className="button button--ghost account-aside__logout"
                type="button"
                title="Logout"
                onClick={() => {
                  logout();
                  showToast({
                    title: 'Logout completato',
                    description: 'La sessione è stata chiusa correttamente.',
                    tone: 'info',
                  });
                  navigate('/login', {
                    replace: true,
                    state: { message: 'Logout completato. Puoi accedere di nuovo quando vuoi.' },
                  });
                }}
              >
                Esci
              </button>
            </div>
          </aside>
        ) : null}
      </div>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <div className="site-footer__brand">
            <span className="site-footer__eyebrow">AdFido</span>
            <strong>Annunci per cani con profili curati, contatti seri e moderazione reale.</strong>
            <p>
              Una base digitale pensata per leggere bene ogni scheda, distinguere ruoli e
              responsabilita tra allevatori privati, canili, rifugi e area admin, e far partire
              contatti piu consapevoli.
            </p>
          </div>

          <div className="site-footer__meta">
            <a href="/#contatti">Richiedi aggiornamenti progetto</a>
            <span>Powered by Simone Sarro</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
