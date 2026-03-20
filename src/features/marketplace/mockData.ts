import { articleItems } from '../articles/articles.data';
import type { HomePayload, Listing } from '../../types/marketplace';

export const listings: Listing[] = [
  {
    id: 'luna-border-collie',
    name: 'Luna',
    breed: 'Border Collie',
    city: 'Milano',
    region: 'Lombardia',
    ageLabel: '5 mesi',
    sex: 'Femmina',
    color: 'Bianco e nero',
    organizationName: 'Cascina del Pastore',
    organizationType: 'Allevatore privato',
    organizationRating: 4.9,
    heroImage:
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=1200&q=80',
    ],
    excerpt: 'Intelligente, socializzata e pronta per una famiglia attiva.',
    description:
      'Luna vive in un contesto familiare con stimoli quotidiani, prime attivita di richiamo e gestione guinzaglio. Ideale per chi cerca una compagna brillante e collaborativa.',
    tags: ['Microchip', 'Vaccini', 'Pedigree'],
    traits: ['Energica', 'Affettuosa', 'Ottima con bambini'],
    sponsorLabel: 'Top breeder',
    phone: '+39 02 5555 0101',
  },
  {
    id: 'bruno-labrador',
    name: 'Bruno',
    breed: 'Labrador Retriever',
    city: 'San Giorgio Ionico',
    region: 'Puglia',
    ageLabel: '8 mesi',
    sex: 'Maschio',
    color: 'Miele',
    organizationName: 'Canile Sanitario di San Giorgio Jonico',
    organizationType: 'Canile / Rifugio',
    organizationVerified: true,
    organizationRating: 4.4,
    organizationReviewCount: 35,
    organizationReviewSourceLabel: 'Recensioni pubbliche Google Maps',
    organizationAddress: 'SS7 Ex, 70, 74027 San Giorgio Ionico TA',
    organizationCoordinates: {
      lat: 40.4697664,
      lng: 17.384987799999998,
    },
    organizationMapEmbedUrl:
      'https://www.google.com/maps?q=40.4697664,17.384987799999998&z=14&output=embed',
    organizationMapUrl:
      'https://maps.google.com/?cid=9313744457195395385&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA',
    organizationReviews: [
      {
        author: 'Valerio Leo',
        rating: 5,
        relativeTime: 'un anno fa',
        text: 'Bellissimo canile gestito da persone fantastiche e abbiamo adottato 2 spettacolari cuccioli di maremmano grazie di cuore.',
        sourceUrl:
          'https://www.google.com/maps/reviews/data=!4m6!14m5!1m4!2m3!1sChZDSUhNMG9nS0VJQ0FnSUR6Z3YzYkVnEAE!2m1!1s0x1346fb7e27263d2f:0x8141113ccbe51939',
      },
      {
        author: 'Simona Conte',
        rating: 5,
        relativeTime: '4 anni fa',
        text: 'Uno dei pochi canili del Sud Italia con livello di stress dei cani davvero basso. La gestione del benessere animale viene descritta come seria e competente.',
        sourceUrl:
          'https://www.google.com/maps/reviews/data=!4m6!14m5!1m4!2m3!1sChdDSUhNMG9nS0VJQ0FnSUM2bTU2bS1RRRAB!2m1!1s0x1346fb7e27263d2f:0x8141113ccbe51939',
      },
      {
        author: 'lucia destradis',
        rating: 5,
        relativeTime: '2 anni fa',
        text: 'Canile ben tenuto, volontari disponibili e attenti. Recensione molto positiva anche sul percorso di adozione.',
        sourceUrl:
          'https://www.google.com/maps/reviews/data=!4m6!14m5!1m4!2m3!1sChdDSUhNMG9nS0VJQ0FnSUNwMGVlcTh3RRAB!2m1!1s0x1346fb7e27263d2f:0x8141113ccbe51939',
      },
    ],
    heroImage:
      'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80',
    ],
    excerpt: 'Equilibrato, seguito da un canile verificato e pronto per un affido responsabile.',
    description:
      'Bruno arriva da un percorso di recupero seguito dal Canile Sanitario di San Giorgio Jonico. La scheda include localizzazione reale, badge verificato e reputazione pubblica del canile per dare piu fiducia a chi adotta.',
    tags: ['Sterilizzato', 'Visita veterinaria', 'Canile verificato'],
    traits: ['Socievole', 'Calmo in casa', 'Ottimo al guinzaglio'],
    phone: '+39 06 7777 2222',
  },
  {
    id: 'maya-carlino',
    name: 'Maya',
    breed: 'Carlino',
    city: 'Torino',
    region: 'Piemonte',
    ageLabel: '1 anno',
    sex: 'Femmina',
    color: 'Fulvo',
    organizationName: 'Le Colline Felici',
    organizationType: 'Allevatore privato',
    organizationRating: 4.7,
    heroImage:
      'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1525253086316-d0c936c814f8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
    ],
    excerpt: 'Piccola, dolce e adatta a chi desidera un cane da compagnia dal carattere stabile.',
    description:
      'Maya ha seguito un percorso di socializzazione con rumori domestici, bambini e brevi tragitti in auto. Perfetta per famiglie e per chi cerca una presenza tranquilla.',
    tags: ['Vaccini', 'Libretto sanitario', 'Supporto post-affido'],
    traits: ['Dolce', 'Adatta ad appartamento', 'Abituata ai bambini'],
    phone: '+39 011 4000 112',
  },
  {
    id: 'argo-pastore',
    name: 'Argo',
    breed: 'Pastore Tedesco',
    city: 'Bologna',
    region: 'Emilia-Romagna',
    ageLabel: '2 anni',
    sex: 'Maschio',
    color: 'Nero focato',
    organizationName: 'Associazione Zampa Libera',
    organizationType: 'Associazione',
    organizationRating: 4.6,
    heroImage:
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1529429617124-aee711a5ac1c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80',
    ],
    excerpt: 'Protettivo, leale e seguito da educatori: ideale per persone presenti e consapevoli.',
    description:
      'Argo e un cane strutturato, gestito con un piano educativo chiaro. Cerca una famiglia pronta a mantenere routine, attivita e continuita nelle regole.',
    tags: ['Educatore partner', 'Vaccini', 'Chip registrato'],
    traits: ['Leale', 'Vigile', 'Ama le passeggiate'],
    sponsorLabel: 'Sponsor',
    phone: '+39 051 8811 887',
  },
  {
    id: 'neve-samoyed',
    name: 'Neve',
    breed: 'Samoyed',
    city: 'Verona',
    region: 'Veneto',
    ageLabel: '7 mesi',
    sex: 'Femmina',
    color: 'Bianco',
    organizationName: 'Borgo degli Husky',
    organizationType: 'Allevatore privato',
    organizationRating: 5,
    heroImage:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80',
    ],
    excerpt: 'Vivace, scenografica e selezionata per un temperamento aperto e collaborativo.',
    description:
      'Neve cresce in un contesto con ampi spazi e routine di grooming. La scheda include consigli di gestione del mantello e supporto nei primi 60 giorni.',
    tags: ['Pedigree', 'Kit cucciolo', 'Supporto onboarding'],
    traits: ['Solare', 'Fotogenica', 'Ama il contatto umano'],
    phone: '+39 045 3100 731',
  },
  {
    id: 'rocky-beagle',
    name: 'Rocky',
    breed: 'Beagle',
    city: 'Napoli',
    region: 'Campania',
    ageLabel: '10 mesi',
    sex: 'Maschio',
    color: 'Tricolore',
    organizationName: 'Rifugio Marechiaro',
    organizationType: 'Canile / Rifugio',
    organizationRating: 4.5,
    heroImage:
      'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1529429617124-aee711a5ac1c?auto=format&fit=crop&w=1200&q=80',
    ],
    excerpt: 'Curioso, simpatico e gia abituato a vivere con altri cani.',
    description:
      'Rocky e perfetto per famiglie dinamiche che vogliono un cane giocoso ma gestibile. E gia inserito in sessioni di abituazione a casa e contesti sociali.',
    tags: ['Pronto per affido', 'Profilo comportamentale', 'Supporto rifugio'],
    traits: ['Curioso', 'Giocherellone', 'Buona socialita'],
    phone: '+39 081 9900 889',
  },
];

export const homePayload: HomePayload = {
  stats: [
    {
      label: 'Cani abbandonati ogni anno in Italia',
      value: '55.000',
    },
    {
      label: 'Ingressi annuali nei canili sanitari italiani',
      value: '100.000+',
    },
    {
      label: 'Cani che vivono per strada nel mondo',
      value: '200 milioni',
    },
  ],
  frequentSearches: [
    { label: 'Cuccioli a Milano', keyword: 'cucciolo', location: 'Milano' },
    { label: 'Rifugi nel Lazio', keyword: 'rifugio', location: 'Lazio' },
    { label: 'Border Collie', keyword: 'Border Collie', location: '' },
    { label: 'Piccola taglia', keyword: 'piccola taglia', location: '' },
  ],
  featuredListings: listings.slice(0, 4),
  editorial: articleItems.slice(0, 3),
};
