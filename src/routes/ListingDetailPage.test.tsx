import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ListingDetailPage } from './ListingDetailPage';

const mockShowToast = vi.fn();
const mockToggleFavorite = vi.fn();
const mockTrackListingContactClick = vi.fn();
const mockUseListing = vi.fn();

vi.mock('../features/marketplace/marketplace.queries', () => ({
  useListing: (...args: unknown[]) => mockUseListing(...args),
}));

vi.mock('../features/marketplace/marketplace.service', () => ({
  trackListingContactClick: (...args: unknown[]) => mockTrackListingContactClick(...args),
}));

vi.mock('../features/toasts/useToast', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

vi.mock('../features/favorites/favorites.store', () => ({
  useFavoritesStore: (
    selector: (state: {
      toggleFavorite: typeof mockToggleFavorite;
      isFavorite: () => boolean;
    }) => unknown
  ) =>
    selector({
      toggleFavorite: mockToggleFavorite,
      isFavorite: () => false,
    }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useParams: () => ({ listingId: 'listing-1' }),
  };
});

const listing = {
  id: 'listing-1',
  name: 'Milo',
  breed: 'Border Collie',
  city: 'Milano',
  region: 'Lombardia',
  ageLabel: '8 mesi',
  sex: 'Maschio' as const,
  color: 'Bianco e nero',
  organizationName: 'Allevamento Colle Verde',
  organizationType: 'Allevatore privato' as const,
  organizationVerified: true,
  organizationRating: 4.8,
  organizationReviewCount: 12,
  heroImage: 'https://example.com/dog-1.jpg',
  gallery: ['https://example.com/dog-1.jpg'],
  excerpt: 'Attivo e brillante',
  description: 'Scheda completa del cane.',
  tags: ['Vaccini'],
  traits: ['Agile'],
  phone: '+39 333 000 0001',
};

function renderPage() {
  return render(
    <MemoryRouter>
      <ListingDetailPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockShowToast.mockReset();
  mockToggleFavorite.mockReset();
  mockTrackListingContactClick.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ListingDetailPage', () => {
  it('shows a loading state before the listing is ready', () => {
    mockUseListing.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderPage();

    expect(screen.getByText('Stiamo caricando l annuncio')).toBeInTheDocument();
    expect(screen.queryByText('Annuncio non trovato')).not.toBeInTheDocument();
  });

  it('shows a not found state only after loading completes without data', () => {
    mockUseListing.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    renderPage();

    expect(screen.getByText('Annuncio non trovato')).toBeInTheDocument();
  });

  it('shares with clipboard fallback and shows a success toast', async () => {
    mockUseListing.mockReturnValue({
      data: listing,
      isLoading: false,
      isError: false,
    });

    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: 'http://localhost:5173/listings/listing-1',
      },
    });
    Object.assign(navigator, {
      share: undefined,
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Condividi' }));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'http://localhost:5173/listings/listing-1'
      );
    });
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Link pronto',
        tone: 'success',
      })
    );
  });
});
