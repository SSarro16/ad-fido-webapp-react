import type { ManagedListing } from '../../types/subscriber';

export const managedListingsSeed: ManagedListing[] = [
  {
    id: 'managed-luna',
    title: 'Luna',
    breed: 'Border Collie',
    city: 'Milano',
    region: 'Lombardia',
    ageLabel: '5 mesi',
    sex: 'Femmina',
    color: 'Bianco e nero',
    excerpt: 'Cucciola vivace e collaborativa, pronta a una famiglia attiva.',
    description: 'Scheda gia pubblicata, con immagini caricate e copertina assegnata.',
    tags: ['Microchip', 'Vaccini'],
    traits: ['Energica', 'Affettuosa'],
    images: [
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
    ],
    coverImage:
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    createdAt: '2026-03-16T18:30:00.000Z',
    updatedAt: '2026-03-18T18:30:00.000Z',
  },
  {
    id: 'managed-neve',
    title: 'Neve',
    breed: 'Samoyed',
    city: 'Verona',
    region: 'Veneto',
    ageLabel: '7 mesi',
    sex: 'Femmina',
    color: 'Bianco',
    excerpt: 'Profilo in rifinitura con immagini e copy quasi pronti.',
    description: 'Scheda in revisione, in attesa di conferma prima della pubblicazione.',
    tags: ['Pedigree'],
    traits: ['Solare'],
    images: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    ],
    coverImage:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    status: 'in_review',
    createdAt: '2026-03-16T10:15:00.000Z',
    updatedAt: '2026-03-17T10:15:00.000Z',
  },
];
