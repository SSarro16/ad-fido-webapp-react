import { Heart } from 'lucide-react';

import { useFavoritesStore } from '../features/favorites/favorites.store';
import { useFavoriteListings } from '../features/marketplace/marketplace.queries';
import { ListingCard } from '../ui/ListingCard';
import { SectionTitle } from '../ui/SectionTitle';

export function FavoritesPage() {
  const ids = useFavoritesStore((state) => state.ids);
  const { data } = useFavoriteListings(ids);

  return (
    <section className="section section--page">
      <div className="container">
        <SectionTitle
          eyebrow="Account area"
          title="Preferiti"
          description="Base pronta per l area privata V1, gia agganciata a uno store persistente."
        />

        {!ids.length ? (
          <div className="empty-state">
            <Heart size={28} />
            <h3>Nessun preferito salvato</h3>
            <p>Aggiungi qualche annuncio dalla lista o dalla scheda dettaglio.</p>
          </div>
        ) : (
          <div className="listing-grid">
            {data?.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
