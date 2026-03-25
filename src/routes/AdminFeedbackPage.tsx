import { MessageSquareMore, Mail, Inbox } from 'lucide-react';

import { useAuthStore } from '../features/auth/auth.store';
import { useAdminFeedback } from '../features/feedback/feedback.queries';
import { DogLoadingScreen } from '../ui/DogLoadingScreen';
import { SectionTitle } from '../ui/SectionTitle';

export function AdminFeedbackPage() {
  const session = useAuthStore((state) => state.session);
  const token = session?.token;
  const { data: feedback = [], isLoading } = useAdminFeedback(token);

  return (
    <section className="section section--page">
      <div className="container">
        <SectionTitle
          eyebrow="Admin"
          title="Feedback ricevuti dal sito"
          description="Qui trovi i commenti inviati dalla homepage, salvati dal form feedback della beta."
          className="section-title--wide"
        />

        {isLoading ? (
          <DogLoadingScreen
            title="Stiamo recuperando i feedback"
            description="Un attimo e carichiamo commenti, email e note ricevute dal sito."
            variant="page"
          />
        ) : null}

        <div className="account-grid seller-stats">
          <article className="panel account-card seller-stat-card">
            <Inbox size={22} />
            <div>
              <strong>{feedback.length}</strong>
              <p>Feedback salvati</p>
              <small>Totale note archiviate nel database</small>
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
        </div>

        <div className="results-list results-list--cards admin-feedback-list">
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
        </div>
      </div>
    </section>
  );
}
