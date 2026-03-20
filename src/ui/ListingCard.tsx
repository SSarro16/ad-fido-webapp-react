import { motion } from 'framer-motion';
import { Heart, MapPin, ShieldCheck, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useFavoritesStore } from '../features/favorites/favorites.store';
import type { Listing } from '../types/marketplace';

type ListingCardProps = {
  listing: Listing;
};

export function ListingCard({ listing }: ListingCardProps) {
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(listing.id));

  return (
    <motion.article
      className="listing-card"
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="listing-card__media">
        <img src={listing.heroImage} alt={`${listing.name} ${listing.breed}`} />
        <button
          type="button"
          className={`favorite-button${isFavorite ? ' favorite-button--active' : ''}`}
          onClick={() => toggleFavorite(listing.id)}
          aria-label={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="listing-card__body">
        <div className="listing-card__topline">
          <div>
            <h3>{listing.name}</h3>
            <p>{listing.breed}</p>
          </div>
          <span className="listing-card__age">{listing.ageLabel}</span>
        </div>

        <div className="listing-card__meta">
          <span>
            <MapPin size={16} />
            {listing.city}, {listing.region}
          </span>
          <span>
            <ShieldCheck size={16} />
            {listing.organizationType}
          </span>
          <span>
            <Star size={16} />
            {listing.organizationRating.toFixed(1)}
          </span>
        </div>

        <p className="listing-card__excerpt">{listing.excerpt}</p>

        <div className="listing-card__footer">
          <div>
            <strong className="listing-card__organization">
              {listing.organizationName}
              {listing.organizationVerified ? <ShieldCheck size={15} /> : null}
            </strong>
            <small>{listing.sex}</small>
          </div>
          <Link to={`/listings/${listing.id}`} className="button button--secondary">
            Vedi scheda
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
