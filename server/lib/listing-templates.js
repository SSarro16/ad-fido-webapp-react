export function createStarterListing(ownerId, ownerName) {
  const label = ownerName?.trim() || 'Nuovo allevatore';
  const now = new Date().toISOString();

  return {
    ownerId,
    title: 'La tua prima cucciolata',
    breed: 'Da completare',
    city: 'Inserisci citta',
    region: 'Inserisci regione',
    ageLabel: 'Da completare',
    sex: 'Maschio',
    color: 'Da completare',
    excerpt: 'Bozza iniziale creata per aiutarti a pubblicare il primo annuncio.',
    description:
      'Questa bozza guidata ti aiuta a partire subito: aggiorna dati, immagini e testo per renderla pubblicabile.',
    tags: ['Bozza iniziale'],
    traits: ['Da aggiornare'],
    images: [
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80',
    ],
    coverImage:
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    metrics: {
      detailViews: 0,
      listImpressions: 0,
      contactClicks: 0,
    },
    sellerLabel: label,
  };
}
