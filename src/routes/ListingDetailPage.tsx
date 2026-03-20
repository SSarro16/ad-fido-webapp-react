import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Heart,
  Info,
  MapPin,
  Phone,
  Share2,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useFavoritesStore } from '../features/favorites/favorites.store';
import { useListing } from '../features/marketplace/marketplace.queries';
import { trackListingContactClick } from '../features/marketplace/marketplace.service';
import { useToast } from '../features/toasts/useToast';

export function ListingDetailPage() {
  const { listingId = '' } = useParams();
  const { data: listing, isLoading, isError } = useListing(listingId);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(listingId));
  const { showToast } = useToast();

  useEffect(() => {
    if (activeImageIndex === null || !listing) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveImageIndex(null);
      }

      if (event.key === 'ArrowRight') {
        setActiveImageIndex((current) =>
          current === null ? 0 : (current + 1) % listing.gallery.length
        );
      }

      if (event.key === 'ArrowLeft') {
        setActiveImageIndex((current) =>
          current === null ? 0 : (current - 1 + listing.gallery.length) % listing.gallery.length
        );
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeImageIndex, listing]);

  if (isLoading) {
    return (
      <section className="section section--page">
        <div className="container empty-state">
          <h3>Stiamo caricando l annuncio</h3>
          <p>Recuperiamo la scheda completa e la galleria, attendi un momento.</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="section section--page">
        <div className="container empty-state">
          <h3>Impossibile caricare l annuncio</h3>
          <p>Controlla la connessione o prova di nuovo tra qualche istante.</p>
          <Link to="/listings" className="button button--secondary">
            Torna agli annunci
          </Link>
        </div>
      </section>
    );
  }

  if (!listing) {
    return (
      <section className="section section--page">
        <div className="container empty-state">
          <h3>Annuncio non trovato</h3>
          <Link to="/listings" className="button button--secondary">
            Torna agli annunci
          </Link>
        </div>
      </section>
    );
  }

  const listingData = listing;
  const activeImage = activeImageIndex === null ? null : listingData.gallery[activeImageIndex];
  const currentImageIndex = activeImageIndex ?? 0;
  const isVerifiedShelter =
    listingData.organizationType === 'Canile / Rifugio' &&
    Boolean(listingData.organizationVerified);
  const organizationReviewCount = listingData.organizationReviewCount ?? 0;
  const organizationRatingLabel = listingData.organizationRating.toFixed(1).replace('.', ',');
  const summaryItems = [
    { label: 'Eta', value: listingData.ageLabel },
    { label: 'Sesso', value: listingData.sex },
    { label: 'Colore', value: listingData.color },
    { label: 'Localita', value: `${listingData.city}, ${listingData.region}` },
  ];

  async function handleRevealPhone() {
    setPhoneVisible(true);
    await trackListingContactClick(listingData.id);
  }

  async function handleShare() {
    const url = window.location.href;

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({
          title: `${listingData.name} - ${listingData.breed}`,
          text: `Guarda la scheda di ${listingData.name} su AdFido.`,
          url,
        });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        throw new Error('Condivisione non disponibile su questo dispositivo.');
      }

      showToast({
        title: 'Link pronto',
        description: 'La scheda e stata condivisa o copiata correttamente.',
        tone: 'success',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      showToast({
        title: 'Condivisione non riuscita',
        description:
          error instanceof Error
            ? error.message
            : 'Non siamo riusciti a condividere questa scheda.',
        tone: 'warning',
      });
    }
  }

  return (
    <section className="section section--page">
      <div className="container detail-page">
        <div className="detail-breadcrumbs">
          <Link to="/listings">Annunci</Link>
          <span>/</span>
          <span>{listingData.breed}</span>
          <span>/</span>
          <strong>{listingData.name}</strong>
        </div>

        <div className="detail-layout">
          <div className="detail-main">
            <article className="panel detail-overview">
              <div className="detail-header">
                <div>
                  <div className="detail-header__eyebrow">
                    <span className="pill">{listingData.organizationType}</span>
                    {isVerifiedShelter ? (
                      <span className="pill pill--verified">
                        <ShieldCheck size={14} />
                        Canile verificato
                      </span>
                    ) : null}
                  </div>
                  <h1>{listingData.name + ' - ' + listingData.breed}</h1>
                  <p>{listingData.excerpt}</p>
                </div>

                <div className="detail-actions">
                  <button
                    className="button button--ghost"
                    type="button"
                    onClick={() => toggleFavorite(listingData.id)}
                  >
                    <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                    {isFavorite ? 'Salvato' : 'Preferito'}
                  </button>
                  <button
                    className="button button--ghost"
                    type="button"
                    onClick={() => void handleShare()}
                  >
                    <Share2 size={18} />
                    Condividi
                  </button>
                </div>
              </div>

              <div className="detail-facts">
                <div>
                  <MapPin size={18} />
                  <span>
                    {listingData.city}, {listingData.region}
                  </span>
                </div>
                <div>
                  <ShieldCheck size={18} />
                  <span className="detail-facts__organization">
                    {listingData.organizationName}
                    {listingData.organizationVerified ? <ShieldCheck size={16} /> : null}
                  </span>
                </div>
                <div>
                  <Star size={18} />
                  <span>
                    {organizationRatingLabel} / 5
                    {organizationReviewCount > 0 ? ` · ${organizationReviewCount} recensioni` : ''}
                  </span>
                </div>
              </div>

              <div className="detail-summary">
                {summaryItems.map((item) => (
                  <article key={item.label} className="detail-summary__item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>
            </article>

            <article className="detail-gallery panel">
              <div className="detail-gallery__header">
                <div>
                  <span className="detail-sidebar__eyebrow">Galleria</span>
                  <strong>{listingData.gallery.length} foto disponibili</strong>
                </div>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => setActiveImageIndex(0)}
                >
                  Apri galleria
                </button>
              </div>

              <button
                type="button"
                className="detail-gallery__button detail-gallery__button--hero"
                onClick={() => setActiveImageIndex(0)}
              >
                <img
                  className="detail-gallery__hero"
                  src={listingData.gallery[0]}
                  alt={listingData.name}
                />
              </button>

              <div className="detail-gallery__grid">
                {listingData.gallery.slice(1).map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    className="detail-gallery__button"
                    onClick={() => setActiveImageIndex(index + 1)}
                  >
                    <img src={image} alt={`${listingData.name} ${index + 2}`} />
                  </button>
                ))}
              </div>
            </article>

            <div className="detail-content">
              <article className="panel detail-copy">
                <div className="detail-section__title">
                  <Info size={18} />
                  <h2>Descrizione</h2>
                </div>
                <p>{listingData.description}</p>
              </article>

              <article className="panel">
                <h2>Caratteristiche principali</h2>
                <div className="detail-specs">
                  <div>
                    <span>Razza</span>
                    <strong>{listingData.breed}</strong>
                  </div>
                  <div>
                    <span>Pubblicato da</span>
                    <strong>{listingData.organizationType}</strong>
                  </div>
                  <div>
                    <span>Profilo</span>
                    <strong>{listingData.organizationName}</strong>
                  </div>
                  <div>
                    <span>Contesto</span>
                    <strong>
                      {isVerifiedShelter ? 'Canile verificato' : 'Profilo professionale'}
                    </strong>
                  </div>
                </div>
              </article>

              <article className="panel">
                <h2>Punti chiave</h2>
                <div className="chip-row">
                  {listingData.tags.map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>

              <article className="panel">
                <h2>Temperamento</h2>
                <ul className="trait-list">
                  {listingData.traits.map((trait) => (
                    <li key={trait}>{trait}</li>
                  ))}
                </ul>
              </article>

              {isVerifiedShelter ? (
                <article className="panel shelter-profile">
                  <div className="shelter-profile__intro">
                    <div>
                      <span className="shelter-profile__eyebrow">Profilo canile verificato</span>
                      <h2>{listingData.organizationName}</h2>
                    </div>
                    <div className="shelter-profile__metrics">
                      <div>
                        <strong>{organizationRatingLabel}</strong>
                        <span>rating pubblico</span>
                      </div>
                      <div>
                        <strong>{organizationReviewCount || 'Ver.'}</strong>
                        <span>
                          {organizationReviewCount > 0 ? 'recensioni Google' : 'profilo reale'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shelter-profile__meta">
                    {listingData.organizationAddress ? (
                      <span>
                        <MapPin size={16} />
                        {listingData.organizationAddress}
                      </span>
                    ) : null}
                    <span>
                      <ShieldCheck size={16} />
                      Verifica visibile su annuncio e profilo del canile
                    </span>
                    {listingData.organizationReviewSourceLabel ? (
                      <span>
                        <Star size={16} />
                        {listingData.organizationReviewSourceLabel}
                      </span>
                    ) : null}
                    {listingData.organizationMapUrl ? (
                      <a href={listingData.organizationMapUrl} target="_blank" rel="noreferrer">
                        <ExternalLink size={16} />
                        Apri su Google Maps
                      </a>
                    ) : null}
                  </div>

                  {listingData.organizationMapEmbedUrl ? (
                    <div className="shelter-map">
                      <iframe
                        title={`Mappa ${listingData.organizationName}`}
                        src={listingData.organizationMapEmbedUrl}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  ) : null}
                </article>
              ) : null}

              {isVerifiedShelter && listingData.organizationReviews?.length ? (
                <article className="panel">
                  <div className="shelter-reviews__header">
                    <div>
                      <span className="shelter-profile__eyebrow">Recensioni pubbliche</span>
                      <h2>Cosa dicono del canile</h2>
                    </div>
                    <div className="shelter-reviews__score">
                      <Star size={18} />
                      <strong>{organizationRatingLabel}</strong>
                    </div>
                  </div>

                  <div className="shelter-reviews">
                    {listingData.organizationReviews.map((review) => (
                      <article
                        key={`${review.author}-${review.text.slice(0, 24)}`}
                        className="shelter-review-card"
                      >
                        <div className="shelter-review-card__topline">
                          <strong>{review.author}</strong>
                          <span>
                            <Star size={14} />
                            {review.rating.toFixed(1).replace('.0', '')}
                          </span>
                        </div>
                        {review.relativeTime ? <small>{review.relativeTime}</small> : null}
                        <p>{review.text}</p>
                        {review.sourceUrl ? (
                          <a href={review.sourceUrl} target="_blank" rel="noreferrer">
                            Leggi su Google Maps
                          </a>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </article>
              ) : null}
            </div>
          </div>

          <aside className="detail-sidebar panel">
            <div className="detail-sidebar__top">
              <span className="detail-sidebar__eyebrow">Pubblicante</span>
              <h3>{listingData.organizationName}</h3>
              <p>
                Contatto diretto collegato al profilo del pubblicante, pensato per far partire
                subito una richiesta seria.
              </p>
            </div>

            <div className="detail-sidebar__highlights">
              <div>
                <span>Tipologia</span>
                <strong>{listingData.organizationType}</strong>
              </div>
              <div>
                <span>Zona</span>
                <strong>{listingData.city}</strong>
              </div>
            </div>

            <div className="detail-sidebar__actions">
              <button
                className="button button--primary"
                type="button"
                onClick={() => void handleRevealPhone()}
              >
                <Phone size={18} />
                {phoneVisible ? listingData.phone : 'Mostra numero'}
              </button>

              {phoneVisible ? (
                <a
                  className="button button--secondary"
                  href={`tel:${listingData.phone.replace(/\s+/g, '')}`}
                >
                  Chiama ora
                </a>
              ) : (
                <Link to="/favorites" className="button button--secondary">
                  Vai ai preferiti
                </Link>
              )}
            </div>

            <div className="detail-sidebar__notes">
              <span>Affido</span>
              <p>
                Prima di procedere consigliamo sempre un contatto approfondito con il pubblicante
                per conoscere storia, carattere e compatibilita del cane.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {activeImage ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Galleria foto annuncio"
        >
          <button
            type="button"
            className="lightbox__backdrop"
            aria-label="Chiudi galleria"
            onClick={() => setActiveImageIndex(null)}
          />

          <div className="lightbox__panel">
            <div className="lightbox__header">
              <strong>
                {listingData.name +
                  ' - foto ' +
                  (currentImageIndex + 1) +
                  ' di ' +
                  listingData.gallery.length}
              </strong>
              <button
                type="button"
                className="lightbox__close"
                onClick={() => setActiveImageIndex(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="lightbox__stage">
              <button
                type="button"
                className="lightbox__nav"
                aria-label="Foto precedente"
                onClick={() =>
                  setActiveImageIndex((current) =>
                    current === null
                      ? 0
                      : (current - 1 + listingData.gallery.length) % listingData.gallery.length
                  )
                }
              >
                <ChevronLeft size={20} />
              </button>

              <div className="lightbox__image-frame">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={activeImage}
                    src={activeImage}
                    alt={`${listingData.name} ingrandita`}
                    className="lightbox__image"
                    initial={{ opacity: 0, x: 26, scale: 0.985 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -26, scale: 0.985 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  />
                </AnimatePresence>
              </div>

              <button
                type="button"
                className="lightbox__nav"
                aria-label="Foto successiva"
                onClick={() =>
                  setActiveImageIndex((current) =>
                    current === null ? 0 : (current + 1) % listingData.gallery.length
                  )
                }
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="lightbox__thumbs">
              {listingData.gallery.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  className={`lightbox__thumb${index === currentImageIndex ? ' lightbox__thumb--active' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={image} alt={`${listingData.name} miniatura ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
