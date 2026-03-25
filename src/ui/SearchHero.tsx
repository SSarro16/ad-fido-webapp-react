import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import type { HomePayload } from '../types/marketplace';
import { LocationAutocompleteInput } from './LocationAutocompleteInput';
import { Reveal, StaggerGrid, StaggerItem } from './motion';

type SearchFormValues = {
  keyword: string;
  location: string;
};

type SearchHeroProps = {
  stats: HomePayload['stats'];
  frequentSearches: HomePayload['frequentSearches'];
};

export function SearchHero({ stats, frequentSearches }: SearchHeroProps) {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch } = useForm<SearchFormValues>({
    defaultValues: {
      keyword: '',
      location: '',
    },
  });
  const locationValue = watch('location');

  const onSubmit = handleSubmit((values) => {
    const params = new URLSearchParams();

    if (values.keyword) {
      params.set('keyword', values.keyword);
    }

    if (values.location) {
      params.set('location', values.location);
    }

    navigate(`/listings?${params.toString()}`);
  });

  return (
    <section className="hero hero--marketplace">
      <div className="container hero__inner">
        <Reveal className="hero__copy" y={36}>
          <span className="hero__eyebrow">La ricerca giusta per l affido giusto</span>
          <h1>Trova cani, canili verificati e annunci in un unico posto.</h1>
          <p>
            Cerca per razza, rifugio, allevatore o zona e consulta schede complete prima di
            contattare chi pubblica.
          </p>

          <StaggerGrid className="hero__stats" delay={0.15}>
            {stats.map((stat) => (
              <StaggerItem key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
                {stat.note ? <small>{stat.note}</small> : null}
              </StaggerItem>
            ))}
          </StaggerGrid>
        </Reveal>

        <Reveal className="hero__panel hero__panel--search" delay={0.12} y={42} scale={0.985}>
          <div className="hero__panel-header">
            <span className="hero__panel-eyebrow">Inizia da qui</span>
            <h2>Cerca il cane giusto</h2>
            <p>Usa i filtri principali e parti dagli annunci che ti interessano davvero.</p>
          </div>

          <motion.form
            className="search-card"
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, delay: 0.15 }}
          >
            <label>
              Cosa stai cercando?
              <input {...register('keyword')} placeholder="Razza, nome, rifugio o allevamento" />
            </label>

            <LocationAutocompleteInput
              label="Dov'e"
              value={locationValue}
              placeholder="Milano, Lazio, Napoli..."
              onChange={(nextValue) => setValue('location', nextValue, { shouldDirty: true })}
            />

            <button className="button button--primary" type="submit">
              <Search size={18} />
              Cerca annunci
            </button>
          </motion.form>

          <div className="hero__presets">
            <span>Ricerche frequenti</span>
            <StaggerGrid className="chip-row" delay={0.2} stagger={0.05}>
              {frequentSearches.map((preset) => (
                <StaggerItem key={preset.label}>
                  <button
                    type="button"
                    className="chip chip--button"
                    onClick={() => {
                      setValue('keyword', preset.keyword);
                      setValue('location', preset.location);
                    }}
                  >
                    {preset.label}
                  </button>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
