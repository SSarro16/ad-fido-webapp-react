export type ListingSex = 'Maschio' | 'Femmina';
export type ListingOrganizationType = 'Allevatore privato' | 'Canile / Rifugio' | 'Associazione';
export type ListingOrganizationReview = {
  author: string;
  rating: number;
  text: string;
  relativeTime?: string;
  sourceUrl?: string;
};

export type Listing = {
  id: string;
  name: string;
  breed: string;
  city: string;
  region: string;
  ageLabel: string;
  sex: ListingSex;
  color: string;
  organizationName: string;
  organizationType: ListingOrganizationType;
  organizationVerified?: boolean;
  organizationRating: number;
  organizationReviewCount?: number;
  organizationReviewSourceLabel?: string;
  organizationAddress?: string;
  organizationCoordinates?: { lat: number; lng: number };
  organizationMapEmbedUrl?: string;
  organizationMapUrl?: string;
  organizationReviews?: ListingOrganizationReview[];
  heroImage: string;
  gallery: string[];
  excerpt: string;
  description: string;
  tags: string[];
  traits: string[];
  sponsorLabel?: string;
  phone: string;
};

export type Article = {
  id: string;
  title: string;
  source: string;
  category: string;
  readTime: string;
  image: string;
  excerpt?: string;
  url?: string;
  kind?: 'article' | 'video';
  ctaLabel?: string;
  highlights?: string[];
};

export type SearchPreset = {
  label: string;
  keyword: string;
  location: string;
};

export type HomePayload = {
  stats: Array<{ label: string; value: string; note?: string }>;
  frequentSearches: SearchPreset[];
  featuredListings: Listing[];
  editorial: Article[];
};

export type ListingFilters = {
  keyword: string;
  location: string;
  sex: 'all' | ListingSex;
  organizationType: 'all' | ListingOrganizationType;
};

export type ListingFeedItem =
  | { type: 'listing'; listing: Listing }
  | { type: 'sponsor'; sponsorId: string; title: string; body: string };
