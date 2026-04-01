import { motion } from 'framer-motion';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import adfidoLogoTemporary from '../../assets/adfido-logo-temp.jpeg';
import type { ListingFilters } from '../types/marketplace';
import { LocationAutocompleteInput } from './LocationAutocompleteInput';
import { Reveal } from './motion';

const sexOptions: Array<ListingFilters['sex']> = ['all', 'Maschio', 'Femmina'];
const organizationOptions: Array<ListingFilters['organizationType']> = [
  'all',
  'Allevatore privato',
  'Canile / Rifugio',
  'Associazione',
];

type SearchFormValues = {
  keyword: string;
  location: string;
  sex: ListingFilters['sex'];
  organizationType: ListingFilters['organizationType'];
};

function buildFilterLabel(
  sex: ListingFilters['sex'],
  organizationType: ListingFilters['organizationType']
) {
  const parts: string[] = [];

  if (sex !== 'all') {
    parts.push(sex);
  }

  if (organizationType !== 'all') {
    parts.push(organizationType);
  }

  return parts.length > 0 ? parts.join(' · ') : 'Filtri';
}

export function SearchHero() {
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterAreaRef = useRef<HTMLDivElement | null>(null);
  const { register, handleSubmit, setValue, watch } = useForm<SearchFormValues>({
    defaultValues: {
      keyword: '',
      location: '',
      sex: 'all',
      organizationType: 'all',
    },
  });

  const locationValue = watch('location');
  const sexValue = watch('sex');
  const organizationTypeValue = watch('organizationType');

  const activeFiltersLabel = useMemo(
    () => buildFilterLabel(sexValue, organizationTypeValue),
    [organizationTypeValue, sexValue]
  );

  useEffect(() => {
    if (!filtersOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!filterAreaRef.current?.contains(event.target as Node)) {
        setFiltersOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFiltersOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [filtersOpen]);

  const onSubmit = handleSubmit((values) => {
    const params = new URLSearchParams();

    if (values.keyword) {
      params.set('keyword', values.keyword);
    }

    if (values.location) {
      params.set('location', values.location);
    }

    if (values.sex !== 'all') {
      params.set('sex', values.sex);
    }

    if (values.organizationType !== 'all') {
      params.set('organizationType', values.organizationType);
    }

    const query = params.toString();
    navigate(query ? `/listings?${query}` : '/listings');
  });

  return (
    <section className="hero hero--marketplace">
      <div className="hero__layout-shell">
        <div className="hero__content-safe">
          <Reveal className="hero__surface hero__surface--portal" y={28}>
            <div className="hero__surface-glow hero__surface-glow--one" />
            <div className="hero__surface-glow hero__surface-glow--two" />

            <div className="hero__portal-brand">
              <div className="hero__logo-badge hero__logo-badge--portal">
                <img src={adfidoLogoTemporary} alt="Logo temporaneo AdFido" />
              </div>
              <div className="hero__portal-brand-copy">
                <strong>AdFido</strong>
              </div>
            </div>

            <div className="hero__portal-support">
              <h1 className="hero__headline">
                Il tuo nuovo amico a 4 zampe e qui che ti aspetta!
              </h1>
            </div>

            <motion.form
              className="hero__portal-search"
              onSubmit={onSubmit}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, delay: 0.12 }}
            >
              <div className="hero__portal-searchbar">
                <label className="hero__portal-field hero__portal-field--keyword">
                  <span className="hero__portal-label">Ricerca</span>
                  <input
                    {...register('keyword')}
                    placeholder="Razza, nome, rifugio o allevamento"
                  />
                </label>

                <LocationAutocompleteInput
                  label="Localita"
                  value={locationValue}
                  placeholder="Milano, Lazio, Napoli..."
                  wrapperClassName="hero__portal-field hero__portal-field--location"
                  labelClassName="hero__portal-label"
                  showIcon={false}
                  onChange={(nextValue) => setValue('location', nextValue, { shouldDirty: true })}
                />

                <div className="hero__portal-filter" ref={filterAreaRef}>
                  <button
                    type="button"
                    className={`hero__filter-trigger${filtersOpen ? ' hero__filter-trigger--open' : ''}`}
                    onClick={() => setFiltersOpen((current) => !current)}
                    aria-expanded={filtersOpen}
                  >
                    <SlidersHorizontal size={18} />
                    <span>{activeFiltersLabel}</span>
                    <ChevronDown size={16} />
                  </button>

                  {filtersOpen ? (
                    <div className="hero__filter-popover">
                      <div className="hero__filter-group">
                        <span className="hero__filter-title">Sesso</span>
                        <div className="chip-row hero__filter-chip-row">
                          {sexOptions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className={`chip chip--button${
                                sexValue === option ? ' chip--selected' : ''
                              }`}
                              onClick={() => setValue('sex', option, { shouldDirty: true })}
                            >
                              {option === 'all' ? 'Tutti' : option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="hero__filter-group">
                        <span className="hero__filter-title">Organizzazione</span>
                        <div className="chip-row hero__filter-chip-row">
                          {organizationOptions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className={`chip chip--button${
                                organizationTypeValue === option ? ' chip--selected' : ''
                              }`}
                              onClick={() =>
                                setValue('organizationType', option, { shouldDirty: true })
                              }
                            >
                              {option === 'all' ? 'Tutte' : option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="button button--ghost hero__filter-reset"
                        onClick={() => {
                          setValue('sex', 'all', { shouldDirty: true });
                          setValue('organizationType', 'all', { shouldDirty: true });
                        }}
                      >
                        <X size={16} />
                        Reset filtri
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="hero__portal-action">
                  <button className="button button--primary" type="submit">
                    <Search size={18} />
                    Cerca
                  </button>
                </div>
              </div>
            </motion.form>

            <p className="hero__search-caption">
              Utilizza i filtri e trova il tuo Fido-Match, la famiglia si allarga!
            </p>
          </Reveal>

          <div className="hero__ad-row" aria-label="Spazi banner pubblicitari">
            <div className="hero__ad-slot hero__ad-slot--inline hero__ad-slot--inline-side">
              <span className="hero__ad-slot__eyebrow">ADV left</span>
              <strong>114 px</strong>
              <small>Banner laterale</small>
            </div>
            <div className="hero__ad-slot hero__ad-slot--inline hero__ad-slot--leaderboard">
              <div className="hero__ad-slot__meta">
                <span className="hero__ad-slot__eyebrow">ADV leaderboard</span>
                <strong>Area premium 1192 x 90</strong>
              </div>
              <small>
                Spazio adv subito sotto la hero, ad alta visibilita ma separato dalla ricerca.
              </small>
            </div>
            <div className="hero__ad-slot hero__ad-slot--inline hero__ad-slot--inline-side">
              <span className="hero__ad-slot__eyebrow">ADV right</span>
              <strong>114 px</strong>
              <small>Banner laterale</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
