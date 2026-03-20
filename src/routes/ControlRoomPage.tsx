import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Clock3,
  FolderSearch2,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useAdminOverview } from '../features/admin/admin.queries';
import { useAuthStore } from '../features/auth/auth.store';
import { SectionTitle } from '../ui/SectionTitle';

export function ControlRoomPage() {
  const session = useAuthStore((state) => state.session);
  const token = session?.token;
  const { data, isLoading, isError } = useAdminOverview(token);

  const summaryCards = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      {
        label: 'Annunci totali',
        value: String(data.stats.totalListings),
        description: `${data.stats.publishedListings} pubblicati, ${data.stats.listingsInReview} in revisione`,
        icon: BarChart3,
      },
      {
        label: 'Coda moderazione',
        value: String(data.stats.listingsInReview),
        description: `Piu vecchio da ${data.stats.pendingReviewOldestDays} giorni`,
        icon: Clock3,
      },
      {
        label: 'Account professionali',
        value: String(data.stats.totalProfessionalAccounts),
        description: `${data.stats.breederAccounts} allevatori, ${data.stats.shelterAccounts} rifugi`,
        icon: Users,
      },
      {
        label: 'Tasso pubblicazione',
        value: `${data.stats.publicationRate}%`,
        description: `${data.stats.publishedListings} annunci live`,
        icon: BadgeCheck,
      },
    ];
  }, [data]);

  if (isLoading) {
    return (
      <section className="section section--page">
        <div className="container empty-state">
          <h3>Stiamo caricando il profilo amministrativo</h3>
          <p>Recuperiamo overview, KPI e stato generale del marketplace.</p>
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section className="section section--page">
        <div className="container empty-state">
          <h3>Profilo amministrativo non disponibile</h3>
          <p>Non siamo riusciti a recuperare i dati amministrativi in questo momento.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section section--page">
      <div className="container">
        <SectionTitle
          eyebrow="CEO / Admin"
          title="Profilo amministrativo AdFido"
          description="Overview pulita del controllo piattaforma, con accesso separato alla moderazione annunci e all inventory amministrativo."
          className="section-title--wide"
        />

        <div className="dashboard-grid dashboard-grid--balanced">
          <article className="panel dashboard-bridge">
            <div className="dashboard-bridge__header">
              <div>
                <span className="dashboard-bridge__eyebrow">Profilo admin</span>
                <h3>Dashboard amministrativa e moderazione sono separate</h3>
              </div>
              <ShieldCheck size={20} />
            </div>
            <p>
              Qui tieni la vista alta sul prodotto. Le richieste di approvazione annunci e l
              inventory si aprono in una pagina dedicata, piu adatta a lavorare su molti annunci
              senza rumore visivo.
            </p>
            <div className="chip-row">
              <span className="chip">CEO / Admin</span>
              <span className="chip">{data.stats.totalListings} annunci monitorati</span>
            </div>
            <Link className="button button--secondary dashboard-bridge__cta" to="/admin/inventory">
              <FolderSearch2 size={18} />
              Apri moderazione annunci
            </Link>
          </article>

          <article className="panel dashboard-bridge dashboard-bridge--soft">
            <div className="dashboard-bridge__header">
              <div>
                <span className="dashboard-bridge__eyebrow">Accessi</span>
                <h3>Collegamenti amministrativi principali</h3>
              </div>
              <Users size={20} />
            </div>
            <div className="dashboard-bridge__list">
              <div>
                <strong>Profilo personale</strong>
                <span>Dati account e impostazioni amministrative</span>
              </div>
              <div>
                <strong>Moderazione annunci</strong>
                <span>Ricerca, triage warned / ok e dettaglio on-demand</span>
              </div>
              <div>
                <strong>Marketplace monitorato</strong>
                <span>{data.stats.totalListings} schede sotto controllo</span>
              </div>
            </div>
          </article>
        </div>

        <div className="account-grid">
          {summaryCards.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="panel account-card">
                <Icon size={22} />
                <div>
                  <strong>{item.value}</strong>
                  <p>{item.label}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="dashboard-shell">
          <aside className="panel dashboard-sidebar">
            <div className="dashboard-panel__header dashboard-panel__header--stacked">
              <div>
                <h3>Ingressi rapidi</h3>
                <p>Scorciatoie pulite per le due aree centrali del ruolo amministrativo.</p>
              </div>
            </div>
            <div className="dashboard-bridge__list">
              <div>
                <strong>Moderazione annunci</strong>
                <span>{data.stats.listingsInReview} annunci in revisione</span>
              </div>
              <div>
                <strong>Inventory amministrativo</strong>
                <span>{data.stats.totalListings} schede gestite</span>
              </div>
              <div>
                <strong>Utenti finali</strong>
                <span>{data.stats.userAccounts} account registrati</span>
              </div>
            </div>
            <Link className="button button--secondary dashboard-bridge__cta" to="/admin/inventory">
              <FolderSearch2 size={18} />
              Vai a richieste e inventory
            </Link>
            <Link className="button button--ghost dashboard-bridge__cta" to="/account">
              <ArrowRight size={18} />
              Apri profilo personale
            </Link>
          </aside>

          <div className="dashboard-main">
            <div className="dashboard-grid">
              <article className="panel account-card">
                <Activity size={20} />
                <div>
                  <strong>{data.stats.averageCompletenessScore}/100</strong>
                  <p>Completezza media schede</p>
                </div>
              </article>
              <article className="panel account-card">
                <BarChart3 size={20} />
                <div>
                  <strong>{data.stats.averageImagesPerListing}</strong>
                  <p>Immagini medie per annuncio</p>
                </div>
              </article>
              <article className="panel account-card">
                <ShieldCheck size={20} />
                <div>
                  <strong>{data.stats.publishedListings}</strong>
                  <p>Annunci live</p>
                </div>
              </article>
              <article className="panel account-card">
                <Users size={20} />
                <div>
                  <strong>{data.stats.userAccounts}</strong>
                  <p>Utenti finali registrati</p>
                </div>
              </article>
            </div>

            <article className="panel">
              <div className="dashboard-panel__header dashboard-panel__header--stacked">
                <div>
                  <h3>Attivita recente</h3>
                  <p>Segnali operativi sintetici, senza aprire subito le schede singole.</p>
                </div>
                <span className="chip">{data.recentActivity.length} movimenti</span>
              </div>
              <div className="dashboard-bridge__list">
                {data.recentActivity.slice(0, 6).map((activity) => (
                  <div key={activity.id}>
                    <strong>{activity.title}</strong>
                    <span>
                      {activity.ownerName} · {activity.accountLabel} ·{' '}
                      {new Date(activity.updatedAt).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
