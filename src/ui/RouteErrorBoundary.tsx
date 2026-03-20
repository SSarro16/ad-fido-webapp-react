import { AlertTriangle, ArrowLeft, RefreshCcw } from 'lucide-react';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

export function RouteErrorBoundary() {
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Qualcosa e andato storto';
  const description = isRouteErrorResponse(error)
    ? 'La pagina richiesta non e disponibile in questo momento.'
    : error instanceof Error
      ? error.message
      : 'Si e verificato un errore imprevisto durante il caricamento della pagina.';

  return (
    <section className="section section--page">
      <div className="container">
        <div className="empty-state route-error">
          <span className="route-error__icon">
            <AlertTriangle size={22} />
          </span>
          <h2>{title}</h2>
          <p>{description}</p>
          <div className="route-error__actions">
            <button
              type="button"
              className="button button--primary"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw size={18} />
              Ricarica pagina
            </button>
            <Link to="/listings" className="button button--ghost">
              <ArrowLeft size={18} />
              Torna agli annunci
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
