import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

import {
  readBearerToken,
  sanitizeUser,
  verifyAuthToken,
} from './lib/auth.js';
import { createStarterListing } from './lib/listing-templates.js';
import {
  createManagedListing,
  deleteManagedListingById,
  ensureListingsSeeded,
  getManagedListingById,
  incrementManagedListingMetric,
  readManagedListings,
  updateManagedListingDocument,
} from './lib/listing-store.js';
import { createFeedbackEntry, readFeedbackEntries } from './lib/feedback-store.js';
import { sendFeedbackMail } from './lib/mail.js';
import { createImageUploadMiddleware, uploadImagesToStorage } from './lib/storage.js';
import { validateManagedListing } from './lib/listing-validation.js';
import {
  ensureUsersSeeded,
  getUserByEmail,
  getUserByFirebaseUid,
  getUserById,
  readUsers,
  upsertUser,
} from './lib/user-store.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY ?? '';
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.resolve(currentDirectory, '../dist');
const sellerRoles = new Set(['breeder', 'shelter']);
const manageableStatuses = new Set(['draft', 'in_review', 'published', 'rejected', 'removed']);
const verifiedShelterPlaces = {
  'Canile Sanitario di San Giorgio Jonico': {
    verified: true,
    address: 'SS7 Ex, 70, 74027 San Giorgio Ionico TA',
    coordinates: {
      lat: 40.4697664,
      lng: 17.384987799999998,
    },
    rating: 4.4,
    reviewCount: 35,
    googleMapsUrl:
      'https://maps.google.com/?cid=9313744457195395385&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA',
    reviews: [
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
  },
};

const upload = createImageUploadMiddleware(multer);

const breederListingLimit = 3;

app.use(cors());
app.use(express.json());

function isSellerRole(role) {
  return sellerRoles.has(role);
}

function getOrganizationType(role) {
  if (role === 'shelter') {
    return 'Canile / Rifugio';
  }

  if (role === 'admin') {
    return 'Associazione';
  }

  return 'Allevatore privato';
}

function getRoleLabel(role) {
  if (role === 'breeder') {
    return 'Allevatore privato';
  }

  if (role === 'shelter') {
    return 'Canile / Rifugio';
  }

  if (role === 'admin') {
    return 'Admin / CEO';
  }

  return 'Utente';
}

function isShelterOwner(owner) {
  return owner?.role === 'shelter';
}

function getVerifiedShelterPlace(owner) {
  if (!isShelterOwner(owner)) {
    return null;
  }

  return verifiedShelterPlaces[owner.organizationName] ?? verifiedShelterPlaces[owner.name] ?? null;
}

function buildMapsEmbedUrl(coordinates) {
  if (!coordinates?.lat || !coordinates?.lng) {
    return undefined;
  }

  return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=14&output=embed`;
}

function createEmptyMetrics() {
  return {
    detailViews: 0,
    listImpressions: 0,
    contactClicks: 0,
  };
}

async function getAuthenticatedUser(request) {
  const token = readBearerToken(request.headers.authorization);

  if (!token) {
    return { error: 'Token mancante.' };
  }

  try {
    const payload = await verifyAuthToken(token);
    let user = await getUserByFirebaseUid(payload.uid);

    if (!user && payload.email) {
      const matchedByEmail = await getUserByEmail(payload.email);

      if (matchedByEmail) {
        user = {
          ...matchedByEmail,
          firebaseUid: payload.uid,
          emailVerified: payload.email_verified ?? matchedByEmail.emailVerified,
        };

        await upsertUser(user);
      }
    }

    if (!user && payload.email) {
      user = {
        id: `firebase-${payload.uid}`,
        firebaseUid: payload.uid,
        name: payload.name?.trim() || payload.email.split('@')[0] || 'Utente AdFido',
        email: payload.email,
        phone: '',
        role: 'user',
        emailVerified: payload.email_verified ?? false,
        organizationName: '',
        createdAt: new Date().toISOString(),
      };

      await upsertUser(user);
    }

    if (!user) {
      return { error: 'Sessione non valida.' };
    }

    return {
      user: {
        ...user,
        firebaseUid: payload.uid,
        emailVerified: payload.email_verified ?? user.emailVerified,
      },
      token,
      decodedToken: payload,
    };
  } catch {
    return { error: 'Token non valido o scaduto.' };
  }
}

async function requireAdmin(request, response) {
  const auth = await getAuthenticatedUser(request);

  if ('error' in auth) {
    response.status(401).json({ message: auth.error });
    return null;
  }

  if (auth.user.role !== 'admin') {
    response.status(403).json({ message: 'Accesso riservato all amministrazione.' });
    return null;
  }

  return auth;
}

async function requireSeller(request, response) {
  const auth = await getAuthenticatedUser(request);

  if ('error' in auth) {
    response.status(401).json({ message: auth.error });
    return null;
  }

  if (!isSellerRole(auth.user.role)) {
    response.status(403).json({ message: 'Accesso riservato ai profili professionali.' });
    return null;
  }

  return auth;
}

function sanitizeManagedListing(listing) {
  const publicListing = { ...listing };
  delete publicListing.ownerId;
  return publicListing;
}

function buildManagedListingWithOwner(listing, owner) {
  return {
    ...sanitizeManagedListing(listing),
    owner: owner
      ? {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          phone: owner.phone,
          organizationName: owner.organizationName,
          role: owner.role,
          roleLabel: getRoleLabel(owner.role),
        }
      : null,
  };
}

function buildPublicMarketplaceListing(listing, owner) {
  const organizationType = getOrganizationType(owner?.role);
  const shelterPlace = getVerifiedShelterPlace(owner);
  const isVerifiedShelter = Boolean(shelterPlace);
  const organizationRating =
    shelterPlace?.rating ?? (isShelterOwner(owner) ? 4.9 : owner?.role === 'admin' ? 5 : 4.8);

  return {
    id: listing.id,
    name: listing.title,
    breed: listing.breed,
    city: listing.city,
    region: listing.region,
    ageLabel: listing.ageLabel,
    sex: listing.sex,
    color: listing.color,
    organizationName: owner?.organizationName ?? owner?.name ?? 'Profilo verificato',
    organizationType,
    organizationVerified: isVerifiedShelter,
    organizationRating,
    organizationReviewCount: shelterPlace?.reviewCount,
    organizationReviewSourceLabel: shelterPlace ? 'Recensioni pubbliche Google Maps' : undefined,
    organizationAddress: shelterPlace?.address,
    organizationCoordinates: shelterPlace?.coordinates,
    organizationMapEmbedUrl: buildMapsEmbedUrl(shelterPlace?.coordinates),
    organizationMapUrl: shelterPlace?.googleMapsUrl,
    organizationReviews: shelterPlace?.reviews,
    heroImage: listing.coverImage || listing.images[0],
    gallery: listing.images,
    excerpt: listing.excerpt,
    description: listing.description,
    tags: listing.tags,
    traits: listing.traits,
    sponsorLabel: isVerifiedShelter
      ? 'Canile verificato'
      : organizationType === 'Canile / Rifugio'
        ? 'Canile partner'
        : 'Profilo verificato',
    phone: owner?.phone ?? '+39 3XX XXX XXXX',
  };
}

function incrementListingMetrics(listing, metricKey, amount = 1) {
  return {
    ...listing,
    metrics: {
      ...createEmptyMetrics(),
      ...(listing.metrics ?? {}),
      [metricKey]: ((listing.metrics ?? {})[metricKey] ?? 0) + amount,
    },
  };
}

function calculateAdminOverview(users, listings) {
  const userCounts = {
    total: users.length,
    user: users.filter((user) => user.role === 'user').length,
    breeder: users.filter((user) => user.role === 'breeder').length,
    shelter: users.filter((user) => user.role === 'shelter').length,
    admin: users.filter((user) => user.role === 'admin').length,
  };

  const listingCounts = {
    total: listings.length,
    draft: listings.filter((listing) => listing.status === 'draft').length,
    inReview: listings.filter((listing) => listing.status === 'in_review').length,
    published: listings.filter((listing) => listing.status === 'published').length,
    rejected: listings.filter((listing) => listing.status === 'rejected').length,
    removed: listings.filter((listing) => listing.status === 'removed').length,
  };

  const totalDetailViews = listings.reduce(
    (sum, listing) => sum + (listing.metrics?.detailViews ?? 0),
    0
  );
  const totalListImpressions = listings.reduce(
    (sum, listing) => sum + (listing.metrics?.listImpressions ?? 0),
    0
  );
  const totalContactClicks = listings.reduce(
    (sum, listing) => sum + (listing.metrics?.contactClicks ?? 0),
    0
  );
  const publishedListings = listings.filter((listing) => listing.status === 'published');

  const moderationQueue = listings
    .filter((listing) => listing.status === 'in_review')
    .sort((left, right) => {
      return (
        new Date(left.submittedAt ?? left.updatedAt).getTime() -
        new Date(right.submittedAt ?? right.updatedAt).getTime()
      );
    })
    .slice(0, 8)
    .map((listing) => {
      const owner = users.find((user) => user.id === listing.ownerId);

      return buildManagedListingWithOwner(listing, owner);
    });

  const topListings = publishedListings
    .slice()
    .sort((left, right) => (right.metrics?.detailViews ?? 0) - (left.metrics?.detailViews ?? 0))
    .slice(0, 5)
    .map((listing) => {
      const owner = users.find((user) => user.id === listing.ownerId);

      return buildManagedListingWithOwner(listing, owner);
    });

  const latestActivity = listings
    .filter((listing) => listing.updatedAt)
    .slice()
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 8)
    .map((listing) => {
      const owner = users.find((user) => user.id === listing.ownerId);

      return {
        id: listing.id,
        listingTitle: listing.title,
        ownerName: owner?.organizationName ?? owner?.name ?? 'Profilo rimosso',
        status: listing.status,
        updatedAt: listing.updatedAt,
        moderationNotes: listing.moderationNotes ?? '',
      };
    });

  return {
    generatedAt: new Date().toISOString(),
    kpis: {
      totalUsers: userCounts.total,
      professionalAccounts: userCounts.breeder + userCounts.shelter,
      pendingApprovals: listingCounts.inReview,
      publishedListings: listingCounts.published,
      removedListings: listingCounts.removed,
      totalDetailViews,
      totalListImpressions,
      totalContactClicks,
      averageDetailViews:
        publishedListings.length > 0 ? Math.round(totalDetailViews / publishedListings.length) : 0,
    },
    userCounts,
    listingCounts,
    moderationQueue,
    topListings,
    latestActivity,
  };
}

async function bootstrapFirestore() {
  const [usersBootstrap, listingsBootstrap] = await Promise.all([
    ensureUsersSeeded(),
    ensureListingsSeeded(),
  ]);

  if (usersBootstrap.seeded) {
    console.log(`[bootstrap] Firestore users imported: ${usersBootstrap.count}`);
  } else {
    console.log('[bootstrap] Firestore users already populated');
  }

  if (listingsBootstrap.seeded) {
    console.log(`[bootstrap] Firestore listings imported: ${listingsBootstrap.count}`);
  } else {
    console.log('[bootstrap] Firestore listings already populated');
  }
}

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    mapsConfigured: Boolean(googleMapsApiKey),
  });
});

app.get('/api/maps/autocomplete', async (request, response) => {
  const input = String(request.query.input ?? '').trim();

  if (input.length < 2) {
    response.json({ suggestions: [] });
    return;
  }

  if (!googleMapsApiKey) {
    response.status(503).json({
      suggestions: [],
      message: 'Google Maps backend non configurato.',
    });
    return;
  }

  try {
    const googleResponse = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': googleMapsApiKey,
        'X-Goog-FieldMask':
          'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text',
      },
      body: JSON.stringify({
        input,
        includedRegionCodes: ['it'],
        languageCode: 'it',
        regionCode: 'IT',
      }),
    });

    if (!googleResponse.ok) {
      const errorBody = await googleResponse.text();
      response.status(googleResponse.status).json({
        suggestions: [],
        message: 'Google Places ha rifiutato la richiesta.',
        details: errorBody,
      });
      return;
    }

    const payload = await googleResponse.json();
    const suggestions = (payload.suggestions ?? [])
      .map((suggestion) => {
        const place = suggestion.placePrediction;
        const mainText = place?.structuredFormat?.mainText?.text ?? place?.text?.text ?? '';
        const secondaryText = place?.structuredFormat?.secondaryText?.text ?? '';

        if (!place?.placeId || !mainText) {
          return null;
        }

        return {
          id: place.placeId,
          label: secondaryText ? `${mainText}, ${secondaryText}` : mainText,
          secondaryLabel: secondaryText || undefined,
        };
      })
      .filter(Boolean);

    response.json({ suggestions });
  } catch (error) {
    response.status(500).json({
      suggestions: [],
      message: 'Errore interno durante la richiesta a Google Places.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/auth/register', async (request, response) => {
  response.status(410).json({
    message: 'La registrazione diretta via backend e stata dismessa. Usa Firebase Auth dal frontend.',
  });
});

app.post('/api/auth/login', async (request, response) => {
  response.status(410).json({
    message: 'Il login diretto via backend e stato dismesso. Usa Firebase Auth dal frontend.',
  });
});

app.get('/api/auth/me', async (request, response) => {
  const auth = await getAuthenticatedUser(request);

  if ('error' in auth) {
    response.status(401).json({ message: auth.error });
    return;
  }

  response.json({
    user: sanitizeUser(auth.user),
    token: auth.token,
  });
});

app.patch('/api/auth/profile', async (request, response) => {
  const auth = await getAuthenticatedUser(request);

  if ('error' in auth) {
    response.status(401).json({ message: auth.error });
    return;
  }

  const name = String(request.body?.name ?? '').trim();
  const phone = String(request.body?.phone ?? '').trim();
  const organizationName = String(request.body?.organizationName ?? '').trim();

  if (!name || !phone) {
    response.status(400).json({ message: 'Nome e telefono sono obbligatori.' });
    return;
  }

  const currentUser = await getUserById(auth.user.id);

  if (!currentUser) {
    response.status(404).json({ message: 'Utente non trovato.' });
    return;
  }

  const updatedUser = {
    ...currentUser,
    name,
    phone,
    organizationName:
      currentUser.role === 'admin'
        ? undefined
        : organizationName || currentUser.organizationName || '',
  };

  await upsertUser(updatedUser);

  response.json({
    user: sanitizeUser(updatedUser),
    token: auth.token,
  });
});

app.get('/api/marketplace/listings', async (_request, response) => {
  const [listings, users] = await Promise.all([readManagedListings(), readUsers()]);
  const publishedListings = listings.filter((listing) => listing.status === 'published');
  const trackedListings = publishedListings.map((listing) =>
    incrementListingMetrics(listing, 'listImpressions')
  );

  if (trackedListings.length > 0) {
    await Promise.all(
      trackedListings.map((listing) => incrementManagedListingMetric(listing.id, 'listImpressions'))
    );
  }

  response.json({
    listings: publishedListings.map((listing) =>
      buildPublicMarketplaceListing(
        listing,
        users.find((user) => user.id === listing.ownerId)
      )
    ),
  });
});

app.get('/api/marketplace/listings/:listingId', async (request, response) => {
  const [listing, users] = await Promise.all([
    getManagedListingById(request.params.listingId),
    readUsers(),
  ]);

  if (!listing || listing.status !== 'published') {
    response.status(404).json({ message: 'Annuncio non trovato.' });
    return;
  }

  const trackedListing = incrementListingMetrics(listing, 'detailViews');
  await incrementManagedListingMetric(trackedListing.id, 'detailViews');

  response.json({
    listing: buildPublicMarketplaceListing(
      trackedListing,
      users.find((user) => user.id === trackedListing.ownerId)
    ),
  });
});

app.post('/api/marketplace/listings/:listingId/contact-click', async (request, response) => {
  const listing = await getManagedListingById(request.params.listingId);

  if (!listing || listing.status !== 'published') {
    response.status(404).json({ message: 'Annuncio non trovato.' });
    return;
  }

  await incrementManagedListingMetric(listing.id, 'contactClicks');

  response.status(204).send();
});

app.post('/api/feedback', async (request, response) => {
  const name = String(request.body?.name ?? '').trim();
  const email = String(request.body?.email ?? '').trim();
  const message = String(request.body?.message ?? '').trim();

  if (message.length < 8) {
    response.status(400).json({ message: 'Il feedback deve contenere almeno 8 caratteri.' });
    return;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    response.status(400).json({ message: 'L email inserita non e valida.' });
    return;
  }

  const entry = await createFeedbackEntry({
    id: `feedback-${randomUUID()}`,
    name,
    email,
    message,
    source: 'website',
    createdAt: new Date().toISOString(),
  });

  let mailDelivery;

  try {
    mailDelivery = await sendFeedbackMail(entry);
  } catch (error) {
    console.error('[feedback-mail] delivery failed', error);
    mailDelivery = {
      delivered: false,
      channel: 'smtp-error',
      mailbox: process.env.FEEDBACK_MAIL_TO?.trim() || 'simone.sarro@outlook.it',
    };
  }

  response.status(201).json({
    feedback: entry,
    deliveredTo: mailDelivery.delivered ? 'Firestore + email' : 'Firestore',
    emailDelivery: mailDelivery,
  });
});

app.post('/api/uploads/images', async (request, response) => {
  const auth = await requireSeller(request, response);

  if (!auth) {
    return;
  }

  upload.array('images', 8)(request, response, async (error) => {
    if (error) {
      response.status(400).json({
        message: error instanceof Error ? error.message : 'Upload immagini non riuscito.',
      });
      return;
    }

    const files = Array.isArray(request.files) ? request.files : [];

    if (files.length === 0) {
      response.status(400).json({ message: 'Seleziona almeno un immagine da caricare.' });
      return;
    }

    try {
      const uploadedFiles = await uploadImagesToStorage(files);

      response.status(201).json({
        files: uploadedFiles.map((file) => ({
          name: file.name,
          url: file.url,
        })),
      });
    } catch (uploadError) {
      response.status(500).json({
        message:
          uploadError instanceof Error
            ? uploadError.message
            : 'Upload immagini su Firebase Storage non riuscito.',
      });
    }
  });
});

app.get('/api/subscriber/listings', async (request, response) => {
  const auth = await requireSeller(request, response);

  if (!auth) {
    return;
  }

  const listings = await readManagedListings();
  let visibleListings = listings.filter((listing) => listing.ownerId === auth.user.id);

  if (visibleListings.length === 0) {
    const starterListing = {
      id: `managed-${randomUUID()}`,
      ...createStarterListing(auth.user.id, auth.user.organizationName ?? auth.user.name),
    };

    await createManagedListing(starterListing);
    visibleListings = [starterListing];
  }

  response.json({
    listings: visibleListings.map(sanitizeManagedListing),
  });
});

app.post('/api/subscriber/listings', async (request, response) => {
  const auth = await requireSeller(request, response);

  if (!auth) {
    return;
  }

  const payload = request.body;
  const validation = validateManagedListing(payload);

  if (!validation.valid) {
    response.status(400).json({ message: validation.errors[0], errors: validation.errors });
    return;
  }

  const now = new Date().toISOString();
  const nextStatus = payload.status === 'in_review' ? 'in_review' : 'draft';
  const listings = await readManagedListings();
  const ownedListings = listings.filter((listing) => listing.ownerId === auth.user.id);

  if (auth.user.role === 'breeder' && ownedListings.length >= breederListingLimit) {
    response.status(403).json({
      message: 'Gli allevatori privati possono gestire al massimo 3 annunci per account.',
    });
    return;
  }

  const nextListing = {
    ...payload,
    id: `managed-${randomUUID()}`,
    ownerId: auth.user.id,
    status: nextStatus,
    createdAt: now,
    submittedAt: nextStatus === 'in_review' ? now : undefined,
    approvedAt: undefined,
    rejectedAt: undefined,
    moderationNotes: undefined,
    metrics: createEmptyMetrics(),
    updatedAt: now,
  };
  await createManagedListing(nextListing);

  response.status(201).json({ listing: sanitizeManagedListing(nextListing) });
});

app.put('/api/subscriber/listings/:listingId', async (request, response) => {
  const auth = await requireSeller(request, response);

  if (!auth) {
    return;
  }

  const validation = validateManagedListing(request.body);

  if (!validation.valid) {
    response.status(400).json({ message: validation.errors[0], errors: validation.errors });
    return;
  }

  const currentListing = await getManagedListingById(request.params.listingId);

  if (!currentListing) {
    response.status(404).json({ message: 'Annuncio non trovato.' });
    return;
  }

  if (currentListing.ownerId !== auth.user.id) {
    response.status(403).json({ message: 'Non puoi modificare questo annuncio.' });
    return;
  }

  const now = new Date().toISOString();
  const nextStatus =
    request.body.status === 'in_review'
      ? 'in_review'
      : currentListing.status === 'published'
        ? 'in_review'
        : 'draft';

  const updatedListing = {
    ...currentListing,
    ...request.body,
    id: currentListing.id,
    ownerId: currentListing.ownerId,
    status: nextStatus,
    submittedAt: nextStatus === 'in_review' ? now : currentListing.submittedAt,
    approvedAt: nextStatus === 'published' ? currentListing.approvedAt : undefined,
    rejectedAt: nextStatus === 'rejected' ? currentListing.rejectedAt : undefined,
    moderationNotes: nextStatus === 'in_review' ? currentListing.moderationNotes : undefined,
    metrics: currentListing.metrics ?? createEmptyMetrics(),
    updatedAt: now,
  };

  await updateManagedListingDocument(updatedListing);

  response.json({ listing: sanitizeManagedListing(updatedListing) });
});

app.patch('/api/subscriber/listings/:listingId/status', async (request, response) => {
  const auth = await requireSeller(request, response);

  if (!auth) {
    return;
  }

  const status = request.body?.status;
  if (!['draft', 'in_review'].includes(status)) {
    response.status(400).json({
      message: 'I profili professionali possono solo salvare in bozza o inviare in revisione.',
    });
    return;
  }

  const currentListing = await getManagedListingById(request.params.listingId);

  if (!currentListing) {
    response.status(404).json({ message: 'Annuncio non trovato.' });
    return;
  }

  if (currentListing.ownerId !== auth.user.id) {
    response.status(403).json({ message: 'Non puoi modificare questo annuncio.' });
    return;
  }

  const now = new Date().toISOString();
  const updatedListing = {
    ...currentListing,
    status,
    submittedAt: status === 'in_review' ? now : currentListing.submittedAt,
    moderationNotes: status === 'in_review' ? currentListing.moderationNotes : undefined,
    updatedAt: now,
  };

  await updateManagedListingDocument(updatedListing);

  response.json({ listing: sanitizeManagedListing(updatedListing) });
});

app.delete('/api/subscriber/listings/:listingId', async (request, response) => {
  const auth = await requireSeller(request, response);

  if (!auth) {
    return;
  }

  const matchedListing = await getManagedListingById(request.params.listingId);

  if (!matchedListing) {
    response.status(404).json({ message: 'Annuncio non trovato.' });
    return;
  }

  if (matchedListing.ownerId !== auth.user.id) {
    response.status(403).json({ message: 'Non puoi eliminare questo annuncio.' });
    return;
  }

  await deleteManagedListingById(request.params.listingId);

  response.status(204).send();
});

app.get('/api/admin/overview', async (request, response) => {
  const auth = await requireAdmin(request, response);

  if (!auth) {
    return;
  }

  const [users, listings] = await Promise.all([readUsers(), readManagedListings()]);

  response.json({
    overview: calculateAdminOverview(users, listings),
  });
});

app.get('/api/admin/listings', async (request, response) => {
  const auth = await requireAdmin(request, response);

  if (!auth) {
    return;
  }

  const [users, listings] = await Promise.all([readUsers(), readManagedListings()]);
  const orderedListings = listings
    .slice()
    .sort(
      (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );

  response.json({
    listings: orderedListings.map((listing) =>
      buildManagedListingWithOwner(
        listing,
        users.find((user) => user.id === listing.ownerId)
      )
    ),
  });
});

app.get('/api/admin/feedback', async (request, response) => {
  const auth = await requireAdmin(request, response);

  if (!auth) {
    return;
  }

  const entries = await readFeedbackEntries();

  response.json({
    feedback: entries,
  });
});

app.patch('/api/admin/listings/:listingId/moderation', async (request, response) => {
  const auth = await requireAdmin(request, response);

  if (!auth) {
    return;
  }

  const action = request.body?.action;
  const notes = String(request.body?.notes ?? '').trim();

  if (!['approve', 'reject', 'remove', 'restore_review'].includes(action)) {
    response.status(400).json({ message: 'Azione di moderazione non valida.' });
    return;
  }

  const currentListing = await getManagedListingById(request.params.listingId);

  if (!currentListing) {
    response.status(404).json({ message: 'Annuncio non trovato.' });
    return;
  }
  const now = new Date().toISOString();
  const nextStatus =
    action === 'approve'
      ? 'published'
      : action === 'reject'
        ? 'rejected'
        : action === 'remove'
          ? 'removed'
          : 'in_review';

  if (!manageableStatuses.has(nextStatus)) {
    response.status(400).json({ message: 'Stato finale non valido.' });
    return;
  }

  const updatedListing = {
    ...currentListing,
    status: nextStatus,
    submittedAt: action === 'restore_review' ? now : currentListing.submittedAt,
    approvedAt: action === 'approve' ? now : currentListing.approvedAt,
    rejectedAt: action === 'reject' ? now : currentListing.rejectedAt,
    removedAt: action === 'remove' ? now : currentListing.removedAt,
    moderationNotes: notes || currentListing.moderationNotes || undefined,
    updatedAt: now,
  };

  await updateManagedListingDocument(updatedListing);

  response.json({ listing: sanitizeManagedListing(updatedListing) });
});

app.use(express.static(distDirectory));

app.use(async (request, response, next) => {
  if (request.path.startsWith('/api/')) {
    next();
    return;
  }

  try {
    response.sendFile(path.join(distDirectory, 'index.html'));
  } catch (error) {
    next(error);
  }
});

await bootstrapFirestore();

app.listen(port, () => {
  console.log(`AdFido backend attivo su http://localhost:${port}`);
});


