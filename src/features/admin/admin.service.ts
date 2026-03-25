import { env } from '../../services/env';
import type {
  AdminManagedListing,
  AdminModerationAction,
  AdminOverviewPayload,
} from '../../types/admin';
import type { ListingWorkflowStatus, ManagedListingOwner } from '../../types/subscriber';

type ApiErrorBody = {
  message?: string;
};

type BackendManagedListing = {
  id: string;
  title: string;
  breed: string;
  city: string;
  region: string;
  ageLabel: string;
  sex: 'Maschio' | 'Femmina';
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
  approvedAt?: string;
  rejectedAt?: string;
  removedAt?: string;
  moderationNotes?: string;
  metrics?: {
    detailViews: number;
    listImpressions: number;
    contactClicks: number;
  };
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
    organizationName?: string;
    role: ManagedListingOwner['role'];
    roleLabel: string;
  } | null;
};

type BackendAdminOverviewResponse = {
  overview: {
    generatedAt: string;
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
    moderationQueue: BackendManagedListing[];
    topListings: BackendManagedListing[];
    latestActivity: Array<{
      id: string;
      listingTitle: string;
      ownerName: string;
      status: ListingWorkflowStatus;
      updatedAt: string;
      moderationNotes?: string;
    }>;
  };
  credentials: AdminOverviewPayload['credentials'];
};

type BackendAdminListingsResponse = {
  listings: BackendManagedListing[];
};

type BackendModerationResponse = {
  listing: BackendManagedListing;
};

function getAccountTypeFromRole(role: ManagedListingOwner['role']) {
  if (role === 'shelter') {
    return 'shelter_refuge';
  }

  if (role === 'breeder') {
    return 'private_breeder';
  }

  return undefined;
}

function calculateWaitingDays(date?: string) {
  if (!date) {
    return 0;
  }

  const diffMs = Date.now() - new Date(date).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function calculateCompletenessScore(listing: BackendManagedListing) {
  const checks = [
    listing.title,
    listing.breed,
    listing.city,
    listing.region,
    listing.ageLabel,
    listing.color,
    listing.excerpt,
    listing.description,
    listing.coverImage,
    listing.images.length > 0,
    listing.tags.length > 0,
    listing.traits.length > 0,
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

function mapOwner(owner: BackendManagedListing['owner']): ManagedListingOwner {
  if (!owner) {
    return {
      id: 'removed-owner',
      name: 'Profilo rimosso',
      email: '',
      phone: '',
      role: 'user',
      accountLabel: 'Profilo rimosso',
      organizationName: 'Profilo rimosso',
    };
  }

  return {
    id: owner.id,
    name: owner.name,
    email: owner.email,
    phone: owner.phone,
    role: owner.role,
    accountType: getAccountTypeFromRole(owner.role),
    accountLabel: owner.roleLabel,
    organizationName: owner.organizationName ?? owner.name,
  };
}

function mapAdminListing(listing: BackendManagedListing): AdminManagedListing {
  return {
    ...listing,
    owner: mapOwner(listing.owner),
    adminNotes: listing.moderationNotes,
    waitingDays: calculateWaitingDays(listing.submittedAt ?? listing.updatedAt),
    completenessScore: calculateCompletenessScore(listing),
  };
}

async function requestAdmin<T>(path: string, token: string, options: RequestInit = {}) {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new Error(body?.message ?? 'Richiesta admin fallita.');
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export async function fetchAdminOverview(token: string): Promise<AdminOverviewPayload> {
  const [overviewPayload, listingsPayload] = await Promise.all([
    requestAdmin<BackendAdminOverviewResponse>('/admin/overview', token),
    requestAdmin<BackendAdminListingsResponse>('/admin/listings', token),
  ]);

  const listings = listingsPayload.listings.map(mapAdminListing);
  const moderationQueue = overviewPayload.overview.moderationQueue.map(mapAdminListing);
  const listingsWithImages = listings.filter((listing) => listing.images.length > 0);
  const averageImagesPerListing =
    listingsWithImages.length > 0
      ? Math.round(
          listingsWithImages.reduce((sum, listing) => sum + listing.images.length, 0) /
            listingsWithImages.length
        )
      : 0;
  const averageCompletenessScore =
    listings.length > 0
      ? Math.round(
          listings.reduce((sum, listing) => sum + (listing.completenessScore ?? 0), 0) /
            listings.length
        )
      : 0;
  const pendingReviewOldestDays =
    moderationQueue.length > 0
      ? Math.max(...moderationQueue.map((listing) => listing.waitingDays ?? 0))
      : 0;
  const topRegions = Array.from(
    listings.reduce((regions, listing) => {
      const current = regions.get(listing.region) ?? 0;
      regions.set(listing.region, current + 1);
      return regions;
    }, new Map<string, number>())
  )
    .map(([region, count]) => ({ region, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);
  const listingLookup = new Map(listings.map((listing) => [listing.id, listing]));

  return {
    stats: {
      totalListings: overviewPayload.overview.listingCounts.total,
      publishedListings: overviewPayload.overview.listingCounts.published,
      listingsInReview: overviewPayload.overview.listingCounts.inReview,
      rejectedListings: overviewPayload.overview.listingCounts.rejected,
      removedListings: overviewPayload.overview.listingCounts.removed,
      draftListings: overviewPayload.overview.listingCounts.draft,
      totalProfessionalAccounts:
        overviewPayload.overview.userCounts.breeder + overviewPayload.overview.userCounts.shelter,
      breederAccounts: overviewPayload.overview.userCounts.breeder,
      shelterAccounts: overviewPayload.overview.userCounts.shelter,
      userAccounts: overviewPayload.overview.userCounts.user,
      averageCompletenessScore,
      averageReviewHours: null,
      publicationRate:
        overviewPayload.overview.listingCounts.total > 0
          ? Math.round(
              (overviewPayload.overview.listingCounts.published /
                overviewPayload.overview.listingCounts.total) *
                100
            )
          : 0,
      pendingReviewOldestDays,
      averageImagesPerListing,
    },
    moderationQueue,
    listings,
    recentActivity: overviewPayload.overview.latestActivity.map((activity) => ({
      id: activity.id,
      title: activity.listingTitle,
      status: activity.status,
      updatedAt: activity.updatedAt,
      ownerName: activity.ownerName,
      accountLabel: listingLookup.get(activity.id)?.owner.accountLabel ?? '',
    })),
    topRegions,
    credentials: overviewPayload.credentials,
  };
}

export async function moderateAdminListing(
  token: string,
  listingId: string,
  action: AdminModerationAction,
  notes?: string
) {
  const payload = await requestAdmin<BackendModerationResponse>(
    `/admin/listings/${listingId}/moderation`,
    token,
    {
      method: 'PATCH',
      body: JSON.stringify({
        action,
        notes,
      }),
    }
  );

  return mapAdminListing(payload.listing);
}
