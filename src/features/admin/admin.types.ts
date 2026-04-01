import type { ListingWorkflowStatus, ManagedListing, ManagedListingOwner } from '../../types/subscriber';

export type AdminModerationAction = 'approve' | 'reject' | 'remove' | 'restore_review';

export type AdminOwner = ManagedListingOwner;

export type AdminManagedListing = ManagedListing & {
  moderationNotes?: string;
  owner: AdminOwner | null;
  waitingDays: number;
  completenessScore: number;
  mediaCount: number;
  moderationFlags: string[];
};

export type AdminHealthSummary = {
  ok: boolean;
  mapsConfigured: boolean;
  oldestPendingReviewDays: number;
  lowCompletenessListings: number;
  generatedAt: string;
};

export type AdminOverviewResponse = {
  generatedAt: string;
  health: AdminHealthSummary;
  kpis: {
    totalUsers: number;
    professionalAccounts: number;
    pendingApprovals: number;
    publishedListings: number;
    removedListings: number;
    totalDetailViews: number;
    totalListImpressions: number;
    totalContactClicks: number;
    averageDetailViews: number;
  };
  userCounts: {
    total: number;
    user: number;
    breeder: number;
    shelter: number;
    admin: number;
  };
  listingCounts: {
    total: number;
    draft: number;
    inReview: number;
    published: number;
    rejected: number;
    removed: number;
  };
  moderationQueue: AdminManagedListing[];
  topListings: AdminManagedListing[];
  latestActivity: Array<{
    id: string;
    listingTitle: string;
    ownerName: string;
    status: ListingWorkflowStatus;
    updatedAt: string;
    moderationNotes: string;
  }>;
};

export type AdminOverviewViewModel = {
  generatedAt: string;
  health: AdminHealthSummary;
  kpis: AdminOverviewResponse['kpis'];
  userCounts: AdminOverviewResponse['userCounts'];
  listingCounts: AdminOverviewResponse['listingCounts'];
  moderationQueue: AdminManagedListing[];
  topListings: AdminManagedListing[];
  latestActivity: AdminOverviewResponse['latestActivity'];
};
