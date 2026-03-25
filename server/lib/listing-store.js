import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FieldValue } from 'firebase-admin/firestore';

import { firebaseAdminDb } from './firebase-admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const legacyListingsFilePath = path.resolve(__dirname, '../data/listings.json');
const listingsCollection = firebaseAdminDb.collection('listings');

const emptyMetrics = {
  detailViews: 0,
  listImpressions: 0,
  contactClicks: 0,
};

const seededListings = [
  {
    id: 'managed-artu',
    ownerId: 'breeder-seed',
    title: 'Artu',
    breed: 'Golden Retriever',
    city: 'Bergamo',
    region: 'Lombardia',
    ageLabel: '4 mesi',
    sex: 'Maschio',
    color: 'Miele',
    excerpt: 'Cucciolo equilibrato, socializzato in ambiente familiare e gia pronto ai colloqui.',
    description:
      'Annuncio demo dell allevatore privato con documentazione, gallery completa e cronologia approvata.',
    tags: ['Pedigree', 'Microchip', 'Vaccini'],
    traits: ['Socievole', 'Curioso'],
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80',
    ],
    coverImage:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    createdAt: '2026-03-10T08:30:00.000Z',
    submittedAt: '2026-03-11T09:00:00.000Z',
    approvedAt: '2026-03-11T16:15:00.000Z',
    moderationNotes: 'Documentazione completa e gallery coerente.',
    metrics: {
      detailViews: 154,
      listImpressions: 623,
      contactClicks: 19,
    },
    updatedAt: '2026-03-11T16:15:00.000Z',
  },
  {
    id: 'managed-neve',
    ownerId: 'shelter-seed',
    title: 'Neve',
    breed: 'Samoyed',
    city: 'Verona',
    region: 'Veneto',
    ageLabel: '7 mesi',
    sex: 'Femmina',
    color: 'Bianco',
    excerpt: 'Profilo del rifugio in revisione con immagini e copy quasi pronti.',
    description:
      'Annuncio seed per mostrare lo stato in revisione e i controlli media prima della pubblicazione.',
    tags: ['Adozione responsabile'],
    traits: ['Solare', 'Compatibile con altri cani'],
    images: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    ],
    coverImage:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    status: 'in_review',
    createdAt: '2026-03-14T10:15:00.000Z',
    submittedAt: '2026-03-17T10:15:00.000Z',
    metrics: {
      detailViews: 0,
      listImpressions: 0,
      contactClicks: 0,
    },
    updatedAt: '2026-03-17T10:15:00.000Z',
  },
  {
    id: 'managed-luna',
    ownerId: 'shelter-seed',
    title: 'Luna',
    breed: 'Meticcio',
    city: 'San Giorgio Ionico',
    region: 'Puglia',
    ageLabel: '10 mesi',
    sex: 'Femmina',
    color: 'Bianco e nero',
    excerpt:
      'Cucciola socievole seguita dai volontari del Canile Sanitario di San Giorgio Jonico e pronta per un affido responsabile.',
    description:
      'Luna e una giovane meticcia seguita dal team del Canile Sanitario di San Giorgio Jonico. La scheda mette in evidenza un contesto reale di rifugio verificato, con localizzazione, reputazione pubblica e contatti tracciati per un affido piu trasparente.',
    tags: ['Microchip', 'Vaccini', 'Canile verificato'],
    traits: ['Energica', 'Affettuosa', 'Abituata ai volontari'],
    images: [
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
    ],
    coverImage:
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    createdAt: '2026-03-07T11:45:00.000Z',
    submittedAt: '2026-03-08T09:10:00.000Z',
    approvedAt: '2026-03-09T13:40:00.000Z',
    moderationNotes: 'Pubblicato con priorita alta per adozione urgente.',
    metrics: {
      detailViews: 231,
      listImpressions: 842,
      contactClicks: 41,
    },
    updatedAt: '2026-03-09T13:40:00.000Z',
  },
  {
    id: 'managed-ombra',
    ownerId: 'breeder-seed',
    title: 'Ombra',
    breed: 'Pastore Australiano',
    city: 'Parma',
    region: 'Emilia-Romagna',
    ageLabel: '6 mesi',
    sex: 'Femmina',
    color: 'Blue merle',
    excerpt: 'Bozza tecnica con documentazione parziale, ancora da completare prima dell invio.',
    description:
      'Bozza interna per il dashboard allevatore privato, utile a vedere workflow e KPI di completamento.',
    tags: ['Pedigree'],
    traits: ['Intelligente'],
    images: [
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1200&q=80',
    ],
    coverImage:
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1200&q=80',
    status: 'draft',
    createdAt: '2026-03-18T08:00:00.000Z',
    metrics: {
      detailViews: 0,
      listImpressions: 0,
      contactClicks: 0,
    },
    updatedAt: '2026-03-18T08:00:00.000Z',
  },
  {
    id: 'managed-brina',
    ownerId: 'shelter-seed',
    title: 'Brina',
    breed: 'Labrador mix',
    city: 'Vicenza',
    region: 'Veneto',
    ageLabel: '1 anno',
    sex: 'Femmina',
    color: 'Crema',
    excerpt: 'Scheda sospesa in precedenza per fotografie insufficienti e testo troppo generico.',
    description:
      'Annuncio respinto dall amministrazione per mostrare il flusso di revisione con note operative.',
    tags: ['Adozione responsabile'],
    traits: ['Dolce'],
    images: [
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
    ],
    coverImage:
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
    status: 'rejected',
    createdAt: '2026-03-04T09:20:00.000Z',
    submittedAt: '2026-03-05T14:05:00.000Z',
    rejectedAt: '2026-03-06T12:25:00.000Z',
    moderationNotes: 'Servono almeno tre foto nitide e dettagli sanitari piu chiari.',
    metrics: {
      detailViews: 0,
      listImpressions: 0,
      contactClicks: 0,
    },
    updatedAt: '2026-03-06T12:25:00.000Z',
  },
];

function normalizeListing(listing) {
  return {
    ...listing,
    ownerId:
      listing.ownerId === 'subscriber-seed'
        ? listing.sellerLabel?.toLowerCase().includes('rifug')
          ? 'shelter-seed'
          : 'breeder-seed'
        : listing.ownerId,
    status: listing.status === 'removed' ? 'removed' : (listing.status ?? 'draft'),
    createdAt: listing.createdAt ?? listing.updatedAt ?? new Date().toISOString(),
    updatedAt: listing.updatedAt ?? listing.createdAt ?? new Date().toISOString(),
    submittedAt: listing.submittedAt ?? undefined,
    approvedAt: listing.approvedAt ?? listing.publishedAt ?? undefined,
    rejectedAt: listing.rejectedAt ?? undefined,
    removedAt: listing.removedAt ?? undefined,
    moderationNotes: listing.moderationNotes ?? listing.adminNotes ?? undefined,
    metrics: {
      ...emptyMetrics,
      ...(listing.metrics ?? {}),
    },
  };
}

async function seedListingsIfNeeded() {
  const snapshot = await listingsCollection.limit(1).get();

  if (!snapshot.empty) {
    return { seeded: false, count: snapshot.size };
  }

  let initialListings = seededListings;

  try {
    const legacyListings = JSON.parse(await readFile(legacyListingsFilePath, 'utf8'));
    if (Array.isArray(legacyListings) && legacyListings.length > 0) {
      initialListings = legacyListings;
    }
  } catch {
    // Fall back to seeded listings when there is no legacy JSON snapshot to migrate.
  }

  const batch = firebaseAdminDb.batch();

  for (const listing of initialListings.map(normalizeListing)) {
    batch.set(listingsCollection.doc(listing.id), {
      ...listing,
      migratedAt: FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  return { seeded: true, count: initialListings.length };
}

export async function ensureListingsSeeded() {
  return seedListingsIfNeeded();
}

export async function getManagedListingById(listingId) {
  await seedListingsIfNeeded();

  const document = await listingsCollection.doc(listingId).get();
  return document.exists ? normalizeListing(document.data()) : null;
}

export async function createManagedListing(listing) {
  await seedListingsIfNeeded();

  const normalizedListing = normalizeListing(listing);
  await listingsCollection.doc(normalizedListing.id).set(normalizedListing);
  return normalizedListing;
}

export async function updateManagedListingDocument(listing) {
  await seedListingsIfNeeded();

  const normalizedListing = normalizeListing(listing);
  await listingsCollection.doc(normalizedListing.id).set(normalizedListing);
  return normalizedListing;
}

export async function deleteManagedListingById(listingId) {
  await seedListingsIfNeeded();
  await listingsCollection.doc(listingId).delete();
}

export async function incrementManagedListingMetric(listingId, metricKey, amount = 1) {
  await seedListingsIfNeeded();

  await listingsCollection.doc(listingId).set(
    {
      metrics: {
        [metricKey]: FieldValue.increment(amount),
      },
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function readManagedListings() {
  await seedListingsIfNeeded();

  const snapshot = await listingsCollection.get();
  const normalizedListings = snapshot.docs.map((document) => normalizeListing(document.data()));

  for (const seededListing of seededListings) {
    if (!normalizedListings.some((listing) => listing.id === seededListing.id)) {
      normalizedListings.push(seededListing);
    }
  }

  return normalizedListings;
}
