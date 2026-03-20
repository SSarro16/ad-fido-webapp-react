import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchAdminOverview, moderateAdminListing } from './admin.service';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('admin.service', () => {
  it('adapts backend overview and listings to the admin payload used by the UI', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            overview: {
              generatedAt: '2026-03-19T10:00:00.000Z',
              kpis: {
                totalUsers: 4,
                professionalAccounts: 2,
                pendingApprovals: 1,
                publishedListings: 1,
                removedListings: 0,
                totalDetailViews: 12,
                totalListImpressions: 50,
                totalContactClicks: 4,
                averageDetailViews: 12,
              },
              userCounts: {
                total: 4,
                user: 1,
                breeder: 1,
                shelter: 1,
                admin: 1,
              },
              listingCounts: {
                total: 2,
                draft: 1,
                inReview: 1,
                published: 1,
                rejected: 0,
                removed: 0,
              },
              moderationQueue: [
                {
                  id: 'listing-2',
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
                  submittedAt: '2026-03-18T12:00:00.000Z',
                  moderationNotes: 'Completa la scheda',
                  owner: {
                    id: 'owner-1',
                    name: 'Allevamento Colle Verde',
                    email: 'breeder.demo@adfido.it',
                    phone: '+39 333 000 0001',
                    organizationName: 'Allevamento Colle Verde',
                    role: 'breeder',
                    roleLabel: 'Allevatore privato',
                  },
                },
              ],
              topListings: [],
              latestActivity: [
                {
                  id: 'listing-2',
                  listingTitle: 'Luna',
                  ownerName: 'Allevamento Colle Verde',
                  status: 'in_review',
                  updatedAt: '2026-03-18T12:00:00.000Z',
                  moderationNotes: 'Completa la scheda',
                },
              ],
            },
            credentials: {
              admin: {
                email: 'adfidoadministration@adfido.it',
                password: 'AdFidoAdmin2026!',
              },
              breeder: {
                email: 'breeder.demo@adfido.it',
                password: 'AdFidoBreeder2026!',
              },
              shelter: {
                email: 'shelter.demo@adfido.it',
                password: 'AdFidoShelter2026!',
              },
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            listings: [
              {
                id: 'listing-1',
                title: 'Milo',
                breed: 'Border Collie',
                city: 'Milano',
                region: 'Lombardia',
                ageLabel: '8 mesi',
                sex: 'Maschio',
                color: 'Bianco e nero',
                excerpt: 'Attivo e brillante',
                description: 'Scheda completa.',
                tags: ['Vaccini'],
                traits: ['Agile'],
                images: ['img-1', 'img-2'],
                coverImage: 'img-1',
                status: 'published',
                createdAt: '2026-03-17T10:00:00.000Z',
                updatedAt: '2026-03-18T10:00:00.000Z',
                owner: {
                  id: 'owner-1',
                  name: 'Allevamento Colle Verde',
                  email: 'breeder.demo@adfido.it',
                  phone: '+39 333 000 0001',
                  organizationName: 'Allevamento Colle Verde',
                  role: 'breeder',
                  roleLabel: 'Allevatore privato',
                },
              },
            ],
          }),
        })
    );

    const payload = await fetchAdminOverview('token-123');

    expect(payload.stats.totalListings).toBe(2);
    expect(payload.stats.averageImagesPerListing).toBe(2);
    expect(payload.moderationQueue[0]?.adminNotes).toBe('Completa la scheda');
    expect(payload.moderationQueue[0]?.owner.accountLabel).toBe('Allevatore privato');
    expect(payload.credentials.admin.password).toBe('AdFidoAdmin2026!');
  });

  it('sends moderation actions to the dedicated admin endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        listing: {
          id: 'listing-1',
          title: 'Milo',
          breed: 'Border Collie',
          city: 'Milano',
          region: 'Lombardia',
          ageLabel: '8 mesi',
          sex: 'Maschio',
          color: 'Bianco e nero',
          excerpt: 'Attivo e brillante',
          description: 'Scheda completa.',
          tags: ['Vaccini'],
          traits: ['Agile'],
          images: ['img-1'],
          coverImage: 'img-1',
          status: 'published',
          createdAt: '2026-03-17T10:00:00.000Z',
          updatedAt: '2026-03-19T10:00:00.000Z',
          moderationNotes: 'Ok',
          owner: {
            id: 'owner-1',
            name: 'Allevamento Colle Verde',
            email: 'breeder.demo@adfido.it',
            phone: '+39 333 000 0001',
            organizationName: 'Allevamento Colle Verde',
            role: 'breeder',
            roleLabel: 'Allevatore privato',
          },
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const listing = await moderateAdminListing('token-123', 'listing-1', 'approve', 'Ok');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/admin/listings/listing-1/moderation'),
      expect.objectContaining({
        method: 'PATCH',
      })
    );
    expect(listing.adminNotes).toBe('Ok');
  });
});
