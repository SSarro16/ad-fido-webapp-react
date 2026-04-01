import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useModerateAdminListing } from './admin.queries';

const mockModerateAdminListing = vi.fn();

vi.mock('./admin.service', () => ({
  fetchAdminOverview: vi.fn(),
  fetchAdminListings: vi.fn(),
  moderateAdminListing: (...args: unknown[]) => mockModerateAdminListing(...args),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('admin.queries', () => {
  it('invalidates admin, seller and marketplace queries after a moderation action', async () => {
    mockModerateAdminListing.mockResolvedValue({
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
      status: 'published',
      createdAt: '2026-03-30T10:00:00.000Z',
      updatedAt: '2026-03-30T12:00:00.000Z',
      waitingDays: 0,
      completenessScore: 88,
      mediaCount: 1,
      moderationFlags: [],
      owner: null,
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useModerateAdminListing('token-123'), { wrapper });

    await result.current.mutateAsync({
      listingId: 'listing-1',
      action: 'approve',
      notes: 'Ok',
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-overview'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-listings'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['subscriber-listings'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['listing'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['listings'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['favorite-listings'] });
    });
  });
});
