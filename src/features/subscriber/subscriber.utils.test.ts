import { describe, expect, it } from 'vitest';

import { validateManagedListing } from './subscriber.utils';

describe('validateManagedListing', () => {
  it('rejects duplicate images and missing cover mapping', () => {
    const result = validateManagedListing({
      title: 'Test',
      breed: 'Beagle',
      city: 'Napoli',
      region: 'Campania',
      ageLabel: '8 mesi',
      sex: 'Maschio',
      color: 'Tricolore',
      excerpt: 'Breve testo',
      description: 'Descrizione lunga abbastanza',
      tags: ['Vaccini'],
      traits: ['Curioso'],
      images: ['a', 'a'],
      coverImage: 'missing',
      status: 'draft',
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('La cover deve essere inclusa tra le immagini.');
    expect(result.errors).toContain('Non sono consentite immagini duplicate.');
  });

  it('accepts a valid managed listing payload', () => {
    const result = validateManagedListing({
      title: 'Test',
      breed: 'Beagle',
      city: 'Napoli',
      region: 'Campania',
      ageLabel: '8 mesi',
      sex: 'Maschio',
      color: 'Tricolore',
      excerpt: 'Breve testo',
      description: 'Descrizione lunga abbastanza',
      tags: ['Vaccini'],
      traits: ['Curioso'],
      images: ['a', 'b'],
      coverImage: 'a',
      status: 'draft',
    });

    expect(result.valid).toBe(true);
  });
});
