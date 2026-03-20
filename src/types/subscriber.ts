import type { ProfessionalAccountType } from './auth';
import type { ListingSex } from './marketplace';

export type ListingWorkflowStatus = 'draft' | 'in_review' | 'published' | 'rejected' | 'removed';

export type ListingMetrics = {
  detailViews: number;
  listImpressions: number;
  contactClicks: number;
};

export type ManagedListing = {
  id: string;
  title: string;
  breed: string;
  city: string;
  region: string;
  ageLabel: string;
  sex: ListingSex;
  color: string;
  excerpt: string;
  description: string;
  tags: string[];
  traits: string[];
  images: string[];
  coverImage: string;
  status: ListingWorkflowStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  moderatedAt?: string;
  publishedAt?: string;
  rejectedAt?: string;
  moderatedBy?: string;
  adminNotes?: string;
  metrics?: ListingMetrics;
};

export type ManagedListingInput = Omit<
  ManagedListing,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'submittedAt'
  | 'moderatedAt'
  | 'publishedAt'
  | 'rejectedAt'
  | 'moderatedBy'
  | 'adminNotes'
  | 'metrics'
>;

export type ManagedListingOwner = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'breeder' | 'shelter' | 'admin';
  accountType?: ProfessionalAccountType;
  accountLabel: string;
  organizationName: string;
};

export type AdminManagedListing = ManagedListing & {
  owner: ManagedListingOwner;
  waitingDays?: number;
  completenessScore?: number;
};

export type AdminOverview = {
  stats: {
    totalListings: number;
    publishedListings: number;
    listingsInReview: number;
    rejectedListings: number;
    draftListings: number;
    totalProfessionalAccounts: number;
    breederAccounts: number;
    shelterAccounts: number;
    userAccounts: number;
    averageCompletenessScore: number;
    averageReviewHours: number | null;
    publicationRate: number;
    pendingReviewOldestDays: number;
    averageImagesPerListing: number;
  };
  moderationQueue: AdminManagedListing[];
  listings: AdminManagedListing[];
  recentActivity: Array<{
    id: string;
    title: string;
    status: ListingWorkflowStatus;
    updatedAt: string;
    ownerName: string;
    accountLabel: string;
  }>;
  topRegions: Array<{
    region: string;
    count: number;
  }>;
};
