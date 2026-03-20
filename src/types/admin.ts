import type { ManagedListing, ManagedListingOwner, ListingWorkflowStatus } from './subscriber';

export type AdminModerationAction = 'approve' | 'reject' | 'remove' | 'restore_review';

export type AdminManagedListing = ManagedListing & {
  owner: ManagedListingOwner;
  adminNotes?: string;
  waitingDays?: number;
  completenessScore?: number;
};

export type AdminOverviewStats = {
  totalListings: number;
  publishedListings: number;
  listingsInReview: number;
  rejectedListings: number;
  removedListings: number;
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

export type AdminOverviewPayload = {
  stats: AdminOverviewStats;
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
  credentials: {
    admin: DemoCredential;
    breeder: DemoCredential;
    shelter: DemoCredential;
  };
};

export type DemoCredential = {
  email: string;
  password: string;
};
