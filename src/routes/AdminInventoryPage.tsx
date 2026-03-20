import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { useAdminOverview, useModerateAdminListing } from '../features/admin/admin.queries';
import { useAuthStore } from '../features/auth/auth.store';
import { useToast } from '../features/toasts/useToast';
import type { AdminManagedListing } from '../types/admin';
import type { ListingWorkflowStatus } from '../types/subscriber';
import { SectionTitle } from '../ui/SectionTitle';

const statusLabels: Record<ListingWorkflowStatus, string> = {
  draft: 'Bozza',
  in_review: 'In revisione',
  published: 'Pubblicato',
  rejected: 'Respinto',
  removed: 'Rimosso',
};

type HealthFilter = 'all' | 'warned' | 'ok';

function getListingFlags(listing: AdminManagedListing) {
  const flags: string[] = [];

  if ((listing.completenessScore ?? 0) < 85) {
    flags.push('Completezza sotto soglia');
  }

  if (listing.images.length < 3) {
    flags.push('Gallery ridotta');
  }

  if (listing.status === 'rejected') {
    flags.push('Scheda gia respinta');
  }

  if (listing.status === 'removed') {
    flags.push('Scheda rimossa');
  }

  if ((listing.waitingDays ?? 0) > 3) {
    flags.push('In coda da piu di 3 giorni');
  }

  if (!listing.owner.phone) {
    flags.push('Telefono non disponibile');
  }

  return flags;
}

function formatDate(value?: string) {
  if (!value) {
    return 'n.d.';
  }

  return new Date(value).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function matchesSearch(listing: AdminManagedListing, query: string) {
  const haystack = [
    listing.title,
    listing.breed,
    listing.city,
    listing.region,
    listing.owner.organizationName,
    listing.owner.accountLabel,
    listing.owner.email,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

function getListingHealth(listing: AdminManagedListing): HealthFilter {
  const hasStatusRisk =
    listing.status === 'in_review' || listing.status === 'rejected' || listing.status === 'removed';
  const hasContentRisk = (listing.completenessScore ?? 0) < 85 || listing.images.length < 3;
  return hasStatusRisk || hasContentRisk ? 'warned' : 'ok';
}

type ListingRowProps = {
  listing: AdminManagedListing;
  expanded: boolean;
  note: string;
  busy: boolean;
  onToggle: () => void;
  onNoteChange: (value: string) => void;
  onModerate: (action: 'approve' | 'reject' | 'remove') => Promise<void>;
  mode: 'queue' | 'inventory';
};

function ListingRow({
  listing,
  expanded,
  note,
  busy,
  onToggle,
  onNoteChange,
  onModerate,
  mode,
}: ListingRowProps) {
  const health = getListingHealth(listing);
  const flags = getListingFlags(listing);

  return (
    <article
      className={`panel admin-listing-row admin-listing-row--${mode}${expanded ? ' admin-listing-row--open' : ''}`}
    >
      <div className="admin-listing-row__summary">
        <div className="admin-listing-row__header">
          <div className="admin-listing-row__main">
            <div className="admin-listing-row__titleline">
              <strong>{listing.title}</strong>
              <span className={`admin-health-badge admin-health-badge--${health}`}>
                {health === 'warned' ? 'Warned' : 'Ok'}
              </span>
            </div>
            <p>
              {listing.owner.organizationName} - {listing.owner.accountLabel} - {listing.city},{' '}
              {listing.region}
            </p>
          </div>

          <div className="admin-listing-row__actions">
            <button
              type="button"
              className="button button--ghost admin-listing-row__toggle"
              onClick={onToggle}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {expanded ? 'Chiudi dettaglio' : 'Apri dettaglio'}
            </button>
          </div>
        </div>

        <div className="chip-row admin-listing-row__chips">
          <span className="chip">{statusLabels[listing.status]}</span>
          <span className="chip">Score {listing.completenessScore ?? 0}/100</span>
          <span className="chip">{listing.images.length} immagini</span>
          {mode === 'queue' ? <span className="chip">{listing.waitingDays ?? 0} giorni</span> : null}
        </div>
      </div>

      {expanded ? (
        <div className="admin-listing-row__detail">
          <div className="admin-listing-row__meta">
            <div>
              <span>Aggiornato</span>
              <strong>{formatDate(listing.updatedAt)}</strong>
            </div>
            <div>
              <span>Owner</span>
              <strong>{listing.owner.organizationName}</strong>
            </div>
            {mode === 'queue' ? (
              <div>
                <span>Priorita coda</span>
                <strong>{(listing.waitingDays ?? 0) > 3 ? 'Alta' : 'Standard'}</strong>
              </div>
            ) : null}
          </div>

          <div className={`admin-review-console admin-review-console--${mode}`}>
            <section className="admin-review-console__primary">
              <div className="inventory-card__top admin-review-console__hero">
                <div className="inventory-card__media admin-review-console__media">
                  <img src={listing.coverImage} alt={listing.title} />
                </div>

                <div className="inventory-card__content admin-review-console__content">
                  <div>
                    <span className="admin-review-console__label">Sintesi annuncio</span>
                    <strong>{listing.title}</strong>
                    <p>{listing.excerpt}</p>
                  </div>

                  <div className="inventory-card__facts admin-review-console__facts">
                    <div>
                      <span>Razza</span>
                      <strong>{listing.breed}</strong>
                    </div>
                    <div>
                      <span>Localita</span>
                      <strong>
                        {listing.city}, {listing.region}
                      </strong>
                    </div>
                    <div>
                      <span>Pubblicante</span>
                      <strong>{listing.owner.organizationName}</strong>
                    </div>
                    <div>
                      <span>Contatto</span>
                      <strong>{listing.owner.email || 'n.d.'}</strong>
                    </div>
                    <div>
                      <span>Telefono</span>
                      <strong>{listing.owner.phone || 'n.d.'}</strong>
                    </div>
                    <div>
                      <span>Aggiornato</span>
                      <strong>{formatDate(listing.updatedAt)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="inventory-card__description">
                <span>Descrizione completa</span>
                <p>{listing.description}</p>
              </div>

              <div className="inventory-card__taxonomy">
                <div>
                  <span>Tag</span>
                  <div className="chip-row">
                    {listing.tags.map((tag) => (
                      <span key={tag} className="chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span>Tratti</span>
                  <div className="chip-row">
                    {listing.traits.map((trait) => (
                      <span key={trait} className="chip">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <aside className="admin-review-console__sidebar">
              <section className="admin-review-panel">
                <span className="admin-review-console__label">Dati pubblicante</span>
                <div className="admin-review-panel__stack">
                  <div>
                    <span>Organizzazione</span>
                    <strong>{listing.owner.organizationName}</strong>
                  </div>
                  <div>
                    <span>Ruolo</span>
                    <strong>{listing.owner.accountLabel}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{listing.owner.email || 'n.d.'}</strong>
                  </div>
                  <div>
                    <span>Telefono</span>
                    <strong>{listing.owner.phone || 'n.d.'}</strong>
                  </div>
                </div>
              </section>

              <section className="admin-review-panel">
                <span className="admin-review-console__label">Red flags</span>
                {flags.length > 0 ? (
                  <div className="admin-review-flags admin-review-flags--alert">
                    {flags.map((flag) => (
                      <span key={flag} className="admin-review-flag">
                        {flag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="admin-review-panel__empty">Nessun segnale critico rilevato su questa scheda.</p>
                )}
              </section>

              <label className="inventory-card__notes admin-review-panel">
                <span className="admin-review-console__label">Nota admin</span>
                <textarea
                  rows={6}
                  value={note}
                  onChange={(event) => onNoteChange(event.target.value)}
                  placeholder="Inserisci un giudizio chiaro per approvazione, blocco o rimozione."
                />
              </label>
            </aside>
          </div>

          <div className="managed-card__actions admin-listing-row__moderation-actions">
            {listing.status !== 'published' ? (
              <button
                type="button"
                className="button button--secondary admin-action-button admin-action-button--approve"
                disabled={busy}
                onClick={() => void onModerate('approve')}
              >
                <ShieldCheck size={16} />
                Pubblica
              </button>
            ) : null}
            {listing.status !== 'rejected' ? (
              <button
                type="button"
                className="button button--ghost admin-action-button admin-action-button--reject"
                disabled={busy}
                onClick={() => void onModerate('reject')}
              >
                <TriangleAlert size={16} />
                Blocca
              </button>
            ) : null}
            {listing.status !== 'removed' ? (
              <button
                type="button"
                className="button button--ghost admin-action-button admin-action-button--remove"
                disabled={busy}
                onClick={() => void onModerate('remove')}
              >
                <Trash2 size={16} />
                Rimuovi
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function AdminInventoryPage() {
  const session = useAuthStore((state) => state.session);
  const token = session?.token;
  const { data, isLoading, isError } = useAdminOverview(token);
  const moderateListing = useModerateAdminListing(token);
  const { showToast } = useToast();
  const [notesByListing, setNotesByListing] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [healthFilter, setHealthFilter] = useState<HealthFilter>('all');
  const [hiddenListingIds, setHiddenListingIds] = useState<string[]>([]);

  const moderationQueue = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.moderationQueue.filter(
      (listing) => !hiddenListingIds.includes(listing.id) && matchesSearch(listing, searchQuery)
    );
  }, [data, hiddenListingIds, searchQuery]);

  const inventory = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.listings.filter((listing) => {
      if (hiddenListingIds.includes(listing.id)) {
        return false;
      }

      if (listing.status === 'removed') {
        return false;
      }

      if (!matchesSearch(listing, searchQuery)) {
        return false;
      }

      return healthFilter === 'all' ? true : getListingHealth(listing) === healthFilter;
    });
  }, [data, healthFilter, hiddenListingIds, searchQuery]);

  async function handleModeration(
    listing: AdminManagedListing,
    action: 'approve' | 'reject' | 'remove'
  ) {
    const note = notesByListing[listing.id] ?? listing.adminNotes ?? '';

    if (
      action === 'remove' &&
      !window.confirm(`Vuoi rimuovere "${listing.title}" dall inventory amministrativo?`)
    ) {
      return;
    }

    try {
      const next = await moderateListing.mutateAsync({
        listingId: listing.id,
        action,
        notes: note,
      });

      if (action === 'remove' || next.status === 'removed') {
        setHiddenListingIds((current) =>
          current.includes(listing.id) ? current : [...current, listing.id]
        );
        setExpandedId((current) => (current === listing.id ? null : current));
      }

      showToast({
        title:
          action === 'approve'
            ? 'Annuncio pubblicato'
            : action === 'reject'
              ? 'Annuncio bloccato'
              : 'Annuncio rimosso',
        description:
          action === 'approve'
            ? 'La scheda e ora visibile nel marketplace.'
            : action === 'reject'
              ? 'La scheda e stata respinta con nota amministrativa.'
              : 'La scheda e stata rimossa dall inventory pubblico.',
        tone: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Moderazione non riuscita',
        description:
          error instanceof Error
            ? error.message
            : 'Non siamo riusciti a completare la moderazione.',
        tone: 'error',
      });
    }
  }

  if (isLoading) {
    return (
      <section className="section section--page">
        <div className="container empty-state">
          <h3>Stiamo caricando moderazione e inventory</h3>
          <p>Recuperiamo richieste approvazione, inventory e stato annunci.</p>
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section className="section section--page">
        <div className="container empty-state">
          <h3>Moderazione non disponibile</h3>
          <p>Non siamo riusciti a recuperare i dati amministrativi in questo momento.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section section--page">
      <div className="container">
        <SectionTitle
          eyebrow="Moderazione annunci"
          title="Moderazione annunci e inventory amministrativo"
          description="Ricerca rapida, scrematura warned / ok e dettaglio on-demand per controllare ogni scheda solo quando serve."
          className="section-title--wide"
        />

        <div className="panel admin-toolbar">
          <label className="admin-search">
            <Search size={18} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cerca per titolo, razza, localita, email o pubblicante"
            />
          </label>

          <div className="admin-filterbar">
            <button
              type="button"
              className={`button ${healthFilter === 'all' ? 'button--secondary' : 'button--ghost'}`}
              onClick={() => setHealthFilter('all')}
            >
              Tutti
            </button>
            <button
              type="button"
              className={`button ${healthFilter === 'warned' ? 'button--secondary' : 'button--ghost'}`}
              onClick={() => setHealthFilter('warned')}
            >
              <TriangleAlert size={16} />
              Warned
            </button>
            <button
              type="button"
              className={`button ${healthFilter === 'ok' ? 'button--secondary' : 'button--ghost'}`}
              onClick={() => setHealthFilter('ok')}
            >
              <CheckCircle2 size={16} />
              Ok
            </button>
          </div>
        </div>

        <div className="dashboard-grid dashboard-grid--balanced admin-review-layout">
          <article className="panel dashboard-bridge">
            <div className="dashboard-bridge__header">
              <div>
                <span className="dashboard-bridge__eyebrow">Coda review</span>
                <h3>Richieste di approvazione annunci</h3>
              </div>
              <ShieldCheck size={20} />
            </div>
            <p>
              Area dedicata alle schede in revisione, con accesso rapido al dettaglio solo quando
              serve davvero.
            </p>
            <div className="chip-row">
              <span className="chip">{moderationQueue.length} richieste visibili</span>
              <span className="chip">
                {data.stats.pendingReviewOldestDays} giorni massimi in coda
              </span>
            </div>
            <div className="admin-list admin-list--queue">
              {moderationQueue.length === 0 ? (
                <div className="empty-state empty-state--inline">
                  <h3>Nessuna richiesta trovata</h3>
                  <p>Prova a cambiare ricerca oppure attendi nuove schede in revisione.</p>
                </div>
              ) : (
                moderationQueue.map((listing) => (
                  <ListingRow
                    key={listing.id}
                    listing={listing}
                    expanded={expandedId === listing.id}
                    note={notesByListing[listing.id] ?? listing.adminNotes ?? ''}
                    busy={moderateListing.isPending}
                    mode="queue"
                    onToggle={() =>
                      setExpandedId((current) => (current === listing.id ? null : listing.id))
                    }
                    onNoteChange={(value) =>
                      setNotesByListing((current) => ({
                        ...current,
                        [listing.id]: value,
                      }))
                    }
                    onModerate={(action) => handleModeration(listing, action)}
                  />
                ))
              )}
            </div>
          </article>

          <article className="panel dashboard-bridge dashboard-bridge--soft">
            <div className="dashboard-bridge__header">
              <div>
                <span className="dashboard-bridge__eyebrow">Screening inventory</span>
                <h3>Inventory amministrativo filtrabile</h3>
              </div>
              <CheckCircle2 size={20} />
            </div>
            <div className="dashboard-bridge__list">
              <div>
                <strong>Risultati attuali</strong>
                <span>{inventory.length}</span>
              </div>
              <div>
                <strong>Warned</strong>
                <span>
                  {
                    data.listings.filter(
                      (listing) =>
                        listing.status !== 'removed' &&
                        !hiddenListingIds.includes(listing.id) &&
                        getListingHealth(listing) === 'warned'
                    ).length
                  }
                </span>
              </div>
              <div>
                <strong>Ok</strong>
                <span>
                  {
                    data.listings.filter(
                      (listing) =>
                        listing.status !== 'removed' &&
                        !hiddenListingIds.includes(listing.id) &&
                        getListingHealth(listing) === 'ok'
                    ).length
                  }
                </span>
              </div>
            </div>
          </article>
        </div>

        <article className="panel admin-inventory-panel">
          <div className="dashboard-panel__header">
            <div>
              <h3>Inventory completo</h3>
              <p>
                La scheda completa si apre solo su richiesta, per restare veloce anche con molti
                annunci.
              </p>
            </div>
            <span className="chip">{inventory.length} risultati</span>
          </div>

          <div className="admin-list admin-list--inventory">
            {inventory.length === 0 ? (
              <div className="empty-state empty-state--inline">
                <h3>Nessun annuncio trovato</h3>
                <p>Prova a cambiare ricerca o filtro per rivedere piu risultati.</p>
              </div>
            ) : (
              inventory.map((listing) => (
                <ListingRow
                  key={listing.id}
                  listing={listing}
                  expanded={expandedId === listing.id}
                  note={notesByListing[listing.id] ?? listing.adminNotes ?? ''}
                  busy={moderateListing.isPending}
                  mode="inventory"
                  onToggle={() =>
                    setExpandedId((current) => (current === listing.id ? null : listing.id))
                  }
                  onNoteChange={(value) =>
                    setNotesByListing((current) => ({
                      ...current,
                      [listing.id]: value,
                    }))
                  }
                  onModerate={(action) => handleModeration(listing, action)}
                />
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
