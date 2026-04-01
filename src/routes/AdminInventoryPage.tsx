import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Search, ShieldAlert, Trash2, Undo2, XCircle } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';

import { useAdminListings, useModerateAdminListing } from '../features/admin/admin.queries';
import type { AdminManagedListing, AdminModerationAction } from '../features/admin/admin.types';
import { useAuthStore } from '../features/auth/auth.store';
import { useToast } from '../features/toasts/useToast';
import { DogLoadingScreen } from '../ui/DogLoadingScreen';
import { SectionTitle } from '../ui/SectionTitle';

const statusOptions = [
  { value: 'all', label: 'Tutti gli stati' },
  { value: 'in_review', label: 'In review' },
  { value: 'published', label: 'Pubblicati' },
  { value: 'rejected', label: 'Respinti' },
  { value: 'removed', label: 'Rimossi' },
  { value: 'draft', label: 'Bozze' },
] as const;

type StatusFilter = (typeof statusOptions)[number]['value'];

const statusLabels = {
  draft: 'Bozza',
  in_review: 'In revisione',
  published: 'Pubblicato',
  rejected: 'Respinto',
  removed: 'Rimosso',
} as const;

function getStatusChipClass(status: AdminManagedListing['status']) {
  return `chip chip--status chip--status-${status}`;
}

function formatDate(value?: string) {
  if (!value) {
    return 'Non disponibile';
  }

  return new Date(value).toLocaleString('it-IT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildSearchHaystack(listing: AdminManagedListing) {
  return [
    listing.title,
    listing.breed,
    listing.city,
    listing.region,
    listing.owner?.name,
    listing.owner?.organizationName,
    listing.owner?.email,
    listing.moderationNotes,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function getAvailableActions(status: AdminManagedListing['status']) {
  const actions: AdminModerationAction[] = [];

  if (status === 'in_review') {
    actions.push('approve', 'reject', 'remove');
    return actions;
  }

  if (status === 'published') {
    actions.push('remove');
  }

  if (status === 'rejected' || status === 'removed' || status === 'published') {
    actions.push('restore_review');
  }

  return actions;
}

function getActionMeta(action: AdminModerationAction) {
  if (action === 'approve') {
    return {
      label: 'Approva',
      toneClass: 'admin-action-button--approve',
      icon: CheckCircle2,
      successTitle: 'Annuncio approvato',
      successDescription: 'La scheda e stata pubblicata correttamente.',
    };
  }

  if (action === 'reject') {
    return {
      label: 'Respingi',
      toneClass: 'admin-action-button--reject',
      icon: XCircle,
      successTitle: 'Annuncio respinto',
      successDescription: 'La scheda e tornata fuori dalla pubblicazione.',
    };
  }

  if (action === 'remove') {
    return {
      label: 'Rimuovi',
      toneClass: 'admin-action-button--remove',
      icon: Trash2,
      successTitle: 'Annuncio rimosso',
      successDescription: 'La scheda e stata rimossa dall inventory pubblica.',
    };
  }

  return {
    label: 'Ripristina in review',
    toneClass: '',
    icon: Undo2,
    successTitle: 'Scheda ripristinata',
    successDescription: 'La scheda e tornata nella moderation queue.',
  };
}

type ListingRowProps = {
  listing: AdminManagedListing;
  isQueue: boolean;
  isOpen: boolean;
  noteValue: string;
  isPending: boolean;
  onToggle: () => void;
  onNoteChange: (value: string) => void;
  onAction: (action: AdminModerationAction) => void;
};

function ListingRow({
  listing,
  isQueue,
  isOpen,
  noteValue,
  isPending,
  onToggle,
  onNoteChange,
  onAction,
}: ListingRowProps) {
  const availableActions = getAvailableActions(listing.status);
  const ownerLabel = listing.owner?.organizationName || listing.owner?.name || 'Profilo non disponibile';

  return (
    <article
      className={`panel admin-surface admin-surface--section admin-listing-row ${isQueue ? 'admin-listing-row--queue' : 'admin-listing-row--inventory'}${isOpen ? ' admin-listing-row--open' : ''}`}
    >
      <div className="admin-listing-row__summary">
        <div className="admin-listing-row__header">
          <div className="admin-listing-row__main">
            {!isQueue ? <span className="admin-listing-row__eyebrow">Scheda inventory</span> : null}
            <div className="admin-listing-row__titleline">
              <strong>{listing.title}</strong>
              <span className={getStatusChipClass(listing.status)}>{statusLabels[listing.status]}</span>
            </div>
            <p>
              {listing.breed} - {listing.city}, {listing.region}
            </p>
            <div className="chip-row admin-listing-row__chips">
              <span className="chip chip--role">{listing.owner?.accountLabel ?? 'Profilo'}</span>
              <span className="chip chip--metric">{listing.mediaCount} media</span>
              <span className="chip chip--metric">{listing.completenessScore}% completezza</span>
              {listing.waitingDays > 0 ? <span className="chip chip--metric">{listing.waitingDays} gg in coda</span> : null}
            </div>
          </div>

          <div className="admin-listing-row__actions">
            <button
              type="button"
              className="button button--ghost admin-listing-row__toggle"
              onClick={onToggle}
              aria-expanded={isOpen}
            >
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {isOpen ? 'Chiudi console' : 'Apri console'}
            </button>
          </div>
        </div>

        <div className="admin-listing-row__meta">
          <div>
            <span>Pubblicante</span>
            <strong>{ownerLabel}</strong>
          </div>
          <div>
            <span>Ultimo update</span>
            <strong>{formatDate(listing.updatedAt)}</strong>
          </div>
          <div>
            <span>Review notes</span>
            <strong>{listing.moderationNotes || 'Nessuna nota salvata'}</strong>
          </div>
        </div>
      </div>

      {isOpen ? (
        <div className="admin-listing-row__detail">
          <div className={`admin-review-console ${isQueue ? 'admin-review-console--queue' : 'admin-review-console--inventory'}`}>
            <div className="admin-review-console__primary">
              <article className="admin-review-panel admin-review-panel--primary admin-review-console__hero">
                <div className="admin-review-console__media">
                  <img src={listing.coverImage || listing.images[0]} alt={listing.title} />
                </div>
                <div className="admin-review-console__content">
                  <div>
                    <span className="admin-review-console__label">Contenuto annuncio</span>
                    <strong>{listing.title}</strong>
                    <p>{listing.description}</p>
                  </div>
                  <div className="admin-review-console__facts">
                    <div>
                      <span className="admin-review-console__label">Excerpt</span>
                      <strong>{listing.excerpt}</strong>
                    </div>
                    <div>
                      <span className="admin-review-console__label">Dati cane</span>
                      <strong>
                        {listing.sex} - {listing.ageLabel} - {listing.color}
                      </strong>
                    </div>
                    <div>
                      <span className="admin-review-console__label">Tag</span>
                      <strong>{listing.tags.length > 0 ? listing.tags.join(', ') : 'Nessun tag'}</strong>
                    </div>
                    <div>
                      <span className="admin-review-console__label">Traits</span>
                      <strong>{listing.traits.length > 0 ? listing.traits.join(', ') : 'Nessun tratto'}</strong>
                    </div>
                  </div>
                </div>
              </article>

              <article className="admin-review-panel admin-review-panel--secondary">
                <span className="admin-review-console__label">Media e red flags</span>
                <div className="admin-review-panel__stack">
                  <div>
                    <strong>Gallery</strong>
                    <span>{listing.images.length} immagini collegate alla scheda</span>
                  </div>
                  <div>
                    <strong>Red flags</strong>
                    {listing.moderationFlags.length > 0 ? (
                      <div className="admin-review-flags">
                        {listing.moderationFlags.map((flag) => (
                          <span key={flag} className="admin-review-flag">
                            {flag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="admin-review-panel__empty">Nessuna criticita derivata dal payload attuale.</p>
                    )}
                  </div>
                </div>
              </article>
            </div>

            <div className="admin-review-console__sidebar">
              <article className="admin-review-panel admin-review-panel--secondary">
                <span className="admin-review-console__label">Pubblicante</span>
                <div className="admin-review-panel__stack">
                  <div>
                    <strong>{ownerLabel}</strong>
                    <span>{listing.owner?.accountLabel ?? 'Profilo'}</span>
                  </div>
                  <div>
                    <strong>{listing.owner?.email ?? 'Email non disponibile'}</strong>
                    <span>Email account</span>
                  </div>
                  <div>
                    <strong>{listing.owner?.phone || 'Telefono non impostato'}</strong>
                    <span>Contatto diretto</span>
                  </div>
                </div>
              </article>

              <article className="admin-review-panel admin-review-panel--secondary">
                <span className="admin-review-console__label">Nota admin</span>
                <label className="inventory-card__notes">
                  <textarea
                    value={noteValue}
                    onChange={(event) => onNoteChange(event.target.value)}
                    placeholder="Aggiungi una nota persistente per approvazione, rifiuto o ripristino."
                    rows={5}
                    disabled={isPending}
                  />
                </label>
              </article>

              <article className="admin-review-panel admin-review-panel--action admin-listing-row__moderation-actions">
                <span className="admin-review-console__label">Azioni finali</span>
                <div className="admin-review-flags">
                  {availableActions.map((action) => {
                    const meta = getActionMeta(action);
                    const Icon = meta.icon;

                    return (
                      <button
                        key={action}
                        type="button"
                        className={`button admin-action-button ${meta.toneClass}`.trim()}
                        disabled={isPending}
                        onClick={() => onAction(action)}
                      >
                        <Icon size={16} />
                        {isPending ? 'Operazione in corso...' : meta.label}
                      </button>
                    );
                  })}
                </div>
              </article>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function AdminInventoryPage() {
  const session = useAuthStore((state) => state.session);
  const token = session?.token;
  const { data: listings = [], isLoading, isError, error } = useAdminListings(token);
  const moderateListing = useModerateAdminListing(token);
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [openListingId, setOpenListingId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  useEffect(() => {
    setNoteDrafts((current) => {
      const next = { ...current };

      for (const listing of listings) {
        if (!(listing.id in next)) {
          next[listing.id] = listing.moderationNotes ?? '';
        }
      }

      return next;
    });
  }, [listings]);

  const moderationQueue = useMemo(
    () =>
      listings
        .filter((listing) => listing.status === 'in_review')
        .sort((left, right) => right.waitingDays - left.waitingDays),
    [listings]
  );

  const filteredInventory = useMemo(() => {
    return listings.filter((listing) => {
      const matchesStatus = statusFilter === 'all' ? true : listing.status === statusFilter;
      const matchesSearch =
        deferredQuery.length === 0 ? true : buildSearchHaystack(listing).includes(deferredQuery);

      return matchesStatus && matchesSearch;
    });
  }, [deferredQuery, listings, statusFilter]);

  const pendingListingId = moderateListing.isPending ? moderateListing.variables?.listingId : null;

  async function handleAction(listing: AdminManagedListing, action: AdminModerationAction) {
    const notes = noteDrafts[listing.id] ?? '';
    const meta = getActionMeta(action);

    try {
      const updatedListing = await moderateListing.mutateAsync({
        listingId: listing.id,
        action,
        notes,
      });

      setNoteDrafts((current) => ({
        ...current,
        [listing.id]: updatedListing.moderationNotes ?? notes,
      }));

      showToast({
        title: meta.successTitle,
        description: meta.successDescription,
        tone: 'success',
      });
    } catch (mutationError) {
      showToast({
        title: 'Operazione admin non riuscita',
        description:
          mutationError instanceof Error
            ? mutationError.message
            : 'Non siamo riusciti a completare la moderazione.',
        tone: 'error',
      });
    }
  }

  return (
    <section className="section section--page">
      <div className="container">
        <SectionTitle
          eyebrow="Admin"
          title="Inventory e moderation console"
          description="Coda review prioritaria, inventory completa e azioni amministrative con note persistite."
          className="section-title--wide"
        />

        <article className="panel admin-surface admin-surface--toolbar admin-toolbar">
          <div className="admin-search">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cerca per titolo, owner, email, citta o note"
            />
          </div>
          <div className="admin-filterbar">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`button ${statusFilter === option.value ? 'button--secondary' : 'button--ghost'}`}
                onClick={() => setStatusFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </article>

        {isLoading ? (
          <DogLoadingScreen
            title="Stiamo leggendo l inventory"
            description="Carichiamo queue, schede e note di moderazione dal backend."
            variant="page"
          />
        ) : null}

        {isError ? (
          <article className="panel empty-state">
            <ShieldAlert size={22} />
            <strong>Inventory admin non disponibile</strong>
            <p>{error instanceof Error ? error.message : 'Non siamo riusciti a recuperare le schede admin.'}</p>
          </article>
        ) : null}

        {!isLoading && !isError ? (
          <div className="admin-review-page">
            <section className="admin-review-section admin-review-section--queue">
              <div className="admin-review-section__header">
                <SectionTitle
                  eyebrow="Moderation queue"
                  title="Coda prioritaria"
                  description="Gli annunci in revisione vengono ordinati per attesa e completezza."
                />
              </div>
              <div className="admin-list admin-list--queue">
                {moderationQueue.length === 0 ? (
                  <article className="panel empty-state empty-state--inline">
                    <CheckCircle2 size={20} />
                    <strong>Nessuna scheda in review</strong>
                    <p>In questo momento la queue e vuota.</p>
                  </article>
                ) : (
                  moderationQueue.map((listing) => (
                    <ListingRow
                      key={`queue-${listing.id}`}
                      listing={listing}
                      isQueue
                      isOpen={openListingId === listing.id}
                      noteValue={noteDrafts[listing.id] ?? ''}
                      isPending={pendingListingId === listing.id}
                      onToggle={() => setOpenListingId((current) => (current === listing.id ? null : listing.id))}
                      onNoteChange={(value) =>
                        setNoteDrafts((current) => ({
                          ...current,
                          [listing.id]: value,
                        }))
                      }
                      onAction={(action) => void handleAction(listing, action)}
                    />
                  ))
                )}
              </div>
            </section>

            <section className="admin-review-section admin-review-section--inventory">
              <div className="admin-review-section__header admin-review-section__header--inventory">
                <SectionTitle
                  eyebrow="Inventory"
                  title="Elenco completo annunci"
                  description="Vista consultiva per stato, owner, note e contenuto reale della scheda."
                />
                <div className="admin-review-section__meta">
                  <span>{filteredInventory.length} schede visibili</span>
                  <span>{moderationQueue.length} in coda prioritaria</span>
                </div>
              </div>
              <div className="admin-list admin-list--inventory">
                {filteredInventory.length === 0 ? (
                  <article className="panel empty-state empty-state--inline admin-review-section__empty">
                    <AlertTriangle size={20} />
                    <strong>Nessuna scheda trovata</strong>
                    <p>Prova a cambiare ricerca o filtro stato.</p>
                  </article>
                ) : (
                  filteredInventory.map((listing) => (
                    <ListingRow
                      key={`inventory-${listing.id}`}
                      listing={listing}
                      isQueue={false}
                      isOpen={openListingId === listing.id}
                      noteValue={noteDrafts[listing.id] ?? ''}
                      isPending={pendingListingId === listing.id}
                      onToggle={() => setOpenListingId((current) => (current === listing.id ? null : listing.id))}
                      onNoteChange={(value) =>
                        setNoteDrafts((current) => ({
                          ...current,
                          [listing.id]: value,
                        }))
                      }
                      onAction={(action) => void handleAction(listing, action)}
                    />
                  ))
                )}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </section>
  );
}
