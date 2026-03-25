import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchManagedListings } from './subscriber.service';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('subscriber.service', () => {
  it('maps backend moderationNotes to adminNotes for seller screens', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          listings: [
            {
              id: 'listing-1',
              title: 'Luna',
              breed: 'Maltese',
              city: 'Taranto',
              region: 'Puglia',
              ageLabel: '4 mesi',
              sex: 'Femmina',
              color: 'Bianco',
              excerpt: 'Molto dolce',
              description: 'Cucciola equilibrata e socievole.',
              tags: ['Microchip'],
              traits: ['Socievole'],
              images: ['img-1'],
              coverImage: 'img-1',
              status: 'in_review',
              createdAt: '2026-03-18T10:00:00.000Z',
              updatedAt: '2026-03-18T12:00:00.000Z',
              moderationNotes: 'Aggiungi un immagine in piu',
            },
          ],
        }),
      })
    );

    const listings = await fetchManagedListings('token-123');

    expect(listings[0]?.adminNotes).toBe('Aggiungi un immagine in piu');
  });
});
