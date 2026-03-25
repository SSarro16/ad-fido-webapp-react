import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Clock3,
  Dog,
  MapPin,
  PlayCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { articleItems } from '../features/articles/articles.data';
import { useHomePayload } from '../features/marketplace/marketplace.queries';
import { useToast } from '../features/toasts/useToast';
import type { Article } from '../types/marketplace';
import { ListingCard } from '../ui/ListingCard';
import { SearchHero } from '../ui/SearchHero';
import { SectionTitle } from '../ui/SectionTitle';
import { Reveal, StaggerGrid, StaggerItem } from '../ui/motion';

type EditorialCarouselProps = {
  items: Article[];
  title: string;
  eyebrow: ReactNode;
  tone?: 'default' | 'video';
};

type StageCard = {
  item: Article;
  position: 'left' | 'center' | 'right';
};

const contactDraftKey = 'adfido-contact-drafts';

type ContactDraft = {
  name: string;
  email: string;
  topic: string;
  audience: string;
  message: string;
  createdAt: string;
};

function getStageCards(items: Article[], activeIndex: number): StageCard[] {
  if (items.length === 0) {
    return [];
  }

  if (items.length === 1) {
    return [{ item: items[0], position: 'center' }];
  }

  if (items.length === 2) {
    const secondaryIndex = activeIndex === 0 ? 1 : 0;
    return [
      { item: items[secondaryIndex]!, position: 'left' },
      { item: items[activeIndex]!, position: 'center' },
    ];
  }

  const previousIndex = (activeIndex - 1 + items.length) % items.length;
  const nextIndex = (activeIndex + 1) % items.length;

  return [
    { item: items[previousIndex]!, position: 'left' },
    { item: items[activeIndex]!, position: 'center' },
    { item: items[nextIndex]!, position: 'right' },
  ];
}

function EditorialCarousel({ items, title, eyebrow, tone = 'default' }: EditorialCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex] ?? items[0];
  const stageCards = useMemo(() => getStageCards(items, activeIndex), [activeIndex, items]);

  if (!activeItem) {
    return null;
  }

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % items.length);
  };

  return (
    <section
      className={`home-editorial-band${tone === 'video' ? ' home-editorial-band--video' : ''}`}
    >
      <div className="container">
        <Reveal className="editorial-stage-shell" y={20}>
          <div className="editorial-stage__header">
            <div>
              <span
                className={`editorial-stage__eyebrow${tone === 'video' ? ' editorial-stage__eyebrow--video' : ''}`}
              >
                {eyebrow}
              </span>
              <h2>{title}</h2>
            </div>

            <div className="editorial-stage__arrows">
              <button
                type="button"
                className="editorial-stage__arrow"
                aria-label="Precedente"
                onClick={goToPrevious}
              >
                <ArrowLeft size={20} />
              </button>
              <button
                type="button"
                className="editorial-stage__arrow"
                aria-label="Successivo"
                onClick={goToNext}
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          <div className="editorial-stage">
            {stageCards.map(({ item, position }) => (
              <button
                key={`${position}-${item.id}`}
                type="button"
                className={`editorial-stage__card editorial-stage__card--${position}${
                  tone === 'video' ? ' editorial-stage__card--video' : ''
                }`}
                onClick={() => setActiveIndex(items.findIndex((entry) => entry.id === item.id))}
              >
                <div className="editorial-stage__card-media">
                  <img src={item.image} alt={item.title} />
                  <div className="editorial-stage__card-overlay" />
                </div>

                <div className="editorial-stage__card-body">
                  <span>{`${item.category} - ${item.readTime}`}</span>
                  <strong>{item.title}</strong>
                  <p>{item.source}</p>
                </div>
              </button>
            ))}
          </div>

          <div
            className={`editorial-stage__details${tone === 'video' ? ' editorial-stage__details--video' : ''}`}
          >
            <div className="editorial-stage__details-copy">
              <span>{items.length > 0 ? `${activeIndex + 1} / ${items.length}` : '0 / 0'}</span>
              <h3>{activeItem.title}</h3>
              <p>{activeItem.excerpt}</p>
              <div className="chip-row">
                {activeItem.highlights?.map((highlight) => (
                  <span key={highlight} className="chip">
                    {highlight}
                  </span>
                ))}
              </div>
            </div>

            <div className="editorial-stage__details-actions">
              <strong>{activeItem.source}</strong>
              {activeItem.url ? (
                <a
                  href={activeItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="button button--primary"
                >
                  {activeItem.ctaLabel ?? (tone === 'video' ? 'Apri video' : 'Apri articolo')}
                </a>
              ) : null}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function HomePage() {
  const { data } = useHomePayload();
  const { showToast } = useToast();
  const articles = articleItems.filter((item) => item.kind === 'article');
  const videos = articleItems.filter((item) => item.kind === 'video');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    topic: 'Pubblicazione annunci',
    audience: 'Privato interessato',
    message: '',
  });
  const [contactError, setContactError] = useState('');
  const [contactSuccess, setContactSuccess] = useState('');
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [contactDrafts, setContactDrafts] = useState<ContactDraft[]>([]);

  const pathways = [
    {
      icon: Dog,
      title: 'Cerca per tipo di cane',
      description:
        'Parti da razza, taglia, eta o carattere e confronta annunci con la stessa struttura.',
    },
    {
      icon: Building2,
      title: 'Esplora canili e strutture',
      description: 'Capisci subito chi pubblica, dove si trova e se il profilo e verificato.',
    },
    {
      icon: ShieldCheck,
      title: 'Valuta con piu fiducia',
      description: 'Mappe, recensioni e dettagli essenziali riducono rumore e improvvisazione.',
    },
  ];

  const trustBlocks = [
    {
      icon: Sparkles,
      title: 'Schede piu leggibili',
      description:
        'Ogni annuncio segue una gerarchia chiara, con informazioni utili prima di tutto.',
    },
    {
      icon: MapPin,
      title: 'Contesto reale',
      description:
        'Per i canili verificati mostriamo luogo, reputazione pubblica e segnali di affidabilita.',
    },
    {
      icon: Users,
      title: 'Percorsi separati',
      description: 'Utenti, allevatori e canili hanno aree e dashboard dedicate ai loro flussi.',
    },
  ];

  const professionalTypes = ['Allevatore privato', 'Canile / Rifugio'];
  const professionalBenefits = [
    {
      title: 'Pubblica i tuoi annunci',
      description:
        'Crea il profilo, inserisci i cani disponibili e gestisci tutto in modo piu semplice.',
    },
    {
      title: 'Fatti trovare meglio',
      description:
        'Presenti meglio la tua struttura o il tuo allevamento e dai piu fiducia a chi cerca.',
    },
  ];

  useEffect(() => {
    try {
      const storedDrafts = JSON.parse(
        window.localStorage.getItem(contactDraftKey) ?? '[]'
      ) as ContactDraft[];
      setContactDrafts(Array.isArray(storedDrafts) ? storedDrafts : []);
    } catch {
      setContactDrafts([]);
    }
  }, []);

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = contactForm.name.trim();
    const trimmedEmail = contactForm.email.trim();
    const trimmedMessage = contactForm.message.trim();

    if (trimmedName.length < 2) {
      setContactSuccess('');
      setContactError('Inserisci un nome valido prima di salvare la richiesta.');
      showToast({
        title: 'Dati incompleti',
        description: 'Inserisci un nome valido prima di salvare la richiesta.',
        tone: 'warning',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setContactSuccess('');
      setContactError('Inserisci un indirizzo email valido.');
      showToast({
        title: 'Email non valida',
        description: 'Controlla l indirizzo email prima di salvare la richiesta.',
        tone: 'warning',
      });
      return;
    }

    if (trimmedMessage.length < 12) {
      setContactSuccess('');
      setContactError('Scrivi un messaggio un po piu dettagliato.');
      showToast({
        title: 'Messaggio troppo breve',
        description: 'Aggiungi piu contesto prima di salvare la richiesta.',
        tone: 'warning',
      });
      return;
    }

    setContactError('');

    const draft: ContactDraft = {
      ...contactForm,
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
      createdAt: new Date().toISOString(),
    };

    let currentDrafts: ContactDraft[] = [];

    try {
      currentDrafts = JSON.parse(
        window.localStorage.getItem(contactDraftKey) ?? '[]'
      ) as ContactDraft[];
    } catch {
      currentDrafts = [];
    }

    const nextDrafts = [draft, ...currentDrafts].slice(0, 20);

    setIsSavingContact(true);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 280));
      window.localStorage.setItem(contactDraftKey, JSON.stringify(nextDrafts));
      setContactDrafts(nextDrafts);

      showToast({
        title: 'Richiesta salvata',
        description:
          'Abbiamo messo la tua richiesta in coda locale, pronta per l integrazione reale.',
        tone: 'success',
      });
      setContactSuccess('Richiesta salvata correttamente. La trovi nella coda locale del browser.');

      setContactForm({
        name: '',
        email: '',
        topic: 'Pubblicazione annunci',
        audience: 'Privato interessato',
        message: '',
      });
    } catch {
      setContactSuccess('');
      setContactError(
        'Non siamo riusciti a salvare la richiesta sul browser. Controlla privacy mode o spazio disponibile.'
      );
      showToast({
        title: 'Salvataggio non riuscito',
        description: 'Controlla modalita privacy del browser o spazio disponibile.',
        tone: 'error',
      });
    } finally {
      setIsSavingContact(false);
    }
  };

  if (!data) {
    return null;
  }

  return (
    <>
      <SearchHero stats={data.stats} frequentSearches={data.frequentSearches} />

      <section className="section section--tight section--after-hero">
        <div className="container home-chooser">
          <Reveal className="home-chooser__lead" y={18}>
            <span className="home-chooser__eyebrow">Percorsi principali</span>
            <h2>Una homepage piu chiara, costruita attorno a cosa vuoi fare davvero.</h2>
            <p>
              Parti dalla ricerca, capisci chi pubblica e arriva piu velocemente alle schede che
              contano.
            </p>
          </Reveal>

          <StaggerGrid className="home-chooser__grid" delay={0.05}>
            {pathways.map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.title}>
                  <article className="highlight-card home-chooser__card">
                    <div className="home-chooser__icon">
                      <Icon size={20} />
                    </div>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container home-trustband">
          <div className="home-trustband__copy">
            <span className="home-trustband__eyebrow">Perche AdFido</span>
            <h2>Un marketplace piu ordinato per ridurre confusione e aumentare fiducia.</h2>
          </div>

          <div className="home-trustband__grid">
            {trustBlocks.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="panel home-trustband__card">
                  <Icon size={20} />
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section--feature">
        <div className="container">
          <SectionTitle
            className="section-title--wide"
            eyebrow="In evidenza"
            title="Annunci da cui partire"
            description="Una selezione iniziale che mantiene lo stesso formato della lista annunci: stessa card, stessa gerarchia, stesso confronto."
          />

          <StaggerGrid className="listing-grid" delay={0.1}>
            {data.featuredListings.map((listing) => (
              <StaggerItem key={listing.id}>
                <ListingCard listing={listing} />
              </StaggerItem>
            ))}
          </StaggerGrid>

          <Reveal className="section__actions" delay={0.12}>
            <Link to="/listings" className="button button--secondary">
              Vai a tutti gli annunci
              <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container home-professional">
          <article className="panel home-professional__feature">
            <div className="home-professional__feature-copy">
              <span className="home-professional__eyebrow">Area professionale</span>
              <h2>Sei un allevatore privato o un canile / rifugio?</h2>
              <p>
                Crea il tuo account e comincia a pubblicare annunci in uno spazio pensato per
                profili professionali, con piu ordine, piu controllo e una presenza piu forte.
              </p>

              <div className="home-professional__benefits">
                {professionalBenefits.map((item) => (
                  <article key={item.title} className="home-professional__benefit">
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>

              <Link className="button button--primary" to="/register">
                Crea account
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="home-professional__showcase">
              {professionalTypes.map((item, index) => (
                <article
                  key={item}
                  className={`home-professional__type-card${
                    index === 1 ? ' home-professional__type-card--accent' : ''
                  }`}
                >
                  <strong>{item}</strong>
                  <p>
                    {index === 0
                      ? 'Perfetto per chi vuole raccontare bene cucciolate, disponibilita e contesto.'
                      : 'Ideale per affidi, annunci verificati e una presenza piu istituzionale.'}
                  </p>
                </article>
              ))}
            </div>
          </article>
        </div>
      </section>

      {articles.length > 0 ? (
        <EditorialCarousel
          items={articles}
          title="Articoli selezionati"
          eyebrow="Approfondimenti"
        />
      ) : null}

      {videos.length > 0 ? (
        <EditorialCarousel
          items={videos}
          title="Video da guardare"
          eyebrow={
            <>
              <PlayCircle size={16} />
              Video utili
            </>
          }
          tone="video"
        />
      ) : null}

      <section className="section section--contacts" id="contatti">
        <div className="container">
          <SectionTitle
            className="section-title--wide"
            eyebrow="Contatti"
            title="Partnership, richieste e attivazioni raccolte in modo piu ordinato"
            description="Niente contatti finti: qui raccogliamo interesse reale e prepariamo il passaggio a un backend completo."
          />

          <div className="contact-layout">
            <Reveal className="contact-stack" y={18}>
              <article className="panel contact-card contact-card--map">
                <div className="contact-card__icon">
                  <MapPin size={20} />
                </div>
                <strong>Presenza nazionale</strong>
                <p>
                  Progetto pensato per lavorare su piu citta italiane. Sede operativa e canali
                  ufficiali saranno pubblicati appena definiti.
                </p>
                <div className="contact-map">
                  <span>Nord Italia</span>
                  <span>Centro Italia</span>
                  <span>Sud Italia</span>
                  <span>Isole</span>
                </div>
              </article>

              <article className="panel contact-card">
                <div className="contact-card__icon">
                  <Sparkles size={20} />
                </div>
                <strong>Canali social in preparazione</strong>
                <p>
                  Identita, naming definitivo e pagine pubbliche arriveranno insieme alla
                  formalizzazione del brand.
                </p>
                <div className="contact-socials">
                  <span className="chip">Instagram in apertura</span>
                  <span className="chip">TikTok in apertura</span>
                  <span className="chip">YouTube in apertura</span>
                </div>
              </article>
            </Reveal>

            <Reveal className="panel contact-form-panel" delay={0.08} y={20}>
              <div className="contact-form-panel__header">
                <strong>Lascia la tua richiesta</strong>
                <p>
                  Compila il form in modo semplice e ordinato: per ora la richiesta viene salvata in
                  bozza sul browser.
                </p>
              </div>

              <div className="contact-form-panel__status">
                <article className="contact-status-card">
                  <span className="contact-status-card__label">Stato</span>
                  <strong>{isSavingContact ? 'Salvataggio in corso' : 'Coda locale attiva'}</strong>
                  <p>
                    {contactDrafts.length > 0
                      ? `${contactDrafts.length} richieste gia salvate in questo browser.`
                      : 'Nessuna richiesta salvata ancora in questo browser.'}
                  </p>
                </article>

                <article className="contact-status-card">
                  <span className="contact-status-card__label">Ultima voce</span>
                  <strong>{contactDrafts[0]?.topic ?? 'Nessuna richiesta ancora'}</strong>
                  <p>
                    {contactDrafts[0]
                      ? `${contactDrafts[0].audience} · ${new Date(contactDrafts[0].createdAt).toLocaleDateString('it-IT')}`
                      : 'Appena invii il form, comparira qui.'}
                  </p>
                </article>
              </div>

              <form className="contact-form" onSubmit={handleContactSubmit}>
                {contactSuccess ? (
                  <div className="auth-feedback auth-feedback--info">{contactSuccess}</div>
                ) : null}
                {contactError ? (
                  <div className="auth-feedback auth-feedback--error">{contactError}</div>
                ) : null}

                <div className="contact-form__grid">
                  <label>
                    Nome
                    <input
                      value={contactForm.name}
                      onChange={(event) => {
                        setContactError('');
                        setContactSuccess('');
                        setContactForm((current) => ({ ...current, name: event.target.value }));
                      }}
                      placeholder="Nome e cognome"
                      required
                    />
                  </label>

                  <label>
                    Email
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(event) => {
                        setContactError('');
                        setContactSuccess('');
                        setContactForm((current) => ({ ...current, email: event.target.value }));
                      }}
                      placeholder="tuoindirizzo@email.com"
                      required
                    />
                  </label>
                </div>

                <div className="contact-form__grid">
                  <label>
                    Chi sei
                    <select
                      value={contactForm.audience}
                      onChange={(event) => {
                        setContactError('');
                        setContactSuccess('');
                        setContactForm((current) => ({ ...current, audience: event.target.value }));
                      }}
                    >
                      <option>Privato interessato</option>
                      <option>Allevatore o canile</option>
                      <option>Partner o sponsor</option>
                      <option>Stampa o media</option>
                    </select>
                  </label>

                  <label>
                    Argomento
                    <select
                      value={contactForm.topic}
                      onChange={(event) => {
                        setContactError('');
                        setContactSuccess('');
                        setContactForm((current) => ({ ...current, topic: event.target.value }));
                      }}
                    >
                      <option>Pubblicazione annunci</option>
                      <option>Partnership</option>
                      <option>Supporto piattaforma</option>
                      <option>Richiesta informazioni</option>
                    </select>
                  </label>
                </div>

                <label>
                  Messaggio
                  <textarea
                    value={contactForm.message}
                    onChange={(event) => {
                      setContactError('');
                      setContactSuccess('');
                      setContactForm((current) => ({ ...current, message: event.target.value }));
                    }}
                    placeholder="Scrivi cosa ti serve, in che fase sei e come vorresti usare AdFido."
                    rows={5}
                    required
                  />
                </label>

                <div className="contact-form__footer">
                  <p className="contact-form__hint">
                    La bozza resta sul tuo browser finche non colleghiamo il form al backend reale.
                  </p>

                  <button
                    className="button button--primary"
                    type="submit"
                    disabled={isSavingContact}
                  >
                    {isSavingContact ? (
                      <Clock3 size={18} className="spin-icon" />
                    ) : (
                      <Send size={18} />
                    )}
                    {isSavingContact ? 'Salvataggio...' : 'Salva richiesta'}
                  </button>
                </div>
              </form>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
