import { useMemo } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { useListings } from '../features/marketplace/marketplace.queries';
import type { ListingFilters, ListingOrganizationType, ListingSex } from '../types/marketplace';
import { ListingCard } from '../ui/ListingCard';
import { LocationAutocompleteInput } from '../ui/LocationAutocompleteInput';
import { SectionTitle } from '../ui/SectionTitle';
import { SponsorCard } from '../ui/SponsorCard';
import { Reveal } from '../ui/motion';

const sexOptions: Array<ListingFilters['sex']> = ['all', 'Maschio', 'Femmina'];
const organizationOptions: Array<ListingFilters['organizationType']> = [
  'all',
  'Allevatore privato',
  'Canile / Rifugio',
  'Associazione',
];

function updateParams(currentParams: URLSearchParams, key: keyof ListingFilters, value: string) {
  const nextParams = new URLSearchParams(currentParams);

  if (!value || value === 'all') {
    nextParams.delete(key);
  } else {
    nextParams.set(key, value);
  }

  return nextParams;
}

export function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<ListingFilters>(
    () => ({
      keyword: searchParams.get('keyword') ?? '',
      location: searchParams.get('location') ?? '',
      sex: (searchParams.get('sex') as ListingSex | null) ?? 'all',
      organizationType:
        (searchParams.get('organizationType') as ListingOrganizationType | null) ?? 'all',
    }),
    [searchParams]
  );

  const { data } = useListings(filters);

  return (
    <section className="section section--page">
      <div className="container">
        <SectionTitle
          eyebrow="Ricerca"
          title="Annunci cani"
          description="Filtra gli annunci per parole chiave, localita, sesso e tipologia del profilo che pubblica."
        />

        <div className="marketplace-layout">
          <Reveal className="filters-panel" y={18}>
            <div className="filters-panel__title">
              <SlidersHorizontal size={18} />
              <strong>Filtri</strong>
            </div>

            <label>
              Cerca
              <input
                value={filters.keyword}
                placeholder="Border Collie, Milano, rifugio..."
                onChange={(event) =>
                  setSearchParams(updateParams(searchParams, 'keyword', event.target.value))
                }
              />
            </label>

            <LocationAutocompleteInput
              label="Localita"
              value={filters.location}
              placeholder="Milano, Lazio..."
              onChange={(nextValue) =>
                setSearchParams(updateParams(searchParams, 'location', nextValue))
              }
            />

            <div>
              <span className="filters-label">Sesso</span>
              <div className="chip-row">
                {sexOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`chip chip--button${filters.sex === option ? ' chip--selected' : ''}`}
                    onClick={() => setSearchParams(updateParams(searchParams, 'sex', option))}
                  >
                    {option === 'all' ? 'Tutti' : option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="filters-label">Organizzazione</span>
              <div className="chip-row">
                {organizationOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`chip chip--button${
                      filters.organizationType === option ? ' chip--selected' : ''
                    }`}
                    onClick={() =>
                      setSearchParams(updateParams(searchParams, 'organizationType', option))
                    }
                  >
                    {option === 'all' ? 'Tutte' : option}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="button button--ghost"
              onClick={() => setSearchParams({})}
            >
              <X size={16} />
              Reset filtri
            </button>
          </Reveal>

          <div className="results-column">
            <Reveal className="results-summary" y={18}>
              <strong>
                {data?.filter((item) => item.type === 'listing').length ?? 0} risultati
              </strong>
              <span>Ogni annuncio mostra le stesse informazioni principali per aiutarti a confrontarli meglio.</span>
            </Reveal>

            <div className="results-list results-list--cards">
              {data?.map((item) =>
                item.type === 'listing' ? (
                  <div key={item.listing.id}>
                    <ListingCard listing={item.listing} />
                  </div>
                ) : (
                  <div key={item.sponsorId} className="results-list__sponsor">
                    <SponsorCard title={item.title} body={item.body} />
                  </div>
                )
              )}

              {data?.length === 0 ? (
                <Reveal className="empty-state">
                  <h3>Nessun annuncio corrisponde ai filtri attuali.</h3>
                  <p>Prova ad allargare la localita o a rimuovere un filtro di organizzazione.</p>
                </Reveal>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
