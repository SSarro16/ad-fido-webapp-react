import { ArrowRight, Mail, Inbox, MessageSquareMore, Siren } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuthStore } from '../features/auth/auth.store';
import { useAdminFeedback } from '../features/feedback/feedback.queries';
import { DogLoadingScreen } from '../ui/DogLoadingScreen';
import { SectionTitle } from '../ui/SectionTitle';

export function AdminFeedbackPage() {
  const session = useAuthStore((state) => state.session);
  const token = session?.token;
  const { data: feedback = [], isLoading, isError, error } = useAdminFeedback(token);

  return (
    <section className="section section--page">
      <div className="container">
        <SectionTitle
          eyebrow="Admin"
          title="Feedback ricevuti dal sito"
          description="Qui trovi i messaggi inviati dal form feedback della homepage."
          className="section-title--wide"
        />

        <article className="panel admin-toolbar">
          <div className="profile-quick-actions">
            <Link className="button button--secondary" to="/admin">
              Torna alla control room
              <ArrowRight size={18} />
            </Link>
            <Link className="button button--ghost" to="/admin/inventory">
              Apri inventory admin
              <ArrowRight size={18} />
            </Link>
          </div>
        </article>

        {isLoading ? (
          <DogLoadingScreen
            title="Stiamo recuperando i feedback"
            description="Carichiamo i messaggi ricevuti dal sito."
            variant="page"
          />
        ) : null}

        {isError ? (
          <article className="panel empty-state">
            <Siren size={22} />
            <strong>Feedback admin non disponibile</strong>
            <p>{error instanceof Error ? error.message : 'Non siamo riusciti a caricare i feedback.'}</p>
          </article>
        ) : null}

        {!isError ? <div className="account-grid seller-stats">
          <article className="panel account-card seller-stat-card">
            <Inbox size={22} />
            <div>
              <strong>{feedback.length}</strong>
              <p>Feedback salvati</p>
              <small>Totale messaggi archiviati</small>
            </div>
          </article>
          <article className="panel account-card seller-stat-card">
            <Mail size={22} />
            <div>
              <strong>simone.sarro@outlook.it</strong>
              <p>Email riferimento</p>
              <small>Canale diretto usato dal pulsante email del footer</small>
            </div>
          </article>
        </div> : null}

        {!isError ? <div className="results-list results-list--cards admin-feedback-list">
          {feedback.length === 0 ? (
            <article className="panel empty-state">
              <MessageSquareMore size={22} />
              <strong>Nessun feedback ricevuto per ora</strong>
              <p>Appena qualcuno usera il form nel footer, comparira qui.</p>
            </article>
          ) : (
            feedback.map((item) => (
              <article key={item.id} className="panel admin-feedback-card">
                <div className="admin-feedback-card__topline">
                  <div>
                    <strong>{item.name || 'Nome non indicato'}</strong>
                    <span>{item.email || 'Email non indicata'}</span>
                  </div>
                  <span className="chip">
                    {new Date(item.createdAt).toLocaleDateString('it-IT')}
                  </span>
                </div>

                <p>{item.message}</p>

                <div className="admin-feedback-card__meta">
                  <span className="chip">Fonte: {item.source || 'website'}</span>
                  {item.email ? (
                    <a className="button button--ghost" href={`mailto:${item.email}`}>
                      <Mail size={16} />
                      Rispondi
                    </a>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div> : null}
      </div>
    </section>
  );
}
