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
import { env } from '../services/env';
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
const feedbackDraftKey = 'adfido-feedback-drafts';

type ContactDraft = {
  name: string;
  email: string;
  topic: string;
  audience: string;
  message: string;
  createdAt: string;
};

type FeedbackDraft = {
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

type ProfessionalTypeCard = {
  title: string;
  description: string;
  imageUrl: string;
  accent?: boolean;
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

type HomeFooterProps = {
  feedbackForm: {
    name: string;
    email: string;
    message: string;
  };
  feedbackDrafts: FeedbackDraft[];
  feedbackError: string;
  feedbackSuccess: string;
  isSavingFeedback: boolean;
  onFeedbackChange: (field: 'name' | 'email' | 'message', value: string) => void;
  onFeedbackSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function HomeFooter({
  feedbackForm,
  feedbackDrafts,
  feedbackError,
  feedbackSuccess,
  isSavingFeedback,
  onFeedbackChange,
  onFeedbackSubmit,
}: HomeFooterProps) {
  const footerGroups = [
    {
      title: 'Esplora AdFido',
      links: [
        { label: 'Annunci disponibili', to: '/listings' },
        { label: 'Articoli e guide', to: '/articles' },
        { label: 'Area personale', to: '/account' },
      ],
    },
    {
      title: 'Per professionisti',
      links: [
        { label: 'Crea account', to: '/register' },
        { label: 'Dashboard professionale', to: '/subscriber' },
        { label: 'Pubblica i tuoi annunci', to: '/register' },
      ],
    },
    {
      title: 'Contatti e roadmap',
      links: [
        { label: 'Manda feedback', to: '/#footer-feedback' },
        { label: 'Richieste e collaborazioni', to: '/#contatti' },
        { label: 'Contatti', to: '/#contatti' },
      ],
    },
  ];

  const footerHighlights = [
    'Link principali raccolti in un unico punto.',
    'Feedback e contatti sempre raggiungibili dalla homepage.',
    'Una chiusura piu semplice e piu leggibile.',
  ];

  return (
    <footer className="site-footer site-footer--home">
      <div className="container site-footer__shell">
        <div className="site-footer__hero">
          <div className="site-footer__brand">
            <span className="site-footer__eyebrow">AdFido v1.0.0</span>
            <strong>AdFido raccoglie annunci, articoli e contatti utili in un unico punto.</strong>
            <p>
              In fondo alla homepage trovi i collegamenti principali e uno spazio per lasciare un
              commento sul sito.
            </p>
          </div>

          <div className="site-footer__spotlight">
            <span className="site-footer__spotlight-label">Manda feedback</span>
            <strong>Se vuoi lasciare un commento sul sito, puoi farlo da qui.</strong>
            <p>
              Compila il form e invia il tuo feedback direttamente al team AdFido.
            </p>
            <div className="site-footer__spotlight-meta">
              <span>{feedbackDrafts.length} note salvate in questo browser</span>
              <span>simone.sarro@outlook.it</span>
            </div>
            <a className="site-footer__spotlight-action" href="#footer-feedback">
              Apri area feedback
              <ArrowRight size={18} />
            </a>
          </div>
        </div>

        <div className="site-footer__grid">
          {footerGroups.map((group) => (
            <section key={group.title} className="site-footer__column">
              <h3>{group.title}</h3>
              <div className="site-footer__links">
                {group.links.map((link) => (
                  <Link key={`${group.title}-${link.label}`} to={link.to}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>
          ))}

          <section className="site-footer__column site-footer__column--notes">
            <h3>In evidenza</h3>
            <div className="site-footer__notes">
              {footerHighlights.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </section>
        </div>

        <section className="site-footer__feedback" id="footer-feedback">
          <div className="site-footer__feedback-intro">
            <span className="site-footer__eyebrow">Note / Commenti</span>
            <h3>Lascia un feedback diretto sul sito</h3>
            <p>
              Se noti un problema o vuoi proporre un miglioramento, puoi scriverlo qui e inviarlo
              direttamente ad AdFido.
            </p>
          </div>

          <form className="site-footer__feedback-form" onSubmit={onFeedbackSubmit}>
            {feedbackSuccess ? (
              <div className="auth-feedback auth-feedback--info">{feedbackSuccess}</div>
            ) : null}
            {feedbackError ? (
              <div className="auth-feedback auth-feedback--error">{feedbackError}</div>
            ) : null}

            <div className="site-footer__feedback-grid">
              <label>
                Nome
                <input
                  value={feedbackForm.name}
                  onChange={(event) => onFeedbackChange('name', event.target.value)}
                  placeholder="Come ti chiami"
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={feedbackForm.email}
                  onChange={(event) => onFeedbackChange('email', event.target.value)}
                  placeholder="La tua email"
                />
              </label>
            </div>

            <label>
              Note / commenti
              <textarea
                value={feedbackForm.message}
                onChange={(event) => onFeedbackChange('message', event.target.value)}
                placeholder="Scrivi qui accorgimenti, problemi, miglioramenti o impressioni sul sito."
                rows={5}
              />
            </label>

            <div className="site-footer__feedback-actions">
              <p>
                Il messaggio viene inviato al team AdFido usando l email inserita nel form come
                riferimento per eventuali risposte.
              </p>

              <div className="site-footer__feedback-buttons">
                <button className="button button--primary" type="submit" disabled={isSavingFeedback}>
                  <Send size={18} />
                  {isSavingFeedback ? 'Invio in corso...' : 'Invia feedback'}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </footer>
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
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [feedbackDrafts, setFeedbackDrafts] = useState<FeedbackDraft[]>([]);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);

  const pathways = [
    {
      icon: Dog,
      title: 'Cerca per tipo di cane',
      description:
        'Parti da razza, taglia, eta o carattere e scorri gli annunci in modo piu rapido.',
    },
    {
      icon: Building2,
      title: 'Esplora canili e strutture',
      description: 'Controlla chi pubblica, dove si trova e se il profilo e verificato.',
    },
    {
      icon: ShieldCheck,
      title: 'Valuta con piu fiducia',
      description: 'Mappe, recensioni e dettagli utili ti aiutano a valutare meglio ogni annuncio.',
    },
  ];

  const trustBlocks = [
    {
      icon: Sparkles,
      title: 'Schede piu leggibili',
      description: 'Ogni annuncio mostra prima le informazioni principali, senza passaggi inutili.',
    },
    {
      icon: MapPin,
      title: 'Contesto reale',
      description: 'Per i canili verificati mostriamo posizione, recensioni e riferimenti utili.',
    },
    {
      icon: Users,
      title: 'Percorsi separati',
      description: 'Utenti, allevatori e canili hanno aree dedicate in base a quello che devono fare.',
    },
  ];

  const professionalTypes: ProfessionalTypeCard[] = [
    {
      title: 'Allevatore privato',
      description: 'Per chi pubblica cucciolate e disponibilita dal proprio allevamento.',
      imageUrl:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Canile / Rifugio',
      description: 'Per chi gestisce affidi, canili e rifugi.',
      imageUrl:
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80&sat=-15',
      accent: true,
    },
  ];
  const professionalBenefits = [
    {
      title: 'Pubblica i tuoi annunci',
      description:
        'Crea il profilo, inserisci i cani disponibili e aggiorna le schede da un unico pannello.',
    },
    {
      title: 'Fatti trovare meglio',
      description:
        'Mostra in modo chiaro la tua struttura o il tuo allevamento a chi sta cercando.',
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

  useEffect(() => {
    try {
      const storedFeedback = JSON.parse(
        window.localStorage.getItem(feedbackDraftKey) ?? '[]'
      ) as FeedbackDraft[];
      setFeedbackDrafts(Array.isArray(storedFeedback) ? storedFeedback : []);
    } catch {
      setFeedbackDrafts([]);
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

  const handleFeedbackSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = feedbackForm.message.trim();
    const trimmedName = feedbackForm.name.trim();
    const trimmedEmail = feedbackForm.email.trim();

    if (trimmedMessage.length < 8) {
      setFeedbackSuccess('');
      setFeedbackError('Scrivi un feedback un po piu chiaro prima di salvarlo.');
      showToast({
        title: 'Feedback troppo breve',
        description: 'Aggiungi un po piu contesto prima di salvare.',
        tone: 'warning',
      });
      return;
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFeedbackSuccess('');
      setFeedbackError('Se inserisci l email, deve essere valida.');
      showToast({
        title: 'Email non valida',
        description: 'Controlla l indirizzo email del feedback.',
        tone: 'warning',
      });
      return;
    }

    setFeedbackError('');
    setIsSavingFeedback(true);

    const draft: FeedbackDraft = {
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
      createdAt: new Date().toISOString(),
    };

    let currentDrafts: FeedbackDraft[] = [];

    try {
      currentDrafts = JSON.parse(
        window.localStorage.getItem(feedbackDraftKey) ?? '[]'
      ) as FeedbackDraft[];
    } catch {
      currentDrafts = [];
    }

    const nextDrafts = [draft, ...currentDrafts].slice(0, 20);

    try {
      const response = await fetch(`${env.apiBaseUrl}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error('Feedback API failed');
      }

      await new Promise((resolve) => window.setTimeout(resolve, 220));
      window.localStorage.setItem(feedbackDraftKey, JSON.stringify(nextDrafts));
      setFeedbackDrafts(nextDrafts);

      const emailDelivered = result?.emailDelivery?.delivered === true;

      setFeedbackSuccess(
        emailDelivered
          ? 'Feedback inviato correttamente. Il messaggio e arrivato ad AdFido e la tua email resta disponibile per eventuali risposte.'
          : 'Feedback ricevuto e salvato su AdFido. L invio email automatico non risulta ancora attivo.'
      );
      setFeedbackForm({ name: '', email: '', message: '' });
      showToast({
        title: emailDelivered ? 'Feedback inviato' : 'Feedback ricevuto',
        description: emailDelivered
          ? 'Il messaggio e stato salvato e inviato via email al team AdFido.'
          : 'Il messaggio e stato salvato, ma l email automatica non risulta ancora attiva.',
        tone: emailDelivered ? 'success' : 'info',
      });
    } catch {
      try {
        await new Promise((resolve) => window.setTimeout(resolve, 220));
        window.localStorage.setItem(feedbackDraftKey, JSON.stringify(nextDrafts));
        setFeedbackDrafts(nextDrafts);
        setFeedbackSuccess(
          'Non siamo riusciti a inviare il feedback al server. Lo abbiamo salvato solo in locale su questo browser.'
        );
        showToast({
          title: 'Invio non riuscito',
          description: 'Il backend non ha risposto, ma la nota resta disponibile su questo browser.',
          tone: 'info',
        });
      } catch {
        setFeedbackSuccess('');
        setFeedbackError('Non siamo riusciti a salvare il feedback ne online ne in locale.');
        showToast({
          title: 'Salvataggio non riuscito',
          description: 'Controlla privacy mode o disponibilita del backend.',
          tone: 'error',
        });
      }
    } finally {
      setIsSavingFeedback(false);
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
            <h2>Una homepage che ti aiuta a capire subito dove andare.</h2>
            <p>
              Parti dalla ricerca, controlla chi pubblica e apri le schede che ti interessano.
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
            <h2>Uno spazio piu semplice per cercare, confrontare e contattare.</h2>
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
            description="Una prima selezione di annunci con lo stesso formato che trovi nella lista completa."
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
                Crea il tuo account e pubblica gli annunci in un area riservata ai profili
                professionali.
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
              {professionalTypes.map((item) => (
                <article
                  key={item.title}
                  className={`home-professional__type-card${
                    item.accent ? ' home-professional__type-card--accent' : ''
                  }`}
                  style={{ backgroundImage: `url(${item.imageUrl})` }}
                >
                  <div className="home-professional__type-card-content">
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </div>
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
            title="Contatti, collaborazioni e richieste"
            description="Se vuoi contattarci per una collaborazione, per informazioni o per una richiesta specifica, qui trovi il riferimento giusto."
          />

          <div className="contact-layout">
            <Reveal className="contact-stack" y={18}>
              <article className="panel contact-card contact-card--map">
                <div className="contact-card__icon">
                  <MapPin size={20} />
                </div>
                <strong>A chi si rivolge AdFido</strong>
                <p>
                  AdFido mette insieme annunci e affidi per privati, allevatori, canili, rifugi e
                  realta che lavorano ogni giorno con i cani.
                </p>
                <div className="contact-map">
                  <span>Privati</span>
                  <span>Allevatori</span>
                  <span>Canili e rifugi</span>
                  <span>Partner</span>
                </div>
              </article>

              <article className="panel contact-card">
                <div className="contact-card__icon">
                  <Sparkles size={20} />
                </div>
                <strong>Quando scriverci</strong>
                <p>
                  Puoi usare questo spazio per domande, proposte di collaborazione o osservazioni
                  sul sito.
                </p>
                <div className="contact-socials">
                  <span className="chip">Feedback sul sito</span>
                  <span className="chip">Collaborazioni</span>
                  <span className="chip">Richieste generali</span>
                </div>
              </article>
            </Reveal>

            <Reveal className="panel contact-form-panel" delay={0.08} y={20}>
              <div className="contact-form-panel__header">
                <strong>Scrivici</strong>
                <p>
                  Compila il form e lascia il tuo messaggio. Ti aiuta a raccogliere tutto in modo
                  semplice anche durante questa fase di beta.
                </p>
              </div>

              <div className="contact-form-panel__status">
                <article className="contact-status-card">
                  <span className="contact-status-card__label">Stato form</span>
                  <strong>{isSavingContact ? 'Salvataggio in corso' : 'Pronto all invio'}</strong>
                  <p>
                    {contactDrafts.length > 0
                      ? `${contactDrafts.length} messaggi salvati in questo browser.`
                      : 'Nessun messaggio salvato in questo browser.'}
                  </p>
                </article>

                <article className="contact-status-card">
                  <span className="contact-status-card__label">Ultimo contatto</span>
                  <strong>{contactDrafts[0]?.topic ?? 'Nessun messaggio ancora'}</strong>
                  <p>
                    {contactDrafts[0]
                      ? `${contactDrafts[0].audience} · ${new Date(contactDrafts[0].createdAt).toLocaleDateString('it-IT')}`
                      : 'Comparira qui dopo il primo invio.'}
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
                    placeholder="Scrivi pure il motivo del contatto o il feedback che vuoi lasciare."
                    rows={5}
                    required
                  />
                </label>

                <div className="contact-form__footer">
                  <p className="contact-form__hint">
                    Il messaggio viene salvato in locale in questa fase beta, cosi non perdi il
                    contenuto anche se chiudi la pagina.
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
                    {isSavingContact ? 'Salvataggio...' : 'Invia messaggio'}
                  </button>
                </div>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      <HomeFooter
        feedbackForm={feedbackForm}
        feedbackDrafts={feedbackDrafts}
        feedbackError={feedbackError}
        feedbackSuccess={feedbackSuccess}
        isSavingFeedback={isSavingFeedback}
        onFeedbackChange={(field, value) => {
          setFeedbackError('');
          setFeedbackSuccess('');
          setFeedbackForm((current) => ({ ...current, [field]: value }));
        }}
        onFeedbackSubmit={handleFeedbackSubmit}
      />
    </>
  );
}
