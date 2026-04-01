import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchAdminOverview, fetchAdminListings, moderateAdminListing } from './admin.service';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('admin.service', () => {
  it('maps overview and listing payloads into normalized admin models', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            overview: {
              generatedAt: '2026-04-01T09:00:00.000Z',
              health: {
                ok: true,
                mapsConfigured: true,
                oldestPendingReviewDays: 1,
                lowCompletenessListings: 0,
                generatedAt: '2026-04-01T09:00:00.000Z',
              },
              kpis: {
                totalUsers: 10,
                professionalAccounts: 4,
                pendingApprovals: 2,
                publishedListings: 5,
                removedListings: 1,
                totalDetailViews: 120,
                totalListImpressions: 400,
                totalContactClicks: 18,
                averageDetailViews: 24,
              },
              userCounts: {
                total: 10,
                user: 5,
                breeder: 2,
                shelter: 2,
                admin: 1,
              },
              listingCounts: {
                total: 8,
                draft: 1,
                inReview: 2,
                published: 4,
                rejected: 1,
                removed: 0,
              },
              moderationQueue: [
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
                  description: 'Scheda completa.',
                  tags: [],
                  traits: [],
                  images: ['img-1'],
                  coverImage: 'img-1',
                  status: 'in_review',
                  createdAt: '2026-03-30T10:00:00.000Z',
                  updatedAt: '2026-03-30T12:00:00.000Z',
                  moderationNotes: 'Verificare gallery',
                  waitingDays: 2,
                  completenessScore: 58,
                  mediaCount: 1,
                  moderationFlags: ['Gallery essenziale'],
                  owner: {
                    id: 'owner-1',
                    name: 'Mario',
                    email: 'mario@adfido.it',
                    phone: '+39 333 000 0000',
                    role: 'breeder',
                    accountLabel: 'Allevatore privato',
                    organizationName: '',
                  },
                },
              ],
              topListings: [],
              latestActivity: [],
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            listings: [
              {
                id: 'listing-2',
                title: 'Milo',
                breed: 'Beagle',
                city: 'Bari',
                region: 'Puglia',
                ageLabel: '1 anno',
                sex: 'Maschio',
                color: 'Tricolore',
                excerpt: 'Vivace',
                description: 'Descrizione completa.',
                tags: ['Chip'],
                traits: ['Socievole'],
                images: ['img-2'],
                coverImage: 'img-2',
                status: 'published',
                createdAt: '2026-03-29T10:00:00.000Z',
                updatedAt: '2026-03-29T12:00:00.000Z',
                waitingDays: 0,
                completenessScore: 92,
                mediaCount: 1,
                moderationFlags: [],
                owner: null,
              },
            ],
          }),
        })
    );

    const overview = await fetchAdminOverview('token-123');
    const listings = await fetchAdminListings('token-123');

    expect(overview.moderationQueue[0]?.owner?.accountLabel).toBe('Allevatore privato');
    expect(overview.moderationQueue[0]?.moderationFlags).toContain('Gallery essenziale');
    expect(listings[0]?.mediaCount).toBe(1);
    expect(listings[0]?.owner).toBeNull();
  });

  it('surfaces backend errors on moderation actions', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          message: 'Azione di moderazione non valida.',
        }),
      })
    );

    await expect(
      moderateAdminListing('token-123', 'listing-1', 'approve', 'nota')
    ).rejects.toThrow('Azione di moderazione non valida.');
  });
});
