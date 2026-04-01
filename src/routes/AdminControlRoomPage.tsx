import { Activity, ArrowRight, BookMarked, HeartHandshake, ShieldCheck, Siren, Stethoscope, Users, Warehouse } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAdminOverview } from '../features/admin/admin.queries';
import { useAuthStore } from '../features/auth/auth.store';
import { useAppHealth } from '../features/app/app.queries';
import { DogLoadingScreen } from '../ui/DogLoadingScreen';
import { SectionTitle } from '../ui/SectionTitle';

function formatDate(value: string) {
  return new Date(value).toLocaleString('it-IT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminControlRoomPage() {
  const session = useAuthStore((state) => state.session);
  const token = session?.token;
  const { data: overview, isLoading, isError, error } = useAdminOverview(token);
  const { data: appHealth } = useAppHealth();

  const kpiCards = overview
    ? [
        {
          label: 'Annunci totali',
          value: overview.listingCounts.total,
          note: `${overview.listingCounts.published} pubblicati`,
          icon: Warehouse,
        },
        {
          label: 'In review',
          value: overview.listingCounts.inReview,
          note:
            overview.health.oldestPendingReviewDays > 0
              ? `piu vecchio da ${overview.health.oldestPendingReviewDays} giorni`
              : 'nessun backlog critico',
          icon: ShieldCheck,
        },
        {
          label: 'Account professionali',
          value: overview.kpis.professionalAccounts,
          note: `${overview.userCounts.breeder} breeder - ${overview.userCounts.shelter} shelter`,
          icon: Users,
        },
        {
          label: 'Engagement base',
          value: overview.kpis.totalDetailViews,
          note: `${overview.kpis.totalContactClicks} click contatto`,
          icon: HeartHandshake,
        },
      ]
    : [];

  return (
    <section className="section section--page">
      <div className="container">
        <SectionTitle
          eyebrow="Admin"
          title="Control room AdFido v2.0.0"
          description="Panoramica operativa del sistema, queue di moderazione e stato salute della piattaforma."
          className="section-title--wide"
        />

        {isLoading ? (
          <DogLoadingScreen
            title="Stiamo aprendo la control room"
            description="Carichiamo KPI, queue e segnali operativi dal backend reale."
            variant="page"
          />
        ) : null}

        {isError ? (
          <article className="panel empty-state">
            <Siren size={22} />
            <strong>Control room non disponibile</strong>
            <p>{error instanceof Error ? error.message : 'Non siamo riusciti a leggere i dati admin.'}</p>
          </article>
        ) : null}

        {overview ? (
          <>
            <div className="admin-control-room">
              <article className="panel admin-surface admin-surface--hero admin-control-room__hero">
                <div className="admin-control-room__hero-copy">
                  <span className="dashboard-bridge__eyebrow">Expanded Operations Release</span>
                  <h2>Moderazione, inventory e segnali di salute in un unico spazio.</h2>
                  <p>
                    La control room tiene separati i flussi admin da quelli seller e ti porta
                    direttamente nella coda di lavoro quando serve intervenire.
                  </p>
                </div>
                <div className="admin-control-room__hero-actions">
                  <Link className="button button--primary" to="/admin/inventory">
                    Apri inventory e moderation
                    <ArrowRight size={18} />
                  </Link>
                  <Link className="button button--ghost" to="/admin/feedback">
                    Apri feedback sito
                    <BookMarked size={18} />
                  </Link>
                </div>
              </article>

              <article className="panel admin-surface admin-surface--secondary admin-control-room__health">
                <div className="admin-control-room__panel-header">
                  <div>
                    <span className="dashboard-bridge__eyebrow">Health</span>
                    <h3>Stato tecnico e operativo</h3>
                  </div>
                  <Stethoscope size={20} />
                </div>

                <div className="admin-health-grid">
                  <div>
                    <strong className={`admin-health-badge ${overview.health.ok ? 'admin-health-badge--ok' : 'admin-health-badge--warned'}`}>
                      {overview.health.ok ? 'Stabile' : 'Attenzione'}
                    </strong>
                    <span>Backlog review e completezza inventory</span>
                  </div>
                  <div>
                    <strong className={`admin-health-badge ${appHealth?.mapsConfigured ? 'admin-health-badge--ok' : 'admin-health-badge--warned'}`}>
                      {appHealth?.mapsConfigured ? 'Maps ok' : 'Maps off'}
                    </strong>
                    <span>Proxy localizzazione</span>
                  </div>
                  <div>
                    <strong>{overview.health.lowCompletenessListings}</strong>
                    <span>schede con completezza bassa</span>
                  </div>
                  <div>
                    <strong>{formatDate(overview.generatedAt)}</strong>
                    <span>ultimo snapshot</span>
                  </div>
                </div>
              </article>
            </div>

            <div className="account-grid seller-stats">
              {kpiCards.map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.label} className="panel account-card seller-stat-card admin-stat-card">
                    <Icon size={22} />
                    <div>
                      <strong>{item.value}</strong>
                      <p>{item.label}</p>
                      <small>{item.note}</small>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="dashboard-grid admin-control-room__grid">
              <article className="panel admin-surface admin-surface--section admin-control-room__queue">
                <div className="admin-control-room__panel-header">
                  <div>
                    <span className="dashboard-bridge__eyebrow">Queue snapshot</span>
                    <h3>Annunci in revisione</h3>
                  </div>
                  <Activity size={20} />
                </div>

                {overview.moderationQueue.length === 0 ? (
                  <div className="empty-state empty-state--inline">
                    <strong>Nessuna scheda in review</strong>
                    <p>La coda e vuota in questo momento.</p>
                  </div>
                ) : (
                  <div className="admin-queue-preview">
                    {overview.moderationQueue.map((listing) => (
                      <article key={listing.id} className="admin-queue-preview__item">
                        <div>
                          <strong>{listing.title}</strong>
                          <p>
                            {listing.owner?.organizationName || listing.owner?.name || 'Profilo non disponibile'}
                          </p>
                        </div>
                        <div className="chip-row">
                          <span className="chip chip--metric">{listing.waitingDays} gg</span>
                          <span className="chip chip--metric">{listing.completenessScore}% completezza</span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </article>

              <article className="panel admin-surface admin-surface--section admin-control-room__activity">
                <div className="admin-control-room__panel-header">
                  <div>
                    <span className="dashboard-bridge__eyebrow">Latest activity</span>
                    <h3>Ultimi movimenti inventory</h3>
                  </div>
                  <Warehouse size={20} />
                </div>

                <div className="admin-activity-list">
                  {overview.latestActivity.map((item) => (
                    <article key={item.id} className="admin-activity-list__item">
                      <div>
                        <strong>{item.listingTitle}</strong>
                        <p>
                          {item.ownerName} - {item.status}
                        </p>
                      </div>
                      <span>{formatDate(item.updatedAt)}</span>
                    </article>
                  ))}
                </div>
              </article>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
